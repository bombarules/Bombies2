/* ================= update ================= */
function update(dt){
  const dead=P.dying>0;if(dead){P.dying+=dt;if(P.dying>2.1&&G.state==='play'){setState('over');}}
  heroBurn(dt);
  const lock=dead||!!(P.car||P.tank)||!!P.kd;const ax=lock?0:clamp(stickVec.x+(input.right?1:0)-(input.left?1:0),-1,1),fwd=lock?0:clamp(-stickVec.y+(input.up?1:0)-(input.down?1:0),-1,1);
  P.turn=0;const maxS=(input.fire||P.aimT>0?2.0:3.6)*(CH.speed?1.7:1);P.sv=damp(P.sv||0,Math.abs(ax)>0.02?Math.sign(ax)*Math.pow(Math.abs(ax),1.3)*maxS:0,Math.abs(ax)>0.02?9:18,dt);if(Math.abs(ax)<0.02&&Math.abs(P.sv)<0.15)P.sv=0;
  const aiming=P.aimT>0||input.fire;const hk=P.hp<35?0.8:1;const maxF=(aiming?2.2:5.4)*hk*(CH.speed?1.9:1),maxB=2.0*(CH.speed?1.6:1);P.sprintT=(fwd>0.9&&!aiming&&P.stance==='stand'&&!(P.car||P.tank))?(P.sprintT||0)+dt:0;const spr=P.sprintT>0.35;const stK=P.stance==='crouch'?0.42:P.stance==='prone'?0.16:1;
  const wading=DEADZONE&&Math.abs(P.x)<A&&Math.abs(P.z)<A&&P.y<0.5;
  let target=(fwd>0?fwd*(spr?7.2*(CH.speed?1.9:1)*hk:maxF):fwd*maxB)*stK;if(P.slideT>0){P.slideT-=dt;target=P.slideV*Math.max(0,P.slideT/0.75);}if(P.landT>0){P.landT-=dt;target*=0.4;}if(wading){target*=0.72;if(Math.abs(P.vel)+Math.abs(P.sv||0)>0.6){P.splT=(P.splT||0)-dt;if(P.splT<=0){P.splT=0.32;splash(P.x,P.z,1);}}}
  P.vel=damp(P.vel,target,Math.abs(fwd)>0.05?7:18,dt);if(Math.abs(fwd)<0.05&&Math.abs(P.vel)<0.15)P.vel=0;
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
  if(P.climb){const L=P.climb;if(P.climbInv&&Math.abs(fwd)<0.2)P.climbInv=false;const up=P.climbInv?-fwd:fwd;
    P.y=clamp(P.y+up*1.9*dt,0,L.y1);P.climbPh+=Math.abs(up)*dt*7;P.x=L.bx-L.nx*0.15;P.z=L.bz-L.nz*0.15;P.yaw=L.yawIn;P.vel=0;
    if(up>0.3&&P.y>=L.y1-0.02){P.climb=null;P.x=L.tx;P.z=L.tz;P.y=L.y1;P.roof=L.roof;P.vy=0;}
    else if(up<-0.3&&P.y<=0.01){P.climb=null;P.y=0;P.roof=-1;P.x=L.bx+L.nx*0.35;P.z=L.bz+L.nz*0.35;}
    if(Math.random()<dt*Math.abs(up)*3)sfx.step();}
  else{const rxs=Math.cos(P.yaw),rzs=-Math.sin(P.yaw);const pos={x:P.x+fx*P.vel*dt+rxs*P.sv*dt,z:P.z+fz*P.vel*dt+rzs*P.sv*dt};if(CH.ghost){const lim=W-0.5;P.x=clamp(pos.x,-lim,lim);P.z=clamp(pos.z,-lim,lim);pos.x=P.x;pos.z=P.z;}else collide(pos,0.4,P.y);P.x=pos.x;P.z=pos.z;
    const gh=groundAt(P.x,P.z,P.y);
    if(P.y>gh+0.02||P.vy>0){P.vy-=22*dt;P.y+=P.vy*dt;P.air=true;if(P.y<=gh){const drop=-P.vy;P.y=gh;if(drop>11)hurtPlayer(Math.round((drop-11)*3));if(drop>8.5){P.landT=0.38;G.shake=Math.max(G.shake,0.12);sfx.thud();}else if(drop>3)noise(0.08,500,200,0.12,'lowpass');P.vy=0;P.air=false;}}else{P.y=gh;P.vy=0;P.air=false;}
    P.roof=P.y>0.5?roofAt(P.x,P.z,P.y):-1;G.ladderHint=null;
    for(const L of ladders){if(P.roof===-1&&P.y<0.2){const d=Math.hypot(P.x-L.bx,P.z-L.bz);if(d<1.4){G.ladderHint='up';if(d<1.0&&fwd>0.5&&(fx*-L.nx+fz*-L.nz)>0.4){P.climb=L;P.y=0.01;P.climbInv=false;break;}}}
      else if(P.roof===L.roof){const d=Math.hypot(P.x-L.ex,P.z-L.ez);if(d<1.5){G.ladderHint='down';if(d<1.1&&fwd>0.5&&(fx*L.nx+fz*L.nz)>0.4){P.climb=L;P.y=L.y1-0.05;P.climbInv=true;break;}}}}}
  const nc=!(P.car||P.tank)&&nearDrivable();const pr=$('prompt');const ub=btnFor('use');const pt=P.car?'Left stick drives'+(ub?' \u00b7 '+ub+' gets out':''):nc?(ub?'Press '+ub+' to drive':'Walk up to drive'):P.climb?'Stick up or down to climb':G.ladderHint==='up'?'Push forward into the ladder to climb':G.ladderHint==='down'?'Walk off the edge at the ladder to climb down':'';if(pr.textContent!==pt)pr.textContent=pt;
  P.runAmt=damp(P.runAmt,(P.vel>3&&!aiming)?1:0,7,dt);P.aimAmt=damp(P.aimAmt,aiming?1:0,12,dt);
  P.fireCD-=dt;P.aimT-=dt;P.recoil*=Math.exp(-dt*14);
  if(P.reloadT>0){P.reloadT-=dt;P.reloadAmt=damp(P.reloadAmt,1,10,dt);if(P.reloadT<=0){if(P.clearing){P.clearing=false;P.jam=false;P.reloadT=0;P.heat=0.3;showMsg('Cleared',0.6);}else{const W=GUNS[P.weapon];const take=Math.min(W.mag-P.ammo,P.reserve);P.ammo+=take;if(P.reserve!==Infinity)P.reserve-=take;P.reloadT=0;drawHud();}}}
  else P.reloadAmt=damp(P.reloadAmt,0,10,dt);
  if(P.tank)driveTank(dt);else if(P.car)driveCar(dt);
  if(!(P.car||P.tank)&&!P.climb&&!dead){const cv=v=>Math.sign(v)*Math.pow(Math.abs(v),1.7);const fine=((P.ads||0)>0.5?0.55:1)/Math.sqrt(Math.max(1,(GUNS[P.weapon].zoom||1)*(P.ads||0)));
    P.lookBoost=Math.abs(stickVec2.x)>0.92?Math.min(1,(P.lookBoost||0)+dt*1.8):Math.max(0,(P.lookBoost||0)-dt*4);
    const ty=cv(stickVec2.x)*(2.3+1.5*P.lookBoost)*fine,tp=cv(stickVec2.y)*1.5*fine*(SET.invertY?-1:1);
    const sx=SENS('sensX'),sy=SENS('sensY');const tyx=ty*sx,tpy=tp*sy;const held=Math.abs(stickVec2.x)+Math.abs(stickVec2.y)>0;
    P.lvx=held?damp(P.lvx||0,tyx,14,dt):0;P.lvy=held?damp(P.lvy||0,tpy,14,dt):0;
    const pend=1-Math.exp(-dt*22);const dyw=(P.pendYaw||0)*pend,dpt=(P.pendPitch||0)*pend;P.pendYaw-=dyw;P.pendPitch-=dpt;
    P.yaw-=P.lvx*dt+dyw;P.pitch=clamp(P.pitch-P.lvy*dt-dpt,-0.85,0.6);}else{P.lvx=0;P.lvy=0;P.pendYaw=0;P.pendPitch=0;}
  updateBreath(dt);stepNade(dt);updateNades(dt);P.throwT=Math.max(0,(P.throwT||0)-dt);
  if(input.fire&&P.jam&&!P.jamTold){P.jamTold=true;sfx.empty();}if(!input.fire)P.jamTold=false;
  if(input.fire&&P.fireCD<=0&&P.reloadT<=0&&!P.climb&&!dead&&P.burn<=0&&!(P.car||P.tank)&&!P.jam&&P.nadeT<0&&!P.kd){if(P.ammo>0)shoot();else if(!P.emptyLatch){P.emptyLatch=true;sfx.empty();if(!startReload())showMsg('Press A to reload',1.2);}}
  if(!input.fire)P.emptyLatch=false;
  hud.ring.classList.toggle('on',P.reloadT>0);if(P.reloadT>0)hud.arc.setAttribute('stroke-dashoffset',(62.8*(P.reloadT/P.reloadMax)).toFixed(1));
  updatePickups(dt);
  {let nd=99;for(const e of enemies)if(!e.dead)nd=Math.min(nd,Math.hypot(e.x-P.x,e.z-P.z));EMO.nearest=nd;
   EMO.arousal=damp(EMO.arousal,Math.max(0.15,clamp(1-nd/10,0,1)*0.85),0.6,dt);EMO.valence=damp(EMO.valence,0,0.12,dt);EMO.hurtT-=dt;VOICE.cd-=dt;VOICE.talkT-=dt;
   P.quietT=nd>14?(P.quietT||0)+dt:0;if(P.quietT>12){P.quietT=0;say('quiet',0.6);}}
  if(HORDE){updateHorde(dt);}else if(G.toSpawn>0){G.spawnT-=dt;if(G.spawnT<=0&&!CH.nozombies&&enemies.filter(e=>!e.dead).length<(SET.hi?16:12)){spawnEnemy();G.toSpawn--;G.spawnT=Math.max(0.6,1.6-G.wave*0.07);}}
  else if(enemies.every(e=>e.dead)&&!(G.boss&&!(G.bossE&&G.bossE.dead))){if(G.between<=0&&haleRelease()){}else if(G.between<=0){G.between=3.2;if(G.wave>0){showMsg('Wave '+G.wave+' cleared',2);emote(0.3,-0.2);say('clear',0.7);}}
    else{G.between-=dt;if(G.between<=0){if(G.wave>0)P.hp=Math.min(P.maxHp||100,P.hp+20);startWave(G.wave+1);}}}
  (dt=>{for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e.boss){updateBoss(e,dt);continue;}
    if(e.dead){e.dead+=dt;e.r.root.rotation.x=Math.min(1.45,e.dead*e.dead*5);e.r.root.position.y=e.y+(e.dead>4?-(e.dead-4)*0.5:0);if(e.burn>0){e.burn-=dt*0.9;}zombieBurnFx(e,dt);
      e.r.armL.sh.rotation.x=damp(e.r.armL.sh.rotation.x,2.6,4,dt);e.r.armR.sh.rotation.x=damp(e.r.armR.sh.rotation.x,2.4,4,dt);if(e.dead>5.5)removeEnemy(e);continue;}
    if(e.snared>0)e.snared-=dt;const th=thinkZombie(e,e.snared>0?dt*0.3:dt),d=th.d,moving=th.moving;
    if(e.burn>0){e.burn-=dt;e.burnPanic-=dt;e.burnTick=(e.burnTick||0)+dt;if(e.burnTick>0.7){e.burnTick=0;damageEnemy(e,1,false,new THREE.Vector3(),true);if(e.dead)continue;}
      if(Math.random()<dt*4)emit('smoke',e.x,e.y+1.9,e.z,0,1.1,0,2.5,0.7,2.5);if(Math.random()<dt*8)spark2(e.x,e.y+1,e.z,(Math.random()-.5)*1.5,2+Math.random()*2,(Math.random()-.5)*1.5,0.5);}
    zombieBurnFx(e,dt);    e.groanT-=dt;if(e.groanT<=0){e.groanT=3+Math.random()*5;e.groanDur=atPos(e.x,1.6,e.z,()=>groan(clamp(1-d/22,0,1)));e.groanT2=0;}
    if(e.atkT>0){e.atkT-=dt;if(e.atkT<0.3&&!e.struck){e.struck=true;if(e.atkAlly){if(Math.hypot(ALLY.x-e.x,ALLY.z-e.z)<1.6)hurtAlly(e.crawl?5:10);}else if(d<1.5)hurtPlayer(e.crawl?5:(e.runner?9:12));}}
    else if(ALLY.alive&&!e.climb&&e.atkCD<=0&&Math.hypot(ALLY.x-e.x,ALLY.z-e.z)<1.25&&e.y<0.5){e.atkT=0.6;e.atkCD=1.2;e.struck=false;e.atkAlly=true;}
    else if(e.mode==='chase'&&!e.climb&&d<1.25&&e.atkCD<=0){e.atkAlly=false;e.atkT=0.6;e.atkCD=e.runner?0.9:1.3;e.struck=false;}
    e.r.root.position.set(e.x,e.y+(e.crawl?0.1:0),e.z);e.r.root.rotation.y=e.yaw;e.r.root.rotation.x=e.crawl?-1.32:0;
    if(DEADZONE){const m=MUT();if(e.mat&&e.mat.emissive)e.mat.emissive.setRGB(0.03*m,0.1*m,0.01*m);if(moving&&d<18&&Math.abs(e.x)<A&&Math.abs(e.z)<A&&Math.random()<dt*(e.runner?5:2.5))splash(e.x,e.z,0.7);}
    if(e.eating&&d<14&&Math.random()<dt*1.6)noise(0.14+Math.random()*0.1,900,350,0.14*(1-d/14),'bandpass');
    if(d>40){e.aSkip=!e.aSkip;if(!e.aSkip)animateZombie(e,dt*2,moving);}else animateZombie(e,dt,moving);}})((CH.slowmo?dt*0.3:dt)*(1+MUT()));
  if(G.state==='play')G.roundT=(G.roundT||0)+dt;
  G.slotT=(G.slotT||0)-dt;if(G.slotT<=0){G.slotT=0.25;assignSlots();updateStealth();}
}
function hurtPlayer(n){if(P.dying||CH.god||P.tank)return;if(P.hp-n<35&&P.hp-n>0)setTimeout(()=>haleEvent('low',0),1200);if(P.car){n*=0.3;P.car.hp-=n;}P.hp-=n;G.shake=0.18;sfx.hurt();buzz(45);emote(-0.35,0.35);EMO.hurtT=0.45;if(P.hp<35&&P.hp>0&&!EMO.lowWarned){EMO.lowWarned=true;say('low',1,true);}else say('hurt',0.4);hud.vig.style.transition='none';hud.vig.style.opacity=1;
  requestAnimationFrame(()=>{hud.vig.style.transition='opacity .5s';hud.vig.style.opacity=P.hp<30?0.5:0;});drawHud();
  if(P.hp<=0&&!P.dying){P.hp=0;drawHud();heroDie();}}

function zombieBurnFx(e,dt){const u=e.mat.userData.bu;if(!u)return;
  if(e.burn>0)e.char=Math.min(1,(e.char||0)+dt*0.32);const k=clamp(e.burn/1.5,0,1);u.burn.value=e.char||0;u.hot.value=k*0.9;
  u.melt.value=e.dead&&(e.char||0)>0.4?Math.min(0.9,e.dead*0.28):0;if(k>0||e.r.flames)setFlames(e.r,k);if(e.r.hairM)e.r.hairM.forEach(m=>m.visible=(e.char||0)<0.6);}
function heroDie(){P.dying=0.001;input.fire=false;P.climb=null;sfx.hurt();if(P.burn>0)sfx.scream();}
function heroBurn(dt){const u=heroMat.userData.bu;
  if(P.burn>0){P.burn-=dt;P.char=Math.min(1,(P.char||0)+dt*0.2);if(!P.dying&&!CH.god){P.hp-=7*dt;P.burnHud=(P.burnHud||0)+dt;if(P.burnHud>0.25){P.burnHud=0;drawHud();hud.vig.style.transition='none';hud.vig.style.opacity=0.7;requestAnimationFrame(()=>{hud.vig.style.transition='opacity .4s';hud.vig.style.opacity=0.2;});}
      P.scrT=(P.scrT||0)-dt;if(P.scrT<=0){P.scrT=0.9+Math.random()*0.6;sfx.scream();}if(P.hp<=0){P.hp=0;drawHud();heroDie();}}
    if(Math.random()<dt*6)emit('smoke',P.x,P.y+1.9,P.z,0,1.2,0,2.5,0.7,2.5);if(Math.random()<dt*10)spark2(P.x+(Math.random()-.5)*0.4,P.y+0.6+Math.random()*1.2,P.z+(Math.random()-.5)*0.4,(Math.random()-.5)*1.5,2+Math.random()*2,(Math.random()-.5)*1.5,0.5);}
  else P.char=Math.max(0,(P.char||0)-dt*0.06);
  if(P.dying&&P.burn>0)P.burn=Math.max(P.burn,1.2);
  const k=clamp(P.burn,0,1);u.burn.value=P.char;u.hot.value=k*0.9;u.melt.value=P.dying&&P.char>0.3?Math.min(0.6,P.dying*0.3):0;setFlames(hero,k);
  hero.hairM.forEach(m=>m.visible=P.char<0.55);}

/* ================= camera ================= */
const camPos=new THREE.Vector3(0.6,1.7,10.5),camLook=new THREE.Vector3(),camRay=new THREE.Raycaster(),_cv=new THREE.Vector3(),_ch=new THREE.Vector3();
const _hv=new THREE.Vector3();
function updateCamera(dt){
  /*DBG*/if(window.__camO){const c=window.__camO;camera.position.set(c[0],c[1],c[2]);camera.lookAt(c[3],c[4],c[5]);camera.fov=c[6];camera.updateProjectionMatrix();return;}/*ENDDBG*/
  if(G.state==='loadout'){G.titleT+=dt;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);const sw=Math.sin(G.titleT*0.3)*0.25;
    {const ov=document.body.classList.contains('overlay'),port=innerHeight>innerWidth;const cd=ov&&port?6.4:5.2;camera.position.set(P.x+fx*cd+rx*sw,1.3,P.z+fz*cd+rz*sw);camera.lookAt(P.x+rx*0.6,ov&&port?0.42:ov?0.65:0.95,P.z+rz*0.6);camera.fov=36;if(camera.view&&camera.view.enabled)camera.clearViewOffset();}
    const gunOnly=LOUI.att&&LOUI.att!=='char';hero.root.visible=!gunOnly;if(gunOnly)updateStage();loLight.intensity=1.1;loLight.position.set(P.x+fx*4+rx*1.5,2.6,P.z+fz*4+rz*1.5);loLight.target.position.set(P.x,1,P.z);loLight.target.updateMatrixWorld();camera.updateProjectionMatrix();camPos.copy(camera.position);VM.visible=false;return;}
  if(camera.view&&camera.view.enabled)camera.clearViewOffset();
  loLight.intensity=0;
  if(G.state==='title'){G.titleT+=dt;const shot=Math.floor(G.titleT/5)%4;const tt=(G.titleT%5)/5;let px,py,pz,lx,ly,lz,fov;
    const fr=(yaw,dist,side,up)=>[-Math.sin(yaw)*dist+Math.cos(yaw)*side,up,-Math.cos(yaw)*dist-Math.sin(yaw)*side];
    if(shot===0){hero.head.getWorldPosition(_hv);const o=fr(P.yaw,0.95-tt*0.15,0.22,0.06);px=_hv.x+o[0];py=_hv.y+0.12+o[1];pz=_hv.z+o[2];lx=_hv.x;ly=_hv.y+0.12;lz=_hv.z;fov=30;}
    else if(shot===1){hero.armR.hand.getWorldPosition(_hv);const o=fr(P.yaw,0.6,0.45-tt*0.2,0.2);px=_hv.x+o[0];py=_hv.y+o[1];pz=_hv.z+o[2];lx=_hv.x-0.06;ly=_hv.y-0.04;lz=_hv.z-0.08;fov=34;}
    else if(shot===2){titleZ.r.head.getWorldPosition(_hv);const zy=titleZ.root.rotation.y;const o=fr(zy,0.9-tt*0.15,-0.15,0.0);px=_hv.x+o[0];py=_hv.y+0.08;pz=_hv.z+o[2];lx=_hv.x;ly=_hv.y+0.1;lz=_hv.z;fov=32;}
    else{const a=Math.PI+0.6-tt*1.2;px=P.x+Math.sin(a)*3.4;py=1.5;pz=P.z+Math.cos(a)*3.4;lx=P.x+0.4;ly=1.2;lz=P.z-0.6;fov=48;}
    camera.position.set(px,py,pz);camera.lookAt(lx,ly,lz);camera.fov=fov;camera.updateProjectionMatrix();camPos.copy(camera.position);return;}
  if(P.kd&&G.state==='play'){updateKnock(dt);}
  if(G.killcam&&G.killcam.e){const e=G.killcam.e;const vx=e.x-P.x,vz=e.z-P.z,L=Math.hypot(vx,vz)||1;const a=Math.atan2(vx,vz)+1.2;
    const px=e.x+Math.sin(a)*2.7,pz=e.z+Math.cos(a)*2.7;camera.position.set(px,e.y+1.25,pz);camera.lookAt(e.x,e.y+0.8,e.z);camera.fov=40;camera.updateProjectionMatrix();hero.root.visible=true;VM.visible=false;return;}
  if(P.tank){tankCamera(dt);return;}
  if(P.car){const c=P.car,fx=-Math.sin(c.ry),fz=-Math.cos(c.ry);const tx=c.x-fx*7.5,tz=c.z-fz*7.5;camPos.x=damp(camPos.x,tx,6,dt);camPos.z=damp(camPos.z,tz,6,dt);camPos.y=damp(camPos.y,3.2,6,dt);
    camera.position.copy(camPos);if(G.shake>0){camera.position.x+=(Math.random()-.5)*G.shake;camera.position.y+=(Math.random()-.5)*G.shake;G.shake=Math.max(0,G.shake-dt*0.8);}
    camera.lookAt(c.x+fx*6,1.0,c.z+fz*6);camera.fov=damp(camera.fov,(60+Math.abs(c.speed)*0.6)*FOVK(),4,dt);camera.updateProjectionMatrix();hero.root.visible=true;VM.visible=false;return;}
  const run=P.runAmt,aim=P.aimAmt,s=P.side,pc=Math.cos(P.pitch),ps=Math.sin(P.pitch);
  let ox=lerp(lerp(0.52,0.4,run),0.48,aim)*s,oy=lerp(lerp(1.7,1.62,run),1.64,aim),oz=lerp(lerp(2.3,2.8,run),1.35,aim);
  if(P.climb){ox=0.35*s;oy=1.2;oz=3.0;}
  oy-=ps*oz*0.55;
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
  P.stanceH=damp(P.stanceH||1,P.slideT>0?0.55:P.stance==='crouch'?0.7:P.stance==='prone'?0.3:1,9,dt);const sd=(1-P.stanceH)*1.15;
  const hx=P.x+rx*ox*0.4,hy=P.y+1.62-sd,hz=P.z+rz*ox*0.4;
  let tx=P.x+rx*ox-fx*oz*pc,ty=P.y+oy-sd*0.85,tz=P.z+rz*ox-fz*oz*pc;const lim=W-0.3;tx=clamp(tx,-lim,lim);tz=clamp(tz,-lim,lim);
  _cv.set(tx-hx,ty-hy,tz-hz);const cd=_cv.length();_cv.normalize();camRay.set(_ch.set(hx,hy,hz),_cv);camRay.far=cd+0.25;
  const ch=camRay.intersectObjects(camBlockers,false);const allow=ch.length?Math.max(0.3,ch[0].distance-0.28):cd;
  P.boom=(P.boom===undefined||P.boomReset)?allow:(allow<P.boom?damp(P.boom,allow,40,dt):damp(P.boom,allow,4,dt));P.boomReset=false;
  camPos.set(hx+_cv.x*P.boom,hy+_cv.y*P.boom,hz+_cv.z*P.boom);
  camera.position.set(camPos.x,camPos.y+Math.sin(P.phase*2)*0.035*run,camPos.z);
  if(G.shake>0){camera.position.x+=(Math.random()-.5)*G.shake;camera.position.y+=(Math.random()-.5)*G.shake;G.shake=Math.max(0,G.shake-dt*0.8);}
  const kp=P.pitch+(P.kick||0),ky=P.yaw+(P.kickYaw||0);const kpc=Math.cos(kp),kps=Math.sin(kp),kfx=-Math.sin(ky),kfz=-Math.cos(ky);
  camLook.set(P.x+rx*ox*0.95+kfx*kpc*14,P.y+1.45+kps*14,P.z+rz*ox*0.95+kfz*kpc*14);
  const want=(((input.fire&&!P.jam)||P.adsHold||SET.view==='first')&&P.nadeT<0&&!P.climb&&P.burn<=0&&!P.dying&&!(P.car||P.tank)&&!P.kd&&G.state==='play')?1:0;P.fpv=damp(P.fpv||0,want,want?16:9,dt);
  if(P.fpv>0.01){hero.head.getWorldPosition(_hv);const ex=_hv.x+fx*0.16,ey=_hv.y+0.11,ez=_hv.z+fz*0.16;const f=P.fpv*P.fpv*(3-2*P.fpv);
    camera.position.lerp(_ch.set(ex,ey,ez),f);camLook.lerp(_cv.set(ex+kfx*kpc*14,ey+kps*14,ez+kfz*kpc*14),f);}
  camera.lookAt(camLook);camera.rotateZ(Math.sin(P.phase)*0.01*run*(1-P.fpv));
  hero.root.visible=P.fpv<0.55;VM.visible=P.fpv>=0.55;if(VM.visible)updateViewModel(dt);else $('scopeov').className='';
  P.kick=(P.kick||0)*Math.exp(-dt*7);P.kickYaw=(P.kickYaw||0)*Math.exp(-dt*7);
  // apply recoil climb quickly, then the hands bring the gun most of the way back down once you stop firing
  if(G.state==='play'){const ap=(P.rcP||0)*Math.min(1,dt*22),ay=(P.rcY||0)*Math.min(1,dt*22);P.pitch=clamp(P.pitch+ap,-0.85,0.6);P.yaw-=ay;P.rcP-=ap;P.rcY-=ay;P.rcAcc=(P.rcAcc||0)+ap;
    P.rcT=(P.rcT||0)-dt;if(P.rcT<=0&&P.rcAcc>0){const r=P.rcAcc*Math.min(1,dt*6);P.pitch=clamp(P.pitch-r*0.8,-0.85,0.6);P.rcAcc-=r;}}
  {const zf=GUNS[P.weapon].zoom||1;camera.fov=damp(camera.fov,lerp(lerp(lerp(lerp(62,70,run),50,aim),54,P.fpv)*FOVK(),zf>1?54/zf:48*FOVK(),(P.ads||0)*P.fpv),zf>1?14:10,dt);}camera.updateProjectionMatrix();}

/* ================= fx ================= */
function updateFx(dt){
  if(flash.visible){flash.userData.t-=dt;if(flash.userData.t<=0)flash.visible=false;}muzzleLight.intensity=Math.max(0,muzzleLight.intensity-dt*45);
  for(const k of sparks){if(k.life<=0)continue;k.life-=dt;const t=k.life/k.max;k.s.scale.setScalar(k.size*(1.3-t*0.7));k.s.material.opacity=t;k.s.position.y+=k.vy*dt;if(k.life<=0)k.s.visible=false;}
  for(const t of tracers){if(t.life<=0)continue;t.life-=dt;t.l.material.opacity=t.life/0.05;if(t.life<=0)t.l.visible=false;}
  for(const c of casings){if(c.life<=0)continue;c.life-=dt;c.v.y-=9.8*dt;c.m.position.addScaledVector(c.v,dt);c.m.rotation.x+=c.spin*dt;c.m.rotation.z+=c.spin*0.7*dt;
    if(c.m.position.y<0.01){c.m.position.y=0.01;c.v.y=Math.abs(c.v.y)*0.35;c.v.x*=0.6;c.v.z*=0.6;c.spin*=0.6;}if(c.life<=0)c.m.visible=false;}
  const cur=parseFloat(hud.x.style.getPropertyValue('--s'))||9;hud.x.style.setProperty('--s',damp(cur,P.runAmt>0.5?14:9,10,dt).toFixed(1)+'px');
  if(msgTimer>0){msgTimer-=dt;if(msgTimer<=0)hud.msg.classList.remove('on');}
  const fl=Math.random();flick.intensity=G.time%7<0.6?(fl>0.5?1.1:0.05):(fl>0.985?0.1:0.9);
  if(titleZ.root.visible){titleZ.st=titleZ.st||{r:titleZ.r,t:0,stagger:0,atkT:0,limp:1,runner:false,speed:1,seen:true,lookYaw:0};animateZombie(titleZ.st,dt,false);}
}
/* ================= cinematic post-processing: bloom, filmic tone, color grade, lens effects ================= */
const Q={post:true,reflect:true};
const isGL2=renderer.capabilities.isWebGL2;
const rtType=isGL2?THREE.HalfFloatType:THREE.UnsignedByteType;
function mkRT(){return new THREE.WebGLRenderTarget(4,4,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,type:rtType,depthBuffer:false});}
const sceneRT=(isGL2&&THREE.WebGLMultisampleRenderTarget)?new THREE.WebGLMultisampleRenderTarget(4,4,{type:rtType}):new THREE.WebGLRenderTarget(4,4,{type:rtType});
if(sceneRT.samples!==undefined)sceneRT.samples=4;
const bl=[[mkRT(),mkRT()],[mkRT(),mkRT()],[mkRT(),mkRT()]];
const postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),postScene=new THREE.Scene();
const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));quad.frustumCulled=false;postScene.add(quad);
const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
const brightMat=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null}},vertexShader:VS,depthTest:false,depthWrite:false,
  fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(0.9,1.6,l),1.0);}'});
const blurMat=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},dir:{value:new THREE.Vector2()}},vertexShader:VS,depthTest:false,depthWrite:false,
  fragmentShader:'uniform sampler2D tDiffuse;uniform vec2 dir;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*0.2270;'+
  'c+=(texture2D(tDiffuse,vUv+dir*1.3846).rgb+texture2D(tDiffuse,vUv-dir*1.3846).rgb)*0.3162;'+
  'c+=(texture2D(tDiffuse,vUv+dir*3.2308).rgb+texture2D(tDiffuse,vUv-dir*3.2308).rgb)*0.0703;gl_FragColor=vec4(c,1.0);}'});
const compMat=new THREE.ShaderMaterial({uniforms:{tScene:{value:null},b1:{value:null},b2:{value:null},b3:{value:null},uTime:{value:0}},vertexShader:VS,depthTest:false,depthWrite:false,
  fragmentShader:`uniform sampler2D tScene;uniform sampler2D b1;uniform sampler2D b2;uniform sampler2D b3;uniform float uTime;varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){
    vec2 d=vUv-0.5;float r2=dot(d,d);
    vec2 ca=d*0.024*r2;
    vec3 c=vec3(texture2D(tScene,vUv+ca).r,texture2D(tScene,vUv).g,texture2D(tScene,vUv-ca).b);
    vec3 bloom=texture2D(b1,vUv).rgb*0.55+texture2D(b2,vUv).rgb*0.75+texture2D(b3,vUv).rgb*0.9;
    c+=bloom*0.85;
    c*=1.12;
    c=(c*(2.51*c+0.03))/(c*(2.43*c+0.59)+0.14);
    float l=dot(c,vec3(0.299,0.587,0.114));
    c=mix(vec3(l),c,1.15);
    c*=mix(vec3(0.9,0.97,1.1),vec3(1.06,1.0,0.9),smoothstep(0.1,0.8,l));
    c=(c-0.5)*1.06+0.5;
    c*=1.0-r2*1.1;
    c+=(hash(vUv*vec2(1231.0,977.0)+fract(uTime))-0.5)*0.035;
    gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
  }`});
const pSize=new THREE.Vector2();
function sizeRTs(){renderer.getDrawingBufferSize(pSize);const w=pSize.x|0,h=pSize.y|0;
  if(sceneRT.width!==w||sceneRT.height!==h){sceneRT.setSize(w,h);
    for(let i=0;i<3;i++){const f=2<<i,bw=Math.max(2,w/f|0),bh=Math.max(2,h/f|0);bl[i][0].setSize(bw,bh);bl[i][1].setSize(bw,bh);}}}
function pass(mat,target){quad.material=mat;renderer.setRenderTarget(target);renderer.render(postScene,postCam);}
function blur(src,pair){const w=pair[0].width,h=pair[0].height;
  blurMat.uniforms.tDiffuse.value=src;blurMat.uniforms.dir.value.set(1/w,0);pass(blurMat,pair[0]);
  blurMat.uniforms.tDiffuse.value=pair[0].texture;blurMat.uniforms.dir.value.set(0,1/h);pass(blurMat,pair[1]);}
function renderFrame(){
  if(!Q.post){renderer.setRenderTarget(null);renderer.render(RS.scene,RS.cam);return;}
  sizeRTs();
  renderer.setRenderTarget(sceneRT);renderer.render(RS.scene,RS.cam);
  brightMat.uniforms.tDiffuse.value=sceneRT.texture;pass(brightMat,bl[0][1]);
  blur(bl[0][1].texture,bl[0]);blur(bl[0][1].texture,bl[1]);blur(bl[1][1].texture,bl[2]);
  const u=compMat.uniforms;u.tScene.value=sceneRT.texture;u.b1.value=bl[0][1].texture;u.b2.value=bl[1][1].texture;u.b3.value=bl[2][1].texture;u.uTime.value=G.time;
  pass(compMat,null);
}
const DUST=200,dustGeo=new THREE.BufferGeometry(),dp=new Float32Array(DUST*3),dv=[];
for(let i=0;i<DUST;i++){dp[i*3]=(Math.random()*2-1)*12;dp[i*3+1]=Math.random()*4.2;dp[i*3+2]=(Math.random()*2-1)*12;dv.push(Math.random()*6.28);}
dustGeo.setAttribute('position',new THREE.BufferAttribute(dp,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({map:glowTex,color:0xcfd6e0,size:0.05,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));dust.frustumCulled=false;scene.add(dust);
function updateDust(dt){for(let i=0;i<DUST;i++){const k=i*3;dv[i]+=dt*0.25;dp[k]+=Math.sin(dv[i])*0.08*dt;dp[k+1]+=Math.cos(dv[i]*0.7)*0.05*dt;dp[k+2]+=Math.cos(dv[i])*0.08*dt;
  const dy=dp[k+1]-P.y;if(dy>4.4)dp[k+1]-=4.4;if(dy<-0.2)dp[k+1]+=4.4;const dx=dp[k]-P.x,dz=dp[k+2]-P.z;if(dx>12)dp[k]-=24;if(dx<-12)dp[k]+=24;if(dz>12)dp[k+2]-=24;if(dz<-12)dp[k+2]+=24;}
  dustGeo.attributes.position.needsUpdate=true;}
let perfT=0,perfN=0,perfDone=false;
function perfCheck(dt){if(perfDone||G.state!=='play')return;perfT+=dt;perfN++;if(perfN>=150){perfDone=true;const avg=perfT/perfN;
  if(avg>0.03){Q.post=false;Q.reflLow=true;if(MAP!=='park'){Q.reflect=false;reflUniforms.uWet.value=0;}}else if(avg>0.022){Q.reflLow=true;if(MAP!=='park'){Q.reflect=false;reflUniforms.uWet.value=0;}}}}

/* ================= settings ================= */
const SET={hi:true,voice:true,master:1,music:0.6,sfx:1,drift:3,sensX:3,sensY:3,fov:80,hz:120,fps:120};try{const s=JSON.parse(localStorage.getItem('sb-outbreak-set')||'{}');Object.assign(SET,s);}catch(e){}if(!SET.quality)SET.quality=SET.hi?'high':'smooth';
function applyVolumes(){if(!AC)return;const t=AC.currentTime;MASTERB.gain.setTargetAtTime(SET.master??1,t,0.03);SFXB.gain.setTargetAtTime(SET.sfx??1,t,0.03);MUSB.gain.setTargetAtTime(SET.music??0.6,t,0.03);}
// dark ambient score: low minor drone with a slow filter sweep, sparse plucked notes, a heartbeat pulse that rises in a fight
let MUS=null;
function startMusic(){if(!AC||MUS)return;const t=AC.currentTime;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.Q.value=4;const dg=AC.createGain();dg.gain.value=0.0001;dg.gain.linearRampToValueAtTime(0.09,t+4);lp.connect(dg);dg.connect(MUSB);
  const oscs=[55,55.4,82.4,130.8].map((f,i)=>{const o=AC.createOscillator();o.type=i<2?'sawtooth':'triangle';o.frequency.value=f;const g=AC.createGain();g.gain.value=i<2?0.35:0.22;o.connect(g);g.connect(lp);o.start();return o;});
  const lfo=AC.createOscillator();lfo.frequency.value=0.06;const lg=AC.createGain();lg.gain.value=320;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
  MUS={lp,dg,oscs,next:t+2,beat:t+1,step:0};}
const SCALE=[220,261.6,293.7,329.6,392,440,523.3];
function updateMusic(){if(!AC||!MUS)return;const t=AC.currentTime;const fight=G.state==='play'&&(DEADZONE&&G.toSpawn>0||enemies.some(e=>!e.dead&&e.mode==='chase'));
  if(t>MUS.next){MUS.next=t+(fight?1.2:2.4)+Math.random()*1.5;const f=SCALE[(Math.random()*SCALE.length)|0]*(Math.random()<0.3?0.5:1);const o=AC.createOscillator();o.type='triangle';o.frequency.value=f;const g=AC.createGain();
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.05,t+0.02);g.gain.exponentialRampToValueAtTime(0.0005,t+2.2);const dl=AC.createDelay();dl.delayTime.value=0.38;const fb=AC.createGain();fb.gain.value=0.35;
    o.connect(g);g.connect(MUSB);g.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(MUSB);o.start(t);o.stop(t+2.4);}
  if(fight&&t>MUS.beat){MUS.beat=t+(DEADZONE?Math.max(0.42,0.85-(G.roundT||0)/180):0.85);for(const [d,v] of[[0,0.16],[0.22,0.1]]){const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(70,t+d);o.frequency.exponentialRampToValueAtTime(38,t+d+0.18);const g=AC.createGain();g.gain.setValueAtTime(v,t+d);g.gain.exponentialRampToValueAtTime(0.001,t+d+0.22);o.connect(g);g.connect(MUSB);o.start(t+d);o.stop(t+d+0.25);}}
  else if(!fight)MUS.beat=Math.max(MUS.beat,t);}
function saveSet(){try{localStorage.setItem('sb-outbreak-set',JSON.stringify(SET));}catch(e){}}
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(SET.quality==='ultra'){SET.quality='high';saveSet();setTimeout(()=>location.reload(),300);}});
function applySet(){const q=SET.quality;SET.hi=q!=='smooth';renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,q==='ultra'?(innerWidth<900?2:2.5):q==='high'?1.75:1));
  const sm=q==='ultra'?(innerWidth<900?3072:4096):q==='high'?2048:1024;if(sun.shadow.mapSize.x!==sm){sun.shadow.mapSize.set(sm,sm);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}Q.ultra=q==='ultra';
  Q.post=SET.hi;Q.reflect=SET.hi||MAP==='park';Q.reflLow=!SET.hi;sun.castShadow=SET.hi;reflUniforms.uWet.value=SET.hi?0.3:0;perfDone=!SET.hi?true:perfDone;}

/* ================= Alley Shot: pop-up target mini-game ================= */
const RS={scene,cam:camera};
const AL={kx:1,scene:new THREE.Scene(),cam:new THREE.PerspectiveCamera(48,1,0.1,200),built:false,x:0,cards:[],round:1,score:0,misses:0,enc:0,phase:'scroll',seg:1,timer:0,tmax:2.6,
  cx:0,cy:0,best:0,pool:null,speed:6,resolveT:0,segs:[]};
try{AL.best=parseInt(localStorage.getItem('sb-alley-best')||'0',10)||0;}catch(e){}
const GOOD_LOOKS=[
  {skin:[0.85,0.66,0.55],hair:[0.12,0.09,0.07],age:0.3,shirt:{kind:'office',base:[0.15,0.2,0.4],tie:[0.05,0.05,0.08]},pants:[0.1,0.12,0.2],shoes:[0.05,0.05,0.05],sleeves:'short',iris:[0.2,0.3,0.4],seed:21},
  {skin:[0.55,0.38,0.28],hair:[0.06,0.05,0.04],age:0.2,shirt:{kind:'tee',base:[0.2,0.55,0.55]},pants:[0.2,0.5,0.52],shoes:[0.85,0.85,0.85],sleeves:'short',iris:[0.25,0.18,0.12],seed:22},
  {skin:[0.86,0.7,0.6],hair:[0.75,0.74,0.72],age:1,stubble:0.3,stubbleCol:[0.6,0.6,0.58],shirt:{kind:'plaid',base:[0.6,0.5,0.3]},pants:[0.35,0.3,0.25],shoes:[0.2,0.14,0.1],sleeves:'long',iris:[0.3,0.35,0.4],seed:23}];
function portrait(G_,pose){const ps=new THREE.Scene();ps.add(new THREE.HemisphereLight(0xdfe6f0,0x403830,0.9));const dl=new THREE.DirectionalLight(0xffffff,0.9);dl.position.set(1.5,3,-4);ps.add(dl);
  const h=buildHuman(G_,humanMat);ps.add(h.root);h.root.children.forEach(c=>{if(c.material&&c.material.map===blobTex)c.visible=false;});
  if(pose==='zombie'){h.armL.sh.rotation.set(1.3,0,0.2);h.armR.sh.rotation.set(1.15,0,-0.25);h.armL.el.rotation.x=0.3;h.armR.el.rotation.x=0.35;h.torso.rotation.x=-0.18;h.head.rotation.set(0.15,0,0.25);h.face.mouth.scale.y=0.06;h.face.mouth.visible=true;h.face.lids.forEach(l=>l.rotation.x=0.15);}
  else if(pose==='hero'){h.armR.sh.rotation.set(0.25,0,-0.15);h.armL.sh.rotation.set(0.2,0,0.15);h.armR.el.rotation.x=0.3;h.armL.el.rotation.x=0.3;}
  else{h.armL.sh.rotation.set(2.3,0,0.55);h.armR.sh.rotation.set(2.3,0,-0.55);h.armL.el.rotation.x=1.25;h.armR.el.rotation.x=1.25;h.face.lids.forEach(l=>l.rotation.x=0.65);
    h.face.brows.forEach(b=>{b.position.y=0.3;});h.face.mouth.scale.y=0.05;h.face.mouth.visible=true;}
  const pc=new THREE.PerspectiveCamera(30,320/400,0.1,20);pc.position.set(0,1.5,-2.55);pc.lookAt(0,1.44,0);
  const rt=new THREE.WebGLRenderTarget(320,400);const prevC=renderer.getClearColor(new THREE.Color()),prevA=renderer.getClearAlpha();
  renderer.setRenderTarget(rt);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(ps,pc);renderer.setRenderTarget(null);renderer.setClearColor(prevC,prevA);
  return rt.texture;}
const THEMES=[
  {name:'apartments',h:10,slots:[[-3.6,1],[0,1],[3.6,1],[-3.6,5.2],[0,5.2],[3.6,5.2]],draw:(g,w,h,night)=>{g.fillStyle='#7a4a36';g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=8)for(let x=(y/8)%2?-8:0;x<w;x+=16){const v=Math.random()*26-13;g.fillStyle=`rgb(${120+v|0},${74+v|0},${54+v|0})`;g.fillRect(x+1,y+1,14,6);}
    for(const fy of[1,5.2])for(const fx of[-3.6,0,3.6]){const X=(fx*AL.kx+6)*32,Y=h-(fy+2.3)*32;g.fillStyle='#3b3a38';g.fillRect(X-30,Y-6,60,82);g.fillStyle=night&&Math.random()<0.5?'#c8924a':'#121418';g.fillRect(X-26,Y-2,52,74);g.fillStyle='#9a9288';g.fillRect(X-34,h-fy*32-2,68,8);}
    g.fillStyle='#5a3a2c';g.fillRect(0,h-4.2*32,w,8);}},
  {name:'shops',h:7.5,slots:[[-3.4,0],[0,0.8],[3.4,0],[-3,4.4],[3,4.4]],draw:(g,w,h,night)=>{g.fillStyle='#d8cfc0';g.fillRect(0,0,w,h);speckle(g,w,h,2500,150,60,.25);
    const col=['#8a1f1f','#1f4a8a','#2a6a3a','#8a6a1f'][Math.random()*4|0];g.fillStyle=col;g.fillRect(0,h-3.6*32,w,0.7*32);
    g.fillStyle='#f0e6d0';g.font='bold 18px Arial';g.textAlign='center';g.fillText(['HARDWARE','PHARMACY','DINER','PAWN SHOP','GROCERY'][Math.random()*5|0],w/2,h-3.12*32);
    for(const fx of[-3.4,3.4]){const X=(fx*AL.kx+6)*32;g.fillStyle='#2a2a2a';g.fillRect(X-26,h-2.7*32,52,2.7*32);g.fillStyle=night?'#40321e':'#101214';g.fillRect(X-22,h-2.6*32,44,2.6*32);}
    const dw=4*32*AL.kx,dx=(6-2*AL.kx)*32;g.fillStyle='#2a2a2a';g.fillRect(dx,h-2.7*32,dw,1.95*32);g.fillStyle=night?'#6a5030':'#141820';g.fillRect(dx+4,h-2.62*32,dw-8,1.8*32);
    for(const fx of[-3,3]){const X=(fx*AL.kx+6)*32,Y=h-(4.4+2.2)*32;g.fillStyle='#4a4a46';g.fillRect(X-28,Y-4,56,78);g.fillStyle=night&&Math.random()<0.5?'#c8924a':'#16181c';g.fillRect(X-24,Y,48,70);}}},
  {name:'warehouse',h:6.5,slots:[[-4.2,1.4],[0,0],[4.2,1.4],[-1.6,0],[1.6,0]],draw:(g,w,h,night)=>{g.fillStyle='#6a7076';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle=x%16?'#5e646a':'#737a80';g.fillRect(x,0,4,h);}
    for(let i=0;i<18;i++){g.fillStyle='rgba(110,60,30,.35)';g.fillRect(Math.random()*w,Math.random()*h,6+Math.random()*30,10+Math.random()*60);}
    const rw=5*32*Math.max(0.6,AL.kx),rx=6*32-rw/2;g.fillStyle='#2e3236';g.fillRect(rx,h-3.4*32,rw,3.4*32);g.fillStyle='#1a1c1e';for(let y=h-3.3*32;y<h;y+=10)g.fillRect(rx+3,y,rw-6,6);
    for(const fx of[-4.2,4.2]){const X=(fx*AL.kx+6)*32,Y=h-(1.4+2)*32;g.fillStyle='#2a2c2e';g.fillRect(X-26,Y-4,52,68);g.fillStyle=night?'#4a3a22':'#121416';g.fillRect(X-22,Y,44,60);}
    g.fillStyle='#d1a321';g.fillRect(0,h-12,w,12);}}];
function facadeTexFor(th,night){return canvasTex(384,Math.round(th.h*32),(g,w,h)=>th.draw(g,w,h,night));}
const cardBackTex=canvasTex(128,256,(g,w,h)=>{g.fillStyle='#b48a58';g.fillRect(0,0,w,h);speckle(g,w,h,1500,140,60,.35);g.strokeStyle='#5a3f22';g.lineWidth=8;g.strokeRect(4,4,w-8,h-8);});
const holeTex=canvasTex(32,32,g=>{const gr=g.createRadialGradient(16,16,1,16,16,15);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(0.35,'rgba(20,10,5,.9)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);});
function buildAlley(){if(AL.built)return;AL.built=true;const S=AL.scene;
  S.background=new THREE.Color(0x8fb0d0);S.fog=new THREE.Fog(0x8fb0d0,30,80);
  AL.hemi=new THREE.HemisphereLight(0xeaf0ff,0x5a5040,0.75);S.add(AL.hemi);AL.sun=new THREE.DirectionalLight(0xfff0d8,0.9);AL.sun.position.set(-6,12,10);S.add(AL.sun);
  const swTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#8c8a86';g.fillRect(0,0,w,h);speckle(g,w,h,4000,120,60,.4);g.strokeStyle='rgba(40,40,40,.5)';g.lineWidth=2;for(let x=0;x<=w;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();},[30,2]);
  AL.walk=new THREE.Mesh(new THREE.PlaneGeometry(120,4),new THREE.MeshLambertMaterial({map:swTex}));AL.walk.rotation.x=-Math.PI/2;AL.walk.position.set(0,0,2);S.add(AL.walk);
  const rdTex=canvasTex(256,128,(g,w,h)=>{g.fillStyle='#34343a';g.fillRect(0,0,w,h);speckle(g,w,h,5000,40,50,.5);g.fillStyle='#d8c050';for(let x=0;x<w;x+=64)g.fillRect(x,h*0.62,36,5);},[15,1]);
  AL.road=new THREE.Mesh(new THREE.PlaneGeometry(120,12),new THREE.MeshLambertMaterial({map:rdTex}));AL.road.rotation.x=-Math.PI/2;AL.road.position.set(0,-0.01,10);S.add(AL.road);
  const curb=new THREE.Mesh(new THREE.BoxGeometry(120,0.15,0.3),new THREE.MeshLambertMaterial({color:0xa09c96}));curb.position.set(0,0.07,4);S.add(curb);AL.curb=curb;
  for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(12,1,0.6),new THREE.MeshLambertMaterial({color:0xffffff}));S.add(m);AL.segs.push({m,k:-99});}
  AL.flash=new THREE.Sprite(new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));AL.flash.visible=false;S.add(AL.flash);
  AL.texCache={};}
function themeFor(k){return THEMES[((k%3)+3)%3];}
function nightLevel(){return Math.min(1,(AL.round-1)/3);}
function placeSegments(){const kc=Math.round(AL.x/12);for(let i=0;i<4;i++){const k=kc-1+i;const S=AL.segs.find(s=>s.k===k);if(S)continue;
  const free=AL.segs.find(s=>s.k<kc-1||s.k>kc+2);if(!free)continue;free.k=k;const th=themeFor(k);const night=nightLevel()>0.6;const key=th.name+(night?'n':'d')+(k%2)+AL.kx;
  if(!AL.texCache[key])AL.texCache[key]=facadeTexFor(th,night);free.m.material.map=AL.texCache[key];free.m.material.needsUpdate=true;
  free.m.scale.set(1,th.h,1);free.m.position.set(k*12,th.h/2,-0.3);}}
function startAlley(){initAudio();goFull();showMsg('Loading\u2026',0.5);setTimeout(()=>{buildAlley();buildAlleyPool();
  AL.cards.forEach(c=>releaseChar(c));Object.assign(AL,{vel:0,x:0,cards:[],round:1,score:0,misses:0,enc:0,phase:'scroll',seg:1,timer:0,tmax:2.6,speed:6,cx:0,cy:0,resolveT:0});
  AL.kx=(innerWidth/innerHeight)<0.75?0.56:1;AL.texCache={};AL.segs.forEach(s=>s.k=-99);applyAlleyLight();placeSegments();setState('alley');showMsg('Round 1',1.6);drawAlleyHud();},30);}
function applyAlleyLight(){const n=nightLevel();const sky=new THREE.Color(0x8fb0d0).lerp(new THREE.Color(0xd08a5a),Math.min(1,n*2)).lerp(new THREE.Color(0x121828),Math.max(0,n*2-1));
  AL.scene.background.copy(sky);AL.scene.fog.color.copy(sky);AL.hemi.intensity=0.5-0.25*n;AL.sun.intensity=0.55-0.35*n;AL.sun.color.setHex(n>0.3?0xffb070:0xfff0d8);}
function buildAlleyPool(){if(AL.pool)return;AL.pool={bad:[],good:[]};
  const mk=(G_,bad,kind)=>{const mat=humanMat.clone();addBurn(mat);const r=buildHuman(G_,mat);r.root.rotation.order='YXZ';r.root.visible=false;AL.scene.add(r.root);
    r.root.children.forEach(c=>{if(c.material&&c.material.map===blobTex)c.visible=false;});
    const mats=new Set();r.root.traverse(o=>{if(o.isMesh&&o.material)mats.add(o.material);});r.fs=faceState();return {r,mats:[...mats],bad,kind,busy:false};};
  for(let i=0;i<ZLOOKS.length;i++)AL.pool.bad.push(mk(zGeos(i),true,['reach','pound','lurch'][i%3]));
  GOOD_LOOKS.forEach((l,i)=>AL.pool.good.push(mk(buildBodyGeos(Object.assign({poseR:'relax',poseL:'relax'},l)),false,i===2?'hands':'wave')));
  AL.pool.good.push(mk(buildBodyGeos(Object.assign({},HERO_LOOK,{hi:false,poseR:'relax',poseL:'relax'})),false,'hands'));
  renderer.localClippingEnabled=true;
  AL.blood=[];for(let i=0;i<10;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x5a0606,transparent:true,depthWrite:false}));s.visible=false;AL.scene.add(s);AL.blood.push({s,t:0,v:new THREE.Vector3()});}
  AL.key=new THREE.DirectionalLight(0xfff4e8,0.45);AL.key.position.set(0,4,12);AL.scene.add(AL.key);AL.scene.add(AL.key.target);}
function slotRect(th,sx,sy){const kx=AL.kx,cx=sx*kx;
  if(th.name==='apartments')return {cx,y0:sy+0.05,y1:sy+2.36,w:1.62,door:false};
  if(th.name==='shops'){if(sy===0)return {cx,y0:0,y1:2.6,w:1.37,door:true};if(sy===0.8)return {cx:0,y0:0.82,y1:2.62,w:Math.max(1.6,4*kx-0.25),door:false};return {cx,y0:4.41,y1:6.6,w:1.5,door:false};}
  if(sy>1)return {cx,y0:1.525,y1:3.4,w:1.37,door:false};return {cx,y0:0,y1:3.35,w:1.5,door:true};}
const hitPlaneMat=new THREE.MeshBasicMaterial({visible:false});
function spawnEncounter(k){const th=themeFor(k);const slots=th.slots.slice().sort(()=>Math.random()-0.5);const n=Math.min(slots.length,AL.round>=3?3:2+(Math.random()<0.4?1:0));
  let enemies=0;const list=[];for(let i=0;i<n;i++){let bad=Math.random()<0.6;if(i===n-1&&enemies===0)bad=true;if(bad)enemies++;list.push(bad);}
  const used=[];
  list.forEach((bad,i)=>{const [sx,sy]=slots[i];const R=slotRect(th,sx,sy);if(used.some(u=>Math.abs(u-R.cx)<1.2&&R.door))return;used.push(R.cx);
    const pool=(bad?AL.pool.bad:AL.pool.good).filter(p=>!p.busy);if(!pool.length)return;const P_=pool[Math.random()*pool.length|0];P_.busy=true;
    const wx=k*12+R.cx;const planes=[new THREE.Plane(new THREE.Vector3(1,0,0),-(wx-R.w/2)),new THREE.Plane(new THREE.Vector3(-1,0,0),wx+R.w/2),new THREE.Plane(new THREE.Vector3(0,1,0),-R.y0),new THREE.Plane(new THREE.Vector3(0,-1,0),R.y1)];
    P_.mats.forEach(m=>{m.clippingPlanes=planes;m.needsUpdate=true;});
    const sc=R.door?1.25:1.6;const r=P_.r;r.root.scale.setScalar(sc);r.root.rotation.set(0,Math.PI,0);r.root.visible=true;
    const hp=new THREE.Mesh(new THREE.PlaneGeometry(R.w,R.y1-R.y0),hitPlaneMat);hp.position.set(wx,(R.y0+R.y1)/2,0.5);AL.scene.add(hp);
    AL.cards.push({p:P_,r,R,wx,sc,hp,bad,state:'wait',t:-(i*0.3+Math.random()*0.25),rise:0,act:P_.kind,ph:Math.random()*6,hitT:0});});
  AL.timer=AL.tmax;AL.phase='stop';}
function placeChar(c){const r=c.r,R=c.R,e=1-Math.pow(1-c.rise,3);
  if(R.door){r.root.position.set(c.wx-(1-e)*1.1,0+(c.state==='hit'?-c.hitT*0.6:0),0.2+(c.state==='lunge'?c.hitT*1.6:0));}
  else{r.root.position.set(c.wx,R.y0-1.04*c.sc-0.08-(1-e)*1.7-(c.state==='hit'||c.state==='down'?c.hitT*1.8:0),0.06+(c.state==='lunge'?c.hitT*1.6:0));}}
function animChar(c,dt){const r=c.r,t=(c.ph+=dt);const bad=c.bad;let mouth=0,brow=0,furrow=0,lid=0.45;
  r.hips.position.set(0,1.04,0);r.hips.rotation.set(0,0,0);r.legL.hp.rotation.set(0,0,0);r.legR.hp.rotation.set(0,0,0);r.legL.kn.rotation.set(0,0,0);r.legR.kn.rotation.set(0,0,0);
  if(bad){const lungeK=c.state==='lunge'?1:0;
    if(c.act==='pound'){const b=Math.max(0,Math.sin(t*7));r.armL.sh.rotation.set(2.2-b*0.9,0,0.3);r.armR.sh.rotation.set(2.2-Math.max(0,Math.sin(t*7+2))*0.9,0,-0.3);r.armL.el.rotation.x=0.5;r.armR.el.rotation.x=0.5;r.torso.rotation.set(-0.15+b*0.05,0,0);}
    else if(c.act==='lurch'){r.torso.rotation.set(-0.35+Math.sin(t*2.2)*0.12,Math.sin(t*1.4)*0.25,Math.sin(t*1.8)*0.12);r.armL.sh.rotation.set(1.1+Math.sin(t*3)*0.3,0,0.4);r.armR.sh.rotation.set(0.6+Math.sin(t*2.6)*0.4,0,-0.2);r.armL.el.rotation.x=0.3;r.armR.el.rotation.x=0.6;}
    else{r.armL.sh.rotation.set(1.35+Math.sin(t*2.4)*0.18+lungeK*0.3,0,0.18);r.armR.sh.rotation.set(1.25+Math.sin(t*2.1+1)*0.2+lungeK*0.3,0,-0.2);r.armL.el.rotation.x=0.25;r.armR.el.rotation.x=0.3;r.torso.rotation.set(-0.25+Math.sin(t*1.6)*0.06,0,0);}
    r.head.rotation.set(0.15+Math.sin(t*1.3)*0.08,Math.sin(t*0.9)*0.2,0.25*Math.sin(t*0.7));mouth=0.55+0.35*Math.abs(Math.sin(t*3.1));furrow=0.8;lid=0.22;}
  else if(c.act==='wave'){r.armL.sh.rotation.set(2.75+Math.sin(t*9)*0.25,0,0.35+Math.sin(t*9)*0.35);r.armR.sh.rotation.set(2.75+Math.sin(t*9+1.5)*0.25,0,-0.35-Math.sin(t*9+1.5)*0.35);
    r.armL.el.rotation.x=0.4;r.armR.el.rotation.x=0.4;r.torso.rotation.set(0.05,Math.sin(t*3)*0.1,0);r.head.rotation.set(-0.05,Math.sin(t*2)*0.15,0);mouth=0.35+0.35*Math.abs(Math.sin(t*6));brow=0.9;lid=0.7;}
  else{r.armL.sh.rotation.set(2.35,0,0.6);r.armR.sh.rotation.set(2.35,0,-0.6);r.armL.el.rotation.x=1.3+Math.sin(t*4)*0.08;r.armR.el.rotation.x=1.3+Math.sin(t*4+1)*0.08;r.torso.rotation.set(0.08,0,0);
    r.head.rotation.set(0,Math.sin(t*1.5)*0.12,0);mouth=0.25+0.2*Math.abs(Math.sin(t*5));brow=0.8;lid=0.68;}
  if(c.state==='hit'||c.state==='down'){r.torso.rotation.x+=c.hitT*1.2;r.head.rotation.x+=c.hitT*0.8;mouth=0.8;}
  r.armL.hand.rotation.set(0,0,0);r.armR.hand.rotation.set(0,0,0);
  const ex=bad?{snarl:0.8+0.2*Math.sin(t*2),sneer:0.7,frown:0.3,jawX:(c.p.kind==='lurch'?0.6:-0.3)}:(c.act==='wave'?{frown:0.7,squint:0.2,pucker:0.15*Math.abs(Math.sin(t*6))}:{smile:0.55,squint:0.25});if(c.state==='hit')Object.assign(ex,{squint:1,snarl:0.7,smile:0});
  animateFace(r.face,r.fs,dt,{lid,brow,furrow,mouth,ex,gazeYaw:0,gazePitch:0.05,blinkMin:bad?5:1.8,blinkVar:2});}
function alleyShoot(nx,ny){if(G.state!=='alley')return;sfx.magnum();buzz(15);G.shake=0.05;
  ndc.set(nx,ny);ray.setFromCamera(ndc,AL.cam);const up=AL.cards.filter(c=>c.state==='up'||c.state==='rise');const hits=ray.intersectObjects(up.map(c=>c.hp),false);
  const p=hits.length?hits[0].point:ray.ray.at(11,new THREE.Vector3());AL.flash.position.copy(p);AL.flash.visible=true;AL.flash.userData.t=0.05;AL.flash.scale.set(0.5,0.5,1);
  if(!hits.length)return;const c=up.find(q=>q.hp===hits[0].object);
  c.r.head.getWorldPosition(_a);const head=Math.hypot(p.x-_a.x,p.y-_a.y-0.1)<0.28*c.sc;
  for(let i=0;i<5;i++){const b=AL.blood.find(q=>q.t<=0)||AL.blood[0];b.s.position.set(p.x,p.y,0.9);b.v.set((Math.random()-.5)*2,Math.random()*1.5,1);b.t=0.45;b.s.visible=true;b.s.scale.setScalar(0.25+Math.random()*0.2);}
  c.state='hit';c.hitT=0;
  if(c.bad){const bonus=Math.round(AL.timer/AL.tmax*100)+(head?100:0);AL.score+=100+bonus;sfx.thud();hitMarker(true,head);if(head)showMsg('Headshot!',0.6);}
  else{AL.misses++;sfx.empty();tone(220,110,0.45,0.25,'square');showMsg('Don\u2019t shoot survivors!',1.4);hud.vig.style.transition='none';hud.vig.style.opacity=0.8;requestAnimationFrame(()=>{hud.vig.style.transition='opacity .6s';hud.vig.style.opacity=0;});}
  drawAlleyHud();}
function releaseChar(c){AL.scene.remove(c.hp);c.hp.geometry.dispose();c.r.root.visible=false;c.p.mats.forEach(m=>{m.clippingPlanes=null;m.needsUpdate=true;});c.p.busy=false;}
function updateAlley(dt){
  if(AL.phase==='scroll'){const target=AL.seg*12,dist=target-AL.x;const want=Math.min(AL.speed,0.35+dist*1.5);AL.vel=damp(AL.vel||0,want,3.2,dt);AL.x+=AL.vel*dt;
    if(dist<0.03){AL.x=target;AL.vel=0;spawnEncounter(AL.seg);}}
  else if(AL.phase==='stop'){let allUp=true;
    for(const c of AL.cards){c.t+=dt;if(c.state==='wait'&&c.t>=0){c.state='rise';if(c.bad)groan(0.8);else{tone(620,780,0.12,0.08,'triangle');tone(560,700,0.12,0.07,'triangle',0.16);}}
      if(c.state==='rise'){c.rise=Math.min(1,c.rise+dt*4);if(c.rise>=1)c.state='up';}
      if(c.state==='wait'||c.state==='rise')allUp=false;}
    if(allUp)AL.timer-=dt;
    const badLeft=AL.cards.filter(c=>c.bad&&c.state!=='hit').length;
    if(badLeft===0&&AL.cards.every(c=>c.state!=='wait'&&c.state!=='rise')){AL.phase='resolve';AL.resolveT=0.7;showMsg('Clear!',0.7);}
    else if(AL.timer<=0){AL.phase='resolve';AL.resolveT=1.0;AL.misses++;AL.cards.forEach(c=>{if(c.bad&&c.state==='up'){c.state='lunge';c.hitT=0;}});groan(1);setTimeout(()=>sfx.hurt(),250);G.shake=0.3;buzz(70);showMsg('They got you!',1.2);
      hud.vig.style.transition='none';hud.vig.style.opacity=1;requestAnimationFrame(()=>{hud.vig.style.transition='opacity .6s';hud.vig.style.opacity=0;});}
    drawAlleyHud();}
  else if(AL.phase==='resolve'){AL.resolveT-=dt;if(AL.resolveT<=0){AL.cards.forEach(c=>{if(c.state!=='hit'){c.state='down';c.hitT=0;}});
      if(AL.misses>=3){alleyOver();return;}
      AL.enc++;AL.seg++;AL.phase='scroll';if(AL.enc%5===0){AL.round++;AL.tmax=Math.max(0.9,2.6-(AL.round-1)*0.3);AL.speed=6+AL.round;applyAlleyLight();AL.texCache={};AL.segs.forEach(s=>{if(s.k>AL.seg-1)s.k=-99;});showMsg('Round '+AL.round,1.6);sfx.pickup();}}}
  for(let i=AL.cards.length-1;i>=0;i--){const c=AL.cards[i];
    if(c.state==='hit'||c.state==='down'||c.state==='lunge'){c.hitT+=dt*(c.state==='lunge'?3:2.2);if(c.state==='lunge'&&c.hitT>0.5){c.state='down';c.hitT=0;}}
    if((c.state==='hit'||c.state==='down')&&c.hitT>1.1){releaseChar(c);AL.cards.splice(i,1);continue;}
    if(c.state!=='wait'){placeChar(c);animChar(c,dt);}}
  for(const b of AL.blood){if(b.t<=0)continue;b.t-=dt;b.s.position.addScaledVector(b.v,dt);b.v.y-=6*dt;b.s.material.opacity=b.t/0.45;if(b.t<=0)b.s.visible=false;}
  placeSegments();
  AL.cam.aspect=camera.aspect;AL.cam.updateProjectionMatrix();const cdist=Math.max(10.2,(3.6*AL.kx+1.15)/(Math.tan(24*Math.PI/180)*AL.cam.aspect));const cy=3.0+Math.max(0,(cdist-10.2)*0.08);AL.cam.position.set(AL.x+(Math.random()-.5)*G.shake,cy+(Math.random()-.5)*G.shake,cdist);AL.cam.lookAt(AL.x,cy,0);G.shake=Math.max(0,G.shake-dt);if(AL.key){AL.key.position.set(AL.x,cy+3,cdist);AL.key.target.position.set(AL.x,cy,0);AL.key.target.updateMatrixWorld();}
  AL.walk.position.x=AL.x;AL.walk.material.map.offset.x=AL.x/4;AL.road.position.x=AL.x;AL.road.material.map.offset.x=AL.x/8;AL.curb.position.x=AL.x;
  if(AL.flash.visible){AL.flash.userData.t-=dt;if(AL.flash.userData.t<=0)AL.flash.visible=false;}
  const ax=clamp(stickVec.x+(input.right?1:0)-(input.left?1:0),-1,1),ay=clamp(-stickVec.y+(input.up?1:0)-(input.down?1:0),-1,1);
  AL.cx=clamp(AL.cx+ax*dt*1.6,-0.95,0.95);AL.cy=clamp(AL.cy+ay*dt*1.6,-0.95,0.95);const xh=$('alx');xh.style.left=((AL.cx+1)/2*100)+'%';xh.style.top=((1-AL.cy)/2*100)+'%';}
function drawAlleyHud(){$('alScore').textContent=AL.score.toLocaleString();$('alRound').textContent='Round '+AL.round;$('alTop').textContent='Top '+Math.max(AL.best,AL.score).toLocaleString();
  $('alMiss').innerHTML='Miss '+[0,1,2].map(i=>i<AL.misses?'<b>\u25cf</b>':'\u25cb').join(' ');const tb=$('alTime');tb.style.width=(AL.phase==='stop'?Math.max(0,AL.timer/AL.tmax*100):0)+'%';}
function alleyOver(){if(AL.score>AL.best){AL.best=AL.score;try{localStorage.setItem('sb-alley-best',String(AL.best));}catch(e){}}setState('alleyover');}

/* ================= menus ================= */
const MENU={items:[],sel:0,rep:0};
const MENU_STATES=['title','paused','over','alleypaused','alleyover','cheats','settings','controls','mapping','graphics','audio'];
const MAPPING=[['Left stick','Move and sidestep'],['Right stick','Look and aim'],['B','Shoot (hold to aim down sights)'],['A','Reload, clear a jam, confirm'],['X','Throw grenade'],['Y','Drive or get out of a car'],['D-pad up','Flashlight'],['D-pad down','Swap shoulder'],['D-pad left / right','Switch weapon'],['View button','Flashlight (hold: swap shoulder)'],['Menu button','Pause']];
function adjStep(k,d){SET[k]=clamp((SET[k]||3)+d,1,5);saveSet();tone(500+SET[k]*90,500+SET[k]*90,0.05,0.1,'triangle');buildMenu();}
function adjSlider(k,d){SET[k]=clamp(Math.round(((SET[k]??1)+d)*10)/10,0,1);saveSet();applyVolumes();tone(500+SET[k]*500,500+SET[k]*500,0.05,0.1,'triangle');buildMenu();}
function toMenu(){clearArena();G.boss=false;G.bossE=null;if(P.car)exitCar();allyRig.root.visible=false;ALLY.alive=false;P.light=false;if(hero.flames)setFlames(hero,0);heroMat.userData.bu.burn.value=0;heroMat.userData.bu.hot.value=0;heroMat.userData.bu.melt.value=0;hero.root.rotation.x=0;enemies.slice().forEach(removeEnemy);pickups.slice().forEach(removePickup);resetBarrels();titleZ.root.visible=true;Object.assign(P,{x:0,z:8,y:0,vy:0,roof:-1,climb:null,pitch:0,yaw:0,vel:0,hp:100,dying:0,burn:0,char:0});G.wave=0;G.titleT=0;equip('rifle');drawHud();setState('title');}
function buildMenu(){const s=G.state;let it=[];
  if(s==='title')it=[['Survive the Bombies',()=>toggleLoadout(true)],['Map: '+(MAP==='park'?'Wash Park':'Parking garage'),()=>{SET.map=MAP==='park'?'garage':'park';saveSet();showMsg('Loading map\u2026',3);setTimeout(()=>location.reload(),150);}],['Mode: '+({deadzone:'Dead Zone',horde:'Horde'}[SET.mode]||'Survival'),()=>{const o=['survival','deadzone','horde'];SET.mode=o[(o.indexOf(SET.mode||'survival')+1)%3];if(SET.mode==='deadzone')SET.map='garage';if(SET.mode==='horde')SET.map='park';saveSet();showMsg('Loading\u2026',3);setTimeout(()=>location.reload(),150);}],
    ...(HORDE?[['Difficulty: '+HORDE_LV[clamp(SET.hordeLvl|0,0,5)].name,()=>{SET.hordeLvl=((SET.hordeLvl|0)+1)%6;saveSet();buildMenu();}]]:[]),['Alley Shot',startAlley],['Settings',()=>{G.setBack='title';setState('settings');}]];
  if(false)it=[['Graphics: '+(SET.hi?'high':'smooth'),()=>{SET.hi=!SET.hi;saveSet();applySet();buildMenu();}],
    ['Voice: '+(SET.voice?'on':'off'),()=>{SET.voice=!SET.voice;saveSet();buildMenu();}],['Weather: '+(SET.weather||'rain'),()=>{const o=['clear','rain','storm'];SET.weather=o[(o.indexOf(SET.weather||'rain')+1)%3];saveSet();applyWeather();buildMenu();}]];
  else if(s==='paused')it=[['Resume',()=>setState('play')],['Settings',()=>{G.setBack='paused';setState('settings');}],['Quit to menu',toMenu]];
  else if(s==='controls')it=[['Drift',null,undefined,{slider:'drift',steps:5}],['Invert look',()=>{SET.invertY=!SET.invertY;saveSet();buildMenu();},!!SET.invertY],
    ['Look sensitivity X',null,undefined,{slider:'sensX',steps:5}],['Look sensitivity Y',null,undefined,{slider:'sensY',steps:5}],['Controller map \u203a',()=>setState('mapping')],
    ['Bluetooth controller: '+(SET.gp===false?'Off':'On'),()=>{SET.gp=SET.gp===false?true:false;saveSet();buildMenu();}],
    ['Controller: '+(()=>{if(SET.gp===false)return 'off';const L=gpList();if(SET.gpId){const f=L.find(p=>p.id===SET.gpId);return f?gpName(f.id):'not connected';}return L.length?'Auto \u00b7 '+gpName(L[0].id):'none found';})(),()=>{const L=gpList();const ids=[null,...L.map(p=>p.id)];const i=ids.indexOf(SET.gpId||null);SET.gpId=ids[(i+1)%ids.length];saveSet();buildMenu();}],
    ['Right stick axes: '+({auto:'Auto','23':'2 + 3','34':'3 + 4','25':'2 + 5'}[SET.rsAxes||'auto']),()=>{const o=['auto','23','34','25'];SET.rsAxes=o[(o.indexOf(SET.rsAxes||'auto')+1)%4];saveSet();buildMenu();}],
    ['Pairing help',()=>showMsg('Pair it in Bluetooth settings, then press any button on it',3.5)],
    ['Recommended settings',()=>{Object.assign(SET,{drift:3,sensX:3,sensY:3,invertY:false});saveSet();buildMenu();showMsg('Controls reset',0.8);}],['Back',()=>setState('settings')]];
  else if(s==='mapping'){it=Object.keys(BTN_NAMES).map(k=>[BTN_NAMES[k],()=>{const ks=Object.keys(ACTIONS);BMAP[k]=ks[(ks.indexOf(BMAP[k])+1)%ks.length];saveBmap();buildMenu();},undefined,{pick:k}]);it.push(['Reset to default',()=>{Object.assign(BMAP,MAP_DEFAULT);saveBmap();buildMenu();}],['Back',()=>setState('controls')]);}
  else if(s==='graphics')it=[['Quality: '+({smooth:'Smooth',high:'High',ultra:'Ultra'}[SET.quality]),()=>{const o=['smooth','high','ultra'];SET.quality=o[(o.indexOf(SET.quality)+1)%3];SET.hi=SET.quality!=='smooth';saveSet();applySet();buildMenu();}],
    ['Field of view',null,undefined,{range:'fov',min:80,max:120,step:5}],
    ['View: '+(SET.view==='first'?'First person':'Third person'),()=>{SET.view=SET.view==='first'?'third':'first';saveSet();buildMenu();}],
    ['Weather: '+(SET.weather||'rain'),()=>{const o=['clear','rain','storm'];SET.weather=o[(o.indexOf(SET.weather||'rain')+1)%3];saveSet();applyWeather();buildMenu();}],
    ['Screen Hz: '+SET.hz,()=>{const o=[60,90,120];SET.hz=o[(o.indexOf(SET.hz)+1)%3];saveSet();applyHz();buildMenu();}],
    ['FPS limit: '+SET.fps,()=>{const o=[60,90,120];SET.fps=o[(o.indexOf(SET.fps)+1)%3];saveSet();buildMenu();}],['Back',()=>setState('settings')]];
  else if(s==='settings')it=[['Audio \u203a',()=>setState('audio')],['Graphics \u203a',()=>setState('graphics')],['Controls \u203a',()=>setState('controls')],['Cheats \u203a',()=>{G.cheatBack='settings';setState('cheats');}],['Back',()=>setState(G.setBack||'title')]];
  else if(s==='audio')it=[['Master volume',()=>adjSlider('master',0.1),undefined,{slider:'master'}],['Music',()=>adjSlider('music',0.1),undefined,{slider:'music'}],['Sound effects',()=>adjSlider('sfx',0.1),undefined,{slider:'sfx'}],
    ['Voice lines',()=>{SET.voice=!SET.voice;saveSet();buildMenu();},!!SET.voice],['Surround sound',()=>{SET.surround=SET.surround===false;saveSet();buildMenu();},SET.surround!==false],['Back',()=>setState('settings')]];
  else if(s==='cheats'){it=CHEATS.map(([k,l])=>[l,()=>{toggleCheat(k);buildMenu();},!!CH[k]]);it.push(['Back',()=>setState(G.cheatBack||'title')]);}
  else if(s==='over')it=[['Try again',()=>{resetGame();applyLoadout();setState('play');}],['Change loadout',()=>{toMenu();toggleLoadout(true);}],['Main menu',toMenu]];
  else if(s==='alleypaused')it=[['Resume',()=>setState('alley')],['Quit to menu',toMenu]];
  else if(s==='alleyover')it=[['Play again',startAlley],['Main menu',toMenu]];
  MENU.items=it;if(MENU.sel>=it.length)MENU.sel=0;const el=$('menu');el.innerHTML='';el.classList.toggle('grid',s==='cheats');el.classList.toggle('settings',s==='settings'||s==='controls'||s==='graphics'||s==='audio');el.classList.toggle('mapgrid',s==='mapping');document.body.classList.toggle('mapview',s==='mapping');
  it.forEach(([label,fn,on,ex],i)=>{const b=document.createElement('button');b.className='mi'+(i===MENU.sel?' sel':'');b.textContent=label;
    if(ex&&ex.range){const k=ex.range,v=SET[k];b.classList.add('slrow');const w=document.createElement('span');w.className='sl';const f=(v-ex.min)/(ex.max-ex.min);
      w.innerHTML='<i class="sdn">\u2212</i><span class="strk"><span style="width:'+Math.round(f*100)+'%"></span></span><i class="sup">+</i><em>'+v+'\u00b0</em>';b.appendChild(w);
      const st=d=>{SET[k]=clamp(SET[k]+d*ex.step,ex.min,ex.max);saveSet();MENU.sel=i;buildMenu();};w.querySelector('.sdn').addEventListener('click',e=>{e.stopPropagation();st(-1);});w.querySelector('.sup').addEventListener('click',e=>{e.stopPropagation();st(1);});
      w.querySelector('.strk').addEventListener('click',e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();SET[k]=clamp(Math.round((ex.min+(e.clientX-r.left)/r.width*(ex.max-ex.min))/ex.step)*ex.step,ex.min,ex.max);saveSet();MENU.sel=i;buildMenu();});fn=()=>st(1);}
    if(ex&&ex.pick){const k=ex.pick;b.classList.add('slrow');const w=document.createElement('span');w.className='pick';w.innerHTML='<i class="sdn">\u2039</i><em>'+ACTIONS[BMAP[k]]+'</em><i class="sup">\u203a</i>';b.appendChild(w);
      const cyc=d=>{const ks=Object.keys(ACTIONS);BMAP[k]=ks[(ks.indexOf(BMAP[k])+d+ks.length)%ks.length];saveBmap();MENU.sel=i;buildMenu();};w.querySelector('.sdn').addEventListener('click',e=>{e.stopPropagation();cyc(-1);});w.querySelector('.sup').addEventListener('click',e=>{e.stopPropagation();cyc(1);});}
    if(ex&&ex.slider&&ex.steps){const k=ex.slider,v=SET[k]||3;b.classList.add('slrow');const w=document.createElement('span');w.className='sl';w.innerHTML='<i class="sdn">\u2212</i><span class="strk steps">'+[1,2,3,4,5].map(n=>'<b'+(n<=v?' class="on"':'')+'></b>').join('')+'</span><i class="sup">+</i><em>'+v+'</em>';b.appendChild(w);
      w.querySelector('.sdn').addEventListener('click',e=>{e.stopPropagation();MENU.sel=i;adjStep(k,-1);});w.querySelector('.sup').addEventListener('click',e=>{e.stopPropagation();MENU.sel=i;adjStep(k,1);});fn=()=>adjStep(k,1);}
    else if(ex&&ex.slider){const k=ex.slider,v=SET[k]??1;b.classList.add('slrow');const w=document.createElement('span');w.className='sl';w.innerHTML='<i class="sdn">\u2212</i><span class="strk"><span style="width:'+Math.round(v*100)+'%"></span></span><i class="sup">+</i><em>'+Math.round(v*100)+'</em>';b.appendChild(w);
      w.querySelector('.sdn').addEventListener('click',e=>{e.stopPropagation();MENU.sel=i;adjSlider(k,-0.1);});w.querySelector('.sup').addEventListener('click',e=>{e.stopPropagation();MENU.sel=i;adjSlider(k,0.1);});
      w.querySelector('.strk').addEventListener('click',e=>{e.stopPropagation();MENU.sel=i;const r=e.currentTarget.getBoundingClientRect();SET[k]=clamp(Math.round((e.clientX-r.left)/r.width*20)/20,0,1);saveSet();applyVolumes();buildMenu();});
      fn=()=>{};}if(on!==undefined){const sw=document.createElement('span');sw.className='sw'+(on?' on':'');b.appendChild(sw);b.setAttribute('aria-pressed',on?'true':'false');}
    b.addEventListener('pointerdown',e=>{e.stopPropagation();});b.addEventListener('click',e=>{e.stopPropagation();initAudio();MENU.sel=i;fn();});el.appendChild(b);});}
function menuMove(d){if(!MENU.items.length)return;MENU.sel=(MENU.sel+d+MENU.items.length)%MENU.items.length;tone(700,700,0.03,0.06,'square');
  [...$('menu').children].forEach((b,i)=>{b.classList.toggle('sel',i===MENU.sel);if(i===MENU.sel)b.scrollIntoView({block:'nearest'});});}
function menuActivate(){const it=MENU.items[MENU.sel];if(it){tone(520,780,0.06,0.1,'triangle');it[1]();}}
function updateMenuInput(dt){const y=clamp(-stickVec.y+(input.up?1:0)-(input.down?1:0),-1,1),x=clamp(stickVec.x+(input.right?1:0)-(input.left?1:0),-1,1);MENU.rep-=dt;
  const cur=MENU.items[MENU.sel];if(Math.abs(x)>0.5&&Math.abs(y)<0.4&&cur&&cur[3]&&cur[3].pick){if(MENU.rep<=0){const k=cur[3].pick,ks=Object.keys(ACTIONS);BMAP[k]=ks[(ks.indexOf(BMAP[k])+(x>0?1:-1)+ks.length)%ks.length];saveBmap();buildMenu();MENU.rep=0.25;}return;}
  if(Math.abs(x)>0.5&&Math.abs(y)<0.4&&cur&&cur[3]&&cur[3].range){if(MENU.rep<=0){const ex=cur[3];SET[ex.range]=clamp(SET[ex.range]+(x>0?1:-1)*ex.step,ex.min,ex.max);saveSet();buildMenu();MENU.rep=0.12;}return;}
  if(Math.abs(x)>0.5&&Math.abs(y)<0.4&&cur&&cur[3]&&cur[3].slider){if(MENU.rep<=0){if(cur[3].steps)adjStep(cur[3].slider,x>0?1:-1);else adjSlider(cur[3].slider,x>0?0.1:-0.1);MENU.rep=0.22;}return;}
  if(Math.abs(y)<0.4){MENU.rep=0;return;}if(MENU.rep<=0){menuMove(y>0?-1:1);MENU.rep=MENU.rep===0?0.35:0.18;}}

/* ================= cheats ================= */
const CH=SET.cheats||(SET.cheats={});
const CHEATS=[['god','God mode'],['ammo','Infinite ammo'],['onehit','One-shot kills'],['fireammo','Incendiary bullets'],['boomammo','Explosive bullets'],['bigheads','Big heads'],['speed','Super speed'],['slowmo','Slow motion'],['nozombies','No zombies'],['ghost','Ghost (invisible)']];
function toggleCheat(k){CH[k]=!CH[k];saveSet();
  if(k==='nozombies'&&CH[k])enemies.slice().forEach(e=>{if(!e.dead)removeEnemy(e);});
  if(k==='bigheads')enemies.forEach(e=>e.r.head.scale.setScalar(CH.bigheads?1.8:1));drawHud();}
/* ================= first-person view model (shown while the fire button is held) ================= */
scene.add(camera);
const VM=new THREE.Group();VM.visible=false;camera.add(VM);
const vmGun=new THREE.Group();vmGun.position.set(0.11,-0.135,-0.3);VM.add(vmGun);
const vmGuns={};for(const k in GUNS){const m=new THREE.Group();fillGunGroup(m,k,GUN_GEO[k]);m.visible=false;vmGun.add(m);vmGuns[k]=m;}
const vmMuzzle=new THREE.Object3D();vmGun.add(vmMuzzle);
const vmMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.7});
const vmLook=Object.assign({},HERO_LOOK,{hi:true});
const vmSleeveGeo=mergeParts([P_(colorize(taperGeo(0.05,0.042,0.26,14),p=>fab(HERO_LOOK.shirt.base,p,0.22)),M(0,0.2,0)),P_(colorize(taperGeo(0.044,0.044,0.02,14),()=>mulc(HERO_LOOK.shirt.base,0.7)),M(0,0.06,0)),
  P_(colorize(capGeo(0.029,0.05,12,3),()=>mulc(HERO_LOOK.skin,0.95)),M(0,0.025,0))]);
const vmHands={R:new THREE.Mesh(buildHandGeo(vmLook,1,'grip'),vmMat),L:new THREE.Mesh(buildHandGeo(vmLook,-1,'cup'),vmMat)};const vmWrapGeoL=buildHandGeo(vmLook,-1,'wrap'),vmCupGeoL=vmHands.L.geometry,vmGrip2GeoL=buildHandGeo(vmLook,-1,'grip');
const vmSleeves={};for(const s of['R','L']){vmGun.add(vmHands[s]);const sl=new THREE.Mesh(vmSleeveGeo,vmMat);vmGun.add(sl);vmSleeves[s]=sl;}
const vmWatch=new THREE.Mesh(new THREE.TorusGeometry(0.031,0.008,6,18),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.4}));vmWatch.rotation.x=Math.PI/2;vmWatch.position.y=0.04;vmSleeves.L.add(vmWatch);
// first-person grenade throw: right hand holding the grenade, left hand pulls the pin
const vmNade=new THREE.Group();vmNade.visible=false;VM.add(vmNade);
const vnR=new THREE.Group();vmNade.add(vnR);const vnHand=new THREE.Mesh(buildHandGeo(vmLook,1,'grip'),vmMat);vnHand.rotation.set(2.05,0.3,0.15);vnR.add(vnHand);
const vnSl=new THREE.Mesh(vmSleeveGeo,vmMat);vnSl.rotation.set(2.05,0.3,0.15);vnR.add(vnSl);
const vnBall=new THREE.Mesh(new THREE.SphereGeometry(0.042,12,10),new THREE.MeshStandardMaterial({color:0x3a4228,roughness:0.6,metalness:0.2}));vnBall.scale.set(1,1.25,1);vnBall.position.set(0.0,-0.085,-0.035);vnHand.add(vnBall);
const vnLever=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.07,0.012),new THREE.MeshStandardMaterial({color:0x7a7c80,metalness:0.7,roughness:0.4}));vnLever.position.set(0.03,-0.06,-0.035);vnHand.add(vnLever);
const vnPin=new THREE.Mesh(new THREE.TorusGeometry(0.016,0.003,6,12),new THREE.MeshStandardMaterial({color:0xb0b2b6,metalness:0.8,roughness:0.3}));
const vnL=new THREE.Group();vmNade.add(vnL);const vnHandL=new THREE.Mesh(buildHandGeo(vmLook,-1,'relax'),vmMat);vnHandL.rotation.set(2.0,-0.45,-0.3);vnL.add(vnHandL);
const vnSlL=new THREE.Mesh(vmSleeveGeo,vmMat);vnSlL.rotation.set(2.0,-0.45,-0.3);vnL.add(vnSlL);
const KF=(k,t)=>{let i=0;while(i<k.length-2&&t>k[i+1][0])i++;const a=k[i],b=k[i+1];const u=clamp((t-a[0])/(b[0]-a[0]),0,1);const e=u*u*(3-2*u);return a.slice(1).map((v,j)=>v+(b[j+1]-v)*e);};
// time, x, y, z, rotX, rotY, rotZ  (camera space)
const NADE_R=[[0,0.2,-0.45,-0.4,0.4,0,0],[0.18,0.12,-0.17,-0.38,0,0,0],[0.36,0.13,-0.15,-0.36,0,0,0],[0.54,0.22,0.0,-0.2,-0.75,-0.25,0.35],[0.64,0.07,0.02,-0.5,0.35,0.1,-0.1],[0.8,0.02,-0.26,-0.52,0.9,0,0],[1.0,0.06,-0.55,-0.45,1.0,0,0]];
const NADE_L=[[0,-0.25,-0.5,-0.4,0,0,0],[0.15,-0.1,-0.2,-0.4,0,0,0],[0.24,0.05,-0.16,-0.36,0,0,0],[0.34,-0.15,-0.15,-0.4,0,0,0.25],[0.5,-0.17,-0.06,-0.5,-0.3,0,0],[0.66,-0.16,-0.3,-0.45,0,0,0],[1.0,-0.25,-0.6,-0.4,0,0,0]];
function updateNadeVM(){vmNade.visible=false;vmGun.visible=true;return;const t=P.nadeT;
  const r=KF(NADE_R,t),l=KF(NADE_L,t);vnR.position.set(r[0],r[1],r[2]);vnR.rotation.set(r[3],r[4],r[5]);vnL.position.set(l[0],l[1],l[2]);vnL.rotation.set(l[3],l[4],l[5]);
  vnBall.visible=t<0.6;vnLever.visible=t<0.6;
  if(t<0.25){if(vnPin.parent!==vnHand){vnHand.add(vnPin);}vnPin.position.set(0.015,-0.04,-0.06);vnPin.rotation.set(0,0,0);}
  else if(vnPin.parent!==vnHandL){vnHandL.add(vnPin);vnPin.position.set(0.0,-0.1,-0.02);}}
function vmEquip(){const W=GUNS[P.weapon],h=HB[P.weapon];for(const k in vmGuns)vmGuns[k].visible=k===P.weapon;vmMuzzle.position.set(...W.muzzle);
  vmHands.R.position.set(...h.wR);vmHands.R.quaternion.copy(h.R);vmHands.L.position.set(...h.wL);vmHands.L.quaternion.copy(h.L);
  vmHands.L.geometry=(P.weapon==='magnum'||P.weapon==='weld')?vmWrapGeoL:(P.weapon==='shotgun'&&ATT.shotgun.grip!=='pump'?vmGrip2GeoL:vmCupGeoL);
  // forearms run from each wrist back toward the camera and down, the way arms come into view in a first-person shot
  for(const [s,back] of[['R',[0.06,-0.16,0.32]],['L',(P.weapon==='magnum'||P.weapon==='weld')?[-0.1,-0.2,0.3]:[-0.12,-0.17,0.3]]]){const w=vmHands[s].position,sl=vmSleeves[s];const d=new THREE.Vector3(...back).normalize();
    sl.position.copy(w);sl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);}}
vmEquip();
function updateViewModel(dt){updateNadeVM();const W=GUNS[P.weapon];if(VM.userData.w!==P.weapon){VM.userData.w=P.weapon;vmEquip();}
  {const pm=P.weapon==='shotgun'?pumpOffset():0;if(vmGuns.shotgun.userData.forend)vmGuns.shotgun.userData.forend.position.z=pm;const h=HB[P.weapon];vmHands.L.position.z=h.wL[2]+pm;}
  const sc=(W.zoom||1)>1&&P.ads>0.85;VM.visible=VM.visible&&!sc;$('scopeov').className=sc?('on z'+(W.zoom>=3?'hi':'lo')):'';
  const walk=Math.min(1,Math.abs(P.vel)/3);const t=G.time;const rl=P.reloadAmt;
  P.ads=damp(P.ads||0,P.fpv>0.9&&rl<0.1&&(SET.view!=='first'||input.fire||P.adsHold)?1:0,10,dt);const ads=P.ads,br=(P.breath||0)>0.25?0.2:1;
  const sy=W.sight||0.07;const hx=0.11-(W.sound==='magnum'?0.1:0),hy=-0.135,hz=-0.3+(W.sound==='magnum'?-0.12:0);
  vmGun.position.set(lerp(hx,-(W.sightX||0),ads)+Math.sin(P.phase)*0.008*walk*(1-ads*0.7)+Math.sin(t*0.9)*0.003*br*ads,lerp(hy,-sy,ads)+Math.abs(Math.cos(P.phase))*0.008*walk*(1-ads*0.7)-0.07*rl+Math.sin(t*1.6)*0.002*br,
    lerp(hz,W.adsZ||-0.26,ads)+P.recoil*0.05*W.recoil);
  vmGun.rotation.set(P.recoil*0.09*W.recoil-0.55*rl,(P.kickYaw||0)*0.5,0.5*rl);
  if(W.melee){vmGun.rotation.z+=0.35;vmGun.position.y-=0.03;if(P.swingT>0){const s=Math.sin((1-P.swingT/0.36)*Math.PI);vmGun.rotation.x-=1.4*s;vmGun.rotation.y+=0.6*s;vmGun.position.x-=0.08*s;vmGun.position.z-=0.14*s;}}}

/* ================= weapon inventory (d-pad left/right switches) ================= */
const INV={};function resetInv(){INV.rifle={own:true,ammo:GUNS.rifle.mag,reserve:Infinity};INV.shotgun={own:false,ammo:0,reserve:0};INV.magnum={own:false,ammo:0,reserve:0};INV.rpg={own:false,ammo:0,reserve:0};INV.wrench={own:false,ammo:1,reserve:Infinity};INV.weld={own:false,ammo:0,reserve:0};}resetInv();
function cycleWeapon(d){if(G.state!=='play'||P.nadeT>=0||P.car)return;const ks=['rifle','shotgun','magnum','rpg','wrench','weld'].filter(k=>INV[k]&&INV[k].own&&(k==='rifle'||k==='wrench'||INV[k].ammo>0||INV[k].reserve>0));
  if(ks.length<2){showMsg('No other weapon yet',0.8);return;}INV[P.weapon].ammo=P.ammo;INV[P.weapon].reserve=P.reserve;const i=ks.indexOf(P.weapon);const k=ks[(i+d+ks.length)%ks.length];
  equip(k);P.ammo=INV[k].ammo;P.reserve=INV[k].reserve;P.reloadT=0;P.jam=false;drawHud();showMsg(GUNS[k].name,0.7);tone(500,700,0.05,0.08,'square');}
const stickVec2={x:0,y:0};
/* ================= input helper ================= */
function readStick(){return {x:clamp(stickVec.x+(input.right?1:0)-(input.left?1:0),-1,1),y:clamp(-stickVec.y+(input.up?1:0)-(input.down?1:0),-1,1)};}
/* ================= driving ================= */
const carSpot=new THREE.SpotLight(0xfff2d8,0,40,0.5,0.5,1.4);const carSpotT=new THREE.Object3D();scene.add(carSpot);scene.add(carSpotT);carSpot.target=carSpotT;
let engOsc=null,engGain=null;
function nearDrivable(){let best=null,bd=3.2;for(const c of CARLIST){if(!c.drive||c.state>=3)continue;const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<bd&&P.y<0.5){bd=d;best=c;}}return best;}
function enterCar(c){P.stance='stand';P.slideT=0;P.ex=P.x;P.ez=P.z;P.enterCar=c;P.enterT=0;P.car=c;c.speed=0;c.col.off=true;P.fpv=0;input.fire=false;showMsg('Driving',0.9);sfx.crunch();
  if(AC){engOsc=AC.createOscillator();engOsc.type='sawtooth';const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=420;engGain=AC.createGain();engGain.gain.value=0.05;engOsc.connect(f);f.connect(engGain);engGain.connect(SFXB);engOsc.frequency.value=38;engOsc.start();}}
function exitCar(){const c=P.car;if(!c)return;P.car=null;P.enterCar=null;P.enterT=undefined;const rx=-Math.cos(c.ry),rz=Math.sin(c.ry);const p={x:c.x+rx*1.9,z:c.z+rz*1.9};collide(p,0.4,0);P.x=p.x;P.z=p.z;P.yaw=c.ry;P.vel=0;
  const side=Math.abs(Math.sin(c.ry))>0.7;Object.assign(c.col,{x:c.x,z:c.z,hw:side?2.25:0.95,hd:side?0.95:2.25,off:false});c.speed=0;carSpot.intensity=0;
  if(engOsc){try{engOsc.stop();}catch(e){}engOsc=null;}}
function driveCar(dt){const c=P.car;if(c.state>=3){exitCar();hurtPlayer(15);return;}if(P.enterT<1){P.enterT=Math.min(1,P.enterT+dt/1.15);c.speed=0;P.x=c.x;P.z=c.z;return;}const st=readStick();c.steer=damp(c.steer||0,st.x,8,dt);
  const top=CH.speed?30:19;c.speed+=(st.y>0?st.y*10:st.y*14)*dt;c.speed*=1-dt*(Math.abs(st.y)<0.1?1.1:0.35);c.speed=clamp(c.speed,-6,top);
  c.ry+=-st.x*dt*1.7*clamp(c.speed/5,-1,1);
  if(Math.abs(c.speed)>2.5)for(const b of BARRELS)if(b.state===0&&Math.hypot(b.x-c.x,b.z-c.z)<2.0){b.state=1;b.t=0.05;c.hp=0;showMsg('Fuel tank!',1);exitCar();c.state=4;carExplode(c);return;}
  const fx=-Math.sin(c.ry),fz=-Math.cos(c.ry);const want={x:c.x+fx*c.speed*dt,z:c.z+fz*c.speed*dt};const p={x:want.x,z:want.z};collide(p,1.25,0);
  const push=Math.hypot(p.x-want.x,p.z-want.z);if(push>0.02&&Math.abs(c.speed)>4){sfx.crunch();G.shake=Math.min(0.5,Math.abs(c.speed)*0.03);c.hp-=Math.abs(c.speed)*0.4;if(c.alarm<=0)c.alarm=0;c.speed*=-0.25;buzz(80);}
  else if(push>0.02)c.speed*=0.6;
  c.x=p.x;c.z=p.z;c.m.position.set(c.x,0,c.z);c.m.rotation.y=c.ry;P.x=c.x;P.z=c.z;P.yaw=c.ry;P.y=0;P.roof=-1;
  for(const e of enemies){if(e.dead)continue;const dx=e.x-c.x,dz=e.z-c.z,d=Math.hypot(dx,dz);if(d<1.9&&Math.abs(c.speed)>3){const dir=new THREE.Vector3(dx,0,dz).normalize();
      damageEnemy(e,999,false,dir);e.x+=dir.x*1.8+fx*Math.abs(c.speed)*0.12;e.z+=dir.z*1.8+fz*Math.abs(c.speed)*0.12;sfx.crunch();buzz(60);G.shake=0.25;c.hp-=1.5;spark(new THREE.Vector3(e.x,1,e.z),0x3a0606,0.5,false);
      for(let q=0;q<10;q++)emit('glass',e.x,1,e.z,(Math.random()-.5)*4,1+Math.random()*3,(Math.random()-.5)*4,0.8,0.04,-1);}}
  carSpot.position.set(c.x+fx*2.2,0.8,c.z+fz*2.2);carSpotT.position.set(c.x+fx*14,0,c.z+fz*14);carSpot.intensity=2.4;
  if(engOsc){engOsc.frequency.value=34+Math.abs(c.speed)*5.5;engGain.gain.value=0.035+Math.min(0.05,Math.abs(c.speed)*0.003);}}
/* ================= flashlight + failing power ================= */
const flashSpot=new THREE.SpotLight(0xf4f0ff,0,34,0.36,0.55,1.3);const flashT=new THREE.Object3D();scene.add(flashSpot);scene.add(flashT);flashSpot.target=flashT;
const beamGeo=new THREE.ConeGeometry(1.6,12,20,1,true);beamGeo.translate(0,-6,0);beamGeo.rotateX(-Math.PI/2);
const beam=new THREE.Mesh(beamGeo,new THREE.MeshBasicMaterial({color:0xfff4e0,transparent:true,opacity:0.05,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.visible=false;scene.add(beam);
const LBASE=LIGHTS.map(L=>L.intensity);
function toggleLight(){P.light=!P.light;tone(P.light?1400:900,P.light?1100:700,0.03,0.1,'square');drawHud();}
function updateLights(dt){
  const out=G.state==='play'?clamp((G.wave-3)/3,0,1):0;LIGHTS.forEach((L,i)=>{const dead=(i+1)/LIGHTS.length<=out;L.intensity=dead?(Math.random()<0.02?0.6:0):LBASE[i]*(out>0&&Math.random()<0.03*out?0.2:1);});
  G.dark=out>0.6&&!P.light;tubeMat.color.setRGB(2.6*(1-out*0.85),2.7*(1-out*0.85),2.8*(1-out*0.85));if(out>0.6)flick.intensity*=0.2;
  if(G.state==='play'&&G.wave===4&&!G.powerMsg){G.powerMsg=true;showMsg('The power is failing. Tap Select for your flashlight',2.6);}
  const on=P.light&&!(P.car||P.tank)&&G.state!=='title';flashSpot.intensity=on?2.6:0;beam.visible=on&&P.fpv<0.5;
  if(on){const m=P.fpv>0.5?vmMuzzle:hero.muzzle;m.getWorldPosition(_a);camera.getWorldDirection(_b);flashSpot.position.copy(_a);flashT.position.copy(_a).addScaledVector(_b,10);
    beam.position.copy(_a);beam.lookAt(_a.clone().add(_b));}}
/* ================= grenades ================= */
const nadeGeo=mergeParts([P_(new THREE.SphereGeometry(0.045,10,8),M(0,0,0,0,0,0,1,1.25,1),[0.22,0.26,0.16]),P_(new THREE.BoxGeometry(0.02,0.03,0.02),M(0,0.06,0),[0.4,0.4,0.42]),P_(new THREE.TorusGeometry(0.014,0.003,4,8),M(0.016,0.075,0),[0.6,0.6,0.62])]);
const GRN=[];const moloGeo=mergeParts([P_(new THREE.CylinderGeometry(0.035,0.04,0.16,10),M(0,0,0),[0.25,0.32,0.18]),P_(new THREE.CylinderGeometry(0.013,0.02,0.07,8),M(0,0.11,0),[0.25,0.32,0.18]),P_(new THREE.ConeGeometry(0.025,0.06,6),M(0,0.17,0),[0.85,0.8,0.7])]);
function throwNade(){if(G.state!=='play'||P.car||P.climb||P.dying||P.burn>0||(P.nades||0)<=0||P.nadeT>=0)return;P.nades--;P.nadeT=0;P.nadeOut=false;P.pinOut=false;input.fire=false;drawHud();}
// overhand throw in third person: pin pulled at the chest, arm cocks back behind the head, whips over the top, release above the head
const heldNade=new THREE.Mesh(nadeGeo,vc);heldNade.visible=false;hero.armR.hand.add(heldNade);heldNade.position.set(0,-0.09,-0.03);
function stepNade(dt){if(P.nadeT<0){heldNade.visible=false;return;}heldNade.geometry=G.nadeKind==='molotov'?moloGeo:nadeGeo;P.nadeT+=dt/1.15;heldNade.visible=P.nadeT<0.6;
  if(!P.pinOut&&P.nadeT>0.18){P.pinOut=true;sfx.pin();}
  if(!P.nadeOut&&P.nadeT>0.6){P.nadeOut=true;heldNade.getWorldPosition(_a);camera.getWorldDirection(_b);const molo=G.nadeKind==='molotov';const m=new THREE.Mesh(molo?moloGeo:nadeGeo,vc);m.castShadow=true;m.position.copy(_a);scene.add(m);
    const v=_b.clone().multiplyScalar(14.5);v.y=Math.max(v.y,0)*14.5*0+v.y+4.2;GRN.push({m,v,molo,toxic:G.nadeKind==='toxic',t:molo?9:2.4,spin:new THREE.Vector3(Math.random()*12,Math.random()*12,0)});noise(0.2,700,2600,0.18,'bandpass');}
  if(P.nadeT>=1)P.nadeT=-1;}
function updateNades(dt){for(let i=GRN.length-1;i>=0;i--){const g=GRN[i];g.t-=dt;g.v.y-=12*dt;const p=g.m.position;const ox=p.x,oz=p.z;p.addScaledVector(g.v,dt);
    const gh=groundAt(p.x,p.z,p.y+0.2);if(p.y<gh+0.05&&g.molo&&g.t>0){g.t=0;glassBurst(p.clone(),new THREE.Vector3(0,1,0));noise(0.3,5000,1500,0.4,'highpass');}if(p.y<gh+0.05){p.y=gh+0.05;if(Math.abs(g.v.y)>1.5){g.v.y=-g.v.y*0.35;tone(220,180,0.04,0.08,'square');}else g.v.y=0;g.v.x*=0.6;g.v.z*=0.6;}
    if(insideCollider(p.x,p.z,0.05,p.y)){if(g.molo)g.t=0;p.x=ox;p.z=oz;g.v.x*=-0.4;g.v.z*=-0.4;}
    g.m.rotation.x+=g.spin.x*dt;g.m.rotation.y+=g.spin.y*dt;
    if(g.t<=0){scene.remove(g.m);GRN.splice(i,1);if(g.toxic)gasCloud(p.x,p.z);else explode(p.x,Math.max(0,p.y-0.3),p.z,{fire:g.molo});}}}
/* ================= hold breath + last-kill slow motion ================= */
function updateBreath(dt){P.breathCD=Math.max(0,(P.breathCD||0)-dt);const can=P.fpv>0.9&&Math.abs(P.vel)<0.4&&P.breathCD<=0;
  if(can){const was=P.breath||0;P.breath=was+dt;if(was<0.25&&P.breath>=0.25)sfx.inhale();if(P.breath>4.2){P.breath=0;P.breathCD=2.5;sfx.exhale();G.shake=0.06;}}
  else if((P.breath||0)>0.25){P.breath=0;sfx.exhale();}else P.breath=0;
  $('hud').classList.toggle('breath',(P.breath||0)>0.25);}
/* ================= weather: rain, wet streets, lightning ================= */
const RAIN_N=900,rainPos=new Float32Array(RAIN_N*6),rainV=[];
for(let i=0;i<RAIN_N;i++)rainV.push([(Math.random()*2-1)*16,Math.random()*16,(Math.random()*2-1)*16,15+Math.random()*6]);
const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xb8c4d4,transparent:true,opacity:0.35,depthWrite:false}));rain.frustumCulled=false;scene.add(rain);
let rainSrc=null,rainGain=null,lightT=8,flashL=0;const skyBase=sky.material.color.clone();
function weatherOn(){return (SET.weather||'rain')!=='clear';}
function applyWeather(){const w=SET.weather||'rain';const wet=w!=='clear';const pk=MAP==='park';ground.material.roughness=wet?(pk?0.6:0.32):0.95;ground.material.metalness=wet&&!pk?0.15:0;ground.material.color.setScalar(wet?(pk?0.8:0.62):1);
  scene.fog.far=wet?(pk?95:72):(pk?150:95);scene.fog.color.setHex(wet?(pk?0x7a8590:0x3e4248):(pk?0xb8ccdc:0x5a5554));scene.background.setHex(wet?(pk?0x6a7580:0x34383e):(pk?0x9cc0e4:0x4a4a50));sky.material.color.setScalar(wet?(pk?0.62:0.55):1);skyBase.copy(sky.material.color);
  sun.intensity=wet?(pk?0.7:0.55):(pk?1.45:1.05);rain.visible=wet;if(rainGain)rainGain.gain.value=wet?0.06:0;}
function startRainAudio(){if(!AC||rainSrc)return;const b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  rainSrc=AC.createBufferSource();rainSrc.buffer=b;rainSrc.loop=true;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=2600;rainGain=AC.createGain();rainGain.gain.value=weatherOn()?0.06:0;
  rainSrc.connect(f);f.connect(rainGain);rainGain.connect(SFXB);rainSrc.start();}
function updateWeather(dt){const wet=weatherOn();const inside=MAP==='garage'&&Math.abs(camera.position.x)<A+0.5&&Math.abs(camera.position.z)<A+0.5&&camera.position.y<WALL_H;
  rain.visible=wet&&!inside;if(rainGain)rainGain.gain.value=wet?(inside?0.025:0.06):0;
  if(rain.visible){const cx=camera.position.x,cy=camera.position.y,cz=camera.position.z;
    for(let i=0;i<RAIN_N;i++){const r=rainV[i];r[1]-=r[3]*dt;r[0]-=2.2*dt;if(r[1]<-2){r[1]=14;r[0]=(Math.random()*2-1)*16;r[2]=(Math.random()*2-1)*16;}
      let x=cx+r[0],z=cz+r[2],y=cy+r[1]-4;const k=i*6;rainPos[k]=x;rainPos[k+1]=y;rainPos[k+2]=z;rainPos[k+3]=x+0.06;rainPos[k+4]=y+0.55;rainPos[k+5]=z;}
    rainGeo.attributes.position.needsUpdate=true;}
  if((SET.weather||'rain')==='storm'){lightT-=dt;if(lightT<=0){lightT=9+Math.random()*16;flashL=0.35;const dly=0.4+Math.random()*1.8;sfx.thunder(dly);}}
  if(flashL>0){flashL-=dt;const on=(flashL>0.27||(flashL>0.1&&flashL<0.17));hemi.intensity=on?2.6:0.5;sky.material.color.copy(skyBase).multiplyScalar(on?3:1);}else{hemi.intensity=0.5;}}
/* ================= companion survivor ================= */
const ALLY={alive:false,x:3,z:10,yaw:0,hp:100,t:0,cool:0,path:null,pathT:0,vel:0,dead:0};
const allyMat=humanMat.clone();addBurn(allyMat);
const allyRig=buildHuman(buildBodyGeos(Object.assign({poseR:'grip',poseL:'grip'},GOOD_LOOKS[0],{shirt:{kind:'tee',base:[0.16,0.21,0.3]},pants:[0.29,0.29,0.2],shoes:[0.18,0.14,0.1],sleeves:'long',gloves:[0.2,0.2,0.15],bald:true,skin:[0.74,0.56,0.45]})),allyMat);attachTacGear(allyRig,TAC_MATE);allyRig.root.rotation.order='YXZ';allyRig.root.visible=false;scene.add(allyRig.root);
const allyGun=new THREE.Mesh(GUN_GEO.magnum.base,gunMat);allyGun.position.set(0.0,0.42,-0.52);allyRig.torso.add(allyGun);const allyMz=new THREE.Object3D();allyMz.position.set(0,0.02,-0.23);allyGun.add(allyMz);
function resetAlly(){Object.assign(ALLY,{alive:true,x:P.x+1.8,z:P.z+1.5,yaw:0,hp:100,cool:0,path:null,dead:0,vel:0});allyRig.root.visible=true;allyRig.root.rotation.x=0;drawAlly();}
function drawAlly(){const f=$('allyfill');if(f){f.style.width=Math.max(0,ALLY.hp)+'%';f.parentNode.style.opacity=ALLY.alive?1:0.35;}}
function hurtAlly(n){if(!ALLY.alive)return;ALLY.hp-=n;drawAlly();if(ALLY.hp<=0){ALLY.alive=false;ALLY.dead=0.001;showMsg('Your survivor is down!',2);tone(300,120,0.6,0.2,'sawtooth');}}
function updateAlly(dt){const r=allyRig;if(!r.root.visible)return;
  if(!ALLY.alive){ALLY.dead+=dt;r.root.rotation.x=Math.min(1.42,ALLY.dead*ALLY.dead*3);r.root.position.set(ALLY.x,0,ALLY.z);return;}
  const hidden=!!(P.car||P.tank);r.root.visible=!hidden;if(hidden){ALLY.x=P.x+1.5;ALLY.z=P.z+1.5;return;}
  let target=null,bd=18;for(const e of enemies){if(e.dead||e.y>0.5)continue;const d=Math.hypot(e.x-ALLY.x,e.z-ALLY.z);if(d<bd&&losClear(ALLY.x,ALLY.z,e.x,e.z)){bd=d;target=e;}}
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
  const gx=P.roof>=0||P.climb?ALLY.x:P.x-fx*2.4+rx*1.6,gz=P.roof>=0||P.climb?ALLY.z:P.z-fz*2.4+rz*1.6;const dd=Math.hypot(gx-ALLY.x,gz-ALLY.z);
  let wx=gx,wz=gz;if(dd>1&&!losClear(ALLY.x,ALLY.z,gx,gz)){ALLY.pathT-=dt;if(!ALLY.path||ALLY.pathT<=0){ALLY.path=findPath(ALLY.x,ALLY.z,gx,gz);ALLY.pathT=0.8;}
    if(ALLY.path&&ALLY.path.length){while(ALLY.path.length>1&&Math.hypot(ALLY.path[0][0]-ALLY.x,ALLY.path[0][1]-ALLY.z)<0.6)ALLY.path.shift();wx=ALLY.path[0][0];wz=ALLY.path[0][1];}}
  const spd=dd>1.2?Math.min(5.2,dd*1.8):0;ALLY.vel=damp(ALLY.vel,spd,6,dt);
  const mv=Math.atan2(-(wx-ALLY.x),-(wz-ALLY.z));const face=target?Math.atan2(-(target.x-ALLY.x),-(target.z-ALLY.z)):(ALLY.vel>0.3?mv:P.yaw);ALLY.yaw+=angDiff(ALLY.yaw,face)*Math.min(1,dt*8);
  if(ALLY.vel>0.05){const p={x:ALLY.x-Math.sin(mv)*ALLY.vel*dt,z:ALLY.z-Math.cos(mv)*ALLY.vel*dt};collide(p,0.4,0);ALLY.x=p.x;ALLY.z=p.z;}
  ALLY.cool-=dt;if(target&&ALLY.cool<=0&&Math.abs(angDiff(ALLY.yaw,face))<0.3){ALLY.cool=0.55+Math.random()*0.35;allyMz.getWorldPosition(_a);const head=Math.random()<0.25;
    const tp=new THREE.Vector3(target.x,target.y+(head?1.62:1.15)*target.sc,target.z);tracer(_a,tp);spark(_a,0xffd080,0.3);spark(tp,0x3a0606,0.25,false);
    if(AC){const v=clamp(1-Math.hypot(ALLY.x-P.x,ALLY.z-P.z)/40,0.1,1);noise(0.18,3800,200,0.35*v);tone(170,40,0.15,0.3*v,'sine');}
    damageEnemy(target,head?6:2,head,new THREE.Vector3(target.x-ALLY.x,0,target.z-ALLY.z).normalize(),true);alertNoise(ALLY.x,ALLY.z,20);}
  // walk cycle
  ALLY.t+=dt*(ALLY.vel*2.2+0.5);const ph=ALLY.t,amp=clamp(ALLY.vel/3,0,1);r.hips.position.y=1.04-0.05*amp+(0.5-0.5*Math.cos(2*ph))*0.05*amp;
  r.legL.hp.rotation.x=Math.sin(ph)*0.8*amp;r.legR.hp.rotation.x=Math.sin(ph+Math.PI)*0.8*amp;r.legL.kn.rotation.x=-amp*(0.15+1.1*Math.max(0,Math.cos(ph)));r.legR.kn.rotation.x=-amp*(0.15+1.1*Math.max(0,Math.cos(ph+Math.PI)));
  r.torso.rotation.set(-0.1*amp,0,0);const aimK=target?1:0.4;r.armL.sh.rotation.set(1.45*aimK+0.1,0,0.42*aimK);r.armR.sh.rotation.set(1.45*aimK+0.1,0,-0.3*aimK);r.armL.el.rotation.x=0.15;r.armR.el.rotation.x=0.1;
  allyGun.position.set(0,0.42-(1-aimK)*0.25,-0.5+(1-aimK)*0.2);allyGun.rotation.x=-(1-aimK)*0.9;
  if(!r.fs)r.fs=faceState();animateFace(r.face,r.fs,dt,{lid:0.45,brow:target?0:0.2,furrow:target?0.6:0.1,mouth:0,gazeYaw:0,gazePitch:0,blinkMin:2.5,blinkVar:2});
  r.root.position.set(ALLY.x,0,ALLY.z);r.root.rotation.y=ALLY.yaw;}

/* ================= loadout screen ================= */
const LO_OPTS={char:[{k:'custom',name:'Your survivor',desc:'Tap Edit to change outfit, hair, glasses and beard'}],
  primary:[{k:'rifle',name:'Assault Rifle',stats:[0.55,0.85,0.6],desc:'Full auto, 30 rounds. AR-15 or QBZ-191 in Mods'},{k:'wrench',name:'Pipe Wrench',stats:[0.75,0.55,0.15],desc:'Jessa\u2019s melee weapon. Heavy swings, never runs dry. Rifle as backup'},{k:'rpg',name:'RPG-7',stats:[1,0.1,0.05],desc:'Rocket launcher'},{k:'shotgun',name:'Pump Shotgun',stats:[0.95,0.3,0.25],desc:'8 pellets, 6 shells'}],
  secondary:[{k:'magnum',name:'.357 Magnum',stats:[0.85,0.35,0.25],desc:'6 rounds, hits hard'},{k:'wrench',name:'Pipe Wrench',stats:[0.75,0.55,0.15],desc:'Melee. Heavy swings, never runs dry'},{k:'weld',name:'Weld Gun',stats:[0.45,0.95,0.15],desc:'Jessa\u2019s jury-rigged torch. Short range, sets Bombies on fire'},{k:'none',name:'None',stats:null,desc:'Travel light'}],
  lethal:[{k:'toxic',name:'Toxic grenade',desc:'Gas cloud that eats Bombies inside it'},{k:'frag',name:'Frag Grenade',desc:'Overhand throw, big blast'},{k:'molotov',name:'Molotov',desc:'Smaller blast, leaves fire'}],
  perk:[{k:'medic',name:'Field Medic',desc:'Start with 125 health'},{k:'hands',name:'Fast Hands',desc:'Reload 35% faster'},{k:'steady',name:'Steady Aim',desc:'Less recoil and spread'}]};
const LO_ROWS=[['char','Character'],['primary','Primary weapon'],['secondary','Secondary weapon'],['lethal','Lethal'],['perk','Perk']];const NR=LO_ROWS.length;
const LO=(()=>{try{return Object.assign({primary:'rifle',secondary:'magnum',lethal:'frag',perk:'medic'},JSON.parse(localStorage.getItem('sb-loadout')||'{}'));}catch(e){return {primary:'rifle',secondary:'magnum',lethal:'frag',perk:'medic'};}})();
const LOUI={sel:0,open:false,rep:0};const loLight=new THREE.DirectionalLight(0xfff0e0,0);scene.add(loLight);scene.add(loLight.target);
const ICONS={toxic:'<svg viewBox="0 0 120 40"><rect x="52" y="8" width="16" height="28" rx="4"/><rect x="55" y="3" width="10" height="6"/><circle cx="60" cy="22" r="4" fill="#7fd23a"/></svg>',rpg:'<svg viewBox="0 0 120 40"><rect x="14" y="17" width="74" height="7"/><path d="M88 13h14l12 7-12 7H88z"/><path d="M6 13h10v15H6z"/><path d="M44 24h7l-3 12h-6z"/></svg>',
  rifle:'<svg viewBox="0 0 120 40"><path d="M4 18h18l4-3h30l2-3h10v3h38v4H82l-2 3H60l-6 14h-9l3-11H34l-8 8H8l2-8H4z"/></svg>',
  shotgun:'<svg viewBox="0 0 120 40"><path d="M4 17h20l6-3h84v4H70v3H52l-6 13h-8l3-10H30l-8 7H6l2-8H4z"/></svg>',
  magnum:'<svg viewBox="0 0 120 40"><path d="M30 12h60v6H58v4H52l-4 14h-10l3-12-11-2z"/><circle cx="56" cy="20" r="6"/></svg>',
  none:'<svg viewBox="0 0 120 40"><path d="M50 10l20 20M70 10L50 30" stroke="currentColor" stroke-width="4"/></svg>',
  frag:'<svg viewBox="0 0 120 40"><ellipse cx="60" cy="24" rx="11" ry="13"/><rect x="55" y="6" width="10" height="6"/><path d="M66 9q10-2 10 8" stroke="currentColor" stroke-width="3" fill="none"/></svg>',
  molotov:'<svg viewBox="0 0 120 40"><path d="M56 4h8v8l6 6v20H50V18l6-6z"/><path d="M58 4q2-6 6-2q-2 3 0 6" fill="#ff8a3a"/></svg>',
  medic:'<svg viewBox="0 0 120 40"><path d="M54 6h12v10h10v12H66v10H54V28H44V16h10z"/></svg>',
  hands:'<svg viewBox="0 0 120 40"><rect x="44" y="8" width="14" height="26" rx="2"/><path d="M66 12l12 8-12 8z"/></svg>',
  steady:'<svg viewBox="0 0 120 40"><circle cx="60" cy="20" r="13" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="20" r="3"/><path d="M60 2v8M60 30v8M42 20h8M70 20h8" stroke="currentColor" stroke-width="3"/></svg>'};
function loOpt(row){const list=LO_OPTS[row];return list.find(o=>o.k===LO[row])||list[0];}
function gunStats(k){const W=GUNS[k];if(W.rocket)return [1,0.08,0.05];return [clamp(W.dmg*W.pellets/7,0.05,1),clamp(0.105/W.cd,0.05,1),clamp(W.mag/20,0.05,1)];}
function attSummary(k){return ATT_OPTS[k].map(([cat,,o])=>{const v=o.find(x=>x[0]===ATT[k][cat]);return v?v[1]:'';}).join(' \u00b7 ');}
function buildLoadout(){const el=$('loSlots');el.innerHTML='';const det=$('loDet');
  if(LOUI.att){const k=LOUI.att,cats=ATT_OPTS[k];const isC=k==='char';$('loTitle').textContent=isC?'Character':GUNS[k].name+' mods';$('loSub').textContent=isC?'Outfit and look':'Attachments';
    cats.forEach(([cat,label,opts],i)=>{const v=opts.find(x=>x[0]===ATT[k][cat])||opts[0];const d=document.createElement('div');d.className='slot att'+(i===LOUI.sel?' sel':'');
      d.innerHTML='<span class="slab">'+label+'</span><button class="arr l" aria-label="Previous">\u2039</button><span class="snm">'+v[1]+'</span><span class="pips">'+opts.map(x=>'<i'+(x[0]===v[0]?' class="on"':'')+'></i>').join('')+'</span><button class="arr r" aria-label="Next">\u203a</button>';
      d.querySelector('.arr.l').addEventListener('click',e=>{e.stopPropagation();LOUI.sel=i;attCycle(k,cat,-1);buildLoadout();});d.querySelector('.arr.r').addEventListener('click',e=>{e.stopPropagation();LOUI.sel=i;attCycle(k,cat,1);buildLoadout();});
      d.addEventListener('click',()=>{LOUI.sel=i;buildLoadout();});el.appendChild(d);});
    const n=cats.length;const cur=LOUI.sel<n?cats[LOUI.sel]:null;const st=isC?null:gunStats(k);
    det.innerHTML=(cur?'<span class="desc">'+((cur[2].find(x=>x[0]===ATT[k][cur[0]])||[])[2]||'')+'</span>':'')+(isC?'':['Damage','Fire rate','Magazine'].map((nm,j)=>'<span class="bar"><b>'+nm+'</b><i style="--v:'+st[j]+'"></i></span>').join(''));
    $('loStart').textContent='Done';$('loBack').textContent='Defaults';$('loStart').classList.toggle('sel',LOUI.sel===n);$('loBack').classList.toggle('sel',LOUI.sel===n+1);if(!isC){equip(k);buildStage(k);}else buildStage(null);return;}
  buildStage(null);
  $('loTitle').textContent='Loadout';$('loSub').textContent='Survivor kit';$('loStart').textContent='Start mission';$('loBack').textContent='Back';
  LO_ROWS.forEach(([row,label],i)=>{const o=loOpt(row);const gun=GUNS[o.k]?o.k:null;const isChar=row==='char';const d=document.createElement('div');d.className='slot'+(i===LOUI.sel?' sel':'')+(gun||isChar?' gun':'');
    d.innerHTML='<span class="slab">'+label+'</span><button class="arr l" aria-label="Previous">\u2039</button><span class="sic">'+(ICONS[o.k]||'')+'</span><span class="snm">'+(gun?GUNS[gun].name+(gun==='rifle'?' Rifle':gun==='shotgun'||gun==='wrench'||gun==='weld'?'':' .357'):o.name)+'</span>'+(gun?'<button class="mods" aria-label="Attachments">Mods</button>':isChar?'<button class="mods" aria-label="Edit character">Edit</button>':'')+'<button class="arr r" aria-label="Next">\u203a</button>';
    d.querySelector('.arr.l').addEventListener('click',e=>{e.stopPropagation();LOUI.sel=i;loCycle(row,-1);});d.querySelector('.arr.r').addEventListener('click',e=>{e.stopPropagation();LOUI.sel=i;loCycle(row,1);});
    if(gun||isChar)d.querySelector('.mods').addEventListener('click',e=>{e.stopPropagation();openMods(isChar?'char':gun);});
    d.addEventListener('click',()=>{LOUI.sel=i;buildLoadout();});el.appendChild(d);});
  const o=LOUI.sel<NR?loOpt(LO_ROWS[LOUI.sel][0]):null;
  det.innerHTML=!o?'<span class="desc">Ready when you are.</span>':GUNS[o.k]?'<span class="desc">'+attSummary(o.k)+'</span>'+['Damage','Fire rate','Magazine'].map((n,j)=>'<span class="bar"><b>'+n+'</b><i style="--v:'+gunStats(o.k)[j]+'"></i></span>').join(''):'<span class="desc">'+o.desc+'</span>';
  $('loStart').classList.toggle('sel',LOUI.sel===NR);$('loBack').classList.toggle('sel',LOUI.sel===NR+1);
  equip(LO.primary);}
function openMods(k){LOUI.att=k;LOUI.main=LOUI.sel;LOUI.sel=0;tone(520,780,0.06,0.1,'triangle');buildLoadout();}
function closeMods(){LOUI.att=null;buildStage(null);LOUI.sel=LOUI.main||0;buildLoadout();}
function loRows(){return LOUI.att?ATT_OPTS[LOUI.att].length:NR;}
function loCycle(row,d){const list=LO_OPTS[row];const i=list.findIndex(o=>o.k===LO[row]);LO[row]=list[(i+d+list.length)%list.length].k;try{localStorage.setItem('sb-loadout',JSON.stringify(LO));}catch(e){}tone(600,760,0.04,0.07,'square');buildLoadout();}
// one parent container, hidden at start; the toggle flips it on and off
function toggleLoadout(force){const open=force!==undefined?force:!LOUI.open;LOUI.open=open;$('loadout').classList.toggle('on',open);
  if(open){G.loBack=G.state;LOUI.att=null;setState('loadout');LOUI.sel=NR;buildLoadout();}else{LOUI.att=null;setState('title');equip('rifle');}}
function loActivate(){const n=loRows();if(LOUI.att){if(LOUI.sel===n)closeMods();else if(LOUI.sel===n+1)loDefaults();else{attCycle(LOUI.att,ATT_OPTS[LOUI.att][LOUI.sel][0],1);buildLoadout();}return;}
  if(LOUI.sel===NR)loStart();else if(LOUI.sel===NR+1)toggleLoadout(false);else{const row=LO_ROWS[LOUI.sel][0];const o=loOpt(row);if(row==='char')openMods('char');else if(GUNS[o.k])openMods(o.k);else loCycle(row,1);}}
function loDefaults(){if(LOUI.att==='char'){Object.assign(OUTFIT,OUTFIT_DEFAULT);saveOutfit();applyOutfit(OUTFIT);buildLoadout();return;}const D={rpg:{warhead:'he',scope:'iron'},wrench:{grip:'wrap'},weld:{tip:'arc'},rifle:{model:'ar',scope:'iron',barrel:'std',mag:30},shotgun:{ammo:'buck',grip:'pump',finish:'synthetic'},magnum:{barrel:'std',cyl:6,grip:'rubber',finish:'stainless'}};Object.assign(ATT[LOUI.att],D[LOUI.att]);saveAtt();applyAttachments();buildLoadout();}
function loStart(){LOUI.open=false;$('loadout').classList.remove('on');resetGame();applyLoadout();
  if(DEADZONE&&!G.introSeen&&typeof playIntro==='function'){G.introSeen=true;G.state='intro';playIntro(()=>setState('play'));}else setState('play');}
function applyLoadout(){resetInv();if(LO.secondary==='wrench'||LO.primary==='wrench')INV.wrench={own:true,ammo:1,reserve:Infinity};
  if(LO.secondary==='magnum')INV.magnum={own:true,ammo:GUNS.magnum.mag,reserve:GUNS.magnum.reserve};
  if(LO.secondary==='weld')INV.weld={own:true,ammo:GUNS.weld.mag,reserve:GUNS.weld.reserve};
  if(LO.primary==='rpg'){INV.rpg={own:true,ammo:1,reserve:GUNS.rpg.reserve};equip('rpg');P.ammo=1;P.reserve=INV.rpg.reserve;}else if(LO.primary==='shotgun'){INV.shotgun={own:true,ammo:GUNS.shotgun.mag,reserve:GUNS.shotgun.reserve*2};equip('shotgun');P.ammo=INV.shotgun.ammo;P.reserve=INV.shotgun.reserve;}else if(LO.primary==='wrench'){equip('wrench');}else equip('rifle');
  P.maxHp=LO.perk==='medic'?125:100;P.hp=P.maxHp;P.reloadK=LO.perk==='hands'?0.65:1;P.steady=LO.perk==='steady';if(HORDE)setTimeout(hordeReset,0);G.nadeKind=DEADZONE?'toxic':LO.lethal;P.traps=DEADZONE?{mine:4,snare:4}:{mine:2,snare:2};P.trapType=P.trapType||'mine';TRAPS.slice().forEach(removeTrap);GAS.slice().forEach(g=>{g.t=0;});drawHud();}
function updateLoadoutInput(dt){const y=clamp(-stickVec.y+(input.up?1:0)-(input.down?1:0),-1,1),x=clamp(stickVec.x+(input.right?1:0)-(input.left?1:0),-1,1);LOUI.rep-=dt;
  if(Math.abs(y)<0.4&&Math.abs(x)<0.4){LOUI.rep=0;return;}if(LOUI.rep>0)return;LOUI.rep=0.28;
  const n=loRows();if(Math.abs(y)>=Math.abs(x)){LOUI.sel=(LOUI.sel+(y>0?-1:1)+n+2)%(n+2);tone(700,700,0.03,0.06,'square');buildLoadout();}
  else if(LOUI.sel<n){if(LOUI.att){attCycle(LOUI.att,ATT_OPTS[LOUI.att][LOUI.sel][0],x>0?1:-1);buildLoadout();}else loCycle(LO_ROWS[LOUI.sel][0],x>0?1:-1);}}
$('loStart').addEventListener('click',e=>{e.stopPropagation();initAudio();if(LOUI.att)closeMods();else loStart();});
$('loBack').addEventListener('click',e=>{e.stopPropagation();if(LOUI.att)loDefaults();else toggleLoadout(false);});
addEventListener('keydown',e=>{if(e.code==='KeyL'&&(G.state==='title'||G.state==='loadout'))toggleLoadout();});
/* ================= victims on the ground (food for feeding zombies) ================= */
const poolTex=canvasTex(128,128,g=>{for(let i=0;i<7;i++){const x=64+(Math.random()-.5)*40,y=64+(Math.random()-.5)*40,r=22+Math.random()*26;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(60,4,4,.95)');gr.addColorStop(0.7,'rgba(45,3,3,.8)');gr.addColorStop(1,'rgba(30,2,2,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}});
const poolMat=new THREE.MeshStandardMaterial({map:poolTex,transparent:true,depthWrite:false,roughness:0.15,metalness:0.1,polygonOffset:true,polygonOffsetFactor:-2});
function initFood(){(MAP==='park'?[[6,-6],[12,-22],[-30,-40],[20,34],[2,-44]]:[[-9,-9],[11,-12],[-30,-40],[27,30],[2,-44]]).forEach(([x,z],i)=>{let tries=0;while(blocked(x,z)&&tries++<12){x+=(Math.random()-.5)*3;z+=(Math.random()-.5)*3;}
  const look=Object.assign({},GOOD_LOOKS[i%GOOD_LOOKS.length],{poseR:'relax',poseL:'relax',seed:40+i});const mat=humanMat.clone();addBurn(mat);const r=buildHuman(buildBodyGeos(look),mat);r.root.rotation.order='YXZ';
  r.root.children.forEach(ch=>{if(ch.material&&ch.material.map===blobTex)ch.visible=false;});
  const a0=Math.random()*Math.PI*2;r.root.position.set(x,0.16,z);r.root.rotation.set(-1.5,a0,0);r.armL.sh.rotation.set(2.6,0,0.6);r.armR.sh.rotation.set(0.4,0,-0.5);r.armR.el.rotation.x=1.2;r.legL.hp.rotation.x=0.4;r.legL.kn.rotation.x=-0.9;r.head.rotation.set(0,0.9,0);
  mat.userData.bu&&(mat.userData.bu.burn.value=0.08);scene.add(r.root);
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),poolMat);pool.rotation.x=-Math.PI/2;pool.position.set(x,0.012,z);pool.receiveShadow=true;scene.add(pool);
  FOOD.push({x,z,a0,feeders:[],r});});}
// little HUD cue so you know whether you're sneaking
function updateStealth(){const el=$('stealth');if(!el)return;if(G.state!=='play'){el.textContent='';return;}
  const spotted=enemies.some(e=>!e.dead&&e.mode==='chase'&&e.seen);const near=enemies.some(e=>!e.dead&&Math.hypot(e.x-P.x,e.z-P.z)<18);
  el.textContent=spotted?'Spotted':(near?'Unseen':'');el.className=spotted?'sp':'';}
/* ================= attachments ================= */
const ATT_OPTS={
  rifle:[['model','Rifle',[['ar','AR-15','Tan carbine with holo sight'],['qbz','QBZ-191','Steel and black, iron sights, longer barrel, hits harder']]],['scope','Optic',[['iron','Built-in sight','Holo on the AR-15, irons on the QBZ-191'],['1.5x','1.5x scope','Slight zoom, wide view'],['3x','3x scope','Mid-range zoom'],['5x','5x scope','Long-range zoom, more sway']]],
    ['barrel','Barrel',[['short','Short barrel','Light and fast, more spread'],['std','Standard barrel','Balanced'],['ext','Suppressor','More damage and accuracy'],['light','Light barrel','Less recoil, quicker aim']]],
    ['mag','Magazine',[[20,'20-round','Reloads faster'],[30,'30-round','Ten more shots']]]],
  shotgun:[['ammo','Ammo',[['buck','Buckshot','8 pellets, wide spread'],['slug','Slugs','One heavy, accurate round'],['fire','Incendiary shot','Sets zombies on fire']]],
    ['grip','Grip',[['pump','Standard pump','Classic grooved pump'],['vert','Vertical grip','Much less recoil'],['stub','Stub grip','Quicker follow-up shots']]],
    ['finish','Stock',[['synthetic','Black synthetic','Pistol-grip stock'],['walnut','Walnut','Classic wood stock']]]],
  rpg:[['warhead','Warhead',[['he','HE rocket','Huge blast'],['fire','Thermobaric','Blast that leaves fire']]],['scope','Optic',[['iron','Iron sights','Fast and simple'],['2.5x','PGO-7 2.5x','Zoomed optic on the side']]]],
  weld:[['tip','Tip',[['arc','Arc tip','Focused cone, longer reach'],['wide','Wide flare','Wider cone, shorter reach']]]],
  wrench:[['grip','Grip',[['wrap','Cord wrap','Sure grip, quicker swings'],['steel','Bare steel','Heavier, hits harder']]]],
  magnum:[['barrel','Barrel',[['snub','Snub 2.5"','Quick, more spread'],['std','Standard 6"','Balanced'],['long','Long 8.4"','More damage and accuracy']]],
    ['cyl','Cylinder',[[6,'Six-shot','Faster reload'],[8,'Eight-shot','Two extra rounds']]],
    ['grip','Grip',[['rubber','Rubber grip','Less recoil'],['wood','Walnut grip','Checkered wood']]],
    ['finish','Finish',[['stainless','Stainless','Bright steel'],['blued','Blued','Dark polished steel']]]]};
let HB_BASE=null;
const gripHandGeoL=buildHandGeo(HERO_LOOK,-1,'grip'),vmGripGeoL=buildHandGeo(vmLook,-1,'grip'),vmFgGeoL=vmHands.L.geometry;
const handMatL=humanMat.clone();const gripHandL=new THREE.Mesh(gripHandGeoL,handMatL);gripHandL.matrixAutoUpdate=false;gripHandL.visible=false;gripHandL.castShadow=true;scene.add(gripHandL);
const _s1k=new THREE.Matrix4().makeScale(1000,1000,1000);
function syncGripHand(){const on=P.weapon==='shotgun'&&ATT.shotgun.grip!=='pump'&&hero.root.visible&&P.reloadT<=0&&P.nadeT<0&&!P.climb;hero.armL.hand.scale.setScalar(on?0.001:1);gripHandL.visible=on;
  if(on){hero.armL.hand.updateWorldMatrix(true,false);gripHandL.matrix.copy(hero.armL.hand.matrixWorld).multiply(_s1k);}}
function applyAttachments(){if(!HB_BASE)HB_BASE={shotgun:{wL:HB.shotgun.wL.slice(),L:HB.shotgun.L.clone()}};
  for(const k in GUNS){Object.assign(GUNS[k],JSON.parse(JSON.stringify(GUNS_BASE[k])));if(GUNS[k].reserve==null)GUNS[k].reserve=Infinity;const g=buildGunGeo(k);fillGunGroup(hero.gunMeshes[k],k,g);fillGunGroup(vmGuns[k],k,k==='rpg'?rpgParts(ATT.rpg,true):g);GUNS[k].muzzle=[0,GUNS[k].muzzle[1],g.muzzleZ];GUNS[k].sight=g.sight;GUNS[k].adsZ=g.adsZ||-0.26;GUNS[k].sightX=g.sightX||0;}
  if(ATT.weld&&ATT.weld.tip==='wide'){GUNS.weld.range=4.8;GUNS.weld.cone=0.42;}
  if(ATT.wrench&&ATT.wrench.grip==='steel'){GUNS.wrench.dmg*=1.25;GUNS.wrench.cd*=1.15;}else{GUNS.wrench.cd*=0.92;}
  const R=GUNS.rifle,A=ATT.rifle;R.zoom=SCOPES[A.scope]||1;
  if(!HB_BASE.rifle)HB_BASE.rifle={wR:HB.rifle.wR.slice(),wL:HB.rifle.wL.slice()};const QB=A.model==='qbz';R.name=QB?'QBZ-191':'AR-15';
  HB.rifle.wR=QB?[0.03,-0.1,0.14]:HB_BASE.rifle.wR.slice();HB.rifle.wL=QB?[-0.055,-0.042,-0.26]:HB_BASE.rifle.wL.slice();R.magPos=QB?[0,-0.15,-0.09]:[0,-0.17,-0.07];
  if(QB){R.dmg*=1.15;R.cd*=1.08;R.spread*=0.85;R.recoil*=1.1;}
  if(A.barrel==='short'){R.dmg*=0.9;R.spread*=1.45;R.recoil*=0.9;}else if(A.barrel==='ext'){R.dmg*=1.2;R.spread*=0.6;}else if(A.barrel==='light'){R.recoil*=0.7;R.spread*=1.1;}
  R.mag=A.mag===20?20:30;if(R.mag===20)R.reload*=0.85;if(R.zoom>=3)R.spread*=0.8;
  const S=GUNS.shotgun,B=ATT.shotgun;
  if(B.ammo==='slug'){S.pellets=1;S.dmg=6;S.spread=0.008;}else if(B.ammo==='fire'){S.dmg=0.7;S.spread=0.07;S.fire=true;}
  if(B.grip==='vert'){S.recoil*=0.65;S.spread*=0.85;}else if(B.grip==='stub'){S.recoil*=0.85;S.cd*=0.88;}
  HB.shotgun.wL=B.grip==='pump'?HB_BASE.shotgun.wL.slice():B.grip==='vert'?[-0.03,-0.1,-0.285]:[-0.03,-0.07,-0.29];
  HB.shotgun.L=B.grip==='pump'?HB_BASE.shotgun.L.clone():basisQ([0,-1,0],[0,0,1],[-1,0,0],-0.3);
  const Mg=GUNS.magnum,C=ATT.magnum;
  if(C.barrel==='snub'){Mg.dmg*=0.85;Mg.spread*=1.8;Mg.reload*=0.9;}else if(C.barrel==='long'){Mg.dmg*=1.2;Mg.spread*=0.6;}
  {const Rg=GUNS.rpg;Rg.zoom=SCOPES[ATT.rpg.scope]||1;Rg.fireHead=ATT.rpg.warhead==='fire';}
  if(C.cyl===8){Mg.mag=8;Mg.reserve=24;Mg.reload*=1.1;}if(C.grip==='rubber')Mg.recoil*=0.8;
  vmHands.L.geometry=B.grip==='pump'?vmFgGeoL:vmGripGeoL;
  VM.userData.w=null;if(G.state!=='play')equip(P.weapon);}
function attCycle(k,cat,d){if(k==='char'){const o=ATT_OPTS.char.find(c=>c[0]===cat)[2];const i=o.findIndex(v=>v[0]===OUTFIT[cat]);OUTFIT[cat]=o[(i+d+o.length)%o.length][0];saveOutfit();applyOutfit(OUTFIT);if(cat==='body'&&OUTFIT.body==='jessa'&&(LO.primary!=='wrench'||LO.secondary!=='weld')){LO.primary='wrench';LO.secondary='weld';try{localStorage.setItem('sb-loadout',JSON.stringify(LO));}catch(e){}showMsg('Jessa\u2019s kit: pipe wrench and weld gun',1.6);}tone(600,760,0.04,0.07,'square');return;}const o=ATT_OPTS[k].find(c=>c[0]===cat)[2];const i=o.findIndex(v=>v[0]===ATT[k][cat]);ATT[k][cat]=o[(i+d+o.length)%o.length][0];saveAtt();applyAttachments();tone(600,760,0.04,0.07,'square');}
/* ================= thrown by blasts, getting back up; climbing into and driving cars ================= */
function launchHero(x,z,pd){const dx=P.x-x,dz=P.z-z,L=Math.hypot(dx,dz)||1,k=clamp(1.3-pd/5,0.4,1.2);P.kd={ph:'air',t:0,vx:dx/L*7*k,vz:dz/L*7*k,vy:5.5*k,rx:0,rz:(Math.random()-.5)*1.4,spin:(5+Math.random()*3)*k};input.fire=false;P.adsHold=false;P.vel=0;P.sv=0;}
function updateKnock(dt){const k=P.kd;if(!k)return;k.t+=dt;P.vy=0;
  if(k.ph==='air'){k.vy-=16*dt;const p={x:P.x+k.vx*dt,z:P.z+k.vz*dt};collide(p,0.4,P.y);P.x=p.x;P.z=p.z;P.y+=k.vy*dt;k.rx=Math.min(Math.PI/2,k.rx+k.spin*dt);
    if(P.y<=0&&k.vy<0){P.y=0;k.ph='down';k.t=0;G.shake=0.35;sfx.thud();buzz(90);emit('smoke',P.x,0.2,P.z,0,0.6,0,1.6,0.6,1.2);}}
  else if(k.ph==='down'){k.rx=damp(k.rx,Math.PI/2,10,dt);if(k.t>1.1){k.ph='rise';k.t=0;say('hurt',0.5,true);}}
  else if(k.ph==='rise'){if(k.t>1.7)P.kd=null;}}
function animateHero(dt){const k=P.kd;for(const n in hero.gunMeshes)hero.gunMeshes[n].visible=n===P.weapon;updateModGlow();
  if(P.car||P.enterT!==undefined&&P.enterT<1&&P.enterCar){seatPose(dt);return;}
  if(k&&k.ph!=='rise'){knockPose(k,dt);return;}
  animateHero0(dt);if(k&&k.ph==='rise')risePose(k);else postureLayer(dt);}
function knockPose(k,dt){const r=hero;r.root.position.set(P.x,P.y+(k.ph==='down'?0.12:0),P.z);r.root.rotation.set(k.rx,P.yaw,k.rz*(k.rx/1.57));for(const n in r.gunMeshes)r.gunMeshes[n].visible=false;
  const fl=k.ph==='air'?1:0,t=G.time*14;r.hips.position.y=1.04;r.torso.rotation.set(-0.2*fl,0,0);r.head.rotation.set(k.ph==='down'?-0.4:0.3*Math.sin(t),0,0);
  r.armL.sh.rotation.set(fl?2.2+Math.sin(t)*0.8:0.4,0,fl?1.0:1.3);r.armR.sh.rotation.set(fl?2.0+Math.sin(t+2)*0.8:0.3,0,fl?-1.0:-1.25);r.armL.el.rotation.x=fl?0.8:0.3;r.armR.el.rotation.x=fl?0.6:0.4;
  r.legL.hp.rotation.set(fl?0.6+Math.sin(t+1)*0.6:0.15,0,0.15);r.legR.hp.rotation.set(fl?0.2+Math.sin(t+3)*0.6:0.4,0,-0.12);r.legL.kn.rotation.x=fl?-0.9:-0.2;r.legR.kn.rotation.x=fl?-0.5:-0.7;
  if(r.face)animateFace(r.face,r.fs||(r.fs=faceState()),dt,{lid:k.ph==='down'?0.15:0.75,brow:0.8,furrow:0.8,mouth:0.5,ex:{squint:1,snarl:0.6},gazeYaw:0,gazePitch:0,blinkMin:3,blinkVar:2});}
// get up: roll onto a knee with the gun coming up, then stand
function risePose(k){const r=hero,g=clamp(k.t/1.7,0,1);r.root.rotation.z*=Math.max(0,1-g*2.5);const a=clamp(g/0.45,0,1),b=clamp((g-0.45)/0.55,0,1);const e=t=>t*t*(3-2*t);
  r.root.rotation.x=(1-e(a))*Math.PI/2;r.root.position.y=P.y+(1-e(a))*0.12;const kneel=1-e(b);
  r.hips.position.y=lerp(1.04,0.6,kneel);r.legL.hp.rotation.x=lerp(r.legL.hp.rotation.x,1.35,kneel);r.legL.kn.rotation.x=lerp(r.legL.kn.rotation.x,-1.45,kneel);
  r.legR.hp.rotation.x=lerp(r.legR.hp.rotation.x,-0.15,kneel);r.legR.kn.rotation.x=lerp(r.legR.kn.rotation.x,-1.75,kneel);r.torso.rotation.x+=0.25*kneel*(1-a*0.5);
  for(const n in r.gunMeshes)r.gunMeshes[n].visible=n===P.weapon&&g>0.3;}
function seatPose(dt){const r=hero,c=P.car||P.enterCar;if(!c)return;const et=P.enterT===undefined?1:P.enterT;const e=t=>t*t*(3-2*t);
  const door=new THREE.Vector3(-1.45,0,0.42),seat=new THREE.Vector3(-0.4,-0.29,0.42);const a=e(clamp((et-0.25)/0.35,0,1)),b=e(clamp((et-0.55)/0.3,0,1));
  const lp=door.clone().lerp(new THREE.Vector3(-0.85,-0.1,0.42),a).lerp(seat,b);c.m.updateMatrixWorld();const wp=lp.applyMatrix4(c.m.matrixWorld);
  if(et<0.25){const s=e(et/0.25);r.root.position.set(lerp(P.ex,wp.x,s),0,lerp(P.ez,wp.z,s));}else r.root.position.copy(wp);r.root.rotation.set(0,c.ry,0);
  for(const n in r.gunMeshes)r.gunMeshes[n].visible=false;const st=c.steer||0;
  r.hips.position.y=1.04;r.torso.rotation.set(-0.06,0,0);r.head.rotation.set(0.05,st*0.25,0);
  // right leg swings in first, then the left, then settle and take the wheel
  const rl=Math.max(a,b),ll=b;r.legR.hp.rotation.set(1.45*rl,0,0);r.legR.kn.rotation.x=-1.35*rl;r.legL.hp.rotation.set(1.45*ll,0,0);r.legL.kn.rotation.x=-1.35*ll;
  const hw=e(clamp((et-0.8)/0.2,0,1));r.armL.sh.rotation.set(lerp(0.2,1.05,hw),0,lerp(0.15,-0.32+st*0.18,hw));r.armR.sh.rotation.set(lerp(0.2,1.05,hw),0,lerp(-0.15,0.32+st*0.18,hw));
  r.armL.el.rotation.x=lerp(0.2,0.8,hw);r.armR.el.rotation.x=lerp(0.2,0.8,hw);r.armL.hand.rotation.set(0,0,0);r.armR.hand.rotation.set(0,0,0);
  if(c.m.userData.wheel)c.m.userData.wheel.rotation.z=-st*1.6;
  if(r.face)animateFace(r.face,r.fs||(r.fs=faceState()),dt,{lid:0.5,brow:0,furrow:0.4,mouth:0,ex:{squint:0.3,smile:0.2},gazeYaw:st*0.4,gazePitch:0,blinkMin:2,blinkVar:2});}
/* ================= movement moves: jump, crouch, slide, drop to prone, landings ================= */
function heroJump(){if(G.state!=='play'||P.car||P.climb||P.kd||P.dying)return;if(P.stance!=='stand'){P.stance=P.stance==='prone'?'crouch':'stand';return;}if(P.air)return;
  P.vy=5.8;P.air=true;P.slideT=0;noise(0.07,800,300,0.1,'lowpass');}
function heroCrouch(){if(G.state!=='play'||P.car||P.climb||P.kd||P.dying)return;
  if(P.stance==='stand'&&P.sprintT>0.35&&!P.air){P.slideT=0.75;P.slideV=Math.max(P.vel,6)+2.2;P.stance='crouch';noise(0.45,1400,300,0.18,'bandpass');return;}
  if(P.stance==='stand'&&(input.fire||P.adsHold)){P.stance='prone';G.shake=Math.max(G.shake,0.08);sfx.thud();return;}
  P.stance=P.stance==='stand'?'crouch':P.stance==='crouch'?'stand':'crouch';}
// posture layer on top of the normal animation
function postureLayer(dt){const r=hero;if(P.dying)return;const pr=P.stance==='prone'?1:0,sl=P.slideT>0?1:0,cr=P.stance==='crouch'&&!sl?1:0,air=P.air&&!P.climb?1:0,land=P.landT>0?Math.min(1,P.landT/0.2):0;
  P.pk=damp(P.pk||0,pr,8,dt);P.sk=damp(P.sk||0,sl,12,dt);P.ck=damp(P.ck||0,cr,10,dt);P.ak=damp(P.ak||0,air,10,dt);P.lk=damp(P.lk||0,land,18,dt);const pk=P.pk,sk=P.sk,ck=P.ck,ak=P.ak,lk=P.lk;
  r.root.rotation.x=-1.42*pk+0.4*sk;r.root.rotation.z=0;r.root.position.y+=0.14*pk;
  const dip=Math.max(ck*0.34,sk*0.5,lk*0.3);r.hips.position.y-=dip;
  r.legL.hp.rotation.x+=ck*1.05+sk*1.35+ak*0.7+lk*0.9;r.legL.kn.rotation.x-=ck*1.7+sk*0.1+ak*1.2+lk*1.4;
  r.legR.hp.rotation.x+=ck*0.75+sk*0.55+ak*0.35+lk*0.5;r.legR.kn.rotation.x-=ck*1.55+sk*1.8+ak*0.9+lk*1.6;
  r.torso.rotation.x+=-0.18*ck-0.35*sk+1.25*pk;r.head.rotation.x+=0.15*sk+0.25*pk;
  if(pk>0.5){r.legL.hp.rotation.x=lerp(r.legL.hp.rotation.x,-0.1,pk);r.legR.hp.rotation.x=lerp(r.legR.hp.rotation.x,0.1,pk);r.legL.kn.rotation.x=lerp(r.legL.kn.rotation.x,-0.15,pk);r.legR.kn.rotation.x=lerp(r.legR.kn.rotation.x,-0.3,pk);}}
function updateWarhead(){const vis=P.weapon!=='rpg'||P.ammo>0||(P.reloadT>0&&P.reloadT<P.reloadMax*0.45);for(const g of[hero.gunMeshes.rpg,vmGuns.rpg])if(g&&g.userData.forend)g.userData.forend.visible=vis;}
function updateModGlow(){updateWarhead();const on=G.state==='loadout'&&LOUI.att;HL_MAT.opacity=0.32+0.18*Math.sin(performance.now()*0.005);HL_MAT.color.setHex(0xffa83a);
  if(stageGun){const hl=stageGun.userData.gun.userData.hl||{};const cat=on&&stageK&&LOUI.sel<(ATT_OPTS[stageK]||[]).length?ATT_OPTS[stageK][LOUI.sel][0]:null;for(const c in hl)hl[c].visible=c===cat;}
  for(const k in hero.gunMeshes){const hl=hero.gunMeshes[k].userData.hl||{};const cat=on&&k===LOUI.att&&LOUI.sel<ATT_OPTS[k].length?ATT_OPTS[k][LOUI.sel][0]:null;for(const c in hl)hl[c].visible=c===cat;}}
function applyLayout(){const m=SET.padLayout||'auto';const desk=innerWidth/innerHeight>1.15&&innerWidth>=820;const ov=true;document.body.classList.toggle('overlay',ov);document.body.classList.toggle('desk',desk&&m!=='below');}
addEventListener('resize',applyLayout);addEventListener('orientationchange',applyLayout);
function FOVK(){const a=Math.max(0.5,camera.aspect||1),v=h=>2*Math.atan(Math.tan(h*Math.PI/360)/a);return v(SET.fov||80)/v(80);}
applyLayout();
function applyHz(){try{if(window.BombiesHz)window.BombiesHz.setHz(SET.hz);}catch(e){}}applyHz();
/* ================= Bluetooth / USB game controllers ================= */
// pairing happens in the phone's or computer's Bluetooth settings; once paired, pressing any button makes the pad visible here.
// The on-screen controller mirrors the real one: sticks move and buttons light up as you press them.
const GP={prev:{},active:null,list:[],t:0};
const GP_BTN={0:'bB',1:'bA',2:'bX',3:'bY',12:'dU',13:'dD',14:'dL',15:'dR',8:'bSel',9:'bStart',4:'bL1',5:'bR1'};
function gpList(){try{return [...(navigator.getGamepads?navigator.getGamepads():[])].filter(Boolean);}catch(e){return [];}}
function gpPress(k,down){const el=$(k);if(el)el.classList.toggle('on',down);if(k==='bStart'){if(down)pressStart();return;}const h=BTN_H[k];if(!h)return;if(down)h[0]&&h[0]();else h[1]&&h[1]();}
function gpKnob(kn,x,y,stickEl){const b=stickEl.getBoundingClientRect(),R=b.width*0.34;kn.style.setProperty('--kx',(x*R).toFixed(1)+'px');kn.style.setProperty('--ky',(y*R).toFixed(1)+'px');stickEl.classList.toggle('active',Math.hypot(x,y)>0.05);}
function updateGamepad(){if(SET.gp===false){GP.active=null;return;}const pads=gpList();GP.list=pads;
  let pad=null;if(SET.gpId)pad=pads.find(p=>p.id===SET.gpId)||null;if(!pad)pad=pads.find(p=>p.buttons.some(b=>b.pressed)||p.axes.some(a=>Math.abs(a)>0.3))||(GP.active&&pads.find(p=>p.index===GP.active.index))||null;
  if(!pad){if(GP.active){GP.active=null;releaseStick();releaseStick2();}return;}
  if(!GP.active||GP.active.id!==pad.id){showMsg('Controller connected',1.2);}GP.active=pad;
  const dz=DZ(),ax=v=>Math.abs(v)<dz?0:(v-Math.sign(v)*dz)/(1-dz);
  if(!GP.base||GP.baseId!==pad.id){GP.base=[...pad.axes];GP.baseId=pad.id;GP.rs=null;}
  let pair=[2,3];const mode=SET.rsAxes||'auto';if(mode!=='auto')pair=mode.split('').map(Number);
  else if(pad.mapping!=='standard'&&pad.axes.length>4){let best=GP.rs||[2,3],bv=0.25;for(const c of[[2,3],[3,4],[2,5],[3,5]]){if(c[1]>=pad.axes.length)continue;const v=Math.abs(pad.axes[c[0]]-GP.base[c[0]])+Math.abs(pad.axes[c[1]]-GP.base[c[1]]);if(GP.base[c[0]]<-0.9||GP.base[c[1]]<-0.9)continue;if(v>bv){bv=v;best=c;}}GP.rs=best;pair=best;}
  const lx=ax(pad.axes[0]||0),ly=ax(pad.axes[1]||0),rx=ax(pad.axes[pair[0]]||0),ry=ax(pad.axes[pair[1]]||0);
  if(stickId===null){stickVec.x=lx;stickVec.y=ly;gpKnob(knob,lx,ly,stick);}
  if(stick2Id===null){stickVec2.x=rx;stickVec2.y=ry;gpKnob(knob2,rx,ry,stick2);}
  for(const i in GP_BTN){const k=GP_BTN[i],on=!!(pad.buttons[i]&&pad.buttons[i].pressed),key=i;if(on!==!!GP.prev[key]){GP.prev[key]=on;gpPress(k,on);}}
  // triggers: right trigger fires, left trigger aims down the sights while held
  const rt=!!(pad.buttons[7]&&pad.buttons[7].value>0.35),lt=!!(pad.buttons[6]&&pad.buttons[6].value>0.35);
  if(rt!==!!GP.prev.rt){GP.prev.rt=rt;gpPress('gR2',rt);}
  if(lt!==!!GP.prev.lt){GP.prev.lt=lt;gpPress('gL2',lt);}}
addEventListener('gamepadconnected',e=>{if(SET.gp!==false)showMsg('Controller connected: '+(e.gamepad.id||'').split('(')[0].trim().slice(0,28),2);if(G.state==='mapping'||G.state==='controls')buildMenu();});
addEventListener('gamepaddisconnected',()=>{showMsg('Controller disconnected',1.5);releaseStick();releaseStick2();if(G.state==='controls')buildMenu();});
function gpName(id){return (id||'').replace(/\(.*?\)/g,'').replace(/Vendor.*$/,'').trim().slice(0,26)||'Controller';}
function updateListener(){if(!AC)return;const L=AC.listener,p=camera.position;camera.getWorldDirection(_b);
  if(L.positionX){L.positionX.value=p.x;L.positionY.value=p.y;L.positionZ.value=p.z;L.forwardX.value=_b.x;L.forwardY.value=_b.y;L.forwardZ.value=_b.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0;}
  else{L.setPosition(p.x,p.y,p.z);L.setOrientation(_b.x,_b.y,_b.z,0,1,0);}}
// ghost cheat makes the hero see-through
let ghostOn=false;function updateGhost(){const on=!!CH.ghost&&G.state==='play';if(on===ghostOn)return;ghostOn=on;hero.root.traverse(o=>{if(!o.isMesh)return;if(on){if(o.userData.gMat)return;o.userData.gMat=o.material;const g=m=>{const c=m.clone();c.transparent=true;c.opacity=0.3;c.depthWrite=false;return c;};o.material=Array.isArray(o.material)?o.material.map(g):g(o.material);}
    else if(o.userData.gMat){o.material=o.userData.gMat;delete o.userData.gMat;}});}
/* ================= rockets ================= */
const ROCKETS=[];
function launchRocket(W){const m=new THREE.Mesh(rocketGeo(ATT.rpg.warhead),gunMat);const src=P.fpv>0.5?vmMuzzle:hero.muzzle;src.getWorldPosition(_a);camera.getWorldDirection(_b);
  const cam=camera.position.clone();const tgt=cam.clone().addScaledVector(_b,120);ray.set(cam,_b.clone());ray.far=120;const hit=ray.intersectObjects(worldMeshes.concat(enemies.filter(e=>!e.dead).map(e=>e.hb)),false)[0];if(hit)tgt.copy(hit.point);ray.far=Infinity;
  const dir=tgt.clone().sub(_a).normalize();m.position.copy(_a).addScaledVector(dir,0.3);m.lookAt(m.position.clone().add(dir));scene.add(m);
  ROCKETS.push({m,v:dir.clone().multiplyScalar(36),t:0,fire:!!W.fireHead});
  const bx=_a.x-dir.x,by=_a.y-dir.y,bz=_a.z-dir.z;for(let i=0;i<10;i++)emit('smoke',bx,by,bz,-dir.x*5+(Math.random()-.5)*2,(Math.random()-.2)*1.5,-dir.z*5+(Math.random()-.5)*2,1.6,0.5,1.4);
  spark(_a.clone(),0xffc060,0.8);G.shake=Math.max(G.shake,0.18);P.rcP=(P.rcP||0)+0.05;P.rcY=(P.rcY||0)+(Math.random()-.5)*0.01;P.rcT=0.25;alertNoise(P.x,P.z,40);}
function updateRockets(dt){for(let i=ROCKETS.length-1;i>=0;i--){const r=ROCKETS[i];r.t+=dt;const p=r.m.position,prev=p.clone();r.v.y-=1.6*dt;p.addScaledVector(r.v,dt);r.m.lookAt(p.clone().add(r.v));
    emit('smoke',prev.x,prev.y,prev.z,(Math.random()-.5)*0.4,0.3+Math.random()*0.3,(Math.random()-.5)*0.4,2.2,0.32,0.9);if(Math.random()<0.6)spark(prev.clone(),0xffb050,0.25,false);
    let boom=false;const seg=p.clone().sub(prev),L=seg.length();ray.set(prev,seg.normalize());ray.far=L+0.1;const h=ray.intersectObjects(worldMeshes,false)[0];ray.far=Infinity;if(h){p.copy(h.point);boom=true;}
    if(!boom&&p.y<=groundAt(p.x,p.z,p.y+1)+0.05)boom=true;
    if(!boom)for(const e of enemies){if(!e.dead&&Math.hypot(e.x-p.x,e.z-p.z)<0.7&&p.y>e.y&&p.y<e.y+1.9){boom=true;break;}}
    if(!boom)for(const c of CARLIST){if(c.state<3&&Math.abs(p.x-c.x)<1.2&&Math.abs(p.z-c.z)<2.3&&p.y<1.6){boom=true;break;}}
    if(!boom&&r.t>4)boom=true;
    if(boom){scene.remove(r.m);r.m.geometry.dispose();ROCKETS.splice(i,1);explode(p.x,Math.max(0,p.y-0.2),p.z,{fire:r.fire});}}}
/* ================= gun showcase for the mods screen ================= */
const STAGE=new THREE.Group();STAGE.visible=false;camera.add(STAGE);let stageGun=null,stageK=null;
const STAGE_FIT={rifle:[0.22,1.75],shotgun:[0.12,1.5],magnum:[0.06,0.62],rpg:[-0.15,1.6]};
function buildStage(k){if(stageGun){STAGE.remove(stageGun);stageGun=null;}stageK=k;STAGE.visible=!!k;if(!k)return;
  const piv=new THREE.Group(),g=new THREE.Group();fillGunGroup(g,k,GUN_GEO[k]);g.position.z=STAGE_FIT[k][0];piv.add(g);piv.userData.gun=g;stageGun=piv;STAGE.add(piv);updateStage();}
function updateStage(){if(!stageGun)return;const f=STAGE_FIT[stageK],len=f[1]*0.78,port=innerHeight>innerWidth;
  const th=Math.tan(camera.fov*Math.PI/360),asp=camera.aspect||1;const pad=$('pad'),ov=document.body.classList.contains('overlay');const padF=ov&&pad?pad.offsetHeight/innerHeight:0;
  const spin=performance.now()*0.0006;stageGun.rotation.order='YXZ';
  if(port){// upright in the column to the right of the menu, above the controller
    const d=len/(2*th*(1-padF)*0.9);const vh=2*d*th,vw=vh*asp;stageGun.position.set(vw*0.29,vh*(0.5-(1-padF)/2),-d);stageGun.rotation.set(Math.PI/2,Math.PI/2+Math.sin(spin)*0.5,0);}
  else{const d=len/(2*th*asp*0.5);const vh=2*d*th,vw=vh*asp;stageGun.position.set(vw*0.2,vh*(padF/2),-d);stageGun.rotation.set(0.1,-Math.PI/2+Math.sin(spin)*0.35,0);}
  const g=stageGun.userData.gun;if(g.userData.forend)g.userData.forend.visible=true;}
/* ================= character outfits ================= */
const OUTFIT_DEFAULT={body:'operator',shirt:'charcoal',pants:'charcoal',shoes:'dress',hair:'slick',glasses:'on',beard:'trim'};
const OUTFIT=(()=>{try{return Object.assign({},OUTFIT_DEFAULT,JSON.parse(localStorage.getItem('sb-outfit2')||'{}'));}catch(e){return Object.assign({},OUTFIT_DEFAULT);}})();
function saveOutfit(){try{localStorage.setItem('sb-outfit2',JSON.stringify(OUTFIT));}catch(e){}}
const HAZMAT={body:'hazmat',shirt:'hazmat',pants:'hazmat',shoes:'boots',hair:'short',glasses:'on',beard:'none'};
ATT_OPTS.char=[['body','Character',[['jessa','Jessa (squad leader)','Former site foreman. Coveralls, harness, pipe wrench'],['operator','Operator in black','You in helmet, plate carrier, gloves and pack'],['veteran','Scarred veteran','Gray hair, scars, olive plate carrier'],['survivor','Street survivor','Hoodie, chest rig, quick and light'],['you','You (BombaRules)','Your hero in a suit'],['hazmat','Hazmat engineer','Rogue engineer from Dead Zone']]],
  ['shirt','Jacket',[['charcoal','Charcoal suit','Pinstripe jacket'],['leather','Black leather','Leather jacket'],['navy','Navy','Navy jacket'],['olive','Olive field','Field jacket'],['hazmat','Hazmat yellow','Protective suit']]],
  ['pants','Pants',[['charcoal','Charcoal','Suit trousers'],['jeans','Blue jeans','Denim'],['black','Black','Black pants'],['khaki','Khaki','Cargo khaki'],['hazmat','Hazmat yellow','Protective suit']]],
  ['shoes','Shoes',[['dress','Black dress','Polished shoes'],['boots','Work boots','Brown boots'],['sneakers','White sneakers','Sneakers']]],
  ['hair','Hair',[['slick','Slicked back','Combed back, glossy'],['short','Short','Short and messy'],['bald','Shaved','No hair']]],
  ['glasses','Glasses',[['on','Sunglasses','Dark shades'],['off','None','No glasses']]],
  ['beard','Beard',[['trim','Trimmed','Chin length'],['full','Full','Long and full'],['none','None','Clean shaven']]]];
const OF_COL={shirt:{charcoal:[0.17,0.17,0.19],leather:[0.08,0.07,0.07],navy:[0.1,0.13,0.22],olive:[0.27,0.29,0.17],hazmat:[0.78,0.66,0.12]},
  pants:{charcoal:[0.16,0.16,0.18],jeans:[0.16,0.22,0.36],black:[0.05,0.05,0.06],khaki:[0.55,0.48,0.33],hazmat:[0.74,0.62,0.11]},shoes:{dress:[0.025,0.025,0.03],boots:[0.25,0.15,0.08],sneakers:[0.85,0.85,0.83]}};
function applyOutfit(o0){const B=o0.body,op=B==='operator',vet=B==='veteran',sv=B==='survivor',js=B==='jessa',fem=B==='hazmat'||js;const o=(vet||sv||js)?Object.assign({},o0,{beard:'none',glasses:'off',hair:'short'}):o0;
  const look=Object.assign({},HERO_LOOK,{female:fem,skin:fem?[0.8,0.64,0.54]:HERO_LOOK.skin,hair:fem?[0.12,0.09,0.07]:HERO_LOOK.hair,slick:o.hair==='slick',beard:true,glasses:true,beardLen:o.beard==='full'?1:0.5,
    pin:o.shirt==='charcoal'&&!op,shirt:op?{kind:'tee',base:[0.065,0.065,0.07]}:{kind:'jacket',suit:o.shirt==='charcoal',base:OF_COL.shirt[o.shirt],tee:[0.04,0.04,0.05]},pants:op?[0.06,0.06,0.065]:OF_COL.pants[o.pants],shoes:op?[0.035,0.035,0.035]:OF_COL.shoes[o.shoes],sleeves:'long',gloves:op?[0.05,0.05,0.055]:null});
  if(vet)Object.assign(look,{skin:[0.74,0.56,0.46],hair:[0.32,0.3,0.28],gray:0.7,age:0.8,stubble:1,seed:7,iris:[0.3,0.36,0.42],smile:false,pin:false,shirt:{kind:'tee',base:[0.2,0.23,0.15]},pants:[0.19,0.21,0.14],shoes:[0.08,0.07,0.06],gloves:[0.1,0.11,0.08]});
  if(B==='hazmat')Object.assign(look,{gloves:[0.04,0.04,0.045],shoes:[0.04,0.04,0.045]});
  if(js)Object.assign(look,{skin:[0.78,0.6,0.5],hair:[0.2,0.15,0.11],gray:0.15,age:0.6,stubble:0,seed:31,iris:[0.32,0.38,0.42],smile:false,pin:false,shirt:{kind:'tee',base:[0.26,0.28,0.16]},pants:[0.25,0.27,0.15],shoes:[0.11,0.09,0.07],gloves:[0.09,0.09,0.08]});
  if(sv)Object.assign(look,{skin:[0.82,0.66,0.55],hair:[0.07,0.055,0.045],gray:0,age:0,stubble:0,seed:11,iris:[0.22,0.15,0.1],pin:false,shirt:{kind:'tee',base:[0.3,0.31,0.27]},pants:[0.18,0.19,0.15],shoes:[0.12,0.11,0.1],gloves:[0.12,0.13,0.1]});
  let tmp;try{tmp=buildHuman(buildBodyGeos(look),heroMat.clone());}catch(e){console.warn(e);return;}
  const src=[];tmp.root.traverse(m=>{if(m.isMesh)src.push(m);});const dst=hero.baseMeshes;
  if(src.length===dst.length)for(let i=0;i<src.length;i++){if(dst[i].geometry!==src[i].geometry)dst[i].geometry=src[i].geometry;}
  for(const m of dst)if(m.material&&m.material.alphaMap===hairTex)m.visible=o.hair!=='bald'&&!op&&B!=='hazmat';
  hero.face.body.parent.children.forEach(m=>{if(m.material===lensMat)m.visible=o.glasses==='on';});
  if(hero.tacSets)for(const k in hero.tacSets)for(const m of hero.tacSets[k])m.visible=k===B;
  if(typeof vmSleeves!=='undefined'){if(!vmSleeves.R.userData.own){const sm=vmMat.clone();for(const s of['R','L']){vmSleeves[s].material=sm;vmSleeves[s].userData.own=1;}}
    const SC=B==='hazmat'?[4.4,3.7,0.68]:js?[1.53,1.65,0.94]:op?[0.4,0.4,0.4]:vet?[1.18,1.35,0.88]:sv?[1.76,1.82,1.59]:[1,1,1],GC=B==='hazmat'?[0.06,0.08,0.11]:js?[0.125,0.17,0.2]:op?[0.075,0.1,0.14]:vet?[0.14,0.21,0.2]:sv?[0.17,0.25,0.25]:[1,1,1];vmSleeves.R.material.color.setRGB(...SC);vmMat.color.setRGB(...GC);}
  const jm=hero.face.jawMeshes||[];const beardM=jm[0],gearM=jm[1];if(beardM)beardM.visible=o.beard!=='none';
  if(gearM){if(o.beard==='none'&&o.glasses==='on'){gearM.geometry=addJawMorph(buildGear(Object.assign({},look,{beard:false,glasses:true})));gearM.visible=true;}
    else if(o.beard!=='none'&&o.glasses==='off'){gearM.geometry=addJawMorph(buildGear(Object.assign({},look,{beard:true,glasses:false})));gearM.visible=true;}
    else gearM.visible=o.beard!=='none'||o.glasses==='on';}}
/* ================= Dead Zone: water splashes, traps, toxic gas, mutation ================= */
function MUT(){return DEADZONE&&G.state==='play'?Math.min(0.7,(G.wave-1)*0.15+(G.roundT||0)/200):0;}
function splash(x,z,k){for(let i=0;i<5;i++)emit('glass',x+(Math.random()-.5)*0.4,0.15,z+(Math.random()-.5)*0.4,(Math.random()-.5)*1.6,1+Math.random()*1.5,(Math.random()-.5)*1.6,0.45,0.035,-1);
  const d=Math.hypot(x-P.x,z-P.z);if(d<16)noise(0.12,1400,500,0.07*k*(1-d/16),'bandpass');}
const TRAPS=[];const mineGeo=mergeParts([P_(new THREE.CylinderGeometry(0.2,0.24,0.08,16),M(0,0.04,0),[0.86,0.7,0.08]),P_(new THREE.CylinderGeometry(0.21,0.21,0.015,16),M(0,0.06,0),[0.08,0.08,0.08]),P_(new THREE.CylinderGeometry(0.06,0.06,0.03,10),M(0,0.095,0),[0.1,0.1,0.1])]);
const snareGeo=mergeParts([P_(new THREE.BoxGeometry(0.7,0.06,0.7),M(0,0.03,0),[0.18,0.18,0.18]),P_(new THREE.CylinderGeometry(0.05,0.05,0.4,8),M(-0.3,0.2,-0.3),[0.7,0.6,0.2]),P_(new THREE.CylinderGeometry(0.05,0.05,0.4,8),M(0.3,0.2,0.3),[0.7,0.6,0.2]),P_(new THREE.TorusGeometry(0.22,0.02,6,16),M(0,0.08,0,Math.PI/2,0,0),[0.85,0.75,0.2])]);
const blinkMat=new THREE.MeshBasicMaterial({color:0xff2a1a});
function placeTrap(){if(G.state!=='play'||P.car||P.climb||P.dying)return;const t=P.trapType||'mine';if(!P.traps||!(P.traps[t]>0)){showMsg('No '+(t==='mine'?'mines':'snares')+' left',1);return;}
  P.traps[t]--;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);const x=P.x+fx*1.2,z=P.z+fz*1.2;const m=new THREE.Mesh(t==='mine'?mineGeo:snareGeo,vc);m.position.set(x,P.y+(DEADZONE?0.1:0),z);m.castShadow=true;scene.add(m);
  const led=new THREE.Mesh(new THREE.SphereGeometry(0.035,8,6),blinkMat.clone());led.position.y=t==='mine'?0.12:0.42;m.add(led);
  TRAPS.push({type:t,x,z,m,led,t:t==='mine'?999:22,arm:0.8});tone(900,1300,0.06,0.1,'square');drawHud();}
function switchTrap(){P.trapType=P.trapType==='snare'?'mine':'snare';showMsg(P.trapType==='mine'?'Proximity mine':'Shock snare',0.8);tone(700,900,0.04,0.07,'square');drawHud();}
function removeTrap(t){scene.remove(t.m);const i=TRAPS.indexOf(t);if(i>=0)TRAPS.splice(i,1);}
function updateTraps(dt){for(const t of TRAPS.slice()){t.t-=dt;t.arm-=dt;t.led.material.color.setHex((performance.now()/(t.arm>0?120:400)|0)%2?0xff2a1a:0x330805);
    if(t.t<=0){removeTrap(t);continue;}if(t.arm>0)continue;
    if(t.type==='mine'){if(enemies.some(e=>!e.dead&&e.y<0.5&&Math.hypot(e.x-t.x,e.z-t.z)<1.5)){removeTrap(t);explode(t.x,0.25,t.z,{fire:false});}}
    else for(const e of enemies){if(e.dead||Math.hypot(e.x-t.x,e.z-t.z)>2.3)continue;e.snared=0.4;damageEnemy(e,dt*0.7,false,new THREE.Vector3(0,0,1),true);if(Math.random()<dt*6)spark(new THREE.Vector3(e.x,0.6+Math.random(),e.z),0x9ad8ff,0.3);}}}
const GAS=[];
function gasCloud(x,z){const sp=[];for(let i=0;i<9;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x7fd23a,transparent:true,opacity:0.0,depthWrite:false}));s.position.set(x+(Math.random()-.5)*3,0.6+Math.random()*1.2,z+(Math.random()-.5)*3);s.scale.setScalar(2.4+Math.random()*1.6);scene.add(s);sp.push(s);}
  GAS.push({x,z,t:10,sp});noise(1.2,600,200,0.25,'lowpass');noise(0.3,2600,900,0.12,'bandpass');}
function updateGas(dt){for(const g of GAS.slice()){g.t-=dt;const a=Math.min(1,(10-g.t)*2,g.t/1.5);for(const s of g.sp){s.material.opacity=0.38*Math.max(0,a);s.position.y+=dt*0.05;}
    if(g.t<=0){g.sp.forEach(s=>scene.remove(s));GAS.splice(GAS.indexOf(g),1);continue;}
    for(const e of enemies){if(e.dead||Math.hypot(e.x-g.x,e.z-g.z)>3.4)continue;damageEnemy(e,dt*1.4,false,new THREE.Vector3(0,0,1),true);e.snared=Math.max(e.snared||0,0.2);}}}
function btnFor(act){const k=Object.keys(BMAP).find(k=>BMAP[k]===act);return k?BTN_NAMES[k]:'';}
/* ================= loop ================= */
buildNav();initFood();applyAttachments();equip('rifle');
{const kk=document.getElementById('kicker');if(kk&&DEADZONE)kk.textContent='DEAD ZONE';}if(DEADZONE)applyOutfit(HAZMAT);else applyOutfit(OUTFIT);
let last=performance.now();
let lastDraw=0;
function loop(t){requestAnimationFrame(loop);if(SET.fps&&t-lastDraw<1000/SET.fps-2)return;lastDraw=t;const dt0=Math.min(0.05,(t-last)/1000);last=t;if(G.killcam){G.killcam.t+=dt0;if(G.killcam.t>1.9)G.killcam=null;}const dt=G.killcam?dt0*0.22:dt0;G.time+=dt;
  updateGamepad();updateListener();if(MENU_STATES.includes(G.state))updateMenuInput(dt);if(G.state==='loadout')updateLoadoutInput(dt);
  if(G.state==='alley'||G.state==='alleypaused'||G.state==='alleyover'){if(G.state==='alley')updateAlley(dt);if(msgTimer>0){msgTimer-=dt;if(msgTimer<=0)hud.msg.classList.remove('on');}RS.scene=AL.scene;RS.cam=AL.cam;renderFrame();return;}
  RS.scene=scene;RS.cam=camera;
  if(G.state==='play')update(dt);else{P.vel=damp(P.vel,0,8,dt);P.sv=0;P.runAmt=damp(P.runAmt,0,6,dt);P.aimAmt=damp(P.aimAmt,G.state==='title'?0.0:0,6,dt);P.turn=0;}
  if(G.state!=='paused'){animateHero(dt);if(G.state!=='play')enemies.forEach(e=>{if(!e.dead)animateZombie(e,dt,false);});}
  updateCamera(dt);updateFx(dt);updateDust(dt);updateParts(dt);updateFires(dt);updateBarrels(dt);updateMuzzle(dt);updateCars(dt);updateLights(dt);updateWeather(dt0);updatePark(dt);if(G.state==='play'){updateTraps(dt);updateGas(dt);}updateSpitters(dt);haleTick(dt);updateRockets(dt);updateGhost();updateMusic();syncGripHand();G.boomCD=(G.boomCD||0)-dt;
  sun.position.set(P.x+SUN_DIR.x*60,P.y+SUN_DIR.y*60,P.z+SUN_DIR.z*60);sun.target.position.set(P.x,P.y,P.z);sun.target.updateMatrixWorld();
  sky.position.copy(camera.position);clouds.position.set(camera.position.x,25,camera.position.z);clouds.rotation.y+=dt*0.004;sunGlow.position.copy(camera.position).addScaledVector(SUN_DIR,100);
  if(Q.reflect&&(!Q.reflLow||(G.rf=!G.rf)))renderReflection();renderer.shadowMap.needsUpdate=true;renderFrame();perfCheck(dt);}
drawHud();applySet();applyWeather();setState('title');requestAnimationFrame(loop);
{const minT=(innerWidth<900?4000:3000),ld=document.getElementById('loader');if(ld){const bar=ld.querySelector('.lbar i');if(bar)bar.style.animationDuration=(minT/1000)+'s';}
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const wait=Math.max(0,minT-performance.now());setTimeout(()=>{if(ld){ld.classList.add('done');setTimeout(()=>ld.remove(),700);}},wait);}));}
addEventListener('pointerdown',()=>{if(AC){startRainAudio();startMusic();}});

/* ================= controls ================= */
const stick=$('stick'),knob=$('knob');let stickId=null;
function stickRead(e){
  const b=stick.getBoundingClientRect(),R=b.width*0.34;
  let dx=e.clientX-(b.left+b.width/2),dy=e.clientY-(b.top+b.height/2);
  const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d;}
  knob.style.setProperty('--kx',dx.toFixed(1)+'px');knob.style.setProperty('--ky',dy.toFixed(1)+'px');
  let x=dx/R,y=dy/R;const m=Math.hypot(x,y),dz=DZ();
  if(m<dz){x=0;y=0;}else{const k=(m-dz)/((1-dz)*m);x*=k;y*=k;}
  stickVec.x=x;stickVec.y=y;
}
const stick2=$('stick2'),knob2=$('knob2');let stick2Id=null;
function stick2Read(e){const b=stick2.getBoundingClientRect(),R=b.width*0.34;let dx=e.clientX-(b.left+b.width/2),dy=e.clientY-(b.top+b.height/2);const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d;}
  knob2.style.setProperty('--kx',dx.toFixed(1)+'px');knob2.style.setProperty('--ky',dy.toFixed(1)+'px');let x=dx/R,y=dy/R;const m=Math.hypot(x,y),dz=DZ();if(m<dz){x=0;y=0;}else{const k=(m-dz)/((1-dz)*m);x*=k;y*=k;}stickVec2.x=x;stickVec2.y=y;}
function releaseStick2(){stick2Id=null;stickVec2.x=0;stickVec2.y=0;stick2.classList.remove('active');knob2.style.setProperty('--kx','0px');knob2.style.setProperty('--ky','0px');}
stick2.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();stick2Id=e.pointerId;stick2.classList.add('active');try{stick2.setPointerCapture(e.pointerId);}catch(_){}stick2Read(e);});
stick2.addEventListener('pointermove',e=>{if(e.pointerId===stick2Id)stick2Read(e);});
const stick2End=e=>{if(e.pointerId===stick2Id)releaseStick2();};stick2.addEventListener('pointerup',stick2End);stick2.addEventListener('pointercancel',stick2End);stick2.addEventListener('lostpointercapture',stick2End);
function DZ(){return [0.06,0.1,0.15,0.21,0.28][(SET.drift||3)-1];}function SENS(k){return [0.55,0.75,1,1.3,1.65][(SET[k]||3)-1];}
// a finger lifted anywhere (even off the stick) always lets the stick go
addEventListener('pointerup',e=>{if(e.pointerId===stickId)releaseStick();if(e.pointerId===stick2Id)releaseStick2();},true);addEventListener('pointercancel',e=>{if(e.pointerId===stickId)releaseStick();if(e.pointerId===stick2Id)releaseStick2();},true);
addEventListener('blur',()=>{releaseStick();releaseStick2();});
function releaseStick(){stickId=null;stickVec.x=0;stickVec.y=0;stick.classList.remove('active');
  knob.style.setProperty('--kx','0px');knob.style.setProperty('--ky','0px');}
stick.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();stickId=e.pointerId;stick.classList.add('active');
  try{stick.setPointerCapture(e.pointerId);}catch(_){}stickRead(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===stickId)stickRead(e);});
const stickEnd=e=>{if(e.pointerId===stickId)releaseStick();};
stick.addEventListener('pointerup',stickEnd);stick.addEventListener('pointercancel',stickEnd);stick.addEventListener('lostpointercapture',stickEnd);

let lookId=null,lkx=0,lky=0;const cvEl=renderer.domElement;cvEl.style.touchAction='none';
cvEl.addEventListener('pointerdown',e=>{if(G.state==='alley'){initAudio();const b=cvEl.getBoundingClientRect();AL.cx=((e.clientX-b.left)/b.width)*2-1;AL.cy=-(((e.clientY-b.top)/b.height)*2-1);alleyShoot(AL.cx,AL.cy);return;}lookId=e.pointerId;lkx=e.clientX;lky=e.clientY;try{cvEl.setPointerCapture(e.pointerId);}catch(_){}});
cvEl.addEventListener('pointermove',e=>{if(e.pointerId!==lookId)return;const dx=e.clientX-lkx,dy=e.clientY-lky;lkx=e.clientX;lky=e.clientY;
  if(G.state!=='play'||P.climb)return;const fine=P.fpv>0.5?0.6:1;P.pendYaw=(P.pendYaw||0)+dx*0.0055*fine*SENS('sensX');P.pendPitch=(P.pendPitch||0)+(SET.invertY?-1:1)*dy*0.0045*fine*SENS('sensY');});
const lookEnd=e=>{if(e.pointerId===lookId)lookId=null;};cvEl.addEventListener('pointerup',lookEnd);cvEl.addEventListener('pointercancel',lookEnd);
addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyC')heroCrouch();if(e.code==='KeyV')heroJump();if(e.code==='KeyQ')throwNade();if(e.code==='KeyF')toggleLight();if(e.code==='KeyE'&&G.state==='play'){if(P.car)exitCar();else{const c=nearDrivable();if(c)enterCar(c);}}});
addEventListener('keydown',e=>{if(e.code==='KeyT')P.pitch=clamp(P.pitch+0.08,-0.85,0.6);if(e.code==='KeyG')P.pitch=clamp(P.pitch-0.08,-0.85,0.6);});
function bindBtnH(k,down,up){BTN_H[k]=[down,up];if($(k))bindBtn($(k),down,up);}
function bindBtn(el,down,up){
  let id=null;
  el.addEventListener('pointerdown',e=>{e.preventDefault();id=e.pointerId;try{el.setPointerCapture(e.pointerId);}catch(_){}el.classList.add('on');down&&down();});
  const end=e=>{if(e.pointerId!==id)return;id=null;el.classList.remove('on');up&&up();};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end);
  el.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();el.classList.add('on');down&&down();}});
  el.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){el.classList.remove('on');up&&up();}});
}
bindBtn($('bStart'),pressStart);
// game actions; menus keep fixed buttons, gameplay uses the player's own mapping
const ACTIONS={trap:'Place trap',traptype:'Switch trap',jump:'Jump',crouch:'Crouch / slide / prone',shoot:'Shoot',reload:'Reload',grenade:'Grenade',use:'Drive / use',aim:'Aim (toggle)',light:'Flashlight',shoulder:'Swap shoulder',prev:'Prev weapon',next:'Next weapon',none:'Nothing'};
const BTN_NAMES={bB:'B',bA:'A',bX:'X',bY:'Y',dU:'D-pad up',dD:'D-pad down',dL:'D-pad left',dR:'D-pad right',bSel:'View button',bL1:'L1 bumper',bR1:'R1 bumper',gL2:'L2 trigger',gR2:'R2 trigger'};
const MAP_DEFAULT={bB:'shoot',bA:'reload',bX:'grenade',bY:'use',dU:'light',dD:'crouch',dL:'aim',dR:'next',bSel:'shoulder',bL1:'trap',bR1:'traptype',gL2:'aim',gR2:'shoot'};
const BMAP=(()=>{try{return Object.assign({},MAP_DEFAULT,JSON.parse(localStorage.getItem('sb-bmap')||'{}'));}catch(e){return Object.assign({},MAP_DEFAULT);}})();
function saveBmap(){try{localStorage.setItem('sb-bmap',JSON.stringify(BMAP));}catch(e){}refreshMapLabels();}
const ACT_SHORT={trap:'Trap',traptype:'Trap type',jump:'Jump',crouch:'Crouch',shoot:'Shoot',reload:'Reload',grenade:'Grenade',use:'Use',aim:'Aim',light:'Light',shoulder:'Shoulder',prev:'Prev',next:'Next',none:'\u2014'};
function refreshMapLabels(){for(const k in BMAP){const el=$(k);if(el)el.setAttribute('data-map',ACT_SHORT[BMAP[k]]||'');}}
function doAction(act,down,hold){if(P.tank&&down&&(act==='traptype'||act==='next'||act==='prev'||act==='grenade'||act==='reload')){switchTankGun();return;}if(P.tank&&act==='shoot'){input.fire=down;return;}if(P.tank&&act!=='use')return;if(act==='shoot'){input.fire=down;return;}if(act==='aim'&&hold){P.adsHold=down;return;}if(!down)return;
  if(act==='trap'){placeTrap();return;}if(act==='traptype'){switchTrap();return;}
  if(act==='reload')pressReload();else if(act==='grenade')throwNade();else if(act==='use'){if(P.tank)exitTank();else if(HORDE&&nearTank())enterTank();else if(P.car)exitCar();else{const c=nearDrivable();if(c)enterCar(c);else heroJump();}}
  else if(act==='jump')heroJump();else if(act==='crouch')heroCrouch();
  else if(act==='aim'){P.adsHold=!P.adsHold;tone(P.adsHold?900:700,P.adsHold?1100:600,0.03,0.08,'square');}else if(act==='light')toggleLight();else if(act==='shoulder')pressSelect();else if(act==='prev')cycleWeapon(-1);else if(act==='next')cycleWeapon(1);}
const MENU_BTN={bL1:()=>menuMove(-1),bR1:()=>menuMove(1),gL2:()=>{},gR2:()=>menuActivate(),bB:()=>menuActivate(),bA:()=>menuActivate(),bX:()=>menuMove(-1),bY:()=>{if(G.state==='title')toggleLoadout();else menuActivate();},dU:()=>menuMove(-1),dD:()=>menuMove(1),dL:()=>{},dR:()=>{},bSel:()=>{}};
const BTN_H={};for(const k in BMAP){BTN_H[k]=[];bindBtnH(k,()=>{initAudio();if(G.state==='loadout'){if(k==='bA')loActivate();else if(k==='bY')toggleLoadout();return;}
    if(MENU_STATES.includes(G.state)){MENU_BTN[k]();return;}if(G.state==='alley'){if(BMAP[k]==='shoot')alleyShoot(AL.cx,AL.cy);return;}if(G.state==='play')doAction(BMAP[k],true,k[0]==='g');},
  ()=>{if(BMAP[k]==='shoot')input.fire=false;if(BMAP[k]==='aim'&&k[0]==='g')P.adsHold=false;});}
refreshMapLabels();
$('alPause').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();if(G.state==='alley')setState('alleypaused');});
$('fsBtn').addEventListener('click',e=>{e.stopPropagation();toggleFull();});

const keyMap={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='BUTTON'&&(e.key===' '||e.key==='Enter'))return;
  if(keyMap[e.code]){input[keyMap[e.code]]=true;e.preventDefault();}
  else if((e.code==='Space'||e.code==='KeyK')&&!e.repeat){initAudio();e.preventDefault();if(MENU_STATES.includes(G.state))menuActivate();else if(G.state==='alley')alleyShoot(AL.cx,AL.cy);else input.fire=true;}
  else if((e.code==='KeyR'||e.code==='KeyJ')&&!e.repeat)pressReload();
  else if(e.code==='Enter'&&!e.repeat)pressStart();
  else if((e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='Tab')&&!e.repeat){e.preventDefault();pressSelect();}
});
addEventListener('keyup',e=>{if(keyMap[e.code])input[keyMap[e.code]]=false;else if(e.code==='Space'||e.code==='KeyK')input.fire=false;});

document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(G.state==='play'||G.state==='alley')){setState(G.state==='play'?'paused':'alleypaused');input.fire=false;releaseStick();}});
})();
