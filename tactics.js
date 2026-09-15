// 공격은 형태·발사 주기·대상 선택·지속 효과를 조합합니다. id는 도감 순서입니다.
const attacks = [
  {name:'밤톨 저격',mode:'shot',damage:54,interval:1.05,range:340,text:'멀리 있는 적부터 강한 단발 사격'},
  {name:'꿀 항아리',mode:'lob',damage:30,interval:1.3,range:260,radius:62,text:'바위 너머 곡사 폭탄 · 착탄 지점 폭발'},
  {name:'리본 부채',mode:'cone',damage:22,interval:.8,range:160,width:.9,text:'넓은 부채꼴 안의 모든 적 공격'},
  {name:'군불 장판',mode:'field',damage:16,interval:1.8,range:230,radius:62,duration:3,text:'곡사 불씨로 3초 화염 지대 생성'},
  {name:'새싹 관통',mode:'line',damage:30,interval:.85,range:290,width:13,text:'일직선의 적을 관통 · 바위에는 차단'},
  {name:'딸기 삼연발',mode:'burst',damage:15,interval:.9,range:230,shots:3,text:'한 적에게 씨앗 3발을 연속 발사'},
  {name:'구름 소나기',mode:'rain',damage:16,interval:1.5,range:300,radius:42,shots:3,text:'서로 다른 적 위에 곡사 물방울 3개'},
  {name:'달빛 회수',mode:'return',damage:25,interval:1.2,range:245,text:'왕복 궤도로 나갈 때와 돌아올 때 공격'},
  {name:'햇살 파동',mode:'nova',damage:24,interval:1.1,range:130,text:'자신 주위 360도 파동 · 바위 뒤는 보호'},
  {name:'눈송이 부채',mode:'cone',damage:17,interval:.9,range:190,width:.6,freeze:true,text:'좁고 긴 부채꼴 공격 · 2초 감속'},
  {name:'왕관 포격',mode:'lob',damage:72,interval:2.1,range:330,radius:38,text:'체력이 가장 높은 적에게 고위력 곡사'},
  {name:'마법 번개',mode:'chain',damage:26,interval:1.1,range:240,jumps:3,text:'최대 4마리 연결 · 바위가 연결 차단'},
  {name:'해적 산탄',mode:'cone',damage:42,interval:1.2,range:125,width:1.2,text:'근거리 초광각 산탄 · 접근할수록 유리'},
  {name:'뜨거운 프라이팬',mode:'nova',damage:48,interval:1,range:85,text:'짧은 거리 전방위 강타'},
  {name:'물감 웅덩이',mode:'field',damage:9,interval:1.6,range:260,radius:78,duration:4,freeze:true,text:'바위 너머 감속 물감 지대 · 4초 지속'},
  {name:'음표 메아리',mode:'echo',damage:19,interval:1.4,range:210,radius:85,text:'대상 중심 원형 음파가 두 번 울려요'},
  {name:'책갈피 레이저',mode:'line',damage:48,interval:1.5,range:390,width:7,text:'아주 길고 가느다란 직선 관통'},
  {name:'탐험가 덫',mode:'mine',damage:70,interval:1.7,range:250,radius:70,text:'가까운 적 방향에 덫 · 접근하면 폭발'},
  {name:'우주 유성',mode:'rain',damage:38,interval:2.2,range:390,radius:48,shots:2,text:'먼 적 두 곳에 강한 곡사 유성'},
  {name:'별빛 십자',mode:'cross',damage:29,interval:.9,range:230,width:18,text:'가로·세로 십자 방향으로 관통 공격'},
  {name:'꽃잎 고리',mode:'orbit',damage:18,interval:.4,range:100,petals:3,text:'꽃잎 3개가 몸 주위를 회전하며 타격'},
  {name:'버섯 포자',mode:'field',damage:12,interval:2,range:155,radius:95,duration:5,text:'넓고 오래가는 곡사 포자 지대'},
  {name:'개구리 물폭탄',mode:'lob',damage:24,interval:.95,range:210,radius:55,freeze:true,text:'곡사 물폭탄 · 폭발 범위 안 적 감속'},
  {name:'냥냥 발톱',mode:'cone',damage:23,interval:.35,range:92,width:.7,text:'가까운 적을 빠르게 연속 할퀴기'},
  {name:'멍멍 충격파',mode:'line',damage:36,interval:1.1,range:200,width:42,text:'넓은 직선 충격파로 한 줄의 적 타격'},
  {name:'토끼 쌍탄',mode:'burst',damage:21,interval:.6,range:200,shots:2,text:'두 발씩 빠르게 쏘는 쌍탄'},
  {name:'당근 창',mode:'line',damage:65,interval:1.6,range:320,width:22,text:'두꺼운 관통 창 · 바위는 뚫지 못해요'},
  {name:'민트 발자국',mode:'trail',damage:20,interval:.55,range:170,radius:45,duration:3,freeze:true,text:'이동 경로에 감속 향기 · 멈추면 제자리 생성'},
  {name:'초코 덫',mode:'mine',damage:42,interval:1,range:180,radius:90,freeze:true,text:'넓은 초코 덫 · 폭발하며 적 감속'},
  {name:'무지개 변주',mode:'prism',damage:30,interval:.9,range:250,radius:50,width:.7,text:'직선 → 부채꼴 → 곡사 공격을 순서대로 사용'},
];
const battleMaps = [
  {name:'초록 사잇길',icon:'🌱',rule:'기본 지형',hp:1,spawn:1,speed:1,terrain:[['rock',150,150,65,110],['rock',375,355,80,65],['water',370,140,125,90],['water',100,405,125,65],['brush',240,90,85,100],['brush',240,385,80,120]]},
  {name:'쌍둥이 연못',icon:'💧',rule:'해충 체력 +8%',hp:1.08,spawn:1,speed:1,terrain:[['water',85,160,155,95],['water',360,345,155,95],['rock',275,75,55,115],['rock',275,410,55,115],['brush',90,350,110,85],['brush',400,165,110,85]]},
  {name:'돌담 미로',icon:'🪨',rule:'해충 생성 +8%',hp:1,spawn:1.08,speed:1,terrain:[['rock',95,115,55,230],['rock',220,255,160,55],['rock',450,255,55,230],['water',185,85,95,70],['water',320,445,95,70],['brush',175,355,80,95]]},
  {name:'억새 평원',icon:'🌾',rule:'수풀 감속 강화',hp:1,spawn:1.04,speed:1,brush:.42,terrain:[['brush',70,90,150,120],['brush',380,90,150,120],['brush',70,390,150,120],['brush',380,390,150,120],['rock',275,90,50,95],['water',270,415,60,100]]},
  {name:'메마른 밭',icon:'☀️',rule:'해충 이동 +15%',hp:1,spawn:1.04,speed:1.15,terrain:[['rock',115,150,105,60],['rock',380,390,105,60],['rock',260,70,80,75],['rock',260,455,80,75],['brush',80,350,120,65],['brush',400,185,120,65]]},
  {name:'비밀 정원',icon:'🌿',rule:'해충 체력·이동 +8%',hp:1.08,spawn:1,speed:1.08,terrain:[['brush',65,65,130,115],['brush',405,65,130,115],['brush',65,420,130,115],['brush',405,420,130,115],['rock',230,230,55,140],['water',330,230,55,140]]},
  {name:'물길 교차로',icon:'🌊',rule:'해충 생성 +12%',hp:1,spawn:1.12,speed:1,terrain:[['water',80,270,175,60],['water',345,270,175,60],['water',270,80,60,175],['water',270,345,60,175],['rock',110,105,70,70],['rock',420,425,70,70]]},
  {name:'바위 협곡',icon:'⛰️',rule:'해충 체력 +15%',hp:1.15,spawn:1,speed:1,terrain:[['rock',90,125,95,350],['rock',415,125,95,350],['brush',210,80,180,65],['brush',210,455,180,65],['water',255,190,90,55],['water',255,355,90,55]]},
  {name:'나선 농원',icon:'🌀',rule:'해충 이동 +18%',hp:1.05,spawn:1,speed:1.18,terrain:[['rock',95,90,330,45],['rock',380,135,45,240],['rock',175,330,205,45],['rock',175,205,45,125],['water',470,430,75,75],['brush',65,410,90,110]]},
  {name:'네잎 분지',icon:'🍀',rule:'해충 체력 +10%·생성 +8%',hp:1.1,spawn:1.08,speed:1,terrain:[['brush',70,70,145,145],['brush',385,70,145,145],['brush',70,385,145,145],['brush',385,385,145,145],['rock',270,65,60,125],['water',265,410,70,125]]},
  {name:'달빛 습지',icon:'🌙',rule:'해충 이동 +12%·수풀 감속 강화',hp:1.06,spawn:1.06,speed:1.12,brush:.4,terrain:[['water',75,120,170,115],['water',355,365,170,115],['brush',350,75,165,115],['brush',85,405,165,115],['rock',265,150,70,70],['rock',265,380,70,70]]},
  {name:'왕의 요새',icon:'👑',rule:'해충 체력 +20%·생성 +15%',hp:1.2,spawn:1.15,speed:1.08,terrain:[['rock',70,80,210,55],['rock',320,80,210,55],['rock',70,465,210,55],['rock',320,465,210,55],['rock',70,135,55,130],['rock',475,335,55,130],['water',80,330,115,80],['brush',405,190,110,85]]},
].map((map,id)=>({...map,id,terrain:map.terrain.map(([type,x,y,w,h])=>({type,x,y,w,h}))}));
let terrain = battleMaps[0].terrain;
let activeBattleMap = battleMaps[0];
function insideTerrain(x,y,t,pad=0) { return x>t.x-pad && x<t.x+t.w+pad && y>t.y-pad && y<t.y+t.h+pad; }
function terrainWalkable(x,y,radius=16) {
  return x>=radius && x<=600-radius && y>=radius && y<=600-radius && !terrain.some(t=>t.type!=='brush' && insideTerrain(x,y,t,radius));
}
function safeStart() {
  if(terrainWalkable(300,300)) return {x:300,y:300};
  for(let radius=40;radius<=240;radius+=40) for(let angle=0;angle<Math.PI*2;angle+=Math.PI/8) {
    const point={x:Math.round(300+Math.cos(angle)*radius),y:Math.round(300+Math.sin(angle)*radius)};
    if(terrainWalkable(point.x,point.y)) return point;
  }
  return {x:300,y:300};
}
function terrainSpeed(x,y) { return terrain.some(t=>t.type==='brush' && insideTerrain(x,y,t)) ? (activeBattleMap.brush || .55) : 1; }
function clearShot(a,b) {
  const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/3));
  for(let i=0;i<=steps;i++) if(terrain.some(t=>t.type==='rock' && insideTerrain(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,t,2))) return false;
  return true;
}
function terrainMove(body,dx,dy,radius=16) {
  // 이동을 작은 간격으로 나눠 프레임이 느려져도 장애물을 통과하지 않게 합니다.
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/5));
  for(let i=0;i<steps;i++) {
    if(terrainWalkable(body.x+dx/steps,body.y,radius)) body.x+=dx/steps;
    if(terrainWalkable(body.x,body.y+dy/steps,radius)) body.y+=dy/steps;
  }
}
function drawTerrain(ctx) {
  for(const t of terrain) {
    ctx.fillStyle=t.type==='rock'?'#78847d':t.type==='water'?'#306c82':'#476d45';
    ctx.fillRect(t.x,t.y,t.w,t.h);
    ctx.strokeStyle=t.type==='water'?'#83b6c2':'#afbe8a';ctx.lineWidth=2;
    for(let y=t.y+16;y<t.y+t.h-8;y+=20) {ctx.beginPath();ctx.moveTo(t.x+12,y);ctx.lineTo(t.x+t.w-12,y+(t.type==='water'?0:5));ctx.stroke();}
    ctx.fillStyle='#eaf0dd';ctx.font='12px system-ui';ctx.textAlign='center';ctx.fillText(t.type==='rock'?'바위':t.type==='water'?'연못':'수풀',t.x+t.w/2,t.y+t.h/2+4);
  }
}
function attackHit(r,e,amount,origin=r,freeze=false) {
  damageEnemy(r,e,amount);if(freeze || r.frost)e.slow=2;
  if(r.splash) blastHit(r,e,r.splash,amount*.65,false,e);
  const chained=r.enemies.filter(o=>o!==e && o.hp>0 && Math.hypot(o.x-e.x,o.y-e.y)<150 && clearShot(e,o)).slice(0,r.chain);
  chained.forEach(o=>{damageEnemy(r,o,amount*.7);r.effects.push({x:e.x,y:e.y,ex:o.x,ey:o.y,life:.25,color:'#9de9fa'});});
}
function blastHit(r,point,radius,damage,freeze=false,exclude=null) {
  r.enemies.forEach(e=>{if(e!==exclude && e.hp>0 && Math.hypot(e.x-point.x,e.y-point.y)<radius && clearShot(point,e)){damageEnemy(r,e,damage);if(freeze || r.frost)e.slow=2;}});
  r.effects.push({x:point.x,y:point.y,radius,life:.35,color:freeze?'#a1e3f655':'#ffcc8055'});
}
function queueImpact(r,e,damage,delay,options={}) {r.impacts.push({x:e.x,y:e.y,damage,delay,...options});}
function performAttack(r) {
  const a=attacks[r.id];
  let mode=a.mode;if(mode==='prism')mode=['line','cone','lob'][r.cycle++%3];
  const airborne=['lob','rain','field'].includes(mode);
  let targets=r.enemies.filter(e=>e.hp>0 && Math.hypot(e.x-r.x,e.y-r.y)<r.range && (airborne || clearShot(r,e)));
  targets.sort((u,v)=>Math.hypot(u.x-r.x,u.y-r.y)-Math.hypot(v.x-r.x,v.y-r.y));
  if(r.id===0 || r.id===18)targets.reverse();if(r.id===10)targets.sort((u,v)=>v.hp-u.hp);
  const power=r.damage*(Math.random()<r.crit?2:1), main=targets[0];
  if(mode==='trail') {r.zones.push({x:r.x,y:r.y,radius:a.radius,life:a.duration,damage:power*(1+.2*(r.multi-1)),freeze:true});return;}
  if(mode==='orbit') {
    for(let i=0;i<a.petals+r.multi-1;i++) {
      const angle=r.total*2+i*Math.PI*2/(a.petals+r.multi-1),p={x:r.x+Math.cos(angle)*75,y:r.y+Math.sin(angle)*75};
      targets.filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<40).forEach(e=>attackHit(r,e,power,r));
    }return;
  }
  if(!main)return;
  const selected=targets.slice(0,r.multi+(mode==='rain'?(a.shots-1):0));
  if(['lob','rain','field'].includes(mode)) {
    selected.forEach(e=>queueImpact(r,e,power,.5,{radius:a.radius||50,field:mode==='field',duration:a.duration,freeze:a.freeze,airborne:true,fromX:r.x,fromY:r.y}));return;
  }
  if(mode==='mine') {
    selected.forEach(e=>{const d=Math.hypot(e.x-r.x,e.y-r.y),k=Math.min(1,65/d);r.mines.push({x:r.x+(e.x-r.x)*k,y:r.y+(e.y-r.y)*k,radius:a.radius,damage:power,life:7,freeze:a.freeze});});return;
  }
  if(mode==='nova') {blastHit(r,r,r.range+r.splash,power*(1+(r.multi-1)*.2));return;}
  if(mode==='cross') {
    const width=(a.width||18)+8*(r.multi-1);
    targets.filter(e=>Math.abs(e.x-r.x)<width || Math.abs(e.y-r.y)<width).forEach(e=>attackHit(r,e,power));
    for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])beamEffect(r,{x:r.x+dx*r.range,y:r.y+dy*r.range},'#fde0a3');return;
  }
  if(mode==='chain') {
    let origin=r;const hit=new Set();
    for(let i=0;i<(a.jumps||0)+r.multi;i++) {
      const next=targets.find(e=>!hit.has(e) && Math.hypot(e.x-origin.x,e.y-origin.y)<(i?150:r.range) && clearShot(origin,e));if(!next)break;
      attackHit(r,next,power*Math.pow(.85,i),origin);r.effects.push({x:origin.x,y:origin.y,ex:next.x,ey:next.y,life:.3,color:'#bca3ff'});hit.add(next);origin=next;
    }return;
  }
  if(mode==='cone' || mode==='line') {
    const angle=Math.atan2(main.y-r.y,main.x-r.x),width=a.width||15;
    targets.forEach(e=>{
      const dx=e.x-r.x,dy=e.y-r.y,forward=dx*Math.cos(angle)+dy*Math.sin(angle),side=Math.abs(-dx*Math.sin(angle)+dy*Math.cos(angle));
      if(forward>0 && (mode==='cone'?Math.atan2(side,forward)<width+.08*(r.multi-1):side<width+5*(r.multi-1)))attackHit(r,e,power,r,a.freeze);
    });
    if(mode==='cone')r.effects.push({x:r.x,y:r.y,radius:r.range,angle,width,life:.3,color:a.freeze?'#92daef55':'#e8b6d055'});
    else beamEffect(r,{x:r.x+Math.cos(angle)*r.range,y:r.y+Math.sin(angle)*r.range},'#e8ed9b');return;
  }
  selected.forEach(e=>{
    if(mode==='echo'){blastHit(r,e,a.radius+r.splash,power);queueImpact(r,e,power,.45,{radius:a.radius,fromX:r.x,fromY:r.y});return;}
    attackHit(r,e,power);beamEffect(r,e,'#f6d77b');
    if(mode==='burst')for(let i=1;i<a.shots;i++)queueImpact(r,e,power,.12*i,{target:e,fromX:r.x,fromY:r.y});
    if(mode==='return')queueImpact(r,e,power,.4,{target:e,fromX:r.x,fromY:r.y,returning:true});
  });
}
function beamEffect(r,to,color) {
  const d=Math.hypot(to.x-r.x,to.y-r.y);let end={x:r.x,y:r.y};
  for(let n=0;n<=d;n+=3){const p={x:r.x+(to.x-r.x)*n/(d||1),y:r.y+(to.y-r.y)*n/(d||1)};if(!clearShot(end,p))break;end=p;}
  r.effects.push({x:r.x,y:r.y,ex:end.x,ey:end.y,life:.24,color});
}
function updateAttackObjects(r,dt) {
  for(const p of r.impacts) {
    p.delay-=dt;if(p.delay>0)continue;
    const from={x:p.fromX,y:p.fromY};
    if(p.target){if(p.target.hp>0 && clearShot(from,p.target)){attackHit(r,p.target,p.damage);r.effects.push({x:p.target.x,y:p.target.y,ex:from.x,ey:from.y,life:.2,color:'#dfb8ed'});}}
    else if(p.airborne || clearShot(from,p)) {
      if(p.field)r.zones.push({x:p.x,y:p.y,radius:p.radius,life:p.duration,damage:p.damage,freeze:p.freeze});
      else {blastHit(r,p,p.radius+r.splash,p.damage,p.freeze);if(r.chain){const e=r.enemies.find(e=>e.hp>0 && Math.hypot(e.x-p.x,e.y-p.y)<p.radius);if(e)attackHit(r,e,0);}}
    }
  }
  r.impacts=r.impacts.filter(p=>p.delay>0);
  for(const m of r.mines){m.life-=dt;if(r.enemies.some(e=>e.hp>0 && Math.hypot(e.x-m.x,e.y-m.y)<45 && clearShot(m,e))){blastHit(r,m,m.radius+r.splash,m.damage,m.freeze);m.life=0;}}
  r.mines=r.mines.filter(m=>m.life>0);
  for(const z of r.zones){z.life-=dt;r.enemies.forEach(e=>{if(e.hp>0 && Math.hypot(e.x-z.x,e.y-z.y)<z.radius+r.splash && clearShot(z,e)){damageEnemy(r,e,z.damage*dt);if(z.freeze||r.frost)e.slow=2;}});}
  r.zones=r.zones.filter(z=>z.life>0);
}
