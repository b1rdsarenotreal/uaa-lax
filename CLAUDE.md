# AAU Lacrosse

A college lacrosse dynasty set in 2030, women's and men's as two separate
dynasties behind a switch in the top bar: women's has the owner's 37 AAU
lacrosse programs and men's his 24, both in his conferences (the owner
asked to drop the made-up men's conferences; `ALIGNMENT` 2 moves unstarted
saves back). It started as a copy of AAU Basketball
(itself from AAU Field Hockey, AAU Soccer, AAU Volleyball and the owner's MCS
Dynasty) and keeps that engine and its features, adapted to lacrosse.

**It is not synced with MCS Dynasty, SACAA Dynasty or any other AAU app.**
Changes here aren't ported to those repos, and theirs aren't ported here,
unless the owner asks.

## Lacrosse adaptations to keep in mind

- Game fields keep the MCS names: `homeLine`/`awayLine` are goals per period
  (four quarters, then sudden-victory overtimes), `homeR`/`awayR` goals,
  `homeH`/`awayH` shots, `homeE`/`awayE` shots on goal. `g.pk` is never set.
  A record's `rs`/`ra` are goals for and against.
- **No ties:** overtime periods (`settings.otMinutes`: men's 4, women's 3)
  until someone scores; at most one goal in an overtime period, and only in
  the last one. `setOvertime` in `js/sim.js` sets the live `OT` on load.
- Ratings are stored as `off`, `pit`, `def` and shown as ATT, MID, DEF.
  OVR = 0.4/0.3/0.3.
- Conferences of 6 or fewer play everyone home and away (`confTarget`,
  `DOUBLE_ROUND_ROBIN_MAX`); bigger ones everyone once.
- Every league has `league.sport = 'lacrosse'` so AAU History can tell it
  from field hockey (both have four low-scoring quarters).
- Schedule (`js/schedule.js`): week 1 starts the last Monday in January
  (`dateOf`), opening weekend first; 13 weeks. Conference play (`confTarget`:
  double round robin for 6 or fewer, else single, at most `confMatches` 10)
  fills the last weeks, one weekend game a week plus midweek games when the
  rounds don't fit. Non-conference games mostly Saturday, some Tue/Wed, at
  most two a week, never back to back; cap `maxMatches` (men's 16, women's 17).
- Postseason stages keep the MCS internal names: `regionals` = regions,
  `supers`, `mcws` = the Final Four. Women's default 4 regions of 4 (16) at
  the higher seed's field in one week; men's 4 regions of 2 (8). Men's Final
  Four Saturday/Monday (`finalMonday`), women's Friday/Sunday. Automatic bids
  only for conferences of `aqMin` (4) or more; conference tournaments take
  the top 4. User-facing text never says NCAA or MCWS.
- Selection uses the Power Index (NPI): `npi` in `js/standings.js`, with
  each side's NCAA Division III dials in `settings.npi` (`NPI_BY_SIDE` in
  `js/league.js`), when `settings.index` is 'npi' (the default;
  `indexVersion` 1 switched older saves from the current or next season
  on). A level game counts as a tie in the NPI even if penalty kicks or a
  shootout decided it. The committee goes straight down the NPI: no tiers
  (`sheet.tiers` empty). `rating(season)` gives the season's index in the
  RPI's shape (value in `rpi`, plus `rank`, `sosRank`); use it, not
  `rpi()`, and `indexName(season)` for on-screen labels.
- The AAU look (Nov. 2026, ported from AAU Field Hockey, built to match the
  owner's mockups): a two-row top bar (brand row, then the menu); scoreboard
  cards (`gameCard`: the conference's color bar and logo, a row per team with
  each quarter and the final, the loser faded); standings with the conference
  list down the side (`st-*`), each conference in its colors (`confVars`,
  `confHead`; conference W-L, GB), All conferences compact, the last 5 (postseason
  included) opening the poll's game pop-up; the poll as a board (`pb-*`)
  beside movers, receiving votes and dropped out, under the No. 1 team's
  card; the team page header in the team's colors with title banners and a
  numbers strip (`teamHero`) and schedule boxes (`ts2-*`: one regular-season
  box, conference logo on conference games, a box per tournament, a venue
  column, the result opening the box score); Postseason → Full bracket
  (`renderBoard`). Navy `--board`, gold `--optic`; Oswald, Saira Condensed,
  Inter.
- On-screen text says "game".
- Women's and men's: `league.side` is 'women' or 'men', each with its own
  save key (`js/store.js`), team rows and coaches (`js/data.js`, edited
  directly) and default settings (`defaultSettings(side)`). Keep features
  shared; put differences in data or settings.
- Ratings come from the final 2026 USA Lacrosse Top 20 with the formula in
  `js/data.js`; coaches are the real 2026 head coaches.
- Regionals avoid first-round matchups between conference rivals
  (`avoidConferenceMatchups` in `js/postseason.js`, the owner's rule): after
  the serpentine, teams on one seed line trade regionals (lowest lines
  first), then, as a last resort, a team moves one seed line; the top line
  never moves. `pods(field, n, season)` applies it, so bracketology, the
  selection preview and the announced field agree. Bracketology and the
  preview show each regional's first-round matchups.

## Before every commit

- `python3 tools/stamp.py`
- `sh tools/check.sh`
- `node tests/logic.test.mjs`
- `python3 tests/ui_test.py` (Playwright; Chromium is preinstalled)
