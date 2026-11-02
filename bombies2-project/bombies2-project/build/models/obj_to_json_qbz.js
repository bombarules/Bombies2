global.THREE=require('three');global.window=global;require('three/examples/js/loaders/OBJLoader.js');require('three/examples/js/utils/BufferGeometryUtils.js');
const fs=require('fs');const o=new THREE.OBJLoader().parse(fs.readFileSync('/tmp/qbz/source/x/Final test.obj','utf8'));
o.traverse(m=>{if(m.isMesh){const g=m.geometry;console.log(m.name,g.attributes.position.count,Object.keys(g.attributes),JSON.stringify(g.groups),m.material.map?'':Array.isArray(m.material)?m.material.map(x=>x.name):m.material.name);
 const out={groups:g.groups,mats:Array.isArray(m.material)?m.material.map(x=>x.name):[m.material.name]};
 // split per group, merge vertices
 const parts=[];const src=g;const grs=g.groups.length?g.groups:[{start:0,count:g.attributes.position.count,materialIndex:0}];
 for(const gr of grs){const q=new THREE.BufferGeometry();for(const k of ['position','normal','uv']){const a=src.attributes[k];q.setAttribute(k,new THREE.BufferAttribute(a.array.slice(gr.start*a.itemSize,(gr.start+gr.count)*a.itemSize),a.itemSize));}
  const mg=THREE.BufferGeometryUtils.mergeVertices(q,1e-6);mg.computeBoundingBox();console.log('group',gr.materialIndex,out.mats[gr.materialIndex],'verts',mg.attributes.position.count,'tris',mg.index.count/3,JSON.stringify(mg.boundingBox));
  parts.push({mat:out.mats[gr.materialIndex],p:Array.from(mg.attributes.position.array),n:Array.from(mg.attributes.normal.array),u:Array.from(mg.attributes.uv.array),i:Array.from(mg.index.array)});}
 fs.writeFileSync('qbz.json',JSON.stringify(parts));}});
