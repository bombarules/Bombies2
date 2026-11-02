/* ================= guns: detailed models built from parts, with attachments ================= */
const gunMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.42,metalness:0.55});
const BLK=[0.11,0.11,0.12],DGR=[0.2,0.2,0.21],WOOD=[0.4,0.22,0.11],STEEL=[0.55,0.55,0.58];
const cyl=(r1,r2,len,seg)=>new THREE.CylinderGeometry(r1,r2,len,seg||14);
// side profile [z,y] points extruded across the gun's width, for stocks, grips and frames
function ext(pts,w,bev){const sh=new THREE.Shape();pts.forEach(([z,y],i)=>i?sh.lineTo(-z,y):sh.moveTo(-z,y));
  const b=bev===undefined?0.004:bev;const g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(0.001,w-2*b),bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:4});
  g.rotateY(Math.PI/2);g.translate(-(w-2*b)/2,0,0);return g;}
function woodCol(base){return p=>{const g=0.82+0.18*Math.sin(p.z*140+Math.sin(p.y*90)*2.2)+0.06*Math.sin(p.y*400);return [base[0]*g,base[1]*g,base[2]*g];};}
function checker(base){return p=>{const k=(Math.floor(p.y*260)+Math.floor(p.z*260))%2?0.82:1;return [base[0]*k,base[1]*k,base[2]*k];};}
function stip(base){return p=>{const k=0.85+0.15*hash3(Math.floor(p.x*600),Math.floor(p.y*600),Math.floor(p.z*600));return [base[0]*k,base[1]*k,base[2]*k];};}
const ATT=(()=>{const d={rifle:{model:'ar',scope:'iron',barrel:'std',mag:30},shotgun:{ammo:'buck',grip:'pump',finish:'synthetic'},magnum:{barrel:'std',cyl:6,grip:'rubber',finish:'stainless'},rpg:{warhead:'he',scope:'iron'},wrench:{grip:'wrap'},weld:{tip:'arc'}};
  try{const s=JSON.parse(localStorage.getItem('sb-att')||'{}');for(const k in d)Object.assign(d[k],s[k]||{});}catch(e){}if(d.rifle.mag!==20)d.rifle.mag=30;return d;})();
function saveAtt(){try{localStorage.setItem('sb-att',JSON.stringify(ATT));}catch(e){}}
const SCOPES={iron:0,'1.5x':1.5,'2.5x':2.5,'3x':3,'5x':5};

/* ---- .357 Magnum revolver ---- */
function magnumParts(a){const p=[];const mk={},MK=n=>{mk[n]=p.length;};const ST=a.finish==='blued'?[0.15,0.16,0.19]:[0.7,0.71,0.74],SD=a.finish==='blued'?[0.1,0.1,0.12]:[0.5,0.51,0.54],DK=[0.04,0.04,0.045];
  const L=a.barrel==='snub'?0.064:a.barrel==='long'?0.214:0.152;const n=a.cyl===8?8:6,cr=n===8?0.0205:0.019;const bz=-0.047;
  MK('frame');
  p.push(P_(ext([[0.045,-0.022],[0.045,0.022],[0.028,0.03],[0.0,0.031],[-0.05,0.031],[-0.05,0.024],[0.0,0.024],[0.0,-0.012],[-0.05,-0.012],[-0.05,-0.024],[0.008,-0.024],[0.02,-0.03]],0.028,0.003),null,ST));
  p.push(P_(new THREE.BoxGeometry(0.012,0.004,0.06),M(0,0.034,0.0),SD));
  MK('cyl');
  p.push(P_(cyl(cr,cr,0.04,24),M(0,0.006,-0.025,Math.PI/2,0,0),ST));
  for(let i=0;i<n;i++){const a2=(i+0.5)/n*Math.PI*2;p.push(P_(new THREE.BoxGeometry(0.004,0.003,0.028),M(Math.cos(a2)*(cr-0.0008),0.006+Math.sin(a2)*(cr-0.0008),-0.025,0,0,a2+Math.PI/2),SD));
    const a3=i/n*Math.PI*2;p.push(P_(cyl(n===8?0.0037:0.0045,n===8?0.0037:0.0045,0.004,10),M(Math.cos(a3)*cr*0.6,0.006+Math.sin(a3)*cr*0.6,-0.0455,Math.PI/2,0,0),DK));}
  p.push(P_(cyl(0.004,0.004,0.006,10),M(0,0.006,-0.047,Math.PI/2,0,0),SD));
  MK('barrel');
  p.push(P_(cyl(0.0085,0.0085,L,16),M(0,0.019,bz-L/2,Math.PI/2,0,0),ST));
  p.push(P_(ext([[bz,0.012],[bz-L,0.012],[bz-L+0.004,-0.004],[bz-L+0.012,-0.008],[bz,-0.008]],0.016,0.003),null,ST));
  p.push(P_(new THREE.BoxGeometry(0.011,0.006,L),M(0,0.029,bz-L/2),ST));
  for(let z=bz-0.02;z>bz-L+0.02;z-=0.03)p.push(P_(new THREE.BoxGeometry(0.0115,0.0035,0.012),M(0,0.0285,z),DK));
  p.push(P_(cyl(0.0035,0.0035,0.003,10),M(0,0.019,bz-L-0.0005,Math.PI/2,0,0),DK));
  p.push(P_(ext([[bz-L+0.002,0.032],[bz-L+0.002,0.044],[bz-L+0.016,0.032]],0.0045,0),null,SD));p.push(P_(new THREE.BoxGeometry(0.0047,0.004,0.004),M(0,0.04,bz-L+0.005),[0.85,0.12,0.08]));
  MK('rear');
  p.push(P_(new THREE.BoxGeometry(0.014,0.006,0.016),M(0,0.037,0.022),DK));p.push(P_(new THREE.BoxGeometry(0.004,0.005,0.004),M(-0.004,0.042,0.016),DK));p.push(P_(new THREE.BoxGeometry(0.004,0.005,0.004),M(0.004,0.042,0.016),DK));
  p.push(P_(ext([[0.034,0.016],[0.046,0.03],[0.058,0.042],[0.064,0.04],[0.05,0.022],[0.044,0.012]],0.008,0.001),null,SD));
  p.push(P_(new THREE.BoxGeometry(0.004,0.01,0.012),M(-0.0155,0.012,0.004),SD));
  p.push(P_(new THREE.TorusGeometry(0.017,0.0026,6,20,Math.PI*1.25),M(0,-0.026,0.004,0,Math.PI/2,Math.PI*0.88),ST));
  p.push(P_(ext([[0.0,-0.022],[0.004,-0.034],[0.008,-0.042],[0.012,-0.04],[0.008,-0.03],[0.006,-0.022]],0.006,0.001),null,SD));
  MK('grip');
  const gp=[[0.03,-0.022],[0.048,-0.02],[0.066,-0.04],[0.09,-0.09],[0.096,-0.118],[0.088,-0.128],[0.06,-0.126],[0.05,-0.11],[0.044,-0.098],[0.036,-0.09],[0.03,-0.078],[0.022,-0.066],[0.016,-0.05],[0.016,-0.032]];
  if(a.grip==='wood'){p.push(P_(colorize(ext(gp,0.036,0.005),checker(WOOD)),null,WOOD));for(const s of[-1,1])p.push(P_(cyl(0.006,0.006,0.002,12),M(s*0.0185,-0.06,0.062,0,0,Math.PI/2),[0.75,0.62,0.3]));}
  else{p.push(P_(colorize(ext(gp,0.038,0.006),stip([0.07,0.07,0.075])),null,BLK));p.push(P_(cyl(0.004,0.004,0.002,10),M(-0.0195,-0.112,0.078,0,0,Math.PI/2),SD));}
  const hl={finish:mergeParts(p.slice(mk.frame,mk.cyl)),cyl:mergeParts(p.slice(mk.cyl,mk.barrel)),barrel:mergeParts(p.slice(mk.barrel,mk.rear)),grip:mergeParts(p.slice(mk.grip))};
  return {base:mergeParts(p),hl,muzzleZ:bz-L-0.002,sight:0.044};}

/* ---- textured rifles decoded from embedded data: AR-15 (sm_rifle.fbx) and QBZ-191 (qbz-191-free) ---- */
function decodeTexModel(D){const dec=s=>{const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a.buffer;};
  const qp=new Int16Array(dec(D.p)),qn=new Int8Array(dec(D.n)),qu=new Uint16Array(dec(D.u)),idx=D.big?new Uint32Array(dec(D.i)):new Uint16Array(dec(D.i));
  const nv=qp.length/3,pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2);
  for(let i=0;i<nv*3;i++){pos[i]=qp[i]/32767*D.S;nor[i]=qn[i]/127;}
  for(let i=0;i<nv;i++){uv[i*2]=D.umin[0]+qu[i*2]/65535*D.ur[0];uv[i*2+1]=D.umin[1]+qu[i*2+1]/65535*D.ur[1];}
  const PA=new THREE.BufferAttribute(pos,3),NA=new THREE.BufferAttribute(nor,3),UA=new THREE.BufferAttribute(uv,2);
  const sub=(rs,full)=>{let n=0;for(const r of rs)n+=r[1]-r[0];const ix=new idx.constructor(n);let o=0;for(const r of rs){ix.set(idx.subarray(r[0],r[1]),o);o+=r[1]-r[0];}
    const g=new THREE.BufferGeometry();g.setAttribute('position',PA);if(full){g.setAttribute('normal',NA);g.setAttribute('uv',UA);g.setAttribute('uv2',UA);}
    g.setIndex(new THREE.BufferAttribute(ix,1));g.computeBoundingSphere();return g;};
  const TL=new THREE.TextureLoader(),tx=u=>{const t=TL.load(u);t.anisotropy=4;return t;},orm=tx(D.orm);
  const mat=new THREE.MeshStandardMaterial({map:tx(D.c),normalMap:tx(D.nm),aoMap:orm,roughnessMap:orm,metalnessMap:orm,roughness:1,metalness:0.8,aoMapIntensity:0.9});
  return {sub,mat,R:D.r};}
const AR=(()=>{const m=decodeTexModel(AR_DATA),R=m.R;
  return {mat:m.mat,geo:{main:m.sub([R[0],R[2],R[3]],true),holo:m.sub([R[1]],true),hlHolo:m.sub([R[1]]),hlMag:m.sub([R[2]]),hlBarrel:m.sub([R[3]])}};})();
const QBZ=(()=>{const b=decodeTexModel(QBZ_DATA[0]),g=decodeTexModel(QBZ_DATA[1]);
  return {body:b.sub([b.R[0],b.R[1]],true),mag:g.sub([g.R[0]],true),bodyMat:b.mat,magMat:g.mat,hlBarrel:b.sub([b.R[1]]),hlMag:g.sub([g.R[0]])};})();
function rifleParts(a){const p=[];const BL=[0.07,0.07,0.075],DK=[0.04,0.04,0.045];const Q=a.model==='qbz';
  const bar=a.barrel||'std';let mz=Q?-0.502:-0.472;
  if(bar==='ext'){// extended barrel: suppressor threaded onto the muzzle device
    const z1=mz+0.027;p.push(P_(cyl(0.017,0.017,0.17,18),M(0,0.012,z1-0.085,Math.PI/2,0,0),BL));p.push(P_(cyl(0.0175,0.0175,0.008,18),M(0,0.012,z1-0.003,Math.PI/2,0,0),DK));
    p.push(P_(cyl(0.0175,0.0175,0.008,18),M(0,0.012,z1-0.167,Math.PI/2,0,0),DK));p.push(P_(cyl(0.0045,0.0045,0.002,10),M(0,0.012,z1-0.1715,Math.PI/2,0,0),[0.01,0.01,0.01]));mz=z1-0.171;}
  const sp=p.length;const mag=SCOPES[a.scope]||0;let sight=Q?0.072:0.065;const tex=Q?[{g:QBZ.body,m:QBZ.bodyMat},{g:QBZ.mag,m:QBZ.magMat}]:[{g:AR.geo.main,m:AR.mat}];const ry=Q?0.01:0;
  if(mag){// magnified scope on the flat-top rail (replaces the holo sight)
    const len=mag<2?0.17:mag<4?0.25:0.31,ob=mag<2?0.016:mag<4?0.02:0.026,sy=0.082+ry,z0=-0.01;sight=sy;
    p.push(P_(new THREE.BoxGeometry(0.024,0.026,0.12),M(0,0.052+ry,z0),DK));
    for(const z of[z0-0.04,z0+0.05])p.push(P_(new THREE.TorusGeometry(0.0145,0.004,6,16),M(0,sy,z),DK));
    p.push(P_(cyl(0.0125,0.0125,len*0.6,16),M(0,sy,z0,Math.PI/2,0,0),BL));
    p.push(P_(cyl(ob,0.0125,len*0.25,16),M(0,sy,z0-len*0.42,Math.PI/2,0,0),BL));
    p.push(P_(cyl(0.0135,0.016,len*0.18,16),M(0,sy,z0+len*0.38,Math.PI/2,0,0),BL));
    p.push(P_(cyl(ob*0.85,ob*0.85,0.002,16),M(0,sy,z0-len*0.55,Math.PI/2,0,0),[0.12,0.2,0.32]));
    p.push(P_(cyl(0.006,0.006,0.012,10),M(0,sy+0.018,z0),[0.1,0.1,0.1]));p.push(P_(cyl(0.006,0.006,0.012,10),M(0.018,sy,z0,0,0,Math.PI/2),[0.1,0.1,0.1]));}
  else if(!Q)tex.push({g:AR.geo.holo,m:AR.mat});
  const hl={barrel:Q?QBZ.hlBarrel:AR.geo.hlBarrel,mag:Q?QBZ.hlMag:AR.geo.hlMag,scope:mag?mergeParts(p.slice(sp)):Q?null:AR.geo.hlHolo};
  const base=p.length?mergeParts(p):new THREE.BufferGeometry();
  return {base,tex,hl,muzzleZ:mz-0.003,sight,mag,sightX:Q&&!mag?0.005:0};}

/* ---- pump-action shotgun ---- */
function shotgunParts(a){const p=[],f=[];const mk={},MK=n=>{mk[n]=p.length;};const wood=a.finish==='walnut';const SK=wood?[0.42,0.22,0.1]:[0.07,0.07,0.075],RC=[0.12,0.12,0.13],BL=[0.1,0.1,0.11];
  const skin=wood?woodCol(SK):stip(SK);
  // receiver with ejection port, safety, loading port
  p.push(P_(ext([[-0.12,-0.032],[-0.12,0.032],[-0.1,0.04],[0.07,0.04],[0.1,0.03],[0.1,-0.034],[0.04,-0.036],[-0.08,-0.036]],0.05,0.004),null,RC));
  p.push(P_(new THREE.BoxGeometry(0.002,0.026,0.07),M(0.0255,0.012,-0.05),[0.03,0.03,0.03]));p.push(P_(new THREE.BoxGeometry(0.03,0.004,0.11),M(0,-0.037,-0.03),[0.04,0.04,0.04]));
  p.push(P_(cyl(0.005,0.005,0.006,10),M(0,0.043,0.085),[0.5,0.12,0.08]));
  MK('tube');
  p.push(P_(cyl(0.0115,0.0118,0.5,16),M(0,0.018,-0.37,Math.PI/2,0,0),BL));p.push(P_(cyl(0.0048,0.0048,0.003,10),M(0,0.018,-0.621,Math.PI/2,0,0),[0.02,0.02,0.02]));
  p.push(P_(cyl(0.0105,0.0105,0.44,14),M(0,-0.016,-0.34,Math.PI/2,0,0),BL));p.push(P_(cyl(0.0125,0.0125,0.02,14),M(0,-0.016,-0.565,Math.PI/2,0,0),BL));
  p.push(P_(new THREE.BoxGeometry(0.018,0.042,0.016),M(0,0.001,-0.54),BL));p.push(P_(new THREE.BoxGeometry(0.008,0.005,0.5),M(0,0.0315,-0.37),[0.07,0.07,0.08]));p.push(P_(new THREE.SphereGeometry(0.0038,10,8),M(0,0.037,-0.612),[0.95,0.76,0.32]));
  p.push(P_(new THREE.BoxGeometry(0.03,0.003,0.16),M(0,0.0415,-0.02),[0.05,0.05,0.05]));
  MK('stock');
  if(wood)p.push(P_(colorize(ext([[0.1,0.03],[0.13,0.026],[0.4,0.02],[0.41,0.02],[0.41,-0.118],[0.39,-0.12],[0.14,-0.05],[0.1,-0.036]],0.044,0.007),skin),null,SK));
  else{p.push(P_(colorize(ext([[0.1,0.03],[0.4,0.012],[0.41,0.012],[0.41,-0.112],[0.39,-0.116],[0.2,-0.07],[0.15,-0.06],[0.12,-0.04],[0.1,-0.036]],0.044,0.007),skin),null,SK));
    p.push(P_(colorize(ext([[0.06,-0.034],[0.1,-0.034],[0.135,-0.11],[0.12,-0.122],[0.09,-0.12],[0.07,-0.06]],0.034,0.006),stip(SK)),null,SK));}
  p.push(P_(new THREE.BoxGeometry(0.046,0.13,0.012),M(0,-0.05,0.416),[0.05,0.05,0.05]));
  p.push(P_(new THREE.TorusGeometry(0.019,0.0035,6,18,Math.PI),M(0,-0.038,0.045,0,Math.PI/2,Math.PI),RC));
  p.push(P_(ext([[0.034,-0.036],[0.037,-0.05],[0.043,-0.058],[0.047,-0.056],[0.043,-0.046],[0.041,-0.036]],0.006,0.001),null,BL));
  MK('fore');
  if(a.grip==='pump')f.push(P_(colorize(ext([[-0.24,-0.003],[-0.24,-0.03],[-0.235,-0.036],[-0.425,-0.036],[-0.43,-0.03],[-0.43,-0.003]],0.046,0.008),p2=>{const c=skin(p2);const k=Math.abs(Math.sin(p2.z*220))>0.85&&p2.y<-0.01?0.6:1;return [c[0]*k,c[1]*k,c[2]*k];}),null,SK));
  else{f.push(P_(colorize(ext([[-0.25,-0.004],[-0.25,-0.03],[-0.42,-0.03],[-0.42,-0.004]],0.042,0.006),stip([0.07,0.07,0.075])),null,BLK));
    f.push(P_(new THREE.BoxGeometry(0.018,0.004,0.16),M(0,-0.035,-0.335),[0.06,0.06,0.06]));
    if(a.grip==='vert')f.push(P_(colorize(ext([[-0.31,-0.034],[-0.35,-0.034],[-0.352,-0.13],[-0.34,-0.138],[-0.318,-0.136],[-0.312,-0.13]],0.03,0.006),stip(BLK)),null,BLK));
    else f.push(P_(colorize(ext([[-0.31,-0.034],[-0.35,-0.034],[-0.35,-0.07],[-0.312,-0.07]],0.032,0.006),stip(BLK)),null,BLK));}
  const hl={ammo:mergeParts(p.slice(mk.tube,mk.stock)),finish:mergeParts(p.slice(mk.stock,mk.fore)),grip:mergeParts(f)};
  return {base:mergeParts(p),forend:mergeParts(f),hl,muzzleZ:-0.624,sight:0.05,adsZ:-0.4};}

function rpgParts(a,vm){const p=[],f=[];const mk={},MK=n=>{mk[n]=p.length;};const ST=[0.2,0.21,0.2],DK=[0.08,0.08,0.09],WD=[0.42,0.24,0.12],OL=[0.3,0.34,0.2],BR=[0.6,0.5,0.25];
  MK('tube');
  if(vm)p.push(P_(cyl(0.032,0.032,0.6,16),M(0,0,-0.05,Math.PI/2,0,0),ST));else{p.push(P_(cyl(0.032,0.032,0.86,16),M(0,0,0.08,Math.PI/2,0,0),ST));
  p.push(P_(cyl(0.062,0.034,0.2,16),M(0,0,0.6,Math.PI/2,0,0),ST));p.push(P_(cyl(0.064,0.064,0.012,16),M(0,0,0.705,Math.PI/2,0,0),DK));}
  p.push(P_(cyl(0.038,0.038,0.03,14),M(0,0,-0.35,Math.PI/2,0,0),DK));
  p.push(P_(colorize(cyl(0.046,0.046,0.26,16),woodCol(WD)),M(0,0,0.06,Math.PI/2,0,0),WD));
  for(const z of[-0.08,0.2])p.push(P_(cyl(0.048,0.048,0.012,16),M(0,0,z,Math.PI/2,0,0),DK));
  // pistol grip, trigger and guard; front grip
  p.push(P_(ext([[0.02,-0.03],[0.05,-0.03],[0.075,-0.13],[0.05,-0.14],[0.025,-0.06]],0.03,0.004),null,DK));
  p.push(P_(new THREE.TorusGeometry(0.018,0.003,6,14,Math.PI),M(0,-0.045,-0.01,0,Math.PI/2,Math.PI),DK));
  p.push(P_(ext([[-0.005,-0.03],[-0.002,-0.045],[0.004,-0.052],[0.008,-0.05],[0.004,-0.04],[0.002,-0.03]],0.006,0.001),null,DK));
  p.push(P_(ext([[-0.14,-0.03],[-0.105,-0.03],[-0.11,-0.12],[-0.135,-0.12]],0.028,0.004),null,DK));
  // iron sights
  p.push(P_(new THREE.BoxGeometry(0.004,0.05,0.008),M(0,0.05,-0.22),DK));p.push(P_(new THREE.BoxGeometry(0.02,0.03,0.01),M(0,0.045,0.12),DK));
  MK('scope');
  if(a.scope==='2.5x'){p.push(P_(new THREE.BoxGeometry(0.02,0.04,0.06),M(-0.04,0.03,0.06),DK));p.push(P_(cyl(0.017,0.017,0.16,14),M(-0.045,0.062,0.07,Math.PI/2,0,0),OL));
    p.push(P_(cyl(0.02,0.017,0.03,14),M(-0.045,0.062,0.165,Math.PI/2,0,0),DK));p.push(P_(cyl(0.014,0.014,0.002,14),M(-0.045,0.062,-0.011,Math.PI/2,0,0),[0.12,0.2,0.3]));}
  MK('end');
  // the rocket: fins tucked in the tube, bulbous warhead and nose cone out front (separate so it can disappear when fired)
  const RC=a.warhead==='fire'?[0.55,0.18,0.1]:OL;
  f.push(P_(cyl(0.024,0.03,0.1,14),M(0,0,-0.4,Math.PI/2,0,0),RC));f.push(P_(cyl(0.048,0.03,0.12,16),M(0,0,-0.5,Math.PI/2,0,0),RC));
  f.push(P_(new THREE.ConeGeometry(0.048,0.14,16),M(0,0,-0.63,-Math.PI/2,0,0),RC));f.push(P_(cyl(0.006,0.006,0.03,8),M(0,0,-0.715,Math.PI/2,0,0),BR));
  const hl={scope:p.length>mk.scope?mergeParts(p.slice(mk.scope,mk.end)):null,warhead:mergeParts(f)};
  return {base:mergeParts(p),forend:mergeParts(f),hl,muzzleZ:-0.37,sight:a.scope==='2.5x'?0.062:0.04,adsZ:-0.34,sightX:a.scope==='2.5x'?-0.07:-0.06};}
function rocketGeo(warhead){const f=[],RC=warhead==='fire'?[0.55,0.18,0.1]:[0.3,0.34,0.2];
  f.push(P_(cyl(0.024,0.03,0.1,12),M(0,0,0.1,Math.PI/2,0,0),RC));f.push(P_(cyl(0.048,0.03,0.12,14),M(0,0,0,Math.PI/2,0,0),RC));
  f.push(P_(new THREE.ConeGeometry(0.048,0.14,14),M(0,0,-0.13,-Math.PI/2,0,0),RC));for(let i=0;i<4;i++)f.push(P_(new THREE.BoxGeometry(0.004,0.06,0.07),M(0,0,0.17,0,0,i*Math.PI/4),[0.2,0.2,0.2]));return mergeParts(f);}
/* ---- Jessa's pipe wrench (melee): long steel handle with cord-wrapped grips, hook jaw, knurled adjusting nut ---- */
function wrenchParts(a){const p=[];const ST=[0.42,0.42,0.44],DS=[0.26,0.26,0.27],RU=[0.42,0.24,0.12];const steel=a.grip==='steel';
  const rusty=p2=>{const r=Math.max(0,vnoise(p2.x*40,p2.y*40,p2.z*40)-0.55)*2;return mixc(mulc(ST,0.85+0.2*vnoise(p2.x*120,p2.y*120,p2.z*120)),RU,r);};
  p.push(P_(colorize(cyl(0.017,0.019,0.5,14),rusty),M(0,0,-0.03,Math.PI/2,0,0)));
  p.push(P_(colorize(cyl(0.021,0.021,0.03,14),()=>DS),M(0,0,0.235,Math.PI/2,0,0)));
  const wrap=p2=>{const k=(Math.floor(p2.z*90)+Math.floor(Math.atan2(p2.y,p2.x)*4))%2?0.7:1;return mulc([0.32,0.3,0.26],k);};
  for(const [z,L] of[[0.12,0.13],[-0.12,0.12]])p.push(P_(colorize(cyl(0.022,0.022,L,14),steel?rusty:wrap),M(0,0,z,Math.PI/2,0,0)));
  const MK=p.length;
  p.push(P_(colorize(ext([[-0.26,-0.02],[-0.26,0.026],[-0.4,0.026],[-0.42,0.018],[-0.42,-0.004],[-0.4,-0.01],[-0.33,-0.012],[-0.33,-0.02]],0.034,0.004),rusty),null,ST));
  p.push(P_(colorize(ext([[-0.31,0.03],[-0.31,0.075],[-0.41,0.075],[-0.43,0.066],[-0.43,0.044],[-0.39,0.044],[-0.39,0.03]],0.032,0.004),rusty),null,ST));
  for(let i=0;i<5;i++)p.push(P_(new THREE.BoxGeometry(0.033,0.004,0.005),M(0,0.041,-0.395+i*0.008),DS),P_(new THREE.BoxGeometry(0.035,0.004,0.005),M(0,0.03,-0.395+i*0.008),DS));
  p.push(P_(colorize(cyl(0.026,0.026,0.04,16),p2=>Math.abs(Math.sin(Math.atan2(p2.x,p2.z)*12))>0.6?DS:ST),M(0,0.028,-0.29,Math.PI/2,0,0)));
  p.push(P_(colorize(cyl(0.008,0.008,0.05,8),()=>DS),M(0.02,0.0,-0.3,0,0,Math.PI/2)));
  return {base:mergeParts(p),hl:{grip:mergeParts(p.slice(2,4)),head:mergeParts(p.slice(MK))},muzzleZ:-0.43,sight:0.05};}
/* ---- Jessa's jury-rigged weld gun: pistol grip, steel body, gas bottle, copper nozzle, hose ---- */
function weldParts(a){const p=[];const ST=[0.3,0.31,0.32],DK=[0.08,0.08,0.085],CU=[0.62,0.36,0.18],YL=[0.75,0.6,0.12];const wide=a.tip==='wide';
  const worn=c=>p2=>{const r=Math.max(0,vnoise(p2.x*50,p2.y*50,p2.z*50)-0.6)*2;return mixc(mulc(c,0.85+0.2*vnoise(p2.x*140,p2.y*140,p2.z*140)),[0.35,0.22,0.12],r);};
  p.push(P_(colorize(new THREE.BoxGeometry(0.034,0.11,0.045),worn(DK)),M(0,-0.06,0.06,-0.25,0,0)));
  p.push(P_(colorize(new THREE.BoxGeometry(0.04,0.055,0.2),worn(ST)),M(0,0.018,-0.01)));
  p.push(P_(colorize(new THREE.BoxGeometry(0.044,0.02,0.07),worn(DK)),M(0,0.052,0.03)));
  p.push(P_(colorize(new THREE.BoxGeometry(0.01,0.03,0.03),()=>DK),M(0,-0.02,0.0,0.4,0,0)));
  p.push(P_(colorize(cyl(0.022,0.022,0.14,14),worn(YL)),M(0,-0.028,-0.06,Math.PI/2,0,0)),P_(colorize(cyl(0.012,0.012,0.02,10),()=>DK),M(0,-0.028,0.018,Math.PI/2,0,0)));
  for(const z of[-0.03,-0.1])p.push(P_(colorize(cyl(0.024,0.024,0.008,14),()=>DK),M(0,-0.028,z,Math.PI/2,0,0)));
  const MK=p.length;
  p.push(P_(colorize(cyl(0.012,wide?0.022:0.016,0.09,12),worn(CU)),M(0,0.019,-0.155,Math.PI/2,0,0)));
  p.push(P_(colorize(cyl(0.006,0.006,0.012,8),()=>[0.15,0.15,0.15]),M(0,0.019,-0.205,Math.PI/2,0,0)));
  p.push(P_(colorize(new THREE.TorusGeometry(0.03,0.007,6,14,Math.PI*1.3),()=>DK),M(0,-0.12,0.1,0,Math.PI/2,0)));
  return {base:mergeParts(p),hl:{tip:mergeParts(p.slice(MK,MK+2))},muzzleZ:-0.212,sight:0.06};}
const GUN_PARTS={rifle:rifleParts,shotgun:shotgunParts,magnum:magnumParts,rpg:rpgParts,wrench:wrenchParts,weld:weldParts};
const GUNS={
  rifle:{name:'AR-15',mag:30,cd:0.105,dmg:1.3,pellets:1,spread:0.006,reserve:Infinity,reload:1.7,recoil:1,sound:'rifle',muzzle:[0,0.012,-0.475],eject:[0.03,0.045,0.03],sight:0.065,
    grR:[0.0,-0.11,0.11],grL:[0.0,-0.05,-0.28],rotR:[0.35,1.57,0],rotL:[0.2,-1.45,-1.6],magPos:[0,-0.17,-0.07],
    aim:[0.115,0.43,-0.25,0,0,0],low:[0.07,0.3,-0.34,-0.5,0,0.45],rel:[0.06,0.33,-0.24,0.3,0,0.6]},
  shotgun:{name:'Shotgun',mag:6,cd:0.72,dmg:1,pellets:8,spread:0.06,reserve:24,reload:2.4,recoil:2.4,sound:'shotgun',muzzle:[0,0.018,-0.63],eject:[0.03,0.02,0],
    grR:[0.0,-0.045,0.09],grL:[0.0,-0.035,-0.34],rotR:[0.35,1.57,0],rotL:[0.2,-1.45,-1.6],magPos:[0,-0.04,-0.05],
    aim:[0.115,0.43,-0.25,0,0,0],low:[0.07,0.3,-0.34,-0.5,0,0.45],rel:[0.06,0.33,-0.26,0.25,0,0.7]},
  magnum:{name:'Magnum',mag:6,cd:0.42,dmg:5,pellets:1,spread:0.003,reserve:18,reload:1.9,recoil:2,sound:'magnum',muzzle:[0,0.019,-0.2],eject:null,
    grR:[0,-0.06,0.05],grL:[-0.035,-0.07,0.045],rotR:[0.3,1.57,0],rotL:[0.3,-1.57,0],magPos:[0,0,-0.03],
    aim:[0.02,0.43,-0.47,0,0,0],low:[0.06,0.2,-0.26,-0.9,0,0.1],rel:[0.04,0.36,-0.32,0.7,0,0.5]}
};
GUNS.rpg={name:'RPG-7',mag:1,cd:0.8,dmg:0,pellets:1,spread:0.003,reserve:4,reload:2.6,recoil:2.4,sound:'rpg',rocket:true,muzzle:[0,0,-0.37],eject:null,sight:0.05,
  grR:[0,-0.06,0.05],grL:[0,-0.06,-0.12],rotR:[0.35,1.57,0],rotL:[0.2,-1.45,-1.6],magPos:[0,0,-0.4],
  aim:[0.13,0.5,-0.16,0,0,0],low:[0.1,0.36,-0.22,-0.35,0,0.4],rel:[0.08,0.4,-0.24,0.2,0,0.5]};
GUNS.wrench={name:'Pipe Wrench',melee:true,mag:1,cd:0.6,dmg:3.4,pellets:1,spread:0,reserve:Infinity,reload:1,recoil:0.6,sound:'swing',muzzle:[0,0.02,-0.43],eject:null,sight:0.05,
  grR:[0,0,0.12],grL:[0,0,-0.12],rotR:[0.35,1.57,0],rotL:[0.2,-1.45,-1.6],magPos:[0,0,0],
  aim:[0.09,0.3,-0.3,-0.35,0,0.55],low:[0.08,0.28,-0.32,-0.45,0,0.6],rel:[0.08,0.28,-0.32,-0.45,0,0.6]};
GUNS.weld={name:'Weld Gun',weld:true,mag:45,cd:0.07,dmg:0.36,pellets:1,spread:0,reserve:135,reload:2.2,recoil:0.2,sound:'magnum',muzzle:[0,0.019,-0.212],eject:null,sight:0.06,range:6.5,cone:0.28,
  grR:[0,-0.06,0.05],grL:[-0.035,-0.07,0.045],rotR:[0.3,1.57,0],rotL:[0.3,-1.57,0],magPos:[0,-0.03,-0.06],
  aim:[0.02,0.43,-0.47,0,0,0],low:[0.06,0.2,-0.26,-0.9,0,0.1],rel:[0.04,0.36,-0.32,0.7,0,0.5]};
const GUNS_BASE=JSON.parse(JSON.stringify(GUNS));GUNS_BASE.rifle.reserve=Infinity;

/* ================= characters ================= */
const humanMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.72,metalness:0});
const HERO_LOOK={slick:true,skin:[0.72,0.52,0.4],hair:[0.06,0.05,0.045],gray:0.1,age:0.3,stubble:0,hi:true,seed:1,iris:[0.22,0.14,0.09],beard:true,beardLen:0.5,beardCol:[0.06,0.05,0.045],glasses:true,smile:true,pin:true,shirt:{kind:'jacket',suit:true,base:[0.17,0.17,0.19],tee:[0.04,0.04,0.05]},pants:[0.16,0.16,0.18],shoes:[0.025,0.025,0.03],belt:true,poseR:'grip',poseL:'foregrip'};
const heroMat=humanMat.clone();addBurn(heroMat);const hero=buildHuman(buildBodyGeos(HERO_LOOK),heroMat);hero.root.rotation.order='YXZ';scene.add(hero.root);hero.baseMeshes=[];hero.root.traverse(o=>{if(o.isMesh)hero.baseMeshes.push(o);});
hero.gun=pivot(0,0,0,hero.torso);hero.gunMeshes={};
// each gun is a group: the static body plus a movable part (the shotgun's pump); rebuilt when attachments change
function fillGunGroup(grp,k,parts){while(grp.children.length){const c=grp.children.pop();}const b=new THREE.Mesh(parts.base,gunMat);b.castShadow=true;grp.add(b);
  if(parts.tex)for(const tg of parts.tex){const t=new THREE.Mesh(tg.g,tg.m);t.castShadow=true;grp.add(t);}
  const f=new THREE.Mesh(parts.forend||new THREE.BufferGeometry(),gunMat);f.castShadow=true;grp.add(f);grp.userData.forend=f;
  grp.userData.hl={};if(parts.hl)for(const k in parts.hl){if(!parts.hl[k])continue;const m=new THREE.Mesh(parts.hl[k],HL_MAT);m.visible=false;m.renderOrder=3;(k==='grip'&&parts.forend&&f?f:grp).add(m);grp.userData.hl[k]=m;}}
const HL_MAT=new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0.25,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const GUN_GEO={};function buildGunGeo(k){const old=GUN_GEO[k];GUN_GEO[k]=GUN_PARTS[k](ATT[k]);if(old){old.base.dispose();if(old.forend)old.forend.dispose();}return GUN_GEO[k];}
for(const k in GUNS){const grp=new THREE.Group();grp.visible=false;fillGunGroup(grp,k,buildGunGeo(k));hero.gun.add(grp);hero.gunMeshes[k]=grp;}
hero.muzzle=pivot(0,0,-0.7,hero.gun);
const ZLOOKS=[
  {skin:[0.66,0.66,0.58],hair:[0.12,0.1,0.08],longHair:2.6,shirt:{kind:'tee',base:[0.2,0.18,0.16]},jacket:[0.3,0.37,0.48],pants:[0.2,0.24,0.32],shoes:[0.16,0.12,0.1],sleeves:'long'},
  {skin:[0.68,0.66,0.56],hair:[0.36,0.24,0.16],longHair:2.0,recede:1.2,shirt:{kind:'plaid',base:[0.38,0.3,0.24]},jacket:[0.42,0.36,0.28],pants:[0.36,0.33,0.26],shoes:[0.2,0.15,0.1],sleeves:'long'},
  {skin:[0.7,0.68,0.6],hair:[0.3,0.22,0.15],longHair:3.6,female:true,dress:[0.36,0.25,0.19],shirt:{kind:'tee',base:[0.36,0.25,0.19]},pants:[0.15,0.13,0.12],shoes:[0.18,0.14,0.1],sleeves:'long'},
  {skin:[0.72,0.7,0.62],hair:[0.56,0.48,0.33],longHair:3.2,female:true,shirt:{kind:'tee',base:[0.44,0.41,0.37]},pants:[0.32,0.3,0.22],shoes:[0.26,0.22,0.18],sleeves:'long'},
  {skin:[0.64,0.66,0.6],hair:[0.52,0.5,0.47],longHair:2.4,shirt:{kind:'tee',base:[0.26,0.23,0.2]},jacket:[0.45,0.2,0.15],jacketKind:'plaid',pants:[0.26,0.23,0.19],shoes:[0.12,0.1,0.08],sleeves:'long'},
  {skin:[0.66,0.64,0.56],hair:[0.2,0.18,0.15],bald:true,shirt:{kind:'tee',base:[0.4,0.38,0.33]},jacket:[0.3,0.28,0.26],pants:[0.19,0.18,0.18],shoes:[0.1,0.09,0.08],sleeves:'long'},
  // hospital patient in a pale gown
  {skin:[0.74,0.72,0.66],hair:[0.2,0.18,0.15],bald:true,shirt:{kind:'tee',base:[0.58,0.68,0.74]},pants:[0.56,0.66,0.72],shoes:[0.82,0.82,0.8],sleeves:'short'},
  // construction worker in hi-vis orange
  {skin:[0.62,0.6,0.5],hair:[0.18,0.14,0.1],shirt:{kind:'tee',base:[0.88,0.46,0.08]},pants:[0.18,0.24,0.38],shoes:[0.3,0.2,0.1],sleeves:'short'},
  // nurse in teal scrubs
  {skin:[0.68,0.64,0.58],hair:[0.1,0.08,0.07],longHair:2.2,female:true,shirt:{kind:'tee',base:[0.16,0.48,0.48]},pants:[0.15,0.45,0.45],shoes:[0.85,0.85,0.83],sleeves:'short'},
  // businessman in a dark suit and white shirt
  {skin:[0.66,0.64,0.58],hair:[0.25,0.2,0.16],recede:1.4,shirt:{kind:'tee',base:[0.82,0.82,0.78]},jacket:[0.11,0.11,0.13],pants:[0.12,0.12,0.14],shoes:[0.04,0.04,0.04],sleeves:'long'},
  // police officer in navy
  {skin:[0.58,0.52,0.44],hair:[0.08,0.07,0.06],shirt:{kind:'tee',base:[0.1,0.14,0.3]},pants:[0.08,0.1,0.2],shoes:[0.03,0.03,0.03],sleeves:'long'},
  // firefighter in tan turnout gear
  {skin:[0.64,0.62,0.54],hair:[0.32,0.22,0.12],shirt:{kind:'tee',base:[0.16,0.15,0.14]},jacket:[0.62,0.5,0.26],pants:[0.56,0.46,0.24],shoes:[0.05,0.05,0.05],sleeves:'long'},
  // jogger in a red top
  {skin:[0.72,0.68,0.6],hair:[0.72,0.6,0.38],longHair:3.0,female:true,shirt:{kind:'tee',base:[0.76,0.12,0.14]},pants:[0.06,0.06,0.07],shoes:[0.88,0.88,0.88],sleeves:'short'},
  // zombie soldiers: helmet, plate carrier, gloves, glowing red eyes (tac = gear set in ZTAC)
  {skin:[0.56,0.56,0.5],hair:[0.1,0.09,0.08],bald:true,shirt:{kind:'tee',base:[0.24,0.26,0.19]},pants:[0.23,0.25,0.18],shoes:[0.1,0.08,0.06],sleeves:'long',gloves:[0.09,0.09,0.08],tac:0},
  {skin:[0.6,0.58,0.52],hair:[0.1,0.09,0.08],bald:true,shirt:{kind:'tee',base:[0.08,0.08,0.09]},pants:[0.07,0.07,0.08],shoes:[0.04,0.04,0.04],sleeves:'long',gloves:[0.05,0.05,0.05],tac:1},
  {skin:[0.58,0.57,0.52],hair:[0.1,0.09,0.08],bald:true,shirt:{kind:'tee',base:[0.26,0.28,0.31]},pants:[0.2,0.21,0.23],shoes:[0.05,0.05,0.05],sleeves:'long',gloves:[0.07,0.07,0.07],tac:2},
  // special infected (not in the random pool): gaunt runner and toxic spitter
  {spec:'gaunt',skin:[0.36,0.37,0.34],hair:[0.1,0.1,0.1],bald:true,shirt:{kind:'tee',base:[0.27,0.28,0.25]},pants:[0.25,0.26,0.23],shoes:[0.3,0.3,0.28],sleeves:'none'},
  {spec:'brute',skin:[0.56,0.33,0.29],hair:[0.1,0.1,0.1],bald:true,shirt:{kind:'tee',base:[0.2,0.17,0.15]},pants:[0.2,0.21,0.15],shoes:[0.12,0.1,0.08],sleeves:'none',gloves:null},
  {spec:'spitter',skin:[0.42,0.47,0.2],hair:[0.1,0.1,0.1],bald:true,shirt:{kind:'tee',base:[0.36,0.42,0.16]},pants:[0.2,0.22,0.1],shoes:[0.32,0.36,0.14],sleeves:'none'}];

const zGeoCache=[];
function zGeos(i){if(!zGeoCache[i])zGeoCache[i]=buildBodyGeos(Object.assign({age:0.6,zombie:true,seed:i*7+3,iris:[0.62,0.66,0.66],poseR:'claw',poseL:'claw'},ZLOOKS[i]));return zGeoCache[i];}

/* ================= fx pools ================= */
const muzzleLight=new THREE.PointLight(0xffc070,0,9,2);scene.add(muzzleLight);
const flash=new THREE.Sprite(new THREE.SpriteMaterial({map:flashTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));flash.visible=false;scene.add(flash);
const sparks=[];for(let i=0;i<18;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));s.visible=false;scene.add(s);sparks.push({s,life:0,max:0.2,vy:0,size:1});}
function spark(p,color,size,add){const k=sparks.find(x=>x.life<=0)||sparks[0];k.s.position.copy(p);k.s.material.color.setHex(color);
  k.s.material.blending=add===false?THREE.NormalBlending:THREE.AdditiveBlending;k.max=k.life=add===false?0.35:0.15+Math.random()*0.08;k.size=size;k.s.visible=true;k.vy=add===false?0.3:0.8;}
const tracers=[];for(let i=0;i<8;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
  const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xffe1a0,transparent:true,opacity:0.9}));l.visible=false;l.frustumCulled=false;scene.add(l);tracers.push({l,life:0});}
function tracer(a,b){const t=tracers.find(x=>x.life<=0)||tracers[0];const p=t.l.geometry.attributes.position;p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,b.x,b.y,b.z);p.needsUpdate=true;t.life=0.05;t.l.visible=true;}
const brassMat=new THREE.MeshStandardMaterial({color:0xc9a040,metalness:0.8,roughness:0.3});const shellMat=new THREE.MeshStandardMaterial({color:0x9a1a14,metalness:0.2,roughness:0.5});
const casings=[];for(let i=0;i<24;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.005,0.024,6),brassMat);m.visible=false;scene.add(m);casings.push({m,v:new THREE.Vector3(),life:0,spin:0});}
function ejectCasing(pos,dirR,shell){const c=casings.find(x=>x.life<=0)||casings[0];c.m.material=shell?shellMat:brassMat;c.m.scale.setScalar(shell?1.8:1);c.m.position.copy(pos);
  c.v.copy(dirR).multiplyScalar(1.8+Math.random()).add(new THREE.Vector3(0,1.6+Math.random(),0));c.life=3;c.spin=(Math.random()-.5)*30;c.m.visible=true;}

