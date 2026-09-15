// 수집 데이터는 game.js와 공유하고, 전투 강화는 매 출전마다 초기화합니다.
const upgrades = [
  { id:'power', icon:'🌰', name:'단단한 씨앗', text:'모든 공격력 +30%', apply:r => r.damage *= 1.3 },
  { id:'rapid', icon:'💨', name:'바람의 박자', text:'공격 간격 18% 감소', apply:r => r.interval *= .82 },
  { id:'multi', icon:'🌱', name:'쌍둥이 새싹', text:'대상 +1 · 선/부채는 폭 증가 · 파동/발자국은 위력 +20%', apply:r => r.multi++ },
  { id:'blast', icon:'🍯', name:'꿀 폭발', text:'탄환 주변 폭발 범위 +32', apply:r => r.splash += 32 },
  { id:'frost', icon:'❄️', name:'서리 이슬', text:'적중 시 2초 감속 · 공격력 +10%', apply:r => { r.frost = 1; r.damage *= 1.1; } },
  { id:'aura', icon:'🌿', name:'덩굴 고리', text:'주변 지속 피해 +8/초', apply:r => r.aura++ },
  { id:'chain', icon:'⚡', name:'번개 줄기', text:'가까운 추가 적 1마리에 연쇄 피해', apply:r => r.chain++ },
  { id:'range', icon:'🔭', name:'멀리 보는 잎', text:'사거리 +70 · 이동 속도 +15%', apply:r => { r.range += 70; r.speed *= 1.15; } },
  { id:'critical', icon:'⭐', name:'황금 속살', text:'치명타 확률 +20% (최대 80%)', apply:r => r.crit = Math.min(.8, r.crit + .2) },
  { id:'harvest', icon:'🌻', name:'풍년의 기운', text:'공격력 +15% · 덩굴 범위 +25', apply:r => { r.damage *= 1.15; r.auraRange += 25; } },
  { id:'clean', icon:'🍃', name:'밭 청소', text:'현재 일반 해충 절반 제거 · 공격력 +10%', apply:r => { let i=0; r.enemies.forEach(e => { if (!e.boss && i++ % 2 === 0) e.hp = 0; }); r.damage *= 1.1; } },
  { id:'focus', icon:'🎯', name:'거대 해충 사냥', text:'보스 피해 +80% · 기본 공격력 +10%', apply:r => { r.bossDamage += .8; r.damage *= 1.1; } },
];
const arena = el('arena'), paint = arena.getContext('2d');
let run = null, battleFrame = null, battleLast = 0, offered = [], dragging = false;
let selectedMap = 0;
const battleKeys = new Set();
function createRun(id) {
  const attack = attacks[id];
  const start=safeStart();
  return { id, phase:'playing', wave:1, elapsed:0, total:0, spawn:0, shot:0, enemies:[], effects:[], kills:0,
    x:start.x, y:start.y, tx:start.x, ty:start.y, damage:attack.damage,
    interval:attack.interval, speed:190, range:attack.range,
    multi:1, splash:0, frost:attack.freeze ? 1 : 0, aura:0, auraRange:90,
    impacts:[], zones:[], mines:[], cycle:0,
    chain:0, crit:0, bossDamage:1, cards:[], bossSpawned:false, rewarded:false };
}
function renderLobby() {
  const c = state.selected === null ? null : characters[state.selected];
  el('fighter').innerHTML = c ? `${portrait(c)}<strong>${c.name} · ${attacks[c.id].name}</strong><p>${attacks[c.id].text}</p><small>공격 ${attacks[c.id].damage} · 간격 ${attacks[c.id].interval}초 · 사거리 ${attacks[c.id].range}</small>` : '<p>밭에서 고구마를 수확하면 출전할 수 있어요.</p>';
  el('battle-start').disabled = !c;
  el('map-select').innerHTML = battleMaps.map(map=>`<button data-map="${map.id}" aria-pressed="${selectedMap===map.id}"><span>${map.icon}</span>${map.name}</button>`).join('');
  el('map-count').textContent = `${selectedMap+1} / ${battleMaps.length}`;
  el('map-rule').textContent = `${battleMaps[selectedMap].icon} ${battleMaps[selectedMap].name} · ${battleMaps[selectedMap].rule}`;
}
function haltBattle() {
  if (battleFrame !== null) cancelAnimationFrame(battleFrame);
  battleFrame = null; battleLast = 0; dragging = false; battleKeys.clear();
}
function scheduleBattle() { if (battleFrame === null && run?.phase === 'playing' && currentView === 'battle') battleFrame = requestAnimationFrame(battleTick); }
function startBattle() {
  if (state.selected === null) return;
  haltBattle(); activeBattleMap=battleMaps[selectedMap]; terrain=activeBattleMap.terrain; run = createRun(state.selected); run.map=selectedMap;
  el('battle-lobby').hidden = true; el('battle-result').hidden = true; el('battle-play').hidden = false;
  el('battle-overlay').hidden = true; el('battle-pause').textContent = '일시정지'; el('battle-pause').disabled = false;
  renderBuild(); renderBattle(); scheduleBattle();
}
function spawnEnemy(r, boss = false) {
  const radius=boss?25:11,candidates=[];
  for(let along=30;along<=570;along+=30) candidates.push({x:along,y:radius},{x:600-radius,y:along},{x:along,y:600-radius},{x:radius,y:along});
  const open=candidates.filter(point=>terrainWalkable(point.x,point.y,radius));
  const point=open[Math.floor(Math.random()*open.length)] || safeStart(),x=point.x,y=point.y;
  const elite=!boss && r.wave>=3 && Math.random()<.08+r.wave*.018;
  const hp=(boss ? 1050+r.wave*100 : (34+r.wave*13)*(elite?3.2:1))*activeBattleMap.hp;
  r.enemies.push({ x,y,hp,max:hp,boss,elite,slow:0,speed:(boss?23:28+Math.random()*24)*(elite?.82:1)*activeBattleMap.speed,turn:Math.random()*7 });
}
function damageEnemy(r, e, amount) { e.hp -= amount * (e.boss ? r.bossDamage : 1); }
function shoot(r) { performAttack(r); }
function updateBattle(r,dt) {
  if(r.phase !== 'playing') return;
  r.elapsed+=dt; r.total+=dt; r.spawn-=dt; r.shot-=dt;
  let dx=r.tx-r.x,dy=r.ty-r.y;
  if(battleKeys.size) { dx=0;dy=0; battleKeys.forEach(k=>{dx+=directions[k][0];dy+=directions[k][1];}); }
  const length=Math.hypot(dx,dy), step=Math.min(r.speed*dt*terrainSpeed(r.x,r.y),battleKeys.size?Infinity:length);
  if(length>.5) terrainMove(r,dx/length*step,dy/length*step);
  if(battleKeys.size) {r.tx=r.x;r.ty=r.y;}
  if(r.spawn<=0 && r.elapsed<15) {spawnEnemy(r);r.spawn=Math.max(.16,(.72-r.wave*.055)/activeBattleMap.spawn);}
  if((r.wave===4 || r.wave===8) && !r.bossSpawned) {spawnEnemy(r,true);r.bossSpawned=true;}
  for(const e of r.enemies) {
    e.slow=Math.max(0,e.slow-dt);
    const angle=Math.atan2(300-e.y,300-e.x)+Math.sin(r.total+e.turn)*1.5;
    const stride=e.speed*dt*(e.slow>0?.35:1)*terrainSpeed(e.x,e.y), radius=e.boss?25:11;
    const oldX=e.x,oldY=e.y;
    terrainMove(e,Math.cos(angle)*stride,Math.sin(angle)*stride,radius);
    if(Math.hypot(e.x-oldX,e.y-oldY)<stride*.2) terrainMove(e,Math.cos(angle+Math.PI/2)*stride,Math.sin(angle+Math.PI/2)*stride,radius);
    if(r.aura && Math.hypot(e.x-r.x,e.y-r.y)<r.auraRange && clearShot(r,e)) damageEnemy(r,e,8*r.aura*dt*r.damage/20);
  }
  if(r.shot<=0) {shoot(r);r.shot=r.interval;}
  updateAttackObjects(r,dt);
  const alive=r.enemies.filter(e=>e.hp>0);r.kills+=r.enemies.length-alive.length;r.enemies=alive;
  r.effects.forEach(f=>f.life-=dt);r.effects=r.effects.filter(f=>f.life>0);
  if(r.enemies.length>=35) {finishBattle(false);return;}
  if(r.elapsed>=15 && r.wave<8 && r.enemies.length<=20) {offerCards();return;}
  if(r.wave===8 && r.elapsed>=15 && r.enemies.length===0) finishBattle(true);
}
function battleTick(time) {
  battleFrame=null;
  if(!run || run.phase!=='playing' || currentView!=='battle') return;
  const dt=battleLast ? Math.min(.05,(time-battleLast)/1000):.016;battleLast=time;
  updateBattle(run,dt);renderBattle();scheduleBattle();
}
function offerCards() {
  run.phase='cards'; haltBattle(); el('battle-pause').disabled=true;
  const mode=attacks[run.id].mode;
  const noChain=['field','trail','mine','nova','echo','rain','lob'].includes(mode);
  const pool=upgrades.filter(c=>!(noChain && c.id==='chain') && !(mode==='trail' && c.id==='range')); offered=[];
  for(let i=0;i<3;i++) offered.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  el('battle-overlay').hidden=false;
  el('battle-overlay').innerHTML=`<h3>WAVE ${run.wave} 완료</h3><p>강화 카드 1장을 선택하세요</p><div class="upgrade-options">${offered.map((c,i)=>`<button data-upgrade="${i}"><span>${c.icon}</span><strong>${c.name}</strong><small>${c.text}</small></button>`).join('')}</div><small>강화는 이번 전투 동안 유지돼요.</small>`;
}
function selectUpgrade(index) {
  if(run?.phase!=='cards' || !offered[index]) return;
  const card=offered[index]; card.apply(run);run.cards.push(card.id);offered=[];
  run.wave++;run.elapsed=0;run.spawn=.4;run.phase='playing';
  run.bossSpawned=false;
  el('battle-overlay').hidden=true;el('battle-pause').disabled=false;renderBuild();scheduleBattle();
}
function renderBuild() {
  const counts={};run.cards.forEach(id=>counts[id]=(counts[id]||0)+1);
  const synergy=run.splash && run.chain ? '⚡ 꿀 번개 조합 활성' : run.aura && run.frost ? '❄️ 서리 덩굴 조합 활성' : '서로 다른 강화 효과를 조합해 보세요';
  el('build-list').innerHTML=`<p><strong>${attacks[run.id].name}</strong> · ${attacks[run.id].text}<br>${synergy}</p><div>${Object.entries(counts).map(([id,n])=>{const c=upgrades.find(c=>c.id===id);return `<span>${c.icon} ${c.name} ×${n}</span>`;}).join('') || '<span>아직 선택한 카드가 없어요</span>'}</div>`;
}
function pauseBattle() {
  if(run?.phase!=='playing') return;
  run.phase='paused';haltBattle();el('battle-pause').textContent='계속하기';
  el('battle-overlay').hidden=false;el('battle-overlay').innerHTML='<h3>잠시 쉬는 중</h3><p>계속하기를 누르면 전투가 이어져요.</p>';
}
function finishBattle(won, abandoned=false) {
  if(!run || run.phase==='result') return;
  run.phase='result';haltBattle();el('battle-play').hidden=true;el('battle-result').hidden=false;
  let reward='';
  if(won && !run.rewarded) {
    run.rewarded=true;const c=characters[Math.floor(Math.random()*characters.length)];state.counts[c.id]++;state.harvested++;save();renderFarm();renderCollection();
    reward=`${portrait(c)}<p>방어 보상 · <strong>${c.name}</strong> 1마리 합류!</p>`;
  }
  el('battle-result').innerHTML=`<div class="result-icon">${won?'🏆':abandoned?'🌙':'🌧️'}</div><h2>${won?'밭을 지켜냈어요!':abandoned?'마을로 돌아왔어요':'다음엔 꼭 지켜내요!'}</h2><p>${battleMaps[run.map].icon} ${battleMaps[run.map].name}<br>${run.wave}웨이브 · ${run.kills}마리 처치 · ${Math.floor(run.total)}초</p>${reward}<p class="hint">${won?'도감에서 새 친구를 만나 보세요.':'다른 카드 조합과 캐릭터로 다시 도전해 보세요.'}</p><button id="battle-again">출전 준비로</button>`;
  el('battle-again').addEventListener('click',()=>{el('battle-result').hidden=true;el('battle-lobby').hidden=false;renderLobby();});
}
function renderBattle() {
  if(!run) return;const r=run;
  paint.imageSmoothingEnabled=false;
  el('wave-label').textContent=`${activeBattleMap.icon} ${r.wave} / 8`;
  el('bug-count').textContent=`해충 ${r.enemies.length} / 35`;
  el('bug-count').classList.toggle('danger',r.enemies.length>=27);
  el('battle-time').textContent=r.phase==='cards'?'카드 선택':r.elapsed<15?`${Math.ceil(15-r.elapsed)}초`: '해충 정리!';
  paint.fillStyle='#172b2a';paint.fillRect(0,0,600,600);
  paint.strokeStyle='#28413a';paint.lineWidth=1;
  for(let x=25;x<600;x+=50){paint.beginPath();paint.moveTo(x,0);paint.lineTo(x,600);paint.stroke();}
  for(let y=25;y<600;y+=50){paint.beginPath();paint.moveTo(0,y);paint.lineTo(600,y);paint.stroke();}
  paint.fillStyle='#355043';for(let i=0;i<36;i++){paint.beginPath();paint.ellipse(35+(i%6)*105,40+Math.floor(i/6)*103,4,9,.5,0,Math.PI*2);paint.fill();}
  drawTerrain(paint);
  for(const z of r.zones){paint.fillStyle=z.freeze?'#8bd3f14a':'#d6a06155';paint.beginPath();paint.arc(z.x,z.y,z.radius+r.splash,0,Math.PI*2);paint.fill();}
  for(const m of r.mines){paint.fillStyle='#eac78b';paint.beginPath();paint.arc(m.x,m.y,9,0,Math.PI*2);paint.fill();}
  for(const p of r.impacts){if(!p.airborne)continue;paint.strokeStyle='#f8d997';paint.beginPath();paint.arc(p.x,p.y,Math.max(5,p.radius*(1-p.delay/.5)),0,Math.PI*2);paint.stroke();paint.fillStyle='#f8d997';paint.beginPath();paint.arc(p.x,p.y-p.delay*90,5,0,Math.PI*2);paint.fill();}
  if(attacks[r.id].mode==='orbit'){for(let i=0;i<3+r.multi-1;i++){const a=r.total*2+i*Math.PI*2/(3+r.multi-1);paint.fillStyle='#eea5c5';paint.beginPath();paint.arc(r.x+Math.cos(a)*75,r.y+Math.sin(a)*75,9,0,Math.PI*2);paint.fill();}}
  if(r.aura){paint.fillStyle='#9dcf6b20';paint.strokeStyle='#9dcf6b70';paint.beginPath();paint.arc(r.x,r.y,r.auraRange,0,Math.PI*2);paint.fill();paint.stroke();}
  for(const e of r.enemies){
    paint.fillStyle=e.slow?'#91ccdc':e.boss?'#d486a5':e.elite?'#e09a56':'#cfac78';paint.beginPath();paint.ellipse(e.x,e.y,e.boss?24:e.elite?15:10,e.boss?29:e.elite?18:13,.3,0,Math.PI*2);paint.fill();
    paint.fillStyle='#22352d';paint.fillRect(e.x-5,e.y-4,3,3);paint.fillRect(e.x+3,e.y-4,3,3);
    if(e.boss){paint.fillStyle='#633c50';paint.fillRect(e.x-30,e.y-40,60,5);paint.fillStyle='#eeb8cf';paint.fillRect(e.x-30,e.y-40,60*Math.max(0,e.hp/e.max),5);}
  }
  for(const f of r.effects){paint.strokeStyle=f.color;paint.fillStyle=f.color;paint.lineWidth=3;paint.beginPath();if(f.radius){if(f.angle!==undefined){paint.moveTo(f.x,f.y);paint.arc(f.x,f.y,f.radius,f.angle-f.width,f.angle+f.width);paint.closePath();}else paint.arc(f.x,f.y,f.radius,0,Math.PI*2);paint.fill();}else{paint.moveTo(f.x,f.y);paint.lineTo(f.ex,f.ey);paint.stroke();}}
  const c=characters[r.id],px=Math.round(r.x/4)*4,py=Math.round(r.y/4)*4;
  paint.fillStyle='#302936';paint.fillRect(px-16,py-20,32,44);paint.fillRect(px-20,py-12,40,28);
  paint.fillStyle=c.color;paint.fillRect(px-12,py-16,24,36);paint.fillRect(px-16,py-8,32,20);
  paint.fillStyle='#2c2830';paint.fillRect(px-8,py-4,4,4);paint.fillRect(px+6,py-4,4,4);paint.fillRect(px-2,py+6,8,4);
  paint.textAlign='center';paint.font='20px monospace';paint.fillText(c.accessory,px,py-22);
}
el('battle-start').addEventListener('click',startBattle);
el('map-select').addEventListener('click',event=>{const button=event.target.closest('[data-map]');if(!button)return;selectedMap=Number(button.dataset.map);renderLobby();});
el('battle-exit').addEventListener('click',()=>finishBattle(false,true));
el('battle-pause').addEventListener('click',()=>{if(run?.phase==='paused'){run.phase='playing';el('battle-overlay').hidden=true;el('battle-pause').textContent='일시정지';scheduleBattle();}else pauseBattle();});
el('battle-overlay').addEventListener('click',event=>{const b=event.target.closest('[data-upgrade]');if(b)selectUpgrade(Number(b.dataset.upgrade));});
function aim(event){if(run?.phase!=='playing')return;const rect=arena.getBoundingClientRect();run.tx=Math.max(20,Math.min(580,(event.clientX-rect.left)/rect.width*600));run.ty=Math.max(25,Math.min(580,(event.clientY-rect.top)/rect.height*600));}
arena.addEventListener('pointerdown',event=>{event.preventDefault();arena.setPointerCapture(event.pointerId);arena.focus();dragging=true;aim(event);});
arena.addEventListener('pointermove',event=>{if(dragging)aim(event);});
arena.addEventListener('pointerup',()=>dragging=false);arena.addEventListener('pointercancel',()=>dragging=false);
window.addEventListener('keydown',event=>{if(currentView==='battle' && run?.phase==='playing' && keys[event.key]){event.preventDefault();battleKeys.add(keys[event.key]);}});
window.addEventListener('keyup',event=>battleKeys.delete(keys[event.key]));
window.addEventListener('game-view',event=>{if(event.detail!=='battle')pauseBattle();else renderLobby();});
window.addEventListener('blur',pauseBattle);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseBattle();});
renderLobby();
