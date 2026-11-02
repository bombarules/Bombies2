(function(){
"use strict";
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const damp=(a,b,k,dt)=>lerp(a,b,1-Math.exp(-k*dt));
const mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const mulc=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];

/* ================= renderer ================= */
const gameEl=$('game');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
gameEl.prepend(renderer.domElement);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0b0d10);
scene.fog=new THREE.Fog(0x0b0d10,10,46);
const camera=new THREE.PerspectiveCamera(60,1,0.05,120);
function resize(){const w=gameEl.clientWidth||1,h=gameEl.clientHeight||1;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(gameEl);resize();

/* ================= textures ================= */
function canvasTex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);t.anisotropy=4;return t;}
function speckle(g,w,h,n,base,spread,alpha){for(let i=0;i<n;i++){const v=base+Math.random()*spread|0;g.fillStyle=`rgba(${v},${v},${v},${Math.random()*alpha})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}}
const blobTex=canvasTex(64,64,g=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(0,0,0,.6)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
const glowTex=canvasTex(64,64,g=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.7)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
const flashTex=canvasTex(64,64,g=>{g.translate(32,32);g.fillStyle='rgba(255,230,160,1)';
  for(let i=0;i<6;i++){g.rotate(Math.PI/3);g.beginPath();g.moveTo(0,-4);g.lineTo(30,0);g.lineTo(0,4);g.fill();}
  const gr=g.createRadialGradient(0,0,0,0,0,16);gr.addColorStop(0,'#fff');gr.addColorStop(1,'rgba(255,200,90,0)');g.fillStyle=gr;g.fillRect(-16,-16,32,32);});
const concreteTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#4b4c4e';g.fillRect(0,0,w,h);speckle(g,w,h,14000,50,50,.45);
  for(let i=0;i<9;i++){const x=Math.random()*w,y=Math.random()*h,r=30+Math.random()*90;const gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,'rgba(15,14,12,.5)');gr.addColorStop(1,'rgba(15,14,12,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}
  g.strokeStyle='rgba(10,10,10,.35)';g.lineWidth=7;for(let i=0;i<5;i++){g.beginPath();const y=Math.random()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+Math.random()*120-60,w*.6,y+Math.random()*120-60,w,y+Math.random()*80-40);g.stroke();}
  g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1.2;for(let i=0;i<8;i++){let x=Math.random()*w,y=Math.random()*h;g.beginPath();g.moveTo(x,y);for(let j=0;j<9;j++){x+=(Math.random()-.5)*36;y+=(Math.random()-.5)*36;g.lineTo(x,y);}g.stroke();}
  g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=2;g.strokeRect(0,0,w,h);
},[9,9]);
const floorTex=concreteTex;
const garageWallTex=canvasTex(512,256,(g,w,h)=>{g.fillStyle='#5a5a57';g.fillRect(0,0,w,h);speckle(g,w,h,9000,60,50,.4);
  for(let i=0;i<14;i++){const x=Math.random()*w;const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(20,18,15,.0)');gr.addColorStop(.4,'rgba(20,18,15,.35)');gr.addColorStop(1,'rgba(20,18,15,0)');
    g.fillStyle=gr;g.fillRect(x,0,6+Math.random()*16,h);}
  g.fillStyle='rgba(0,0,0,.35)';for(let x=0;x<w;x+=128)g.fillRect(x,0,3,h);
  g.fillStyle='#b38a1e';g.fillRect(0,h*.62,w,h*.09);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,h*.71,w,3);
  g.fillStyle='#2b2b2a';g.fillRect(0,h*.86,w,h*.14);
  g.font='bold 64px Arial';g.fillStyle='rgba(235,235,230,.85)';g.fillText('P2',30,h*.5);g.fillText('P2',286,h*.5);
});
const pillarTex=canvasTex(128,512,(g,w,h)=>{g.fillStyle='#62625e';g.fillRect(0,0,w,h);speckle(g,w,h,3000,60,50,.4);
  g.save();g.beginPath();g.rect(0,h*.8,w,h*.2);g.clip();g.fillStyle='#1a1a1a';g.fillRect(0,h*.8,w,h*.2);g.fillStyle='#d1a321';
  for(let y=h*.8-w;y<h;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(w,y+w*.6);g.lineTo(w,y+w*.6+20);g.lineTo(0,y+20);g.fill();}g.restore();
  g.fillStyle='rgba(240,240,235,.9)';g.font='bold 54px Arial';g.textAlign='center';g.fillText('B',w/2,h*.42);});
const exitTex=canvasTex(256,96,(g,w,h)=>{g.fillStyle='#0c3a1c';g.fillRect(0,0,w,h);g.fillStyle='#7dffa0';g.font='bold 64px Arial';g.textAlign='center';g.fillText('EXIT',w/2,h*.74);});

/* ================= helpers ================= */
const geoCache={};
function boxGeo(w,h,d){const k=w+','+h+','+d;return geoCache[k]||(geoCache[k]=new THREE.BoxGeometry(w,h,d));}
function lam(color,opt){return new THREE.MeshLambertMaterial(Object.assign({color},opt||{}));}
function box(w,h,d,mat,x,y,z,parent){const m=new THREE.Mesh(boxGeo(w,h,d),mat);m.position.set(x||0,y||0,z||0);if(parent)parent.add(m);return m;}
function pivot(x,y,z,parent){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
function blob(size){const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=0.02;return m;}

/* toon style */
const toonRamp=(()=>{const t=new THREE.DataTexture(new Uint8Array([110,190,255]),3,1,THREE.LuminanceFormat);
  t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;})();
function toonMat(color,opt){return new THREE.MeshToonMaterial(Object.assign({color,gradientMap:toonRamp},opt||{}));}
const outlineMat=new THREE.MeshBasicMaterial({color:0x14111a,side:THREE.BackSide});
outlineMat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>',
  'vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\n mvPosition.xyz += normalize( normalMatrix * normal ) * 0.014;\n gl_Position = projectionMatrix * mvPosition;');};
const sphereG=new THREE.SphereGeometry(1,24,16);
const capCache={};
function capsuleGeo(r,len){const k=r+','+len;if(capCache[k])return capCache[k];
  const pts=[];for(let i=0;i<=10;i++){const a=-Math.PI/2+i/10*Math.PI/2;pts.push(new THREE.Vector2(Math.max(0.0001,r*Math.cos(a)),-len/2+r*Math.sin(a)));}
  for(let i=0;i<=10;i++){const a=i/10*Math.PI/2;pts.push(new THREE.Vector2(Math.max(0.0001,r*Math.cos(a)),len/2+r*Math.sin(a)));}
  return capCache[k]=new THREE.LatheGeometry(pts,20);}
function toonMesh(geo,mat,parent,outline){const m=new THREE.Mesh(geo,mat);if(outline!==false)m.add(new THREE.Mesh(geo,outlineMat));parent.add(m);return m;}
function ell(rx,ry,rz,mat,x,y,z,parent,outline){const m=toonMesh(sphereG,mat,parent,outline);m.scale.set(rx,ry,rz);m.position.set(x,y,z);return m;}
function cap(r,len,mat,x,y,z,parent){const m=toonMesh(capsuleGeo(r,len),mat,parent);m.position.set(x,y,z);return m;}


/* ================= geometry building: merged, vertex-colored parts ================= */
const _v3=new THREE.Vector3(),_n3=new THREE.Vector3(),_m3=new THREE.Matrix3();
function M(x,y,z,rx,ry,rz,sx,sy,sz){const S=sx===undefined?1:sx;return new THREE.Matrix4().compose(new THREE.Vector3(x||0,y||0,z||0),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(S,sy===undefined?S:sy,sz===undefined?S:sz));}
function colorize(geo,fn){const g=geo.index?geo.toNonIndexed():geo.clone();const p=g.attributes.position,n=g.attributes.normal,c=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){_v3.fromBufferAttribute(p,i);_n3.fromBufferAttribute(n,i);const col=fn(_v3,_n3);c[i*3]=col[0];c[i*3+1]=col[1];c[i*3+2]=col[2];}
  g.setAttribute('color',new THREE.BufferAttribute(c,3));return g;}
function mergeParts(parts,withUV){const P=[],N=[],C=[],U=[];
  for(const pt of parts){const g=pt.g.index?pt.g.toNonIndexed():pt.g;const m=pt.m||new THREE.Matrix4();_m3.getNormalMatrix(m);
    const pa=g.attributes.position,na=g.attributes.normal,ca=g.attributes.color,ua=g.attributes.uv;
    for(let i=0;i<pa.count;i++){_v3.fromBufferAttribute(pa,i).applyMatrix4(m);_n3.fromBufferAttribute(na,i).applyMatrix3(_m3).normalize();
      P.push(_v3.x,_v3.y,_v3.z);N.push(_n3.x,_n3.y,_n3.z);
      if(ca)C.push(ca.getX(i),ca.getY(i),ca.getZ(i));else C.push(pt.c[0],pt.c[1],pt.c[2]);
      if(withUV){if(ua)U.push(ua.getX(i)*(pt.us||1),ua.getY(i)*(pt.vs||1));else U.push(0,0);}}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));if(withUV)g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeBoundingSphere();return g;}
const P_=(g,m,c)=>({g,m,c});
function capGeo(r,len,seg,hs){const pts=[];hs=hs||5;
  for(let i=0;i<=hs;i++){const a=-Math.PI/2+i/hs*Math.PI/2;pts.push(new THREE.Vector2(Math.max(1e-4,r*Math.cos(a)),-len/2+r*Math.sin(a)));}
  for(let i=0;i<=hs;i++){const a=i/hs*Math.PI/2;pts.push(new THREE.Vector2(Math.max(1e-4,r*Math.cos(a)),len/2+r*Math.sin(a)));}
  return new THREE.LatheGeometry(pts,seg||12);}
function taperGeo(rTop,rBot,len,seg){const pts=[];const hs=5;
  for(let i=0;i<=hs;i++){const a=-Math.PI/2+i/hs*Math.PI/2;pts.push(new THREE.Vector2(Math.max(1e-4,rBot*Math.cos(a)),-len/2+rBot*Math.sin(a)));}
  for(let i=0;i<=hs;i++){const a=i/hs*Math.PI/2;pts.push(new THREE.Vector2(Math.max(1e-4,rTop*Math.cos(a)),len/2+rTop*Math.sin(a)));}
  return new THREE.LatheGeometry(pts,seg||16);}
function hash3(x,y,z){const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return s-Math.floor(s);}
function vnoise(x,y,z){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi;
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);let r=0;
  for(let k=0;k<8;k++){const dx=k&1,dy=(k>>1)&1,dz=(k>>2)&1;r+=hash3(xi+dx,yi+dy,zi+dz)*(dx?u:1-u)*(dy?v:1-v)*(dz?w:1-w);}return r;}
const fab=(c,p,amt,sc)=>{sc=sc||1;const n=vnoise(p.x*90*sc,p.y*90*sc,p.z*90*sc)*0.6+hash3(p.x*700,p.y*700,p.z*700)*0.4;return mulc(c,1+(n-0.5)*(amt||0.2));};
