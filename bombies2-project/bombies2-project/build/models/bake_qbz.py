import json,numpy as np,base64
ps=json.load(open('qbz.json'))
X0,Y0,ZC=0.0058,-0.0043,-0.05
b=lambda a:base64.b64encode(a.tobytes()).decode()
d64=lambda f:'data:image/jpeg;base64,'+base64.b64encode(open('/home/claude/tex/'+f,'rb').read()).decode()
S=0.7;out=[]
for j,(c,nm,orm) in zip(ps,[('qbz_c.jpg','qbz_n.jpg','qbz_orm.jpg'),('qmag_c.jpg','qmag_n.jpg','qmag_orm.jpg')]):
  P=np.array(j['p']).reshape(-1,3);N=np.array(j['n']).reshape(-1,3);U=np.array(j['u']).reshape(-1,2);I=np.array(j['i']).reshape(-1,3)
  if j['mat']!='Qbz':P=P+np.array([0.0132,0.014,0])   # seat the magazine in the magwell
  Q=np.stack([-(P[:,0]-X0),P[:,1]-Y0+0.012,-(P[:,2]-ZC)],1);NN=np.stack([-N[:,0],N[:,1],-N[:,2]],1);NN/=np.linalg.norm(NN,axis=1,keepdims=True)+1e-9
  if j['mat']=='Qbz':
    bar=(P[I][:,:,2].min(1)>0.28)   # barrel/muzzle ahead of the handguard
    I=np.concatenate([I[~bar],I[bar]]);r=[[0,int((~bar).sum())*3],[int((~bar).sum())*3,len(I)*3]]
  else:r=[[0,len(I)*3]]
  umin=U.min(0);ur=U.max(0)-umin
  print(j['mat'],'bbox',Q.min(0).round(3),Q.max(0).round(3),'verts',len(P),'uv',umin,ur)
  idx=I.astype('<u2') if len(P)<65536 else I.astype('<u4')
  out.append('{S:%r,umin:[%r,%r],ur:[%r,%r],r:%s,big:%s,p:"%s",n:"%s",u:"%s",i:"%s",c:"%s",nm:"%s",orm:"%s"}'%(S,float(umin[0]),float(umin[1]),float(ur[0]),float(ur[1]),json.dumps(r),'true' if len(P)>=65536 else 'false',
   b(np.round(Q/S*32767).astype('<i2')),b(np.round(NN*127).astype('i1')),b(np.round((U-umin)/ur*65535).astype('<u2')),b(idx),d64(c),d64(nm),d64(orm)))
js='/* ================= QBZ-191 rifle: textured model from qbz-191-free (body + magazine materials), gun space, muzzle toward -z ================= */\nconst QBZ_DATA=['+',\n'.join(out)+'];\n'
open('/home/claude/bombies2/src/qbz_model.js','w').write(js);print(len(js))
