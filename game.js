const characters = [
  ['밤톨이', '#a66886', '🌱', '햇살 아래 낮잠을 좋아해요.'],
  ['꿀떡이', '#d49a52', '🍯', '마음까지 달콤한 친구예요.'],
  ['자몽이', '#b579a6', '🎀', '리본을 매고 소풍을 떠나요.'],
  ['군밤이', '#956552', '🔥', '따뜻한 모닥불을 좋아해요.'],
  ['새싹이', '#8ca768', '🌿', '마을의 정원을 돌봐요.'],
  ['딸기마', '#da8392', '🍓', '딸기 향기가 솔솔 나요.'],
  ['구름이', '#a5b8d1', '☁️', '하늘을 보며 상상해요.'],
  ['달콩이', '#b498c9', '🌙', '달빛 아래 산책해요.'],
  ['햇살이', '#e2b859', '☀️', '매일 아침을 반겨요.'],
  ['눈송이', '#b4cbd1', '❄️', '시원한 바람을 좋아해요.'],
  ['왕고마', '#9c719c', '👑', '친절한 고구마 왕이에요.'],
  ['마법마', '#8879bc', '🪄', '작은 행복을 만드는 마법사예요.'],
  ['해적마', '#8d7772', '🏴‍☠️', '연못 너머 보물을 찾아요.'],
  ['요리마', '#d2a185', '👨‍🍳', '친구들에게 간식을 만들어 줘요.'],
  ['화가마', '#bc868d', '🎨', '마을 풍경을 그려요.'],
  ['음표마', '#a78bb5', '🎵', '발걸음마다 노래를 불러요.'],
  ['책벌레마', '#b69268', '📚', '도서관의 단골손님이에요.'],
  ['탐험마', '#9caa70', '🧭', '새로운 길을 발견해요.'],
  ['우주마', '#7e8fbe', '🚀', '언젠가 달에 밭을 만들 거예요.'],
  ['별똥이', '#ccaa6f', '⭐', '친구들의 소원을 들어 줘요.'],
  ['꽃송이', '#ce91af', '🌸', '꽃밭에서 가장 행복해요.'],
  ['버섯마', '#bd8773', '🍄', '숲속의 숨은 길을 알아요.'],
  ['개굴마', '#89ac7c', '🐸', '연못에서 노래 연습을 해요.'],
  ['냥고마', '#c3a084', '🐱', '호기심이 아주 많아요.'],
  ['멍고마', '#b78f73', '🐶', '산책이라면 언제든 좋아요.'],
  ['토끼마', '#d4a9ba', '🐰', '깡충깡충 뛰는 걸 좋아해요.'],
  ['당근마', '#d99c69', '🥕', '채소 친구들과 사이가 좋아요.'],
  ['민트마', '#7eb7a5', '🍃', '싱그러운 바람을 데려와요.'],
  ['초코마', '#967365', '🍫', '빵집 앞을 그냥 못 지나가요.'],
  ['무지개마', '#c88fb9', '🌈', '모든 색깔을 사랑해요.'],
].map(([name, color, accessory, description], id) => ({ id, name, color, accessory, description }));

const el = id => document.getElementById(id);
const key = 'little-sweet-potato-v2';
let state = { water: 0, harvested: 0, counts: Array(30).fill(0), selected: null };
try {
  const saved = JSON.parse(localStorage.getItem(key) || localStorage.getItem('little-sweet-potato-v1'));
  if (saved) {
    if (Number.isInteger(saved.water) && saved.water >= 0 && saved.water <= 5) state.water = saved.water;
    if (Number.isSafeInteger(saved.harvested) && saved.harvested >= 0) state.harvested = saved.harvested;
    if (Array.isArray(saved.counts) && saved.counts.length === 30 && saved.counts.every(n => Number.isSafeInteger(n) && n >= 0)) state.counts = saved.counts;
    // 이전 버전의 수확분은 기본 캐릭터로 이어받습니다.
    else if (state.harvested) state.counts[0] = state.harvested;
    state.selected = Number.isInteger(saved.selected) && state.counts[saved.selected] > 0 ? saved.selected : state.counts.findIndex(n => n > 0);
    if (state.selected === -1) state.selected = null;
  }
} catch {}
function save() {
  try { localStorage.setItem(key, JSON.stringify(state)); }
  catch { el('save-note').textContent = '이 브라우저에서는 진행 상황을 저장할 수 없어요.'; }
}
function portrait(c) {
  return `<svg class="pixel-character" viewBox="0 0 100 110" aria-hidden="true" shape-rendering="crispEdges"><rect x="28" y="35" width="48" height="52" fill="#493b40"/><rect x="22" y="47" width="60" height="28" fill="#493b40"/><rect x="28" y="29" width="36" height="6" fill="#493b40"/><rect x="28" y="41" width="48" height="40" fill="${c.color}"/><rect x="22" y="53" width="60" height="16" fill="${c.color}"/><rect x="34" y="35" width="30" height="46" fill="${c.color}"/><rect x="34" y="47" width="6" height="22" fill="#ffffff33"/><rect x="40" y="57" width="6" height="6" fill="#332d35"/><rect x="64" y="57" width="6" height="6" fill="#332d35"/><rect x="52" y="69" width="12" height="6" fill="#332d35"/><rect x="46" y="69" width="6" height="6" fill="${c.color}"/><rect x="58" y="69" width="6" height="6" fill="${c.color}"/><rect x="34" y="87" width="12" height="6" fill="#493b40"/><rect x="64" y="87" width="12" height="6" fill="#493b40"/><text x="52" y="31" text-anchor="middle" font-size="28">${c.accessory}</text></svg>`;
}
const stages = ['안녕, 작은 새싹!', '물을 꿀꺽꿀꺽', '잎이 쑥쑥 자라요', '어떤 친구가 나올까요?', '조금만 더 키워 주세요', '새 친구를 만날 시간!'];
function renderFarm() {
  el('count').textContent = state.harvested;
  el('stage').textContent = stages[state.water];
  el('message').textContent = state.water === 5 ? '수확하면 30종 중 한 친구가 나타나요!' : '물을 주면 고구마가 조금씩 자라요.';
  el('percent').textContent = state.water * 20 + '%';
  el('progress').value = state.water;
  el('action').textContent = state.water === 5 ? '🍠 랜덤 수확하기' : '💧 물 주기';
  el('plant').style.transform = `scale(${.55 + state.water * .09})`;
  el('potato').style.opacity = .3 + state.water * .14;
}
function renderCollection() {
  el('collected').textContent = `${state.counts.filter(n => n > 0).length} / 30`;
  el('cards').innerHTML = characters.map(c => `<button class="card" data-character="${c.id}" ${state.counts[c.id] ? '' : 'disabled'} aria-pressed="${state.selected === c.id}">${portrait(c)}${state.counts[c.id] ? c.name : '???'}<small>${state.counts[c.id] ? `${state.counts[c.id]}마리 · ${state.selected === c.id ? '산책 중' : '선택하기'}` : '아직 만나지 못했어요'}</small></button>`).join('');
  el('walking').textContent = state.selected === null ? '함께 걸을 친구를 먼저 수확해 주세요.' : `${characters[state.selected].accessory} ${characters[state.selected].name}와 산책 중 · 도감에서 친구 변경`;
  el('empty-village').hidden = state.selected !== null;
  document.querySelectorAll('[data-dir]').forEach(b => b.disabled = state.selected === null);
}
let currentView = 'farm';
function showView(view) {
  currentView = view;
  document.querySelectorAll('.page').forEach(p => p.hidden = p.id !== view);
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === view));
  stopMovement();
  window.scrollTo(0, 0);
  if (view === 'village') drawMap();
  window.dispatchEvent(new CustomEvent('game-view', { detail: view }));
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
el('cards').addEventListener('click', event => {
  const button = event.target.closest('[data-character]');
  if (!button || !state.counts[Number(button.dataset.character)]) return;
  state.selected = Number(button.dataset.character);
  save(); renderCollection(); showView('village');
});
let animationTimer;
el('action').addEventListener('click', () => {
  if (state.water === 5) {
    const c = characters[Math.floor(Math.random() * characters.length)];
    const isNew = state.counts[c.id] === 0;
    state.counts[c.id]++; state.harvested++; state.water = 0; state.selected = c.id;
    el('reward').hidden = false;
    el('reward').innerHTML = `${portrait(c)}<strong>${isNew ? '✨ 새로운 친구!' : '💛 또 만났어요!'} ${c.name}</strong><p>${c.description}<br>지금까지 ${state.counts[c.id]}마리 수확했어요.</p><button id="visit">이 친구와 마을 산책 →</button>`;
    el('visit').addEventListener('click', () => showView('village'));
    renderCollection();
  } else {
    state.water++; el('reward').hidden = true;
    clearTimeout(animationTimer);
    el('garden').classList.remove('watering');
    void el('garden').offsetWidth;
    el('garden').classList.add('watering');
    animationTimer = setTimeout(() => el('garden').classList.remove('watering'), 500);
  }
  save(); renderFarm();
});

const canvas = el('map'), ctx = canvas.getContext('2d');
const player = { x: 320, y: 410 }, target = { x: 320, y: 410 };
const locations = [
  { x: 65, y: 85, w: 140, h: 110, color: '#ba8593', icon: '🍞', name: '고구마 빵집', text: '고구마 빵집 · 갓 구운 빵 냄새가 솔솔 나요.' },
  { x: 435, y: 85, w: 140, h: 110, color: '#88a4b3', icon: '📖', name: '작은 도서관', text: '작은 도서관 · 창가에서 책 읽기 좋은 날이에요.' },
  { x: 65, y: 455, w: 130, h: 95, color: '#d0aa76', icon: '🏡', name: '우리 집', text: '우리 집 · 산책을 마치고 쉬어 가요.' },
  { x: 445, y: 440, w: 125, h: 100, color: '#e5afbc', icon: '🌷', name: '꽃 정원', text: '꽃 정원 · 고구마 친구들을 닮은 꽃이 피었어요.' },
  { x: 450, y: 265, w: 135, h: 100, color: '#a1d1d4', icon: '🐟', name: '반짝 연못', text: '반짝 연못 · 물고기가 반갑게 인사해요.' },
  { x: 265, y: 270, w: 110, h: 100, color: '#c4d4ca', icon: '⛲', name: '분수 광장', text: '분수 광장 · 졸졸 흐르는 물소리를 들어 봐요.' },
];
function canWalk(x, y) {
  return x >= 22 && x <= 618 && y >= 30 && y <= 618 && !locations.some(l => x > l.x - 12 && x < l.x + l.w + 12 && y > l.y - 8 && y < l.y + l.h + 15);
}
function drawMap() {
  ctx.clearRect(0, 0, 640, 640);
  ctx.fillStyle = '#dce9bd'; ctx.fillRect(0, 0, 640, 640);
  ctx.fillStyle = '#eddfbc'; ctx.fillRect(225, 0, 190, 640); ctx.fillRect(0, 210, 640, 55); ctx.fillRect(0, 385, 640, 50);
  ctx.fillStyle = '#c7dba5';
  for (let i = 0; i < 65; i++) { const x = (i * 97 + 13) % 640, y = (i * 151 + 24) % 640; if (x < 220 || x > 415) ctx.fillRect(x, y, 4, 7); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const l of locations) {
    ctx.fillStyle = '#00000010'; ctx.beginPath(); ctx.roundRect(l.x + 4, l.y + 5, l.w, l.h, 18); ctx.fill();
    ctx.fillStyle = l.color; ctx.beginPath(); ctx.roundRect(l.x, l.y, l.w, l.h, 18); ctx.fill();
    ctx.font = '34px system-ui'; ctx.fillText(l.icon, l.x + l.w / 2, l.y + 35);
    ctx.fillStyle = '#394932'; ctx.font = 'bold 16px system-ui'; ctx.fillText(l.name, l.x + l.w / 2, l.y + l.h - 22);
  }
  ctx.font = '29px system-ui'; [[30,45],[600,45],[33,580],[605,580],[95,330],[155,330]].forEach(([x,y]) => ctx.fillText('🌳',x,y));
  if (state.selected === null) return;
  const c = characters[state.selected];
  ctx.fillStyle = '#00000020'; ctx.beginPath(); ctx.ellipse(player.x, player.y + 7, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c.color; ctx.beginPath(); ctx.ellipse(player.x, player.y - 14, 17, 23, .18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#493b40'; [player.x - 6, player.x + 6].forEach(x => { ctx.beginPath(); ctx.arc(x, player.y - 15, 2, 0, Math.PI * 2); ctx.fill(); });
  ctx.strokeStyle = '#493b40'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(player.x, player.y - 10, 4, 0, Math.PI); ctx.stroke();
  ctx.font = '23px system-ui'; ctx.fillText(c.accessory, player.x, player.y - 40);
  ctx.font = 'bold 13px system-ui'; ctx.fillStyle = '#394932'; ctx.fillText(c.name, player.x, player.y + 23);
}
const directions = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
const held = new Set();
let frame = null, lastTime = 0;
function stopMovement() { held.clear(); target.x = player.x; target.y = player.y; if (frame !== null) cancelAnimationFrame(frame); frame = null; lastTime = 0; }
function startMovement() { if (frame === null && currentView === 'village' && state.selected !== null) { lastTime = 0; frame = requestAnimationFrame(tick); } }
function tick(time) {
  const dt = lastTime ? Math.min((time - lastTime) / 1000, .04) : .016; lastTime = time;
  let dx = 0, dy = 0;
  if (held.size) { held.forEach(d => { dx += directions[d][0]; dy += directions[d][1]; }); target.x = player.x; target.y = player.y; }
  else { dx = target.x - player.x; dy = target.y - player.y; }
  const length = Math.hypot(dx, dy), step = Math.min(125 * dt, held.size ? Infinity : length);
  const oldX = player.x, oldY = player.y;
  if (length > .5) {
    const nx = player.x + dx / length * step, ny = player.y + dy / length * step;
    if (canWalk(nx, player.y)) player.x = nx;
    if (canWalk(player.x, ny)) player.y = ny;
  }
  const near = locations.find(l => Math.hypot(player.x - Math.max(l.x, Math.min(player.x, l.x + l.w)), player.y - Math.max(l.y, Math.min(player.y, l.y + l.h))) < 55);
  el('place').textContent = near ? near.text : '느긋하게 걸으며 마을 곳곳을 구경해 보세요.';
  drawMap();
  if (held.size || (length > 1 && (oldX !== player.x || oldY !== player.y))) frame = requestAnimationFrame(tick);
  else { frame = null; lastTime = 0; }
}
canvas.addEventListener('pointerdown', event => {
  if (state.selected === null) return;
  event.preventDefault(); canvas.focus(); held.clear();
  const r = canvas.getBoundingClientRect();
  target.x = Math.max(22, Math.min(618, (event.clientX - r.left) / r.width * 640));
  target.y = Math.max(30, Math.min(618, (event.clientY - r.top) / r.height * 640));
  startMovement();
});
document.querySelectorAll('[data-dir]').forEach(b => {
  b.addEventListener('pointerdown', event => { event.preventDefault(); b.setPointerCapture(event.pointerId); held.add(b.dataset.dir); startMovement(); });
  const release = () => held.delete(b.dataset.dir);
  b.addEventListener('pointerup', release); b.addEventListener('pointercancel', release); b.addEventListener('lostpointercapture', release);
  b.addEventListener('click', event => { if (event.detail === 0) { const [x,y] = directions[b.dataset.dir]; target.x = player.x + x * 30; target.y = player.y + y * 30; startMovement(); } });
});
const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
window.addEventListener('keydown', event => { const dir = keys[event.key]; if (!dir || currentView !== 'village' || state.selected === null) return; event.preventDefault(); held.add(dir); startMovement(); });
window.addEventListener('keyup', event => { if (keys[event.key]) held.delete(keys[event.key]); });
window.addEventListener('blur', stopMovement);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopMovement(); });
renderFarm(); renderCollection(); drawMap();
