// Logic tests: run with `node tests/logic.test.mjs`
import assert from 'node:assert/strict';
import { ALIGNMENT, newLeague, currentSeason, simGames, startNextSeason, beginOffseason, draftWarnings, clearResult, estimateHE, migrateLeague, addConference, rebuildSchedule, weekName, defaultSettings } from '../js/league.js';
import { simulateGame, winProbability, simulatedWinRate, matchOdds, ovr } from '../js/sim.js';
import { confRounds, confSeriesCounts, confTarget, DEFAULT_REG_WEEKS, DEFAULT_MAX_MATCHES, dateOf } from '../js/schedule.js';
import { isFinal, isTie, winnerOf, resultFor } from '../js/standings.js';
import { gameVenue, postseasonFinish, postseasonRecord, wsTeams, ncaaProblems, fieldSize, DEFAULT_NCAA, postWeeks, aqConferences, autoBids } from '../js/postseason.js';
import { recordBook } from '../js/records.js';
import { readAauLogos, applyAauLogos } from '../js/logo-import.js';
import { seedTeams, splitOvr, COACHES, MEN_COACHES, CONFERENCES, SIDES } from '../js/data.js';
import { existsSync } from 'node:fs';
import { rng } from '../js/util.js';

const t0 = Date.now();
let n = 0;
const check = (name, fn) => {
  try { fn(); } catch (e) { console.error(`✗ ${name}`); throw e; }
  n++;
};
const reg = s => s.games.filter(g => g.type === 'regular');
const count = (games, pick = () => true) => { const c = {}; for (const g of games) for (const t of [g.home, g.away]) if (pick(g, t)) c[t] = (c[t] || 0) + 1; return c; };
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const absDay = g => g.week * 7 + DAYS.indexOf(g.day);

check("the AAU lacrosse programs in the commissioner's conferences", () => {
  assert.deepEqual(Object.keys(SIDES), ['women', 'men']);
  const W = seedTeams('women'), M = seedTeams('men');
  assert.equal(Object.keys(W).length, 37); assert.equal(Object.keys(M).length, 24);
  const sizes = T => { const z = {}; for (const t of Object.values(T)) z[t.conference] = (z[t.conference] || 0) + 1; return z; };
  assert.deepEqual(sizes(W), { 'Big Ten': 4, 'Coastal Atlantic Conference': 7, 'Ivy League': 8, 'Metro Conference': 6, 'Pacific-10 Conference': 6, 'Southwest Conference': 1, 'UC Athletic Association': 1, 'University Athletic Association': 4 });
  assert.deepEqual(sizes(M), { 'Big Ten': 3, 'Coastal Atlantic Conference': 5, 'Ivy League': 7, 'Metro Conference': 4, 'Pacific-10 Conference': 1, 'University Athletic Association': 4 });
  assert.equal(M['Johns Hopkins'].conference, 'University Athletic Association');
  assert.ok(!CONFERENCES['Atlantic Lacrosse League'] && !CONFERENCES['Midlands Lacrosse League'], 'no made-up conferences');
  for (const T of [W, M]) {
    assert.ok(Object.values(T).every(t => t.stadium && t.city && t.color && t.mascot), 'fields, cities, colors, mascots');
    for (const t of Object.values(T)) assert.ok(Math.abs(ovr(t) - (t.off * 0.4 + t.pit * 0.3 + t.def * 0.3)) < 1);
  }
  assert.equal(M.Princeton.coach, 'Matt Madalon'); assert.equal(W.Northwestern.coach, 'Kelly Amonte Hiller');
  assert.equal(M.Maryland.stadium, 'SECU Stadium');
  assert.ok(ovr(M.Princeton) >= 90 && ovr(W.Northwestern) >= 90, 'the 2026 national champions lead');
  assert.ok(ovr(M.Princeton) > ovr(M.MIT) + 35);
  assert.equal(new Set(Object.values(MEN_COACHES)).size, Object.keys(MEN_COACHES).length);
  assert.equal(new Set(Object.values(COACHES)).size, Object.keys(COACHES).length);
  for (const c of Object.keys(CONFERENCES)) if (CONFERENCES[c].logo) assert.ok((/^https:\/\//.test(CONFERENCES[c].logo) || existsSync(new URL(`../${CONFERENCES[c].logo}`, import.meta.url))), `${c} logo`);
  const s = splitOvr('Duke', 80);
  assert.ok(Math.abs(0.4 * s.off + 0.3 * s.pit + 0.3 * s.def - 80) <= 0.5);
  assert.equal(newLeague({ side: 'men' }).sport, 'lacrosse');
});

check('games: four quarters, sudden-victory overtime, never a tie', () => {
  for (const otMinutes of [4, 3]) {
    const T = seedTeams(otMinutes === 4 ? 'men' : 'women'), A = T.Yale, B = T.Cornell;
    let ots = 0, goals = 0, shots = 0, sog = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      const r = simulateGame(A, B, { type: 'regular' }, { seed: i + 1, otMinutes });
      assert.ok(r.homeLine.length >= 4);
      assert.equal(r.home.R, r.homeLine.reduce((a, b) => a + b, 0));
      assert.notEqual(r.home.R, r.away.R, 'no ties');
      assert.ok(r.home.H >= r.home.E && r.home.E >= r.home.R, 'shots ≥ shots on goal ≥ goals');
      if (r.homeLine.length > 4) {
        ots++;
        const last = r.homeLine.length - 1;
        assert.equal(r.homeLine[last] + r.awayLine[last], 1, 'one goal ends it');
        for (let k = 4; k < last; k++) assert.equal(r.homeLine[k] + r.awayLine[k], 0);
      }
      goals += r.home.R + r.away.R; shots += r.home.H + r.away.H; sog += r.home.E + r.away.E;
    }
    console.log(`  ${otMinutes}-minute OT: ${(goals / N / 2).toFixed(1)} goals, ${(shots / N / 2).toFixed(1)} shots, ${(sog / N / 2).toFixed(1)} on goal per team, ${(100 * ots / N).toFixed(1)}% overtime`);
    assert.ok(goals / N / 2 > 9 && goals / N / 2 < 14);
    assert.ok(ots > 0 && ots / N < 0.15);
  }
  const T = seedTeams('men');
  assert.ok(matchOdds(T.Princeton, T.MIT, {}).win > 0.97);
  const est = winProbability(T.Cornell, T.Harvard, {}), simd = simulatedWinRate(T.Cornell, T.Harvard, {}, {}, 1500);
  assert.ok(Math.abs(est - simd) < 0.06, `win chance ${est.toFixed(2)} vs simulated ${simd.toFixed(2)}`);
  const g = { type: 'regular', home: 'A', away: 'B', homeR: 9, awayR: 10, final: true, homeLine: [2, 3, 2, 2, 0], awayLine: [3, 2, 2, 2, 1] };
  assert.equal(winnerOf(g), 'B'); assert.equal(resultFor(g, 'A'), 'L'); assert.ok(!isTie(g));
  const L = newLeague(), s = currentSeason(L), x = reg(s)[0];
  const e = estimateHE(s, x, [3, 2, 4, 1], [1, 2, 0, 3]);
  assert.ok(e.home.H >= e.home.E && e.home.E >= 10);
});

for (const side of ['women', 'men']) check(`${side}'s schedule: weekends and midweek, conference play at the end`, () => {
  const L = newLeague({ side }), s = currentSeason(L), g = reg(s);
  assert.equal(s.regWeeks, DEFAULT_REG_WEEKS);
  assert.equal(dateOf(s.year, 1, 'Sat').toISOString().slice(0, 10), '2031-02-01', 'the first Saturday in February of the spring (the 2030 season is 2030–31)');
  assert.ok(g.every(x => x.week > 1 || ['Sat', 'Sun'].includes(x.day)), 'opening weekend first');
  const seen = new Set();
  for (const x of g) for (const t of [x.home, x.away]) { const k = `${t}|${absDay(x)}`; assert.ok(!seen.has(k), k); seen.add(k); }
  const byTeam = {};
  for (const x of g) for (const t of [x.home, x.away]) (byTeam[t] ||= []).push(x);
  for (const [t, list] of Object.entries(byTeam)) {
    list.sort((a, b) => absDay(a) - absDay(b));
    for (let i = 1; i < list.length; i++) assert.ok(absDay(list[i]) - absDay(list[i - 1]) > 1, `${t}: back to back`);
    const perWeek = {}; for (const x of list) perWeek[x.week] = (perWeek[x.week] || 0) + 1;
    assert.ok(Math.max(...Object.values(perWeek)) <= 2, `${t}: at most two games a week`);
  }
  const satShare = g.filter(x => x.day === 'Sat').length / g.length;
  assert.ok(satShare > 0.45, 'mostly Saturdays');
  const cap = side === 'men' ? 16 : 17, totals = Object.values(count(g));
  console.log(`  ${side}: ${Math.min(...totals)}–${Math.max(...totals)} games per team, ${Math.round(100 * satShare)}% on Saturday`);
  assert.equal(s.settings.maxMatches ?? DEFAULT_MAX_MATCHES, cap);
  assert.ok(Math.min(...totals) >= cap - 3 && Math.max(...totals) <= cap);
  const sizes = {};
  for (const t of Object.values(s.teams)) sizes[t.conference] = (sizes[t.conference] || 0) + 1;
  const conf = count(g.filter(x => x.confGame));
  for (const t of Object.values(s.teams)) assert.equal(conf[t.school] || 0, confTarget(sizes[t.conference]), t.school);
  const meets = {};
  for (const x of g.filter(x => x.confGame)) (meets[[x.home, x.away].sort().join('|')] ||= []).push(x.home);
  for (const [k, homes] of Object.entries(meets)) {
    if (sizes[s.teams[k.split('|')[0]].conference] <= 6) assert.ok(homes.length === 2 && homes[0] !== homes[1], `${k}: home and away`);
    else assert.equal(homes.length, 1);
  }
  for (const x of g.filter(x => x.confGame)) assert.ok(['Wed', 'Sat'].includes(x.day));
  if (side === 'men') {
    assert.equal(conf.Princeton, 6, 'the 7-team Ivy plays everyone once');
    assert.equal(conf.Duke, 8, 'the 5-team Coastal Atlantic plays everyone twice');
    assert.equal(conf.Michigan, 4, 'the 3-team Big Ten plays everyone twice');
    assert.ok(!conf.Utah, 'Utah has no conference games');
  }
  assert.ok(g.every(x => x.confGame || s.teams[x.home].conference !== s.teams[x.away].conference));
});

check('conference schedules are fair at every size', () => {
  const r = rng(7);
  for (let k = 2; k <= 13; k++) {
    const list = Array.from({ length: k }, (_, i) => `T${i}`);
    const c = confSeriesCounts(confRounds(list, 22, r), list);
    assert.equal(new Set(Object.values(c)).size, 1, `${k} teams`);
  }
  assert.equal(confTarget(6), 10); assert.equal(confTarget(4), 6); assert.equal(confTarget(8), 7); assert.equal(confTarget(7), 6);
});

check('automatic bids for conferences of 4 or more; formats; week names', () => {
  const L = newLeague(), s = currentSeason(L);
  assert.equal(aqConferences(s).length, 6, 'not the one-team Southwest and UC conferences');
  assert.equal(fieldSize(DEFAULT_NCAA), 16);
  assert.equal(fieldSize(defaultSettings('men').ncaa), 8);
  assert.deepEqual(ncaaProblems(DEFAULT_NCAA, 37), []);
  assert.deepEqual(postWeeks(s), { conf: 14, regional: 15, mcws: 16 });
  assert.equal(weekName(15, s), 'National Tournament');
  assert.equal(weekName(16, s), 'Final Four');
  const g = reg(s).find(x => !x.neutral);
  assert.equal(gameVenue(s, g).stadium, s.teams[g.home].stadium);
  assert.equal(defaultSettings('men').otMinutes, 4);
  assert.equal(defaultSettings('women').otMinutes, 3);
});

const leagues = {};
for (const side of ['women', 'men']) {
  const league = newLeague({ side });
  const s = currentSeason(league);
  simGames(s, undefined, { autoLock: true, max: 9000 });
  leagues[side] = league;
  check(`${side}'s season: conference tournaments, the national tournament on campus, the Final Four`, () => {
    assert.equal(s.phase, 'complete');
    const R = reg(s);
    assert.ok(R.every(isFinal) && !R.some(isTie), 'no ties');
    assert.ok(R.some(g => g.homeLine.length > 4), 'some games go to overtime');
    for (const ev of Object.values(s.post.confT)) {
      assert.equal(ev.size, 4);
      assert.deepEqual([...new Set(s.games.filter(g => g.event === ev.id).map(g => g.day))].sort(), ['Fri', 'Sun']);
    }
    assert.equal(Object.keys(s.post.confT).length, side === 'men' ? 4 : 6, 'conferences of 4 or more');
    const auto = Object.values(autoBids(s));
    assert.ok(auto.every(t => s.post.field.some(f => f.team === t)));
    const size = side === 'men' ? 8 : 16;
    assert.equal(s.post.field.length, size);
    for (const ev of s.post.regionals) {
      const gs = s.games.filter(g => g.event === ev.id);
      assert.equal(gs.length, size / 4 - 1);
      for (const g of gs) assert.ok(!g.neutral && ev.seeds.indexOf(g.home) < ev.seeds.indexOf(g.away), 'the higher seed hosts');
    }
    const ff = s.games.filter(g => g.type === 'mcws');
    assert.equal(ff.length, 3);
    assert.ok(ff.every(g => g.neutral && gameVenue(s, g).stadium === s.settings.mcwsVenue));
    assert.deepEqual(ff.map(g => g.day).sort(), side === 'men' ? ['Mon', 'Sat', 'Sat'] : ['Fri', 'Fri', 'Sun']);
    assert.equal(postseasonFinish(s, s.post.champion), 'National champion');
    assert.equal(wsTeams(s).length, 4);
    assert.equal(postseasonRecord(s, s.post.champion).ncaa.w, side === 'men' ? 3 : 4);
    assert.ok(s.polls.final);
  });
}

check('clearing a result', () => {
  const s = currentSeason(leagues.women);
  const copy = { ...s.games.find(isFinal) };
  clearResult(copy);
  assert.ok(!copy.final && copy.homeR == null);
});

check('logos from the AAU Dynasty', () => {
  const L = newLeague();
  const backup = { schools: [{ id: 'x', name: 'Duke University', short: 'Duke', logo: 'data:image/png;base64,AAAA' }], conferences: { c1: { name: 'Ivy League', logo: 'https://e.com/ivy.png' } } };
  const got = applyAauLogos(L, readAauLogos(backup));
  assert.deepEqual(got, { teams: ['Duke'], conferences: ['Ivy League'] });
  assert.throws(() => readAauLogos({ seasons: {} }));
});

check('an unstarted saved dynasty picks up the commissioner\'s conferences', () => {
  const L = newLeague(), s0 = currentSeason(L);
  delete L.alignment;
  s0.teams.Stanford.conference = 'Big Ten';
  migrateLeague(L);
  assert.equal(L.alignment, ALIGNMENT);
  assert.equal(s0.teams.Stanford.conference, 'Pacific-10 Conference');
  // A men's dynasty saved with the old made-up conferences goes back to the commissioner's.
  const M = newLeague({ side: 'men' }), m0 = currentSeason(M);
  M.alignment = 'aau-lacrosse-2030-1';
  M.conferences['Atlantic Lacrosse League'] = { abbr: 'ALL', color: '#1B4F72' };
  for (const t of ['Duke', 'North Carolina', 'Virginia', 'Maryland', 'Johns Hopkins', 'Notre Dame']) m0.teams[t].conference = 'Atlantic Lacrosse League';
  migrateLeague(M);
  assert.equal(m0.teams['Johns Hopkins'].conference, 'University Athletic Association');
  assert.equal(m0.teams.Duke.conference, 'Coastal Atlantic Conference');
  assert.ok(!M.conferences['Atlantic Lacrosse League'], 'the made-up conference is gone');
});

check('record book', () => {
  const B = recordBook(leagues.men);
  assert.ok(B.games.length > 150);
  assert.ok(B.programs.some(x => x.titles === 1));
});

check('offseason and the next season', () => {
  const league = leagues.men, prev = currentSeason(league);
  beginOffseason(league);
  assert.ok(Array.isArray(draftWarnings(league)));
  addConference(league, 'West Coast', { abbr: 'WC', color: '#123456' });
  for (const t of ['Utah', 'Ohio State', 'Penn State']) league.draft.teams[t].conference = 'West Coast';
  const s2 = startNextSeason(league);
  assert.equal(s2.year, 2031);
  assert.equal(s2.settings.otMinutes, 4);
  const conf = count(reg(s2).filter(g => g.confGame && s2.teams[g.home].conference === 'West Coast'));
  assert.deepEqual(Object.values(conf), [4, 4, 4], 'a 3-team conference plays everyone twice');
  rebuildSchedule(s2, prev);
  assert.ok(reg(s2).length > 150);
});

check('a saved league loads again', () => {
  const copy = JSON.parse(JSON.stringify(leagues.men));
  delete copy.sport;
  migrateLeague(copy);
  assert.equal(copy.currentYear, 2031);
  assert.equal(copy.sport, 'lacrosse');
});

console.log(`${n} checks ok in ${Date.now() - t0} ms`);
