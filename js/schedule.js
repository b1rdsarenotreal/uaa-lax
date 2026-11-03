// Regular-season schedule for college lacrosse, late January to late April
// (13 weeks by default; week 1 starts the last Monday in January, so the
// season opens the first weekend of February).
//
// - Conference play is everyone once, or home and away in a conference of 6
//   or fewer (the men's conferences, and the women's Pac-10, Metro, Big Ten
//   and UAA), at most `confMatches` (10). It fills the last weeks of the
//   season, one game a week on the conference's weekend day, with a midweek
//   game in some weeks when the rounds don't fit.
// - Non-conference games are mostly on Saturdays and Sundays, with some
//   Tuesday and Wednesday games, against nearby teams of a similar level
//   from other conferences, up to `maxMatches` (16 men's, 17 women's). At
//   most two games a week, never on back-to-back days.
// When `prev` (last season) is given, conference opponents who met once last
// year swap home and away.

import { isIndependent } from './standings.js?v=20261102233334';
import { cityPoint, miles } from './geo.js?v=20261102233334';
import { rng, shuffle, hashStr } from './util.js?v=20261102233334';

export const DEFAULT_REG_WEEKS = 13;
export const DEFAULT_TOURNEY_WEEKS = 0; // kept for older code paths
export const PER_WEEK = 2; // conference games a week at most (midweek and weekend)
export const DEFAULT_CONF_MATCHES = 10; // most conference games a team plays
export const DEFAULT_MAX_MATCHES = 17;  // most regular-season games (women's; men's 16)
export const MAX_CONF_WEEKS = 12;

// A conference this small plays a double round robin: everyone twice, once
// at home and once away.
export const DOUBLE_ROUND_ROBIN_MAX = 6;
export const confTarget = (n, max = DEFAULT_CONF_MATCHES) => (n < 2 ? 0 : Math.min(n <= DOUBLE_ROUND_ROBIN_MAX ? 2 * (n - 1) : n - 1, max));

// Kept for older code paths that read these.
export const MIDWEEK = {}; export const MIDWEEK_FREQ = {};

export const DAY_ORDER = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ---------- the calendar ----------

// Week 1 starts on the last Monday in January of the season's year (from
// January 26 to February 1), so its weekend is the first in February.
export function seasonStart(year) {
  const d = new Date(Date.UTC(year, 0, 26));
  return new Date(Date.UTC(year, 0, 26 + ((8 - d.getUTCDay()) % 7)));
}
// The calendar date of a week and day (a Date at UTC midnight).
export function dateOf(year, week, day) {
  const d = new Date(seasonStart(year));
  d.setUTCDate(d.getUTCDate() + (week - 1) * 7 + Math.max(0, DAYS.indexOf(day)));
  return d;
}
// The week and day of a date.
export function weekDayOf(year, month, date) {
  const n = Math.round((Date.UTC(year, month, date) - seasonStart(year).getTime()) / 864e5);
  return { week: Math.floor(n / 7) + 1, day: DAYS[((n % 7) + 7) % 7] };
}
// The weeks conference play may use: all but the first two.
export function confWeeksFor(regWeeks) { return Math.max(1, Math.min(MAX_CONF_WEEKS, regWeeks - 2)); }
export function confWeeksMax(regWeeks) { return confWeeksFor(regWeeks); }
const rrRounds = n => (n < 2 ? 0 : n % 2 ? n : n - 1);

export function blankGame(season, fields) {
  return {
    id: season.nextId++, type: 'regular', week: 1, day: 'Sat', order: DAY_ORDER.Sat,
    home: null, away: null, neutral: false, confGame: false, series: null, label: '',
    final: false, homeLine: [], awayLine: [], homeR: null, homeH: null, homeE: null, awayR: null, awayH: null, awayE: null,
    pitching: null, source: null, ...fields,
  };
}

// The two days a conference plays each week. Set per conference (Standings →
// Commissioner); the default is `settings.confDays`, Wednesday and Saturday.
// In a week with one conference game it's on the second (weekend) day.
export const CONF_WEEKENDS = [
  ['tus', 'Tuesday and Saturday'],
  ['ws', 'Wednesday and Saturday'],
  ['wsu', 'Wednesday and Sunday'],
  ['ts', 'Thursday and Saturday'],
  ['tsu', 'Thursday and Sunday'],
  ['fs', 'Friday and Saturday'],
  ['fsu', 'Friday and Sunday'],
];
const WEEKEND_DAYS = { tus: ['Tue', 'Sat'], ws: ['Wed', 'Sat'], wsu: ['Wed', 'Sun'], ts: ['Thu', 'Sat'], tsu: ['Thu', 'Sun'], fs: ['Fri', 'Sat'], fsu: ['Fri', 'Sun'] };
export function seriesDays(fmt) {
  return (WEEKEND_DAYS[fmt] || WEEKEND_DAYS.ws).map(day => ({ day, order: DAY_ORDER[day] }));
}
export const confDaysOf = (season, conf) => season.settings?.confWeekend?.[conf] || season.settings?.confDays || 'ws';
// Re-lay a conference's unplayed conference games after its days change.
export function applyConfWeekend(season, conf) {
  const days = seriesDays(confDaysOf(season, conf));
  let n = 0;
  for (const g of season.games) {
    if (g.type !== 'regular' || !g.confGame || g.final || season.teams[g.home]?.conference !== conf || g.slot == null) continue;
    Object.assign(g, days[g.slot]);
    n++;
  }
  return n;
}

// Count each team's conference games in a set of rounds.
export function confSeriesCounts(rounds, list) {
  const n = Object.fromEntries(list.map(t => [t, 0]));
  for (const pairs of rounds) for (const [a, b] of pairs) if (a && b) { n[a]++; n[b]++; }
  return n;
}

// Pick games to drop so every team ends with the same number: team t must
// lose `need[t]` games, each shared with another team that has games to
// lose. Small conferences, so a backtracking search is quick.
function pickDrops(edges, need, r) {
  const left = { ...need }, chosen = [], used = new Set();
  let steps = 0;
  const solve = () => {
    if (++steps > 20000) return false;
    const todo = Object.keys(left).filter(t => left[t] > 0);
    if (!todo.length) return true;
    const opts = t => edges.filter((e, i) => !used.has(i) && (e.a === t ? left[e.b] > 0 : e.b === t && left[e.a] > 0));
    const t = todo.reduce((x, y) => (opts(y).length - left[y] < opts(x).length - left[x] ? y : x));
    for (const e of shuffle(opts(t), r)) {
      const i = edges.indexOf(e);
      used.add(i); left[e.a]--; left[e.b]--; chosen.push(i);
      if (solve()) return true;
      used.delete(i); left[e.a]++; left[e.b]++; chosen.pop();
    }
    return false;
  };
  return solve() ? chosen : null;
}

// Home/away for single meetings so every team hosts half its conference
// games. Pairs that meet twice already have one home each. The rest are
// walked as closed trails (an Euler orientation: every visit to a team is one
// arrival and one departure, so hosts and visits balance). A team with an
// odd number of single meetings gets a dummy partner, so it ends at most one
// off. `prefer(a, b)` > 0 means a should host (last season's swap); each
// trail runs whichever way satisfies more of those.
function balanceHomes(edges, r, prefer) {
  const adj = new Map(), deg = new Map();
  const all = edges.map(e => ({ ...e }));
  for (const e of all) for (const t of [e.a, e.b]) deg.set(t, (deg.get(t) || 0) + 1);
  const odd = [...deg].filter(([, d]) => d % 2).map(([t]) => t);
  for (let i = 0; i + 1 < odd.length; i += 2) all.push({ a: odd[i], b: '\u0000', dummy: true }, { a: odd[i + 1], b: '\u0000', dummy: true });
  all.forEach((e, i) => { for (const t of [e.a, e.b]) { if (!adj.has(t)) adj.set(t, []); adj.get(t).push(i); } });
  for (const l of adj.values()) l.splice(0, l.length, ...shuffle(l, r));
  const used = new Set();
  for (const start of shuffle([...adj.keys()], r)) {
    while ((adj.get(start) || []).some(i => !used.has(i))) {
      const trail = [];
      let at = start;
      for (;;) {
        const i = adj.get(at).find(j => !used.has(j));
        if (i == null) break;
        used.add(i);
        const e = all[i], to = e.a === at ? e.b : e.a;
        trail.push({ e, host: at, visit: to });
        at = to;
      }
      const score = trail.reduce((s2, x) => s2 + (x.e.dummy || !prefer ? 0 : Math.sign(prefer(x.host, x.visit))), 0);
      for (const x of trail) [x.e.home, x.e.away] = score < 0 ? [x.visit, x.host] : [x.host, x.visit];
    }
  }
  return all.filter(e => !e.dummy);
}

// A conference's rounds for the season, at most `maxRounds`: a round robin,
// then a second one with home and away swapped, taken until every team has
// its number of conference matches (confTarget). Fail-safe: every member plays
// the same number, with an even home/away split. When the last rounds give
// some teams an extra game, extra second meetings are dropped (those teams
// get a non-conference game or an open date instead); if no clean set of
// drops exists, the round robin is redrawn and tried again.
export function confRounds(list, maxRounds, r, max = DEFAULT_CONF_MATCHES, prefer = null) {
  if (list.length < 2) return [];
  const T = confTarget(list.length, max);
  for (let attempt = 0; attempt < 40; attempt++) {
    const first = roundRobin(list, r);
    const all = [...first, ...first.map(pairs => pairs.map(([a, b]) => [b, a]))];
    const rounds = [], cnt = Object.fromEntries(list.map(t => [t, 0]));
    for (const pairs of all) {
      if (rounds.length >= maxRounds || list.every(t => cnt[t] >= T)) break;
      rounds.push(pairs);
      for (const [a, b] of pairs) if (a && b) { cnt[a]++; cnt[b]++; }
    }
    let k = Math.min(T, ...Object.values(cnt));
    if ((list.length * k) % 2) k--;
    const edges = rounds.flatMap((pairs, ri) => pairs.filter(([a, b]) => a && b).map(([a, b]) => ({ a, b, ri, second: ri >= first.length })));
    const need = Object.fromEntries(list.map(t => [t, cnt[t] - k]));
    let gone = new Set();
    if (Object.values(need).some(x => x > 0)) {
      const seconds = edges.filter(e => e.second);
      let drops = pickDrops(seconds, need, r);
      if (drops) drops = drops.map(i => seconds[i]);
      else { drops = pickDrops(edges, need, r); if (drops) drops = drops.map(i => edges[i]); }
      if (!drops) continue;
      gone = new Set(drops);
    }
    const kept = edges.filter(e => !gone.has(e));
    // Pairs meeting twice keep their swapped home and away; balance the rest.
    const meets = {};
    for (const e of kept) meets[key(e.a, e.b)] = (meets[key(e.a, e.b)] || 0) + 1;
    const singles = kept.filter(e => meets[key(e.a, e.b)] === 1);
    for (const e of balanceHomes(singles, r, prefer)) { const o = singles.find(x => x.a === e.a && x.b === e.b && x.ri === e.ri); o.home = e.home; o.away = e.away; }
    const out = rounds.map(() => []);
    for (const e of kept) out[e.ri].push(e.home ? [e.home, e.away] : [e.a, e.b]);
    while (out.length && !out[out.length - 1].length) out.pop();
    return out;
  }
  throw new Error(`Couldn't give every team in a ${list.length}-team conference the same number of conference games.`);
}

// Circle-method round robin. Returns rounds of [a, b] pairs (null = bye).
export function roundRobin(teams, r) {
  const list = shuffle(teams, r);
  if (list.length % 2) list.push(null);
  const n = list.length, rounds = [];
  for (let k = 0; k < n - 1; k++) {
    const pairs = [];
    for (let i = 0; i < n / 2; i++) {
      const a = list[i], b = list[n - 1 - i];
      pairs.push(k % 2 ? [b, a] : [a, b]);
    }
    rounds.push(pairs);
    list.splice(1, 0, list.pop());
  }
  return rounds;
}

const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
// Conference rivals; independents are nobody's rivals.
const rival = (teams, a, b) => teams[a].conference === teams[b].conference && !isIndependent(teams[a].conference);

// Pair teams across conferences, avoiding repeat opponents when possible.
function crossPairs(pool, teams, met, r) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const left = shuffle(pool, r), pairs = [];
    let ok = true;
    while (left.length > 1) {
      const a = left.shift();
      let j = left.findIndex(b => !rival(teams, a, b) && !met.has(key(a, b)));
      if (j < 0) j = left.findIndex(b => !rival(teams, a, b));
      if (j < 0) { ok = false; break; }
      pairs.push([a, left.splice(j, 1)[0]]);
    }
    if (ok) return { pairs, idle: left };
  }
  return { pairs: [], idle: [...pool] };
}

// Pair teams across conferences for non-conference games: each team (in
// random order) takes the free opponent with the lowest cost, which is the
// distance between their homes, the gap in their ratings and some
// randomness, with a big penalty for a repeat opponent. `dist` is in miles.
function nearCross(pool, teams, met, r, dist) {
  const lvl = t => (teams[t].off ?? 65) * 0.4 + (teams[t].pit ?? 65) * 0.3 + (teams[t].def ?? 65) * 0.3;
  const left = shuffle(pool, r), pairs = [];
  while (left.length > 1) {
    const a = left.shift();
    let best = -1, bs = Infinity;
    left.forEach((b, j) => {
      if (rival(teams, a, b)) return;
      // Teams of a similar level, too: a Division I power rarely plays a
      // Division III school (about 40 miles a rating point).
      const c = dist(a, b) + r() * 700 + Math.abs(lvl(a) - lvl(b)) * 30 + (met.has(key(a, b)) ? 4000 : 0);
      if (c < bs) { bs = c; best = j; }
    });
    if (best >= 0) pairs.push([a, left.splice(best, 1)[0]]);
  }
  return pairs;
}

// Event sizes for n teams in `events` events, as even as possible.
export function eventSizes(n, events = Math.floor(n / 4)) {
  if (n < 3 || events < 1) return [];
  const base = Math.floor(n / events), extra = n % events;
  return Array.from({ length: events }, (_, i) => base + (i < extra ? 1 : 0));
}


const lvl = t => (t.off ?? 65) * 0.4 + (t.pit ?? 65) * 0.3 + (t.def ?? 65) * 0.3;

export function generateSchedule(season, seed = hashStr(String(season.year)), prev = null) {
  const r = rng(seed);
  const teams = season.teams;
  const names = Object.keys(teams);
  const st = season.settings || {};
  const homeCount = Object.fromEntries(names.map(n => [n, 0]));
  const met = new Set();
  const games = [];
  const REG = Math.max(6, st.regWeeks ?? DEFAULT_REG_WEEKS);
  season.regWeeks = REG;
  const cap = st.maxMatches ?? DEFAULT_MAX_MATCHES;
  const busy = Object.fromEntries(names.map(n => [n, new Set()]));
  const abs = (week, day) => week * 7 + DAY_ORDER[day];
  const free = (t, a, rest = 1) => { for (let k = -rest; k <= rest; k++) if (busy[t].has(a + k)) return false; return true; };

  const hosts = new Map();
  for (const g of prev?.games || []) if (g.type === 'regular' && g.confGame) { const k = key(g.home, g.away); hosts.set(k, hosts.has(k) ? 'both' : g.home); }
  const orient = (a, b) => {
    if (homeCount[a] > homeCount[b]) return [b, a];
    if (homeCount[a] < homeCount[b]) return [a, b];
    return r() < 0.5 ? [a, b] : [b, a];
  };
  const add = (week, day, home, away, extra = {}) => {
    games.push(blankGame(season, { week, day, order: DAY_ORDER[day], home, away, ...extra }));
    if (!extra.neutral) homeCount[home]++;
    met.add(key(home, away));
    busy[home].add(abs(week, day)); busy[away].add(abs(week, day));
  };

  // ---- conference play: the last weeks, one game a week (weekend), a
  // midweek game too when the rounds don't fit ----
  const byConf = {};
  for (const n of names) if (!isIndependent(teams[n].conference)) (byConf[teams[n].conference] ||= []).push(n);
  const W = confWeeksFor(REG);
  const confGames = Object.fromEntries(names.map(n => [n, 0]));
  for (const [conf, list] of Object.entries(byConf).sort((a, b) => a[0].localeCompare(b[0]))) {
    if (list.length < 2) continue;
    const prefer = (a, b) => { const h = hosts.get(key(a, b)); return !h || h === 'both' ? 0 : h === a ? -1 : 1; };
    const rounds = confRounds(list, W * PER_WEEK, r, st.confMatches ?? DEFAULT_CONF_MATCHES, prefer);
    while (rounds.length && !rounds[rounds.length - 1].length) rounds.pop();
    const R = rounds.length;
    // Weeks counted back from the last: each takes a weekend round; the
    // rounds left over go midweek, spread over those weeks.
    const weeks = Math.min(W, R), extra = R - weeks;
    const first = REG - weeks + 1;
    const doubles = new Set(Array.from({ length: extra }, (_, k) => first + Math.floor(((k + 0.5) * weeks) / Math.max(1, extra))));
    const slots = [];
    for (let w = first; w <= REG; w++) { if (doubles.has(w)) slots.push([w, 0]); slots.push([w, 1]); }
    const days = seriesDays(confDaysOf(season, conf));
    rounds.forEach((pairs, i) => {
      const [week, slot] = slots[i];
      for (const [a, b] of pairs) if (a && b) { add(week, days[slot].day, a, b, { confGame: true, slot }); confGames[a]++; confGames[b]++; }
    });
  }

  const pts = Object.fromEntries(names.map(n => [n, cityPoint(teams[n].city)]));
  const dist = (a, b) => (pts[a] && pts[b] ? miles(pts[a], pts[b]) : 900);

  // ---- non-conference games: each team's games left under the cap, spread
  // over the weeks (fewer in conference weeks), mostly weekends ----
  const need = {};
  for (const t of names) {
    const budget = Math.max(0, cap - confGames[t]);
    const weeks = [];
    for (let w = 1; w <= REG; w++) {
      const busyDays = [...busy[t]].filter(a => Math.floor(a / 7) === w).length;
      const wt = (w <= 2 ? 1.6 : 1.2) - busyDays * 0.8;
      if (wt > 0.2) weeks.push([w, wt]);
    }
    const tot = weeks.reduce((s2, [, x]) => s2 + x, 0) || 1;
    const share = weeks.map(([w, x]) => [w, (budget * x) / tot]);
    const n = Object.fromEntries(share.map(([w, x]) => [w, Math.floor(x)]));
    let rest = budget - Object.values(n).reduce((a, b) => a + b, 0);
    for (const [w] of share.map(([w, x]) => [w, x - Math.floor(x) + r() * 0.3]).sort((a, b) => b[1] - a[1])) { if (rest <= 0) break; n[w]++; rest--; }
    need[t] = n;
  }
  const DAY_WEIGHT = { Mon: 0.15, Tue: 0.7, Wed: 0.8, Thu: 0.25, Fri: 0.45, Sat: 1.6, Sun: 1 };
  const weekGames = (t, w) => [...busy[t]].filter(a => Math.floor(a / 7) === w).length;
  const carry = Object.fromEntries(names.map(n => [n, 0]));
  for (let week = 1; week <= REG; week++) {
    const want = Object.fromEntries(names.map(t => [t, Math.min(2 - weekGames(t, week), (need[t][week] || 0) + carry[t])]));
    for (let d = 0; d < 7; d++) {
      const day = DAYS[d], a0 = abs(week, day);
      if (week === 1 && d < 5) continue; // the season opens on the first weekend of February
      const pool = names.filter(t => {
        if (want[t] <= 0 || !free(t, a0)) return false;
        let open = 0;
        for (let e = d; e < 7; e++) if (free(t, abs(week, DAYS[e])) && !(week === 1 && e < 5)) open++;
        const p = open <= want[t] * 2 - 1 ? 1 : Math.min(1, (want[t] / Math.max(1, open / 2)) * DAY_WEIGHT[day] * 0.8);
        return r() < p;
      });
      for (const [a, b] of nearCross(pool, teams, met, r, dist)) {
        const [h, aw] = orient(a, b);
        add(week, day, h, aw);
        want[a]--; want[b]--;
      }
    }
    for (const t of names) carry[t] = Math.max(0, want[t]);
  }
  games.sort((a, b) => a.week - b.week || a.order - b.order);
  return games;
}
