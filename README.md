# AAU Lacrosse

A commissioner-style college lacrosse dynasty. It's 2030: the NCAA has
collapsed and the **Association of American Universities** runs college
athletics. Women's and men's lacrosse are **two separate dynasties** behind
the switch in the top bar, each with its own save. It has box scores by
quarter, sudden-victory overtime, standings, the RPI, a voters' poll,
conference tournaments, the **AAU National Tournament** through the **Final
Four**, coaches, the offseason and a record book.

It's built on the MCS Dynasty engine (by way of AAU Basketball) and works
the same way, with lacrosse's rules, schedule and tournament.

Open `index.html` through any static web server (GitHub Pages works: Settings
→ Pages → Deploy from a branch → `main`, `/ (root)`). **Settings → Download
backup** keeps a copy. AAU History reads these backups (they carry
`sport: 'lacrosse'`).

## The league

**Women's: 37 programs** in the owner's AAU Dynasty conferences:

| Conference | Teams |
|---|---|
| Ivy League | Brown, Columbia, Cornell, Dartmouth, Harvard, Penn, Princeton, Yale |
| Coastal Atlantic Conference | Duke, Florida, Maryland, North Carolina, Notre Dame, South Florida, Virginia |
| Pacific-10 Conference | Arizona State, California, Colorado, Oregon, Stanford, USC |
| Metro Conference | Boston University, George Washington, Georgetown, Pittsburgh, Rutgers, Stony Brook |
| Big Ten | Michigan, Northwestern, Ohio State, Penn State |
| University Athletic Association | Johns Hopkins, MIT, Rochester, Tufts |
| Southwest Conference / UC Athletic Association | Vanderbilt, UC Davis (no conference games) |

**Men's: 24 programs** in four six-team lacrosse conferences made for this
dynasty (rename or realign them in the offseason):

| Conference | Teams |
|---|---|
| Ivy League | Brown, Cornell, Dartmouth, Harvard, Princeton, Yale |
| Atlantic Lacrosse League | Duke, Johns Hopkins, Maryland, North Carolina, Notre Dame, Virginia |
| Midlands Lacrosse League | Michigan, Ohio State, Penn, Penn State, Rutgers, Utah |
| Metro Conference | Boston University, Case Western, Georgetown, MIT, Stony Brook, Tufts |

Real colors, real 2026 head coaches (a few unconfirmed jobs start open) and
real home fields.

## Ratings

**ATT** (attack), **MID** (faceoffs, draw controls, ground balls) and **DEF**
(defense and goalkeeping); **OVR = 40% ATT + 30% MID + 30% DEF.** Starting
ratings come from the final 2026 USA Lacrosse Top 20: Princeton's men and
Northwestern's women, the 2026 national champions, start on top.
`js/data.js` lists the sources.

## Games

- **Four 15-minute quarters**, minute by minute: about 12 goals and 35 shots
  a team.
- **No ties:** a game tied after 60 minutes plays **sudden-victory
  overtime** (4-minute periods for men, 3 for women) until someone scores.
- Box scores show goals by quarter and overtime, shots and shots on goal.

## The season

- **13 weeks**, opening the first weekend of February and ending in late
  April.
- **Conference play fills the last weeks**, one game a week on Saturday
  (with a Wednesday game in some weeks). Conferences of 6 or fewer play
  everyone **home and away**; bigger ones (the women's Ivy and Coastal
  Atlantic) everyone once. The men play 10 conference games.
- **Non-conference games**, mostly Saturdays with some Tuesdays and
  Wednesdays, against nearby teams of a similar level. Men's teams play
  about 6 (16 games in all), women's up to 17 games. At most two games a
  week, never on back-to-back days.

## The postseason

1. **Conference tournaments:** the top 4 of each conference with 4 or more
   teams, semifinals Friday and the final Sunday, for the automatic bid.
2. **AAU National Tournament**, every game at the higher seed's field:
   - **Women's: 16 teams** in four regions of four, first round Friday and
     quarterfinal Sunday.
   - **Men's: 8 teams**, the quarterfinals on campus.
3. **The Final Four:** women's at Martin Stadium, Evanston (Friday and
   Sunday); men's at Scott Stadium, Charlottesville (Saturday and Memorial
   Day Monday). Venues and the format are in Settings.

## Development

Plain ES modules, no build step. Before every commit:

```
python3 tools/stamp.py
sh tools/check.sh
node tests/logic.test.mjs
python3 tests/ui_test.py
```
