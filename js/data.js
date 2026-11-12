// Starting league: the AAU members with varsity lacrosse, in the 2030 season
// after the AAU took over college athletics. Women's and men's are separate
// dynasties (the switch in the top bar).
//
// Women's: the 37 programs in the owner's AAU Dynasty file, in the
// commissioner's conferences (Vanderbilt and UC Davis are the only lacrosse
// teams in their conferences, so they play no conference games).
// Men's: the 24 programs in the owner's file, in the commissioner's
// conferences: Ivy League 7, Coastal Atlantic 5, Metro 4, UAA 4 (Johns
// Hopkins, which plays Division I lacrosse in real life and is rated that
// way, with Case Western, MIT and Tufts), Big Ten 3 and Utah alone in the
// Pac-10 (no conference games).
// Colors and mascots are each school's real ones.
//
// Ratings: ATT (attack), MID (midfield and possession) and DEF (defense and
// goalkeeping), 40–99, stored as off / pit / def. OVR comes from the final
// 2026 USA Lacrosse Division I Top 20 (May 27, 2026), OVR = 92 − 1.2 ×
// (rank − 1):
// - Men's: Princeton won the 2026 NCAA title 16–9 over Notre Dame (17-2);
//   Duke reached the semifinals, North Carolina, Penn State, Johns Hopkins
//   and Georgetown the quarterfinals; Cornell, Virginia, Yale and Stony Brook
//   were also in the field. Maryland (7-6), Harvard (9-5), Ohio State (10-4)
//   and Penn (7-6) were ranked; Boston University (8-6), Michigan (6-9) and
//   Rutgers (8-7) were also considered (Wikipedia, "2026 NCAA Division I
//   men's lacrosse tournament"; usalacrosse.com).
// - Women's: Northwestern won the 2026 title 14–11 over North Carolina
//   (16-1) at home; Maryland and Johns Hopkins reached the semifinals;
//   Stony Brook, Colorado, Stanford, Michigan, Rutgers, Florida, Notre
//   Dame, Penn State and Yale were ranked; Duke, Georgetown, Princeton and
//   Virginia were also considered (Wikipedia, "2026 NCAA Division I
//   women's lacrosse tournament"; usalacrosse.com).
// - Programs outside the rankings are estimates (OVR 52–70), and Division III
//   programs (Tufts, MIT, Rochester, Case Western) sit below them.
//
// Head coaches are the real ones for 2026 (school athletics sites and
// usalacrosse.com's coaching-change lists: Taylor Wray at Penn's men, Kayla
// Treanor at Penn State's women, Sam Apuzzo at USC, hired June 2026).
// Coaches who couldn't be confirmed start as open jobs; name them on the
// Coaches page. Home fields are each school's lacrosse stadium.

import { DEFAULT_LOGOS } from './logo-import.js?v=20261111204958';

export const START_YEAR = 2030;

// The commissioner's conferences (from the AAU Dynasty), each with a logo
// drawn for these dynasties (img/conf/).
// Conference logos the owner picked from the web (linked, not copied; the
// drawn ones in img/conf/ stay for CAC, SWC, UCAA and as fallbacks).
export const CONF_LOGO_LINKS = {
  bigten: 'https://content.sportslogos.net/logos/153/4661/full/big_ten_conference_logo_primary_20115933.png',
  ivy: 'https://content.sportslogos.net/logos/153/4824/full/ivy_league_logo_primary_2019_sportslogosnet-9024.png',
  metro: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/METRO_Primary_LtBG.png/500px-METRO_Primary_LtBG.png',
  pac10: 'https://content.sportslogos.net/logos/153/4945/full/pacific-10_conference_logo_wordmark_1995_sportslogosnet-1134.png',
  uaa: 'https://dbukjj6eu5tsf.cloudfront.net/uaasports.info/images/responsive_2023/logo-main.svg',
};
const L = f => CONF_LOGO_LINKS[f] || `img/conf/${f}.svg`;
export const CONFERENCES = {
  'Big Ten': { abbr: 'B1G', color: '#0088CE', altColor: '#0B2A4A', logo: L('bigten') },
  'Coastal Atlantic Conference': { abbr: 'CAC', color: '#3A4A5C', altColor: '#5CC6C2', logo: L('cac') },
  'Ivy League': { abbr: 'IVY', color: '#026937', altColor: '#C9B37E', logo: L('ivy') },
  'Metro Conference': { abbr: 'METRO', color: '#E03A3E', altColor: '#23262D', logo: L('metro') },
  'Pacific-10 Conference': { abbr: 'P10', color: '#092346', altColor: '#D6A84B', logo: L('pac10') },
  'Southwest Conference': { abbr: 'SWC', color: '#719AE8', altColor: '#F28C38', logo: L('swc') },
  'UC Athletic Association': { abbr: 'UCAA', color: '#0F6E7A', altColor: '#F2C14E', logo: L('ucaa') },
  'University Athletic Association': { abbr: 'UAA', color: '#003087', altColor: '#F2B33D', logo: L('uaa') },
};

// [school, conference, abbr, mascot, color, altColor, OVR]
const WOMEN = [
  ["Northwestern", 'Big Ten', 'NU', "Wildcats", '#4E2A84', '#FFFFFF', 92],
  ["Michigan", 'Big Ten', 'MICH', "Wolverines", '#00274C', '#FFCB05', 82],
  ["Penn State", 'Big Ten', 'PSU', "Nittany Lions", '#041E42', '#FFFFFF', 70],
  ["Ohio State", 'Big Ten', 'OSU', "Buckeyes", '#BB0000', '#666666', 62],
  ["North Carolina", 'Coastal Atlantic Conference', 'UNC', "Tar Heels", '#7BAFD4', '#13294B', 91],
  ["Maryland", 'Coastal Atlantic Conference', 'MD', "Terrapins", '#E21833', '#FFD200', 90],
  ["Florida", 'Coastal Atlantic Conference', 'FLA', "Gators", '#0021A5', '#FA4616', 74],
  ["Notre Dame", 'Coastal Atlantic Conference', 'ND', "Fighting Irish", '#0C2340', '#C99700', 72],
  ["Duke", 'Coastal Atlantic Conference', 'DUKE', "Blue Devils", '#00539B', '#FFFFFF', 67],
  ["Virginia", 'Coastal Atlantic Conference', 'UVA', "Cavaliers", '#232D4B', '#E57200', 67],
  ["South Florida", 'Coastal Atlantic Conference', 'USF', "Bulls", '#006747', '#CFC493', 56],
  ["Yale", 'Ivy League', 'YALE', "Bulldogs", '#00356B', '#FFFFFF', 69],
  ["Princeton", 'Ivy League', 'PRIN', "Tigers", '#E77500', '#000000', 67],
  ["Penn", 'Ivy League', 'PENN', "Quakers", '#011F5B', '#990000', 63],
  ["Cornell", 'Ivy League', 'COR', "Big Red", '#B31B1B', '#FFFFFF', 61],
  ["Harvard", 'Ivy League', 'HARV', "Crimson", '#A51C30', '#1E1E1E', 61],
  ["Columbia", 'Ivy League', 'CLMB', "Lions", '#1D4F91', '#9BCBEB', 58],
  ["Brown", 'Ivy League', 'BRWN', "Bears", '#4E3629', '#C00404', 57],
  ["Dartmouth", 'Ivy League', 'DART', "Big Green", '#00693E', '#FFFFFF', 56],
  ["Stony Brook", 'Metro Conference', 'SBU', "Seawolves", '#990000', '#16243E', 87],
  ["Rutgers", 'Metro Conference', 'RUTG', "Scarlet Knights", '#CC0033', '#5F6A72', 75],
  ["Georgetown", 'Metro Conference', 'GTWN', "Hoyas", '#041E42', '#63666A', 67],
  ["Boston University", 'Metro Conference', 'BU', "Terriers", '#CC0000', '#FFFFFF', 60],
  ["Pittsburgh", 'Metro Conference', 'PITT', "Panthers", '#003594', '#FFB81C', 55],
  ["George Washington", 'Metro Conference', 'GW', "Revolutionaries", '#033C5A', '#AA9868', 52],
  ["Colorado", 'Pacific-10 Conference', 'COLO', "Buffaloes", '#000000', '#CFB87C', 86],
  ["Stanford", 'Pacific-10 Conference', 'STAN', "Cardinal", '#8C1515', '#FFFFFF', 84],
  ["USC", 'Pacific-10 Conference', 'USC', "Trojans", '#990000', '#FFC72C', 63],
  ["Arizona State", 'Pacific-10 Conference', 'ASU', "Sun Devils", '#8C1D40', '#FFC627', 58],
  ["Oregon", 'Pacific-10 Conference', 'ORE', "Ducks", '#154733', '#FEE123', 58],
  ["California", 'Pacific-10 Conference', 'CAL', "Golden Bears", '#003262', '#FDB515', 55],
  ["Vanderbilt", 'Southwest Conference', 'VAN', "Commodores", '#000000', '#CFAE70', 62],
  ["UC Davis", 'UC Athletic Association', 'UCD', "Aggies", '#022851', '#FFBF00', 56],
  ["Johns Hopkins", 'University Athletic Association', 'JHU', "Blue Jays", '#002D72', '#68ACE5', 88],
  ["Tufts", 'University Athletic Association', 'TUFT', "Jumbos", '#3E8EDE', '#002E6D', 52],
  ["Rochester", 'University Athletic Association', 'ROCH', "Yellowjackets", '#001E5F', '#FFD100', 46],
  ["MIT", 'University Athletic Association', 'MIT', "Engineers", '#A31F34', '#8A8B8C', 44],
];
const MEN = [
  ["Penn State", 'Big Ten', 'PSU', "Nittany Lions", '#041E42', '#FFFFFF', 86],
  ["Ohio State", 'Big Ten', 'OSU', "Buckeyes", '#BB0000', '#666666', 74],
  ["Michigan", 'Big Ten', 'MICH', "Wolverines", '#00274C', '#FFCB05', 68],
  ["Notre Dame", 'Coastal Atlantic Conference', 'ND', "Fighting Irish", '#0C2340', '#C99700', 91],
  ["Duke", 'Coastal Atlantic Conference', 'DUKE', "Blue Devils", '#00539B', '#FFFFFF', 88],
  ["North Carolina", 'Coastal Atlantic Conference', 'UNC', "Tar Heels", '#7BAFD4', '#13294B', 87],
  ["Virginia", 'Coastal Atlantic Conference', 'UVA', "Cavaliers", '#232D4B', '#E57200', 80],
  ["Maryland", 'Coastal Atlantic Conference', 'MD', "Terrapins", '#E21833', '#FFD200', 79],
  ["Princeton", 'Ivy League', 'PRIN', "Tigers", '#E77500', '#000000', 92],
  ["Cornell", 'Ivy League', 'COR', "Big Red", '#B31B1B', '#FFFFFF', 81],
  ["Harvard", 'Ivy League', 'HARV', "Crimson", '#A51C30', '#1E1E1E', 78],
  ["Yale", 'Ivy League', 'YALE', "Bulldogs", '#00356B', '#FFFFFF', 75],
  ["Penn", 'Ivy League', 'PENN', "Quakers", '#011F5B', '#990000', 72],
  ["Brown", 'Ivy League', 'BRWN', "Bears", '#4E3629', '#C00404', 63],
  ["Dartmouth", 'Ivy League', 'DART', "Big Green", '#00693E', '#FFFFFF', 61],
  ["Georgetown", 'Metro Conference', 'GTWN', "Hoyas", '#041E42', '#63666A', 82],
  ["Boston University", 'Metro Conference', 'BU', "Terriers", '#CC0000', '#FFFFFF', 70],
  ["Stony Brook", 'Metro Conference', 'SBU', "Seawolves", '#990000', '#16243E', 70],
  ["Rutgers", 'Metro Conference', 'RUTG', "Scarlet Knights", '#CC0033', '#5F6A72', 68],
  ["Utah", 'Pacific-10 Conference', 'UTAH', "Utes", '#CC0000', '#000000', 65],
  ["Johns Hopkins", 'University Athletic Association', 'JHU', "Blue Jays", '#002D72', '#68ACE5', 84],
  ["Tufts", 'University Athletic Association', 'TUFT', "Jumbos", '#3E8EDE', '#002E6D', 54],
  ["Case Western", 'University Athletic Association', 'CWRU', "Spartans", '#0A304E', '#FFFFFF', 46],
  ["MIT", 'University Athletic Association', 'MIT', "Engineers", '#A31F34', '#8A8B8C', 45],
];

// Home fields: [stadium, city]. Every one can be edited on the team page.
export const SITES = {
  "Arizona State": ["Sun Devil Soccer Stadium", "Tempe, Ariz."],
  "Boston University": ["Nickerson Field", "Boston, Mass."],
  "Brown": ["Stevenson-Pincince Field", "Providence, R.I."],
  "California": ["Witter Rugby Field", "Berkeley, Calif."],
  "Case Western": ["DiSanto Field", "Cleveland, Ohio"],
  "Colorado": ["Prentup Field", "Boulder, Colo."],
  "Columbia": ["Robert K. Kraft Field", "New York, N.Y."],
  "Cornell": ["Schoellkopf Field", "Ithaca, N.Y."],
  "Dartmouth": ["Scully-Fahey Field", "Hanover, N.H."],
  "Duke": ["Koskinen Stadium", "Durham, N.C."],
  "Florida": ["Donald R. Dizney Stadium", "Gainesville, Fla."],
  "George Washington": ["Mount Vernon Field", "Washington, D.C."],
  "Georgetown": ["Cooper Field", "Washington, D.C."],
  "Harvard": ["Jordan Field", "Boston, Mass."],
  "Johns Hopkins": ["Homewood Field", "Baltimore, Md."],
  "MIT": ["Steinbrenner Stadium", "Cambridge, Mass."],
  "Maryland": ["Maryland Field Hockey & Lacrosse Complex", "College Park, Md."],
  "Michigan": ["U-M Lacrosse Stadium", "Ann Arbor, Mich."],
  "North Carolina": ["Dorrance Field", "Chapel Hill, N.C."],
  "Northwestern": ["Martin Stadium", "Evanston, Ill."],
  "Notre Dame": ["Arlotta Stadium", "Notre Dame, Ind."],
  "Ohio State": ["Jesse Owens Memorial Stadium", "Columbus, Ohio"],
  "Oregon": ["Pap\u00e9 Field", "Eugene, Ore."],
  "Penn": ["Franklin Field", "Philadelphia, Pa."],
  "Penn State": ["Panzer Stadium", "University Park, Pa."],
  "Pittsburgh": ["Ambrose Urbanic Field", "Pittsburgh, Pa."],
  "Princeton": ["Class of 1952 Stadium", "Princeton, N.J."],
  "Rochester": ["Fauver Stadium", "Rochester, N.Y."],
  "Rutgers": ["SHI Stadium", "Piscataway, N.J."],
  "South Florida": ["Corbett Stadium", "Tampa, Fla."],
  "Stanford": ["Laird Q. Cagan Stadium", "Stanford, Calif."],
  "Stony Brook": ["Kenneth P. LaValle Stadium", "Stony Brook, N.Y."],
  "Tufts": ["Bello Field", "Medford, Mass."],
  "UC Davis": ["Aggie Stadium", "Davis, Calif."],
  "USC": ["McAlister Field", "Los Angeles, Calif."],
  "Utah": ["Ute Field", "Salt Lake City, Utah"],
  "Vanderbilt": ["Vanderbilt Lacrosse Field", "Nashville, Tenn."],
  "Virginia": ["Kl\u00f6ckner Stadium", "Charlottesville, Va."],
  "Yale": ["Reese Stadium", "New Haven, Conn."],
};
// Men's teams that play somewhere else (Maryland's men at SECU Stadium).
export const MEN_SITES = {
  "Maryland": ["SECU Stadium", "College Park, Md."],
};

// Names the logo lists may know a school by.
export const LOGO_ALIASES = { 'Penn': 'Pennsylvania', 'Miami': 'Miami', 'UC Santa Barbara': 'UC Santa Barbara', 'George Washington': 'George Washington', 'UConn': 'Connecticut' };

// Head coaches for the 2026 season (see above). By 2030 some will have moved
// on; rename anyone on the Coaches page.
export const COACHES = {
  "Arizona State": "Taryn VanThof",
  "Boston University": "Liz Robertshaw",
  "California": "Jennifer Wong",
  "Colorado": "Ann Elliott Whidden",
  "Cornell": "Jenny Graap",
  "Dartmouth": "Alex Frank",
  "Duke": "Kerstin Kimel",
  "Florida": "Amanda O'Leary",
  "George Washington": "Colleen McCaffrey",
  "Georgetown": "Caitlyn Phipps",
  "Harvard": "Devon Wills",
  "Johns Hopkins": "Janine Tucker",
  "Maryland": "Cathy Reese",
  "Michigan": "Hannah Nielsen",
  "North Carolina": "Jenny Levy",
  "Northwestern": "Kelly Amonte Hiller",
  "Notre Dame": "Christine Halfpenny",
  "Ohio State": "Amanda Moore",
  "Oregon": "Jess Drummond",
  "Penn": "Karin Brower Corbett",
  "Penn State": "Kayla Treanor",
  "Pittsburgh": "Emily Boissonneault",
  "Princeton": "Jenn Cook",
  "Rutgers": "Melissa Lehman",
  "South Florida": "Mindy McCord",
  "Stanford": "Danielle Spencer",
  "Stony Brook": "Joe Spallina",
  "USC": "Sam Apuzzo",
  "Vanderbilt": "Beth Hewitt",
  "Virginia": "Sonia LaMonica",
  "Yale": "Erica Ennis",
};
export const MEN_COACHES = {
  "Boston University": "Ryan Polley",
  "Brown": "Jon Torpey",
  "Cornell": "Connor Buczek",
  "Dartmouth": "Brendan Callahan",
  "Duke": "John Danowski",
  "Georgetown": "Kevin Warne",
  "Harvard": "Gerry Byrne",
  "Johns Hopkins": "Peter Milliman",
  "Maryland": "John Tillman",
  "Michigan": "Kevin Conry",
  "North Carolina": "Joe Breschi",
  "Notre Dame": "Kevin Corrigan",
  "Ohio State": "Nick Myers",
  "Penn": "Taylor Wray",
  "Penn State": "Jeff Tambroni",
  "Princeton": "Matt Madalon",
  "Rutgers": "Brian Brecht",
  "Stony Brook": "Anthony Gilardi",
  "Tufts": "Casey D'Annolfo",
  "Utah": "Brian Holman",
  "Virginia": "Lars Tiffany",
  "Yale": "Andy Shay",
};

function hashName(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; }

export function makeTeam({ school, conference, abbr, mascot = '', coach = '', coachId = null, color = '#555555', altColor = '#dddddd', off = 65, pit = 65, def = 65, stadium, city, men = false }) {
  const known = (men && MEN_SITES[school]) || SITES[school] || [];
  return {
    school, conference, abbr: abbr || school.replace(/[^A-Za-z ]/g, '').split(/\s+/).map(w => w[0]).join('').slice(0, 4).toUpperCase(),
    mascot, coach, coachId, color, altColor, off, pit, def, base: { off, pit, def }, logoOverride: null,
    stadium: stadium || known[0] || '', city: city || known[1] || '',
  };
}

// Gives a team its home field from SITES if it has none yet (older saves).
export function fillSite(t) {
  if (t.stadium !== undefined && t.city !== undefined) return;
  const known = SITES[t.school] || [];
  t.stadium ??= known[0] || '';
  t.city ??= known[1] || '';
}

// OVR → ATT / MID / DEF: each team leans a little one way (a high-scoring
// attack, a team that wins faceoffs and ground balls, a stingy defense and
// goalie), keeping the same OVR.
export function splitOvr(school, ovr) {
  const h = hashName(school);
  const a = (h % 7) - 3, b = ((h >>> 4) % 5) - 2;
  const off = ovr + a, pit = ovr + b, def = Math.round(ovr - (0.4 * a + 0.3 * b) / 0.3);
  const c = x => Math.max(40, Math.min(99, x));
  return { off: c(off), pit: c(pit), def: c(def) };
}

// Women's and men's are separate leagues (the switch at the top of the
// page). `side` is 'women' (the default) or 'men'.
export const SIDES = {
  women: { label: "Women's", name: "AAU Women's Lacrosse" },
  men: { label: "Men's", name: "AAU Men's Lacrosse" },
};
export const sideOf = league => (league?.side === 'men' ? 'men' : 'women');

export function seedTeams(side = 'women') {
  const teams = {};
  const men = side === 'men';
  for (const [school, conference, abbr, mascot, color, altColor, ovr] of men ? MEN : WOMEN) {
    teams[school] = makeTeam({ school, conference, abbr, mascot, coach: (men ? MEN_COACHES : COACHES)[school] || '', color, altColor, men, ...splitOvr(school, ovr) });
    // The AAU Dynasty's logos win over the automatic logo lists.
    teams[school].logoOverride = DEFAULT_LOGOS[school] || null;
  }
  return teams;
}
// Conferences each side starts with: only those with teams in that sport.
export function conferencesFor(side) {
  const used = new Set((side === 'men' ? MEN : WOMEN).map(r => r[1]));
  return Object.fromEntries(Object.entries(CONFERENCES).filter(([c]) => used.has(c)));
}
