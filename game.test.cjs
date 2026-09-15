const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(`${__dirname}/game.js`, 'utf8');
function boot(storage = {}) {
  const nodes = {};
  const context = {
    document: { getElementById(id) { return nodes[id] ||= { style: {}, classList: { add() {}, remove() {}, toggle() {} }, addEventListener(type, fn) { this[type] = fn; }, getContext() { return new Proxy({}, { get: () => () => {} }); } }; }, querySelectorAll() { return []; }, addEventListener() {} },
    window: { addEventListener() {}, scrollTo() {}, dispatchEvent() {} },
    localStorage: { getItem: key => storage[key] || null, setItem: (key, value) => storage[key] = value },
    CustomEvent: class {}, setTimeout() {}, clearTimeout() {}, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {},
  };
  vm.createContext(context); vm.runInContext(source, context);
  return { nodes, run: code => vm.runInContext(code, context), storage };
}
const game = boot();
assert.equal(game.run('characters.length'), 30);
assert.equal(game.run('new Set(characters.map(c => c.name)).size'), 30);
// 각 확률 구간을 순서대로 선택해 30종 모두 실제 수확 경로로 검증합니다.
for (let id = 0; id < 30; id++) {
  game.run(`Math.random = () => (${id} + .5) / 30`);
  for (let click = 0; click < 6; click++) game.nodes.action.click();
  assert.equal(game.run('state.selected'), id);
  assert.equal(game.run('state.water'), 0);
}
assert.equal(game.run('state.counts.filter(n => n === 1).length'), 30);
for (let i = 0; i < 6; i++) game.nodes.action.click();
assert.equal(game.run('state.counts[29]'), 2);
const reload = boot(game.storage);
assert.equal(reload.run('state.harvested'), 31);
assert.equal(reload.run('state.selected'), 29);
assert.equal(reload.run('state.counts[29]'), 2);
const legacy = boot({ 'little-sweet-potato-v1': JSON.stringify({ water: 3, harvested: 8 }) });
assert.equal(legacy.run('state.water'), 3);
assert.equal(legacy.run('state.counts[0]'), 8);
assert.equal(game.run('canWalk(320, 410)'), true);
assert.equal(game.run('canWalk(320, 310)'), false);
assert.equal(game.run('canWalk(500, 300)'), false);
assert.equal(game.run('canWalk(-1, 410)'), false);
game.run("currentView = 'village'; held.add('right'); tick(100); tick(140)");
assert.ok(game.run('player.x > 320'));
game.run("stopMovement(); player.x = 320; player.y = 390; held.add('up'); for(let i=0;i<100;i++) tick(200 + i*16)");
assert.ok(game.run('player.y >= 385'));
game.run('stopMovement()');
assert.equal(game.run('held.size'), 0);
console.log('PASS: 30 characters, random harvest intervals, duplicates, reload, legacy save, movement, collisions and stop.');

const battle = boot();
battle.run(fs.readFileSync(__dirname + '/tactics.js', 'utf8'));
battle.run(fs.readFileSync(__dirname + '/battle.js', 'utf8'));
battle.run('state.selected=0; currentView="battle"; startBattle()');
assert.equal(battle.run('upgrades.length'), 12);
battle.run('updateBattle(run,15)');
assert.equal(battle.run('run.phase'), 'cards');
assert.equal(battle.run('new Set(offered.map(c=>c.id)).size'),3);
battle.run('selectUpgrade(0)');
assert.equal(battle.run('run.wave'),2);
battle.run('pauseBattle(); updateBattle(run,5)');
assert.equal(battle.run('run.elapsed'),0);
battle.run('startBattle(); run.enemies=Array.from({length:35},()=>({x:0,y:0,hp:9999,speed:0,turn:0,slow:0})); updateBattle(run,.01)');
assert.equal(battle.run('run.phase'),'result');
assert.equal(battle.run('state.harvested'),0);
battle.run('startBattle(); run.wave=8;run.elapsed=15;run.spawn=999;run.bossSpawned=true;updateBattle(run,.01);finishBattle(true)');
assert.equal(battle.run('state.harvested'),1);
assert.equal(battle.run('state.counts.reduce((a,b)=>a+b,0)'),1);
for(let id=0;id<30;id++) {
 battle.run('state.selected='+id+';startBattle()');
 for(let i=0;i<14000 && battle.run('run.phase')!=='result';i++) {
  if(battle.run('run.phase')==='cards') battle.run('selectUpgrade(0)');
  battle.run('updateBattle(run,.025)');
 }
 assert.ok(battle.run('Number.isFinite(run.x) && Number.isFinite(run.y)'));
}
console.log('PASS: card choices, wave advance, pause, defeat, victory reward once, 30-character full-run simulations');

assert.equal(battle.run('attacks.length'),30);
assert.equal(battle.run('new Set(attacks.map(a=>a.name)).size'),30);
assert.equal(battle.run('terrainWalkable(180,200)'),false);
assert.equal(battle.run('terrainWalkable(430,180)'),false);
assert.equal(battle.run('terrainSpeed(270,140)'),.55);
assert.equal(battle.run('clearShot({x:120,y:200},{x:250,y:200})'),false);
assert.equal(battle.run('clearShot({x:350,y:185},{x:525,y:185})'),true);
battle.run('let mover={x:100,y:200};terrainMove(mover,180,0)');
assert.ok(battle.run('mover.x<135'));
// 바위 반대편 적: 저격은 차단되고 곡사는 도착한 지점에 피해를 줍니다.
battle.run('let enemy={x:250,y:200,hp:500,max:500,slow:0};let ranged=createRun(0);ranged.x=120;ranged.y=200;ranged.enemies=[enemy];performAttack(ranged)');
assert.equal(battle.run('enemy.hp'),500);
battle.run('ranged=createRun(1);ranged.x=120;ranged.y=200;ranged.enemies=[enemy];performAttack(ranged)');
assert.equal(battle.run('ranged.impacts.length'),1);
assert.equal(battle.run('enemy.hp'),500);
battle.run('updateAttackObjects(ranged,.6)');
assert.ok(battle.run('enemy.hp<500'));
// 폭발 피해도 바위 반대편으로 번지지 않습니다.
battle.run('enemy.hp=500;blastHit(ranged,{x:120,y:200},200,100)');
assert.equal(battle.run('enemy.hp'),500);
// 각 공격이 개활지의 적에게 피해를 줄 수 있는지 확인합니다.
for(let id=0;id<30;id++) {
 battle.run('let probe'+id+'=createRun('+id+');probe'+id+'.enemies=Array.from({length:8},(_,i)=>({x:300+Math.cos(i*Math.PI/4)*'+(id===27?30:65)+',y:300+Math.sin(i*Math.PI/4)*'+(id===27?30:65)+',hp:10000,max:10000,slow:0}));performAttack(probe'+id+');updateAttackObjects(probe'+id+',.6)');
 assert.ok(battle.run('probe'+id+'.enemies.some(e=>e.hp<10000)'), 'Attack '+id+' must deal damage');
}
console.log('PASS: rock and water collision, brush slowdown, blocked sight, delayed lob over rock, explosion occlusion, all 30 attack damage patterns');
assert.equal(battle.run('battleMaps.length'),12);
assert.equal(battle.run('new Set(battleMaps.map(m=>m.name)).size'),12);
assert.equal(battle.run('new Set(battleMaps.map(m=>JSON.stringify(m.terrain))).size'),12);
for(let map=0;map<12;map++) {
  battle.run(`selectedMap=${map};activeBattleMap=battleMaps[selectedMap];terrain=activeBattleMap.terrain`);
  assert.equal(battle.run('terrainWalkable(safeStart().x,safeStart().y)'),true,`Map ${map} start must be walkable`);
  assert.ok(battle.run('[[300,20],[580,300],[300,580],[20,300]].some(([x,y])=>terrainWalkable(x,y,11))'),`Map ${map} needs an open edge spawn`);
}
battle.run('selectedMap=11;state.selected=0;currentView="battle";startBattle();spawnEnemy(run);spawnEnemy(run,true)');
assert.equal(battle.run('run.map'),11);
assert.ok(battle.run('run.enemies[0].max > 47'));
assert.ok(battle.run('run.enemies[1].max >= 1380'));
assert.ok(battle.run('run.enemies.every(e=>terrainWalkable(e.x,e.y,e.boss?25:11))'));
console.log('PASS: 12 unique maps, safe starts, open spawns, hardest-map health scaling and valid enemy placement');
