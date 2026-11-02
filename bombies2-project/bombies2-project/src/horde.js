/* ================= HORDE mode ================= */
// Six difficulties. Endless Bombies, unlimited ammo, weapons get bigger as the kill count climbs,
// a tank arrives, and the level ends when you reach the kill goal.
const HORDE_LV=[
  {name:'Just born',cap:5,crowd:0,cs:0.3,zs:0.45,crawl:true,runners:0,tank:40,win:80},
  {name:'Crawling',cap:8,crowd:60,cs:0.5,zs:0.6,crawl:true,runners:0,tank:60,win:120},
  {name:'Walking',cap:14,crowd:220,cs:1.0,zs:0.9,crawl:false,runners:0,tank:90,win:190},
  {name:'Jogging',cap:20,crowd:520,cs:1.8,zs:1.15,crawl:false,runners:0.3,tank:130,win:280},
  {name:'Running',cap:28,crowd:950,cs:2.8,zs:1.35,crawl:false,runners:1,tank:180,win:400},
  {name:'Running for your life',cap:36,crowd:1600,cs:3.6,zs:1.6,crawl:false,runners:1,tank:250,win:550}];
function HLV(){return HORDE_LV[clamp(SET.hordeLvl|0,0,5)];}
const HZ={kills:0,tier:-1,spawnT:0,hudT:0,dmg:1,tank:null,crowd:null,inst:[],won:false};
// weapon ladder, by share of the kills needed for the tank
const H_TIERS=[[0,'rifle','M21 rifle'],[0.25,'shotgun','Incendiary shotgun'],[0.5,'rifle','Explosive M21 rounds'],[0.75,'rpg','Rapid RPG']];
function hordeReset(){HZ.kills=0;HZ.tier=-1;HZ.dmg=1;HZ.spawnT=1;HZ.won=false;if(HZ.tank){scene.remove(HZ.tank.g);HZ.tank=null;}P.tank=null;buildCrowd();}
function hordeTierUp(){const lv=HLV(),f=HZ.kills/lv.tank;let t=0;for(let i=0;i<H_TIERS.length;i++)if(f>=H_TIERS[i][0])t=i;if(t===HZ.tier)return;HZ.tier=t;
  const [,k,label]=H_TIERS[t];INV[k]=INV[k]||{own:true,ammo:GUNS[k].mag,reserve:Infinity};INV[k].own=true;
  CH.boomammo=t===2;if(k==='shotgun'){ATT.shotgun.ammo='fire';applyAttachments();}
  if(k==='rpg'){GUNS.rpg.cd=0.32;GUNS.rpg.reload=0.01;}
  if(P.weapon!==k&&!P.tank){P.weapon=k;equip(k);}if(t>0){showMsg('WEAPON UPGRADE: '+label,2.2);tone(500,1100,0.25,0.18,'sawtooth');}}
/* ----- the crowd: a sea of far-away Bombies drawn in one go ----- */
const CROWD_KITS=[[[0.42,0.47,0.38],[0.32,0.37,0.48],[0.2,0.24,0.32]],[[0.45,0.44,0.36],[0.42,0.3,0.24],[0.36,0.33,0.26]],[[0.5,0.48,0.42],[0.36,0.25,0.19],[0.15,0.13,0.12]],
  [[0.52,0.5,0.44],[0.58,0.68,0.74],[0.56,0.66,0.72]],[[0.4,0.39,0.32],[0.88,0.46,0.08],[0.18,0.24,0.38]],[[0.46,0.43,0.38],[0.16,0.48,0.48],[0.15,0.45,0.45]],
  [[0.45,0.44,0.38],[0.11,0.11,0.13],[0.12,0.12,0.14]],[[0.38,0.34,0.28],[0.1,0.14,0.3],[0.08,0.1,0.2]],[[0.42,0.41,0.35],[0.62,0.5,0.26],[0.56,0.46,0.24]],[[0.5,0.47,0.41],[0.76,0.12,0.14],[0.06,0.06,0.07]]];
function crowdGeo(k){const [sk,cl,pa]=CROWD_KITS[k],hr=[0.1,0.09,0.08];
  return mergeParts([P_(new THREE.BoxGeometry(0.46,0.6,0.26),M(0,1.1,-0.05,0.25,0,0),cl),P_(new THREE.BoxGeometry(0.22,0.26,0.24),M(0,1.5,-0.24,0.35,0,0),sk),P_(new THREE.BoxGeometry(0.23,0.08,0.25),M(0,1.64,-0.26,0.35,0,0),hr),
    P_(new THREE.BoxGeometry(0.17,0.8,0.2),M(-0.12,0.42,0,0.08,0,0),pa),P_(new THREE.BoxGeometry(0.17,0.8,0.2),M(0.12,0.42,0.05,-0.12,0,0),pa),
    P_(new THREE.BoxGeometry(0.1,0.1,0.55),M(-0.28,1.2,-0.38,0.25,0,0),sk),P_(new THREE.BoxGeometry(0.1,0.1,0.55),M(0.28,1.26,-0.36,0.1,0,0),sk),
    P_(new THREE.BoxGeometry(0.12,0.12,0.28),M(-0.28,1.27,-0.18),cl),P_(new THREE.BoxGeometry(0.12,0.12,0.28),M(0.28,1.3,-0.16),cl)]);}
function buildCrowd(){if(HZ.crowds)HZ.crowds.forEach(m=>scene.remove(m));HZ.crowds=[];HZ.crowd=null;HZ.inst=[];if(!HORDE)return;const n=HLV().crowd;if(!n)return;
  HZ.dir=Math.random()*Math.PI*2;const per=Math.ceil(n/10),mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
  for(let k=0;k<10;k++){const cnt=Math.min(per,n-k*per);if(cnt<=0)break;const mesh=new THREE.InstancedMesh(crowdGeo(k),mat,cnt);mesh.frustumCulled=false;
    for(let i=0;i<cnt;i++){const it={ph:Math.random()*6.28,sp:0.75+Math.random()*0.5,m:mesh,i};crowdPlace(it,true);HZ.inst.push(it);}scene.add(mesh);HZ.crowds.push(mesh);}
  HZ.crowd=HZ.crowds[0];}
function crowdPlace(it,init){const a=HZ.dir+(Math.random()-.5)*(init?2.2:1.6),r=(init?40:70)+Math.random()*(init?60:35);it.x=P.x+Math.sin(a)*r;it.z=P.z+Math.cos(a)*r;}
const _cm=new THREE.Matrix4(),_cq=new THREE.Quaternion(),_cs=new THREE.Vector3(1,1,1),_cp=new THREE.Vector3(),_ce=new THREE.Euler();
function updateCrowd(dt){const m=HZ.crowd;if(!m)return;const lv=HLV();const live=enemies.filter(e=>!e.dead).length;
  // the horde slowly swings round to follow you
  const tx=P.x-Math.sin(HZ.dir)*60,tz=P.z-Math.cos(HZ.dir)*60;
  for(let i=0;i<HZ.inst.length;i++){const it=HZ.inst[i];const dx=P.x-it.x,dz=P.z-it.z,d=Math.hypot(dx,dz)||1;const v=lv.cs*it.sp*dt;
    it.x+=dx/d*v+Math.sin(it.ph*0.7)*0.3*dt;it.z+=dz/d*v+Math.cos(it.ph*0.6)*0.3*dt;it.ph+=dt*(2+lv.cs);
    if(d<17){if(live<lv.cap&&Math.random()<0.5)hordeSpawn(it.x,it.z);crowdPlace(it,false);}
    _cp.set(it.x,Math.abs(Math.sin(it.ph))*0.08,it.z);_ce.set(0,Math.atan2(dx,dz)+Math.PI,Math.sin(it.ph)*0.1);_cq.setFromEuler(_ce);_cm.compose(_cp,_cq,_cs);it.m.setMatrixAt(it.i,_cm);}
  for(const mm of HZ.crowds)mm.instanceMatrix.needsUpdate=true;}
function crowdKill(x,z,r){let n=0;for(const it of HZ.inst){if(Math.hypot(it.x-x,it.z-z)<r){if(n<6)spark(new THREE.Vector3(it.x,1,it.z),0x7a1010,0.5);crowdPlace(it,false);n++;}}if(n)hordeCount(n);return n;}
function crowdRay(o,d,len,w){let n=0;for(const it of HZ.inst){const vx=it.x-o.x,vz=it.z-o.z;const t=vx*d.x+vz*d.z;if(t<0||t>len)continue;const px=vx-d.x*t,pz=vz-d.z*t;if(px*px+pz*pz<w*w){crowdPlace(it,false);n++;if(n>2)break;}}if(n)hordeCount(n);return n;}
/* ----- spawning the up-close Bombies ----- */
function hordeSpawn(x,z){const n=enemies.length;spawnEnemy0();const e=enemies[enemies.length-1];if(!e||enemies.length===n&&e.dead)return;const lv=HLV();
  if(x!==undefined){e.x=x;e.z=z;}e.speed*=lv.zs;e.runner=Math.random()<lv.runners;if(lv.crawl){e.crawl=true;e.legs=2;}e.mode='chase';e.alert=1;}
function hordeCount(n){HZ.kills+=n;G.score+=n*25;hordeTierUp();checkHordeWin();}
function checkHordeWin(){if(HZ.won||HZ.kills<HLV().win)return;HZ.won=true;G.won=true;G.wonText='Horde cleared';if(P.tank)exitTank();setTimeout(()=>setState('over'),600);}
// count every Bombie that dies, and hit harder as the count grows
{const _de=damageEnemy;damageEnemy=function(e,dmg,head,dir,silent,parts){const was=!e.dead;if(HORDE)dmg*=HZ.dmg;const r=_de(e,dmg,head,dir,silent,parts);if(HORDE&&was&&e.dead)hordeCount(1);return r;};}
{const _ex=explode;explode=function(x,y,z,opt){_ex(x,y,z,opt);if(HORDE&&HZ.crowd)crowdKill(x,z,opt&&opt.big?7:4.5);};}
/* ----- the tank ----- */
function buildTank(){const g=new THREE.Group(),ol=[0.28,0.31,0.2],dk=[0.09,0.09,0.09],mt=[0.18,0.19,0.17];
  const hull=new THREE.Mesh(mergeParts([P_(new THREE.BoxGeometry(3.0,0.9,5.4),M(0,0.95,0),ol),P_(new THREE.BoxGeometry(2.6,0.5,1.2),M(0,1.2,-2.6,0.5,0,0),ol),
    P_(new THREE.BoxGeometry(0.75,1.0,5.8),M(-1.75,0.6,0),dk),P_(new THREE.BoxGeometry(0.75,1.0,5.8),M(1.75,0.6,0),dk),
    ...[-2.2,-1.1,0,1.1,2.2].flatMap(z=>[P_(new THREE.CylinderGeometry(0.42,0.42,0.8,14),M(-1.75,0.48,z,0,0,Math.PI/2),mt),P_(new THREE.CylinderGeometry(0.42,0.42,0.8,14),M(1.75,0.48,z,0,0,Math.PI/2),mt)])]),vc);
  hull.castShadow=true;g.add(hull);
  const tur=new THREE.Group();tur.position.y=1.45;g.add(tur);
  tur.add(new THREE.Mesh(mergeParts([P_(new THREE.CylinderGeometry(1.25,1.45,0.75,16),M(0,0.35,0),ol),P_(new THREE.BoxGeometry(1.6,0.55,1.3),M(0,0.4,0.9),ol),
    P_(new THREE.CylinderGeometry(0.42,0.42,0.18,12),M(0.45,0.8,0.1),mt)]),vc));
  const gun=new THREE.Group();gun.position.set(0,0.4,-1.1);tur.add(gun);
  gun.add(new THREE.Mesh(mergeParts([P_(new THREE.CylinderGeometry(0.11,0.13,3.6,12),M(0,0,-1.8,Math.PI/2,0,0),mt),P_(new THREE.CylinderGeometry(0.17,0.17,0.45,12),M(0,0,-3.55,Math.PI/2,0,0),dk),P_(new THREE.BoxGeometry(0.5,0.45,0.6),M(0,0,0),ol)]),vc));
  const hmg=new THREE.Mesh(mergeParts([P_(new THREE.CylinderGeometry(0.04,0.04,1.3,8),M(0,0,-0.65,Math.PI/2,0,0),dk),P_(new THREE.BoxGeometry(0.22,0.24,0.5),M(0,0,0.1),dk),P_(new THREE.CylinderGeometry(0.03,0.03,0.4,6),M(0,-0.25,0.1),dk)]),vc);
  hmg.position.set(-0.5,1.05,0.2);tur.add(hmg);
  const lt=new THREE.PointLight(0xffd36a,0,8);lt.position.set(0,1.5,0);tur.add(lt);
  scene.add(g);return {g,tur,gun,hmg,lt,x:0,z:0,ry:0,speed:0,ty:0,pitch:0,cd:0,w:'hmg',hp:1};}
function spawnTank(){const t=buildTank();const a=P.yaw+Math.PI*0.5;t.x=P.x+Math.sin(a)*10;t.z=P.z+Math.cos(a)*10;t.g.position.set(t.x,0,t.z);t.ry=P.yaw;HZ.tank=t;
  showMsg('TANK ARRIVED \u2014 '+(btnFor('use')||'Use')+' to get in',3);for(let i=0;i<14;i++)emit('smoke',t.x+(Math.random()-.5)*4,0.4,t.z+(Math.random()-.5)*5,(Math.random()-.5)*2,1+Math.random(),(Math.random()-.5)*2,1.6,1.4,2);tone(90,60,0.6,0.25,'sawtooth');}
function nearTank(){const t=HZ.tank;return t&&!P.tank&&Math.hypot(t.x-P.x,t.z-P.z)<4.2;}
function enterTank(){P.tank=HZ.tank;P.tank.ty=0;P.tank.pitch=0;showMsg('Tank: B fires, R1 switches gun',2.5);tone(140,90,0.3,0.2,'sawtooth');}
function exitTank(){const t=P.tank;if(!t)return;P.tank=null;P.x=t.x+Math.cos(t.ry)*3.4;P.z=t.z-Math.sin(t.ry)*3.4;hero.root.visible=true;}
function switchTankGun(){const t=P.tank;t.w=t.w==='hmg'?'cannon':'hmg';showMsg(t.w==='hmg'?'Heavy machine gun':'Main cannon',1);tone(300,200,0.08,0.12,'square');}
const SHELLS=[];
function driveTank(dt){const t=P.tank;const st=readStick();
  t.speed=damp(t.speed,-st.y*7.5,2.2,dt);t.ry-=st.x*dt*1.25*(t.speed<-0.3?-1:1);
  const fx=-Math.sin(t.ry),fz=-Math.cos(t.ry),lim=W-3;t.x=clamp(t.x+fx*t.speed*dt,-lim,lim);t.z=clamp(t.z+fz*t.speed*dt,-lim,lim);
  t.g.position.set(t.x,0,t.z);t.g.rotation.y=t.ry;P.x=t.x;P.z=t.z;
  // right stick turns the turret and raises the gun
  t.ty-=stickVec2.x*dt*1.6;t.pitch=clamp(t.pitch-stickVec2.y*dt*0.8,-0.12,0.35);t.tur.rotation.y=t.ty;t.gun.rotation.x=t.pitch;t.hmg.rotation.x=t.pitch;
  // tracks crush whatever is under them
  if(Math.abs(t.speed)>1)for(const e of enemies)if(!e.dead&&Math.hypot(e.x-t.x,e.z-t.z)<2.6)damageEnemy(e,99,false,new THREE.Vector3(fx,0,fz));
  if(HZ.crowd&&Math.abs(t.speed)>1)crowdKill(t.x,t.z,2.9);
  t.cd-=dt;t.lt.intensity=Math.max(0,t.lt.intensity-dt*30);
  if(input.fire&&t.cd<=0){const a=t.ry+t.ty;const d=new THREE.Vector3(-Math.sin(a)*Math.cos(t.pitch),Math.sin(t.pitch),-Math.cos(a)*Math.cos(t.pitch));
    const o=new THREE.Vector3();(t.w==='hmg'?t.hmg:t.gun).localToWorld(o.set(0,0,t.w==='hmg'?-1.3:-3.8));
    if(t.w==='hmg'){t.cd=0.07;t.lt.intensity=3;G.shake=Math.max(G.shake,0.04);noise(0.06,2400,700,0.22,'bandpass');
      let best=null,bd=1e9;for(const e of enemies){if(e.dead)continue;const vx=e.x-o.x,vz=e.z-o.z,tt=vx*d.x+vz*d.z;if(tt<0||tt>90)continue;const px=vx-d.x*tt,pz=vz-d.z*tt;if(px*px+pz*pz<1.2&&tt<bd){bd=tt;best=e;}}
      if(best)damageEnemy(best,4,Math.random()<0.25,d);crowdRay(o,new THREE.Vector3(d.x,0,d.z).normalize(),90,0.9);
      const end=o.clone().addScaledVector(d,best?bd:60);tracer(o,end);}
    else{t.cd=1.1;t.lt.intensity=8;G.shake=Math.max(G.shake,0.35);noise(0.5,300,60,0.5,'lowpass');tone(80,40,0.4,0.3,'sawtooth');
      const m=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.5,8),gunMat);m.position.copy(o);scene.add(m);SHELLS.push({m,v:d.clone().multiplyScalar(70),t:2.5});
      for(let i=0;i<6;i++)emit('smoke',o.x,o.y,o.z,d.x*3+(Math.random()-.5),d.y*3+Math.random(),d.z*3+(Math.random()-.5),0.9,0.7,1.6);}}
  updateShells(dt);}
function updateShells(dt){for(const s of SHELLS.slice()){s.t-=dt;s.v.y-=4*dt;s.m.position.addScaledVector(s.v,dt);const p=s.m.position;
    const hitE=enemies.some(e=>!e.dead&&Math.hypot(e.x-p.x,e.z-p.z)<1.2&&p.y<2.2);
    if(p.y<=groundAt(p.x,p.z)+0.1||hitE||s.t<=0){scene.remove(s.m);SHELLS.splice(SHELLS.indexOf(s),1);explode(p.x,Math.max(0.2,p.y),p.z,{fire:false,big:true});}}}
function tracer(a,b){const g=new THREE.BufferGeometry().setFromPoints([a,b]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffe08a,transparent:true,opacity:0.9}));scene.add(l);setTimeout(()=>{scene.remove(l);g.dispose();},60);}
function tankCamera(dt){const t=P.tank,a=t.ry+t.ty;const fx=-Math.sin(a),fz=-Math.cos(a);
  camPos.x=damp(camPos.x,t.x-fx*9,6,dt);camPos.z=damp(camPos.z,t.z-fz*9,6,dt);camPos.y=damp(camPos.y,4.6,6,dt);camera.position.copy(camPos);
  if(G.shake>0){camera.position.x+=(Math.random()-.5)*G.shake;camera.position.y+=(Math.random()-.5)*G.shake;G.shake=Math.max(0,G.shake-dt*0.9);}
  camera.lookAt(t.x+fx*14,1.6+t.pitch*14,t.z+fz*14);camera.fov=damp(camera.fov,62*FOVK(),4,dt);camera.updateProjectionMatrix();hero.root.visible=false;VM.visible=false;}
/* ----- per frame ----- */
function updateHorde(dt){if(!HORDE||G.state!=='play')return;const lv=HLV();G.toSpawn=0;G.between=99;
  // unlimited ammo, no reloading
  const Wp=GUNS[P.weapon];if(Wp&&P.ammo<Wp.mag){P.ammo=Wp.mag;P.reserve=Infinity;P.reloadT=0;}
  HZ.dmg=1+HZ.kills/120;
  const live=enemies.filter(e=>!e.dead).length;HZ.spawnT-=dt;if(HZ.spawnT<=0&&live<lv.cap&&!CH.nozombies){HZ.spawnT=Math.max(0.15,1.2-SET.hordeLvl*0.18);hordeSpawn();}
  updateCrowd(dt);
  if(!HZ.tank&&HZ.kills>=lv.tank)spawnTank();
  HZ.hudT-=dt;if(HZ.hudT<=0){HZ.hudT=0.25;const nd=$('nades');if(nd){const nxt=HZ.tank?'Goal '+lv.win:(()=>{const n=H_TIERS.find(t=>HZ.kills<t[0]*lv.tank);return n?'Next: '+n[2]+' at '+Math.ceil(n[0]*lv.tank):'Tank at '+lv.tank;})();nd.textContent='Kills '+HZ.kills.toLocaleString()+'  \u00b7  '+nxt+(P.tank?'  \u00b7  '+(P.tank.w==='hmg'?'HMG':'Cannon'):'');}}}
