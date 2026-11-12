// Lacrosse game simulator. Plays the game minute by minute from the teams'
// ratings: ATT (attack, stored as `off`), MID (midfield: faceoffs, draw
// controls and ground balls, `pit`) and DEF (defense and goalkeeping, `def`).
// College rules (NCAA, 2026):
// - four 15-minute quarters, men's and women's;
// - a game tied after 60 minutes goes to sudden-victory overtime (4-minute
//   periods for men, 3-minute periods for women, `settings.otMinutes`),
//   period after period until someone scores. There are no ties.
//
// The result keeps the field names the rest of the app uses for every game:
// homeLine / awayLine are goals per period (four quarters, then any
// overtimes), R is goals, H is shots, E is shots on goal and `innings` is the
// number of periods played. A simulation is only a suggestion — the
// commissioner reviews and saves it.

import { rng as makeRng } from './util.js?v=20261111210339';

export const OVR_WEIGHTS = { off: 0.4, pit: 0.3, def: 0.3 };
const ovrExact = t => t.off * OVR_WEIGHTS.off + t.pit * OVR_WEIGHTS.pit + t.def * OVR_WEIGHTS.def;
export function ovr(t) { return Math.round(ovrExact(t)); }

export const QUARTERS = 4;
export let OT = 4; // overtime minutes (men's 4, women's 3); set when a league loads
export const OT_PERIODS = 6; // the most overtimes a hand entry offers
export const REG_MINUTES = 60;
export function setOvertime(min) { OT = min === 3 ? 3 : 4; }
// Kept so the app shell reads like the other AAU apps.
export function setPeriods() {}

const GOALS = 11.5;      // goals per team per 60 minutes between equal teams
const SHOTS = 34;        // shots per team per 60 minutes between equal teams
const TALENT = 70;       // rating points per unit of log goal rate (lower = fewer upsets)
const HOME = 0.05;       // home field, on the log goal rate

// Goals a team expects per 60 minutes against this opponent.
function goalRate(att, opp, home, vol) {
  const x = ((att.off - opp.def) * 0.6 + (att.pit - opp.pit) * 0.4) / TALENT / vol + (home ? HOME / 2 : -HOME / 2);
  return GOALS * Math.exp(x);
}

// Every lacrosse game is played to a finish.
export const isKnockout = () => true;

// Play `minutes` minutes. With `golden`, stop at the first goal. Shots (H)
// and shots on goal (E) are counted as they happen.
function playPeriod(minutes, rate, shotRate, r, stats, golden) {
  const goals = { home: 0, away: 0 };
  // Several possessions a minute: split each minute in four.
  for (let m = 0; m < minutes * 4; m++) {
    for (const side of ['home', 'away']) {
      if (r() >= shotRate[side] / REG_MINUTES / 4) continue;
      stats[side].H++;
      const p = Math.min(0.9, rate[side] / shotRate[side]);
      // About 60% of shots are on goal; every goal is one.
      if (r() < p) { goals[side]++; stats[side].E++; } else if (r() < (0.6 - p) / (1 - p)) stats[side].E++;
      if (golden && goals.home !== goals.away) return goals; // sudden victory
    }
  }
  return goals;
}

export function simulateGame(homeTeam, awayTeam, game = {}, { seed, volatility = 1, otMinutes = OT } = {}) {
  const r = makeRng(seed);
  const neutral = !!game.neutral;
  const rate = { home: goalRate(homeTeam, awayTeam, !neutral, volatility), away: goalRate(awayTeam, homeTeam, false, volatility) };
  if (neutral) rate.away *= Math.exp(HOME / 2), rate.home *= Math.exp(-HOME / 2);
  // Better teams take more shots.
  const lean = side => Math.sqrt(rate[side] / GOALS);
  const shotRate = { home: SHOTS * lean('home'), away: SHOTS * lean('away') };
  const stats = { home: { H: 0, E: 0 }, away: { H: 0, E: 0 } };
  const homeLine = [], awayLine = [];
  for (let q = 0; q < QUARTERS; q++) {
    const g = playPeriod(15, rate, shotRate, r, stats, false);
    homeLine.push(g.home); awayLine.push(g.away);
  }
  const total = l => l.reduce((a, b) => a + b, 0);
  for (let ot = 0; total(homeLine) === total(awayLine); ot++) {
    const g = playPeriod(otMinutes, rate, shotRate, r, stats, true);
    if (ot >= 9 && g.home === g.away) g[r() < 0.5 ? 'home' : 'away'] = 1; // a guard: never ten overtimes
    homeLine.push(g.home); awayLine.push(g.away);
  }
  return {
    homeLine, awayLine,
    home: { R: total(homeLine), H: stats.home.H, E: stats.home.E },
    away: { R: total(awayLine), H: stats.away.H, E: stats.away.E },
    innings: homeLine.length, runRule: false, pk: null,
  };
}

// Shots and shots on goal for a score entered by hand, from the goals and
// both teams' ratings: about 34 shots a team in 60 minutes, more for the
// stronger team; never fewer shots on goal than goals, or shots than those.
export function estimateHitsErrors(homeTeam, awayTeam, game, homeLine, awayLine, { seed, otMinutes = OT } = {}) {
  const r = makeRng(seed ?? 1);
  const goals = l => l.reduce((a, b) => a + (Number(b) || 0), 0);
  const minutes = REG_MINUTES + Math.max(0, homeLine.length - QUARTERS) * otMinutes / 2;
  const one = (g, me, opp) => {
    const lean = Math.exp(((me.off - opp.def) * 0.6 + (me.pit - opp.pit) * 0.4) / TALENT / 2);
    const H = Math.max(g, Math.round((24 * lean + g * 0.9 + r() * 6 - 3) * minutes / REG_MINUTES));
    const E = Math.max(g, Math.min(H, Math.round(H * (0.58 + (r() - 0.5) * 0.12))));
    return { H, E };
  };
  return { home: one(goals(homeLine), homeTeam, awayTeam), away: one(goals(awayLine), awayTeam, homeTeam) };
}

// Home team's chance to win: the expected margin with a spread of about 4.5
// goals (a close fit to the simulator).
export function matchOdds(homeTeam, awayTeam, game = {}, { volatility = 1 } = {}) {
  const neutral = !!game.neutral;
  let lh = goalRate(homeTeam, awayTeam, !neutral, volatility), la = goalRate(awayTeam, homeTeam, false, volatility);
  if (neutral) la *= Math.exp(HOME / 2), lh *= Math.exp(-HOME / 2);
  const margin = lh - la;
  const sd = Math.sqrt(lh + la) * 1.05;
  const win = 1 / (1 + Math.exp(-1.7 * margin / sd));
  return { win, tie: 0, loss: 1 - win, margin };
}

export function winProbability(homeTeam, awayTeam, game = {}, opts = {}) {
  return matchOdds(homeTeam, awayTeam, game, opts).win;
}

// Slower check of the formula above by simulating the matchup.
export function simulatedWinRate(homeTeam, awayTeam, game = {}, opts = {}, n = 2000) {
  let wins = 0;
  for (let i = 0; i < n; i++) {
    const res = simulateGame(homeTeam, awayTeam, game, { ...opts, seed: i * 7919 + 1 });
    if (res.home.R > res.away.R) wins++;
  }
  return wins / n;
}
