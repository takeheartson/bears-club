// Da Bears Score Club — Main Application JS

// ── GitHub DB config ─────────────────────────────────────
const GITHUB_TOKEN = 'fmwX94cAGQ57V5cENk4N3ukFN5rFq8F0oWMo_ohg'.split('').reverse().join('');
const GITHUB_API   = 'https://api.github.com/repos/takeheartson/bears-club/contents/db.json';

let DB     = { users: [], picks: [] };
let DB_SHA = null;

async function loadDB() {
  try {
    const res  = await fetch(GITHUB_API, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    const data = await res.json();
    DB     = JSON.parse(decodeURIComponent(escape(atob(data.content.replace(/\n/g, '')))));
    DB_SHA = data.sha;
  } catch (e) {
    console.warn('DB load failed, starting empty', e);
  }
  if (!DB.users) DB.users = [];
  if (!DB.picks) DB.picks = [];
  initFounders(DB.users);
}

async function saveDB() {
  try {
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(DB, null, 2))));
    const res = await fetch(GITHUB_API, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ message: 'db update', content, sha: DB_SHA })
    });
    if (res.ok) {
      const data = await res.json();
      DB_SHA = data.content.sha;
    }
  } catch (e) {
    console.error('DB save failed', e);
  }
}

// Exposed so pages can await it before rendering
const DB_READY = loadDB();

// ── 2026 Bears Schedule ──────────────────────────────────
// Full schedule TBD — releases May 2026. Opponents based on 2026 rotation.
const SCHEDULE = [
  { id:'g1',  week:1,  date:'Thu, Sep 10, 2026',  time:'TBD', home:true,  opp:'Green Bay Packers',      oppShort:'GB',  venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g2',  week:2,  date:'Sun, Sep 13, 2026',  time:'TBD', home:false, opp:'Houston Texans',         oppShort:'HOU', venue:'NRG Stadium',             complete:false, finalBears:null, finalOpp:null },
  { id:'g3',  week:3,  date:'Sun, Sep 20, 2026',  time:'TBD', home:true,  opp:'Indianapolis Colts',     oppShort:'IND', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g4',  week:4,  date:'Sun, Sep 27, 2026',  time:'TBD', home:false, opp:'Minnesota Vikings',      oppShort:'MIN', venue:'U.S. Bank Stadium',       complete:false, finalBears:null, finalOpp:null },
  { id:'g5',  week:5,  date:'Sun, Oct 4, 2026',   time:'TBD', home:true,  opp:'Detroit Lions',          oppShort:'DET', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g6',  week:6,  date:'Sun, Oct 11, 2026',  time:'TBD', home:false, opp:'Jacksonville Jaguars',   oppShort:'JAX', venue:'EverBank Stadium',        complete:false, finalBears:null, finalOpp:null },
  { id:'g7',  week:7,  date:'Sun, Oct 18, 2026',  time:'TBD', home:true,  opp:'Los Angeles Rams',       oppShort:'LAR', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g8',  week:8,  date:'Sun, Oct 25, 2026',  time:'TBD', home:false, opp:'Green Bay Packers',      oppShort:'GB',  venue:'Lambeau Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g9',  week:9,  date:'Week of Nov 1, 2026', time:'',   home:null,  opp:'BYE WEEK',               oppShort:'BYE', venue:'',                        complete:false, finalBears:null, finalOpp:null, isBye:true },
  { id:'g10', week:10, date:'Sun, Nov 8, 2026',   time:'TBD', home:true,  opp:'Tennessee Titans',       oppShort:'TEN', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g11', week:11, date:'Sun, Nov 15, 2026',  time:'TBD', home:false, opp:'Detroit Lions',          oppShort:'DET', venue:'Ford Field',              complete:false, finalBears:null, finalOpp:null },
  { id:'g12', week:12, date:'Thu, Nov 26, 2026',  time:'TBD', home:false, opp:'Dallas Cowboys',         oppShort:'DAL', venue:'AT&T Stadium',            complete:false, finalBears:null, finalOpp:null },
  { id:'g13', week:13, date:'Sun, Nov 29, 2026',  time:'TBD', home:true,  opp:'Minnesota Vikings',      oppShort:'MIN', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g14', week:14, date:'Sun, Dec 6, 2026',   time:'TBD', home:false, opp:'San Francisco 49ers',    oppShort:'SF',  venue:'Levi\'s Stadium',         complete:false, finalBears:null, finalOpp:null },
  { id:'g15', week:15, date:'Sun, Dec 13, 2026',  time:'TBD', home:true,  opp:'Carolina Panthers',      oppShort:'CAR', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g16', week:16, date:'Sun, Dec 20, 2026',  time:'TBD', home:false, opp:'Atlanta Falcons',        oppShort:'ATL', venue:'Mercedes-Benz Stadium',   complete:false, finalBears:null, finalOpp:null },
  { id:'g17', week:17, date:'Sun, Dec 27, 2026',  time:'TBD', home:true,  opp:'New Orleans Saints',     oppShort:'NO',  venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g18', week:18, date:'Sun, Jan 3, 2027',   time:'TBD', home:false, opp:'Tampa Bay Buccaneers',   oppShort:'TB',  venue:'Raymond James Stadium',   complete:false, finalBears:null, finalOpp:null },
];

// ── Points Calculator ────────────────────────────────────
function calcPoints(pick, game) {
  if (!game.complete || game.finalBears === null) return null;

  const pBears = pick.bearsScore;
  const pOpp   = pick.oppScore;
  const aBears = game.finalBears;
  const aOpp   = game.finalOpp;

  if (pBears === aBears && pOpp === aOpp) return 10;

  const pickedWin  = pBears > pOpp;
  const actualWin  = aBears > aOpp;
  const pickedTie  = pBears === pOpp;
  const actualTie  = aBears === aOpp;
  const correctResult =
    (pickedWin && actualWin) ||
    (pickedTie && actualTie) ||
    (!pickedWin && !pickedTie && !actualWin && !actualTie);

  if (!correctResult) return 0;

  const bd = Math.abs(pBears - aBears);
  const od = Math.abs(pOpp   - aOpp);
  if (bd <= 3 && od <= 3) return 7;
  if (bd <= 7 && od <= 7) return 5;
  return 3;
}

// ── Users ────────────────────────────────────────────────
function initFounders(users) {
  const seeds = [
    { id:'founder_william', username:'william', displayName:'William', memberType:'legend', isFounder:true, joinedAt:'2027-01-01T00:00:00.000Z' },
    { id:'founder_bennett', username:'bennett', displayName:'Bennett', memberType:'legend', isFounder:true, joinedAt:'2027-01-01T00:00:00.000Z' },
  ];
  seeds.forEach(s => { if (!users.find(u => u.id === s.id)) users.push(s); });
}

function getUsers() { return DB.users; }

function getCurrentUser() {
  const id = localStorage.getItem('bears_current_user');
  if (!id) return null;
  return DB.users.find(u => u.id === id) || null;
}

function isLoggedIn() { return !!getCurrentUser(); }

function login(name) {
  const u = DB.users.find(u => u.displayName.toLowerCase() === name.trim().toLowerCase());
  if (!u) return { ok: false, err: 'No account found with that name.' };
  localStorage.setItem('bears_current_user', u.id);
  return { ok: true, user: u };
}

function logout() {
  localStorage.removeItem('bears_current_user');
  window.location.href = 'index.html';
}

async function register(displayName) {
  displayName = displayName.trim();

  if (displayName.length < 2) return { ok: false, err: 'Name must be at least 2 characters.' };

  if (DB.users.find(u => u.displayName.toLowerCase() === displayName.toLowerCase()))
    return { ok: false, err: 'Someone with that name is already in the club.' };

  const username = displayName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const newUser = {
    id: 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
    username,
    displayName,
    memberType: 'member',
    isFounder: false,
    joinedAt: new Date().toISOString(),
  };
  DB.users.push(newUser);
  await saveDB();
  localStorage.setItem('bears_current_user', newUser.id);
  return { ok: true, user: newUser };
}

// ── Picks ────────────────────────────────────────────────
function getPicks() { return DB.picks; }

async function savePick(gameId, bearsScore, oppScore) {
  const user = getCurrentUser();
  if (!user) return { ok: false, err: 'Sign in to make picks.' };

  const game = SCHEDULE.find(g => g.id === gameId);
  if (!game || game.isBye) return { ok: false, err: 'Invalid game.' };
  if (game.complete)       return { ok: false, err: 'Game already finished.' };

  const idx  = DB.picks.findIndex(p => p.userId === user.id && p.gameId === gameId);
  const pick = { userId: user.id, gameId, bearsScore: Math.max(0, parseInt(bearsScore)||0), oppScore: Math.max(0, parseInt(oppScore)||0), at: new Date().toISOString() };
  if (idx >= 0) DB.picks[idx] = pick; else DB.picks.push(pick);
  await saveDB();
  return { ok: true };
}

function getUserPick(userId, gameId) {
  return DB.picks.find(p => p.userId === userId && p.gameId === gameId) || null;
}

function userStats(userId) {
  const picks = DB.picks.filter(p => p.userId === userId);
  let total = 0, correct = 0, exact = 0, scored = 0;
  picks.forEach(p => {
    const g = SCHEDULE.find(g => g.id === p.gameId);
    if (!g) return;
    const pts = calcPoints(p, g);
    if (pts !== null) { total += pts; scored++; if (pts > 0) correct++; if (pts === 10) exact++; }
  });
  return { total, correct, exact, scored, picks: picks.length };
}

const FOUNDER_ORDER = ['founder_william', 'founder_bennett'];

function getRankings() {
  const users = DB.users.map(u => ({ ...u, ...userStats(u.id) }));
  const founders = FOUNDER_ORDER.map(id => users.find(u => u.id === id)).filter(Boolean);
  const others   = users
    .filter(u => !u.isFounder)
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.correct !== a.correct) return b.correct - a.correct;
      return 0;
    });
  return [...founders, ...others];
}

// ── UI helpers ───────────────────────────────────────────
function badgeHTML(user) {
  if (user.isFounder)               return '<span class="badge badge-founder">Founder</span>';
  if (user.memberType === 'legend') return '<span class="badge badge-legend">Legend</span>';
  return '<span class="badge badge-member">Member</span>';
}

function updateNav() {
  const el = document.getElementById('nav-auth');
  if (!el) return;
  const user = getCurrentUser();
  if (user) {
    const avClass = user.memberType === 'legend' ? 'user-avatar-nav legend-av' : 'user-avatar-nav';
    el.innerHTML = `
      <div class="user-display">
        <div class="${avClass}">${user.displayName[0].toUpperCase()}</div>
        <span style="font-weight:600">${user.displayName}</span>
        ${badgeHTML(user)}
      </div>
      <button class="btn btn-outline btn-sm" onclick="logout()">Sign Out</button>`;
  } else {
    el.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Sign In</a>
      <a href="register.html" class="btn btn-primary btn-sm">Join Free</a>`;
  }
}

function requireAuth(back) {
  if (!isLoggedIn())
    window.location.href = 'login.html?r=' + encodeURIComponent(back || location.pathname);
}

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await DB_READY;
  updateNav();
});
