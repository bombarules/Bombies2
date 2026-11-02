/* ================= Dr. Hale: lead chemical engineer, creator of the Bombies, voice on the intercom =================
   Never fights directly. Taunts the squad, triggers mutation surges, releases special infected after a wave is cleared,
   and finally unleashes his Colossus at the power station core (Dead Zone round 4). */
const HALE={next:0,said:{},busy:false};
const HALE_LINES={
  intro:['Ah. New test subjects. Welcome to my facility.','Subjects detected in the garage. Beginning trial one. Do try to last longer than the others.'],
  wave:['Wave {n}. My children are learning. Are you?','Still breathing? Fascinating. I\u2019ll adjust the dosage.','Every Bombie you put down teaches the rest how you fight.','I can hear your heartbeat on the intercom. It\u2019s racing.','You can\u2019t win this. You can only be measured.'],
  jessa:['Still swinging that wrench, Jessa? You always did fix things the hard way.','Jessa. You kept this site running for years. Now it keeps you.','Your foreman can\u2019t hold you together forever.'],
  dz:['The water slows you down. Not them.','Round {n}. The mutation rate is climbing nicely.'],
  release:['Cleared the room? How adorable. Releasing the next batch.','You thought that was the end of the wave? I\u2019m only warming up.','A little surprise from the lab. Fresh out of the vats.'],
  mutate:['Increasing mutation rate. Let\u2019s see what they become.','Accelerating the mutagen. Watch closely, this is the interesting part.'],
  tank:['Meet one of my finer works. Armor fused to living tissue.'],
  spitter:['Careful with the glowing ones. They\u2019re\u2026 volatile.'],
  low:['Your vitals are dropping. Don\u2019t stop now, the data is excellent.'],
  over:['Another failed subject. Send in the next one.','Disappointing. Someone clean up what\u2019s left of them.'],
  won:['You survived my Colossus. Impressive. I\u2019ll simply have to build a bigger one.'],
  core:['You\u2019ve reached the power station core. My life\u2019s work is waiting for you.'],
  boss66:['Feel that? It\u2019s adapting to your weapons.'],boss33:['Go on, push it harder. I\u2019m taking notes.'],
  stun:['Stop leading it into the live cables!','No, no, no, not the water!'],coreDown:['That generator was irreplaceable!']};
/* ---- Hale's body: tattered lab coat, round glasses, slicked gray hair, glowing mutated prosthetic arm, flask of mutagen ---- */
function buildHale(){const look={skin:[0.7,0.6,0.52],hair:[0.42,0.41,0.39],gray:0.7,age:0.85,slick:true,stubble:0.3,seed:51,iris:[0.3,0.33,0.3],glasses:true,beard:false,smile:false,hi:true,
    shirt:{kind:'office',base:[0.1,0.14,0.1],tie:[0.05,0.07,0.05]},jacket:[0.72,0.7,0.62],pants:[0.13,0.13,0.14],shoes:[0.04,0.04,0.04],sleeves:'long',poseR:'grip',poseL:'claw'};
  const r=buildHuman(buildBodyGeos(look),humanMat.clone());
  r.root.traverse(m=>{if(m.material===lensMat){m.material=new THREE.MeshStandardMaterial({color:0x99aa99,transparent:true,opacity:0.18,roughness:0.05,metalness:0.6});}});
  const metal=new THREE.MeshStandardMaterial({color:0x2a2c2e,roughness:0.35,metalness:0.85}),glow=new THREE.MeshBasicMaterial({color:0xffa22a});
  const fa=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.042,0.25,14),metal);fa.position.y=-0.13;r.armL.el.add(fa);
  for(const [y,a] of[[-0.06,0],[-0.13,1.3],[-0.2,2.6]]){const g=new THREE.Mesh(new THREE.BoxGeometry(0.008,0.05,0.09),glow);g.position.set(Math.sin(a)*0.05,y,Math.cos(a)*0.05);g.rotation.y=a;r.armL.el.add(g);}
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.055,0.016,8,16),metal);ring.rotation.x=Math.PI/2;r.armL.el.add(ring);
  for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.CylinderGeometry(0.009,0.007,0.09,6),metal);f.position.set(-0.03+i*0.02,-0.31,-0.02);f.rotation.x=0.4;r.armL.el.add(f);}
  const glass=new THREE.MeshStandardMaterial({color:0xddeedd,transparent:true,opacity:0.3,roughness:0.05});
  const flask=new THREE.Group();const body=new THREE.Mesh(new THREE.ConeGeometry(0.045,0.11,16,1,true),glass);flask.add(body);
  const liq=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.065,16),new THREE.MeshBasicMaterial({color:0xd8ff2a}));liq.position.y=-0.022;flask.add(liq);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.06,10,1,true),glass);neck.position.y=0.08;flask.add(neck);
  flask.position.set(0,-0.08,-0.05);r.armR.hand.add(flask);
  r.armR.sh.rotation.set(0.55,0,-0.25);r.armR.el.rotation.set(1.7,0,0);r.armL.sh.rotation.set(1.0,0,0.15);r.armL.el.rotation.set(0.6,0,0);r.head.rotation.set(0.05,0.15,0);
  return r;}
let HALE_IMG=null;
function halePortrait(){if(HALE_IMG)return HALE_IMG;try{
  const sc=new THREE.Scene();sc.background=new THREE.Color(0x04120a);const r=buildHale();sc.add(r.root);r.root.updateMatrixWorld(true);
  sc.add(new THREE.HemisphereLight(0x9fffc0,0x0a0f0a,0.55));const d=new THREE.DirectionalLight(0x7dff9a,1.15);d.position.set(0.5,3,2);sc.add(d);
  const o=new THREE.PointLight(0xffa040,1.4,3);o.position.set(-0.35,1.25,-0.4);sc.add(o);const y=new THREE.PointLight(0xd8ff2a,0.9,2);y.position.set(0.3,1.8,-0.4);sc.add(y);
  const cam=new THREE.PerspectiveCamera(30,1,0.05,20);cam.position.set(0.08,1.75,-1.3);cam.lookAt(0.02,1.66,0);
  const S=192,rt=new THREE.WebGLRenderTarget(S,S);const prev=renderer.getRenderTarget();renderer.setRenderTarget(rt);renderer.render(sc,cam);
  const px=new Uint8Array(S*S*4);renderer.readRenderTargetPixels(rt,0,0,S,S,px);renderer.setRenderTarget(prev);rt.dispose();
  const c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');const im=g.createImageData(S,S);
  for(let yy=0;yy<S;yy++){const sl=yy%3===0?0.78:1;for(let x=0;x<S;x++){const i=((S-1-yy)*S+x)*4,j=(yy*S+x)*4;im.data[j]=px[i]*sl;im.data[j+1]=Math.min(255,px[i+1]*sl*1.06);im.data[j+2]=px[i+2]*sl;im.data[j+3]=255;}}
  g.putImageData(im,0,0);HALE_IMG=c.toDataURL('image/jpeg',0.85);}catch(e){console.warn(e);HALE_IMG='';}return HALE_IMG;}
/* ---- the intercom panel ---- */
const haleEl=(()=>{const st=document.createElement('style');st.textContent=`#hale{position:fixed;left:50%;top:13%;transform:translate(-50%,-12px);display:flex;gap:10px;align-items:center;max-width:min(560px,88vw);padding:7px 14px 7px 7px;background:rgba(3,20,10,.84);border:1px solid rgba(120,255,150,.45);border-radius:8px;box-shadow:0 0 22px rgba(80,255,140,.22);color:#d2ffdc;font:15px/1.32 system-ui,sans-serif;opacity:0;transition:opacity .3s,transform .3s;z-index:60;pointer-events:none}
#hale.on{opacity:1;transform:translate(-50%,0)}#hale img{width:62px;height:62px;border-radius:5px;border:1px solid rgba(120,255,150,.5);animation:halefl 2.4s infinite steps(1)}#hale img[src=""]{display:none}
#hale b{display:block;font-family:'Bebas Neue',sans-serif;letter-spacing:1.5px;color:#7dff9a;font-size:15px;font-weight:400}#hale b i{font-style:normal;color:#ff5a40;font-size:11px;margin-left:6px;animation:haleblk 1s infinite}
@keyframes halefl{0%,100%{filter:none}47%{filter:brightness(1.5) hue-rotate(-20deg)}49%{filter:none}}@keyframes haleblk{50%{opacity:.2}}`;document.head.appendChild(st);
  const d=document.createElement('div');d.id='hale';d.innerHTML='<img alt=""><div><b>DR. HALE<i>\u25cf INTERCOM</i></b><span></span></div>';document.body.appendChild(d);return d;})();
function haleSay(text,force){const now=performance.now();if(!force&&(now<HALE.next||G.state!=='play'))return false;HALE.next=now+13000;
  const img=haleEl.querySelector('img');if(!img.dataset.done){img.src=halePortrait();img.dataset.done=1;}
  const sp=haleEl.querySelector('span');sp.textContent='';haleEl.classList.add('on');let i=0;clearInterval(haleSay.ti);haleSay.ti=setInterval(()=>{sp.textContent=text.slice(0,++i);if(i>=text.length)clearInterval(haleSay.ti);},28);
  noise(0.3,3200,1800,0.06,'bandpass');tone(880,840,0.05,0.04,'square');
  if(VOICE.ok&&SET.voice)try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/\u2026/g,'...'));if(VOICE.voice)u.voice=VOICE.voice;u.pitch=0.45;u.rate=0.9;u.volume=0.85*(SET.master??1)*(SET.sfx??1);speechSynthesis.speak(u);}catch(e){}
  clearTimeout(haleSay.tm);haleSay.tm=setTimeout(()=>{haleEl.classList.remove('on');noise(0.2,2600,1400,0.04,'bandpass');},2200+text.length*55);return true;}
function haleEvent(k,n,force){const once=['tank','spitter','low','core','boss66','boss33','coreDown'];if(once.includes(k)){if(HALE.said[k])return;}
  let pool=HALE_LINES[k];if(k==='wave'){if(n===1)pool=HALE_LINES.intro;else if(OUTFIT.body==='jessa'&&Math.random()<0.4)pool=HALE_LINES.jessa;else if(DEADZONE&&Math.random()<0.5)pool=HALE_LINES.dz;}
  if(!pool)return;const t=pool[Math.random()*pool.length|0].replace('{n}',n);if(haleSay(t,force)&&once.includes(k))HALE.said[k]=true;}
function haleReset(){HALE.said={};HALE.next=0;G.bonusDone={};G.mutSaid={};}
/* special infected released by Hale right after a wave is cleared */
function spawnSpecial(kind){const n=enemies.length;G.nextKind=kind;spawnEnemy0();G.nextKind=null;const e=enemies[enemies.length-1];if(!e||enemies.length===n)return null;
  if(kind==='runner'){e.runner=true;e.speed=3.8+Math.random()*0.6;}e.mode='chase';e.seen=true;e.lastX=P.x;e.lastZ=P.z;return e;}
function haleRelease(){if(HORDE||G.boss||!G.wave||(G.bonusDone||{})[G.wave])return false;if(!DEADZONE&&G.wave<3)return false;if(Math.random()>(DEADZONE?0.7:0.4))return false;
  (G.bonusDone=G.bonusDone||{})[G.wave]=true;haleSay(HALE_LINES.release[Math.random()*HALE_LINES.release.length|0],true);
  const k=Math.min(4,1+Math.floor(G.wave/2));let n=0;for(let i=0;i<k;i++)if(spawnSpecial(Math.random()<0.5?'spitter':'runner'))n++;return n>0;}
function haleTick(dt){if(G.state!=='play'||HORDE)return;G.mutSaid=G.mutSaid||{};
  if(DEADZONE&&!G.boss&&(G.roundT||0)>40&&!G.mutSaid[G.wave]){G.mutSaid[G.wave]=true;haleEvent('mutate',G.wave,true);}
  if(G.boss)updateArena(dt);}

/* ================= the power station core: generator cover, live cables in the flood water, Hale's Colossus ================= */
const ARENA={built:false};const _atPos=(m,x,y,z)=>{m.position.set(x,y,z);return m;};
function buildArena(){if(ARENA.built)return;ARENA.built=true;const g=new THREE.Group();scene.add(g);ARENA.g=g;
  const steel=new THREE.MeshStandardMaterial({color:0x3a3d3f,roughness:0.5,metalness:0.7}),dark=new THREE.MeshStandardMaterial({color:0x1b1d1e,roughness:0.7,metalness:0.4});
  const core=new THREE.Group();core.position.set(0,0,-4);g.add(core);
  core.add(_atPos(new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.5,0.5,24),dark),0,0.25,0));
  const drum=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,2.3,24),steel);drum.position.y=1.65;drum.castShadow=true;core.add(drum);
  const coreGlow=new THREE.MeshBasicMaterial({color:0x9dff3a});ARENA.coreGlow=coreGlow;
  for(const y of[0.85,1.65,2.45]){const r=new THREE.Mesh(new THREE.TorusGeometry(1.17,0.05,8,32),coreGlow);r.rotation.x=Math.PI/2;r.position.y=y;core.add(r);}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const fin=new THREE.Mesh(new THREE.BoxGeometry(0.08,2.1,0.3),dark);fin.position.set(Math.cos(a)*1.2,1.65,Math.sin(a)*1.2);fin.rotation.y=-a;core.add(fin);}
  core.add(_atPos(new THREE.Mesh(new THREE.CylinderGeometry(0.6,1.1,0.5,20),steel),0,3.05,0));
  ARENA.core=core;ARENA.coreHP=100;ARENA.coreCol=addCol(0,-4,1.3,1.3,3.3);worldMeshes.push(drum);ARENA.drum=drum;
  ARENA.coreLight=new THREE.PointLight(0x9dff3a,1.4,10,1.6);ARENA.coreLight.position.set(0,2,-4);g.add(ARENA.coreLight);
  // live cables torn from the ceiling, dangling into the conductive flood water
  ARENA.cables=[];const cableMat=new THREE.MeshStandardMaterial({color:0x0c0c0c,roughness:0.6}),arcMat=new THREE.LineBasicMaterial({color:0xbfd8ff});
  for(const [x,z,ph] of[[-10,-6,0],[10,-6,2.5],[0,-13,4.4]]){const pts=[];for(let i=0;i<=8;i++){const t=i/8;pts.push(new THREE.Vector3(x+Math.sin(t*3)*0.4,4.6-t*4.5,z+t*0.5));}
    const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,0.035,6,false),cableMat);g.add(tube);
    const arc=new THREE.LineSegments(new THREE.BufferGeometry(),arcMat);arc.geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(16*6*3),3));g.add(arc);
    const L=new THREE.PointLight(0x9fc0ff,0,9,1.8);L.position.set(x,0.8,z+0.5);g.add(L);
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.2,2.6,32),new THREE.MeshBasicMaterial({color:0x7fb0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(x,0.14,z+0.5);g.add(ring);
    ARENA.cables.push({x,z:z+0.5,ph,arc,L,ring,live:false,tick:0});}
  // red warning triangles over the north wall, alarm lights
  const warn=new THREE.MeshBasicMaterial({color:0xff2a1a});ARENA.warnMat=warn;
  for(const x of[-6,0,6]){const sh=new THREE.Shape();sh.moveTo(0,0.55);sh.lineTo(0.5,-0.32);sh.lineTo(-0.5,-0.32);sh.lineTo(0,0.55);const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),warn);m.position.set(x,3.5,-A+0.06);g.add(m);}
  LIGHTS.forEach(l=>{l.userData.c0=l.color.getHex();l.color.setHex(0xff2a18);});scene.fog.color.setHex(0x140808);
  // boss health bar
  const bar=document.createElement('div');bar.id='bossbar';bar.innerHTML='<b>HALE\u2019S COLOSSUS</b><div><i></i></div>';
  const st=document.createElement('style');st.textContent='#bossbar{position:fixed;left:50%;bottom:16%;transform:translateX(-50%);width:min(520px,70vw);text-align:center;z-index:55;pointer-events:none;opacity:0;transition:opacity .4s}#bossbar.on{opacity:1}#bossbar b{font-family:"Bebas Neue",sans-serif;font-weight:400;letter-spacing:3px;color:#d8ff4a;font-size:18px;text-shadow:0 0 8px #000}#bossbar div{height:9px;background:rgba(0,0,0,.6);border:1px solid rgba(216,255,74,.6);border-radius:4px;overflow:hidden}#bossbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#9dff3a,#e4ff6a);transition:width .2s}';
  document.head.appendChild(st);document.body.appendChild(bar);ARENA.bar=bar;}
function clearArena(){if(!ARENA.built)return;scene.remove(ARENA.g);const i=colliders.indexOf(ARENA.coreCol);if(i>=0)colliders.splice(i,1);const j=worldMeshes.indexOf(ARENA.drum);if(j>=0)worldMeshes.splice(j,1);
  LIGHTS.forEach(l=>{if(l.userData.c0!==undefined)l.color.setHex(l.userData.c0);});scene.fog.color.setHex(0x101414);if(ARENA.bar)ARENA.bar.remove();for(const k in ARENA)delete ARENA[k];ARENA.built=false;}
/* the Colossus: a giant brute fused with industrial rebar and steel, mutagen glowing through cracks in its skin */
function makeColossus(){const zb=makeZombie('tank');const r=zb.r;
  const rust=new THREE.MeshStandardMaterial({color:0x5a3a24,roughness:0.75,metalness:0.5}),plate=new THREE.MeshStandardMaterial({color:0x4a4a44,roughness:0.6,metalness:0.6}),crack=new THREE.MeshBasicMaterial({color:0xd4ff3a});
  const rod=(b,x,y,z,rx,rz,l)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,l,6),rust);m.position.set(x,y,z);m.rotation.set(rx,0,rz);b.add(m);};
  for(const [x,y,z,rx,rz,l] of[[-0.12,0.55,0.08,-0.4,0.5,0.4],[0.14,0.58,0.1,-0.5,-0.6,0.45],[0.0,0.5,0.16,-1.0,0.1,0.38],[-0.18,0.4,0.05,0.2,1.0,0.3],[0.16,0.3,0.12,-0.8,-0.9,0.32],[0.05,0.62,-0.02,0.3,-0.2,0.35]])rod(r.torso,x,y,z,rx,rz,l);
  for(const A_ of[r.armL,r.armR])for(let i=0;i<4;i++)rod(A_.el,(Math.random()-0.5)*0.08,-0.05-i*0.05,(Math.random()-0.5)*0.08,(Math.random()-0.5)*2,(Math.random()-0.5)*2,0.16);
  for(const L of[r.legL,r.legR]){const p=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.22,0.05),plate);p.position.set(0,-0.2,-0.07);L.kn.add(p);rod(L.kn,0.05,-0.15,0,0.3,0.2,0.3);}
  const sp=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.12,0.04),plate);sp.position.set(0.12,0.5,-0.15);sp.rotation.z=0.3;r.torso.add(sp);
  for(const [x,y,l,a] of[[-0.05,0.4,0.22,0.6],[0.04,0.3,0.25,-0.4],[0.08,0.46,0.15,1.2],[-0.08,0.22,0.18,-0.9],[0.0,0.15,0.14,0.2]]){const c=new THREE.Mesh(new THREE.BoxGeometry(0.008,l,0.006),crack);c.position.set(x,y,-0.155);c.rotation.z=a;r.torso.add(c);}
  for(const A_ of[r.armL,r.armR]){const c=new THREE.Mesh(new THREE.BoxGeometry(0.006,0.18,0.006),crack);c.position.set(0.02,-0.12,-0.05);c.rotation.z=0.3;A_.sh.add(c);}
  glowEyes(r,0xffd84a);const gl=new THREE.PointLight(0xc8ff3a,0.9,5,1.8);gl.position.set(0,0.35,-0.3);r.torso.add(gl);
  return zb;}
function startBossRound(){G.boss=true;G.toSpawn=0;buildArena();showMsg('Power station core',3);sfx.wave();
  setTimeout(()=>{if(G.state!=='play')return;const zb=makeColossus();scene.add(zb.r.root);const S=2.6;
    const e={...zb,x:0,z:-17,yaw:0,hp:260,hpMax:260,boss:true,state:'walk',t:0,cd:2,chargeCD:7,roarCD:12,stun:0,phase:0,speed:1.5,runner:false,y:0,roof:-1,climb:null,burn:0,burnPanic:0,legDmg:0,crawl:false,armDmg:{L:0,R:0},armOff:{L:false,R:false},atkCD:0,atkT:0,stagger:0,dead:0,mode:'chase',seen:true,sc:S,lookYaw:0,moveAmt:1};
    zb.r.root.scale.set(S*1.15,S,S*1.1);zb.r.root.position.set(e.x,0,e.z);enemies.push(e);G.bossE=e;ARENA.bar.classList.add('on');
    G.shake=0.5;tone(70,40,1.2,0.5,'sawtooth');noise(1.2,300,80,0.4,'lowpass');haleEvent('core',0,true);},2200);}
function bossDamage(e,dmg,head){if(e.dead)return;const k=(head?1.6:1)*(e.stun>0?1.6:1);e.hp-=dmg*k;hitMarker(false,head);head?sfx.head():sfx.hit();
  const f=e.hp/e.hpMax;ARENA.bar.querySelector('i').style.width=Math.max(0,f*100)+'%';
  if(f<0.66&&!e.p66){e.p66=true;bossRoar(e);haleEvent('boss66',0,true);}if(f<0.33&&!e.p33){e.p33=true;bossRoar(e);haleEvent('boss33',0,true);}
  if(e.hp<=0){e.dead=0.001;e.state='dead';G.score+=5000;hitMarker(true,true);sfx.thud();G.shake=0.8;ARENA.bar.classList.remove('on');noise(1.5,200,60,0.5,'lowpass');
    setTimeout(()=>haleSay(HALE_LINES.won[0],true),1500);}drawHud();}
function bossRoar(e){e.state='roar';e.t=0;tone(90,50,1.0,0.45,'sawtooth');noise(0.9,500,120,0.3,'lowpass');G.shake=Math.max(G.shake,0.35);
  const n=e.p33?4:3;for(let i=0;i<n;i++)setTimeout(()=>{if(G.state==='play'&&!e.dead)spawnSpecial(i%2?'spitter':'runner');},500+i*500);}
const _segD=(ax,az,bx,bz,px,pz)=>{const vx=bx-ax,vz=bz-az,L=vx*vx+vz*vz||1;const t=clamp(((px-ax)*vx+(pz-az)*vz)/L,0,1);return Math.hypot(ax+vx*t-px,az+vz*t-pz);};
function coreShields(e){return ARENA.coreHP>0&&_segD(e.x,e.z,P.x,P.z,0,-4)<1.5;}
function hitCore(d){if(ARENA.coreHP<=0)return;ARENA.coreHP-=d;ARENA.coreGlow.color.setHex(ARENA.coreHP>50?0x9dff3a:ARENA.coreHP>20?0xffd02a:0xff4a1a);
  if(ARENA.coreHP<=0){ARENA.core.visible=false;const i=colliders.indexOf(ARENA.coreCol);if(i>=0)colliders.splice(i,1);const j=worldMeshes.indexOf(ARENA.drum);if(j>=0)worldMeshes.splice(j,1);ARENA.coreLight.intensity=0;
    explode(0,0.5,-4);const b=G.bossE;if(b&&!b.dead&&Math.hypot(b.x,b.z+4)<6){bossDamage(b,35,false);b.stun=3;b.state='stun';}haleEvent('coreDown',0,true);}}
const _wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));const turnTo=(e,a,k,dt)=>{e.yaw+=_wrapA(a-e.yaw)*Math.min(1,k*dt);};
function updateBoss(e,dt){const r=e.r;if(e.dead){e.dead+=dt;r.root.rotation.x=-Math.min(1.45,e.dead*e.dead*0.9);r.root.position.y=e.dead>5?-(e.dead-5)*0.3:0;if(e.dead>8){scene.remove(r.root);enemies.splice(enemies.indexOf(e),1);}return;}
  e.t+=dt;e.cd-=dt;e.chargeCD-=dt;e.roarCD-=dt;const dx=P.x-e.x,dz=P.z-e.z,d=Math.hypot(dx,dz);const face=Math.atan2(-dx,-dz);
  const walkTo=(tx,tz,sp)=>{let vx=tx-e.x,vz=tz-e.z;const L=Math.hypot(vx,vz)||1;vx/=L;vz/=L;
      if(ARENA.coreHP>0){const cx=0-e.x,cz=-4-e.z,cl=Math.hypot(cx,cz);if(cl<3.2){const s=(vx*cz-vz*cx)>0?1:-1;vx+=-cz/cl*s*0.9;vz+=cx/cl*s*0.9;const L2=Math.hypot(vx,vz);vx/=L2;vz/=L2;}}
      e.x+=vx*sp*dt;e.z+=vz*sp*dt;for(const c of colliders){if(c.y0>1||c===ARENA.coreCol)continue;const R=0.9;if(Math.abs(e.x-c.x)<c.hw+R&&Math.abs(e.z-c.z)<c.hd+R){const ox=c.hw+R-Math.abs(e.x-c.x),oz=c.hd+R-Math.abs(e.z-c.z);if(ox<oz)e.x+=Math.sign(e.x-c.x)*ox;else e.z+=Math.sign(e.z-c.z)*oz;}}
      e.x=clamp(e.x,-A+1.5,A-1.5);e.z=clamp(e.z,-A+1.5,A-1.5);e.phase+=dt*sp*2.2;};
  let tw=0,arms=0;
  if(e.stun>0){e.stun-=dt;e.state='stun';r.torso.rotation.set(0.35+Math.sin(e.t*30)*0.05,Math.sin(e.t*23)*0.1,0);arms=0.2;if(e.stun<=0)e.state='walk';}
  else if(e.state==='walk'){walkTo(P.x,P.z,e.speed);turnTo(e,face,3,dt);tw=1;
    if(d<3.6&&e.cd<=0){e.state='slam';e.t=0;}else if(d>8&&e.chargeCD<=0){e.state='wind';e.t=0;e.cx=P.x;e.cz=P.z;tone(110,60,0.6,0.3,'sawtooth');}
    else if(e.roarCD<=0&&d>6){e.roarCD=16;bossRoar(e);}}
  else if(e.state==='slam'){turnTo(e,face,4,dt);arms=e.t<0.75?e.t/0.75*2.6:Math.max(0,2.6-(e.t-0.75)*12);
    if(e.t>=0.8&&!e.slammed){e.slammed=true;G.shake=Math.max(G.shake,0.55);noise(0.5,300,60,0.45,'lowpass');const hx=e.x-Math.sin(e.yaw)*2.2,hz=e.z-Math.cos(e.yaw)*2.2;
      for(let i=0;i<14;i++){const a=i/14*Math.PI*2;emit('glass',hx,0.2,hz,Math.cos(a)*3,1.5+Math.random(),Math.sin(a)*3,0.6,0.05,-1);}
      if(Math.hypot(P.x-hx,P.z-hz)<3.6){if(coreShields(e))hitCore(20);else hurtPlayer(26);}if(Math.hypot(hx,hz+4)<3.2)hitCore(25);}
    if(e.t>1.4){e.state='walk';e.slammed=false;e.cd=2.2+Math.random();}}
  else if(e.state==='wind'){turnTo(e,Math.atan2(-(e.cx-e.x),-(e.cz-e.z)),6,dt);r.torso.rotation.x=0.4;arms=0.4;if(e.t>0.9){e.state='charge';e.t=0;}}
  else if(e.state==='charge'){const fx=-Math.sin(e.yaw),fz=-Math.cos(e.yaw);walkTo(e.x+fx*5,e.z+fz*5,7.5);tw=2;
    if(Math.hypot(P.x-e.x,P.z-e.z)<2.2&&!e.hitP){e.hitP=true;hurtPlayer(30);G.shake=0.6;}
    if(ARENA.coreHP>0&&Math.hypot(e.x,e.z+4)<3){hitCore(40);e.stun=2.6;e.state='stun';G.shake=0.7;noise(0.6,250,60,0.5,'lowpass');e.hitP=false;e.chargeCD=9;}
    else if(e.t>1.7||Math.abs(e.x)>=A-1.6||Math.abs(e.z)>=A-1.6){e.state='walk';e.hitP=false;e.chargeCD=9+Math.random()*3;}}
  else if(e.state==='roar'){arms=1.4;r.head.rotation.x=-0.5;if(e.t>1.2){e.state='walk';r.head.rotation.x=0;}}
  // pose: heavy stomping gait, arms swing or rise for the slam
  const ph=e.phase,sw=Math.sin(ph)*0.5*Math.min(1,tw);r.legL.hp.rotation.x=sw;r.legR.hp.rotation.x=-sw;r.legL.kn.rotation.x=-Math.max(0,Math.cos(ph))*0.6*Math.min(1,tw);r.legR.kn.rotation.x=-Math.max(0,-Math.cos(ph))*0.6*Math.min(1,tw);
  r.armL.sh.rotation.set(-sw*0.6+arms+0.2,0,0.35);r.armR.sh.rotation.set(sw*0.6+arms+0.2,0,-0.35);r.armL.el.rotation.x=0.5;r.armR.el.rotation.x=0.5;
  if(e.state!=='stun')r.torso.rotation.set(0.25*(tw>1?1.6:1),0,Math.sin(ph)*0.06);r.hips.position.y=1.04-Math.abs(Math.cos(ph))*0.04*tw;
  if(Math.abs(Math.sin(ph))>0.98&&tw&&!e.stepped){e.stepped=true;G.shake=Math.max(G.shake,0.08*Math.max(0,1-d/20));noise(0.15,180,60,0.18,'lowpass');}if(Math.abs(Math.sin(ph))<0.9)e.stepped=false;
  r.root.position.set(e.x,0,e.z);r.root.rotation.y=e.yaw;}
function updateArena(dt){if(!ARENA.built)return;const t=G.time;ARENA.warnMat.color.setHex((t*2|0)%2?0xff2a1a:0x550a05);
  if(ARENA.coreHP>0){ARENA.coreLight.intensity=1.2+Math.sin(t*6)*0.3;ARENA.core.rotation.y+=dt*0.15;}
  for(const c of ARENA.cables){const cyc=(t+c.ph)%7;const live=cyc<2.4;c.live=live;c.ring.material.opacity=live?0.18+Math.random()*0.18:(cyc>6.3?0.06:0);c.L.intensity=live?(Math.random()<0.5?2.4:0.6):0;
    const pa=c.arc.geometry.attributes.position.array;if(live){let k=0;for(let b=0;b<6;b++){let x=c.x,y=0.15,z=c.z;const a=Math.random()*Math.PI*2,R=0.8+Math.random()*1.8;for(let s=0;s<8;s++){const f=(s+1)/8;const nx=c.x+Math.cos(a)*R*f+(Math.random()-.5)*0.3,ny=0.15+Math.random()*0.35*(1-f)+(s===0?0.6:0),nz=c.z+Math.sin(a)*R*f+(Math.random()-.5)*0.3;pa[k++]=x;pa[k++]=y;pa[k++]=z;pa[k++]=nx;pa[k++]=ny;pa[k++]=nz;x=nx;y=ny;z=nz;}}c.arc.visible=true;c.arc.geometry.attributes.position.needsUpdate=true;
      if(Math.random()<0.3)spark2(c.x,0.6,c.z,(Math.random()-.5)*4,2+Math.random()*3,(Math.random()-.5)*4,0.5);
      c.tick-=dt;if(c.tick<=0&&Math.hypot(P.x-c.x,P.z-c.z)<2.7&&(P.y||0)<0.6){c.tick=0.45;hurtPlayer(7);}
      const b=G.bossE;if(b&&!b.dead&&Math.hypot(b.x-c.x,b.z-c.z)<3){if(b.stun<=0){b.stun=2.4;b.state='stun';haleEvent('stun',0,false);}b.hp-=dt*6;ARENA.bar.querySelector('i').style.width=Math.max(0,b.hp/b.hpMax*100)+'%';if(b.hp<=0)bossDamage(b,0.01,false);}
      for(const e of enemies)if(!e.dead&&!e.boss&&Math.hypot(e.x-c.x,e.z-c.z)<2.6)damageEnemy(e,dt*3,false,new THREE.Vector3(0,0,1),true);}
    else c.arc.visible=false;}}

/* ---- intro cinematic before the first Dead Zone run of a session; tap, key or any pad button skips ---- */
function playIntro(done){let fin=false;const ov=document.createElement('div');ov.id='introv';
  ov.style.cssText='position:fixed;inset:0;background:#000;z-index:200;display:flex;align-items:center;justify-content:center';
  const v=document.createElement('video');v.src=INTRO_MP4;v.playsInline=true;v.setAttribute('playsinline','');v.style.cssText='width:100%;height:100%;object-fit:cover';
  const sk=document.createElement('div');sk.textContent='Tap or press any button to skip';sk.style.cssText="position:absolute;right:4%;bottom:6%;color:#cfd;font:14px system-ui;opacity:.7;letter-spacing:.5px";
  const tt=document.createElement('div');tt.innerHTML='BOMBIES<br><span style="font-size:.45em;letter-spacing:6px;color:#9dff3a">DEAD ZONE</span>';tt.style.cssText="position:absolute;left:5%;top:8%;color:#fff;font-family:'Bebas Neue',sans-serif;font-size:min(13vw,96px);line-height:.9;letter-spacing:4px;text-shadow:0 0 18px #000;opacity:0;transition:opacity 1s";
  ov.append(v,sk,tt);document.body.appendChild(ov);v.volume=0.8*(SET.master??1);
  const end=()=>{if(fin)return;fin=true;clearInterval(pi);ov.style.transition='opacity .35s';ov.style.opacity=0;setTimeout(()=>ov.remove(),400);removeEventListener('keydown',end,true);done();};
  v.onended=end;v.onerror=end;ov.addEventListener('pointerdown',end);addEventListener('keydown',end,true);setTimeout(()=>tt.style.opacity=1,2400);
  let armed=false;const pi=setInterval(()=>{const pads=navigator.getGamepads?navigator.getGamepads():[];let any=false;for(const p of pads)if(p)for(const b of p.buttons)if(b.pressed)any=true;if(!any)armed=true;else if(armed)end();},80);
  const pr=v.play();if(pr&&pr.catch)pr.catch(()=>{v.muted=true;v.play().catch(end);});setTimeout(end,9000);}
