// Da Bears Score Club — Main Application JS

const SK = {
  USERS: 'bears_users',
  CURRENT: 'bears_current_user',
  PICKS: 'bears_picks',
};

// ── 2027 Bears Schedule ──────────────────────────────────
// Bears = home unless home:false. finalBears/finalOpp = null until complete.
const SCHEDULE = [
  { id:'g1',  week:1,  date:'Thu, Sep 9, 2027',   time:'8:20 PM ET', home:true,  opp:'Green Bay Packers',      oppShort:'GB',  venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g2',  week:2,  date:'Sun, Sep 14, 2027',  time:'1:00 PM ET', home:false, opp:'Minnesota Vikings',      oppShort:'MIN', venue:'U.S. Bank Stadium',       complete:false, finalBears:null, finalOpp:null },
  { id:'g3',  week:3,  date:'Sun, Sep 21, 2027',  time:'1:00 PM ET', home:true,  opp:'Detroit Lions',          oppShort:'DET', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g4',  week:4,  date:'Sun, Sep 28, 2027',  time:'4:25 PM ET', home:false, opp:'Dallas Cowboys',         oppShort:'DAL', venue:'AT&T Stadium',            complete:false, finalBears:null, finalOpp:null },
  { id:'g5',  week:5,  date:'Sun, Oct 5, 2027',   time:'1:00 PM ET', home:true,  opp:'Kansas City Chiefs',     oppShort:'KC',  venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g6',  week:6,  date:'Sun, Oct 12, 2027',  time:'4:05 PM ET', home:false, opp:'Los Angeles Rams',       oppShort:'LAR', venue:'SoFi Stadium',            complete:false, finalBears:null, finalOpp:null },
  { id:'g7',  week:7,  date:'Sun, Oct 19, 2027',  time:'1:00 PM ET', home:true,  opp:'New England Patriots',   oppShort:'NE',  venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g8',  week:8,  date:'Mon, Oct 27, 2027',  time:'8:15 PM ET', home:false, opp:'Philadelphia Eagles',    oppShort:'PHI', venue:'Lincoln Financial Field', complete:false, finalBears:null, finalOpp:null },
  { id:'g9',  week:9,  date:'Week of Nov 2, 2027',time:'',           home:null,  opp:'BYE WEEK',               oppShort:'BYE', venue:'',                        complete:false, finalBears:null, finalOpp:null, isBye:true },
  { id:'g10', week:10, date:'Sun, Nov 9, 2027',   time:'1:00 PM ET', home:true,  opp:'Washington Commanders',  oppShort:'WAS', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g11', week:11, date:'Sun, Nov 16, 2027',  time:'4:25 PM ET', home:false, opp:'Green Bay Packers',      oppShort:'GB',  venue:'Lambeau Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g12', week:12, date:'Thu, Nov 27, 2027',  time:'12:30 PM ET',home:true,  opp:'New York Giants',        oppShort:'NYG', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g13', week:13, date:'Sun, Nov 30, 2027',  time:'1:00 PM ET', home:false, opp:'Detroit Lions',          oppShort:'DET', venue:'Ford Field',              complete:false, finalBears:null, finalOpp:null },
  { id:'g14', week:14, date:'Sun, Dec 7, 2027',   time:'1:00 PM ET', home:true,  opp:'Minnesota Vikings',      oppShort:'MIN', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g15', week:15, date:'Sun, Dec 14, 2027',  time:'4:05 PM ET', home:false, opp:'Cincinnati Bengals',     oppShort:'CIN', venue:'Paycor Stadium',          complete:false, finalBears:null, finalOpp:null },
  { id:'g16', week:16, date:'Sun, Dec 21, 2027',  time:'1:00 PM ET', home:true,  opp:'Arizona Cardinals',      oppShort:'ARI', venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
  { id:'g17', week:17, date:'Sat, Dec 27, 2027',  time:'8:15 PM ET', home:false, opp:'Seattle Seahawks',       oppShort:'SEA', venue:'Lumen Field',             complete:false, finalBears:null, finalOpp:null },
  { id:'g18', week:18, date:'Sun, Jan 3, 2028',   time:'1:00 PM ET', home:true,  opp:'Tampa Bay Buccaneers',   oppShort:'TB',  venue:'Soldier Field',           complete:false, finalBears:null, finalOpp:null },
];

// ── Points Calculator ────────────────────────────────────
// Exact:           10 pts
// Right result + within 3 each: 7 pts
// Right result + within 7 each: 5 pts
// Right result only:             3 pts
// Wrong:                         0 pts
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
  let changed = false;
  seeds.forEach(s => {
    if (!users.find(u => u.id === s.id)) { users.push(s); changed = true; }
  });
  return changed;
}

function getUsers() {
  let users = JSON.parse(localStorage.getItem(SK.USERS) || '[]');
  if (initFounders(users)) localStorage.setItem(SK.USERS, JSON.stringify(users));
  return users;
}

function saveUsers(u) { localStorage.setItem(SK.USERS, JSON.stringify(u)); }

function getCurrentUser() {
  const id = localStorage.getItem(SK.CURRENT);
  if (!id) return null;
  return getUsers().find(u => u.id === id) || null;
}

function isLoggedIn() { return !!getCurrentUser(); }

function login(username) {
  const u = getUsers().find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!u) return { ok: false, err: 'No account found with that username.' };
  localStorage.setItem(SK.CURRENT, u.id);
  return { ok: true, user: u };
}

function logout() {
  localStorage.removeItem(SK.CURRENT);
  window.location.href = 'index.html';
}

function register(displayName, username, memberType) {
  displayName = displayName.trim();
  username    = username.trim();

  if (displayName.length < 2) return { ok: false, err: 'Display name must be at least 2 characters.' };
  if (username.length < 2)    return { ok: false, err: 'Username must be at least 2 characters.' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { ok: false, err: 'Username: letters, numbers, underscores only.' };

  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
    return { ok: false, err: 'That username is already taken.' };

  const newUser = {
    id: 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
    username: username.toLowerCase(),
    displayName,
    memberType: memberType || 'member',
    isFounder: false,
    joinedAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(SK.CURRENT, newUser.id);
  return { ok: true, user: newUser };
}

// ── Picks ────────────────────────────────────────────────
function getPicks() { return JSON.parse(localStorage.getItem(SK.PICKS) || '[]'); }

function savePick(gameId, bearsScore, oppScore) {
  const user = getCurrentUser();
  if (!user) return { ok: false, err: 'Sign in to make picks.' };

  const game = SCHEDULE.find(g => g.id === gameId);
  if (!game || game.isBye)     return { ok: false, err: 'Invalid game.' };
  if (game.complete)           return { ok: false, err: 'Game already finished.' };

  const picks = getPicks();
  const idx   = picks.findIndex(p => p.userId === user.id && p.gameId === gameId);
  const pick  = { userId: user.id, gameId, bearsScore: Math.max(0, parseInt(bearsScore)||0), oppScore: Math.max(0, parseInt(oppScore)||0), at: new Date().toISOString() };
  if (idx >= 0) picks[idx] = pick; else picks.push(pick);
  localStorage.setItem(SK.PICKS, JSON.stringify(picks));
  return { ok: true };
}

function getUserPick(userId, gameId) {
  return getPicks().find(p => p.userId === userId && p.gameId === gameId) || null;
}

function userStats(userId) {
  const picks = getPicks().filter(p => p.userId === userId);
  let total = 0, correct = 0, exact = 0, scored = 0;
  picks.forEach(p => {
    const g = SCHEDULE.find(g => g.id === p.gameId);
    if (!g) return;
    const pts = calcPoints(p, g);
    if (pts !== null) { total += pts; scored++; if (pts > 0) correct++; if (pts === 10) exact++; }
  });
  return { total, correct, exact, scored, picks: picks.length };
}

function getRankings() {
  return getUsers()
    .map(u => ({ ...u, ...userStats(u.id) }))
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      if (b.exact !== a.exact) return b.exact - a.exact;
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (a.isFounder && !b.isFounder) return -1;
      if (!a.isFounder && b.isFounder) return 1;
      return 0;
    });
}

// ── UI helpers ───────────────────────────────────────────
function badgeHTML(user) {
  if (user.isFounder)              return '<span class="badge badge-founder">Founder</span>';
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
document.addEventListener('DOMContentLoaded', () => {
  getUsers(); // seeds founders
  updateNav();
});
