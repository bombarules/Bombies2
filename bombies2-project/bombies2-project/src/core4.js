/* ================= audio ================= */
let AC=null,noiseBuf=null,SFXB=null,MUSB=null,MASTERB=null,OUTB=null;
// surround: sound placed around the listener with head-related filtering, so it comes from in front, behind, left, right
function atPos(x,y,z,fn){if(!AC||SET.surround===false||!SFXB)return fn();const pn=AC.createPanner();pn.panningModel='HRTF';pn.distanceModel='linear';pn.refDistance=1;pn.maxDistance=10000;pn.rolloffFactor=0;
  if(pn.positionX){pn.positionX.value=x;pn.positionY.value=y;pn.positionZ.value=z;}else pn.setPosition(x,y,z);pn.connect(SFXB);OUTB=pn;try{return fn();}finally{OUTB=null;}}
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();MASTERB=AC.createGain();MASTERB.connect(AC.destination);SFXB=AC.createGain();SFXB.connect(MASTERB);MUSB=AC.createGain();MUSB.connect(MASTERB);applyVolumes();
    noiseBuf=AC.createBuffer(1,AC.sampleRate*0.5,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}catch(e){AC=null;}
}
function noise(dur,f0,f1,vol,type,delay){if(!AC)return;const t=AC.currentTime+(delay||0);const n=AC.createBufferSource();n.buffer=noiseBuf;
  const f=AC.createBiquadFilter();f.type=type||'lowpass';f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);
  const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  n.connect(f);f.connect(g);g.connect(OUTB||SFXB);n.start(t);n.stop(t+dur+0.02);}
function tone(f0,f1,dur,vol,type,delay){if(!AC)return;const t=AC.currentTime+(delay||0);const o=AC.createOscillator();o.type=type||'sine';
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=AC.createGain();
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(OUTB||SFXB);o.start(t);o.stop(t+dur+0.02);}
function groan(vol){const d=0.7+Math.random()*0.6;if(!AC||vol<0.01)return d;const t=AC.currentTime;const o=AC.createOscillator();o.type='sawtooth';const f0=70+Math.random()*50;
  o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f0*(0.75+Math.random()*0.2),t+d);
  const lfo=AC.createOscillator();lfo.frequency.value=5+Math.random()*4;const lg=AC.createGain();lg.gain.value=6;lfo.connect(lg);lg.connect(o.frequency);
  const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(500+Math.random()*300,t);f.frequency.linearRampToValueAtTime(350,t+d);
  const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.22*vol,t+0.15);g.gain.exponentialRampToValueAtTime(0.001,t+d);
  o.connect(f);f.connect(g);g.connect(OUTB||SFXB);o.start(t);lfo.start(t);o.stop(t+d+0.05);lfo.stop(t+d+0.05);return d;}
const sfx={
  rifle(){noise(0.12,3200,240,0.42);tone(150,45,0.12,0.4,'sine');noise(0.06,4500,1200,0.2,'highpass');noise(0.25,1500,150,0.09,'lowpass',0.09);noise(0.3,1200,120,0.05,'lowpass',0.2);},
  shotgun(){noise(0.32,2400,110,0.6);tone(110,32,0.26,0.55,'sine');noise(0.4,1200,100,0.12,'lowpass',0.11);noise(0.45,900,90,0.07,'lowpass',0.25);noise(0.05,1800,900,0.2,'bandpass',0.38);noise(0.05,1500,700,0.2,'bandpass',0.5);},
  magnum(){noise(0.24,4200,190,0.6);tone(190,38,0.2,0.55,'sine');noise(0.35,1600,140,0.12,'lowpass',0.1);noise(0.4,1100,110,0.06,'lowpass',0.23);},
  empty(){tone(1900,1300,0.025,0.15,'square');},
  reload(t){tone(900,600,0.035,0.16,'square');tone(500,300,0.05,0.2,'square',t*0.45);tone(1300,900,0.05,0.2,'square',t*0.85);},
  hit(){noise(0.05,900,300,0.15);},
  head(){noise(0.08,1600,400,0.25);tone(900,1200,0.05,0.1,'triangle');},
  thud(){tone(90,40,0.25,0.35,'sine');noise(0.15,500,100,0.2);},
  hurt(){tone(130,60,0.22,0.4,'sine');noise(0.1,700,150,0.2);},
  step(){noise(0.04,600,150,0.06);},
  inhale(){noise(0.5,900,300,0.07,'bandpass');},exhale(){noise(0.7,700,200,0.08,'bandpass');},
  rpg(){noise(0.35,1400,200,0.7);tone(90,35,0.35,0.6,'sine');noise(1.4,3200,700,0.32,'bandpass',0.04);noise(0.9,600,150,0.25,'lowpass',0.1);},
  pin(){tone(1800,1500,0.05,0.12,'square');tone(900,700,0.05,0.1,'square',0.08);},
  thunder(d){noise(3.2,400,35,0.55,'lowpass',d);tone(55,30,2.5,0.3,'sine',d);noise(1.2,1200,200,0.25,'lowpass',d);},
  crunch(){noise(0.35,1600,150,0.45);tone(90,40,0.25,0.4,'sine');},
  pickup(){[440,660,880].forEach((f,i)=>tone(f,f,0.08,0.12,'triangle',i*0.06));},
  scream(){if(!AC)return;const t=AC.currentTime,d=0.8+Math.random()*0.4;const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(480+Math.random()*120,t);o.frequency.exponentialRampToValueAtTime(280,t+d);
    const lfo=AC.createOscillator();lfo.frequency.value=9;const lg=AC.createGain();lg.gain.value=25;lfo.connect(lg);lg.connect(o.frequency);const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1100;f.Q.value=2;
    const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.2,t+0.06);g.gain.exponentialRampToValueAtTime(0.001,t+d);o.connect(f);f.connect(g);g.connect(OUTB||SFXB);o.start(t);lfo.start(t);o.stop(t+d+0.05);lfo.stop(t+d+0.05);noise(d*0.8,2500,900,0.08,'bandpass');},
  wave(){tone(98,98,0.6,0.25,'sawtooth');tone(92,92,0.6,0.2,'sawtooth',0.05);}
};
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}};

/* ================= facial animation (blinks, saccades, brows, mouth) ================= */
function faceState(){return {blinkT:1+Math.random()*3,blink:0,dir:0,dbl:false,lid:0.45,brow:0,furrow:0,mouth:0,gx:0,gy:0,tgx:0,tgy:0,saccT:Math.random()};}
function animateFace(face,st,dt,o){
  st.blinkT-=dt;if(st.blinkT<=0&&st.dir===0){st.dir=1;st.blinkT=o.blinkMin+Math.random()*o.blinkVar;st.dbl=Math.random()<0.15;}
  if(st.dir===1){st.blink+=dt/0.07;if(st.blink>=1){st.blink=1;st.dir=-1;}}else if(st.dir===-1){st.blink-=dt/0.12;if(st.blink<=0){st.blink=0;st.dir=0;if(st.dbl){st.dbl=false;st.blinkT=0.1;}}}
  st.lid=damp(st.lid,o.lid,10,dt);const la=lerp(st.lid,-0.42,st.blink);for(const l of face.lids)l.rotation.x=la;
  st.saccT-=dt;if(st.saccT<=0){st.saccT=0.35+Math.random()*1.9;st.tgx=o.gazeYaw+(Math.random()-.5)*0.22;st.tgy=o.gazePitch+(Math.random()-.5)*0.14;}
  st.gx=damp(st.gx,clamp(st.tgx,-0.42,0.42),28,dt);st.gy=damp(st.gy,clamp(st.tgy,-0.28,0.28),28,dt);for(const e of face.eyes){e.rotation.y=st.gx;e.rotation.x=st.gy;}
  st.brow=damp(st.brow,o.brow,8,dt);st.furrow=damp(st.furrow,o.furrow,8,dt);
  for(const b of face.brows){const s=b.userData.s;b.position.y=0.265+0.045*st.brow-0.02*st.furrow;b.rotation.z=s*(Math.PI/2+b.userData.base+0.32*st.furrow-0.16*st.brow);}
  st.mouth=damp(st.mouth,o.mouth,20,dt);
  // blendshape expressions: each eases toward its target so faces move, not snap
  const ex=st.ex||(st.ex={smL:0,smR:0,frL:0,frR:0,puck:0,sneer:0,snarl:0,puff:0,sqL:0,sqR:0,jawX:0});const t=o.ex||{};
  const sm=t.smile||0,fr=t.frown||0,sq=t.squint||0,tg={smL:t.smL??sm,smR:t.smR??sm,frL:t.frL??fr,frR:t.frR??fr,puck:t.pucker||0,sneer:t.sneer||0,snarl:t.snarl||0,puff:t.puff||0,sqL:t.sqL??sq,sqR:t.sqR??sq,jawX:t.jawX||0};
  for(const k in ex)ex[k]=damp(ex[k],tg[k],12,dt);
  const mi=face.body&&face.body.morphTargetInfluences;
  if(mi&&mi.length>=12){mi[0]=Math.min(1,st.mouth*1.1);mi[1]=ex.smL;mi[2]=ex.smR;mi[3]=ex.frL;mi[4]=ex.frR;mi[5]=ex.puck;mi[6]=ex.sneer;mi[7]=ex.snarl;mi[8]=ex.puff;mi[9]=ex.sqL;mi[10]=ex.sqR;mi[11]=ex.jawX;}
  if(face.jawMeshes)for(const m of face.jawMeshes){if(m.morphTargetInfluences){m.morphTargetInfluences[0]=Math.min(1,st.mouth*1.1);m.morphTargetInfluences[1]=ex.jawX;}}
  const smile=(ex.smL+ex.smR)/2,open=Math.max(st.mouth,ex.snarl*0.35);
  face.mouth.visible=open>0.04;face.mouth.scale.set(0.15*(1+0.25*smile-0.4*ex.puck),0.004+0.085*open,0.07);face.mouth.position.set(ex.jawX*0.03,-0.49-0.045*st.mouth+0.012*ex.snarl,-0.82);}
/* ================= hero emotion engine (valence and arousal) ================= */
const EMO={valence:0,arousal:0.15,hurtT:0,nearest:99,lowWarned:false};
function emote(dv,da){EMO.valence=clamp(EMO.valence+dv,-1,1);EMO.arousal=clamp(EMO.arousal+da,0,1);}
/* ================= voice lines with captions and lip-sync ================= */
const VOICE={ok:typeof window.speechSynthesis!=='undefined'&&typeof window.SpeechSynthesisUtterance!=='undefined',cd:0,talkT:0,voice:null};
function pickVoice(){try{const vs=speechSynthesis.getVoices();VOICE.voice=vs.find(v=>/^en/i.test(v.lang)&&/male|david|daniel|alex|fred|george|guy|james|tom/i.test(v.name))||vs.find(v=>/^en/i.test(v.lang))||null;}catch(e){}}
if(VOICE.ok){pickVoice();try{speechSynthesis.onvoiceschanged=pickVoice;}catch(e){}}
const LINES={wave:['Here they come.','Stay sharp.','Not again.'],reload:['Reloading!','Changing mags.'],kill:['Got him.','Stay down.','One less.'],
  hurt:['Argh!','Get off me!'],fire:['I\u2019m on fire!','Aaagh! Fire!'],low:['I\u2019m hurt bad. Need a medkit.'],gun:['Now we\u2019re talking.'],med:['That\u2019s better.'],clear:['That\u2019s the last of them. For now.'],quiet:['Too quiet.']};
function say(key,chance,force){if(G.state!=='play')return;if(!force&&(VOICE.cd>0||Math.random()>(chance===undefined?1:chance)))return;
  const L=LINES[key];const t=L[Math.random()*L.length|0];VOICE.cd=6;VOICE.talkT=0.3+t.length*0.06;
  const cap=$('cap');cap.textContent='\u201c'+t+'\u201d';cap.classList.add('on');clearTimeout(say.tm);say.tm=setTimeout(()=>cap.classList.remove('on'),(VOICE.talkT+0.8)*1000);
  if(VOICE.ok&&SET.voice)try{const u=new SpeechSynthesisUtterance(t);if(VOICE.voice)u.voice=VOICE.voice;u.pitch=0.72;u.rate=1.02;u.volume=0.9*(SET.master??1)*(SET.sfx??1);
    u.onend=()=>{VOICE.talkT=0;};speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}

/* ================= HUD ================= */
const hud={hp:$('hpfill'),score:$('score'),wave:$('wave'),ammo:$('ammo'),reserve:$('reserve'),ammoBox:$('ammoBox'),wName:$('weapName'),
  ring:$('reloadRing'),arc:$('ringArc'),x:$('xhair'),hit:$('hit'),hs:$('hs'),vig:$('vig'),msg:$('msg'),ov:$('overlay'),ovt:$('ovtitle'),ovs:$('ovsub'),ovh:$('ovhint'),best:$('best')};
let msgTimer=0;
function showMsg(t,dur){hud.msg.textContent=t;hud.msg.classList.add('on');msgTimer=dur||1.6;}
function hitMarker(kill,head){hud.hit.classList.toggle('kill',!!kill);hud.hit.style.transition='none';hud.hit.style.opacity=1;
  if(head){hud.hs.style.transition='none';hud.hs.style.opacity=1;}
  requestAnimationFrame(()=>{hud.hit.style.transition='opacity .25s';hud.hit.style.opacity=0;if(head){hud.hs.style.transition='opacity .7s';hud.hs.style.opacity=0;}});}
function drawHud(){const W=GUNS[P.weapon];hud.hp.style.width=Math.max(0,P.hp/(P.maxHp||100)*100)+'%';hud.score.textContent=G.score.toLocaleString();
  hud.wave.textContent=(G.wave?'Wave '+G.wave:'')+(CHEATS.some(([k])=>CH[k])?'  \u00b7 cheats on':'');hud.wName.textContent=W.name;hud.ammo.textContent=W.melee?'\u2014':P.ammo;
  hud.reserve.textContent='/ '+(P.reserve===Infinity?'\u221e':P.reserve);hud.ammoBox.classList.toggle('low',P.ammo<=Math.ceil(W.mag*0.2));const nd=$('nades');if(nd)nd.textContent=(G.nadeKind==='toxic'?'Toxic ':'Grenades ')+(P.nades||0)+'  \u00b7  '+(P.trapType==='snare'?'\u25b8':'')+'Snares '+((P.traps||{}).snare||0)+'  '+(P.trapType!=='snare'?'\u25b8':'')+'Mines '+((P.traps||{}).mine||0)+(P.light?'  \u00b7  Light':'');}

/* ================= state ================= */
const P={nadeT:-1,x:0,z:8,y:0,vy:0,roof:-1,climb:null,climbPh:0,climbInv:false,pitch:0,yaw:0,vel:0,turn:0,hp:100,weapon:'rifle',ammo:30,reserve:Infinity,reloadT:0,reloadMax:1,fireCD:0,aimT:0,phase:0,runAmt:0,aimAmt:0,reloadAmt:0,recoil:0,side:1,stepAcc:0,emptyLatch:false};
const G={state:'title',score:0,wave:0,toSpawn:0,spawnT:0,between:0,shake:0,time:0,pickupT:10,titleT:0,best:0};
try{G.best=parseInt(localStorage.getItem('sb-outbreak-best')||'0',10)||0;}catch(e){}
const enemies=[],pickups=[];
const input={up:false,down:false,left:false,right:false,fire:false};
const stickVec={x:0,y:0};
function equip(k){const W=GUNS[k];P.weapon=k;P.ammo=W.mag;P.reserve=W.reserve;P.reloadT=0;
  for(const n in hero.gunMeshes)hero.gunMeshes[n].visible=n===k;hero.muzzle.position.set(W.muzzle[0],W.muzzle[1],W.muzzle[2]);drawHud();}
function goFull(){const d=document,el=d.documentElement;if(d.fullscreenElement||d.webkitFullscreenElement)return;
  const req=el.requestFullscreen||el.webkitRequestFullscreen;if(!req)return;
  try{const p=req.call(el,{navigationUI:'hide'});if(p&&p.then)p.then(()=>{try{screen.orientation.lock('portrait').catch(()=>{});}catch(e){}}).catch(()=>{});}catch(e){}}
function toggleFull(){const d=document;if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d);}else goFull();}
function resetGame(){if(typeof clearArena==='function')clearArena();G.boss=false;G.bossE=null;if(typeof haleReset==='function')haleReset();FOOD.forEach(c=>c.feeders.length=0);resetInv();if(P.car)exitCar();GRN.forEach(g=>scene.remove(g.m));GRN.length=0;enemies.slice().forEach(removeEnemy);pickups.slice().forEach(removePickup);resetBarrels();resetCars();
  Object.assign(P,{stance:'stand',slideT:0,landT:0,air:false,kd:null,enterT:undefined,enterCar:null,adsHold:false,x:0,z:8,y:0,vy:0,roof:-1,climb:null,pitch:0,yaw:0,vel:0,hp:100,fireCD:0,aimT:0,recoil:0,dying:0,burn:0,char:0,nades:3,jam:false,clearing:false,breath:0,breathCD:0,car:null,nadeT:-1});G.killcam=null;Object.assign(G,{score:0,wave:0,between:0.01,shake:0,pickupT:10,toSpawn:0});
  clearArena();G.boss=false;G.bossE=null;haleReset();titleZ.root.visible=false;Object.assign(EMO,{valence:0,arousal:0.15,hurtT:0,lowWarned:false});equip('rifle');camPos.set(0.6,1.7,10.5);drawHud();}
function startWave(n){if(DEADZONE&&n>4){G.won=true;setState('over');return;}if(DEADZONE&&n===4){G.roundT=0;G.wave=4;drawHud();startBossRound();return;}setTimeout(()=>haleEvent('wave',n),2800);G.roundT=0;G.wave=n;G.toSpawn=(DEADZONE?8:6)+n*3;G.spawnT=1.5;showMsg('Wave '+n,2);sfx.wave();drawHud();emote(-0.05,0.25);setTimeout(()=>say('wave',0.8),900);}
function setState(s){G.state=s;if(s==='over'&&!G.won)setTimeout(()=>haleEvent('over',0,true),700);const hd=$('hud');hd.classList.toggle('lo',s==='loadout');hd.classList.toggle('cheats',s==='cheats'||s==='settings'||s==='controls'||s==='mapping'||s==='graphics'||s==='audio');hd.classList.toggle('pz',s==='paused'||s==='over');if(s!=='loadout'&&LOUI.open){LOUI.open=false;$('loadout').classList.remove('on');}document.body.classList.toggle('alley-full',s.startsWith('alley'));hd.classList.toggle('alley',s.startsWith('alley'));hd.classList.toggle('menu',s==='title'||s==='cheats'||s==='settings'||s==='controls'||s==='mapping'||s==='graphics'||s==='audio');
  if(s==='play'||s==='alley'||s==='loadout'){hud.ov.classList.add('hide');}
  else{hud.ov.classList.remove('hide');hud.ovs.textContent='';
    if(s==='title'){hud.ovt.textContent='BOMBIES';hud.ovh.textContent='Best survival score: '+G.best.toLocaleString()+'  \u00b7  Alley Shot top: '+AL.best.toLocaleString();}
    if(s==='paused'||s==='alleypaused'){hud.ovt.textContent='Paused';hud.ovh.textContent='';}
    if(s==='over'){if(G.score>G.best){G.best=G.score;try{localStorage.setItem('sb-outbreak-best',String(G.best));}catch(e){}}
      hud.ovt.textContent=G.won?(G.wonText||'Dead Zone cleared'):'You didn\u2019t make it';hud.ovh.textContent=(G.won?(HORDE?HZ.kills.toLocaleString()+' Bombies down on '+HLV().name+'. ':'All three rounds survived. '):'Wave '+G.wave+'. ')+G.score.toLocaleString()+' points. Best: '+G.best.toLocaleString()+'.';G.won=false;G.wonText='';}
    if(s==='alleyover'){hud.ovt.textContent='Game over';hud.ovh.textContent=AL.score.toLocaleString()+' points, round '+AL.round+'. Top: '+AL.best.toLocaleString()+'.';}
    if(s==='controls'){hud.ovt.textContent='Controls';hud.ovh.textContent='';}
    if(s==='mapping'){hud.ovt.textContent='Controller map';hud.ovh.textContent='Labels show what each control does in a game.';}
    if(s==='graphics'){hud.ovt.textContent='Graphics';hud.ovh.textContent='';}
    if(s==='audio'){hud.ovt.textContent='Audio';hud.ovh.textContent='';}
    if(s==='settings'){hud.ovt.textContent='Settings';hud.ovh.textContent='Use the left stick or tap \u2212 and + to set volumes.';}
    if(s==='cheats'){hud.ovt.textContent='Cheats';hud.ovh.textContent='Switch features on and off. They stay set until you change them.';}
    if(s!=='cheats'||!buildMenu.keep)MENU.sel=0;buildMenu();}}
function pressStart(){initAudio();goFull();
  if(G.state==='loadout'){if(LOUI.att)closeMods();else toggleLoadout(false);return;}
  if(MENU_STATES.includes(G.state))menuActivate();
  else if(G.state==='play')setState('paused');else if(G.state==='alley')setState('alleypaused');}
function pressSelect(){initAudio();if(G.state!=='play')return;P.side*=-1;showMsg(P.side>0?'Right shoulder':'Left shoulder',0.9);}
function startReload(){const W=GUNS[P.weapon];if(P.reloadT>0||P.ammo>=W.mag||P.reserve<=0)return false;P.reloadT=P.reloadMax=W.reload*(P.reloadK||1);sfx.reload(W.reload*(P.reloadK||1));say('reload',0.45);return true;}
function pressReload(){initAudio();if(G.state==='loadout'){loActivate();return;}if(MENU_STATES.includes(G.state)){menuActivate();return;}if(G.state!=='play')return;if(P.jam&&P.reloadT<=0){P.clearing=true;P.reloadT=P.reloadMax=0.65;sfx.reload(0.6);return;}startReload();}

/* ================= AI: navigation grid, A* (binary heap), perception, climbing ================= */
const NAV={n:150,org:-75,grid:null};const NN=150*150;const _G=new Float32Array(NN),_F=new Float32Array(NN),_came=new Int32Array(NN),_closed=new Uint8Array(NN),_heap=new Int32Array(NN*2);
function buildNav(){const n=NAV.n;NAV.grid=new Uint8Array(n*n);for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=NAV.org+i+0.5,z=NAV.org+j+0.5;
  if(Math.abs(x)>W-0.6||Math.abs(z)>W-0.6||insideCollider(x,z,0.45))NAV.grid[j*n+i]=1;}}
function cellOf(x,z){return [clamp(Math.floor(x-NAV.org),0,NAV.n-1),clamp(Math.floor(z-NAV.org),0,NAV.n-1)];}
function blocked(x,z){const c=cellOf(x,z);return NAV.grid[c[1]*NAV.n+c[0]]===1;}
function losClear(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0),steps=Math.ceil(d/0.45);for(let s=1;s<steps;s++){const t=s/steps;if(blocked(x0+(x1-x0)*t,z0+(z1-z0)*t))return false;}return true;}
function findPath(x0,z0,x1,z1){const n=NAV.n,g=NAV.grid;let [si,sj]=cellOf(x0,z0),[ti,tj]=cellOf(x1,z1);
  if(g[tj*n+ti]){let bd=1e9,bi=ti,bj=tj;for(let dj=-3;dj<=3;dj++)for(let di=-3;di<=3;di++){const i=ti+di,j=tj+dj;if(i<0||j<0||i>=n||j>=n||g[j*n+i])continue;const dd=di*di+dj*dj;if(dd<bd){bd=dd;bi=i;bj=j;}}ti=bi;tj=bj;}
  const start=sj*n+si,goal=tj*n+ti;_G.fill(1e9);_came.fill(-1);_closed.fill(0);
  const h=k=>{const dx=Math.abs(k%n-ti),dz=Math.abs(((k/n)|0)-tj);return Math.max(dx,dz)+0.414*Math.min(dx,dz);};
  let hs=0;const push=k=>{let i=hs++;_heap[i]=k;while(i>0){const p=(i-1)>>1;if(_F[_heap[p]]<=_F[_heap[i]])break;const t=_heap[p];_heap[p]=_heap[i];_heap[i]=t;i=p;}};
  const pop=()=>{const top=_heap[0];_heap[0]=_heap[--hs];let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<hs&&_F[_heap[l]]<_F[_heap[m]])m=l;if(r<hs&&_F[_heap[r]]<_F[_heap[m]])m=r;if(m===i)break;const t=_heap[m];_heap[m]=_heap[i];_heap[i]=t;i=m;}return top;};
  _G[start]=0;_F[start]=h(start);push(start);let it=0,found=start===goal;
  while(hs>0&&it++<12000&&hs<NN*2-16){const cur=pop();if(_closed[cur])continue;if(cur===goal){found=true;break;}_closed[cur]=1;const ci=cur%n,cj=(cur/n)|0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=n||nj>=n)continue;const nk=nj*n+ni;
      if(g[nk]||_closed[nk])continue;if(di&&dj&&(g[cj*n+ni]||g[nj*n+ci]))continue;
      const ng=_G[cur]+(di&&dj?1.414:1);if(ng<_G[nk]){_G[nk]=ng;_F[nk]=ng+h(nk);_came[nk]=cur;push(nk);}}}
  if(!found)return null;const pts=[];for(let k=goal;k!==start&&k>=0;k=_came[k])pts.push([NAV.org+k%n+0.5,NAV.org+((k/n)|0)+0.5]);pts.reverse();
  const out=[];let ax=x0,az=z0;for(let k=0;k<pts.length;k++){const nx=pts[k+1];if(nx&&losClear(ax,az,nx[0],nx[1]))continue;out.push(pts[k]);ax=pts[k][0];az=pts[k][1];}
  return out;}
function angDiff(a,b){let d=b-a;return Math.atan2(Math.sin(d),Math.cos(d));}
function nearestLadder(roof,x,z){let best=null,bd=1e9;for(const L of ladders){if(L.roof!==roof)continue;const d=Math.hypot(L.bx-x,L.bz-z);if(d<bd){bd=d;best=L;}}return best;}
function alertNoise(x,z,radius){for(const e of enemies){if(e.dead||e.mode==='chase'||e.climb)continue;const d=Math.hypot(e.x-x,e.z-z);if(d>radius)continue;if(e.mode==='feed'){if(d>Math.min(radius,7))continue;leaveFeed(e);}
  const err=d*0.12;e.mode='investigate';e.tx=x+(Math.random()-.5)*err*2;e.tz=z+(Math.random()-.5)*err*2;e.path=null;e.pathT=0;e.searchT=0;e.react=0;}}
// behaviour tree: attack > chase (incl. ladders) > investigate > feed > search > wander
// decisions run a few times a second (staggered per zombie, slower when far away); movement runs every frame
function thinkZombie(e,dt){
  if(e.climb){const L=e.climb;e.y+=e.climbDir*0.8*dt;e.x=L.bx-L.nx*0.15;e.z=L.bz-L.nz*0.15;e.yaw=L.yawIn;e.moveAmt=damp(e.moveAmt,1,6,dt);
    if(e.climbDir>0&&e.y>=L.y1){e.climb=null;e.y=L.y1;e.roof=L.roof;e.x=L.tx;e.z=L.tz;}
    else if(e.climbDir<0&&e.y<=0){e.climb=null;e.y=0;e.roof=-1;e.x=L.bx+L.nx*0.4;e.z=L.bz+L.nz*0.4;}
    return {d:Math.hypot(P.x-e.x,P.z-e.z,P.y-e.y),moving:true,climbing:true};}
  const dx=P.x-e.x,dz=P.z-e.z,d=Math.hypot(dx,dz)||1,sameLvl=Math.abs(P.y-e.y)<1.2;const onRoof=e.roof>=0;
  e.thinkAcc=(e.thinkAcc||0)+dt;e.thinkT=(e.thinkT===undefined?Math.random()*0.2:e.thinkT)-dt;
  if(e.thinkT<=0){const tdt=e.thinkAcc;e.thinkAcc=0;e.thinkT=(d>35?0.5:0.2)+Math.random()*0.06;AI_STATS.thinks++;
    // senses: a 110 degree vision cone with line of sight; feeding zombies are distracted and barely look up
    const fx=-Math.sin(e.yaw),fz=-Math.cos(e.yaw),cs=(dx*fx+dz*fz)/d;const feeding=e.mode==='feed';
    const range=(feeding?6:(e.runner?22:16))*(G.dark?0.7:1),cone=feeding?Math.cos(0.5):Math.cos(0.96);
    const los=(sameLvl&&!onRoof)?losClear(e.x,e.z,P.x,P.z):true;
    const sees=!CH.ghost&&d<range&&(cs>cone||d<1.6)&&los;const hears=!CH.ghost&&!feeding&&((P.vel>3.2&&d<9)||(P.vel>1.2&&d<3));
    const was=e.seen;e.seen=sees||hears;if(e.seen){e.lastX=P.x;e.lastZ=P.z;e.lostT=0;if(e.mode!=='chase'&&e.react<=0)e.react=(feeding?0.6:0.25)+Math.random()*0.55;}
    if(e.react>0){e.react-=tdt;if(e.react<=0){if(e.mode==='feed')leaveFeed(e);e.mode='chase';e.path=null;}}
    if(e.mode==='chase'&&!e.seen){e.lostT+=tdt;if(e.lostT>6){e.mode='investigate';e.tx=e.lastX;e.tz=e.lastZ;e.path=null;}}
    let gx=e.x,gz=e.z,spd=0;
    if(e.mode==='chase'){gx=e.seen?P.x:e.lastX;gz=e.seen?P.z:e.lastZ;spd=1;
      // crowd spacing: close chasers take their own slot around you instead of queueing behind each other
      if(e.seen&&sameLvl&&!onRoof&&d<8&&d>1.5&&e.slotA!==undefined){const r=Math.min(1.15,d*0.5);const sx=P.x+Math.sin(e.slotA)*r,sz=P.z+Math.cos(e.slotA)*r;if(!blocked(sx,sz)){gx=sx;gz=sz;}}
      const pr=P.climb?-1:P.roof;
      if(pr!==e.roof&&!e.runner){if(e.roof===-1&&pr>=0){const L=nearestLadder(pr,e.x,e.z);if(L){gx=L.bx;gz=L.bz;if(Math.hypot(gx-e.x,gz-e.z)<0.7){e.climb=L;e.climbDir=1;e.y=0;}}}
        else if(e.roof>=0){const L=nearestLadder(e.roof,e.x,e.z);if(L){gx=L.ex;gz=L.ez;if(Math.hypot(gx-e.x,gz-e.z)<0.7){e.climb=L;e.climbDir=-1;e.y=L.y1;}}}}}
    else if(e.mode==='feed'){const c=e.food;if(!c){e.mode='wander';e.wanderT=0;}else{const fx2=c.x+Math.sin(e.feedA)*0.75,fz2=c.z+Math.cos(e.feedA)*0.75;gx=fx2;gz=fz2;
        const fd=Math.hypot(fx2-e.x,fz2-e.z);spd=fd>0.25?0.55:0;e.eating=fd<=0.35;if(e.eating)e.faceYaw=Math.atan2(-(c.x-e.x),-(c.z-e.z));}}
    else if(e.mode==='investigate'){gx=e.tx;gz=e.tz;spd=0.75;if(Math.hypot(gx-e.x,gz-e.z)<1.3){e.mode='search';e.searchT=2+Math.random()*2.5;}}
    else if(e.mode==='search'){e.searchT-=tdt;if(e.searchT<=0){e.mode='wander';e.wanderT=0;}}
    else{const c=!onRoof&&findFood(e);if(c){joinFeed(e,c);}
      else{e.wanderT-=tdt;if(e.wanderT<=0||Math.hypot(e.tx-e.x,e.tz-e.z)<1){e.wanderT=4+Math.random()*5;let tries=0;
        do{e.tx=e.x+(Math.random()-.5)*12;e.tz=e.z+(Math.random()-.5)*12;}while(!onRoof&&blocked(e.tx,e.tz)&&tries++<8);e.path=null;}
      gx=e.tx;gz=e.tz;spd=e.pause>0?0:0.42;e.pause-=tdt;if(Math.random()<tdt*0.12)e.pause=1+Math.random()*2;
      e.hordeT-=tdt;if(e.hordeT<=0){e.hordeT=8+Math.random()*6;alertNoise(P.x+(Math.random()-.5)*10,P.z+(Math.random()-.5)*10,99);}}}
    if(e.mode!=='feed')e.eating=false;
    if(spd>0&&!onRoof&&!losClear(e.x,e.z,gx,gz)){e.pathT-=tdt;
      if(!e.path||e.pathT<=0||Math.hypot(gx-e.pgx,gz-e.pgz)>2){e.path=findPath(e.x,e.z,gx,gz);AI_STATS.paths++;e.pathT=0.7+Math.random()*0.5;e.pgx=gx;e.pgz=gz;}}
    else e.path=null;
    e.gx=gx;e.gz=gz;e.spd=spd;}
  const gx=e.gx===undefined?e.x:e.gx,gz=e.gz===undefined?e.z:e.gz,spd=e.spd||0;
  if(e.mode==='search')e.lookYaw=Math.sin(G.time*1.3+e.t)*0.8;
  let wx=gx,wz=gz;
  if(e.path&&e.path.length){while(e.path.length>1&&Math.hypot(e.path[0][0]-e.x,e.path[0][1]-e.z)<0.6)e.path.shift();wx=e.path[0][0];wz=e.path[0][1];}
  const close=e.mode==='chase'&&d<1.05&&sameLvl;
  if(e.eating){e.yaw+=angDiff(e.yaw,e.faceYaw)*Math.min(1,dt*4);}
  else if(spd>0&&!close){const want=Math.atan2(-(wx-e.x),-(wz-e.z));e.yaw+=clamp(angDiff(e.yaw,want),-1,1)*(e.runner&&e.mode==='chase'?6:3)*dt;}
  else if(e.mode==='chase'){e.yaw+=angDiff(e.yaw,Math.atan2(-dx,-dz))*Math.min(1,dt*5);}
  const turnK=Math.max(0,Math.cos(angDiff(e.yaw,Math.atan2(-(wx-e.x),-(wz-e.z)))));
  const canMove=spd>0&&!close&&!e.eating&&e.atkT<=0&&e.stagger<0.35&&e.burnPanic<=0;
  let v=canMove?e.speed*spd*(e.runner&&e.mode!=='chase'?0.35:1)*(0.3+0.7*turnK):0;
  if(e.burnPanic>0){v=e.speed*1.3;e.yaw+=Math.sin(G.time*3+e.t)*dt*3;}
  e.x+=-Math.sin(e.yaw)*v*dt;e.z+=-Math.cos(e.yaw)*v*dt;
  e.moveAmt=damp(e.moveAmt,v>0.05?1:0,6,dt);e.runBlend=damp(e.runBlend,(e.runner&&e.mode==='chase'&&v>0.5)||e.burnPanic>0?1:0,5,dt);
  if(!e.runner&&v>0.3&&Math.random()<dt*0.05)e.stagger=Math.max(e.stagger,0.45);
  if(e.seen&&e.mode==='chase')e.lookYaw=clamp(angDiff(e.yaw,Math.atan2(-dx,-dz)),-0.8,0.8);else if(e.mode!=='search')e.lookYaw*=0.95;
  const sep=e.mode==='chase'?0.85:0.75;
  for(const o of enemies){if(o===e||o.dead||Math.abs(o.y-e.y)>1)continue;const ox=e.x-o.x,oz=e.z-o.z;if(Math.abs(ox)>sep||Math.abs(oz)>sep)continue;const od=Math.hypot(ox,oz);if(od<sep&&od>0.001){e.x+=ox/od*(sep-od)*0.5;e.z+=oz/od*(sep-od)*0.5;}}
  const p={x:e.x,z:e.z};collide(p,0.35,e.y);e.x=p.x;e.z=p.z;
  if(onRoof){const s=surfaces[e.roof];e.x=clamp(e.x,s.x0+0.5,s.x1-0.5);e.z=clamp(e.z,s.z0+0.5,s.z1-0.5);}
  return {d:Math.hypot(dx,dz,P.y-e.y),moving:v>0.05};}
const AI_STATS={thinks:0,paths:0};
// hand out evenly spaced slots around the player to the zombies closing in, keeping each near its current side
function assignSlots(){const ch=enemies.filter(e=>!e.dead&&e.mode==='chase'&&!e.climb&&Math.abs(e.y-P.y)<1.2&&Math.hypot(e.x-P.x,e.z-P.z)<9);
  if(!ch.length)return;ch.forEach(e=>e._a=Math.atan2(e.x-P.x,e.z-P.z));ch.sort((a,b)=>a._a-b._a);
  const n=ch.length,step=Math.min(Math.PI*2/n,1.0);let mean=Math.atan2(ch.reduce((s,e)=>s+Math.sin(e._a),0),ch.reduce((s,e)=>s+Math.cos(e._a),0));
  ch.forEach((e,i)=>{const a=mean+(i-(n-1)/2)*step;e.slotA=e.slotA===undefined?a:e.slotA+angDiff(e.slotA,a)*0.5;});}
/* ---- feeding: bodies on the ground draw nearby zombies, who kneel and eat ---- */
const FOOD=[];
function findFood(e){if(e.runner&&Math.random()<0.5)return null;let best=null,bd=14;for(const c of FOOD){if(c.feeders.length>=3)continue;const d=Math.hypot(c.x-e.x,c.z-e.z);if(d<bd&&losClear(e.x,e.z,c.x,c.z)){bd=d;best=c;}}return best;}
function joinFeed(e,c){if(e.food)leaveFeed(e);e.mode='feed';e.food=c;c.feeders.push(e);const used=c.feeders.map(o=>o.feedA).filter(a=>a!==undefined);let a=Math.random()*Math.PI*2;
  for(let k=0;k<6;k++){const t=k*Math.PI/3+c.a0;if(!used.some(u=>Math.abs(angDiff(u,t))<0.8)){a=t;break;}}e.feedA=a;e.path=null;}
function leaveFeed(e){const c=e.food;if(c){const i=c.feeders.indexOf(e);if(i>=0)c.feeders.splice(i,1);}e.food=null;e.eating=false;}

/* ================= zombies ================= */
const hitMat=new THREE.MeshBasicMaterial({visible:false});
const headHitGeo=new THREE.SphereGeometry(0.15,8,6),bodyHitGeo=new THREE.BoxGeometry(0.62,1.42,0.46),torsoHitGeo=new THREE.BoxGeometry(0.52,0.72,0.38),
  thighHitGeo=new THREE.BoxGeometry(0.17,0.44,0.18),shinHitGeo=new THREE.BoxGeometry(0.15,0.42,0.16),uarmHitGeo=new THREE.BoxGeometry(0.13,0.3,0.13),farmHitGeo=new THREE.BoxGeometry(0.12,0.28,0.12);
function makeZombie(kind){const spec=k=>ZLOOKS.findIndex(l=>l.spec===k);const civ=[],sol=[];ZLOOKS.forEach((l,i)=>{if(l.spec)return;(l.tac===undefined?civ:sol).push(i);});
  const vi=kind==='tank'?spec('brute'):kind==='spitter'?spec('spitter'):kind==='runner'&&Math.random()<0.7?spec('gaunt'):Math.random()<0.4?sol[Math.random()*sol.length|0]:civ[Math.random()*civ.length|0];const mat=humanMat.clone();addBurn(mat);const r=buildHuman(zGeos(vi),mat);r.root.rotation.order='YXZ';if(ZLOOKS[vi].tac!==undefined){attachTacGear(r,ZTAC[ZLOOKS[vi].tac]);glowEyes(r);}if(kind==='spitter'){attachSpitter(r);if(G.state==='play')setTimeout(()=>haleEvent('spitter'),1500);}else if(DEADZONE&&ZLOOKS[vi].tac===undefined&&kind!=='tank')glowEyes(r);
  const sc=0.92+Math.random()*0.14;r.root.scale.setScalar(sc);if(ZLOOKS[vi].spec==='gaunt'){r.root.scale.set(sc*0.86,sc*1.05,sc*0.84);r.gaunt=true;}
  const hb=new THREE.Mesh(torsoHitGeo,hitMat);hb.position.y=0.3;r.torso.add(hb);
  const hh=new THREE.Mesh(headHitGeo,hitMat);hh.position.y=0.13;r.head.add(hh);hh.userData.head=true;
  const hits=[hb,hh];const limb=(bone,geo,y,part,side)=>{const m=new THREE.Mesh(geo,hitMat);m.position.y=y;bone.add(m);m.userData.part=part;m.userData.side=side;hits.push(m);};
  for(const [L,sd] of[[r.legL,'L'],[r.legR,'R']]){limb(L.hp,thighHitGeo,-0.22,'leg',sd);limb(L.kn,shinHitGeo,-0.2,'leg',sd);}
  for(const [A_,sd] of[[r.armL,'L'],[r.armR,'R']]){limb(A_.sh,uarmHitGeo,-0.15,'arm',sd);limb(A_.el,farmHitGeo,-0.13,'arm',sd);}
  return {r,mat,hb,hh,hits,sc};}
const titleZ=makeZombie();titleZ.root=titleZ.r.root;scene.add(titleZ.root);titleZ.root.position.set(1.6,0,5.6);titleZ.root.rotation.y=Math.PI*0.85;titleZ.t=0;
const spawnPts=[[-24,-20],[24,-20],[-24,20],[24,20],[0,-40],[0,42],[-42,0],[42,0],[-33,-60],[33,60],[-60,33],[60,-33],[-40,-40],[40,40],[-40,44],[44,-40],[-65,-33],[65,33],[0,-65],[0,68]];
function spawnEnemy(){const _n=enemies.length;const wt=(DEADZONE&&G.wave>=2&&Math.random()<0.18)||(!DEADZONE&&!HORDE&&G.wave>=3&&Math.random()<0.08);G.nextKind=wt?'tank':null;spawnEnemy0();G.nextKind=null;const e=enemies[enemies.length-1];if(wt&&e&&enemies.length>_n){setTimeout(()=>haleEvent('tank'),800);e.tank=true;e.hp*=4;e.speed*=0.75;e.runner=false;e.sc*=1.3;e.r.root.scale.set(e.sc*1.22,e.sc,e.sc*1.2);attachTankArmor(e.r);}}
function spawnEnemy0(){const opts=spawnPts.filter(([x,z])=>{const d=Math.hypot(x-P.x,z-P.z);return d>16&&d<55&&!blocked(x,z);});const [x,z]=opts[Math.random()*opts.length|0]||spawnPts[0];
  const runner=!G.nextKind&&Math.random()<Math.min(0.45,(G.wave-2)*0.12);const spit=!G.nextKind&&!runner&&!HORDE&&G.wave>=2&&Math.random()<0.12;const zb=makeZombie(G.nextKind||(runner?'runner':spit?'spitter':undefined));if(CH.bigheads)zb.r.head.scale.setScalar(1.8);scene.add(zb.r.root);zb.r.root.position.set(x,0,z);
  const hp=(runner?3:spit?6:5)+Math.floor(G.wave/4);
  const e={...zb,x,z,yaw:0,hp,runner,speed:runner?3.6+Math.random()*0.8:0.9+Math.random()*0.5+G.wave*0.04,t:Math.random()*6,limp:Math.random()<0.5?1:-1,
    y:0,roof:-1,climb:null,climbDir:0,burn:0,burnPanic:0,legDmg:0,crawl:false,armDmg:{L:0,R:0},armOff:{L:false,R:false},atkCD:0.8,atkT:0,stagger:0,dead:0,groanT:1+Math.random()*4,mode:'investigate',tx:P.x+(Math.random()-.5)*12,tz:P.z+(Math.random()-.5)*12,path:null,pathT:0,pgx:0,pgz:0,senseT:Math.random()*0.3,react:0,seen:false,lostT:0,searchT:0,wanderT:0,hordeT:6,pause:0,moveAmt:0,runBlend:0,lookYaw:0,lastX:P.x,lastZ:P.z,spitter:!!zb.r.bulbs,spitT:2+Math.random()*2};
  zb.hits.forEach(h=>h.userData.enemy=e);enemies.push(e);
  const c=FOOD.find(c=>c.feeders.length<2&&Math.hypot(c.x-P.x,c.z-P.z)>14);if(c&&Math.random()<0.45){e.x=c.x+(Math.random()-.5)*3;e.z=c.z+(Math.random()-.5)*3;joinFeed(e,c);zb.r.root.position.set(e.x,0,e.z);}}
function removeEnemy(e){if(e.food)leaveFeed(e);scene.remove(e.r.root);e.mat.dispose();if(e.r.flames)e.r.flames.forEach(m=>m.material.dispose());const i=enemies.indexOf(e);if(i>=0)enemies.splice(i,1);}
function damageEnemy(e,dmg,head,dir,silent,parts){if(e.dead)return;if(e.boss){bossDamage(e,dmg,head);return;}
  if(parts){if(parts.leg){e.legDmg+=parts.leg;if(e.legDmg>=2&&!e.crawl){e.crawl=true;e.speed*=0.35;e.runner=false;e.stagger=1;sfx.thud();}}
    for(const sd of['L','R'])if(parts[sd]){e.armDmg[sd]+=parts[sd];if(e.armDmg[sd]>=2&&!e.armOff[sd]){e.armOff[sd]=true;}}}if(e.mode!=='chase'&&!e.seen&&!silent&&dmg<900){dmg*=2;if(!G.sneakMsgT||G.time>G.sneakMsgT){showMsg('Sneak attack',0.8);G.sneakMsgT=G.time+3;}}if(e.mode==='feed')leaveFeed(e);if(e.mode!=='chase'){e.mode='chase';e.react=0;e.lastX=P.x;e.lastZ=P.z;e.lostT=0;e.path=null;}e.hp-=dmg;e.stagger=Math.min(0.6,e.stagger+(head?0.5:0.25));e.x+=dir.x*0.08;e.z+=dir.z*0.08;
  if(e.hp<=0){e.dead=0.001;if(G.state==='play'&&G.wave>0&&G.toSpawn===0&&enemies.every(o=>o===e||o.dead)&&!P.car)G.killcam={e,t:0};G.score+=(e.runner?150:100)+(head?50:0)+G.wave*10;hitMarker(true,head);sfx.thud();buzz(25);emote(0.12,-0.05);if(head)say('kill',0.35);}
  else if(!silent){hitMarker(false,head);head?sfx.head():sfx.hit();}drawHud();}

/* ================= fire: shader flames (rolling tongues of flame), sparks, fireballs, smoke ================= */
const smokeTex=canvasTex(128,128,(g,w,h)=>{for(let i=0;i<14;i++){const x=34+Math.random()*60,y=34+Math.random()*60,r=20+Math.random()*28;const gr=g.createRadialGradient(x,y,0,x,y,r);
  gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}});
smokeTex.wrapS=smokeTex.wrapT=THREE.ClampToEdgeWrapping;
const flameTex=canvasTex(64,128,(g,w,h)=>{const gr=g.createRadialGradient(32,90,2,32,80,40);gr.addColorStop(0,'rgba(255,255,230,1)');gr.addColorStop(0.3,'rgba(255,200,90,.9)');gr.addColorStop(0.7,'rgba(255,90,20,.4)');gr.addColorStop(1,'rgba(255,40,0,0)');
  g.fillStyle=gr;g.beginPath();g.moveTo(32,4);g.bezierCurveTo(60,50,58,120,32,124);g.bezierCurveTo(6,120,4,50,32,4);g.fill();});
flameTex.wrapS=flameTex.wrapT=THREE.ClampToEdgeWrapping;
const PARTS=[];
const pMats={flame:()=>new THREE.SpriteMaterial({map:flameTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}),
  smoke:()=>new THREE.SpriteMaterial({map:smokeTex,color:0x221f1c,depthWrite:false,transparent:true}),
  ember:()=>new THREE.SpriteMaterial({map:glowTex,color:0xffa040,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}),
  ball:()=>new THREE.SpriteMaterial({map:glowTex,color:0xff8a30,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}),
  gsmoke:()=>new THREE.SpriteMaterial({map:smokeTex,color:0x9a9894,depthWrite:false,transparent:true}),
  glass:()=>new THREE.SpriteMaterial({map:glowTex,color:0xd8ecff,depthWrite:false,transparent:true})};
for(const k in pMats)for(let i=0;i<(k==='smoke'?90:k==='flame'?40:k==='ember'?70:k==='gsmoke'?60:k==='glass'?60:30);i++){const s=new THREE.Sprite(pMats[k]());s.visible=false;scene.add(s);PARTS.push({s,k,life:0,max:1,v:new THREE.Vector3(),sz:1,grow:1});}
function emit(k,x,y,z,vx,vy,vz,life,sz,grow){const p=PARTS.find(q=>q.k===k&&q.life<=0);if(!p)return;p.s.position.set(x,y,z);p.v.set(vx,vy,vz);p.max=p.life=life;p.sz=sz;p.grow=grow||1;
  p.s.material.rotation=Math.random()*6.28;p.s.visible=true;p.s.scale.set(sz,sz*(k==='flame'?1.6:1),1);}
function updateParts(dt){for(const p of PARTS){if(p.life<=0)continue;p.life-=dt;const t=1-p.life/p.max;p.s.position.addScaledVector(p.v,dt);
  if(p.k==='flame'){p.v.y+=2.5*dt;const s=p.sz*(1-t*0.7);p.s.scale.set(s,s*1.7,1);p.s.material.opacity=Math.min(1,(1-t)*1.6);}
  else if(p.k==='gsmoke'){p.v.y+=0.12*dt;p.v.multiplyScalar(1-dt*0.8);const s=p.sz*(1+t*p.grow);p.s.scale.set(s,s,1);p.s.material.opacity=(1-t)*0.35;p.s.material.rotation+=dt*0.3;}
  else if(p.k==='glass'){p.v.y-=9.8*dt;if(p.s.position.y<0.02){p.s.position.y=0.02;p.v.set(0,0,0);}p.s.scale.setScalar(p.sz);p.s.material.opacity=Math.min(1,(1-t)*2)*(0.6+0.4*Math.sin(G.time*40+p.max*20));}
  else if(p.k==='smoke'){p.v.y+=0.35*dt;p.v.x+=0.3*dt;const s=p.sz*(1+t*p.grow);p.s.scale.set(s,s,1);p.s.material.opacity=Math.sin(Math.min(1,t*3)*Math.PI/2)*(1-t)*0.8;p.s.material.rotation+=dt*0.2;}
  else if(p.k==='ember'){p.v.y+=(p.grow<0?-9.8:0.6)*dt;p.v.x+=Math.sin(G.time*5+p.max*9)*dt;p.s.scale.setScalar(p.sz*(1-t*0.6));p.s.material.opacity=1-t;}
  else{const s=p.sz*(0.4+t*p.grow);p.s.scale.set(s,s,1);p.s.material.opacity=(1-t)*(1-t);}
  if(p.life<=0)p.s.visible=false;}}
// flame billboard shader: turbulent noise scrolls upward through a flame silhouette, coloured white-yellow at the core to deep red at the tips
const FIRE_T={value:0};
const FLAME_VS=`varying vec2 vUv;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(0.0,0.0,0.0,1.0);vec2 sc=vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));mv.xy+=position.xy*sc;gl_Position=projectionMatrix*mv;}`;
const FLAME_FS=`uniform float uT;uniform float uSeed;uniform float uInt;varying vec2 vUv;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*n2(p);p=p*2.07+vec2(1.7,9.2);a*=0.5;}return v;}
vec3 ramp(float t){vec3 a=mix(vec3(0.45,0.03,0.0),vec3(1.0,0.32,0.02),smoothstep(0.0,0.4,t));vec3 b=mix(vec3(1.0,0.62,0.12),vec3(1.0,0.95,0.7),smoothstep(0.72,1.0,t));return mix(a,b,smoothstep(0.38,0.75,t));}
void main(){vec2 uv=vUv;float t=uT*1.25+uSeed*7.0;
  float n1=fbm(vec2(uv.x*2.6+uSeed,uv.y*1.8-t*1.9));float nn=fbm(vec2(uv.x*6.0+3.1+uSeed,uv.y*4.2-t*3.3));
  float x=(uv.x-0.5)*2.0+(n1-0.5)*1.1*uv.y;float wdt=mix(0.92,0.12,pow(uv.y,0.85));
  float edge=1.0-smoothstep(wdt*0.45,wdt,abs(x));
  float f=edge*(1.15-uv.y)*1.45+(nn-0.5)*1.0*uv.y-uv.y*0.32;f*=smoothstep(0.0,0.1,uv.y);f=clamp(f,0.0,1.0);
  float a=smoothstep(0.08,0.5,f)*uInt*0.85;gl_FragColor=vec4(ramp(f*0.92)*1.15,a);}`;
const flameGeo=new THREE.PlaneGeometry(1,1);flameGeo.translate(0,0.5,0);
function makeFlame(seed,int){const m=new THREE.Mesh(flameGeo,new THREE.ShaderMaterial({uniforms:{uT:FIRE_T,uSeed:{value:seed===undefined?Math.random()*10:seed},uInt:{value:int===undefined?1:int}},
  vertexShader:FLAME_VS,fragmentShader:FLAME_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));m.frustumCulled=false;m.renderOrder=3;return m;}
// spark streaks (glowing shards flying out of fires and explosions)
const SPK_N=320,spkPos=new Float32Array(SPK_N*6),spkCol=new Float32Array(SPK_N*6),SPK=[];
for(let i=0;i<SPK_N;i++)SPK.push({p:new THREE.Vector3(),v:new THREE.Vector3(),life:0,max:1});
const spkGeo=new THREE.BufferGeometry();spkGeo.setAttribute('position',new THREE.BufferAttribute(spkPos,3));spkGeo.setAttribute('color',new THREE.BufferAttribute(spkCol,3));
const sparkLines=new THREE.LineSegments(spkGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));sparkLines.frustumCulled=false;scene.add(sparkLines);
let spkI=0;function spark2(x,y,z,vx,vy,vz,life){const s=SPK[spkI++%SPK_N];s.p.set(x,y,z);s.v.set(vx,vy,vz);s.max=s.life=life;}
function updateSparks(dt){for(let i=0;i<SPK_N;i++){const s=SPK[i],k=i*6;if(s.life>0){s.life-=dt;s.v.y-=7*dt;s.v.multiplyScalar(1-dt*0.6);s.p.addScaledVector(s.v,dt);if(s.p.y<0.02){s.p.y=0.02;s.v.y*=-0.3;s.v.x*=0.5;s.v.z*=0.5;}
    const f=Math.max(0,s.life/s.max);spkPos[k]=s.p.x;spkPos[k+1]=s.p.y;spkPos[k+2]=s.p.z;spkPos[k+3]=s.p.x-s.v.x*0.035;spkPos[k+4]=s.p.y-s.v.y*0.035;spkPos[k+5]=s.p.z-s.v.z*0.035;
    for(let q=0;q<2;q++){spkCol[k+q*3]=3.2*f;spkCol[k+q*3+1]=(1.2+0.8*f)*f;spkCol[k+q*3+2]=0.35*f*f;}}
  else if(spkCol[k]!==0){for(let q=0;q<6;q++)spkCol[k+q]=0;}}
  spkGeo.attributes.position.needsUpdate=true;spkGeo.attributes.color.needsUpdate=true;}
// fire sources: each one is a cluster of shader flames plus smoke, embers, sparks and real light
const FIRES=[];const fireLights=[0,1,2].map(()=>{const L=new THREE.PointLight(0xff7a2a,0,13,1.7);scene.add(L);return L;});
function addFire(x,y,z,r,life,strength){const f={x,y,z,r,life,strength:strength||1,acc:0,fl:[]};
  const n=life===Infinity?3:4+Math.round(r*3);
  for(let i=0;i<n;i++){const m=makeFlame();const a=Math.random()*6.28,rr=Math.sqrt(Math.random())*r*0.8;m.position.set(x+Math.cos(a)*rr,y,z+Math.sin(a)*rr);
    const big=1-rr/(r+0.01)*0.5;const h=(life===Infinity?0.9:1.2+Math.random()*1.4)*big*(0.7+r*0.35),w=h*(0.55+Math.random()*0.2);m.scale.set(w,h,1);m.userData={w,h,ph:Math.random()*6};scene.add(m);f.fl.push(m);}
  FIRES.push(f);return f;}
function killFire(f){f.fl.forEach(m=>{scene.remove(m);m.material.dispose();});}
function updateFires(dt){
  for(let i=FIRES.length-1;i>=0;i--){const f=FIRES[i];if(f.life!==Infinity){f.life-=dt;if(f.life<=0){killFire(f);FIRES.splice(i,1);continue;}}
    const k=f.life===Infinity?1:Math.min(1,f.life/2.5);
    for(const m of f.fl){const u=m.userData;const fl=1+0.18*Math.sin(G.time*(9+u.ph)+u.ph)+0.1*Math.sin(G.time*23+u.ph*3);m.scale.set(u.w*(0.9+0.1*fl),u.h*fl*(0.4+0.6*k),1);m.material.uniforms.uInt.value=k*f.strength;}
    f.acc+=dt*10*f.strength*k;
    while(f.acc>1){f.acc-=1;const a=Math.random()*6.28,rr=Math.random()*f.r;
      if(Math.random()<0.35)emit('smoke',f.x+Math.cos(a)*rr,f.y+1.2,f.z+Math.sin(a)*rr,(Math.random()-.5)*0.3,1.1+Math.random(),(Math.random()-.5)*0.3,3+Math.random()*2,0.9+f.r*0.5,3);
      if(Math.random()<0.4)emit('ember',f.x+Math.cos(a)*rr,f.y+0.6,f.z+Math.sin(a)*rr,(Math.random()-.5)*1.2,2+Math.random()*2.5,(Math.random()-.5)*1.2,1.2+Math.random(),0.06);
      if(Math.random()<0.25)spark2(f.x+Math.cos(a)*rr,f.y+0.4,f.z+Math.sin(a)*rr,(Math.random()-.5)*2,2+Math.random()*3,(Math.random()-.5)*2,0.5+Math.random()*0.5);}
    if(f.life!==Infinity){for(const e of enemies){if(e.dead||Math.abs(e.y-f.y)>1)continue;if(Math.hypot(e.x-f.x,e.z-f.z)<f.r+0.3){if(e.burn<=0)e.burnPanic=1.5;e.burn=Math.max(e.burn,6);}}
      if(!P.dying&&Math.hypot(P.x-f.x,P.z-f.z)<f.r+0.2&&Math.abs(P.y-f.y)<1)igniteHero();}}
  const near=FIRES.slice().sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
  fireLights.forEach((L,i)=>{const f=near[i];if(!f){L.intensity=0;return;}L.position.set(f.x,f.y+1.3,f.z);L.intensity=(1.4+Math.random()*0.6)*f.strength*(f.life===Infinity?1:Math.min(1,f.life/2.5));});
}
// fireballs: turbulent noise spheres that roll outward and upward, burning from white to orange to dark red
const FB_VS=`uniform float uT;uniform float uSeed;varying float vN;varying vec3 vNr;varying vec3 vV;`+NOISE_GLSL+`
void main(){vec3 d=normalize(position);float n=vn3(d*2.6+vec3(0.0,-uT*1.6,0.0)+uSeed)*0.6+vn3(d*6.0+vec3(uT*0.7,-uT*2.4,0.0)+uSeed*2.0)*0.4;vN=n;
  vec3 p=position*(0.75+n*0.6);vec4 mv=modelViewMatrix*vec4(p,1.0);vV=-mv.xyz;vNr=normalMatrix*normal;gl_Position=projectionMatrix*mv;}`;
const FB_FS=`uniform float uLife;varying float vN;varying vec3 vNr;varying vec3 vV;
vec3 ramp(float t){vec3 a=mix(vec3(0.3,0.02,0.0),vec3(1.0,0.3,0.02),smoothstep(0.0,0.4,t));vec3 b=mix(vec3(1.0,0.6,0.1),vec3(1.0,0.97,0.8),smoothstep(0.72,1.0,t));return mix(a,b,smoothstep(0.38,0.75,t));}
void main(){float fr=abs(dot(normalize(vNr),normalize(vV)));float heat=clamp(1.3-uLife*1.5+(vN-0.5)*1.3+(fr-0.5)*0.5,0.0,1.0);
  float a=smoothstep(0.06,0.4,heat)*(1.0-smoothstep(0.65,1.0,uLife))*0.85;gl_FragColor=vec4(ramp(heat*0.9)*(1.35-uLife*0.5),a);}`;
const fbGeo=new THREE.IcosahedronGeometry(1,3);const FBALLS=[];
for(let i=0;i<7;i++){const m=new THREE.Mesh(fbGeo,new THREE.ShaderMaterial({uniforms:{uT:FIRE_T,uSeed:{value:Math.random()*20},uLife:{value:1}},vertexShader:FB_VS,fragmentShader:FB_FS,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  m.visible=false;m.renderOrder=4;scene.add(m);FBALLS.push({m,life:0,max:1,v:new THREE.Vector3(),s0:1,s1:3});}
const TFL=[];for(let i=0;i<16;i++){const m=makeFlame();m.visible=false;scene.add(m);TFL.push({m,life:0,max:1,w:1,h:2,v:new THREE.Vector3()});}
function updateBlasts(dt){for(const b of FBALLS){if(b.life<=0)continue;b.life-=dt;const t=1-b.life/b.max;b.m.position.addScaledVector(b.v,dt);b.v.multiplyScalar(1-dt*1.8);b.v.y+=1.2*dt;
    b.m.scale.setScalar(lerp(b.s0,b.s1,1-Math.pow(1-t,2.2)));b.m.material.uniforms.uLife.value=t;if(b.life<=0)b.m.visible=false;}
  for(const f of TFL){if(f.life<=0)continue;f.life-=dt;const t=1-f.life/f.max;f.m.position.addScaledVector(f.v,dt);f.v.multiplyScalar(1-dt*2);f.m.scale.set(f.w*(1+t*0.4),f.h*(1+t*0.6)*(1-t*0.5),1);
    f.m.material.uniforms.uInt.value=(1-t)*(1-t)*1.3;if(f.life<=0)f.m.visible=false;}}
// explosive red barrels
const barrelGeo=mergeParts([P_(new THREE.CylinderGeometry(0.3,0.3,0.9,18),M(0,0.45,0),[0.62,0.07,0.05]),P_(new THREE.TorusGeometry(0.3,0.02,6,18),M(0,0.2,0,Math.PI/2,0,0),[0.35,0.04,0.03]),
  P_(new THREE.TorusGeometry(0.3,0.02,6,18),M(0,0.7,0,Math.PI/2,0,0),[0.35,0.04,0.03]),P_(new THREE.BoxGeometry(0.3,0.22,0.02),M(0,0.48,-0.3),[0.9,0.75,0.1]),P_(new THREE.CylinderGeometry(0.06,0.06,0.03,10),M(0.12,0.91,0),[0.3,0.3,0.3])]);
const drumGeo=mergeParts([P_(new THREE.CylinderGeometry(0.3,0.3,0.9,18,1,true),M(0,0.45,0),[0.2,0.16,0.13]),P_(new THREE.CylinderGeometry(0.29,0.29,0.05,18),M(0,0.75,0),[0.06,0.05,0.04])]);
const barrelMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.45,metalness:0.4,side:THREE.DoubleSide});
const BARRELS=[];
[[-8,-17],[-7.3,-17.5],[3,-15],[21,-1],[-21,2],[-3,18],[ -22,-20],[14,10],
 [-33,24],[-32.4,24.7],[33,-12],[30,40],[-40,-33],[10,33],[-12,-33],[44,10],[-44,-8],[55,46],[-60,0],[0,-44],[-24,44],[40,-44]].forEach(([x,z])=>{
  const m=new THREE.Mesh(barrelGeo,barrelMat);m.position.set(x,0,z);m.rotation.y=Math.random()*6;m.castShadow=true;scene.add(m);
  const b={m,x,z,hp:3,state:0,t:0,col:addCol(x,z,0.32,0.32,0.95)};m.userData.barrel=b;BARRELS.push(b);});
[[-36,-36],[36,36],[-36,40],[36,-36],[0,30],[-50,33.5],[60,-33]].forEach(([x,z])=>{const m=new THREE.Mesh(drumGeo,barrelMat);m.position.set(x,0,z);m.castShadow=true;scene.add(m);addCol(x,z,0.32,0.32,0.95);
if(WATER.length)for(const b of BARRELS.slice())if(inWater(b.x,b.z,1.2)||colliders.some(c=>c!==b.col&&!c.off&&Math.abs(b.x-c.x)<c.hw+0.4&&Math.abs(b.z-c.z)<c.hd+0.4)){scene.remove(b.m);b.col.off=true;BARRELS.splice(BARRELS.indexOf(b),1);}
  addFire(x,0.72,z,0.22,Infinity,0.9);});
const scorchTex=canvasTex(128,128,g=>{const gr=g.createRadialGradient(64,64,4,64,64,62);gr.addColorStop(0,'rgba(0,0,0,.9)');gr.addColorStop(0.6,'rgba(10,8,6,.6)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);});
const scorches=[];for(let i=0;i<10;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:scorchTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);scorches.push(m);}
let scorchI=0;
const debris=[];const debGeo=new THREE.BoxGeometry(0.12,0.04,0.09);for(let i=0;i<24;i++){const m=new THREE.Mesh(debGeo,new THREE.MeshStandardMaterial({color:0x3a1a12,roughness:0.6,metalness:0.4,emissive:0xff5010,emissiveIntensity:1}));m.visible=false;scene.add(m);debris.push({m,v:new THREE.Vector3(),life:0,spin:0});}
const boomLight=new THREE.PointLight(0xff8a30,0,34,1.5);scene.add(boomLight);
function boomSound(dist){if(!AC)return;const v=clamp(1.2-dist/40,0.15,1);noise(1.6,1800,50,0.8*v);tone(70,22,1.0,0.75*v,'sine');noise(0.5,4000,500,0.3*v,'highpass',0.05);noise(2.2,900,200,0.25*v,'bandpass',0.3);}
function hitBarrel(b,dmg){if(b.state>0)return;b.hp-=dmg;spark(new THREE.Vector3(b.x,0.6,b.z),0xffd080,0.3);if(b.hp<=0){b.state=1;b.t=0.12+Math.random()*0.1;}}
function explode(x,y,z,opt){opt=opt||{};
  FBALLS.forEach((b,i)=>{if(i>4)return;b.m.position.set(x+(Math.random()-.5)*0.8,y+0.6+Math.random()*0.5,z+(Math.random()-.5)*0.8);b.v.set((Math.random()-.5)*5,3+Math.random()*4,(Math.random()-.5)*5);
    b.max=b.life=0.9+Math.random()*0.6;b.s0=0.4;b.s1=2.2+Math.random()*1.6;b.m.material.uniforms.uSeed.value=Math.random()*20;b.m.visible=true;});
  TFL.forEach(f=>{const a=Math.random()*6.28,rr=Math.random()*1.6;f.m.position.set(x+Math.cos(a)*rr,y,z+Math.sin(a)*rr);f.v.set(Math.cos(a)*2,Math.random()*1.5,Math.sin(a)*2);
    f.h=2+Math.random()*3;f.w=f.h*0.6;f.max=f.life=0.9+Math.random()*0.8;f.m.visible=true;});
  for(let i=0;i<120;i++){const a=Math.random()*6.28,el=Math.random()*1.3,sp=5+Math.random()*14;spark2(x,y+0.6,z,Math.cos(a)*Math.cos(el)*sp,Math.sin(el)*sp+2,Math.sin(a)*Math.cos(el)*sp,0.5+Math.random()*1.1);}
  for(let i=0;i<24;i++){const a=Math.random()*6.28;emit('smoke',x+Math.cos(a)*1,y+1.4+Math.random(),z+Math.sin(a)*1,Math.cos(a)*1.3,1.6+Math.random()*1.8,Math.sin(a)*1.3,4.5+Math.random()*3.5,2.2+Math.random()*1.5,2.8);}
  for(let i=0;i<30;i++){const a=Math.random()*6.28;emit('ember',x,y+0.8,z,Math.cos(a)*(2+Math.random()*5),3+Math.random()*6,Math.sin(a)*(2+Math.random()*5),1+Math.random()*1.5,0.08,i%3?1:-1);}
  for(const d of debris){if(d.life>0)continue;if(Math.random()<0.5){const a=Math.random()*6.28;d.m.position.set(x,y+0.5,z);d.v.set(Math.cos(a)*(3+Math.random()*5),4+Math.random()*6,Math.sin(a)*(3+Math.random()*5));d.life=4;d.spin=(Math.random()-.5)*20;d.m.visible=true;d.m.material.emissiveIntensity=1.6;}}
  boomLight.position.set(x,y+1.5,z);boomLight.intensity=11;
  const sc=scorches[scorchI++%scorches.length];sc.position.set(x,y+0.02,z);sc.scale.set(4.5,4.5,1);sc.visible=true;
  if(opt.fire!==false)addFire(x,y,z,1.7,8+Math.random()*3,1.2);
  const pd=Math.hypot(P.x-x,P.y-y,P.z-z);G.shake=Math.max(G.shake,clamp(0.7-pd/40,0.05,0.7));atPos(x,y,z,()=>boomSound(pd));buzz(pd<15?140:40);
  if(pd<5&&!P.dying){hurtPlayer(Math.round(28*(1-pd/5)));if(pd<2.6)igniteHero();if(!P.car&&!P.dying&&!CH.god||(!P.car&&CH.god))launchHero(x,z,pd);}
  for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-x,e.y-y,e.z-z);if(d<6){const dir=new THREE.Vector3(e.x-x,0,e.z-z).normalize();
    if(d<4.8){e.burn=7;e.burnPanic=1.5;}damageEnemy(e,Math.ceil(14*(1-d/6.5)),false,dir);e.stagger=0.8;e.x+=dir.x*(6-d)*0.25;e.z+=dir.z*(6-d)*0.25;if(e.dead&&d<4.8)e.burn=5;}}
  for(const b of BARRELS)if(b.state===0&&Math.hypot(b.x-x,b.z-z)<4.2){b.state=1;b.t=0.2+Math.random()*0.35;}
  for(const car of CARLIST){const d=Math.hypot(car.x-x,car.z-z);if(d<5.5&&car.state<3){car.hp-=Math.ceil(30*(1-d/6));if(car.alarm<=0&&!car.wreck)car.alarm=9;if(car.hp<car.max*0.2&&car.state<2){car.state=2;const f=carFront(car,1.0);car.fire=addFire(f.x,0.95,f.z,0.45,Infinity,0.9);}if(car.hp<=0){car.state=3;car.boomT=0.5+Math.random()*0.6;}}}
  emote(-0.1,0.4);}
function updateBarrels(dt){for(const b of BARRELS){if(b.state===1){b.t-=dt;if(Math.random()<0.7)spark2(b.x,0.95,b.z,(Math.random()-.5)*2,3+Math.random()*3,(Math.random()-.5)*2,0.4);if(b.t<=0){b.state=2;b.m.visible=false;b.col.off=true;explode(b.x,0,b.z);}}}
  for(const d of debris){if(d.life<=0)continue;d.life-=dt;d.v.y-=9.8*dt;d.m.position.addScaledVector(d.v,dt);d.m.rotation.x+=d.spin*dt;d.m.rotation.y+=d.spin*0.7*dt;d.m.material.emissiveIntensity=Math.max(0,d.m.material.emissiveIntensity-dt*0.6);
    if(d.m.position.y<0.02){d.m.position.y=0.02;d.v.y=Math.abs(d.v.y)*0.3;d.v.x*=0.5;d.v.z*=0.5;d.spin*=0.5;}if(d.life<=0)d.m.visible=false;}
  boomLight.intensity=Math.max(0,boomLight.intensity-dt*14);updateSparks(dt);updateBlasts(dt);FIRE_T.value=G.time;BURN_T.value=G.time;}
function resetBarrels(){for(const b of BARRELS){b.hp=3;b.state=0;b.m.visible=true;b.col.off=false;}for(let i=FIRES.length-1;i>=0;i--)if(FIRES[i].life!==Infinity){killFire(FIRES[i]);FIRES.splice(i,1);}scorches.forEach(s=>s.visible=false);}
// characters on fire: flames ride on the skeleton (torso, head, arms, legs) while the skin chars and glows
function ensureFlames(r){if(r.flames)return r.flames;const spots=[[r.torso,0,0.2,0,0.55,0.9],[r.head,0,0.12,0,0.34,0.55],[r.armL.el,0,-0.08,0,0.26,0.5],[r.armR.el,0,-0.08,0,0.26,0.5],[r.legL.kn,0,-0.12,0,0.3,0.55],[r.legR.kn,0,-0.12,0,0.3,0.55]];
  r.flames=spots.map(([b,x,y,z,w,h])=>{const m=makeFlame(undefined,0);m.position.set(x,y,z);m.scale.set(w,h,1);m.userData={w,h,ph:Math.random()*6};m.visible=false;b.add(m);return m;});return r.flames;}
function setFlames(r,k){const fl=ensureFlames(r);for(const m of fl){m.visible=k>0.02;const u=m.userData;const f=1+0.2*Math.sin(G.time*(11+u.ph)+u.ph);m.scale.set(u.w,u.h*f*(0.5+0.5*k),1);m.material.uniforms.uInt.value=k;}}
function igniteHero(){if(P.burn<=0){say('fire',1,true);EMO.hurtT=0.5;}P.burn=Math.max(P.burn,4.2);}

/* ================= gun effects: layered muzzle flash, barrel smoke, bullet holes, impacts, vehicle damage ================= */
const petalTex=canvasTex(128,32,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(255,255,235,1)');gr.addColorStop(0.25,'rgba(255,215,120,.95)');gr.addColorStop(0.7,'rgba(255,130,40,.5)');gr.addColorStop(1,'rgba(255,90,20,0)');
  g.fillStyle=gr;g.beginPath();g.moveTo(0,h/2-11);g.quadraticCurveTo(w*0.35,h/2-9,w,h/2);g.quadraticCurveTo(w*0.35,h/2+9,0,h/2+11);g.fill();});
petalTex.wrapS=petalTex.wrapT=THREE.ClampToEdgeWrapping;
const MF=new THREE.Group();MF.visible=false;scene.add(MF);
const mfMat=new THREE.MeshBasicMaterial({map:petalTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});mfMat.color.setRGB(2.2,1.7,1.2);
const mfGeo=new THREE.PlaneGeometry(1,0.34);mfGeo.translate(0.5,0,0);
for(let i=0;i<3;i++){const p=new THREE.Mesh(mfGeo,mfMat);p.rotation.x=i*Math.PI/3;p.renderOrder=5;MF.add(p);}
const mfSide=[];for(const s of[-1,1]){const p=new THREE.Mesh(mfGeo,mfMat);p.scale.set(0.35,0.7,1);p.position.x=0.06;p.rotation.z=s*Math.PI/2;p.renderOrder=5;MF.add(p);mfSide.push(p);}
const MF2=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffb060,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:0.8}));MF2.visible=false;scene.add(MF2);
let mfT=0;const _mq=new THREE.Quaternion(),_mf=new THREE.Vector3(),_X=new THREE.Vector3(1,0,0);
function muzzleFx(pos,quat,W){_mf.set(0,0,-1).applyQuaternion(quat).normalize();MF.position.copy(pos);MF.quaternion.setFromUnitVectors(_X,_mf);MF.rotateX(Math.random()*Math.PI);
  const big=W.recoil>1.5?1.6:1;const L=(0.3+Math.random()*0.25)*big;MF.scale.set(L,L*(0.8+Math.random()*0.5),L*(0.8+Math.random()*0.5));mfSide.forEach(p=>p.visible=W.sound==='rifle');MF.visible=true;mfT=0.035+Math.random()*0.015;
  flash.position.copy(pos).addScaledVector(_mf,0.04);const fs=(0.22+Math.random()*0.2)*big;flash.scale.set(fs,fs,1);flash.material.rotation=Math.random()*6.28;flash.visible=true;flash.userData.t=mfT;
  MF2.position.copy(pos);MF2.scale.setScalar(0.9*big);MF2.visible=true;
  muzzleLight.position.copy(pos);muzzleLight.color.setHSL(0.08+Math.random()*0.03,1,0.6);muzzleLight.intensity=4.5*big;muzzleLight.distance=12;
  for(let i=0;i<(W.sound==='shotgun'?6:2);i++)spark2(pos.x,pos.y,pos.z,_mf.x*8+(Math.random()-.5)*3,_mf.y*8+(Math.random()-.5)*3+1,_mf.z*8+(Math.random()-.5)*3,0.15+Math.random()*0.15);
  emit('gsmoke',pos.x+_mf.x*0.1,pos.y,pos.z+_mf.z*0.1,_mf.x*0.6+(Math.random()-.5)*0.2,0.25+Math.random()*0.2,_mf.z*0.6+(Math.random()-.5)*0.2,0.9+Math.random()*0.6,0.12*big,4);
  P.heat=Math.min(1,(P.heat||0)+0.06*big);}
function updateMuzzle(dt){if(mfT>0){mfT-=dt;if(mfT<=0){MF.visible=false;MF2.visible=false;}}
  P.heat=Math.max(0,(P.heat||0)-dt*0.25);
  if(P.heat>0.35&&Math.random()<dt*P.heat*12){const m=P.fpv>0.5?vmMuzzle:hero.muzzle;m.getWorldPosition(_a);emit('gsmoke',_a.x,_a.y+0.02,_a.z,(Math.random()-.5)*0.05,0.3+Math.random()*0.2,(Math.random()-.5)*0.05,1.2+Math.random(),0.05,5);}}
// bullet holes
const holeTex2=canvasTex(64,64,g=>{const gr=g.createRadialGradient(32,32,1,32,32,30);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(0.18,'rgba(15,12,10,1)');gr.addColorStop(0.3,'rgba(60,55,50,.7)');gr.addColorStop(0.55,'rgba(40,36,32,.25)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
  g.strokeStyle='rgba(20,18,16,.55)';g.lineWidth=1;for(let i=0;i<6;i++){const a=Math.random()*6.28;g.beginPath();g.moveTo(32,32);g.lineTo(32+Math.cos(a)*(10+Math.random()*16),32+Math.sin(a)*(10+Math.random()*16));g.stroke();}});
const metalHoleTex=canvasTex(64,64,g=>{const gr=g.createRadialGradient(32,32,1,32,32,26);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(0.25,'rgba(10,10,10,1)');gr.addColorStop(0.36,'rgba(200,200,205,.9)');gr.addColorStop(0.5,'rgba(120,120,125,.4)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
const HOLES=[];const holeGeo=new THREE.PlaneGeometry(1,1);const holeMatC=new THREE.MeshBasicMaterial({map:holeTex2,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
const holeMatM=new THREE.MeshBasicMaterial({map:metalHoleTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
for(let i=0;i<70;i++){const m=new THREE.Mesh(holeGeo,holeMatC);m.visible=false;scene.add(m);HOLES.push(m);}let holeI=0;
const _hn=new THREE.Vector3(),_hm3=new THREE.Matrix3();
function bulletHole(hit,metal){if(!hit.face)return null;_hm3.getNormalMatrix(hit.object.matrixWorld);_hn.copy(hit.face.normal).applyMatrix3(_hm3).normalize();
  const m=HOLES[holeI++%HOLES.length];m.material=metal?holeMatM:holeMatC;m.position.copy(hit.point).addScaledVector(_hn,0.012);m.lookAt(hit.point.clone().add(_hn));m.rotateZ(Math.random()*6.28);
  const s=metal?0.07:0.11+Math.random()*0.06;m.scale.set(s,s,1);m.visible=true;return _hn;}
// glass, chips and dust
function glassBurst(p,n){for(let i=0;i<14;i++)emit('glass',p.x,p.y,p.z,n.x*2+(Math.random()-.5)*3,1+Math.random()*2,n.z*2+(Math.random()-.5)*3,1.2+Math.random()*0.8,0.035+Math.random()*0.03,-1);
  if(AC){for(let i=0;i<5;i++)tone(2200+Math.random()*3000,1800+Math.random()*2000,0.05+Math.random()*0.08,0.06,'triangle',i*0.03);noise(0.2,6000,2500,0.15,'highpass');}}
function impactFx(hit,kind){const p=hit.point;const n=bulletHole(hit,kind==='metal')||new THREE.Vector3(0,1,0);
  if(kind==='metal'){for(let i=0;i<7;i++)spark2(p.x,p.y,p.z,n.x*4+(Math.random()-.5)*5,n.y*4+Math.random()*4,n.z*4+(Math.random()-.5)*5,0.25+Math.random()*0.35);
    spark(p,0xfff0c0,0.22);if(AC)tone(1800+Math.random()*900,900,0.06,0.07,'square');}
  else{emit('gsmoke',p.x+n.x*0.05,p.y+n.y*0.05,p.z+n.z*0.05,n.x*0.8,n.y*0.8+0.2,n.z*0.8,0.8+Math.random()*0.5,0.18,3);for(let i=0;i<3;i++)spark2(p.x,p.y,p.z,n.x*3+(Math.random()-.5)*3,n.y*3+Math.random()*2,n.z*3+(Math.random()-.5)*3,0.15);spark(p,0xffd8a0,0.18);}}
// vehicles: holes, broken glass, car alarms, smoking engines, engine fires and explosions
function carHit(car,dmg,hit){if(car.state>=3)return;if(car.alarm<=0&&!car.wreck){car.alarm=9;car.alarmT=0;alertNoise(car.x,car.z,32);}
  const lp=car.m.worldToLocal(hit.point.clone());const glass=lp.y>0.95&&lp.y<1.48&&Math.abs(lp.z-0.25)<1.1&&!car.wreck;
  if(glass){const n=bulletHole(hit,false)||new THREE.Vector3(0,1,0);glassBurst(hit.point,n);}else impactFx(hit,'metal');
  car.hp-=dmg;if(car.hp<car.max*0.5&&car.state<1)car.state=1;if(car.hp<car.max*0.2&&car.state<2){car.state=2;const f=carFront(car,1.0);car.fire=addFire(f.x,0.95,f.z,0.45,Infinity,0.9);}
  if(car.hp<=0&&car.state<3){car.state=3;car.boomT=0.6+Math.random()*0.5;}}
function carFront(car,d){return {x:car.x-Math.sin(car.ry)*1.6*d,z:car.z-Math.cos(car.ry)*1.6*d};}
let carBlink=0;
function updateCars(dt){carBlink+=dt;for(const car of CARLIST){
  if(car.alarm>0){car.alarm-=dt;car.alarmT-=dt;if(car.alarmT<=0){car.alarmT=0.42;const d=Math.hypot(car.x-P.x,car.z-P.z);if(AC&&d<45){const v=clamp(1-d/45,0,1)*0.12;tone(1250,1250,0.18,v,'square');tone(950,950,0.16,v,'square',0.21);}
      if(Math.random()<0.15)alertNoise(car.x,car.z,24);}}
  if(car.state>=1&&car.state<4){car.smokeT-=dt;if(car.smokeT<=0){car.smokeT=car.state>=2?0.08:0.18;const f=carFront(car,1.0);emit('smoke',f.x+(Math.random()-.5)*0.6,1.0,f.z+(Math.random()-.5)*0.6,(Math.random()-.5)*0.2,0.9+Math.random()*0.5,(Math.random()-.5)*0.2,3+Math.random()*2,0.6+(car.state>=2?0.4:0),3);}}
  if(car.state===3){car.boomT-=dt;if(car.boomT<=0){car.state=4;carExplode(car);}}
  if(car.jump>0){car.jump-=dt;const t=1-car.jump/1.1;car.m.position.y=Math.max(0,Math.sin(t*Math.PI)*1.1);car.m.rotation.z=(car.wreck?0.03:0)+Math.sin(t*Math.PI)*0.25;car.m.rotation.x=Math.sin(t*Math.PI)*0.12;if(car.jump<=0){car.m.position.y=0;car.m.rotation.z=0.06;car.m.rotation.x=0;}}}}
function carExplode(car){if(car.fire){killFire(car.fire);const i=FIRES.indexOf(car.fire);if(i>=0)FIRES.splice(i,1);car.fire=null;}
  const mat=carMat.clone();mat.color.setRGB(0.13,0.12,0.11);mat.roughness=0.9;mat.metalness=0.2;car.m.material=mat;car.jump=1.1;car.alarm=0;
  explode(car.x,0.4,car.z);FBALLS.forEach((b,i)=>{if(i<5)return;b.m.position.set(car.x,1.4,car.z);b.v.set(0,5,0);b.max=b.life=1.3;b.s0=0.6;b.s1=4.2;b.m.visible=true;});
  addFire(car.x,0.9,car.z,1.1,24,1.1);}
function resetCars(){for(const car of CARLIST){if(car.fire){killFire(car.fire);const i=FIRES.indexOf(car.fire);if(i>=0)FIRES.splice(i,1);car.fire=null;}
  car.hp=car.max;car.state=0;car.alarm=0;car.jump=0;car.m.material=carMat;car.m.position.y=0;car.m.rotation.x=0;car.m.rotation.z=car.wreck?0.03:0;
    if(car.drive){car.x=car.x0;car.z=car.z0;car.ry=car.ry0;car.speed=0;car.m.position.set(car.x,0,car.z);car.m.rotation.y=car.ry;const side=Math.abs(Math.sin(car.ry))>0.7;Object.assign(car.col,{x:car.x,z:car.z,hw:side?2.25:0.95,hd:side?0.95:2.25,off:false});}}
  HOLES.forEach(h=>h.visible=false);}

/* ================= shooting ================= */
const ray=new THREE.Raycaster();ray.far=80;const ndc=new THREE.Vector2();
const _a=new THREE.Vector3(),_b=new THREE.Vector3();
function shoot(){const W=GUNS[P.weapon];if(W.melee){meleeSwing(W);return;}if(W.weld){if(!CH.ammo)P.ammo--;weldFire(W);return;}if(!CH.ammo)P.ammo--;emote(0,0.025);alertNoise(P.x,P.z,W.recoil>1.5?34:28);P.fireCD=W.cd;P.aimT=0.9;P.recoil=1;G.shake=Math.max(G.shake,0.02*W.recoil);sfx[W.sound]();buzz(W.recoil>1.5?22:10);if(W.rocket){launchRocket(W);drawHud();return;}if(P.weapon==='shotgun'){P.pumpT=0.55;setTimeout(()=>{noise(0.06,2600,900,0.22,'bandpass');setTimeout(()=>noise(0.07,2000,700,0.24,'bandpass'),140);},170);}
  const fp=P.fpv>0.5;const mz=fp?vmMuzzle:hero.muzzle;mz.updateWorldMatrix(true,false);mz.getWorldPosition(_a);mz.getWorldQuaternion(_mq);muzzleFx(_a,_mq,W);if(W.fire){camera.getWorldDirection(_b);for(let q=0;q<26;q++){const s=4+Math.random()*9;spark2(_a.x,_a.y,_a.z,_b.x*s+(Math.random()-.5)*2,_b.y*s+(Math.random()-.5)*2+0.5,_b.z*s+(Math.random()-.5)*2,0.6+Math.random()*0.4);}}
  P.kick=(P.kick||0)+0.018*W.recoil*(fp?1:0.6);P.kickYaw=(P.kickYaw||0)+(Math.random()-.5)*0.012*W.recoil;
  {const rc=W.recoil*(P.steady?0.6:1)*(P.stance==='prone'?0.5:P.stance==='crouch'?0.75:1)*((P.ads||0)>0.5?0.8:1)*(P.vel>2?1.2:1)*(CH.god&&false?0:1);const kind=P.weapon==='rifle'?0.016:P.weapon==='shotgun'?0.03:0.036;
   P.rcP=(P.rcP||0)+kind*rc;P.rcY=(P.rcY||0)+(Math.random()-0.42)*kind*0.45*rc;P.rcT=0.14;}
  camera.updateMatrixWorld();scene.updateMatrixWorld();
  const live=enemies.filter(e=>!e.dead);const liveB=BARRELS.filter(b=>b.state===0);
  const targets=worldMeshes.concat(...live.map(e=>e.hits),liveB.map(b=>b.m));
  const dmgMap=new Map();
  for(let i=0;i<W.pellets;i++){const sp=(W.spread*(P.aimAmt>0.5?0.6:1)*(fp?0.7:1)+(P.vel>2?0.01:0))*(P.breath>0.25?0.3:1)*(P.steady?0.6:1)*(P.stance==='prone'?0.5:P.stance==='crouch'?0.72:1)*(P.air?1.8:1);
    ndc.set((Math.random()-.5)*2*sp/0.5,(Math.random()-.5)*2*sp/0.5);ray.setFromCamera(ndc,camera);
    const hits=ray.intersectObjects(targets,false);let pt=null,en=null,head=false,br=null,dist=1e9,hit=null;
    if(hits.length){hit=hits[0];pt=hit.point;dist=hit.distance;en=hit.object.userData.enemy||null;head=!!hit.object.userData.head;br=hit.object.userData.barrel||null;}
    if(!en&&!br){let best=0.065,bh=null,bp=null,bb=null;const o=ray.ray.origin,dr=ray.ray.direction;
      for(const e of live){e.r.head.getWorldPosition(_b);for(const [px,py,pz,isH,lim] of[[_b.x,_b.y+0.1*e.sc,_b.z,true,0.05],[e.x,e.y+1.15*e.sc,e.z,false,0.075]]){
          const vx=px-o.x,vy=py-o.y,vz=pz-o.z,L=Math.hypot(vx,vy,vz);if(L>dist||L>45)continue;const ang=Math.acos(clamp((vx*dr.x+vy*dr.y+vz*dr.z)/L,-1,1));
          if(ang<lim&&ang<best){best=ang;bh={e,isH,L};bp=new THREE.Vector3(px,py,pz);bb=null;}}}
      for(const b of liveB){const vx=b.x-o.x,vy=0.5-o.y,vz=b.z-o.z,L=Math.hypot(vx,vy,vz);if(L>dist||L>45)continue;const ang=Math.acos(clamp((vx*dr.x+vy*dr.y+vz*dr.z)/L,-1,1));
        if(ang<0.045&&ang<best){best=ang;bb=b;bh=null;bp=new THREE.Vector3(b.x,0.5,b.z);}}
      if(bh){en=bh.e;head=bh.isH;pt=bp;hit=null;}else if(bb){br=bb;pt=bp;hit=null;}}
    if(!pt)pt=ray.ray.at(80,new THREE.Vector3());
    if(i<3)tracer(_a,pt);
    const part=hit&&hit.object.userData.part,side=hit&&hit.object.userData.side;
    if(en){const k=W.dmg*(head?3:part?0.6:1);const cur=dmgMap.get(en)||{d:0,head:false,parts:{}};cur.d+=k;cur.head=cur.head||head;if(part==='leg')cur.parts.leg=(cur.parts.leg||0)+W.dmg;if(part==='arm')cur.parts[side]=(cur.parts[side]||0)+W.dmg;dmgMap.set(en,cur);spark(pt,0x3a0606,0.28,false);
      for(let q=0;q<3;q++)emit('glass',pt.x,pt.y,pt.z,(Math.random()-.5)*2,Math.random()*1.5,(Math.random()-.5)*2,0.5,0.03,-1);if(CH.fireammo||W.fire){en.burn=Math.max(en.burn,5);en.burnPanic=1.2;}}
    else if(br){hitBarrel(br,W.dmg);}
    else if(hit&&hit.object.userData.car){carHit(hit.object.userData.car,W.dmg,hit);}
    else if(hit){impactFx(hit,'concrete');}
    if(CH.boomammo&&i===0&&!en&&(G.boomCD||0)<=0&&pt&&hit){G.boomCD=0.35;explode(pt.x,Math.max(0,pt.y-0.4),pt.z);}}
  dmgMap.forEach((v,en)=>{const d=new THREE.Vector3(en.x-P.x,0,en.z-P.z).normalize();damageEnemy(en,CH.onehit?999:v.d,v.head,d,false,v.parts);});
  if(P.weapon==='rifle'&&!CH.ammo&&P.heat>0.72&&Math.random()<0.07){P.jam=true;sfx.empty();showMsg('Jammed! Press A to clear it',1.8);}
  if(W.eject){_b.set(W.eject[0],W.eject[1],W.eject[2]).applyMatrix4(fp?vmGun.matrixWorld:hero.gun.matrixWorld);const rdir=new THREE.Vector3(Math.cos(P.yaw),0,-Math.sin(P.yaw));ejectCasing(_b,rdir,P.weapon==='shotgun');}
  hud.x.style.setProperty('--s','16px');
  if(P.ammo<=0&&P.reserve>0)setTimeout(()=>{if(G.state==='play')startReload();},W.cd*900);
  else if(P.ammo<=0&&P.weapon!=='rifle'&&P.reserve<=0)setTimeout(()=>{if(G.state==='play'){equip('rifle');showMsg('Out of ammo. Back to the rifle',1.6);}},500);
  drawHud();}

/* ================= pickups ================= */
const crateMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.7});
function labelSprite(text,col){const t=canvasTex(256,64,(g,w,h)=>{g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,8,w,h-16);g.fillStyle=col;g.font='bold 40px Arial';g.textAlign='center';g.fillText(text,w/2,h*0.68);});
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(1.2,0.3,1);return s;}
function spawnPickup(){const kinds=['shotgun','magnum','med','med','nades','rpg'];const kind=kinds[Math.random()*kinds.length|0];let x=0,z=0,ok=false;
  for(let t=0;t<60&&!ok;t++){const a=Math.random()*6.28,r=8+Math.random()*26;x=clamp(P.x+Math.cos(a)*r,-W+4,W-4);z=clamp(P.z+Math.sin(a)*r,-W+4,W-4);ok=!insideCollider(x,z,1.2)&&pickups.every(p=>Math.hypot(p.x-x,p.z-z)>6);}
  if(!ok)return;const g=pivot(x,0,z,scene);const parts=[];
  if(kind==='med'){parts.push(P_(new THREE.BoxGeometry(0.45,0.25,0.32),M(0,0.125,0),[0.85,0.85,0.82]));parts.push(P_(new THREE.BoxGeometry(0.2,0.06,0.02),M(0,0.15,-0.165),[0.75,0.05,0.05]));parts.push(P_(new THREE.BoxGeometry(0.06,0.2,0.02),M(0,0.15,-0.165),[0.75,0.05,0.05]));}
  else{parts.push(P_(new THREE.BoxGeometry(1.0,0.32,0.4),M(0,0.16,0),[0.22,0.26,0.16]));parts.push(P_(new THREE.BoxGeometry(1.02,0.05,0.42),M(0,0.3,0),[0.17,0.2,0.12]));
    parts.push(P_(new THREE.BoxGeometry(0.5,0.08,0.02),M(0,0.16,-0.21),[0.75,0.7,0.5]));}
  const m=new THREE.Mesh(mergeParts(parts),crateMat);m.castShadow=true;g.add(m);
  const col=kind==='med'?'#ff6a6a':'#e8d27a';const lab=labelSprite(kind==='med'?'MEDKIT':kind==='nades'?'GRENADES':GUNS[kind].name.toUpperCase(),col);lab.position.y=0.95;g.add(lab);
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.7,0.82,40),new THREE.MeshBasicMaterial({color:kind==='med'?0xff5050:0xe8d27a,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=0.03;g.add(ring);pickups.push({kind,g,lab,ring,x,z,t:0,life:30});}
function removePickup(p){scene.remove(p.g);const i=pickups.indexOf(p);if(i>=0)pickups.splice(i,1);}
function updatePickups(dt){G.pickupT-=dt;if(G.pickupT<=0){if(pickups.length<2)spawnPickup();G.pickupT=12+Math.random()*6;}
  for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.t+=dt;p.life-=dt;p.lab.position.y=0.95+Math.sin(p.t*2.5)*0.05;p.ring.material.opacity=0.4+0.3*Math.sin(p.t*4);
    if(p.life<4)p.g.visible=Math.sin(p.t*20)>0;if(p.life<=0){removePickup(p);continue;}
    if(Math.hypot(p.x-P.x,p.z-P.z)<1.2&&P.y<0.5){if(p.kind==='med'){if(P.hp>=(P.maxHp||100))continue;P.hp=Math.min(P.maxHp||100,P.hp+35);showMsg('+35 health',1.2);emote(0.3,-0.1);say('med',1,true);if(P.hp>=35)EMO.lowWarned=false;}
      else if(p.kind==='nades'){P.nades=Math.min(6,(P.nades||0)+2);showMsg('+2 grenades',1.2);}
      else{if(P.weapon!==p.kind){INV[P.weapon].ammo=P.ammo;INV[P.weapon].reserve=P.reserve;}equip(p.kind);INV[p.kind]={own:true,ammo:P.ammo,reserve:P.reserve};showMsg('Picked up the '+GUNS[p.kind].name.toLowerCase()+'. D-pad left/right to switch',1.8);emote(0.25,0);say('gun',0.8);}sfx.pickup();buzz(15);drawHud();removePickup(p);}}}

/* ================= hero animation with arm IK ================= */
const DOWN=new THREE.Vector3(0,-1,0);
const _i1=new THREE.Vector3(),_i2=new THREE.Vector3(),_i3=new THREE.Vector3(),_i4=new THREE.Vector3(),_i5=new THREE.Vector3(),_i6=new THREE.Vector3();
const _q1=new THREE.Quaternion(),_q2=new THREE.Quaternion(),_q3=new THREE.Quaternion(),_q4=new THREE.Quaternion();
const SH_R=new THREE.Vector3(0.2,0.47,0),SH_L=new THREE.Vector3(-0.2,0.47,0),POLE_R=new THREE.Vector3(1,-1,0.3).normalize(),POLE_L=new THREE.Vector3(-1,-1.2,0.3).normalize();
const ARM_A=0.3,ARM_B=0.268;
function solveArm(arm,S,T,pole,handQ){
  const d=_i1.subVectors(T,S);let L=d.length();L=clamp(L,0.08,ARM_A+ARM_B-0.003);d.normalize();
  const cosA=clamp((ARM_A*ARM_A+L*L-ARM_B*ARM_B)/(2*ARM_A*L),-1,1),sinA=Math.sqrt(1-cosA*cosA);
  const w=_i2.copy(pole).addScaledVector(d,-pole.dot(d));if(w.lengthSq()<1e-6)w.set(0,-1,0);w.normalize();
  const E=_i3.copy(S).addScaledVector(d,ARM_A*cosA).addScaledVector(w,ARM_A*sinA);
  const dirU=_i4.subVectors(E,S).normalize();const tgt=_i5.copy(S).addScaledVector(d,L);const dirF=_i6.subVectors(tgt,E).normalize();
  _q1.setFromUnitVectors(DOWN,dirU);arm.sh.quaternion.copy(_q1);
  _q2.setFromUnitVectors(DOWN,dirF);arm.el.quaternion.copy(_q3.copy(_q1).invert().multiply(_q2));
  if(handQ)arm.hand.quaternion.copy(_q4.copy(_q2).invert().multiply(handQ));}
const _bm=new THREE.Matrix4();
function pumpOffset(){const t=P.pumpT>0?1-P.pumpT/0.55:1;if(t<=0.28||t>=0.85)return 0;return t<0.55?0.075*Math.sin((t-0.28)/0.27*Math.PI/2):0.075*Math.cos((t-0.55)/0.3*Math.PI/2);}
function basisQ(X,Y,Z,tilt){_bm.makeBasis(new THREE.Vector3(...X),new THREE.Vector3(...Y),new THREE.Vector3(...Z));const q=new THREE.Quaternion().setFromRotationMatrix(_bm);
  if(tilt)q.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),tilt));return q;}
const HB={rifle:{R:basisQ([0,1,0],[0,0,1],[1,0,0],-0.3),L:basisQ([0,0,1],[-1,0,0],[0,-1,0],0.25),wR:[0.03,-0.12,0.15],wL:[-0.055,-0.052,-0.28]},
  rpg:{R:basisQ([0,1,0],[0,0,1],[1,0,0],-0.3),L:basisQ([0,-1,0],[0,0,1],[-1,0,0],-0.3),wR:[0.03,-0.1,0.085],wL:[-0.03,-0.1,-0.085]},
  shotgun:{R:basisQ([0,1,0],[0,0,1],[1,0,0],-0.3),L:basisQ([0,0,1],[-1,0,0],[0,-1,0]),wR:[0.03,-0.085,0.155],wL:[-0.085,-0.07,-0.34]},
  wrench:{R:basisQ([0,1,0],[0,0,1],[1,0,0],-0.3),L:basisQ([0,0,1],[-1,0,0],[0,-1,0],0.25),wR:[0.03,-0.02,0.15],wL:[-0.03,-0.02,-0.08]},
  magnum:{R:basisQ([0,1,0],[0,0,1],[1,0,0],-0.25),L:basisQ([-0.66,-0.75,0],[-0.75,0.66,0],[0,0,-1]),wR:[0.03,-0.075,0.115],wL:[-0.03,-0.088,0.06]},
  weld:{R:basisQ([0,1,0],[0,0,1],[1,0,0],-0.25),L:basisQ([-0.66,-0.75,0],[-0.75,0.66,0],[0,0,-1]),wR:[0.03,-0.075,0.115],wL:[-0.03,-0.07,-0.02]}};
const _gq=new THREE.Quaternion(),_hq=new THREE.Quaternion(),_wt=new THREE.Vector3(),_wl=new THREE.Vector3(),POUCH=new THREE.Vector3(-0.16,0.02,-0.08);
function animateHero0(dt){
  const r0=hero;r0.root.position.set(P.x,P.y,P.z);r0.root.rotation.y=P.yaw;
  for(const n in r0.gunMeshes)r0.gunMeshes[n].visible=!P.climb&&!(P.burn>0)&&!P.dying&&n===P.weapon;r0.root.rotation.x=P.dying?Math.min(1.42,P.dying*P.dying*3.2):0;
  if(P.climb){const ph=P.climbPh;r0.hips.position.set(0,1.04,0.05);r0.hips.rotation.set(0,0,0);r0.torso.rotation.set(-0.05,0,Math.sin(ph)*0.05);r0.head.rotation.set(0.25,0,0);
    r0.legL.hp.rotation.set(0.55+0.45*Math.sin(ph),0,0);r0.legL.kn.rotation.set(-0.9-0.5*Math.max(0,Math.sin(ph)),0,0);r0.legL.ft.rotation.set(0.3,0,0);
    r0.legR.hp.rotation.set(0.55+0.45*Math.sin(ph+Math.PI),0,0);r0.legR.kn.rotation.set(-0.9-0.5*Math.max(0,Math.sin(ph+Math.PI)),0,0);r0.legR.ft.rotation.set(0.3,0,0);
    r0.armL.sh.rotation.set(2.55+0.3*Math.sin(ph+Math.PI),0,0.12);r0.armL.el.rotation.set(0.5,0,0);r0.armL.hand.rotation.set(0,0,0);
    r0.armR.sh.rotation.set(2.55+0.3*Math.sin(ph),0,-0.12);r0.armR.el.rotation.set(0.5,0,0);r0.armR.hand.rotation.set(0,0,0);
    if(r0.fs)animateFace(r0.face,r0.fs,dt,{lid:0.4,brow:0.2,furrow:0.3,mouth:0.1,gazeYaw:0,gazePitch:0.2,blinkMin:2,blinkVar:2});return;}
  const r=hero,speed=Math.hypot(P.vel,P.sv||0),turning=Math.abs(P.lvx||0)>0.5&&speed<0.5;
  const stride=Math.max(clamp(speed/2.6,0,1),turning?0.3:0);
  P.phase+=dt*(P.vel<-0.1?-1:1)*(speed*2.4+(turning?4.5:0));
  const ph=P.phase,run=P.runAmt,aim=P.aimAmt,amp=stride*(0.55+0.45*run);
  P.stepAcc+=dt*(speed*2.4+(turning?4.5:0));if(P.stepAcc>Math.PI){P.stepAcc-=Math.PI;if(stride>0.2&&G.state==='play')sfx.step();}
  const hurt=P.hp<35;const bob=(0.5-0.5*Math.cos(2*ph))*0.06*amp,breathe=Math.sin(G.time*(hurt?3.4:1.7))*(hurt?0.02:0.008)*(1-stride*0.7);
  r.hips.position.y=1.04-0.09*run-0.02*aim+bob+breathe;
  r.hips.rotation.set(0,Math.sin(ph)*0.12*amp,Math.cos(ph)*0.04*amp);
  const tb=0.26*run+0.06*aim,kb=-0.45*run-0.12*aim;
  const legSet=(L,p)=>{L.hp.rotation.x=tb+Math.sin(p)*0.85*amp;L.kn.rotation.x=kb-amp*(0.12+1.2*Math.max(0,Math.cos(p))+0.3*Math.max(0,-Math.sin(p)));L.ft.rotation.x=-(L.hp.rotation.x+L.kn.rotation.x)*0.75;};
  legSet(r.legL,ph);legSet(r.legR,ph+Math.PI);
  if(hurt){r.legL.hp.rotation.x*=0.6;r.legL.kn.rotation.x*=0.45;r.hips.rotation.z+=Math.sin(ph)*0.07*amp;}
  r.torso.rotation.set(-0.3*run*(1-aim)-0.03*aim+breathe*1.4+P.recoil*0.03+P.pitch*0.55,-Math.sin(ph)*0.12*amp-0.12*aim*P.side,Math.sin(ph)*0.03*amp);
  r.head.rotation.set(0.24*run*(1-aim)+0.05*aim-P.pitch*0.3,-r.torso.rotation.y*0.8+0.1*aim*P.side,-0.08*aim);
  {let look=0,bd=12;for(const e of enemies){if(e.dead)continue;const dx=e.x-P.x,dz=e.z-P.z,dd=Math.hypot(dx,dz);if(dd<bd){const a=angDiff(P.yaw,Math.atan2(-dx,-dz));if(Math.abs(a)<1.7){bd=dd;look=clamp(a,-0.9,0.9);}}}
    P.idleT=(speed<0.2&&aim<0.1)?(P.idleT||0)+dt:0;if(look===0&&P.idleT>3)look=Math.sin(G.time*0.55)*0.6*Math.min(1,(P.idleT-3)/1.5);
    P.look=damp(P.look||0,look*(1-aim),4,dt);r.head.rotation.y+=P.look;r.torso.rotation.y+=P.look*0.2;
    if(!r.fs)r.fs=faceState();const A_=EMO.arousal,V_=EMO.valence;const fear=clamp(A_*(0.25-V_),0,1);
    const talk=VOICE.talkT>0?0.25+0.5*Math.abs(Math.sin(G.time*17))*(0.6+0.4*Math.sin(G.time*5.3)):0;
    const breath=(A_>0.6||P.hp<35)?0.12+0.12*Math.sin(G.time*(P.hp<35?3.4:2.6)):0;
    animateFace(r.face,r.fs,dt,{lid:0.44+0.2*fear-0.22*aim-(P.hp<35?0.06:0),brow:fear*0.9,furrow:clamp(aim*0.8+A_*0.45*(V_>-0.25?1:0.3),0,1),
      mouth:Math.max(talk,EMO.hurtT>0?0.45:0,breath,HERO_LOOK.smile&&aim<0.3&&fear<0.3?0.12:0),gazeYaw:(look-P.look)*1.2,gazePitch:aim*0.04,blinkMin:2.6-1.6*A_,blinkVar:2.4,
      ex:{smile:EMO.hurtT>0?0:clamp(0.45+V_*0.4-aim*0.5-fear,0,0.9),frown:clamp(fear*0.8+(P.hp<35?0.3:0),0,1),squint:clamp(aim*0.55+(EMO.hurtT>0?0.8:0),0,1),snarl:clamp(aim*0.2+(EMO.hurtT>0?0.6:0)+(input.fire?0.15:0),0,1),pucker:talk>0?0.35*Math.abs(Math.sin(G.time*9)):0,sneer:EMO.hurtT>0?0.4:0,puff:breath>0.15?0.2:0}});
    const fid=P.idleT>3?Math.min(1,(P.idleT-3)/2):0;r.hips.position.x=Math.sin(G.time*0.4)*0.025*fid;r.hips.rotation.z+=Math.sin(G.time*0.4)*0.03*fid;}
  const W=GUNS[P.weapon],h=HB[P.weapon];
  const lo=W.low,ai=W.aim,re=W.rel;const pose=[];for(let k=0;k<6;k++)pose[k]=lerp(lo[k],ai[k],aim);
  if(P.reloadAmt>0.01)for(let k=0;k<6;k++)pose[k]=lerp(pose[k],re[k],P.reloadAmt);
  pose[1]+=Math.cos(2*ph)*0.02*run;pose[3]+=P.pitch*0.45;
  r.gun.position.set(pose[0],pose[1],pose[2]+P.recoil*0.05*W.recoil);r.gun.rotation.set(pose[3]+P.recoil*0.07*W.recoil,pose[4],pose[5]);P.swingT=Math.max(0,(P.swingT||0)-dt);
  if(W.melee&&P.swingT>0){const s=Math.sin((1-P.swingT/0.36)*Math.PI);r.gun.rotation.x-=1.5*s;r.gun.rotation.z-=0.5*s;r.gun.position.y+=0.12*s;r.gun.position.z-=0.12*s;}r.gun.updateMatrix();
  _gq.copy(r.gun.quaternion);
  _wt.set(...h.wR).applyMatrix4(r.gun.matrix);solveArm(r.armR,SH_R,_wt,POLE_R,_hq.copy(_gq).multiply(h.R));
  const pump=pumpOffset();if(r.gunMeshes.shotgun.userData.forend)r.gunMeshes.shotgun.userData.forend.position.z=P.weapon==='shotgun'?pump:0;
  _wl.set(h.wL[0],h.wL[1],h.wL[2]+(P.weapon==='shotgun'?pump:0)).applyMatrix4(r.gun.matrix);
  if(P.reloadT>0){const p=1-P.reloadT/P.reloadMax;const mw=_wt.set(...W.magPos).applyMatrix4(r.gun.matrix).add(_i6.set(-0.06,-0.04,0.02));
    if(p<0.25)_wl.lerp(mw,p/0.25);else if(p<0.5)_wl.copy(mw).lerp(POUCH,(p-0.25)/0.25);else if(p<0.75)_wl.copy(POUCH).lerp(mw,(p-0.5)/0.25);else _wl.copy(mw).lerp(_wl,(p-0.75)/0.25);}
  solveArm(r.armL,SH_L,_wl,POLE_L,_hq.copy(_gq).multiply(h.L));
  if(P.nadeT>=0){const K=[[0,0.4,-0.2,0.6,0.4,0.2,0.5,0,0,0],[0.16,1.05,-0.25,1.7,1.0,0.35,1.5,0,0,0],[0.3,-0.55,0.35,0.15,1.0,0.6,0.3,-0.25,0,0.1],[0.44,1.571,1.571,1.571,1.45,0.15,0.1,-0.65,0.06,0.35],[0.52,1.571,1.571,1.571,1.45,0.15,0.1,-0.7,0.06,0.35],[0.6,2.55,0.3,0.4,0.8,0.2,0.4,0.1,-0.12,0.2],[0.78,0.9,-0.35,0.3,0.3,0.3,0.6,0.5,-0.3,0],[1,0.4,-0.2,0.6,0.4,0.2,0.5,0,0,0]];
    let i=0;while(i<K.length-2&&P.nadeT>K[i+1][0])i++;const a=K[i],b=K[i+1];const u=clamp((P.nadeT-a[0])/(b[0]-a[0]),0,1),e=u*u*(3-2*u);const v=a.map((x,j)=>x+(b[j]-x)*e);
    r.armR.sh.rotation.set(v[1],0,v[2]);r.armR.el.rotation.set(v[3],0,0);r.armR.hand.rotation.set(0,0,0);r.armL.sh.rotation.set(v[4],0,v[5]);r.armL.el.rotation.set(v[6],0,0);r.armL.hand.rotation.set(0,0,0);
    r.torso.rotation.y+=v[7];r.torso.rotation.x+=v[8];r.legL.hp.rotation.x+=v[9];r.legL.kn.rotation.x-=v[9]*0.5;
    for(const n in r.gunMeshes)r.gunMeshes[n].visible=false;}
  if((P.throwT||0)>0){const p=1-P.throwT/0.45;r.armR.sh.rotation.set(lerp(-2.6,1.3,Math.min(1,p*1.4)),0,-0.25);r.armR.el.rotation.set(lerp(1.5,0.2,p),0,0);r.armR.hand.rotation.set(0,0,0);r.torso.rotation.y+=lerp(0.4,-0.3,p);}
  if(P.burn>0||P.dying){const t=G.time,k=P.dying?Math.max(0,1-P.dying):1;
    r.armL.sh.rotation.set(2.0+Math.sin(t*13)*0.9*k,0,0.5+Math.sin(t*9.3)*0.5*k);r.armR.sh.rotation.set(2.0+Math.sin(t*12+2)*0.9*k,0,-0.5-Math.sin(t*8.1+1)*0.5*k);
    r.armL.el.rotation.set(0.9+Math.sin(t*15)*0.6,0,0);r.armR.el.rotation.set(0.9+Math.sin(t*14+1)*0.6,0,0);r.armL.hand.rotation.set(0,0,0);r.armR.hand.rotation.set(0,0,0);
    r.torso.rotation.y+=Math.sin(t*7)*0.4*k;r.torso.rotation.x-=0.15;r.head.rotation.y+=Math.sin(t*11)*0.5*k;r.head.rotation.x+=0.2*Math.sin(t*5);}
}
function animateZombie(e,dt,moving){const r=e.r;
  if(e.climb){e.t+=dt*5;const ph=e.t;r.hips.position.set(0,1.03,0.05);r.torso.rotation.set(-0.1,0,0);
    r.legL.hp.rotation.x=0.55+0.45*Math.sin(ph);r.legL.kn.rotation.x=-0.9-0.5*Math.max(0,Math.sin(ph));r.legR.hp.rotation.x=0.55+0.45*Math.sin(ph+Math.PI);r.legR.kn.rotation.x=-0.9-0.5*Math.max(0,Math.sin(ph+Math.PI));
    r.armL.sh.rotation.set(2.5+0.3*Math.sin(ph+Math.PI),0,0.12);r.armR.sh.rotation.set(2.5+0.3*Math.sin(ph),0,-0.12);r.armL.el.rotation.x=0.5;r.armR.el.rotation.x=0.5;return;}e.t+=dt*(moving?(e.runner?e.speed*1.9:e.speed*2.6):1.4);const ph=e.t;
  const st=e.stagger;let sw=0;if(e.atkT>0)sw=Math.sin((1-e.atkT/0.6)*Math.PI);
  if((e.runBlend||0)>0.5&&moving){const amp=0.9*e.runBlend;r.hips.position.y=1.0+(0.5-0.5*Math.cos(2*ph))*0.06;
    r.legL.hp.rotation.x=0.2+Math.sin(ph)*amp;r.legR.hp.rotation.x=0.2+Math.sin(ph+Math.PI)*amp;
    r.legL.kn.rotation.x=-0.3-1.3*Math.max(0,Math.cos(ph));r.legR.kn.rotation.x=-0.3-1.3*Math.max(0,Math.cos(ph+Math.PI));
    r.torso.rotation.set(-0.5+st*1.2,Math.sin(ph)*0.2,Math.sin(ph*0.5)*0.1);
    r.armL.sh.rotation.set(1.0+Math.sin(ph+Math.PI)*0.7,0,0.3);r.armR.sh.rotation.set(1.0+Math.sin(ph)*0.7,0,-0.3);r.armL.el.rotation.x=0.6;r.armR.el.rotation.x=0.6;}
  else{const amp=0.08+0.37*(e.moveAmt===undefined?(moving?1:0):e.moveAmt);r.hips.position.y=1.03+(0.5-0.5*Math.cos(2*ph))*0.03*amp*2;
    r.hips.rotation.z=Math.sin(ph)*0.08*e.limp;
    const lg=e.limp>0?[r.legL,r.legR]:[r.legR,r.legL];
    lg[0].hp.rotation.x=0.05+Math.sin(ph)*amp;lg[0].kn.rotation.x=-0.1-0.7*amp*Math.max(0,Math.cos(ph));
    lg[1].hp.rotation.x=0.05+Math.sin(ph+Math.PI)*amp*0.55;lg[1].kn.rotation.x=-0.05;lg[1].ft.rotation.z=0.25*e.limp;
    r.torso.rotation.set(-0.32+Math.sin(ph*2)*0.04+st*1.2-sw*0.25,Math.sin(ph)*0.12,Math.sin(ph)*0.1*e.limp);
    r.armL.sh.rotation.set(1.25+Math.sin(ph+1)*0.12+sw*1.0,0,0.18);r.armR.sh.rotation.set(1.1+Math.sin(ph)*0.15+sw*1.2,0,-0.22);
    r.armL.el.rotation.x=0.25+sw*0.4;r.armR.el.rotation.x=0.35;}
  if(e.crawl){const c=e.t*1.6;r.hips.position.y=0.95;r.legL.hp.rotation.x=0.1+Math.sin(c)*0.15;r.legR.hp.rotation.x=0.1-Math.sin(c)*0.15;r.legL.kn.rotation.x=-0.3;r.legR.kn.rotation.x=-0.2;
    r.torso.rotation.set(0.15,Math.sin(c)*0.15,0);r.armL.sh.rotation.set(2.6+Math.sin(c)*0.5,0,0.3);r.armR.sh.rotation.set(2.6-Math.sin(c)*0.5,0,-0.3);
    r.armL.el.rotation.x=0.4+0.4*Math.max(0,Math.sin(c));r.armR.el.rotation.x=0.4+0.4*Math.max(0,-Math.sin(c));}
  if(e.eating&&!e.dead){const c=G.time*3.2+e.t;r.hips.position.y=0.52;r.hips.rotation.x=0;r.legL.hp.rotation.set(0.25,0,-0.12);r.legR.hp.rotation.set(0.05,0,0.15);r.legL.kn.rotation.x=-1.75;r.legR.kn.rotation.x=-1.6;
    r.torso.rotation.set(-0.95-Math.sin(c*0.5)*0.06,Math.sin(c*0.3)*0.12,0);const pull=Math.max(0,Math.sin(c));r.armL.sh.rotation.set(0.35+pull*0.4,0,0.2);r.armR.sh.rotation.set(0.4+Math.max(0,Math.sin(c+2))*0.4,0,-0.2);
    r.armL.el.rotation.x=1.1-pull*0.6;r.armR.el.rotation.x=1.0-Math.max(0,Math.sin(c+2))*0.6;}
  if(e.armOff){for(const [A_,sd] of[[r.armL,'L'],[r.armR,'R']])if(e.armOff[sd]){A_.sh.rotation.set(e.crawl?2.9:0.08+Math.sin(e.t*2)*0.06,0,sd==='L'?0.1:-0.1);A_.el.rotation.x=0.05;}}
  if(e.burn>0&&!e.dead){const t=G.time+e.t;r.armL.sh.rotation.set(2.1+Math.sin(t*12)*0.9,0,0.5+Math.sin(t*8)*0.4);r.armR.sh.rotation.set(2.1+Math.sin(t*11+2)*0.9,0,-0.5-Math.sin(t*7)*0.4);
    r.armL.el.rotation.x=0.9+Math.sin(t*14)*0.6;r.armR.el.rotation.x=0.9+Math.sin(t*13)*0.6;r.torso.rotation.y+=Math.sin(t*6)*0.5;}
  r.head.rotation.set(0.25+st*0.8+Math.sin(ph*0.7)*0.06,Math.sin(ph*0.5)*0.12+(e.lookYaw||0),0.3*e.limp+Math.sin(ph*0.6)*0.08);if(!e.crawl&&!e.eating&&!e.dead){r.torso.rotation.x-=0.28;r.head.rotation.x-=0.22;}if(e.crawl)r.head.rotation.x=-0.85;if(e.eating&&!e.dead){r.head.rotation.x=0.35+Math.abs(Math.sin(G.time*3.2+e.t))*0.35;r.head.rotation.z=Math.sin(G.time*2.1+e.t)*0.25;}
  e.stagger=Math.max(0,e.stagger-dt*2.2);
  if(!e.fs)e.fs=faceState();let mouth=0.34+0.06*Math.sin(ph*1.3);
  if(e.groanDur>0){e.groanT2=(e.groanT2||0)+dt;const k=e.groanT2/e.groanDur;if(k>=1){e.groanDur=0;e.groanT2=0;}else mouth=Math.max(mouth,Math.sin(k*Math.PI)*(0.55+0.3*Math.abs(Math.sin(e.groanT2*11))));}
  if(sw>0)mouth=Math.max(mouth,0.9*sw);if(st>0.2)mouth=Math.max(mouth,0.6);
  if(e.jawSide===undefined)e.jawSide=(Math.random()<0.5?-1:1)*(0.25+Math.random()*0.5);
  animateFace(r.face,e.fs,dt,{ex:{snarl:clamp((e.seen?0.85:0.45)+Math.sin(G.time*1.7+e.t)*0.15+(e.stagger>0.3?0.3:0),0,1),sneer:e.seen?0.7:0.35,frown:0.35,squint:e.stagger>0.3?0.9:(e.seen?0.3:0),jawX:e.jawSide*(e.eating?0.5+0.5*Math.sin(G.time*7+e.t):1),puff:0},lid:e.seen?0.32:0.12,brow:0,furrow:0.55,mouth:e.eating?0.25+0.4*Math.abs(Math.sin(G.time*7+e.t)):mouth,gazeYaw:e.seen?(e.lookYaw||0)*0.5:0,gazePitch:0.05,blinkMin:6,blinkVar:8});
}

/* ================= melee: Jessa's pipe wrench ================= */
function meleeSwing(W){P.fireCD=W.cd*(P.reloadK<1?0.85:1);P.swingT=0.36;P.aimT=0.6;alertNoise(P.x,P.z,8);noise(0.2,1400,300,0.22,'bandpass');buzz(12);
  setTimeout(()=>{if(G.state!=='play')return;const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);let n=0;
    const live=enemies.filter(e=>!e.dead).map(e=>({e,d:Math.hypot(e.x-P.x,e.z-P.z)})).filter(o=>o.d<2.3).sort((a,b)=>a.d-b.d);
    for(const {e,d} of live){const dx=(e.x-P.x)/(d||1),dz=(e.z-P.z)/(d||1);if(dx*fx+dz*fz<0.35&&d>0.6)continue;
      const head=e.crawl?false:Math.random()<0.35;const dir=new THREE.Vector3(dx,0,dz);damageEnemy(e,CH.onehit?999:W.dmg*(head?1.8:1)*(P.steady?1.1:1),head,dir,false,{});
      e.stagger=Math.max(e.stagger||0,0.6);e.x+=dx*0.35;e.z+=dz*0.35;const hp=new THREE.Vector3();e.r.head.getWorldPosition(hp);hp.y-=head?0:0.45;spark(hp,0x3a0606,0.3,false);
      if(++n>=2)break;}
    if(n){G.shake=Math.max(G.shake,0.12);tone(120,60,0.12,0.25,'square');noise(0.08,400,120,0.35,'lowpass');}else noise(0.12,700,200,0.08,'bandpass');},120);
  drawHud();}
/* ================= Jessa's weld gun: a short cone of sparks that burns and ignites ================= */
const weldLight=new THREE.PointLight(0x9fd0ff,0,6,1.6);scene.add(weldLight);
function weldFire(W){P.fireCD=W.cd;P.aimT=0.9;P.recoil=0.25;alertNoise(P.x,P.z,10);
  const fp=P.fpv>0.5;const mz=fp?vmMuzzle:hero.muzzle;mz.updateWorldMatrix(true,false);mz.getWorldPosition(_a);camera.getWorldDirection(_b);
  for(let q=0;q<7;q++){const s=7+Math.random()*8,j=W.cone*1.6;spark2(_a.x,_a.y,_a.z,(_b.x+(Math.random()-.5)*j)*s,(_b.y+(Math.random()-.5)*j)*s+0.6,(_b.z+(Math.random()-.5)*j)*s,0.25+Math.random()*0.3);}
  weldLight.position.copy(_a);weldLight.intensity=2.2+Math.random()*1.5;clearTimeout(weldFire.tm);weldFire.tm=setTimeout(()=>weldLight.intensity=0,90);
  if(Math.random()<0.5)noise(0.09,5200,2600,0.06,'highpass');
  const _cp=camera.getWorldPosition(new THREE.Vector3());const ox=_cp.x,oy=_cp.y,oz=_cp.z;
  for(const e of enemies){if(e.dead)continue;const ex=e.x-ox,ey=e.y+1.1*(e.sc||1)-oy,ez=e.z-oz,L=Math.hypot(ex,ey,ez);if(L>W.range+(e.boss?2:0))continue;
    const ang=Math.acos(clamp((ex*_b.x+ey*_b.y+ez*_b.z)/(L||1),-1,1));if(ang>W.cone+(e.boss?0.25:0)+0.25/Math.max(1,L))continue;
    damageEnemy(e,CH.onehit?999:W.dmg,false,new THREE.Vector3(ex,0,ez).normalize(),true);if(!e.boss){e.burn=Math.max(e.burn,3.5);e.burnPanic=Math.max(e.burnPanic||0,1);}}
  for(const b of BARRELS)if(b.state===0&&Math.hypot(b.x-P.x,b.z-P.z)<W.range&&Math.random()<0.1){const ang=Math.acos(clamp(((b.x-ox)*_b.x+(b.z-oz)*_b.z)/(Math.hypot(b.x-ox,b.z-oz)||1),-1,1));if(ang<W.cone)hitBarrel(b,1);}
  drawHud();}
