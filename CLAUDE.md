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
- Non-conference dates are mixed (`mixNonConfDates`, the owner's ask,
  Nov. 2026): games are placed week by week, pairing similar teams, so a
  top team's best opponents would come in a row; random date swaps between
  non-conference games (none twice a day or back to back, at most two games
  a week) spread them out.
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
- Conference home and away (`js/homeaway.js`, the owner's rule, Nov. 2026):
  no team plays more than two conference weekends in a row away (`MAX_AWAY`)
  or three at home (`MAX_HOME`); a week without a conference game ends a
  run. `generateSchedule` draws the season (`drawSchedule`), then
  `spreadConfHomes` trades hosts between a pair's two meetings, turns around
  triangles of single meetings or a single meeting (every team within one
  game or series of half), and trades two conference weeks when every team
  plays on the same days in both. A pair meeting twice keeps one at each
  school. A once-a-year pair swaps hosts from last year unless the rule
  needs otherwise.
- Regionals avoid first-round matchups between conference rivals
  (`avoidConferenceMatchups` in `js/postseason.js`, the owner's rule): after
  the serpentine, teams on one seed line trade regionals (lowest lines
  first), then, as a last resort, a team moves one seed line; the top line
  never moves. `pods(field, n, season)` applies it, so bracketology, the
  selection preview and the announced field agree. Bracketology and the
  preview show each regional's first-round matchups.
- The Greater South Conference (the owner's, coming in; Kansas, Missouri,
  Tulane, UAB, Vanderbilt, Iowa State, Saint Louis, Memphis) has its logo
  ready (`gsc.svg`, the owner's pick: slanted GSC, striped S, compass in the
  G; Saira Black): it's in the Add conference pick (`AAU_CONFERENCES`), and
  a Greater South made by hand gets it on load (`migrateLeague`).
- The Horizon Valley Conference (the owner's, coming in; Loyola Chicago, UIC,
  IU Indianapolis, UMKC, Missouri S&T, Cincinnati, Dayton, West Virginia,
  Ohio, Southern Illinois) has its logo ready the same way (`hvc.svg`, the
  owner's pick: slanted HVC in Archivo Expanded Black with white, orange and
  plum outlines, a striped orange sun rising behind).
- The Western Athletic Conference is coming back (the owner's; Northern
  Arizona, San Diego State, Nevada, UNLV, Oregon State, BYU, Utah State,
  Washington State) with the owner's pick for its logo, the 1992–2010 WAC
  logo linked from the web (`CONF_LOGO_LINKS.wac`), ready the same way.
- The Rocky West Conference (the owner's, coming in; Colorado State, Denver,
  Colorado School of Mines, Montana, Montana State, North Dakota, North
  Dakota State, New Mexico, New Mexico State, UTEP, UTSA) and the Colonial 10
  (Northeastern, UMass, Lehigh, Temple, Rhode Island, East Carolina,
  Charlotte, George Mason, VCU) have their logos ready the same way, the
  owner's picks (Nov. 2026): `rwc.svg`, RWC slanted in Saira Black, forest
  green, before a snow-capped range and a gold sun; `c10.svg`, a block C in
  red and white stripes and a navy 10 in Bungee, a red star over the 1.
  The three conferences' thirty schools, and Boston College (suggested for
  the Metro), are in the Add team pick
  (`AAU_SCHOOLS`, `crop: 4`: ESPN logos, `AAU_PROGRAMS` venues for the
  sports each plays, coaches added by hand), not in the starting league.
- Realignment from AAU Dynasty (`js/realign.js`, Nov. 2026): the hub's
  Realignment page leaves a plan in IndexedDB `aau-realignment` (read
  when the app loads or comes back into view, never created here); the
  Offseason page shows it (`realignBanner`) with a review where each move,
  join and leave can be unticked (`realignModal`). Only teams in the AAU's
  all-sports conferences move; schools join only if they play this sport
  (`AAU_PROGRAMS`), at `JOIN_RATING` (60) with their venue and logo; new
  conferences get their logo; empty ones can be retired. Applied or skipped
  is kept in `league.realign[planId]`.

## Before every commit

- `python3 tools/stamp.py`
- `sh tools/check.sh`
- `node tests/logic.test.mjs`
- `python3 tests/ui_test.py` (Playwright; Chromium is preinstalled)
