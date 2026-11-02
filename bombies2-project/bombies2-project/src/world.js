
/* ================= sky + lights (dusk) ================= */
const MAP=(()=>{try{return (JSON.parse(localStorage.getItem('sb-outbreak-set')||'{}').map)||'park';}catch(e){return 'park';}})();const PARK={};const HORDE=(()=>{try{return (JSON.parse(localStorage.getItem('sb-outbreak-set')||'{}').mode)==='horde';}catch(e){return false;}})();const DEADZONE=(()=>{try{return (JSON.parse(localStorage.getItem('sb-outbreak-set')||'{}').mode)==='deadzone';}catch(e){return false;}})()&&MAP==='garage';
const SUN_DIR=new THREE.Vector3(-0.82,0.42,0.38).normalize();
const skyTex=canvasTex(64,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#1c2433');gr.addColorStop(0.42,'#4a4f5c');gr.addColorStop(0.5,'#c98a5a');gr.addColorStop(0.53,'#7a6656');gr.addColorStop(1,'#2a2725');g.fillStyle=gr;g.fillRect(0,0,w,h);});
skyTex.wrapS=THREE.ClampToEdgeWrapping;skyTex.wrapT=THREE.ClampToEdgeWrapping;
const sky=new THREE.Mesh(new THREE.SphereGeometry(110,24,16),new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,fog:false,depthWrite:false}));sky.renderOrder=-2;scene.add(sky);
const sunGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffb070,blending:THREE.AdditiveBlending,fog:false,depthWrite:false,transparent:true,opacity:0.9}));sunGlow.scale.set(40,40,1);scene.add(sunGlow);
const cloudTex=canvasTex(512,256,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<70;i++){const x=Math.random()*w,y=h*0.25+Math.random()*h*0.5,r=20+Math.random()*60;const gr=g.createRadialGradient(x,y,0,x,y,r);
  gr.addColorStop(0,'rgba(90,85,90,.5)');gr.addColorStop(1,'rgba(90,85,90,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}});
const clouds=new THREE.Mesh(new THREE.CylinderGeometry(105,105,40,32,1,true),new THREE.MeshBasicMaterial({map:cloudTex,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false}));clouds.position.y=25;clouds.renderOrder=-1;scene.add(clouds);
scene.background=new THREE.Color(0x4a4a50);scene.fog=new THREE.Fog(0x5a5554,22,95);
const hemi=new THREE.HemisphereLight(0x9aa2b4,0x3a332c,0.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffc9a0,1.05);scene.add(sun);scene.add(sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:120});sun.shadow.bias=-0.0005;sun.shadow.normalBias=0.03;

const __pre=new Set(scene.children);
/* ================= world layout ================= */
const A=26,WALL_H=4.6,ROOF_Y=4.9,W=74;
const worldMeshes=[],colliders=[],camBlockers=[],surfaces=[],ladders=[],WATER=[];let fxNoWet=false;
function inWater(x,z,pad){return WATER.some(w=>((x-w.x)/(w.rx+0.8+pad))**2+((z-w.z)/(w.rz+0.8+pad))**2<1);}
// glossy floor: the scene is rendered mirrored into a texture each frame and blended in (planar reflection)
const reflRT=new THREE.WebGLRenderTarget(256,256,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
const reflUniforms={tRefl:{value:reflRT.texture},uRes:{value:new THREE.Vector2(1,1)},uWet:{value:0.36}};
const floorMat=lam(0xffffff,{map:floorTex});
floorMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,reflUniforms);
  sh.fragmentShader='uniform sampler2D tRefl;uniform float uWet;\nuniform vec2 uRes;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',
  'vec2 ruv=gl_FragCoord.xy/uRes;\n vec3 refl=texture2D(tRefl,ruv).rgb;\n float wet=uWet;\n gl_FragColor.rgb=gl_FragColor.rgb*(1.0-wet*0.45)+refl*wet;\n #include <dithering_fragment>');};
const floor=new THREE.Mesh(new THREE.PlaneGeometry(A*2,A*2),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);worldMeshes.push(floor);
const dbs=new THREE.Vector2();const REFL_HIDE=[];
function renderReflection(){
  renderer.getDrawingBufferSize(dbs);if(Q.post&&typeof sceneRT!=='undefined'&&sceneRT.width>2){if(typeof sizeRTs==='function')sizeRTs();reflUniforms.uRes.value.set(sceneRT.width,sceneRT.height);}else reflUniforms.uRes.value.copy(dbs);
  const rs=Q.reflLow?0.4:Q.ultra?1:(MAP==='park'?0.75:0.5);const w=Math.max(2,dbs.x*rs|0),h=Math.max(2,dbs.y*rs|0);
  if(reflRT.width!==w||reflRT.height!==h)reflRT.setSize(w,h);
  floor.visible=false;for(const m of REFL_HIDE)m.visible=false;const cp=camera.parent;if(cp)cp.remove(camera);scene.scale.y=-1;
  renderer.setRenderTarget(reflRT);renderer.render(scene,camera);renderer.setRenderTarget(null);
  scene.scale.y=1;if(cp)cp.add(camera);floor.visible=true;for(const m of REFL_HIDE)m.visible=true;
}

reflUniforms.uWet.value=0.3;floor.position.y=0.004;
function insideCollider(x,z,pad,y){if((y===undefined||y<1)&&WATER.length&&inWater(x,z,pad))return true;return colliders.some(c=>!c.off&&(y===undefined?(c.y0||0)<1:(y<(c.h||99)&&y>(c.y0||0)-0.1))&&Math.abs(x-c.x)<c.hw+pad&&Math.abs(z-c.z)<c.hd+pad);}
function collide(p,r,y){y=y||0;const lim=W-r-0.1;p.x=clamp(p.x,-lim,lim);p.z=clamp(p.z,-lim,lim);
  if(y<1)for(const w of WATER){const ax=w.rx+0.8+r,az=w.rz+0.8+r,ex=(p.x-w.x)/ax,ez=(p.z-w.z)/az,e=ex*ex+ez*ez;if(e<1){const k=1/Math.sqrt(Math.max(e,1e-6));p.x=w.x+(p.x-w.x)*k;p.z=w.z+(p.z-w.z)*k;}}
  for(const c of colliders){if(c.off)continue;if((c.h||99)<=y+0.3||(c.y0||0)>=y+1.6)continue;
    const cx=clamp(p.x,c.x-c.hw,c.x+c.hw),cz=clamp(p.z,c.z-c.hd,c.z+c.hd);let dx=p.x-cx,dz=p.z-cz;const d2=dx*dx+dz*dz;
    if(d2<r*r){if(d2<1e-6){dx=p.x-c.x;dz=p.z-c.z;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;p.x=c.x+dx*(c.hw+r);p.z=c.z+dz*(c.hd+r);}
      else{const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r;}}}}
function groundAt(x,z,y){let g=0;for(const s of surfaces){if(x>s.x0&&x<s.x1&&z>s.z0&&z<s.z1&&s.y<=y+0.4&&s.y>g)g=s.y;}return g;}
function roofAt(x,z,y){for(let i=0;i<surfaces.length;i++){const s=surfaces[i];if(x>s.x0&&x<s.x1&&z>s.z0&&z<s.z1&&Math.abs(s.y-y)<0.3)return i;}return -1;}
const vc=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.85,metalness:0.05});
function addCol(x,z,hw,hd,h,y0){const c={x,z,hw,hd,h:h||99,y0:y0||0};colliders.push(c);return c;}
// ground: asphalt city with roads and sidewalks
const asphaltTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#3a3a3c';g.fillRect(0,0,w,h);speckle(g,w,h,16000,40,55,.5);
  for(let i=0;i<6;i++){g.fillStyle=`rgba(${20+Math.random()*30|0},${20+Math.random()*30|0},${22+Math.random()*30|0},.35)`;g.fillRect(Math.random()*w,Math.random()*h,40+Math.random()*120,30+Math.random()*80);}
  g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=1.3;for(let i=0;i<10;i++){let x=Math.random()*w,y=Math.random()*h;g.beginPath();g.moveTo(x,y);for(let j=0;j<10;j++){x+=(Math.random()-.5)*40;y+=(Math.random()-.5)*40;g.lineTo(x,y);}g.stroke();}
},[28,28]);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(W*2+40,W*2+40),new THREE.MeshStandardMaterial({map:asphaltTex,roughness:0.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);worldMeshes.push(ground);
{const p=[],Y=[0.8,0.65,0.12],Wt=[0.8,0.8,0.76],SW=[0.42,0.41,0.39];
  for(const r of[33,-33]){for(let t=-W;t<W;t+=6){p.push(P_(new THREE.BoxGeometry(3,0.012,0.15),M(t,0.006,r),Y));p.push(P_(new THREE.BoxGeometry(0.15,0.012,3),M(r,0.006,t),Y));}
    p.push(P_(new THREE.BoxGeometry(W*2,0.012,0.12),M(0,0.006,r-4.6),Wt));p.push(P_(new THREE.BoxGeometry(W*2,0.012,0.12),M(0,0.006,r+4.6),Wt));
    p.push(P_(new THREE.BoxGeometry(0.12,0.012,W*2),M(r-4.6,0.006,0),Wt));p.push(P_(new THREE.BoxGeometry(0.12,0.012,W*2),M(r+4.6,0.006,0),Wt));}
  for(const r of[27.5,38.5,-27.5,-38.5]){p.push(P_(new THREE.BoxGeometry(W*2,0.14,1.6),M(0,0.07,r),SW));p.push(P_(new THREE.BoxGeometry(1.6,0.14,W*2),M(r,0.07,0),SW));}
  const m=new THREE.Mesh(mergeParts(p),new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.8}));m.receiveShadow=true;scene.add(m);}
// patch reflection so only the garage floor mirrors
const _rr=renderReflection;renderReflection=function(){if(Math.abs(P.x)>A+2||Math.abs(P.z)>A+2)return;ground.visible=false;_rr();ground.visible=true;};

/* ---------- the parking garage (enterable, windows on the sun side, roof you can climb onto) ---------- */
const wallMat=new THREE.MeshStandardMaterial({map:garageWallTex,roughness:0.9});
function wallSeg(x0,x1,z0,z1,y0,y1){const w=x1-x0,d=z1-z0,h=y1-y0;const t=garageWallTex.clone();t.needsUpdate=true;t.repeat.set(Math.max(w,d)/8,h/WALL_H);
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({map:t,roughness:0.9}));m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.castShadow=true;m.receiveShadow=true;
  scene.add(m);worldMeshes.push(m);camBlockers.push(m);if(y0<1)addCol((x0+x1)/2,(z0+z1)/2,w/2,d/2,ROOF_Y+0.05,0);return m;}
const T=1;
// north wall with a vehicle entrance, south wall with an entrance
wallSeg(-A-T,-5,-A-T,-A,0,WALL_H);wallSeg(5,A+T,-A-T,-A,0,WALL_H);wallSeg(-5,5,-A-T,-A,3.2,WALL_H);
wallSeg(-A-T,-4,A,A+T,0,WALL_H);wallSeg(4,A+T,A,A+T,0,WALL_H);wallSeg(-4,4,A,A+T,3.2,WALL_H);
wallSeg(A,A+T,-A,A,0,WALL_H);
// west wall: windows the low sun pours through
const WIN=[];{let z=-A;wallSeg(-A-T,-A,-A,A,0,1.1);wallSeg(-A-T,-A,-A,A,3.5,WALL_H);
  for(let k=0;k<7;k++){const zc=-21+k*7;wallSeg(-A-T,-A,z,zc-1.9,1.1,3.5);WIN.push(zc);z=zc+1.9;}wallSeg(-A-T,-A,z,A,1.1,3.5);
  const fm=new THREE.MeshStandardMaterial({color:0x222426,roughness:0.6,metalness:0.4});
  WIN.forEach(zc=>{for(const dz of[-1.9,0,1.9]){const b=new THREE.Mesh(new THREE.BoxGeometry(0.08,2.4,0.08),fm);b.position.set(-A-0.5,2.3,zc+dz);scene.add(b);}
    for(const y of[1.12,2.3,3.48]){const b=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.06,3.8),fm);b.position.set(-A-0.5,y,zc);scene.add(b);}});}
// ceiling slab (casts shadow so the inside is dark except where light comes in) and the roof surface on top
const slab=new THREE.Mesh(new THREE.BoxGeometry(A*2+2,0.3,A*2+2),new THREE.MeshStandardMaterial({color:0x56575a,roughness:0.95}));slab.position.y=WALL_H+0.15;slab.castShadow=true;slab.receiveShadow=true;scene.add(slab);worldMeshes.push(slab);camBlockers.push(slab);
surfaces.push({x0:-A-1,x1:A+1,z0:-A-1,z1:A+1,y:ROOF_Y,name:'Garage roof'});
{const bp=[];for(let i=-4;i<=4;i++)bp.push(P_(new THREE.BoxGeometry(A*2,0.45,0.5),M(0,WALL_H-0.22,i*6),[0.2,0.2,0.21]));const m=new THREE.Mesh(mergeParts(bp),vc);scene.add(m);}
// roof parapet + rooftop clutter
{const p=[],c=[0.45,0.45,0.44];const pw=(x,z,w,d)=>{p.push(P_(new THREE.BoxGeometry(w,0.7,d),M(x,ROOF_Y+0.35,z),c));addCol(x,z,w/2,d/2,ROOF_Y+0.7,ROOF_Y-0.05);};
  pw(0,-A-0.8,A*2+2,0.3);pw(-14,A+0.8,A*2-28+2,0.3);pw(14+1,A+0.8,A*2-28,0.3);pw(-A-0.8,0,0.3,A*2+2);pw(A+0.8,-14,0.3,A*2-28+2);pw(A+0.8,14+1,0.3,A*2-28);
  [[-12,-10],[8,6],[14,-16]].forEach(([x,z])=>{p.push(P_(new THREE.BoxGeometry(2.4,1.4,1.6),M(x,ROOF_Y+0.7,z),[0.55,0.56,0.58]));p.push(P_(new THREE.CylinderGeometry(0.5,0.5,0.15,16),M(x,ROOF_Y+1.45,z),[0.3,0.3,0.32]));addCol(x,z,1.2,0.8,ROOF_Y+1.4,ROOF_Y-0.05);});
  p.push(P_(new THREE.BoxGeometry(3,2.6,3),M(-4,ROOF_Y+1.3,14),[0.5,0.48,0.45]));addCol(-4,14,1.5,1.5,ROOF_Y+2.6,ROOF_Y-0.05);
  const m=new THREE.Mesh(mergeParts(p),vc);m.castShadow=true;m.receiveShadow=true;scene.add(m);worldMeshes.push(m);}
// god rays: shafts of sunlight through each west window, with dust hanging in them
const rayTex=canvasTex(128,64,(g,w,h)=>{const id=g.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/(w-1),v=y/(h-1);
  const a=Math.pow(1-u,1.4)*Math.pow(Math.sin(Math.PI*v),2)*Math.min(1,u*6)*(0.85+0.15*Math.sin(v*40+u*9));const k=(y*w+x)*4;id.data[k]=255;id.data[k+1]=255;id.data[k+2]=255;id.data[k+3]=a*255|0;}g.putImageData(id,0,0);});
rayTex.wrapS=rayTex.wrapT=THREE.ClampToEdgeWrapping;
const rayMat=new THREE.MeshBasicMaterial({map:rayTex,color:0xffc890,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
WIN.forEach(zc=>{const len=9;const d=SUN_DIR.clone().negate();
  for(const off of[-0.55,0,0.55]){const g=new THREE.PlaneGeometry(len,2.3);g.translate(len/2,0,0);const m=new THREE.Mesh(g,rayMat);
    m.position.set(-A-0.3,2.3,zc+off*1.6);m.lookAt(m.position.clone().add(new THREE.Vector3(0,0,1)));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),d);m.rotateX(Math.PI/2*off);scene.add(m);}});
// pillars, painted lines, cars, barriers inside the garage
const PILLARS=[];for(const x of[-15,-5,5,15])for(const z of[-12,0,12])PILLARS.push([x,z]);
{const pp=[];PILLARS.forEach(([x,z])=>{pp.push({g:new THREE.BoxGeometry(0.9,WALL_H,0.9),m:M(x,WALL_H/2,z),c:[1,1,1]});addCol(x,z,0.45,0.45,WALL_H);});
  const pm=new THREE.Mesh(mergeParts(pp,true),new THREE.MeshStandardMaterial({map:pillarTex,vertexColors:true,roughness:0.85}));pm.castShadow=true;scene.add(pm);worldMeshes.push(pm);}
{const lp=[];const Y=[0.85,0.68,0.12];
  for(let x=-21;x<=21;x+=3){lp.push(P_(new THREE.BoxGeometry(0.1,0.01,4.6),M(x,0.01,-A+2.4),Y));lp.push(P_(new THREE.BoxGeometry(0.1,0.01,4.6),M(x,0.01,A-2.4),Y));}
  for(let z=-20;z<=20;z+=2.4)lp.push(P_(new THREE.BoxGeometry(0.12,0.01,1.2),M(0,0.01,z),[0.82,0.8,0.75]));
  scene.add(new THREE.Mesh(mergeParts(lp),new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.6})));}
function carGeo(col,wreck,open){const p=[];const dk=[0.03,0.035,0.045],tire=[0.05,0.05,0.05],chrome=[0.6,0.6,0.62];const rust=[0.3,0.16,0.08];
  const cc=wreck?mixc(col,rust,0.45):col;p.push(P_(new THREE.BoxGeometry(1.8,0.6,4.4),M(0,0.55,0),cc));p.push(P_(new THREE.BoxGeometry(1.7,0.12,4.3),M(0,0.9,0),mulc(cc,0.9)));
  if(!open)p.push(P_(new THREE.BoxGeometry(1.55,0.55,2.2),M(0,1.2,0.25),dk));
  else{for(const sx of[-0.74,0.74])for(const sz of[-0.82,1.32])p.push(P_(new THREE.BoxGeometry(0.06,0.6,0.08),M(sx,1.2,sz,sz<0?-0.35:0.25,0,0),cc));
    p.push(P_(new THREE.BoxGeometry(1.5,0.22,0.5),M(0,1.02,-0.65),[0.08,0.08,0.09]));for(const sx of[-0.4,0.4]){p.push(P_(new THREE.BoxGeometry(0.5,0.12,0.5),M(sx,0.72,0.42),[0.15,0.13,0.12]));p.push(P_(new THREE.BoxGeometry(0.5,0.62,0.12),M(sx,1.05,0.72,-0.15,0,0),[0.15,0.13,0.12]));}
    p.push(P_(new THREE.BoxGeometry(1.4,0.1,0.5),M(0,0.75,1.25),[0.15,0.13,0.12]));}p.push(P_(new THREE.BoxGeometry(1.5,0.08,2.0),M(0,1.5,0.25),cc));
  for(const sx of[-1,1])for(const sz of[-1.35,1.35]){p.push(P_(new THREE.CylinderGeometry(0.34,0.34,0.24,18),M(sx*0.82,wreck&&sx>0&&sz>0?0.22:0.34,sz,0,0,Math.PI/2),tire));
    p.push(P_(new THREE.CylinderGeometry(0.2,0.2,0.25,12),M(sx*0.84,wreck&&sx>0&&sz>0?0.22:0.34,sz,0,0,Math.PI/2),chrome));}
  for(const sx of[-1,1]){p.push(P_(new THREE.BoxGeometry(0.4,0.14,0.05),M(sx*0.6,0.7,-2.21),wreck?[0.2,0.2,0.2]:[1.6,1.55,1.4]));p.push(P_(new THREE.BoxGeometry(0.4,0.12,0.05),M(sx*0.6,0.72,2.21),[0.9,0.05,0.05]));}
  p.push(P_(new THREE.BoxGeometry(1.7,0.18,0.12),M(0,0.35,-2.24),chrome));p.push(P_(new THREE.BoxGeometry(1.7,0.18,0.12),M(0,0.35,2.24),chrome));return mergeParts(p);}
const carMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.35,metalness:0.5});
const CARS=[[-18,-A+2.6,0,[0.45,0.06,0.06]],[-12,-A+2.6,0,[0.15,0.18,0.22]],[9,-A+2.6,0,[0.08,0.1,0.18]],[18,-A+2.6,0,[0.32,0.3,0.26]],
  [-15,A-2.6,Math.PI,[0.12,0.25,0.15]],[12,A-2.6,Math.PI,[0.06,0.06,0.07]],[A-2.6,6,-Math.PI/2,[0.55,0.55,0.58]],[-9.5,6,0.15,[0.3,0.05,0.05]],[10,-6.5,-0.1,[0.2,0.22,0.25]],
  // wrecks out on the streets
  [-30,-46,0.05,[0.12,0.28,0.48],0,1],[30,22,Math.PI/2,[0.62,0.52,0.08],0,1],
  [-50,33,Math.PI/2+0.3,[0.4,0.4,0.42],1],[20,33,Math.PI/2-0.2,[0.25,0.05,0.05],1],[33,-50,0.25,[0.1,0.15,0.3],1],[-33,12,-0.4,[0.5,0.45,0.3],1],[45,-33,Math.PI/2,[0.15,0.15,0.15],1],[-33,-55,0.1,[0.35,0.33,0.3],1],[33,55,-0.3,[0.3,0.32,0.2],1],[-60,-33,Math.PI/2+0.15,[0.2,0.25,0.3],1]];
const CARLIST=[];
CARS.forEach(([x,z,ry,col,wr,dr])=>{const m=new THREE.Mesh(carGeo(col,wr,dr),carMat);
  if(dr){const gl=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.55,2.12),new THREE.MeshStandardMaterial({color:0x1a2228,transparent:true,opacity:0.28,roughness:0.05,metalness:0.6,depthWrite:false}));gl.position.set(0,1.2,0.25);m.add(gl);
    const wh=new THREE.Mesh(new THREE.TorusGeometry(0.16,0.02,6,16),new THREE.MeshStandardMaterial({color:0x111111}));wh.position.set(-0.4,1.02,-0.38);wh.rotation.x=-0.9;m.add(wh);m.userData.wheel=wh;}m.position.set(x,0,z);m.rotation.y=ry;if(wr)m.rotation.z=0.03;m.castShadow=true;m.receiveShadow=true;scene.add(m);worldMeshes.push(m);
  const car={m,x,z,ry,hp:wr?22:38,max:wr?22:38,state:0,alarm:0,alarmT:0,smokeT:0,fire:null,wreck:!!wr,jump:0,drive:!!dr,speed:0,x0:x,z0:z,ry0:ry};m.userData.car=car;CARLIST.push(car);
  const side=Math.abs(Math.sin(ry))>0.7;car.col=addCol(x,z,side?2.25:0.95,side?0.95:2.25,1.55);});
{const bp=[];[[-2,-7,0],[2.5,-7,0],[-17,-3,1],[17,3,1],[-33,-20,1],[-33,-17.6,1],[24,33,0],[0,40,0],[50,0,1]].forEach(([x,z,r])=>{const g=[0.62,0.6,0.56];
    bp.push(P_(new THREE.BoxGeometry(2.0,0.5,0.6),M(x,0.25,z,0,r?Math.PI/2:0,0),g));bp.push(P_(new THREE.BoxGeometry(2.0,0.4,0.25),M(x,0.7,z,0,r?Math.PI/2:0,0),g));addCol(x,z,r?0.32:1.0,r?1.0:0.32,0.9);});
  const m=new THREE.Mesh(mergeParts(bp),vc);m.castShadow=true;scene.add(m);worldMeshes.push(m);}
const tubeMat=new THREE.MeshBasicMaterial({color:0xffffff});tubeMat.color.setRGB(2.6,2.7,2.8);
{const tp=[];for(let i=-3;i<=3;i++)for(const x of[-10,0,10])tp.push(P_(new THREE.BoxGeometry(1.4,0.06,0.12),M(x,WALL_H-0.5,i*6+3),[1,1,1]));scene.add(new THREE.Mesh(mergeParts(tp),tubeMat));}
const LIGHTS=[[-10,-9],[10,-9],[10,9]].map(([x,z])=>{const L=new THREE.PointLight(0xdfe8ff,0.9,20,1.6);L.position.set(x,WALL_H-0.7,z);scene.add(L);return L;});
const flick=new THREE.PointLight(0xdfe8ff,0.9,16,1.6);flick.position.set(0,WALL_H-0.7,-3);scene.add(flick);
const exitSign=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.45),new THREE.MeshBasicMaterial({map:exitTex}));exitSign.material.color.setRGB(1.6,1.6,1.6);exitSign.position.set(0,3.6,-A+0.02);scene.add(exitSign);

/* ---------- ladders ---------- */
const ladderMat=new THREE.MeshStandardMaterial({color:0x6a6c70,roughness:0.5,metalness:0.7});
function addLadder(lx,lz,nx,nz,y1,roof){const p=[],h=y1+1.0,c=[0.5,0.5,0.52];const sx=nz!==0?1:0,sz=nx!==0?1:0;
  for(const s of[-0.24,0.24])p.push(P_(new THREE.BoxGeometry(0.05,h,0.05),M(lx+nx*0.12+sx*s,h/2,lz+nz*0.12+sz*s),c));
  for(let y=0.3;y<h;y+=0.32)p.push(P_(new THREE.CylinderGeometry(0.018,0.018,0.48,6),M(lx+nx*0.12,y,lz+nz*0.12,sx?0:0,0,sx?Math.PI/2:0,1,1,1).multiply(sz?M(0,0,0,Math.PI/2,0,0):new THREE.Matrix4()),c));
  const m=new THREE.Mesh(mergeParts(p),ladderMat);m.castShadow=true;scene.add(m);
  const L={lx,lz,nx,nz,y1,roof,bx:lx+nx*0.5,bz:lz+nz*0.5,tx:lx-nx*1.0,tz:lz-nz*1.0,ex:lx-nx*0.45,ez:lz-nz*0.45,yawIn:Math.atan2(nx,nz)};ladders.push(L);return L;}
addLadder(A+T,8,1,0,ROOF_Y,0);addLadder(-14,-A-T,0,-1,ROOF_Y,0);

/* ---------- city buildings around the garage ---------- */
const facadeTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#6a5a4c';g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=8)for(let x=(y/8)%2?-8:0;x<w;x+=16){const v=Math.random()*24-12;g.fillStyle=`rgb(${108+v|0},${86+v|0},${70+v|0})`;g.fillRect(x+1,y+1,14,6);}
  for(let r=0;r<2;r++)for(let c=0;c<2;c++){const x=28+c*128,y=36+r*128;g.fillStyle='#2a2a28';g.fillRect(x-4,y-4,80,76);
    const lit=Math.random()<0.25;g.fillStyle=lit?'#d9a560':'#14171c';g.fillRect(x,y,72,68);if(!lit&&Math.random()<0.5){g.fillStyle='rgba(120,130,140,.25)';g.beginPath();g.moveTo(x,y);g.lineTo(x+40,y);g.lineTo(x,y+50);g.fill();}
    g.fillStyle='#2a2a28';g.fillRect(x+34,y,4,68);g.fillRect(x,y+32,72,4);g.fillStyle='#8a8278';g.fillRect(x-6,y+70,84,6);}
  speckle(g,w,h,3000,40,40,.3);});
const BUILDINGS=[{x0:-70,x1:-46,z0:-70,z1:-50,h:12,col:[1,0.95,0.9],lad:[1,0]},{x0:-22,x1:22,z0:47,z1:62,h:5.5,col:[0.85,0.9,1],lad:[0,-1]},{x0:47,x1:70,z0:-30,z1:-2,h:16,col:[0.8,0.8,0.82],lad:[-1,0]},
  {x0:47,x1:70,z0:14,z1:44,h:7.5,col:[1,0.88,0.8],lad:[0,-1]},{x0:-70,x1:-48,z0:8,z1:40,h:9,col:[0.9,0.92,0.85],lad:null},{x0:-36,x1:-10,z0:-70,z1:-50,h:6.5,col:[1,0.9,0.85],lad:[0,1]},
  {x0:14,x1:40,z0:-70,z1:-50,h:10,col:[0.85,0.85,0.9],lad:null},{x0:-70,x1:-48,z0:50,z1:70,h:14,col:[0.95,0.85,0.75],lad:null},{x0:50,x1:70,z0:52,z1:70,h:8,col:[0.9,0.9,0.9],lad:[-1,0]}];
{const fp=[],rp=[];
  BUILDINGS.forEach((B,bi)=>{const w=B.x1-B.x0,d=B.z1-B.z0,cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2;
    fp.push({g:new THREE.BoxGeometry(w,B.h,d),m:M(cx,B.h/2,cz),c:B.col,us:Math.max(w,d)/6,vs:B.h/6});
    addCol(cx,cz,w/2,d/2,B.h+0.05);const si=surfaces.length;surfaces.push({x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z1,y:B.h});
    const pc=[0.38,0.36,0.34];rp.push(P_(new THREE.BoxGeometry(w,0.6,0.3),M(cx,B.h+0.3,B.z0+0.15),pc));rp.push(P_(new THREE.BoxGeometry(w,0.6,0.3),M(cx,B.h+0.3,B.z1-0.15),pc));
    rp.push(P_(new THREE.BoxGeometry(0.3,0.6,d),M(B.x0+0.15,B.h+0.3,cz),pc));rp.push(P_(new THREE.BoxGeometry(0.3,0.6,d),M(B.x1-0.15,B.h+0.3,cz),pc));
    rp.push(P_(new THREE.BoxGeometry(w-0.6,0.05,d-0.6),M(cx,B.h+0.02,cz),[0.3,0.3,0.31]));
    rp.push(P_(new THREE.BoxGeometry(2,1.2,1.4),M(cx+w*0.2,B.h+0.6,cz-d*0.15),[0.55,0.56,0.58]));addCol(cx+w*0.2,cz-d*0.15,1,0.7,B.h+1.2,B.h-0.05);
    if(B.h>9){rp.push(P_(new THREE.CylinderGeometry(1.4,1.4,2.6,16),M(cx-w*0.2,B.h+2.6,cz+d*0.2),[0.35,0.25,0.18]));for(const sx of[-1,1])for(const sz of[-1,1])rp.push(P_(new THREE.BoxGeometry(0.15,1.3,0.15),M(cx-w*0.2+sx*1,B.h+0.65,cz+d*0.2+sz*1),[0.2,0.2,0.2]));
      addCol(cx-w*0.2,cz+d*0.2,1.4,1.4,B.h+3.9,B.h-0.05);}
    for(const [ex,ez,ew,ed] of[[cx,B.z0+0.15,w,0.3],[cx,B.z1-0.15,w,0.3],[B.x0+0.15,cz,0.3,d],[B.x1-0.15,cz,0.3,d]])addCol(ex,ez,ew/2,ed/2,B.h+0.6,B.h-0.05);
    if(B.lad){const [nx,nz]=B.lad;const lx=nx?(nx>0?B.x1:B.x0):cx+w*0.3,lz=nz?(nz>0?B.z1:B.z0):cz+d*0.3;addLadder(lx,lz,nx,nz,B.h,si);
      colliders.forEach(c=>{if(c.y0>=B.h-0.1&&Math.abs(c.x-(nx?(lx-nx*0.15):lx))<c.hw+0.3&&Math.abs(c.z-(nz?(lz-nz*0.15):lz))<c.hd+0.3&&c.hd<0.5!==false){}});}
  });
  const fm=new THREE.Mesh(mergeParts(fp,true),new THREE.MeshStandardMaterial({map:facadeTex,vertexColors:true,roughness:0.9}));fm.castShadow=true;fm.receiveShadow=true;scene.add(fm);worldMeshes.push(fm);camBlockers.push(fm);
  const rm=new THREE.Mesh(mergeParts(rp),vc);rm.castShadow=true;rm.receiveShadow=true;scene.add(rm);worldMeshes.push(rm);}
// open a gap in each roof parapet where a ladder arrives, so you can step off
ladders.forEach(L=>{colliders.forEach(c=>{if(c.y0>=L.y1-0.1&&c.y0<=L.y1+0.1&&Math.abs(c.x-L.lx)<=c.hw+0.2&&Math.abs(c.z-L.lz)<=c.hd+0.2&&(c.hw<0.4||c.hd<0.4)){
  if(c.hw<0.4){const top=c.z+c.hd,bot=c.z-c.hd;const a={...c,z:(bot+L.lz-0.6)/2,hd:Math.max(0,(L.lz-0.6-bot)/2)};const b={...c,z:(top+L.lz+0.6)/2,hd:Math.max(0,(top-L.lz-0.6)/2)};c.off=true;colliders.push(a,b);}
  else{const r=c.x+c.hw,l=c.x-c.hw;const a={...c,x:(l+L.lx-0.6)/2,hw:Math.max(0,(L.lx-0.6-l)/2)};const b={...c,x:(r+L.lx+0.6)/2,hw:Math.max(0,(r-L.lx-0.6)/2)};c.off=true;colliders.push(a,b);}}});});
// distant skyline beyond the fence + boundary
{const p=[];for(let i=0;i<40;i++){const a=i/40*Math.PI*2,r=88+Math.random()*10,h=10+Math.random()*30;p.push(P_(new THREE.BoxGeometry(8+Math.random()*8,h,8+Math.random()*8),M(Math.cos(a)*r,h/2,Math.sin(a)*r,0,a,0),[0.22,0.22,0.24]));}
  scene.add(new THREE.Mesh(mergeParts(p),new THREE.MeshStandardMaterial({vertexColors:true,roughness:1})));
  const fp=[];for(let t=-W;t<=W;t+=3){for(const [x,z] of[[t,-W],[t,W],[-W,t],[W,t]])fp.push(P_(new THREE.CylinderGeometry(0.05,0.05,2.6,6),M(x,1.3,z),[0.35,0.35,0.36]));}
  scene.add(new THREE.Mesh(mergeParts(fp),new THREE.MeshStandardMaterial({vertexColors:true,metalness:0.6,roughness:0.5})));}
// street props: lamp posts, bare trees, dumpsters, debris
{const p=[];const pole=[0.2,0.21,0.22];
  for(const [x,z] of[[-27,-45],[27,-45],[-45,27],[45,27],[-27,45],[27,45],[-45,-27],[45,-27],[-60,27.5],[60,-27.5]]){p.push(P_(new THREE.CylinderGeometry(0.08,0.12,6,8),M(x,3,z),pole));p.push(P_(new THREE.BoxGeometry(1.4,0.1,0.18),M(x+0.6,6,z),pole));addCol(x,z,0.15,0.15,6);}
  for(const [x,z] of[[-41,-41],[41,41],[-41,20],[41,-15],[-20,-41],[15,41],[60,-40],[-60,45]]){p.push(P_(new THREE.CylinderGeometry(0.18,0.3,4,8),M(x,2,z),[0.22,0.17,0.13]));
    for(let k=0;k<5;k++){const a=k*1.3;p.push(P_(new THREE.CylinderGeometry(0.04,0.1,2.4,5),M(x+Math.cos(a)*0.7,4.2,z+Math.sin(a)*0.7,Math.sin(a)*0.7,0,-Math.cos(a)*0.7),[0.22,0.17,0.13]));}addCol(x,z,0.3,0.3,5);}
  for(const [x,z,r] of[[-40,10,0],[40,-8,1],[-10,42,0],[12,-42,0],[-55,-40,1]]){p.push(P_(new THREE.BoxGeometry(r?1.3:2.2,1.4,r?2.2:1.3),M(x,0.7,z),[0.15,0.28,0.18]));p.push(P_(new THREE.BoxGeometry(r?1.4:2.3,0.1,r?2.3:1.4),M(x,1.45,z),[0.1,0.18,0.12]));addCol(x,z,r?0.65:1.1,r?1.1:0.65,1.5);}
  for(let i=0;i<40;i++){const x=(Math.random()*2-1)*(W-4),z=(Math.random()*2-1)*(W-4);if(Math.abs(x)<A+3&&Math.abs(z)<A+3)continue;
    p.push(P_(new THREE.BoxGeometry(0.2+Math.random()*0.6,0.08+Math.random()*0.2,0.2+Math.random()*0.6),M(x,0.06,z,0,Math.random()*3,0),[0.3+Math.random()*0.1,0.28,0.25]));}
  const m=new THREE.Mesh(mergeParts(p),vc);m.castShadow=true;m.receiveShadow=true;scene.add(m);worldMeshes.push(m);}
const streetLamp=new THREE.MeshBasicMaterial({color:0xffb060});streetLamp.color.multiplyScalar(2.2);
{const p=[];for(const [x,z] of[[-27,-45],[27,-45],[-45,27],[45,27],[-27,45],[27,45],[-45,-27],[45,-27],[-60,27.5],[60,-27.5]])p.push(P_(new THREE.BoxGeometry(0.5,0.08,0.25),M(x+1.1,5.94,z),[1,1,1]));scene.add(new THREE.Mesh(mergeParts(p),streetLamp));}
/* ================= Washington Park (Denver) map ================= */
if(MAP==='park'){
  // clear out the garage and city, keep the ground, the reflective plane (it becomes the lake) and the two drivable cars
  const keepCars=CARLIST.filter(c=>c.drive);
  for(const o of scene.children.slice())if(!__pre.has(o)&&o!==floor&&o!==ground&&!keepCars.some(c=>c.m===o))scene.remove(o);
  CARLIST.length=0;keepCars.forEach(c=>CARLIST.push(c));colliders.length=0;surfaces.length=0;ladders.length=0;camBlockers.length=0;worldMeshes.length=0;worldMeshes.push(ground);LIGHTS.length=0;
  // daytime Colorado sky
  sky.material.map=canvasTex(64,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2f68b8');gr.addColorStop(0.4,'#6e9fd8');gr.addColorStop(0.5,'#c9dcef');gr.addColorStop(0.53,'#a8b8a0');gr.addColorStop(1,'#5a6a48');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  clouds.material.map=canvasTex(512,256,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<90;i++){const x=Math.random()*w,y=h*0.2+Math.random()*h*0.45,r=12+Math.random()*40;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.85)');gr.addColorStop(0.6,'rgba(245,248,252,.45)');gr.addColorStop(1,'rgba(240,244,250,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}});
  sunGlow.material.color.setHex(0xfff4d8);sun.color.setHex(0xfff2dc);sun.intensity=1.45;SUN_DIR.set(-0.5,0.78,0.36).normalize();hemi.color.setHex(0xbcd4ec);hemi.groundColor.setHex(0x55663a);hemi.intensity=0.75;
  scene.background=new THREE.Color(0x9cc0e4);scene.fog=new THREE.Fog(0xb8ccdc,45,150);
  // grass
  const grassTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#4f7a32';g.fillRect(0,0,w,h);for(let i=0;i<26000;i++){const x=Math.random()*w,y=Math.random()*h,v=Math.random();g.fillStyle=v<0.5?'rgba(110,150,60,.5)':v<0.8?'rgba(60,95,35,.5)':'rgba(150,160,80,.35)';g.fillRect(x,y,1,2+Math.random()*3);}
    for(let i=0;i<14;i++){g.fillStyle='rgba(120,160,70,.06)';g.fillRect(0,i*37,w,18);}});
  grassTex.wrapS=grassTex.wrapT=THREE.RepeatWrapping;grassTex.repeat.set(36,36);ground.material.map=grassTex;ground.material.needsUpdate=true;
  const P2=[];const add=(g,m,c)=>P2.push(P_(g,m,c));
  // ---- the lakes ----
  WATER.push({x:-30,z:-14,rx:23,rz:16},{x:34,z:-44,rx:13,rz:8});
  const ell=(cx,cz,rx,rz,y,seg)=>{const s=new THREE.Shape();for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,j=1+0.04*Math.sin(a*5)+0.03*Math.sin(a*11);s.lineTo?0:0;const x=Math.cos(a)*rx*j,z=Math.sin(a)*rz*j;if(i===0)s.moveTo(x,-z);else s.lineTo(x,-z);}const g=new THREE.ShapeGeometry(s,2);g.rotateX(-Math.PI/2);g.translate(cx,y,cz);return g;};
  const waterGeo=THREE.BufferGeometryUtils?null:null;
  const wg=[];for(const w of WATER)wg.push({g:ell(w.x,w.z,w.rx+1.2,w.rz+1.2,0,72)});
  // shoreline dirt band and the water itself (the planar reflection now mirrors trees, sky and the boathouse in the lake)
  const shore=new THREE.Mesh(mergeParts(WATER.map(w=>P_(colorize(ell(w.x,w.z,w.rx+2.6,w.rz+2.6,0.008,72),p=>{const k=0.85+0.15*Math.random();return [0.42*k,0.36*k,0.26*k];})))),vc);shore.receiveShadow=true;scene.add(shore);REFL_HIDE.push(ground,shore);
  floor.geometry.dispose();floor.geometry=mergeParts(wg.map(o=>P_(o.g,null,[1,1,1])));floor.rotation.set(0,0,0);floor.position.set(0,0.02,0);
  const waterMat=new THREE.MeshStandardMaterial({color:0x1f3a3c,roughness:0.12,metalness:0.05});const wT={value:0};
  waterMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,reflUniforms);sh.uniforms.uT=wT;
    sh.fragmentShader='uniform sampler2D tRefl;uniform float uWet;uniform float uT;\nuniform vec2 uRes;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',
    'vec2 ruv=gl_FragCoord.xy/uRes;vec2 rp=vec2(sin(gl_FragCoord.y*0.09+uT*1.7)+0.6*sin(gl_FragCoord.y*0.031-uT*0.9+gl_FragCoord.x*0.01),cos(gl_FragCoord.x*0.07+uT*1.3)+0.5*sin(gl_FragCoord.x*0.023+gl_FragCoord.y*0.02+uT*0.7));ruv+=rp*0.0016;\n vec3 refl=texture2D(tRefl,ruv).rgb;vec3 V=normalize(vViewPosition);float fres=0.28+0.62*pow(1.0-abs(V.y*0.0+dot(normalize(vNormal),-V)),3.0);\n float sp=pow(max(0.0,rp.x*0.5+rp.y*0.5),24.0)*0.04;\n gl_FragColor.rgb=mix(gl_FragColor.rgb*0.9,refl,fres)+sp;\n #include <dithering_fragment>');};
  floor.material=waterMat;floor.receiveShadow=false;reflUniforms.uWet.value=0.68;PARK.waterT=wT;
  // ---- paths: gravel loop around the big lake, path to the gardens, asphalt park road with a center line ----
  const ring=(cx,cz,rx,rz,wd,y,col,seg,dash)=>{const pos=[],cols=[];for(let i=0;i<seg;i++){const a0=i/seg*Math.PI*2,a1=(i+1)/seg*Math.PI*2;
      const q=(a,o)=>[cx+Math.cos(a)*(rx+o),y,cz+Math.sin(a)*(rz+o)];const A0=q(a0,-wd/2),B0=q(a0,wd/2),A1=q(a1,-wd/2),B1=q(a1,wd/2);
      if(dash&&i%2)continue;pos.push(...A0,...B0,...A1,...B0,...B1,...A1);for(let k=0;k<6;k++){const c=col();cols.push(...c);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();return g;};
  const gravel=()=>{const k=0.8+0.25*Math.random();return [0.62*k,0.55*k,0.46*k];};
  const paths=new THREE.Mesh(mergeParts([P_(ring(-30,-14,28,21,2.4,0.012,gravel,96)),P_(ring(34,-44,17,12,2.2,0.012,gravel,64)),P_(ring(0,0,60,60,6.5,0.014,()=>{const k=0.9+0.1*Math.random();return [0.24*k,0.24*k,0.25*k];},120)),P_(ring(0,0,60,60,0.18,0.018,()=>[0.85,0.7,0.2],120,true)),
    P_(colorize(new THREE.BoxGeometry(2.2,0.02,30),gravel),M(16,0.012,10,0,0.6,0)),P_(colorize(new THREE.BoxGeometry(2.2,0.02,34),gravel),M(4,0.012,-28,0,-0.25,0)),P_(colorize(new THREE.BoxGeometry(46,0.02,2.2),gravel),M(18,0.012,-24,0,0.1,0))]),vc);
  paths.receiveShadow=true;scene.add(paths);REFL_HIDE.push(paths);
  // ---- the boathouse: cream stucco arcade, hip roof with a chimney, railings, stairs, ramp onto the lake, string lights ----
  {const bx=-10,bz=-14,p=[];const CR=[0.86,0.8,0.66],CRd=[0.74,0.68,0.55],RF=[0.34,0.28,0.24],RL=[0.85,0.85,0.82],DK=[0.08,0.07,0.07];
    p.push(P_(new THREE.BoxGeometry(9,0.6,18),M(bx,0.3,bz),CRd));p.push(P_(new THREE.BoxGeometry(8.4,0.15,17.4),M(bx,0.65,bz),[0.55,0.52,0.48]));
    p.push(P_(new THREE.BoxGeometry(7,3.2,15.6),M(bx,2.2,bz),DK));
    for(const sx of[-1,1])for(let i=0;i<8;i++){const z=bz-7.8+i*2.23;p.push(P_(new THREE.BoxGeometry(0.6,3.3,0.6),M(bx+sx*4.2,2.25,z),CR));p.push(P_(new THREE.BoxGeometry(0.8,0.3,0.8),M(bx+sx*4.2,0.85,z),CRd));
      if(i<7){p.push(P_(new THREE.BoxGeometry(0.1,0.08,2.0),M(bx+sx*4.2,1.75,z+1.11),RL));for(let k=0;k<6;k++)p.push(P_(new THREE.BoxGeometry(0.05,1.0,0.05),M(bx+sx*4.2,1.25,z+0.3+k*0.3),RL));}}
    for(const sz of[-1,1])for(let i=0;i<4;i++){const x=bx-3.15+i*2.1;p.push(P_(new THREE.BoxGeometry(0.6,3.3,0.6),M(x,2.25,bz+sz*8.8),CR));}
    p.push(P_(new THREE.BoxGeometry(9.2,0.7,18.4),M(bx,4.15,bz),CR));p.push(P_(new THREE.BoxGeometry(9.4,0.12,18.6),M(bx,3.85,bz),CRd));
    const roof=new THREE.ConeGeometry(1,1,4,1);roof.rotateY(Math.PI/4);p.push(P_(roof,M(bx,5.45,bz,0,0,0,7.6,2.2,13.6),RF));
    p.push(P_(new THREE.BoxGeometry(0.9,1.6,0.9),M(bx+1.2,6.3,bz+3.5),CR));p.push(P_(new THREE.BoxGeometry(1.05,0.15,1.05),M(bx+1.2,7.1,bz+3.5),CRd));
    for(let i=0;i<6;i++)p.push(P_(new THREE.BoxGeometry(1.6,0.18,4),M(bx+5.4+i*0.4,0.62-i*0.1,bz),[0.6,0.58,0.54]));
    // ramp and railed bridge out over the water
    p.push(P_(new THREE.BoxGeometry(12,0.2,2.2),M(bx-10.5,0.55,bz+4.5),[0.6,0.58,0.55]));for(const s of[-1,1]){p.push(P_(new THREE.BoxGeometry(12,0.08,0.08),M(bx-10.5,1.6,bz+4.5+s*1.05),RL));for(let k=0;k<13;k++)p.push(P_(new THREE.BoxGeometry(0.08,1.0,0.08),M(bx-16.3+k,1.1,bz+4.5+s*1.05),RL));}
    for(let k=0;k<4;k++)p.push(P_(new THREE.CylinderGeometry(0.15,0.15,0.8,8),M(bx-15+k*3,0.15,bz+4.5),[0.45,0.43,0.4]));
    const m=new THREE.Mesh(mergeParts(p),vc);m.castShadow=true;m.receiveShadow=true;scene.add(m);worldMeshes.push(m);camBlockers.push(m);
    addCol(bx,bz,4.6,9.2,4.3);
    // warm string lights along the eaves
    const sp=[];for(const sx of[-1,1])for(let i=0;i<34;i++)sp.push(P_(new THREE.SphereGeometry(0.07,6,4),M(bx+sx*4.75,3.68,bz-8.9+i*0.54),[1,1,1]));for(const sz of[-1,1])for(let i=0;i<17;i++)sp.push(P_(new THREE.SphereGeometry(0.07,6,4),M(bx-4.5+i*0.56,3.68,bz+sz*9.3),[1,1,1]));
    const bulb=new THREE.MeshBasicMaterial({color:0xffd27a});bulb.color.multiplyScalar(2.4);scene.add(new THREE.Mesh(mergeParts(sp),bulb));
    for(const [x,z] of[[bx+4.8,bz-4],[bx+4.8,bz+4],[bx-4.8,bz]]){const L=new THREE.PointLight(0xffc878,0.7,14,1.8);L.position.set(x,3.4,z);scene.add(L);LIGHTS.push(L);}}
  // fishing pier with railings on the north shore
  {const p=[];const px=-36,pz=2.6;p.push(P_(new THREE.BoxGeometry(6,0.25,5),M(px,0.45,pz),[0.3,0.26,0.22]));for(const [dx,dz,w,d] of[[0,2.5,6,0.06],[-3,0,0.06,5],[3,0,0.06,5]]){p.push(P_(new THREE.BoxGeometry(w,0.06,d),M(px+dx,1.5,pz+dz),[0.08,0.08,0.08]));}
    for(let k=0;k<13;k++)p.push(P_(new THREE.BoxGeometry(0.05,1.0,0.05),M(px-3+k*0.5,1.0,pz+2.5),[0.08,0.08,0.08]));for(const s of[-1,1])for(let k=0;k<10;k++)p.push(P_(new THREE.BoxGeometry(0.05,1.0,0.05),M(px+s*3,1.0,pz-2.5+k*0.5),[0.08,0.08,0.08]));
    const m=new THREE.Mesh(mergeParts(p),vc);m.castShadow=true;scene.add(m);}
  // ---- trees: big cottonwoods and maples, a few already turning gold and orange ----
  const inWaterPad=(x,z,pad)=>WATER.some(w=>((x-w.x)/(w.rx+pad))**2+((z-w.z)/(w.rz+pad))**2<1);
  const onRoad=(x,z)=>{const r=Math.hypot(x,z);return Math.abs(r-60)<5;};
  const tp=[],cp=[];let trees=0;
  for(let t=0;t<600&&trees<70;t++){const x=(Math.random()*2-1)*70,z=(Math.random()*2-1)*70;if(inWaterPad(x,z,4)||onRoad(x,z)||Math.hypot(x,z-8)<9||(Math.abs(x-28)<14&&Math.abs(z-26)<10)||Math.abs(x+10)<7&&Math.abs(z+14)<12)continue;
    trees++;const h=5+Math.random()*4,r=0.3+Math.random()*0.25,lean=(Math.random()-.5)*0.15;
    tp.push(P_(colorize(new THREE.CylinderGeometry(r*0.7,r*1.25,h,9),q=>{const k=0.6+0.4*Math.abs(Math.sin(q.y*9+q.x*40));return [0.3*k,0.25*k,0.2*k];}),M(x,h/2,z,lean,0,lean)));
    for(let b=0;b<3;b++){const a=Math.random()*6.28;tp.push(P_(new THREE.CylinderGeometry(r*0.25,r*0.5,h*0.5,6),M(x+Math.cos(a)*0.8,h*0.85,z+Math.sin(a)*0.8,Math.sin(a)*0.8,0,-Math.cos(a)*0.8),[0.28,0.23,0.18]));}
    const v=Math.random();const base=v<0.72?[0.24+Math.random()*0.08,0.42+Math.random()*0.1,0.16]:v<0.9?[0.7,0.6,0.16]:[0.75,0.36,0.12];
    const n=6+(Math.random()*4|0);for(let k=0;k<n;k++){const a=Math.random()*6.28,d=Math.random()*2.4,s=1.6+Math.random()*1.4;
      cp.push(P_(colorize(new THREE.IcosahedronGeometry(1,1),q=>{const kk=0.7+0.45*Math.random();return [base[0]*kk,base[1]*kk,base[2]*kk];}),M(x+Math.cos(a)*d,h+0.6+Math.random()*2.2,z+Math.sin(a)*d,Math.random(),Math.random(),0,s,s*0.8,s)));}
    addCol(x,z,r+0.1,r+0.1,h);}
  const trunks=new THREE.Mesh(mergeParts(tp),vc);trunks.castShadow=true;trunks.receiveShadow=true;scene.add(trunks);worldMeshes.push(trunks);camBlockers.push(trunks);
  const leafMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.9,flatShading:true});const canopy=new THREE.Mesh(mergeParts(cp),leafMat);canopy.castShadow=true;canopy.receiveShadow=true;scene.add(canopy);
  // ---- reeds, cattails and tall grass along the shores ----
  const reedTex=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<40;i++){const x=Math.random()*w,c=Math.random();g.strokeStyle=c<0.6?'rgba(90,120,50,1)':c<0.85?'rgba(150,150,80,1)':'rgba(120,100,60,1)';g.lineWidth=1.2+Math.random()*1.6;g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+(Math.random()-.5)*20,h*0.5,x+(Math.random()-.5)*30,h*(0.05+Math.random()*0.35));g.stroke();}
    for(let i=0;i<5;i++){const x=10+Math.random()*(w-20),y=10+Math.random()*30;g.fillStyle='#4a3020';g.fillRect(x-2,y,4,16);}});
  const rp=[];for(const w of WATER){const N=Math.round((w.rx+w.rz)*3.2);for(let i=0;i<N;i++){if(Math.random()<0.25)continue;const a=i/N*Math.PI*2+Math.random()*0.05,j=1+0.04*Math.sin(a*5)+0.03*Math.sin(a*11),o=0.4+Math.random()*1.4;
      const x=w.x+Math.cos(a)*(w.rx*j+o),z=w.z+Math.sin(a)*(w.rz*j+o);if(Math.abs(x+10)<6&&Math.abs(z+14)<11)continue;const hh=0.8+Math.random()*1.0,ww=1.0+Math.random()*0.8;
      for(const ry of[0,Math.PI/2]){const g=new THREE.PlaneGeometry(ww,hh);g.translate(0,hh/2,0);rp.push(P_(g,M(x,0,z,0,ry+Math.random(),0),[1,1,1]));}}}
  const reeds=new THREE.Mesh(mergeParts(rp,true),new THREE.MeshStandardMaterial({map:reedTex,alphaTest:0.4,side:THREE.DoubleSide,roughness:0.9}));scene.add(reeds);
  // ---- formal flower garden: lawn panel, crossing paths, beds of color ----
  {const gx=28,gz=26,p=[];p.push(P_(colorize(new THREE.BoxGeometry(18,0.03,9),()=>{const k=0.95+0.1*Math.random();return [0.36*k,0.6*k,0.25*k];}),M(gx,0.015,gz)));
    p.push(P_(colorize(new THREE.BoxGeometry(24,0.025,1.8),gravel),M(gx,0.016,gz-6)));p.push(P_(colorize(new THREE.BoxGeometry(24,0.025,1.8),gravel),M(gx,0.016,gz+6)));
    p.push(P_(colorize(new THREE.BoxGeometry(1.8,0.025,14),gravel),M(gx-12,0.016,gz)));p.push(P_(colorize(new THREE.BoxGeometry(1.8,0.025,14),gravel),M(gx+12,0.016,gz)));
    const FL=[[0.85,0.2,0.35],[0.95,0.75,0.2],[0.9,0.45,0.6],[0.6,0.3,0.75],[0.95,0.95,0.9],[0.9,0.35,0.15]];
    for(const [cx,cz,w,d] of[[gx,gz-7.8,22,1.4],[gx,gz+7.8,22,1.4],[gx-13.8,gz,1.4,12],[gx+13.8,gz,1.4,12]]){p.push(P_(colorize(new THREE.BoxGeometry(w,0.14,d),()=>[0.3,0.22,0.15]),M(cx,0.07,cz)));
      for(let i=0;i<w*d*5;i++){const fx=cx+(Math.random()-.5)*w,fz=cz+(Math.random()-.5)*d,c=Math.random()<0.35?[0.22,0.45,0.18]:FL[Math.random()*FL.length|0];p.push(P_(new THREE.IcosahedronGeometry(0.12+Math.random()*0.1,0),M(fx,0.24+Math.random()*0.15,fz),c));}}
    const m=new THREE.Mesh(mergeParts(p),vc);m.receiveShadow=true;m.castShadow=true;scene.add(m);}
  // ---- benches and black lamp posts with globe lights along the paths ----
  {const p=[],gl=[];const BK=[0.08,0.08,0.09];const bench=(x,z,ry)=>{p.push(P_(new THREE.BoxGeometry(1.8,0.06,0.45),M(x,0.45,z,0,ry,0),BK));const bxv=Math.sin(ry),bzv=Math.cos(ry);
      p.push(P_(new THREE.BoxGeometry(1.8,0.5,0.06),M(x+bxv*0.22,0.75,z+bzv*0.22,0,ry,0),BK));for(const s of[-0.8,0.8])p.push(P_(new THREE.BoxGeometry(0.06,0.45,0.45),M(x+Math.cos(ry)*s,0.22,z-Math.sin(ry)*s,0,ry,0),BK));addCol(x,z,0.9,0.9,1);};
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2+0.3,x=-30+Math.cos(a)*30.5,z=-14+Math.sin(a)*23.5;if(Math.abs(x+10)<7&&Math.abs(z+14)<12)continue;bench(x,z,Math.atan2(x+30,z+14)+Math.PI);}
    bench(24,18,0);bench(32,18,0);bench(24,34,Math.PI);bench(32,34,Math.PI);bench(2,4,Math.PI/2);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=-30+Math.cos(a)*26,z=-14+Math.sin(a)*19.2;if(Math.abs(x+10)<7&&Math.abs(z+14)<12)continue;
      p.push(P_(new THREE.CylinderGeometry(0.07,0.12,3.6,8),M(x,1.8,z),BK));p.push(P_(new THREE.CylinderGeometry(0.16,0.2,0.4,8),M(x,0.2,z),BK));gl.push(P_(new THREE.SphereGeometry(0.28,12,8),M(x,3.85,z),[1,1,1]));addCol(x,z,0.15,0.15,4);}
    const m=new THREE.Mesh(mergeParts(p),vc);m.castShadow=true;scene.add(m);const gm=new THREE.MeshBasicMaterial({color:0xfff2d8});scene.add(new THREE.Mesh(mergeParts(gl),gm));}
  // ---- houses around the park, a brick high-rise, and the Rockies on the horizon ----
  {const p=[];for(let i=0;i<34;i++){const a=i/34*Math.PI*2,r=68+Math.random()*3,x=Math.cos(a)*r,z=Math.sin(a)*r;const w=5+Math.random()*3,d=6+Math.random()*3,h=3.5+Math.random()*3,ry=-a;
      const col=[[0.62,0.4,0.3],[0.8,0.76,0.66],[0.5,0.52,0.55],[0.7,0.62,0.48]][i%4];p.push(P_(new THREE.BoxGeometry(w,h,d),M(x,h/2,z,0,ry,0),col));
      const rf=new THREE.ConeGeometry(1,1,4,1);rf.rotateY(Math.PI/4);p.push(P_(rf,M(x,h+1.1,z,0,ry,0,w*0.75,2.2,d*0.75),[0.25,0.22,0.22]));addCol(x,z,Math.max(w,d)/2,Math.max(w,d)/2,h);}
    const tw=new THREE.BoxGeometry(12,42,12);p.push(P_(colorize(tw,q=>{const win=(Math.floor(q.y*1.2)%2===0)&&(Math.floor((q.x+q.z)*0.9)%2===0);return win?[0.18,0.2,0.24]:[0.52,0.33,0.26];}),M(58,21,-82)));
    const m=new THREE.Mesh(mergeParts(p),vc);m.castShadow=true;m.receiveShadow=true;scene.add(m);worldMeshes.push(m);camBlockers.push(m);
    const mp=[],segN=60;for(let i=0;i<segN;i++){const a=Math.PI*0.55+i/segN*Math.PI*0.9,r=100;const hgt=10+Math.abs(Math.sin(i*1.7))*9+Math.random()*7;const x=Math.cos(a)*r,z=Math.sin(a)*r;
      const g=new THREE.ConeGeometry(9+Math.random()*6,hgt,5,1);mp.push(P_(colorize(g,q=>q.y>hgt*0.22?[0.93,0.95,0.98]:[0.44,0.5,0.6]),M(x,hgt/2-1,z,0,Math.random(),0)));}
    scene.add(new THREE.Mesh(mergeParts(mp),new THREE.MeshBasicMaterial({vertexColors:true,fog:false,transparent:true,opacity:0.85})));}
  // ---- Canada geese on the water and the lawn ----
  {const goose=mergeParts([P_(new THREE.SphereGeometry(1,10,8),M(0,0.18,0,0,0,0,0.16,0.12,0.3),[0.42,0.34,0.26]),P_(new THREE.CylinderGeometry(0.03,0.04,0.32,6),M(0,0.38,-0.22,0.4,0,0),[0.05,0.05,0.05]),
      P_(new THREE.SphereGeometry(0.055,8,6),M(0,0.54,-0.3),[0.05,0.05,0.05]),P_(new THREE.BoxGeometry(0.06,0.04,0.05),M(0,0.535,-0.31),[0.92,0.92,0.9]),P_(new THREE.ConeGeometry(0.02,0.07,5),M(0,0.53,-0.37,-Math.PI/2,0,0),[0.06,0.06,0.06]),
      P_(new THREE.SphereGeometry(1,8,6),M(0,0.18,0.24,0,0,0,0.1,0.07,0.1),[0.92,0.9,0.86])]);
    PARK.geese=[];for(let i=0;i<18;i++){const onLand=i>=14;const w=WATER[0];const a=Math.random()*6.28,d=Math.random()*0.7;
      const m=new THREE.Mesh(goose,vc);m.castShadow=true;const x=onLand?2+Math.random()*6:w.x+Math.cos(a)*w.rx*d,z=onLand?-6+Math.random()*6:w.z+Math.sin(a)*w.rz*d;m.position.set(x,onLand?0:0.0,z);m.rotation.y=Math.random()*6.28;scene.add(m);
      PARK.geese.push({m,water:!onLand,vx:0,vz:0,t:Math.random()*10,flee:0});}}
  // reposition the two drivable cars onto the park road
  [[0,-60,Math.PI/2],[60,0,0]].forEach(([x,z,ry],i)=>{const c=keepCars[i];if(!c)return;Object.assign(c,{x,z,ry,x0:x,z0:z,ry0:ry});c.m.position.set(x,0,z);c.m.rotation.y=ry;const side=Math.abs(Math.sin(ry))>0.7;c.col=addCol(x,z,side?2.25:0.95,side?0.95:2.25,1.55);});
}
// geese bob on the water, drift, and scatter when the hero runs by or shoots
function updatePark(dt){if(MAP!=='park'){if(PARK.waterT)PARK.waterT.value+=dt;return;}if(PARK.waterT)PARK.waterT.value+=dt;if(!PARK.geese)return;
  for(const g of PARK.geese){g.t+=dt;const dx=g.m.position.x-P.x,dz=g.m.position.z-P.z,d=Math.hypot(dx,dz);if(d<5&&(P.vel>2.5||P.fireCD>0))g.flee=2;
    if(g.flee>0){g.flee-=dt;g.vx=damp(g.vx,dx/d*2.2,3,dt);g.vz=damp(g.vz,dz/d*2.2,3,dt);}else{g.vx=damp(g.vx,Math.sin(g.t*0.3)*0.25,1,dt);g.vz=damp(g.vz,Math.cos(g.t*0.23)*0.25,1,dt);}
    let nx=g.m.position.x+g.vx*dt,nz=g.m.position.z+g.vz*dt;const inW=WATER.some(w=>((nx-w.x)/(w.rx-0.5))**2+((nz-w.z)/(w.rz-0.5))**2<1);if(g.water===inW){g.m.position.x=nx;g.m.position.z=nz;}else{g.vx*=-1;g.vz*=-1;}
    if(Math.hypot(g.vx,g.vz)>0.05)g.m.rotation.y=Math.atan2(-g.vx,-g.vz);g.m.position.y=g.water?Math.sin(g.t*1.6)*0.02:0;}}
if(DEADZONE){
  const wT={value:0};PARK.waterT=wT;
  const flood=new THREE.MeshStandardMaterial({color:0x1d2622,roughness:0.1,metalness:0.08});
  flood.onBeforeCompile=sh=>{Object.assign(sh.uniforms,reflUniforms);sh.uniforms.uT=wT;
    sh.fragmentShader='uniform sampler2D tRefl;uniform float uWet;uniform float uT;\nuniform vec2 uRes;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',
    'vec2 ruv=gl_FragCoord.xy/uRes;vec2 rp=vec2(sin(gl_FragCoord.y*0.11+uT*1.4)+0.5*sin(gl_FragCoord.x*0.05-uT*0.8),cos(gl_FragCoord.x*0.09+uT*1.1));ruv+=rp*0.002;\n vec3 refl=texture2D(tRefl,ruv).rgb;gl_FragColor.rgb=mix(gl_FragColor.rgb,refl,0.62)+pow(max(0.0,rp.x*0.5+rp.y*0.5),20.0)*0.03;\n #include <dithering_fragment>');};
  floor.material=flood;floor.position.y=0.12;reflUniforms.uWet.value=0.62;
  scene.fog.near=6;scene.fog.far=48;scene.fog.color.setHex(0x101414);
  // amber and red emergency lights on the pillars
  [[-14,-14,0xffa030],[14,-14,0xff3020],[-14,14,0xff3020],[14,14,0xffa030],[0,0,0xc8ff40]].forEach(([x,z,c])=>{const L=new THREE.PointLight(c,1.1,16,1.6);L.position.set(x,2.6,z);scene.add(L);LIGHTS.push(L);
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.18,0.12),new THREE.MeshBasicMaterial({color:c}));b.position.set(x,2.7,z);scene.add(b);});
}
