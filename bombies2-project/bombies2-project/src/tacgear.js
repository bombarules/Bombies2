/* ================= tactical gear: helmets, plate carriers, packs, pads (hero operator, squad teammate, zombie soldiers) =================
   Rigid parts attached to the skeleton bones. Coordinates: torso bone space (front is -z), head parts in head-mesh units (x0.125 m). */
const tacMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.86,metalness:0.04});
const TAC_CACHE={};
function buildTacGear(c){const key=JSON.stringify(c);if(TAC_CACHE[key])return TAC_CACHE[key];
  const V=c.vest,PO=c.pouch||mulc(V,0.85),H=c.helmet,DK=mulc(V,0.6),WEB=mulc(V,0.75);
  const nyl=(base,k)=>p=>{const n=0.9+0.12*vnoise(p.x*90,p.y*90,p.z*90);const w=(c.worn||0)*Math.max(0,vnoise(p.x*14+3,p.y*14,p.z*14)-0.55)*2;return mixc(mulc(base,n*(k||1)),[0.3,0.25,0.18],w);};
  const box=(w,h,d,x,y,z,rx,col,ry,rz)=>P_(colorize(new THREE.BoxGeometry(w,h,d,2,2,1),nyl(col)),M(x,y,z,rx||0,ry||0,rz||0));
  /* ---- torso: front/back plates, cummerbund, straps, pouches, backpack ---- */
  const t=[];
  const pl=c.plates!==false,pz=pl?0:0.04;
  if(pl)t.push(box(0.28,0.3,0.046,0,0.34,-0.168,-0.12,V),box(0.28,0.3,0.046,0,0.34,0.168,0.12,V));
  if(pl)for(const z of[-1,1])t.push(box(0.27,0.012,0.03,0,0.34,z*0.193,z*0.12,WEB),box(0.27,0.012,0.03,0,0.3,z*0.193,z*0.12,WEB),box(0.27,0.012,0.03,0,0.26,z*0.191,z*0.12,WEB));
  t.push(P_(colorize(new THREE.CylinderGeometry(1,1,pl?0.13:0.07,22),nyl(V,0.92)),M(0,pl?0.2:0.24,0,0,0,0,0.19,1,0.136)));
  if(!pl)for(const s of[-1,1])t.push(box(0.04,0.3,0.018,s*0.075,0.42,-0.148,-0.32,V),box(0.04,0.3,0.018,s*0.075,0.42,0.142,0.3,V));
  for(const s of[-1,1]){t.push(box(0.055,0.024,0.2,s*0.1,0.578,0,0,V));
    t.push(box(0.055,0.024,0.12,s*0.1,0.53,-0.13,-0.75,V),box(0.055,0.024,0.12,s*0.1,0.53,0.13,0.75,V));}
  if(c.pouches!==false)for(const x of[-0.075,0,0.075]){t.push(box(0.064,0.1,0.042,x,0.255,-0.203+pz,-0.12,PO));t.push(box(0.066,0.026,0.046,x,0.31,-0.21+pz,-0.12,mulc(PO,0.8)));}
  if(pl)t.push(box(0.075,0.11,0.042,-0.082,0.43,-0.222,-0.12,PO));
  if(c.patch)t.push(P_(colorize(new THREE.CylinderGeometry(0.026,0.026,0.006,16),p=>Math.hypot(p.x,p.z)<0.017?[0.55,0.56,0.58]:[0.3,0.31,0.33]),M(0.075,0.44,-0.214,Math.PI/2-0.12,0,0)));
  if(c.radio)t.push(box(0.05,0.12,0.035,0.1,0.42,-0.214,-0.12,mulc(DK,0.8)),P_(colorize(cyl(0.004,0.004,0.12,6),()=>[0.05,0.05,0.05]),M(0.115,0.53,-0.214)));
  if(c.hood){const HC=c.hood;t.push(P_(colorize(new THREE.SphereGeometry(1,16,10),nyl(HC)),M(0,0.585,0.075,0.35,0,0,0.135,0.1,0.09)));
    t.push(P_(colorize(new THREE.TorusGeometry(0.095,0.03,8,18),nyl(mulc(HC,0.92))),M(0,0.575,0.01,Math.PI/2+0.25,0,0,1.15,1,1)));
    for(const s of[-1,1])t.push(P_(colorize(cyl(0.004,0.004,0.12,5),()=>[0.75,0.74,0.7]),M(s*0.035,0.49,-0.13,-0.15,0,0)));}
  if(c.scarf)t.push(P_(colorize(new THREE.TorusGeometry(0.075,0.036,8,18),nyl(c.scarf)),M(0,0.57,0.005,Math.PI/2,0,0,1.15,1,1)),P_(colorize(new THREE.SphereGeometry(1,12,8),nyl(mulc(c.scarf,0.9))),M(0,0.53,-0.095,0,0,0,0.07,0.05,0.035)));
  if(c.tank){const TK=c.tank;t.push(P_(colorize(cyl(0.085,0.085,0.42,18),p=>mulc(TK,0.9+0.12*vnoise(p.x*30,p.y*30,p.z*30))),M(0,0.32,0.2)),P_(colorize(new THREE.SphereGeometry(0.085,16,10),()=>TK),M(0,0.53,0.2)),P_(colorize(new THREE.SphereGeometry(0.085,16,10),()=>TK),M(0,0.11,0.2)));
    t.push(P_(colorize(cyl(0.02,0.02,0.05,8),()=>[0.5,0.5,0.52]),M(0,0.6,0.2)),P_(colorize(new THREE.TorusGeometry(0.09,0.012,6,20,Math.PI*1.1),()=>[0.05,0.05,0.05]),M(0.05,0.6,0.08,0,Math.PI/2,0)));
    for(const s of[-1,1])t.push(box(0.04,0.42,0.016,s*0.08,0.36,-0.14,-0.25,[0.05,0.05,0.05]),box(0.04,0.42,0.016,s*0.08,0.36,0.125,0.2,[0.05,0.05,0.05]));
    t.push(P_(colorize(new THREE.CylinderGeometry(1,1,0.05,22),()=>[0.05,0.05,0.05]),M(0,0.2,0,0,0,0,0.19,1,0.136)));}
  if(c.pack){const PK=c.packCol||mulc(V,0.95);t.push(box(0.27,0.34,0.13,0,0.33,0.255,0,PK),box(0.25,0.07,0.125,0,0.525,0.255,0,mulc(PK,0.85)),box(0.2,0.12,0.04,0,0.25,0.335,0,mulc(PK,0.9)));
    for(const s of[-1,1])t.push(box(0.04,0.2,0.09,s*0.155,0.3,0.255,0,mulc(PK,0.88)));
    if(c.antenna){t.push(P_(colorize(cyl(0.0035,0.0045,0.42,6),()=>[0.04,0.04,0.04]),M(-0.09,0.75,0.26,0.05,0,0.06)));t.push(P_(colorize(cyl(0.009,0.009,0.03,8),()=>[0.05,0.05,0.05]),M(-0.09,0.555,0.26)));}
    if(c.glow)t.push(P_(colorize(new THREE.BoxGeometry(0.03,0.012,0.006),()=>[2.2,0.7,0.25]),M(-0.08,0.46,0.322)));}
  /* ---- hips: battle belt with pouches ---- */
  const h=[P_(colorize(new THREE.CylinderGeometry(1,1,0.055,22),nyl(DK)),M(0,0.055,0,0,0,0,0.182,1,0.135))];
  for(const a of[0.9,1.5,2.2,-0.9]){const x=Math.sin(a)*0.18,z=-Math.cos(a)*0.135;h.push(box(0.055,0.075,0.035,x,0.04,z,0,PO,-a));}
  /* ---- legs: knee pads and a thigh holster ---- */
  const kn=[box(0.092,0.11,0.034,0,0.0,-0.072,0.1,mulc(DK,0.9)),box(0.07,0.06,0.012,0,0.005,-0.091,0.1,mulc(DK,0.7))];
  const th=c.holster?[box(0.044,0.16,0.1,0.092,-0.2,0.0,0,DK),box(0.03,0.07,0.05,0.098,-0.1,0.012,0.2,[0.05,0.05,0.05]),box(0.06,0.02,0.11,0.088,-0.05,0,0,WEB),box(0.06,0.02,0.11,0.088,-0.26,0,0,WEB)]:[];
  /* ---- head (head-mesh units): high-cut helmet, ear cups, rails, NVG mount, optional respirator ---- */
  const hd=[];
  if(c.helmet){hd.push(P_(colorize(new THREE.SphereGeometry(1.22,24,12,0,Math.PI*2,0,Math.PI*0.5),p=>{const k=0.88+0.14*vnoise(p.x*6,p.y*6,p.z*6);return mulc(H,k);}),M(0,0.36,0.08,0,0,0,1,1.02,1.1)));
    hd.push(P_(colorize(new THREE.TorusGeometry(1.2,0.06,6,28),()=>mulc(H,0.7)),M(0,0.37,0.08,Math.PI/2,0,0,1,1.1,1)));
    for(const s of[-1,1]){hd.push(box(0.12,0.24,0.95,s*1.19,0.62,0.12,0,mulc(H,0.75)));
      if(c.ears){hd.push(P_(colorize(cyl(0.44,0.44,0.32,16),()=>mulc(H,0.55)),M(s*1.06,0.02,0.12,0,0,Math.PI/2)));hd.push(box(0.1,0.7,0.14,s*1.13,0.42,0.12,0,mulc(H,0.5)));}}
    if(c.nvg){hd.push(box(0.5,0.34,0.16,0,0.96,-1.1,0.45,mulc(H,0.6)));hd.push(box(0.16,0.2,0.22,0,0.8,-1.24,0.45,[0.06,0.06,0.06]));}
    hd.push(box(0.4,0.3,0.03,0,1.48,0.15,0,mulc(H,0.85)));}
  if(c.scars){const SC=p=>[0.42,0.08,0.07];for(const [x,y,a,l] of[[-0.35,0.62,0.6,0.45],[0.42,0.55,-0.9,0.35],[0.55,-0.15,0.5,0.4],[0.62,-0.22,-0.7,0.22]]){const z=-Math.sqrt(Math.max(0.05,1.02-x*x*0.7-y*y*0.35))*1.02;
      hd.push(P_(colorize(new THREE.BoxGeometry(l,0.045,0.04),SC),M(x,y,z-0.02,0,-x*0.6,a)));}}
  if(c.haz){const Y=c.haz;hd.push(P_(colorize(new THREE.SphereGeometry(1.3,22,16),p=>{const k=0.86+0.14*vnoise(p.x*5,p.y*5,p.z*5);return mulc(Y,k);}),M(0,0.18,0.12,0,0,0,1.02,1.12,1.06)));
    hd.push(P_(colorize(new THREE.SphereGeometry(1,20,14,Math.PI*0.62,Math.PI*0.76,Math.PI*0.25,Math.PI*0.42),()=>[0.02,0.02,0.025]),M(0,0.12,0.05,0,0,0,1.26,1.12,1.3)));
    hd.push(P_(colorize(cyl(0.3,0.32,0.36,16),()=>[0.06,0.06,0.065]),M(0,-0.72,-1.3,Math.PI/2+0.35,0,0)));
    for(const s of[-1,1])hd.push(P_(colorize(cyl(0.22,0.24,0.26,14),()=>[0.08,0.08,0.085]),M(s*0.62,-0.6,-1.12,Math.PI/2,0,s*0.6)));}
  if(c.mask){const MK=c.maskCol||[0.07,0.07,0.075];hd.push(P_(colorize(new THREE.SphereGeometry(1,16,10),()=>MK),M(0,-0.52,-0.9,0,0,0,0.78,0.6,0.5)));
    hd.push(P_(colorize(cyl(0.24,0.26,0.3,14),()=>mulc(MK,1.4)),M(0,-0.68,-1.34,Math.PI/2+0.3,0,0)));
    for(const s of[-1,1])hd.push(P_(colorize(cyl(0.2,0.22,0.22,12),()=>mulc(MK,1.3)),M(s*0.52,-0.62,-1.12,Math.PI/2,0,s*0.6)));
    hd.push(box(0.08,0.08,2.1,0,-0.45,0.05,0,mulc(MK,0.8),0,0));}
  const hg=hd.length?mergeParts(hd):null;if(hg)hg.applyMatrix4(M(0,0.12,0,0,0,0,0.125));
  return TAC_CACHE[key]={torso:mergeParts(t),hips:mergeParts(h),knee:mergeParts(kn),thigh:th.length?mergeParts(th):null,head:hg};}
function attachTacGear(r,c,mat){const G=buildTacGear(c),m=mat||tacMat,out=[];
  const add=(g,bone,x,y,z)=>{if(!g)return;const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.castShadow=true;bone.add(o);out.push(o);};
  add(G.torso,r.torso);add(G.hips,r.hips);add(G.head,r.head);add(G.knee,r.legL.kn);add(G.knee,r.legR.kn);add(G.thigh,r.legR.hp);return out;}
/* glowing eyes for zombie soldiers: red emissive eyes plus a soft additive halo */
const eyeGlowMat=new THREE.MeshBasicMaterial({color:0xff2b14});
const eyeHaloTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,90,40,1)');gr.addColorStop(0.25,'rgba(255,40,20,0.6)');gr.addColorStop(1,'rgba(255,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
const eyeHaloMat=new THREE.SpriteMaterial({map:eyeHaloTex,color:0xffffff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true});
function glowEyes(r,col){const em=col?new THREE.MeshBasicMaterial({color:col}):eyeGlowMat,hm=col?eyeHaloMat.clone():eyeHaloMat;if(col)hm.color.setHex(col);for(const e of r.face.eyes){e.material=em;const s=new THREE.Sprite(hm);s.scale.setScalar(5.5);s.position.z=-0.4;e.add(s);}
  for(const l of r.face.lids)l.rotation.x=0.75;}
/* gear sets */
const TAC_HERO={vest:[0.075,0.075,0.08],pouch:[0.06,0.06,0.065],helmet:[0.075,0.08,0.075],pack:true,antenna:true,glow:true,patch:true,radio:true,ears:true,nvg:true,holster:true};
const TAC_VET={vest:[0.24,0.26,0.15],pouch:[0.21,0.23,0.13],helmet:null,radio:true,holster:true,scars:true,scarf:[0.13,0.16,0.11],worn:0.9};
const TAC_JESSA={vest:[0.1,0.1,0.1],pouch:[0.13,0.13,0.12],helmet:null,plates:false,pouches:false,scars:true,holster:true,worn:0.6};
const TAC_HAZ={vest:[0.06,0.06,0.06],helmet:null,plates:false,pouches:false,haz:[0.78,0.64,0.1],tank:[0.7,0.6,0.12]};
const TAC_SURV={vest:[0.2,0.22,0.13],pouch:[0.22,0.23,0.14],helmet:null,plates:false,hood:[0.3,0.31,0.27],holster:true,worn:0.7};
const TAC_MATE={vest:[0.3,0.3,0.2],pouch:[0.27,0.27,0.18],helmet:[0.24,0.25,0.2],ears:true,nvg:true,patch:true,holster:true};
const ZTAC=[{vest:[0.2,0.22,0.14],helmet:[0.2,0.22,0.15],mask:true,worn:0.9,ears:true},
  {vest:[0.07,0.07,0.075],helmet:[0.07,0.07,0.07],mask:true,worn:0.7,nvg:true,patch:true},
  {vest:[0.16,0.17,0.19],helmet:[0.11,0.11,0.12],worn:0.8,ears:true,holster:true}];
hero.tacSets={operator:attachTacGear(hero,TAC_HERO),veteran:attachTacGear(hero,TAC_VET),survivor:attachTacGear(hero,TAC_SURV),jessa:attachTacGear(hero,TAC_JESSA),hazmat:attachTacGear(hero,TAC_HAZ)};for(const k in hero.tacSets)for(const m of hero.tacSets[k])m.visible=false;
/* ================= special Bombies: armored tank, gaunt runner, toxic spitter ================= */
const armorMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.55,metalness:0.45});
const glowOrange=new THREE.MeshBasicMaterial({color:0xff9a1a});
const bulbMat=new THREE.MeshStandardMaterial({color:0xd6e83a,emissive:0x8fa000,emissiveIntensity:1.1,roughness:0.15,metalness:0,transparent:true,opacity:0.88});
const slimeMat=new THREE.MeshStandardMaterial({color:0xb8d030,emissive:0x4a5a00,roughness:0.2,transparent:true,opacity:0.8});
const ARMOR=(()=>{const ST=[0.3,0.32,0.21];const rust=p=>{const n=vnoise(p.x*20,p.y*20,p.z*20),r=Math.max(0,vnoise(p.x*7+5,p.y*7,p.z*7)-0.5)*1.6;return mixc(mulc(ST,0.8+0.3*n),[0.38,0.2,0.1],r);};
  const riv=(arr,x,y,z)=>arr.push(P_(colorize(new THREE.SphereGeometry(0.011,6,4),()=>[0.42,0.3,0.2]),M(x,y,z)));
  const ch=[P_(colorize(new THREE.BoxGeometry(0.4,0.34,0.06,3,3,1),rust),M(0,0.36,-0.2,-0.12,0,0)),P_(colorize(new THREE.BoxGeometry(0.42,0.36,0.06),rust),M(0,0.36,0.2,0.12,0,0))];
  for(const x of[-0.16,0.16])for(const y of[0.22,0.5])riv(ch,x,y,-0.235+(y-0.36)*0.12);
  for(const s of[-1,1])ch.push(P_(colorize(cyl(0.065,0.065,0.3,14),rust),M(s*0.1,0.55,0.29,0,0,Math.PI/2)),P_(colorize(cyl(0.05,0.05,0.02,14),()=>[0.15,0.15,0.13]),M(s*0.26,0.55,0.29,0,0,Math.PI/2)));
  ch.push(P_(colorize(new THREE.BoxGeometry(0.16,0.1,0.08),rust),M(0,0.64,0.27)),P_(colorize(cyl(0.004,0.004,0.32,5),()=>[0.08,0.08,0.08]),M(0.08,0.82,0.28)));
  const sh=[P_(colorize(new THREE.SphereGeometry(0.16,16,10,0,Math.PI*2,0,Math.PI*0.55),rust),M(0,0.02,0,0,0,0,1.05,0.8,1.0))];for(let i=0;i<5;i++){const a=i/5*Math.PI*2;riv(sh,Math.cos(a)*0.12,0.08,Math.sin(a)*0.12);}
  const br=[P_(colorize(cyl(0.075,0.068,0.17,14),rust),M(0,-0.12,0))];riv(br,0,-0.08,-0.075);riv(br,0,-0.16,-0.07);
  const hd=[P_(colorize(new THREE.SphereGeometry(1.32,20,14),rust),M(0,0.2,0.05,0,0,0,1,1.05,1.05)),P_(colorize(new THREE.BoxGeometry(1.5,0.22,0.3),()=>[0.04,0.04,0.04]),M(0,0.12,-1.28))];
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;riv(hd,Math.cos(a)*1.1,0.75,Math.sin(a)*1.1);}
  const hg=mergeParts(hd);hg.applyMatrix4(M(0,0.12,0,0,0,0,0.125));
  return {chest:mergeParts(ch),shoulder:mergeParts(sh),bracer:mergeParts(br),head:hg};})();
function attachTankArmor(r){const add=(g,b,x,y,z,mat)=>{const m=new THREE.Mesh(g,mat||armorMat);m.position.set(x||0,y||0,z||0);m.castShadow=true;b.add(m);return m;};
  add(ARMOR.chest,r.torso);add(ARMOR.head,r.head);for(const A of[r.armL,r.armR]){add(ARMOR.shoulder,A.sh);add(ARMOR.bracer,A.el);}
  for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.013,8,6),glowOrange);e.position.set(s*0.045,0.135,-0.165);r.head.add(e);const h=new THREE.Sprite(eyeHaloMat.clone());h.material.color.setHex(0xffa040);h.scale.setScalar(0.08);e.add(h);}
  for(const m of r.face.eyes)m.visible=false;}
function attachSpitter(r){const bulb=(b,x,y,z,s)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,18,14),bulbMat);m.position.set(x,y,z);m.scale.setScalar(s);b.add(m);return m;};
  r.bulbs=[bulb(r.head,0,0.24,0.04,0.15),bulb(r.head,-0.13,0.2,0.06,0.07),bulb(r.head,0.12,0.12,0.1,0.05),bulb(r.torso,-0.17,0.5,0.06,0.07),bulb(r.torso,0.16,0.46,0.08,0.05),bulb(r.torso,0.05,0.42,0.16,0.06)];
  for(let i=0;i<7;i++){const d=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.002,0.12+Math.random()*0.16,5),slimeMat);d.position.set((Math.random()-0.5)*0.24,0.45-Math.random()*0.25,-0.12-Math.random()*0.04);r.torso.add(d);}
  glowEyes(r,0xfff24a);}
/* spitter globs: lobbed toxic balls that splash the hero */
const GLOBS=[],GSPL=[];const globGeo=new THREE.SphereGeometry(0.11,12,10),dropGeo=new THREE.SphereGeometry(0.03,6,5);
function spitGlob(e){const v=new THREE.Vector3();e.r.head.getWorldPosition(v);const tx=P.x+(Math.random()-0.5)*0.6,tz=P.z+(Math.random()-0.5)*0.6,ty=(P.y||0)+1.1;
  const d=Math.hypot(tx-v.x,tz-v.z),T=Math.max(0.45,d/13);const m=new THREE.Mesh(globGeo,bulbMat);m.position.copy(v);scene.add(m);
  GLOBS.push({m,vx:(tx-v.x)/T,vz:(tz-v.z)/T,vy:(ty-v.y+4.9*T*T)/T,t:0});if(e.bulbs)e.bulbs[0].scale.setScalar(0.1);
  if(typeof tone==='function')tone(260,90,0.25,0.12,'sawtooth');}
function globSplash(p,hit){for(let i=0;i<8;i++){const m=new THREE.Mesh(dropGeo,slimeMat);m.position.copy(p);scene.add(m);GSPL.push({m,vx:(Math.random()-.5)*3,vy:1+Math.random()*2.5,vz:(Math.random()-.5)*3,t:0.7});}
  if(hit){hurtPlayer(11);G.shake=0.25;}}
function updateSpitters(dt){if(G.state==='play')for(const e of enemies){if(!e.spitter||e.dead||e.crawl||e.burn>0)continue;
    if(e.bulbs){const b=e.bulbs[0];b.scale.setScalar(Math.min(0.15,b.scale.x+dt*0.03));}
    const d=Math.hypot(P.x-e.x,P.z-e.z);e.spitT-=dt;if(e.spitT<=0&&d>3.5&&d<17&&(e.seen||e.mode==='chase'||d<10)&&!P.dying){e.spitT=3.2+Math.random()*1.8;e.spitAnim=0.5;spitGlob(e);}
    if(e.spitAnim>0){e.spitAnim-=dt;e.r.head.rotation.x-=Math.sin(e.spitAnim*6.28)*0.4;}}
  for(const g of GLOBS.slice()){g.t+=dt;g.vy-=9.8*dt;g.m.position.x+=g.vx*dt;g.m.position.y+=g.vy*dt;g.m.position.z+=g.vz*dt;const p=g.m.position;
    const hit=Math.hypot(p.x-P.x,p.z-P.z)<0.75&&p.y>(P.y||0)&&p.y<(P.y||0)+1.9;
    if(hit||p.y<0.05||g.t>4){if(!hit&&Math.hypot(p.x-P.x,p.z-P.z)<1.5&&p.y<0.3)hurtPlayer(5);globSplash(p,hit);scene.remove(g.m);GLOBS.splice(GLOBS.indexOf(g),1);}}
  for(const s of GSPL.slice()){s.t-=dt;s.vy-=9.8*dt;s.m.position.x+=s.vx*dt;s.m.position.y=Math.max(0.02,s.m.position.y+s.vy*dt);s.m.position.z+=s.vz*dt;if(s.t<=0){scene.remove(s.m);GSPL.splice(GSPL.indexOf(s),1);}}}
