import json,numpy as np,base64
j=json.load(open('rifle.json'));P=np.array(j['p'],dtype=np.float64).reshape(-1,3);N=np.array(j['n']).reshape(-1,3);U=np.array(j['u']).reshape(-1,2);I=np.array(j['i']).reshape(-1,3)
n=len(P);par=np.arange(n)
def f(a):
  r=a
  while par[r]!=r: r=par[r]
  while par[a]!=r: nx=par[a];par[a]=r;a=nx
  return r
for t in I:
  a=f(t[0]);par[f(t[1])]=a;par[f(t[2])]=a
from collections import defaultdict
pos=defaultdict(list)
for i,p in enumerate(np.round(P,3)): pos[tuple(p)].append(i)
for v in pos.values():
  for k in v[1:]: par[f(k)]=f(v[0])
lab=np.array([f(i) for i in range(n)])
grp=np.zeros(n,int) # 0 body,1 holo,2 mag,3 barrel
for L in np.unique(lab):
  ix=np.where(lab==L)[0];q=P[ix];mn,mx=q.min(0),q.max(0)
  if mn[1]>=16.0 and mn[2]>=1.5 and mx[2]<=14 and mx[1]>17: grp[ix]=1
  elif mn[1]<-8 and mn[2]>10: grp[ix]=2
  elif mn[2]>20.4 and mx[1]<15.5 and mn[1]>12.5: grp[ix]=3
print('group verts',[int((grp==g).sum()) for g in range(4)])
tg=grp[I[:,0]]
# transform: 180deg about Y, cm->m, bore at y=0.012, grip lands under the hand
Q=np.stack([-P[:,0]*0.01,(P[:,1]-13.9)*0.01+0.012,-(P[:,2]-10)*0.01],1)
NN=np.stack([-N[:,0],N[:,1],-N[:,2]],1);NN/=np.linalg.norm(NN,axis=1,keepdims=True)+1e-9
print('bbox',Q.min(0),Q.max(0))
order=np.argsort(tg,kind='stable');I2=I[order];tg2=tg[order]
ranges=[[int(np.searchsorted(tg2,g))*3,int(np.searchsorted(tg2,g,side='right'))*3] for g in range(4)]
S=0.7
qp=np.round(Q/S*32767).astype('<i2');qn=np.round(NN*127).astype('i1')
umin=U.min(0);umax=U.max(0);qu=np.round((U-umin)/(umax-umin)*65535).astype('<u2')
print('uv range',umin,umax)
b=lambda a:base64.b64encode(a.tobytes()).decode()
d64=lambda f:'data:image/jpeg;base64,'+base64.b64encode(open('/home/claude/tex/'+f,'rb').read()).decode()
js=('/* ================= AR-15 rifle: textured model from sm_rifle.fbx with the Rifle_Olive PBR set =================\n'
 '   positions in meters, gun space (muzzle toward -z, bore at y=0.012). groups: body, holo sight, magazine, barrel. */\n'
 'const AR_DATA={S:%r,umin:[%r,%r],ur:[%r,%r],r:%s,\n p:"%s",\n n:"%s",\n u:"%s",\n i:"%s",\n c:"%s",\n nm:"%s",\n orm:"%s"};\n')%(S,float(umin[0]),float(umin[1]),float(umax[0]-umin[0]),float(umax[1]-umin[1]),json.dumps(ranges),b(qp),b(qn),b(qu),b(I2.astype('<u2')),d64('rifle_c.jpg'),d64('rifle_n.jpg'),d64('rifle_orm.jpg'))
open('/home/claude/conv/ar_model.js','w').write(js);print('ar_model.js',len(js))
