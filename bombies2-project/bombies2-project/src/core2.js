
/* ================= realistic humans: head, hands, body ================= */
function hairRegion(x,y,z,o){if(!o.hair||o.bald)return 0;if(o.recede>1&&y>0.62&&-z>-0.4)return 0;let line;
  if(-z>0.35)line=0.5-0.06*Math.cos(x*4)+(o.recede||0)*0.12*(1-Math.abs(x)*1.5);else if(z>0.35)line=-0.32;else line=0.3+0.25*clamp(-z/0.35,0,1)*0;
  if(o.patchy&&vnoise(x*5+7,y*5,z*5)>0.6)return 0;return clamp((y-line)/0.05,0,1);}
function decayCol(o,p,sc){const s=sc||1;let c=o.skin.slice();
  const n1=vnoise(p.x*6*s+o.seed,p.y*6*s,p.z*6*s),n2=vnoise(p.x*14*s,p.y*14*s+o.seed,p.z*14*s),n3=vnoise(p.x*30*s,p.y*30*s,p.z*30*s+o.seed);
  if(n1<0.4)c=mixc(c,[0.42,0.44,0.34],(0.4-n1)*2.4);else if(n1>0.6)c=mixc(c,[0.36,0.3,0.32],(n1-0.6)*2.4);
  const gr=vnoise(p.x*8*s+3,p.y*8*s,p.z*8*s+o.seed*1.3),gr2=vnoise(p.x*40*s,p.y*40*s,p.z*40*s);if(gr>0.58)c=mixc(c,gr2>0.5?[0.07,0.08,0.05]:[0.16,0.16,0.1],Math.min(0.85,(gr-0.58)*3.2));
  const br=vnoise(p.x*4*s+9,p.y*4*s,p.z*4*s+o.seed);if(br>0.6)c=mixc(c,[0.4,0.31,0.24],(br-0.6)*2);
  if(n2>0.74){const k=Math.min(1,(n2-0.74)*6);c=mixc(c,n2>0.8?[0.26,0.09,0.07]:[0.55,0.42,0.33],k);}
  if(Math.abs(n3-0.5)<0.018)c=mixc(c,[0.22,0.15,0.24],0.55);
  const dirt=vnoise(p.x*3*s,p.y*3*s+4,p.z*3*s);if(dirt>0.55)c=mixc(c,[0.2,0.19,0.13],Math.min(0.7,(dirt-0.55)*2.4));
  return mulc(c,0.9+0.15*hash3(p.x*600,p.y*600,p.z*600));}
const cos38=Math.cos(0.66),sin38=Math.sin(0.66);
function makeHead(o){
  const g=new THREE.SphereGeometry(1,o.hi?96:44,o.hi?72:32);const p=g.attributes.position;const cols=new Float32Array(p.count*3);
  const sk=o.skin,age=o.age||0;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=Math.max(0,-z),fs=f*f;
    const G=(a,b,sa,sb)=>Math.exp(-(((x-a)/sa)**2)-(((y-b)/sb)**2));
    let d=0;
    d+=fs*0.22*G(0,-0.1,0.095,0.22);d+=fs*0.07*G(0,-0.27,0.13,0.06);
    d+=fs*0.05*Math.exp(-(((y-0.25)/0.07)**2))*Math.exp(-((x/0.5)**2));
    d-=fs*0.1*(G(0.31,0.1,0.13,0.085)+G(-0.31,0.1,0.13,0.085));
    d+=f*0.035*(G(0.46,-0.08,0.15,0.12)+G(-0.46,-0.08,0.15,0.12));
    d+=fs*0.03*G(0,-0.45,0.16,0.04);d-=fs*0.025*G(0,-0.495,0.2,0.016);d+=fs*0.06*G(0,-0.76,0.22,0.1);
    if(o.zombie){const cs=(o.seed%2)?1:-1;d-=fs*0.035*Math.exp(-(((x-cs*0.33)/0.11)**2)-(((y+0.38)/0.06)**2));const wx=((o.seed*0.53)%0.5)-0.25,wy=0.55+((o.seed*0.29)%0.2);d-=0.035*Math.max(0,1-Math.hypot(x-wx,(y-wy)*1.2)/0.18);d-=f*0.08*(G(0.4,-0.3,0.13,0.15)+G(-0.4,-0.3,0.13,0.15));d+=f*0.03*(G(0.46,-0.06,0.12,0.08)+G(-0.46,-0.06,0.12,0.08));d-=fs*0.07*G(0,-0.5,0.12,0.06);d-=f*0.04*(G(0.62,0.3,0.1,0.15)+G(-0.62,0.3,0.1,0.15));}
    if(o.zombie){d-=f*0.07*(G(0.4,-0.3,0.13,0.15)+G(-0.4,-0.3,0.13,0.15));d-=0.05*(G(0.62,0.28,0.12,0.14)+G(-0.62,0.28,0.12,0.14));d+=fs*0.05*Math.exp(-(((y-0.22)/0.05)**2))*Math.exp(-((x/0.45)**2));d-=fs*0.08*(G(0.31,0.08,0.13,0.1)+G(-0.31,0.08,0.13,0.1));d+=f*0.04*(G(0.44,-0.04,0.1,0.06)+G(-0.44,-0.04,0.1,0.06));}
    let sx=0.8,sy=1,sz=0.92;if(y<-0.15){const t=-0.15-y;sx*=1-t*(o.zombie?0.62:0.45);sz*=1-t*0.1;if(o.zombie)sy*=1+t*0.12;}if(z>0&&y>-0.3)sz*=1.04;
    const hr=hairRegion(x,y,z,o);const r=1+d+(hr>0.5?0.03:0);
    p.setXYZ(i,x*sx*r,y*sy*r,z*sz*r);
    let c=sk.slice();const n=vnoise(x*9+o.seed,y*9,z*9),n2=hash3(x*400+o.seed,y*400,z*400);
    c=mulc(c,0.93+0.12*n+0.04*(n2-0.5));
    const red=0.07*(G(0.42,-0.15,0.15,0.12)+G(-0.42,-0.15,0.15,0.12)+G(0,-0.2,0.06,0.1))*f;
    if(!o.zombie){c[0]+=red;c[2]-=red*0.3;}
    const sock=(G(0.31,0.08,o.zombie?0.19:0.15,o.zombie?0.15:0.11)+G(-0.31,0.08,o.zombie?0.19:0.15,o.zombie?0.15:0.11))*f;c=o.zombie?mixc(c,[0.06,0.05,0.04],Math.min(0.92,sock*1.05)):mulc(c,1-0.08*sock);
    const bag=(G(0.31,-0.03,0.11,0.03)+G(-0.31,-0.03,0.11,0.03))*f;c=mulc(c,1-0.14*bag*(age+(o.zombie?1:0)));
    const lip=o.zombie?G(0,-0.5,0.24,0.12)*f:G(0,-0.45,0.14,0.035)*fs;if(lip>0.1)c=mixc(c,o.zombie?[0.1,0.07,0.05]:[sk[0]*0.85+0.08,sk[1]*0.62,sk[2]*0.62],Math.min(1,lip*1.3));
    c=mulc(c,1-0.6*G(0,-0.495,0.17,0.01)*fs);
    if(age>0&&f>0){
      for(let k=0;k<3;k++){const yb=0.43+k*0.065+0.01*Math.sin(x*9);c=mulc(c,1-0.24*age*Math.exp(-(((y-yb)/0.0075)**2))*Math.exp(-((x/0.42)**2))*fs);}
      for(const s of[-1,1]){const u=(x-s*0.5)*s,v=y-0.09;if(u>0){const rr=Math.hypot(u,v);if(rr<0.16)for(const a of[-0.45,0,0.45]){const dist=Math.abs(-Math.sin(a)*u+Math.cos(a)*v);
          c=mulc(c,1-0.28*age*Math.exp(-((dist/0.0055)**2))*(1-rr/0.16));}}
        const ax=s*0.13,ay=-0.2,bx=s*0.25,by=-0.47;const t=clamp(((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2),0,1);
        const dd=Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay));c=mulc(c,1-0.24*age*Math.exp(-((dd/0.012)**2))*f);}
      c=mulc(c,1-0.2*age*Math.exp(-(((Math.abs(x)-0.05)/0.008)**2))*Math.exp(-(((y-0.31)/0.05)**2))*fs);
    }
    if(o.stubble){const jaw=(y<-0.22&&f>0.05)||(Math.abs(x)>0.5&&y<-0.02&&y>-0.7&&z<0.3);const lz=G(0,-0.45,0.16,0.05)>0.4;
      if(jaw&&!lz)c=mixc(c,o.stubbleCol||[0.17,0.14,0.13],(0.25+0.4*n2)*o.stubble);
      if(f>0.3&&y<-0.3&&y>-0.42&&Math.abs(x)<0.24)c=mixc(c,o.stubbleCol||[0.17,0.14,0.13],(0.3+0.4*n2)*o.stubble);}
    if(o.zombie){c=decayCol(o,{x,y,z},1.4);
      const rim=(G(0.31,0.08,0.2,0.15)+G(-0.31,0.08,0.2,0.15))*f;c=mixc(c,[0.42,0.16,0.13],Math.min(0.7,rim*0.6));
      c=mulc(c,1-0.55*(G(0.31,0.08,0.13,0.09)+G(-0.31,0.08,0.13,0.09))*f);
      const sx2=((o.seed*0.37)%0.3)-0.15;if(f>0.3&&y<-0.48&&Math.abs(x-sx2-Math.sin(y*20)*0.02)<0.035)c=mixc(c,[0.22,0.08,0.05],0.8);
      if(f>0.3&&y<-0.48&&Math.abs(x+sx2*0.6)<0.02&&y>-0.75)c=mixc(c,[0.25,0.09,0.06],0.7);
      const lip2=G(0,-0.47,0.15,0.05)*fs;if(lip2>0.2)c=mixc(c,[0.3,0.18,0.18],Math.min(0.8,lip2));
      const cr=vnoise(x*40,y*40,z*40+o.seed);if(Math.abs(cr-0.5)<0.012)c=mulc(c,0.7);
      c=mixc(mulc(c,0.82),[0.3,0.27,0.22],0.25);
      c=mulc(c,1-0.35*(G(0.31,0.06,0.18,0.14)+G(-0.31,0.06,0.18,0.14))*f);
      const mb=G(0,-0.56,0.2,0.14)*f;if(mb>0.15)c=mixc(c,[0.2,0.06,0.04],Math.min(0.75,mb*0.9*(0.6+0.6*vnoise(x*20,y*20,o.seed))));
      const wx=((o.seed*0.53)%0.5)-0.25,wy=0.55+((o.seed*0.29)%0.2);const wd=Math.hypot(x-wx,(y-wy)*1.2);
      if(wd<0.22&&z<0.5){const k=1-wd/0.22;c=mixc(c,k>0.6?[0.16,0.04,0.03]:[0.35,0.1,0.07],Math.min(0.9,k*1.4));}
      if(f>0.2&&x>wx-0.04&&x<wx+0.04&&y<wy&&y>wy-0.45-0.2*hash3(o.seed,1,1))c=mixc(c,[0.22,0.06,0.04],0.55);
      const cs=(o.seed%2)?1:-1;const tx=x-cs*0.3,ty=y+0.4;const tear=Math.exp(-(((tx*cos38-ty*sin38*cs)/0.09)**2)-(((tx*sin38*cs+ty*cos38)/0.035)**2))*fs;
      if(tear>0.2)c=mixc(c,tear>0.6?[0.12,0.02,0.02]:[0.42,0.08,0.06],Math.min(1,tear*1.3));
      c=mulc(c,1-0.45*G(0,-0.26,0.08,0.06)*fs);
      c=mulc(c,1-0.35*(G(0.31,0.07,0.2,0.16)+G(-0.31,0.07,0.2,0.16))*f);
      const chin=G(0,-0.66,0.24,0.16)*f;if(chin>0.2&&vnoise(x*14,y*14,o.seed+3)>0.42)c=mixc(c,[0.24,0.05,0.04],0.6*chin);}
    if(hr>0){let h=o.hair.slice();const gr=o.gray?clamp((Math.abs(x)-0.48)*4,0,1)*(y<0.72?1:0.35)+o.gray*0.12:0;h=mixc(h,[0.64,0.62,0.6],clamp(gr*(o.gray||0),0,1));
      h=mulc(h,0.7+0.6*hash3(x*260,y*260,z*260));c=mixc(c,h,hr);}
    cols[i*3]=Math.max(0,c[0]);cols[i*3+1]=Math.max(0,c[1]);cols[i*3+2]=Math.max(0,c[2]);
  }
  g.setAttribute('color',new THREE.BufferAttribute(cols,3));g.computeVertexNormals();return g;
}
const hairTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);g.lineCap='round';
  for(let i=0;i<2600;i++){const x=Math.random()*w,y=Math.random()*h,l=8+Math.random()*22,a=Math.PI/2+(Math.random()-.5)*0.5;const v=150+Math.random()*105|0;
    g.strokeStyle=`rgb(${v},${v},${v})`;g.lineWidth=1+Math.random()*1.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();}},[14,7]);
function buildHairShells(o){const shells=[];
  for(let L=0;L<5;L++){const g=new THREE.SphereGeometry(1,44,32);const p=g.attributes.position,cols=new Float32Array(p.count*3),keep=new Uint8Array(p.count);
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const hr=hairRegion(x,y,z,o);keep[i]=hr>0.35?1:0;
      let sx=0.8,sz=0.92;if(z>0&&y>-0.3)sz*=1.04;const r=o.slick?1.028+0.007*L:1.04+0.014*L;p.setXYZ(i,x*sx*r,y*r,z*sz*r);
      let h=o.hair.slice();const gr=o.gray?clamp((Math.abs(x)-0.48)*4,0,1)*(y<0.72?1:0.35)+o.gray*0.12:0;h=mixc(h,[0.64,0.62,0.6],clamp(gr*(o.gray||0),0,1));
      h=mulc(h,(0.75+0.5*hash3(x*50,y*50,z*50))*(0.8+L*0.06));if(o.slick){h=mulc(h,0.78+0.32*Math.abs(Math.sin(x*70+Math.sin(z*6)*1.5)));if(y>0.55)h=mulc(h,1+0.6*clamp((y-0.55)*3,0,1)*clamp(1-Math.abs(x)*2.2,0,1));}cols[i*3]=h[0];cols[i*3+1]=h[1];cols[i*3+2]=h[2];}
    g.setAttribute('color',new THREE.BufferAttribute(cols,3));const idx=g.index.array,ni=[];
    for(let t=0;t<idx.length;t+=3)if(keep[idx[t]]&&keep[idx[t+1]]&&keep[idx[t+2]])ni.push(idx[t],idx[t+1],idx[t+2]);g.setIndex(ni);g.computeVertexNormals();shells.push(g);}
  return shells;}
const strandTex=canvasTex(64,256,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);
  for(let i=0;i<26;i++){const x=Math.random()*w,ww=1+Math.random()*2.5,end=h*(0.55+Math.random()*0.45);const v=170+Math.random()*85|0;g.strokeStyle=`rgb(${v},${v},${v})`;g.lineWidth=ww;
    g.beginPath();g.moveTo(x,0);let xx=x;for(let y=0;y<end;y+=16){xx+=(Math.random()-.5)*3;g.lineTo(xx,y);}g.stroke();}});
strandTex.wrapS=THREE.RepeatWrapping;strandTex.wrapT=THREE.ClampToEdgeWrapping;
function buildHairStrands(o){const P=[],C=[],U=[],I=[];let vi=0,made=0;const N=o.hi?220:150,segs=8;
  for(let s=0;s<N*6&&made<N;s++){const u=Math.random()*2-1,th=Math.random()*Math.PI*2,rr=Math.sqrt(1-u*u);const x=rr*Math.cos(th),y=u,z=rr*Math.sin(th);
    if(hairRegion(x,y,z,o)<0.5)continue;if(-z>0.25&&y<0.45)continue;made++;
    const nrm=new THREE.Vector3(x,y,z);let p=new THREE.Vector3(x*0.8*1.035,y*1.035,z*0.92*(z>0&&y>-0.3?1.04:1)*1.035);
    const dir=nrm.clone().multiplyScalar(0.22).add(new THREE.Vector3(0,-0.6,0)).normalize();
    const front=-z>0.2;const L=(front?0.35+Math.random()*0.4:o.longHair*(0.6+Math.random()*0.5))*(y<0?0.75:1);const sl=L/segs;
    const w0=0.07+Math.random()*0.06;const side=new THREE.Vector3().crossVectors(dir,nrm).normalize();if(side.lengthSq()<0.01)side.set(1,0,0);
    const hc=mulc(o.hair,0.6+0.5*Math.random());const base=vi;
    for(let k=0;k<=segs;k++){const t=k/segs,w=w0*(1-0.55*t);
      P.push(p.x-side.x*w,p.y-side.y*w,p.z-side.z*w,p.x+side.x*w,p.y+side.y*w,p.z+side.z*w);const cc=mulc(hc,1-0.35*t);C.push(...cc,...cc);U.push(0,t,1,t);vi+=2;
      dir.add(new THREE.Vector3((Math.random()-.5)*0.12,-0.42,(Math.random()-.5)*0.12)).normalize();p=p.clone().addScaledVector(dir,sl);
      const ex=p.x/0.84,ey=p.y/1.04,ez=p.z/0.96,rad=Math.hypot(ex,ey,ez);if(rad<1.05&&p.y>-1.2){const k2=1.05/rad;p.x*=k2;p.z*=k2;if(p.y>0)p.y*=k2;}
      if(p.z<-0.55&&p.y<0.1&&!front)p.z=-0.55;}
    for(let k=0;k<segs;k++){const a=base+k*2;I.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();return g;}
function raggedLathe(pts,seg,colF,openFn,holes,o,hemY,hemAmt){let g=new THREE.LatheGeometry(pts.map(a=>new THREE.Vector2(a[0],a[1])),seg);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<hemY){const a=Math.atan2(p.getX(i),p.getZ(i));p.setY(i,y-hemAmt*(0.3+0.7*hash3(Math.floor(a*9),o.seed,1))*clamp((hemY-y)/0.05,0,1));}}
  g.computeVertexNormals();g=colorize(g,colF);const pa=g.attributes.position;const keep=[];
  for(let t=0;t<pa.count;t+=3){let cx=0,cy=0,cz=0;for(let k=0;k<3;k++){cx+=pa.getX(t+k)/3;cy+=pa.getY(t+k)/3;cz+=pa.getZ(t+k)/3;}
    if(openFn&&openFn(cx,cy,cz))continue;if(holes&&vnoise(cx*25+o.seed,cy*25,cz*25)>holes)continue;keep.push(t);}
  const out=new THREE.BufferGeometry();for(const name of['position','normal','color','uv']){const src=g.attributes[name];if(!src)continue;const n=src.itemSize,arr=new Float32Array(keep.length*3*n);
    keep.forEach((t,j)=>{for(let k=0;k<3;k++)for(let q=0;q<n;q++)arr[(j*3+k)*n+q]=src.array[(t+k)*n+q];});out.setAttribute(name,new THREE.BufferAttribute(arr,n));}
  return out;}
function buildJacket(o,tsx,tsz){const jc=o.jacket;const col=(p,n)=>{let c=fab(jc,p,0.25);if(o.jacketKind==='plaid'&&(Math.sin(p.x*120)>0.85||Math.sin((p.y+p.z)*120)>0.85))c=mulc(c,0.6);
    if(p.z<0&&Math.abs(p.x)<0.06)c=mulc(c,0.8);return grime(o,p,c);};
  const pts=[[0.178,-0.3],[0.174,-0.15],[0.168,0.0],[0.166,0.1],[0.17,0.2],[0.188,0.3],[0.205,0.4],[0.212,0.46],[0.19,0.52],[0.12,0.57],[0.09,0.585]];
  const g=raggedLathe(pts,30,col,(x,y,z)=>z<0&&Math.abs(x)<0.03+0.06*clamp((0.5-y)/0.8,0,1)&&y<0.53,0.83,o,-0.24,0.08);
  const m=new THREE.Matrix4().makeScale(tsx,1,tsz+0.02);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){_v3.fromBufferAttribute(pa,i).applyMatrix4(m);pa.setXYZ(i,_v3.x,_v3.y,_v3.z);}
  g.computeBoundingSphere();return g;}
function buildSkirt(o){const col=(p,n)=>grime(o,p,fab(o.dress,p,0.25));
  return raggedLathe([[0.2,-0.6],[0.19,-0.4],[0.17,-0.2],[0.155,0],[0.15,0.08]],26,col,null,0.85,o,-0.52,0.12);}
/* ================= burning skin: charring, glowing embers in the cracks, melting ================= */
const NOISE_GLSL=`
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float vn3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
`;
const BURN_T={value:0};
function addBurn(mat,u){u=u||{burn:{value:0},hot:{value:0},melt:{value:0}};mat.userData.bu=u;
  mat.onBeforeCompile=sh=>{sh.uniforms.uBurn=u.burn;sh.uniforms.uHot=u.hot;sh.uniforms.uMelt=u.melt;sh.uniforms.uBT=BURN_T;
    sh.vertexShader='varying vec3 vBP;\nuniform float uMelt;\n'+NOISE_GLSL+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBP=position;')
      .replace('#include <project_vertex>','if(uMelt>0.0){float mn=vn3(position*7.0);transformed.y-=uMelt*(0.04+0.14*mn)*clamp(transformed.y*0.7,0.0,1.0);transformed.xz*=1.0+uMelt*0.22*mn*clamp(1.2-transformed.y,0.0,1.0);}\n#include <project_vertex>');
    sh.fragmentShader='varying vec3 vBP;\nuniform float uBurn;uniform float uHot;uniform float uBT;\n'+NOISE_GLSL+sh.fragmentShader
      .replace('#include <color_fragment>','#include <color_fragment>\nfloat bn=vn3(vBP*9.0)*0.6+vn3(vBP*23.0)*0.4;float chr=smoothstep(0.0,0.32,uBurn*1.35-bn*0.6);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.035,0.028,0.022),chr);')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat crk=vn3(vBP*15.0+vec3(0.0,uBT*0.8,0.0))*0.7+vn3(vBP*41.0)*0.3;float glw=uHot*chr*smoothstep(0.475,0.495,crk)*(1.0-smoothstep(0.505,0.525,crk));totalEmissiveRadiance+=vec3(2.2,0.6,0.08)*glw*1.3+vec3(0.6,0.15,0.02)*uHot*0.06*chr;');};
  mat.customProgramCacheKey=()=>'burnskin';return u;}
// the hero's own look: long dark beard with grey streaks, black sunglasses, baseball cap
function buildBeard(o){const P=[],C=[],U=[],I=[];let vi=0,made=0;const N=o.hi?820:360,segs=9;const bc=o.beardCol||[0.07,0.055,0.05];
  for(let s=0;s<N*12&&made<N;s++){const u=Math.random()*2-1,th=Math.random()*Math.PI*2,rr=Math.sqrt(1-u*u);const x=rr*Math.cos(th),y=u,z=rr*Math.sin(th);
    const f=-z;const lips=(Math.abs(x)<0.3&&y>-0.64&&y<-0.37&&f>0.25)||(Math.abs(x)<0.38&&y>-0.74&&y<-0.37&&f>0.55);const stache=Math.abs(x)<0.32&&y>-0.37&&y<-0.29&&f>0.55;
    const jaw=y<-0.16&&z<0.35;const side=Math.abs(x)>0.5&&y<0.12&&y>-0.2&&z<0.15&&z>-0.6;
    if(lips||!(jaw||side||stache))continue;made++;
    let sx=0.8,sz=0.92;if(y<-0.15){const t=-0.15-y;sx*=1-t*0.45;sz*=1-t*0.1;}
    let p=new THREE.Vector3(x*sx*1.03,y*1.03,z*sz*1.03);const nrm=new THREE.Vector3(x,y*0.6,z).normalize();
    const dir=nrm.clone().multiplyScalar(stache?0.4:(f>0.4?0.25:0.45)).add(new THREE.Vector3(0,-0.7,0)).normalize();
    const chin=f>0.4&&y<-0.4;const bl=o.beardLen||1;const L=stache?0.14+Math.random()*0.1:(chin?(2.0+Math.random()*0.7)*bl:(f>0?(1.2+Math.random()*0.8)*Math.max(0.6,bl):(0.7+Math.random()*0.6)*Math.max(0.7,bl)));const sl=L/segs;
    const w0=(stache?0.07:0.1)+Math.random()*0.07;const sd=new THREE.Vector3().crossVectors(dir,nrm).normalize();if(sd.lengthSq()<0.01)sd.set(1,0,0);
    const grey=Math.random()<0.2;const hc=grey?mulc([0.4,0.38,0.36],0.8+0.3*Math.random()):mulc(bc,0.75+0.6*Math.random());
    for(let k=0;k<=segs;k++){const t=k/segs,w=w0*(1-0.5*t);
      P.push(p.x-sd.x*w,p.y-sd.y*w,p.z-sd.z*w,p.x+sd.x*w,p.y+sd.y*w,p.z+sd.z*w);C.push(...hc,...hc);U.push(0,t,1,t);vi+=2;
      dir.add(new THREE.Vector3((Math.random()-.5)*0.16,-0.35,(Math.random()-.5)*0.1)).normalize();p=p.clone().addScaledVector(dir,sl);
      if(p.y<-0.9&&p.z>-0.62)p.z=-0.62-(Math.random()*0.06);if(p.y<-1.35&&p.z>-1.0)p.z=-1.0-Math.random()*0.08;if(p.y<-1.9&&p.z>-1.15)p.z=-1.15;
      p.x*=p.y<-0.9?0.985:1;}
    for(let k=0;k<segs;k++){const a=vi-(segs+1)*2+k*2;I.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();return g;}
function buildGear(o){const p=[];const bc=o.beardCol||[0.07,0.055,0.05];
  // solid beard body under the strands so it reads full, not see-through
  const bl=o.beardLen||1;p.push(P_(colorize(new THREE.SphereGeometry(1,20,16),q=>mulc(bc,0.85+0.3*hash3(q.x*40,q.y*40,q.z*40))),bl<0.8?M(0,-0.86,-0.52,0.25,0,0,0.6,0.42,0.38):M(0,-1.2,-0.5,0.25,0,0,0.58,0.6,0.4)));
  if(bl>=0.8)p.push(P_(colorize(new THREE.SphereGeometry(1,16,12),q=>mulc(bc,0.85+0.3*hash3(q.x*40,q.y*40,q.z*40))),M(0,-1.55,-0.78,0.35,0,0,0.42,0.55,0.26)));
  if(o.cap){const cc=o.cap,cd=mulc(o.cap,0.7);
    p.push(P_(colorize(new THREE.SphereGeometry(1,28,14,0,Math.PI*2,0,Math.PI*0.5),q=>{let c=fab(cc,q,0.12,0.2);const a=Math.atan2(q.x,q.z);if(Math.abs(Math.sin(a*3))<0.04)c=mulc(c,0.82);return c;}),M(0,0.17,0.03,-0.1,0,0,0.9,0.9,1.0)));
    p.push(P_(colorize(new THREE.CylinderGeometry(1,1,0.045,28,1,false,Math.PI/2,Math.PI),q=>q.y<0?cd:cc),M(0,0.25,-0.45,0.12,0,0,0.82,1,0.95)));
    p.push(P_(colorize(new THREE.SphereGeometry(1,8,6),()=>cd),M(0,1.07,0.03,0,0,0,0.07,0.04,0.07)));}
  if(o.glasses){const fr=[0.03,0.03,0.035];
    p.push(P_(new THREE.BoxGeometry(0.94,0.045,0.04),M(0,0.24,-0.885),fr));p.push(P_(new THREE.BoxGeometry(0.1,0.03,0.03),M(0,0.16,-0.9),fr));
    for(const s of[-1,1]){p.push(P_(new THREE.BoxGeometry(0.035,0.24,0.04),M(s*0.52,0.12,-0.86),fr));p.push(P_(new THREE.BoxGeometry(0.42,0.03,0.035),M(s*0.31,0.0,-0.885),fr));
      p.push(P_(new THREE.BoxGeometry(0.035,0.04,0.86),M(s*0.79,0.2,-0.44,0,s*-0.1,0),fr));}}
  return mergeParts(p);}
function buildLenses(){const p=[];for(const s of[-1,1])p.push(P_(colorize(new THREE.SphereGeometry(1,18,12),()=>[1,1,1]),M(s*0.31,0.12,-0.875,0,0,0,0.21,0.125,0.03)));return mergeParts(p);}
const lensMat=new THREE.MeshStandardMaterial({color:0x0b0d12,metalness:0.85,roughness:0.08,vertexColors:true});
// face split into animatable parts (like blendshapes): eyes, upper lids, brows and mouth move; the rest is one mesh
function buildFaceGeos(o){
  const parts=[P_(makeHead(o))];const hi=o.hi;
  for(const s of[-1,1]){
    const low=colorize(new THREE.SphereGeometry(1,hi?20:10,4,0,Math.PI*2,Math.PI*0.62,Math.PI*0.2),()=>mulc(o.skin,0.85));
    parts.push(P_(low,M(s*0.31,0.1,-0.74,0.2,0,0,0.118)));
    const ear=colorize(new THREE.SphereGeometry(1,12,10),p=>mulc(o.skin,p.x*s<0.2?0.8:0.98));
    parts.push(P_(ear,M(s*0.79,0.0,0.06,0,s*0.25,0,0.06,0.14,0.1)));
  }
  const eye=colorize(new THREE.SphereGeometry(1,hi?24:12,hi?18:8),p=>{
    if(o.zombie){if(p.z<-0.97)return [0.08,0.07,0.06];if(p.z<-0.8)return mixc([0.66,0.68,0.66],[0.5,0.48,0.44],hash3(Math.floor(Math.atan2(p.y,p.x)*20),3,1));const vn=vnoise(p.x*14,p.y*14,p.z*14);return Math.abs(vn-0.5)<0.06?[0.55,0.14,0.12]:[0.62,0.54,0.44];}
    if(p.z<-0.93)return [0.02,0.02,0.02];
    if(p.z<-0.72){const a=Math.atan2(p.y,p.x);const k=0.75+0.35*hash3(Math.floor(a*20),1,2);return mulc(o.zombie?[0.75,0.74,0.6]:o.iris,k);}
    const v=o.zombie?[0.8,0.76,0.55]:[0.86,0.84,0.8];const vein=vnoise(p.x*12,p.y*12,p.z*12);return Math.abs(vein-0.5)<0.03&&p.z>-0.6?[0.7,0.3,0.28]:v;});
  const lid=colorize(new THREE.SphereGeometry(1,hi?22:12,8,0,Math.PI*2,0,Math.PI*0.5),p=>mulc(o.skin,(o.zombie?0.7:0.9)*(p.y<0.15?0.85:1)));
  const brow=colorize(capGeo(0.025,0.2,8,3),p=>mulc(o.brow||o.hair||[0.2,0.15,0.12],0.7+0.5*hash3(p.x*900,p.y*900,p.z*900)));
  const mouth=colorize(new THREE.SphereGeometry(1,16,10),p=>{if(o.zombie){if(p.y>0.4)return Math.sin(p.x*26)>-0.2?[0.7,0.64,0.46]:[0.08,0.05,0.03];if(p.y<-0.4)return Math.sin(p.x*24+1)>-0.25?[0.66,0.58,0.4]:[0.08,0.05,0.03];return [0.04,0.02,0.015];}return p.y>0.6?[0.82,0.8,0.74]:(p.y<-0.4&&p.z<-0.2?[0.6,0.28,0.28]:[0.05,0.02,0.02]);});
  if(o.zombie){parts.push(P_(colorize(new THREE.SphereGeometry(1,14,8),q=>q.y>0.3||q.y<-0.3?[0.2,0.08,0.07]:[0.08,0.02,0.02]),M(0,-0.505,-0.785,0,0,0,0.15,0.06,0.06)));
    for(const [ty,dir] of[[-0.465,1],[-0.555,-1]])for(let i=0;i<10;i++){if(hash3(i,ty*10,o.seed)<0.14)continue;const a=(i-4.5)*0.07;const L=0.04+0.02*hash3(i,o.seed,ty);
      parts.push(P_(colorize(new THREE.SphereGeometry(1,6,5),()=>mixc([0.78,0.7,0.48],[0.48,0.36,0.18],hash3(i,ty,o.seed)*0.8)),M(Math.sin(a)*0.14,ty*0.99-dir*(0.003*Math.abs(i-4.5)),-0.825+0.02*Math.abs(a)*4,0,a,(hash3(i,o.seed,2)-0.5)*0.3,0.017,L*0.6,0.013)));}}
  return {head:mergeParts(parts),eye,lid,brow,mouth,browTilt:o.zombie?-0.25:0.08};
}
// hands: individually modeled fingers with knuckle creases and nails, baked into a pose
const FINGERS=[{x:0.027,L:[0.046,0.028,0.022],r:0.0098,sp:-0.08},{x:0.009,L:[0.051,0.031,0.024],r:0.01,sp:-0.02},{x:-0.009,L:[0.048,0.029,0.023],r:0.0095,sp:0.04},{x:-0.026,L:[0.038,0.023,0.019],r:0.0085,sp:0.11}];
const POSES={grip:[[1.35,1.45,0.95],[0.55,0.7]],foregrip:[[1.1,1.25,0.8],[0.5,0.55]],claw:[[0.55,0.85,0.7],[0.3,0.4]],relax:[[0.35,0.45,0.3],[0.2,0.25]],cup:[[0.95,0.9,0.55],[0.15,0.2]],wrap:[[1.25,1.35,0.9],[-0.1,0.05]]};
function buildHandGeo(o,side,pose){
  const s=side,sk=o.skin,hi=o.hi,seg=hi?12:7,parts=[];const pz=POSES[pose];
  const segCol=(len,r,isTip)=>(p,n)=>{const H=len/2+r,t=p.y/H;let c=o.zombie?decayCol(o,p,12):mulc(sk,0.94+0.1*hash3(p.x*3000,p.y*3000,p.z*3000));
    c=mulc(c,1-0.24*Math.exp(-(((Math.abs(t)-0.8)/0.08)**2)));
    if(hi&&p.z>0&&t>0.45){for(const tk of[0.55,0.64,0.73])c=mulc(c,1-0.2*Math.exp(-(((t-tk)/0.014)**2))*clamp(p.z/r,0,1));}
    if(p.z<0)c=mixc(c,[sk[0]*1.04,sk[1]*0.9,sk[2]*0.88],0.25);
    if(o.zombie&&isTip&&t<-0.4)c=mixc(c,[0.15,0.12,0.1],0.5);return c;};
  const palm=colorize(new THREE.SphereGeometry(1,hi?20:10,hi?14:8),(p,n)=>{let c=mulc(sk,0.94+0.1*vnoise(p.x*20,p.y*20,p.z*20));
    if(p.z>0.2&&hi){for(const xk of[0.55,0.2,-0.2,-0.55])c=mulc(c,1-0.12*Math.exp(-(((p.x-xk)/0.05)**2))*clamp(-p.y,0,1));
      const vn=vnoise(p.x*6+2,p.y*6,1);if(Math.abs(vn-0.5)<0.03)c=mixc(c,o.zombie?[0.3,0.25,0.35]:[sk[0]*0.8,sk[1]*0.75,sk[2]*0.95],0.5);}
    if(p.z<-0.3&&hi){const l1=Math.abs(p.y+0.15-p.x*0.3),l2=Math.abs(p.y-0.25+p.x*0.25);c=mulc(c,1-0.25*Math.exp(-((l1/0.03)**2))-0.2*Math.exp(-((l2/0.03)**2)));}
    return c;});
  parts.push(P_(palm,M(0,-0.055,0,0,0,0,0.046,0.056,0.019)));
  parts.push(P_(colorize(capGeo(0.027,0.035,seg,3),()=>mulc(sk,0.97)),M(0,0.005,0)));
  const nailCol=o.zombie?[0.35,0.3,0.25]:[0.92,0.76,0.72];
  FINGERS.forEach((F,fi)=>{let m=M(s*F.x,-0.098,0,0,0,s*F.sp);
    if(hi)parts.push(P_(colorize(new THREE.SphereGeometry(1,8,6),()=>mulc(sk,0.95)),new THREE.Matrix4().multiplyMatrices(m,M(0,0.004,0.006,0,0,0,0.0115,0.009,0.009))));
    let r=F.r;F.L.forEach((L,j)=>{m=new THREE.Matrix4().multiplyMatrices(m,M(0,0,0,pz[0][j]*(1-0.08*fi*(pose==='grip'?-1:0)),0,0));
      const len=Math.max(0.002,L-r*0.9);
      parts.push(P_(colorize(capGeo(r,len,seg,hi?4:2),segCol(len,r,j===2)),new THREE.Matrix4().multiplyMatrices(m,M(0,-L/2,0))));
      if(j===2)parts.push(P_(colorize(new THREE.SphereGeometry(1,hi?10:6,hi?8:4),()=>nailCol),new THREE.Matrix4().multiplyMatrices(m,M(0,-L*0.62,r*0.72,0,0,0,r*0.78,L*0.36,r*0.32))));
      m=new THREE.Matrix4().multiplyMatrices(m,M(0,-L,0));r*=0.9;});});
  let m=M(s*0.036,-0.028,-0.01,0,-s*0.7,s*0.85);const tl=[0.042,0.033];let r=0.0115;
  tl.forEach((L,j)=>{m=new THREE.Matrix4().multiplyMatrices(m,M(0,0,0,pz[1][j],0,0));const len=L-r*0.9;
    parts.push(P_(colorize(capGeo(r,len,seg,hi?4:2),segCol(len,r,j===1)),new THREE.Matrix4().multiplyMatrices(m,M(0,-L/2,0))));
    if(j===1)parts.push(P_(colorize(new THREE.SphereGeometry(1,8,6),()=>nailCol),new THREE.Matrix4().multiplyMatrices(m,M(0,-L*0.6,r*0.72,0,0,0,r*0.82,L*0.36,r*0.32))));
    m=new THREE.Matrix4().multiplyMatrices(m,M(0,-L,0));r*=0.92;});
  parts.push(P_(colorize(new THREE.SphereGeometry(1,10,8),()=>mulc(sk,0.96)),M(s*0.03,-0.04,-0.008,0,0,0,0.02,0.03,0.016)));
  return mergeParts(parts);
}
// clothing colour functions
function grime(o,p,c){c=mixc(c,[0.34,0.3,0.25],0.35);const dn=vnoise(p.x*9+o.seed,p.y*9,p.z*9);c=mixc(c,[0.28,0.24,0.19],clamp((dn-0.35)*1.4,0,0.7));
  const sn=vnoise(p.x*14+o.seed,p.y*14,p.z*14+3);if(sn>0.6)c=mixc(c,[0.24,0.09,0.06],Math.min(0.85,(sn-0.6)*2.6));
  const st=vnoise(p.x*40,p.y*8+o.seed,p.z*40);if(st>0.72)c=mixc(c,[0.2,0.08,0.05],0.6);
  const tn=vnoise(p.x*30,p.y*30+o.seed,p.z*30);if(tn>0.8)c=[0.06,0.05,0.05];return mulc(c,0.75+0.25*hash3(p.x*800,p.y*800,p.z*800));}
const PIN=(o,p,c)=>o.pin&&Math.abs(Math.sin(Math.atan2(p.x,p.z)*70))>0.97?mulc(c,1.45):c;
function shirtCol(o){return (p,n)=>{const st=o.shirt;let c=fab(st.base,p,0.22);
  if(st.kind==='jacket'){c=PIN(o,p,c);const ow=st.suit?0.02+Math.max(0,p.y-0.03)*0.13:0.045;if(p.z<0&&st.suit&&p.y>0.22&&Math.abs(p.x)>=ow&&Math.abs(p.x)<ow+0.03)c=mulc(c,Math.abs(Math.abs(p.x)-ow-0.03)<0.003?0.6:0.88);
    if(p.z<0&&Math.abs(p.x)<ow&&p.y<0.5&&p.y>0.03){c=fab(st.tee,p,0.15);if(st.suit&&Math.abs(p.x)<0.004&&((p.y*14)%1)<0.12)c=[0.55,0.55,0.58];}
    if(p.z<0&&Math.abs(Math.abs(p.x)-0.048)<0.005&&p.y<0.5)c=[0.25,0.24,0.22];
    if(p.z<0&&Math.abs(p.x)>0.06&&Math.abs(p.x)<0.13&&p.y>0.07&&p.y<0.2)c=mulc(c,0.86);
    if(p.z<0&&Math.abs(p.x)>0.06&&Math.abs(p.x)<0.13&&Math.abs(p.y-0.2)<0.005)c=mulc(c,0.55);
    if(p.z<0&&p.x>0.05&&p.x<0.12&&p.y>0.33&&p.y<0.41)c=mulc(c,0.88);
    if(p.y>0.5)c=mulc(c,0.82);}
  if(st.kind==='plaid'){const a=Math.sin(p.x*130)>0.82||Math.sin((p.y+p.z)*130)>0.82;if(a)c=mulc(c,0.55);const b=Math.sin(p.x*130+1.2)>0.95||Math.sin((p.y+p.z)*130+1.2)>0.95;if(b)c=mixc(c,[0.8,0.75,0.6],0.4);}
  if(st.kind==='office'){if(p.z<0&&Math.abs(p.x)<0.022&&p.y>0.12&&p.y<0.52)c=fab(st.tie,p,0.15);if(p.z<0&&Math.abs(p.x)<0.004)c=mulc(c,0.85);}
  if(Math.abs(p.z)<0.006)c=mulc(c,0.8);
  if(o.zombie)c=grime(o,p,c);
  return c;};}
function pantsCol(o,leg){return (p,n)=>{let c=PIN(o,p,fab(o.pants,p,0.24,1.4));if(leg){if(Math.abs(p.x)>0.05&&Math.abs(p.z)<0.01)c=mulc(c,0.75);
    if(p.z<0)c=mixc(c,[o.pants[0]*1.25+0.05,o.pants[1]*1.25+0.05,o.pants[2]*1.2+0.05],0.25*clamp(1-Math.abs(p.y)/0.2,0,1));}
  if(o.zombie)c=grime(o,p,c);return c;};}
function buildBodyGeos(o){
  const G={};const sk=o.skin;const skinF=o.zombie?(p=>mixc(mulc(decayCol(o,p,4),0.82),[0.3,0.27,0.22],0.25)):(p=>mulc(sk,0.94+0.1*vnoise(p.x*30,p.y*30,p.z*30)));
  const torsoPts=[[1e-4,-0.02],[0.15,-0.01],[0.155,0.08],[0.145,0.18],[0.16,0.3],[0.185,0.4],[0.198,0.45],[0.192,0.5],[0.15,0.545],[0.075,0.575],[1e-4,0.585]].map(a=>new THREE.Vector2(a[0],a[1]));
  const tsx=o.female?0.98:(o.zombie?1.03:1.12),tsz=o.zombie?0.66:0.72;const tp=[P_(colorize(new THREE.LatheGeometry(torsoPts,o.hi?28:16),shirtCol(o)),M(0,0,0,0,0,0,tsx,1,tsz))];
  tp.push(P_(colorize(new THREE.CylinderGeometry(0.054,0.066,0.12,16),p=>mulc(skinF(p),0.72+0.25*clamp((p.y+0.06)/0.12,0,1)*(o.zombie?0.8:1))),M(0,0.585,0.01)));

  if(o.shirt.kind==='jacket')tp.push(P_(colorize(new THREE.TorusGeometry(0.075,0.022,6,20),()=>mulc(o.shirt.base,0.8)),M(0,0.555,0.005,Math.PI/2,0,0,1.1,1,0.85)));
  G.torso=mergeParts(tp);
  const pelPts=[[1e-4,-0.13],[0.1,-0.12],[0.15,-0.05],[0.155,0.03],[0.152,0.09],[1e-4,0.1]].map(a=>new THREE.Vector2(a[0],a[1]));
  G.pelvis=mergeParts([P_(colorize(new THREE.LatheGeometry(pelPts,o.hi?24:14),(p,n)=>{if(p.y>0.025&&p.y<0.07){if(p.z<0&&Math.abs(p.x)<0.028)return [0.55,0.53,0.5];return fab([0.2,0.13,0.08],p,0.2);}return pantsCol(o,false)(p,n);}),M(0,0,0,0,0,0,1.1,1,0.78))]);
  const sl=o.sleeves||'long';
  const fold=(fn,y0,y1,amt)=>(p,n)=>{let c=fn(p,n);if(p.y>y0&&p.y<y1){const w=Math.pow(Math.max(0,Math.sin(p.y*230+Math.sin(p.x*70+p.z*50)*2.2)),6);c=mulc(c,1-amt*w);}return c;};
  const slvF=sl==='none'?skinF:(o.shirt.kind==='jacket'?(p=>PIN(o,p,fab(o.shirt.base,p,0.22))):shirtCol(o)),slvS=sl==='none'?skinF:(p=>fab(o.shirt.base,p,0.2,0.08));
  const jsl=o.jacket?[P_(colorize(taperGeo(0.07,0.06,0.24,12),p=>grime(o,p,fab(o.jacket,p,0.25))),M(0,-0.15,0))]:[];
  G.upper=mergeParts([...jsl,P_(colorize(taperGeo(0.056,0.047,0.2,o.hi?16:10),fold(slvF,-0.2,-0.07,0.22)),M(0,-0.15,0)),
    P_(colorize(new THREE.SphereGeometry(1,12,10),slvS),M(0,-0.045,0,0,0,0,0.066,0.088,0.064)),
    P_(colorize(new THREE.SphereGeometry(1,12,10),slvS),M(0,-0.145,-0.024,0,0,0,0.046,0.078,0.04)),
    P_(colorize(new THREE.SphereGeometry(1,12,10),slvS),M(0,-0.13,0.026,0,0,0,0.045,0.085,0.038))]);
  const fp=[];
  if(sl==='long'){fp.push(P_(colorize(taperGeo(0.048,0.041,0.17,o.hi?16:10),shirtCol(o)),M(0,-0.11,0)));
    fp.push(P_(colorize(taperGeo(0.044,0.044,0.015,o.hi?16:10),()=>mulc(o.shirt.base,0.7)),M(0,-0.215,0)));}
  else fp.push(P_(colorize(taperGeo(0.043,0.033,0.19,o.hi?16:10),(p,n)=>{let c=skinF(p);if(o.zombie){const sn=vnoise(p.x*25,p.y*25,p.z*25+o.seed);if(sn>0.66)c=mixc(c,[0.3,0.12,0.12],(sn-0.66)*2.2);}return c;}),M(0,-0.12,0)));
  fp.push(P_(colorize(capGeo(0.029,0.04,o.hi?14:8,3),skinF),M(0,-0.245,0)));
  fp.push(P_(colorize(new THREE.SphereGeometry(1,12,10),sl==='long'?(p=>mulc(fab(o.shirt.base,p,0.2,0.08),0.92)):skinF),M(0,-0.012,0.03,0,0,0,0.036,0.036,0.03)));
  fp.push(P_(colorize(new THREE.SphereGeometry(1,12,10),sl==='long'?(p=>fab(o.shirt.base,p,0.2,0.08)):skinF),M(0,-0.07,-0.006,0,0,0,0.047,0.075,0.043)));
  if(sl==='long')fp[0]=P_(colorize(taperGeo(0.048,0.041,0.17,o.hi?16:10),fold(slvF,0.02,0.12,0.22)),M(0,-0.11,0));
  if(o.jacket){const cuff=raggedLathe([[0.052,-0.12],[0.055,0],[0.062,0.13]],12,p=>grime(o,p,fab(o.jacket,p,0.25)),null,0.9,o,-0.09,0.05);fp.push(P_(cuff,M(0,-0.12,0)));}
  G.foreR=mergeParts(fp);
  const fl=fp.slice();if(o.watch){fl.push(P_(colorize(new THREE.TorusGeometry(0.031,0.0075,6,18),()=>[0.08,0.08,0.08]),M(0,-0.235,0,Math.PI/2,0,0)));
    fl.push(P_(colorize(new THREE.CylinderGeometry(0.017,0.017,0.009,18),(p)=>p.y>0.004?[0.06,0.07,0.08]:[0.7,0.7,0.72]),M(0,-0.235,0.034,Math.PI/2,0,0)));}
  G.foreL=mergeParts(fl);
  G.thigh=mergeParts([P_(colorize(taperGeo(0.088,0.064,0.36,o.hi?18:10),fold(pantsCol(o,true),-0.3,-0.14,0.2)),M(0,-0.225,0)),
    P_(colorize(new THREE.SphereGeometry(1,12,10),pantsCol(o,true)),M(0,-0.2,-0.032,0,0,0,0.068,0.15,0.052)),
    P_(colorize(new THREE.SphereGeometry(1,12,10),pantsCol(o,true)),M(0,-0.2,0.03,0,0,0,0.065,0.14,0.05))]);
  G.shin=mergeParts([P_(colorize(taperGeo(0.063,0.05,0.34,o.hi?18:10),fold(pantsCol(o,true),0.08,0.3,0.22)),M(0,-0.21,0)),
    P_(colorize(new THREE.SphereGeometry(1,12,10),p=>mulc(pantsCol(o,true)(p),1.12)),M(0,-0.008,-0.047,0,0,0,0.035,0.04,0.022)),
    P_(colorize(new THREE.SphereGeometry(1,12,10),pantsCol(o,true)),M(0,-0.12,0.028,0,0,0,0.056,0.115,0.05))]);
  const sh=o.shoes;const bp=[];
  bp.push(P_(colorize(new THREE.CylinderGeometry(0.056,0.058,0.13,14),p=>{let c=fab(sh,p,0.2);if(p.z<-0.04&&Math.sin(p.y*240)>0.6)c=[0.75,0.7,0.6];return c;}),M(0,-0.02,0)));
  bp.push(P_(colorize(new THREE.SphereGeometry(1,16,10),p=>fab(sh,p,0.15)),M(0,-0.075,-0.065,0,0,0,0.058,0.048,0.13)));
  bp.push(P_(colorize(new THREE.BoxGeometry(0.115,0.025,0.29),()=>[0.08,0.075,0.07]),M(0,-0.112,-0.055)));
  G.foot=mergeParts(bp);
  const legProf=[[-0.03,0.092],[0.06,0.09],[0.16,0.085],[0.28,0.076],[0.38,0.064],[0.45,0.058],[0.5,0.059],[0.58,0.061],[0.66,0.056],[0.76,0.048],[0.85,0.043],[0.9,0.042]];
  const loose=o.zombie?0.013:0.004;
  G.legGeo=limbLathe(legProf.map(([q,r])=>[q,r+loose]),o.hi?22:14,fold(pantsCol(o,true),-0.56,-0.36,0.25),(q,x,z)=>(z>0&&q>0.48&&q<0.74?0.012*Math.sin((q-0.48)/0.26*Math.PI):0)+(z<0&&Math.abs(q-0.45)<0.04?0.006:0)+(o.zombie?0.006*Math.sin(q*60+Math.atan2(x,z)*3):0));
  const armProf=[[-0.03,0.06],[0.04,0.059],[0.12,0.054],[0.2,0.05],[0.27,0.045],[0.31,0.046],[0.38,0.045],[0.46,0.039],[0.53,0.032],[0.58,0.029]];
  const slEnd=sl==='long'?0.535:sl==='short'?0.17:-1;
  const armCol=(p,n)=>{const q=-p.y;const jag=0.03*hash3(Math.floor(Math.atan2(p.x,p.z)*6),o.seed||1,3);
    if(o.jacket&&q<0.48+jag)return grime(o,p,fab(o.jacket,p,0.25));
    if(q<slEnd+(o.zombie?jag:0)){let c=o.shirt.kind==='jacket'?fab(o.shirt.base,p,0.22):shirtCol(o)(p,n);if(q>0.24&&q<0.33)c=mulc(c,1-0.2*Math.pow(Math.max(0,Math.sin(q*230+p.x*60)),6));return c;}
    return skinF(p);};
  G.armGeo=limbLathe(armProf.map(([q,r])=>[q,r+(o.jacket?0.011:0)]),o.hi?20:12,armCol,(q,x,z)=>(z<0&&q>0.08&&q<0.22?0.006:0));
  G.armGeoL=o.watch?mergeParts([P_(G.armGeo),P_(colorize(new THREE.TorusGeometry(0.031,0.0075,6,18),()=>[0.08,0.08,0.08]),M(0,-0.535,0,Math.PI/2,0,0)),
    P_(colorize(new THREE.CylinderGeometry(0.017,0.017,0.009,18),(p)=>p.y>0.004?[0.06,0.07,0.08]:[0.7,0.7,0.72]),M(0,-0.535,0.034,Math.PI/2,0,0))]):G.armGeo;
  G.face=buildFaceGeos(o);G.head=G.face.head;G.faceMorph=buildFaceMorphs(G.head);if(o.hair&&!o.cap&&!o.bald)G.hair=buildHairShells(o);
  if(o.longHair&&o.hair)G.strands=buildHairStrands(o);
  if(o.beard)G.beard=addJawMorph(buildBeard(o));if(o.beard||o.cap||o.glasses)G.gear=addJawMorph(buildGear(o));if(o.glasses)G.lens=buildLenses();
  if(o.jacket)G.jacket=buildJacket(o,tsx,tsz);
  if(o.dress)G.skirt=buildSkirt(o);
  const ho=o.gloves?Object.assign({},o,{skin:o.gloves,zombie:false}):o;G.handR=buildHandGeo(ho,1,o.poseR||'relax');G.handL=buildHandGeo(ho,-1,o.poseL||'relax');
  return G;
}
const garmentMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.95,side:THREE.DoubleSide});
function limbLathe(prof,seg,colF,bulge){let g=new THREE.LatheGeometry(prof.map(([q,r])=>new THREE.Vector2(r,-q)),seg);const p=g.attributes.position;
  if(bulge)for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const k=bulge(-y,x,z);if(k){const rr=Math.hypot(x,z)||1;p.setX(i,x*(1+k/rr));p.setZ(i,z*(1+k/rr));}}
  g.computeVertexNormals();return colorize(g,colF);}
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// one continuous skinned body per character: every body part is bound to a skeleton and blended across the joints,
// so elbows, knees, shoulders, hips and the neck bend as one surface instead of separate mannequin pieces
function limbW(y,L,bt,bb){const s=-y;let wp=0,wc=0;
  if(bt>0){if(s<0)wp=Math.min(0.9,0.5+(-s)/bt*0.5);else if(s<bt)wp=0.5*(1-s/bt);}
  if(bb>0){const d=L-s;if(d<0)wc=Math.min(0.9,0.5+(-d)/bb*0.5);else if(d<bb)wc=0.5*(1-d/bb);}
  const t=wp+wc;if(t>0.95){wp*=0.95/t;wc*=0.95/t;}return [wp,wc];}
const _sv=new THREE.Vector3(),_sn=new THREE.Vector3(),_sm3=new THREE.Matrix3();
// facial blendshapes (like the ARKit set used by face capture), baked as vertex offsets on the head
const FACE_SHAPES=['jaw','smL','smR','frL','frR','puck','sneer','snarl','puff','sqL','sqR','jawX'];
function buildFaceMorphs(head){const p=head.attributes.position,n=p.count;const out=FACE_SHAPES.map(()=>new Float32Array(n*3));
  const g2=(x,y,cx,cy,r)=>Math.exp(-((x-cx)*(x-cx)+(y-cy)*(y-cy))/(r*r));const pv=new THREE.Vector3();
  for(let i=0;i<n;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=clamp((-z-0.3)/0.4,0,1);const put=(k,dx,dy,dz)=>{out[k][i*3]+=dx;out[k][i*3+1]+=dy;out[k][i*3+2]+=dz;};
    // jaw drop: everything below the mouth line swings down and back around a hinge in front of the ears
    const jw=clamp((-0.46-y)/0.09,0,1)*clamp((0.25-z)/0.3,0,1)*clamp((0.8-Math.abs(x))/0.2,0,1);
    if(jw>0){const a=-0.33*jw,ry=y+0.15,rz=z;const ny=ry*Math.cos(a)-rz*Math.sin(a),nz=ry*Math.sin(a)+rz*Math.cos(a);put(0,0,ny-ry,nz-rz);put(11,0.07*jw,0,0);}
    for(const [s,kS,kF,kQ] of[[1,1,3,9],[-1,2,4,10]]){
      const wc=g2(x,y,s*0.17,-0.48,0.12)*f,wk=g2(x,y,s*0.3,-0.3,0.15)*f;put(kS,s*0.03*wc+s*0.01*wk,0.055*wc+0.03*wk,0.035*wc-0.03*wk);
      const wf=g2(x,y,s*0.17,-0.5,0.12)*f,wm=g2(x,y,0,-0.68,0.14)*f*0.5;put(kF,s*0.01*wf,-0.045*wf+0.015*wm,0.01*wf);
      const wq=g2(x,y,s*0.31,-0.05,0.1)*f;put(kQ,0,0.035*wq,-0.01*wq);}
    const wp=Math.exp(-((x/0.2)**2)-(((y+0.49)/0.07)**2))*f;put(5,-x*0.45*wp,0,-0.06*wp);
    const wn=(g2(x,y,0.12,-0.25,0.08)+g2(x,y,-0.12,-0.25,0.08))*f,wl=Math.exp(-((x/0.15)**2)-(((y+0.43)/0.04)**2))*f;put(6,0,0.035*wn+0.015*wl,0.01*wn);
    const wu=Math.exp(-((x/0.2)**2)-(((y+0.43)/0.05)**2))*f;put(7,0,0.05*wu,0.025*wu);
    const wb=(g2(x,y,0.33,-0.38,0.14)+g2(x,y,-0.33,-0.38,0.14))*f*(Math.abs(x)>0.15?1:0);put(8,Math.sign(x)*0.045*wb,0,-0.03*wb);}
  return out;}
// beard and the solid beard mass swing with the jaw
function addJawMorph(geo){const p=geo.attributes.position,n=p.count;const j=new Float32Array(n*3),jx=new Float32Array(n*3);
  for(let i=0;i<n;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const jw=clamp((-0.46-y)/0.09,0,1)*clamp((0.25-z)/0.3,0,1);if(jw<=0)continue;
    const a=-0.33*jw,ry=y+0.15,rz=z;j[i*3+1]=ry*Math.cos(a)-rz*Math.sin(a)-ry;j[i*3+2]=ry*Math.sin(a)+rz*Math.cos(a)-rz;jx[i*3]=0.07*jw;}
  geo.morphAttributes.position=[new THREE.Float32BufferAttribute(j,3),new THREE.Float32BufferAttribute(jx,3)];geo.morphTargetsRelative=true;return geo;}
function attachFaceMorphs(skinGeo,G){if(!G.faceMorph||skinGeo.userData.morphed)return;const total=skinGeo.attributes.position.count,n=G.head.attributes.position.count,off=total-n;if(off<0)return;
  skinGeo.morphAttributes.position=G.faceMorph.map(d=>{const a=new Float32Array(total*3);for(let i=0;i<n*3;i++)a[off*3+i]=d[i]*0.125;return new THREE.Float32BufferAttribute(a,3);});
  skinGeo.morphTargetsRelative=true;skinGeo.userData.morphed=true;}
function skinMerge(list){const P=[],N=[],C=[],SI=[],SW=[];
  for(const it of list){if(!it.g)continue;const g=it.g.index?it.g.toNonIndexed():it.g;const pa=g.attributes.position,na=g.attributes.normal,ca=g.attributes.color;
    const m=it.bone.matrixWorld;_sm3.getNormalMatrix(m);
    for(let i=0;i<pa.count;i++){_sv.fromBufferAttribute(pa,i);const w=it.w(_sv);
      const idx=[0,0,0,0],wt=[0,0,0,0];let k=0,sum=0;for(const [bi,ww] of w){if(ww<=0.001||k>3)continue;idx[k]=bi;wt[k]=ww;sum+=ww;k++;}
      if(sum<=0){idx[0]=it.self;wt[0]=1;sum=1;}for(let q=0;q<4;q++)wt[q]/=sum;
      _sv.applyMatrix4(m);_sn.fromBufferAttribute(na,i).applyMatrix3(_sm3).normalize();
      P.push(_sv.x,_sv.y,_sv.z);N.push(_sn.x,_sn.y,_sn.z);if(ca)C.push(ca.getX(i),ca.getY(i),ca.getZ(i));else C.push(0.5,0.5,0.5);SI.push(...idx);SW.push(...wt);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));
  g.computeBoundingSphere();return g;}
function buildHuman(G,mat){
  mat.skinning=true;const root=new THREE.Group();const bones=[];
  const B=(x,y,z,par)=>{const b=new THREE.Bone();b.position.set(x,y,z);if(par)par.add(b);bones.push(b);return b;};
  const hips=B(0,1.04,0),torso=B(0,0.06,0,hips),head=B(0,0.62,0.01,torso);
  const arm=s=>{const sh=B(s*0.2,0.47,0,torso),el=B(0,-0.3,0,sh),hand=B(0,-0.268,0,el);return {sh,el,hand};};
  const leg=s=>{const hp=B(s*0.095,-0.05,0,hips),kn=B(0,-0.45,0,hp),ft=B(0,-0.42,0,kn);return {hp,kn,ft};};
  const armR=arm(1),armL=arm(-1),legR=leg(1),legL=leg(-1);
  hips.updateMatrixWorld(true);const I=b=>bones.indexOf(b);
  const iH=I(hips),iT=I(torso),iHd=I(head);
  const limb=(bone,par,child,L,bt,bb)=>({bone,self:I(bone),w:p=>{const [wp,wc]=limbW(p.y,L,bt,bb);return [[I(bone),1-wp-wc],[par?I(par):0,wp],[child?I(child):0,wc]];}});
  const torsoW=p=>{const out=[[iT,1]];let rest=1;
    if(p.y<0.06){const w=Math.min(0.7,0.5*(1-p.y/0.06));out.push([iH,w]);rest-=w;}
    if(p.y>0.55){const w=Math.min(0.75,(p.y-0.55)/0.08);out.push([iHd,w]);rest-=w;}
    if(p.y>0.36&&Math.abs(p.x)>0.12){const w=clamp((Math.abs(p.x)-0.12)/0.09,0,0.6)*clamp((p.y-0.36)/0.07,0,1);out.push([I(p.x>0?armR.sh:armL.sh),w]);rest-=w;}
    out[0][1]=Math.max(0.05,rest);return out;};
  const hipW=p=>{const out=[[iH,1]];if(p.y<-0.04){const w=clamp((-p.y-0.04)/0.35,0,0.7);const fR=clamp(0.5+p.x/0.16,0,1);out.push([I(legR.hp),w*fR],[I(legL.hp),w*(1-fR)]);out[0][1]=1-w;}return out;};
  const parts=[{g:G.pelvis,bone:hips,self:iH,w:hipW},{g:G.torso,bone:torso,self:iT,w:torsoW},
    {...limb(armR.hand,armR.el,null,9,0.03,0),g:G.handR},{...limb(armL.hand,armL.el,null,9,0.03,0),g:G.handL},
    {...limb(legR.ft,legR.kn,null,9,0.05,0),g:G.foot},{...limb(legL.ft,legL.kn,null,9,0.05,0),g:G.foot}];
  const armW=(A_)=>p=>{const q=-p.y;const e=smooth(0.22,0.36,q),hd=smooth(0.53,0.585,q),t=q<0.05?clamp((0.05-q)/0.1,0,0.45):0;
    return [[I(A_.sh),(1-e)*(1-t)],[I(A_.el),e*(1-hd)],[I(A_.hand),e*hd],[iT,t]];};
  const legW=(L_)=>p=>{const q=-p.y;const k=smooth(0.37,0.53,q),f=smooth(0.84,0.93,q),h=q<0.05?clamp((0.05-q)/0.12,0,0.5):0;
    return [[I(L_.hp),(1-k)*(1-h)],[I(L_.kn),k*(1-f)],[I(L_.ft),k*f],[iH,h]];};
  parts.push({g:G.armGeo,bone:armR.sh,self:I(armR.sh),w:armW(armR)},{g:G.armGeoL,bone:armL.sh,self:I(armL.sh),w:armW(armL)},
    {g:G.legGeo,bone:legR.hp,self:I(legR.hp),w:legW(legR)},{g:G.legGeo,bone:legL.hp,self:I(legL.hp),w:legW(legL)});
  if(!G.skinGeo)G.skinGeo=skinMerge(parts);
  const skel=new THREE.Skeleton(bones);
  const body=new THREE.SkinnedMesh(G.skinGeo,mat);body.add(hips);body.updateMatrixWorld(true);body.bind(skel);body.castShadow=true;body.frustumCulled=false;root.add(body);
  if(G.jacket||G.skirt){garmentMat.skinning=true;
    if(!G.clothGeo)G.clothGeo=skinMerge([G.jacket?{g:G.jacket,bone:torso,self:iT,w:torsoW}:{},G.skirt?{g:G.skirt,bone:hips,self:iH,w:hipW}:{}].filter(x=>x.g));
    let gm=garmentMat;if(mat.userData.bu){gm=garmentMat.clone();gm.skinning=true;addBurn(gm,mat.userData.bu);}const cloth=new THREE.SkinnedMesh(G.clothGeo,gm);cloth.bind(skel);cloth.castShadow=true;cloth.frustumCulled=false;root.add(cloth);}
  const rmat=mat.clone();rmat.skinning=false;rmat.morphTargets=false;if(mat.userData.bu)addBurn(rmat,mat.userData.bu);const hm=new THREE.Group();hm.position.set(0,0.12,0);hm.scale.setScalar(0.125);head.add(hm);
  // the head is its own rigid mesh on the head bone, carrying the facial blendshapes (keeps the body light)
  if(!G.headMorphed){G.head.morphAttributes.position=G.faceMorph.map(d=>new THREE.Float32BufferAttribute(d,3));G.head.morphTargetsRelative=true;G.headMorphed=true;}
  const hmat=mat.clone();hmat.skinning=false;hmat.morphTargets=true;if(mat.userData.bu)addBurn(hmat,mat.userData.bu);const headMesh=new THREE.Mesh(G.head,hmat);headMesh.castShadow=true;hm.add(headMesh);
  const F=G.face,face={eyes:[],lids:[],brows:[],mouth:null,body:headMesh};const hairM=[];
  let eyeMat=rmat;if(F.browTilt<0){eyeMat=rmat.clone();if(mat.userData.bu)addBurn(eyeMat,mat.userData.bu);eyeMat.emissive=new THREE.Color(0.04,0.035,0.03);}
  for(const s of[-1,1]){const e=new THREE.Mesh(F.eye,eyeMat);e.position.set(s*0.31,0.1,-0.74);e.scale.setScalar(0.11);hm.add(e);face.eyes.push(e);
    const l=new THREE.Mesh(F.lid,rmat);l.position.set(s*0.31,0.1,-0.74);l.scale.setScalar(0.122);l.rotation.x=0.45;hm.add(l);face.lids.push(l);
    const b=new THREE.Mesh(F.brow,rmat);b.position.set(s*0.3,0.265,-0.845);b.scale.set(0.8,1,0.55);b.userData={s,base:F.browTilt};b.rotation.z=s*(Math.PI/2+F.browTilt);hm.add(b);face.brows.push(b);}
  const mo=new THREE.Mesh(F.mouth,rmat);mo.position.set(0,-0.49,-0.82);mo.scale.set(0.15,0.004,0.07);hm.add(mo);face.mouth=mo;
  face.jawMeshes=[];if(G.beard){if(!G.beardMat)G.beardMat=new THREE.MeshStandardMaterial({vertexColors:true,alphaMap:strandTex,alphaTest:0.4,roughness:0.6,side:THREE.DoubleSide,morphTargets:true});const bm=new THREE.Mesh(G.beard,G.beardMat);bm.castShadow=true;hm.add(bm);hairM.push(bm);face.jawMeshes.push(bm);}
  if(G.gear){const gmat=rmat.clone();gmat.morphTargets=true;if(mat.userData.bu)addBurn(gmat,mat.userData.bu);const gm2=new THREE.Mesh(G.gear,gmat);gm2.castShadow=true;hm.add(gm2);face.jawMeshes.push(gm2);}if(G.lens){hm.add(new THREE.Mesh(G.lens,lensMat));}
  if(G.strands){if(!G.strandMat)G.strandMat=new THREE.MeshStandardMaterial({vertexColors:true,alphaMap:strandTex,alphaTest:0.4,roughness:0.5,side:THREE.DoubleSide});
    const hs=new THREE.Mesh(G.strands,G.strandMat);hs.castShadow=true;hm.add(hs);hairM.push(hs);}
  if(G.hair){if(!G.hairMats)G.hairMats=G.hair.map((g,i)=>new THREE.MeshStandardMaterial({vertexColors:true,alphaMap:hairTex,alphaTest:0.32+i*0.12,roughness:0.55,side:THREE.DoubleSide}));
    G.hair.forEach((g,i)=>{const hs=new THREE.Mesh(g,G.hairMats[i]);hm.add(hs);hairM.push(hs);});}
  const r={root,hips,torso,head,face,armR,armL,legR,legL,body,hairM,bu:mat.userData.bu};
  root.add(blob(1.0));return r;
}
