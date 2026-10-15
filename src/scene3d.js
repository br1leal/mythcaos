import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const MC=window.MC, canvas=document.getElementById('gl');
const r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
r.setPixelRatio(Math.min(devicePixelRatio,1.75)); r.toneMapping=THREE.ACESFilmicToneMapping; r.toneMappingExposure=1.05;
const scene=new THREE.Scene(), FOV=35, CZ=10;
const cam=new THREE.PerspectiveCamera(FOV,1,.1,100); cam.position.set(0,0,CZ);
scene.add(new THREE.HemisphereLight('#f1e4cf','#0b1416',.8));
const key=new THREE.DirectionalLight('#ffb59e',2.6); key.position.set(-4,5,6); scene.add(key);
const rim=new THREE.DirectionalLight('#ee6b54',3.2); rim.position.set(4,2,-5); scene.add(rim);
const fill=new THREE.DirectionalLight('#ffffff',.6); fill.position.set(1,0,8); scene.add(fill);
const rimColor=new THREE.Color('#ee6b54'), keyColor=new THREE.Color('#ffb59e');
MC.onTheme=()=>{const g=getComputedStyle(document.body).getPropertyValue('--glow').trim()||'#ee6b54'; try{rimColor.set(g)}catch(e){} keyColor.set(MC.theme==='limbo'?'#ff2a2a':'#ffb59e')}; MC.onTheme();
function size(){const w=innerWidth,h=innerHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()} size(); addEventListener('resize',size);

// tabuleiro com espessura
const board=new THREE.Group(); scene.add(board);
const BW=6, BH=6*1767/1800, TH=.32;
const tex=new THREE.TextureLoader().load('assets/misc/tabuleiro2.jpg'); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=8; tex.repeat.set(.96,.96); tex.offset.set(.02,.02);
const top=new THREE.MeshStandardMaterial({map:tex,roughness:.8,transparent:true,opacity:0});
const side=new THREE.MeshStandardMaterial({color:'#3a2616',roughness:.85,transparent:true,opacity:0});
const slab=new THREE.Mesh(new THREE.BoxGeometry(BW,TH,BH),[side,side,top,side,side,side]); slab.position.y=-TH/2; board.add(slab);
board.rotation.x=.95; board.visible=false;
const sc=document.createElement('canvas'); sc.width=sc.height=128; {const c=sc.getContext('2d'),g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(0,0,0,.75)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,128,128)}
const shadow=new THREE.Mesh(new THREE.PlaneGeometry(.55,.55),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,depthWrite:false}));
shadow.rotation.x=-Math.PI/2; shadow.position.y=.004; board.add(shadow);
const PATH=[[4,4],[5,5],[5,6],[4,6],[3,6],[2,6],[2,7],[1,7],[1,6],[1,5],[1,4],[2,4],[2,3],[1,2],[1,1],[2,1],[2,2],[3,2],[3,1],[4,1],[4,2],[5,2],[5,1],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[6,7],[7,7],[7,6],[7,5],[7,4],[7,3],[7,2],[7,1]];
const X0=.095,X1=.915,Y0=.102,Y1=.916, U=(v)=>((v-.02)/.96);
const casaLocal=PATH.map(([c,l])=>new THREE.Vector3((U(X0+(c-.5)*(X1-X0)/7)-.5)*BW,0,(U(Y0+(l-.5)*(Y1-Y0)/7)-.5)*BH));

// peão (figura) + marcador (base hexagonal) separáveis
const baseMats=[]; let baseOp=1;
const deckBase=new THREE.Group(); scene.add(deckBase); const deckMats=[]; let deckOp=0; const deckCur={pos:new THREE.Vector3(),s:1,t:1};
const pawn=new THREE.Group(), fig=new THREE.Group(), base=new THREE.Group(); pawn.add(fig,base); scene.add(pawn); const models={};
const loader=new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const load=(file,cb)=>fetch(`assets/peoes/${file}.glb64.txt`).then(r=>r.text()).then(t=>{const b=Uint8Array.from(atob(t.trim()),c=>c.charCodeAt(0));loader.parse(b.buffer,'',cb)}).catch(e=>console.warn('peão',file,e));
['saci','iara','medusa','mula','papainoel','valquiria'].forEach(id=>{models[id]={};
  load(id,g=>{g.scene.visible=id===MC.pawn;models[id].f=g.scene;fig.add(g.scene);MC.modelLoaded&&MC.modelLoaded()});
  load(id+'_marc',g=>{MC.modelLoaded&&MC.modelLoaded();g.scene.visible=id===MC.pawn;g.scene.traverse(o=>{if(o.isMesh){o.material.transparent=true;baseMats.push(o.material)}});models[id].b=g.scene;base.add(g.scene);
    const cl=g.scene.clone(true); cl.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;deckMats.push(o.material)}}); cl.visible=id===MC.pawn; models[id].d=cl; deckBase.add(cl)})});
let spinBoost=0;
MC.onPawn=id=>{for(const k in models){models[k].d&&(models[k].d.visible=k===id);models[k].f&&(models[k].f.visible=k===id);models[k].b&&(models[k].b.visible=k===id)} spinBoost=Math.PI*2};
MC.onJoin=()=>{spinBoost=Math.PI*4}; MC.onDraw=c=>{spinBoost=c==='Limbo'?Math.PI*6:Math.PI}; 

// girar com o mouse
const ray=new THREE.Raycaster(), pl=new THREE.Plane(new THREE.Vector3(0,0,1),0), tmp=new THREE.Vector3();
let drag=null, dragYaw=0, dragPitch=0, vYaw=0, mx=0, my=0, hovering=false, lastPX=0, lastPY=0;
const ndc=(x,y)=>({x:x/innerWidth*2-1,y:-(y/innerHeight*2-1)});
const canGrab=()=>['hero','free','show','zoom','story'].includes(MC.mode);
function hitPawn(x,y){if(!canGrab()) return false; const m=models[MC.pawn]; if(!m||!m.f) return false; ray.setFromCamera(ndc(x,y),cam); return ray.intersectObjects([m.f,m.b].filter(Boolean),true).length>0}
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;lastPX=e.clientX;lastPY=e.clientY;
  if(drag){const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY; dragYaw+=dx*.012; vYaw=dx*.012*.6; dragPitch=Math.max(-.6,Math.min(.6,dragPitch+dy*.006)); e.preventDefault()}});
addEventListener('pointerdown',e=>{if(e.button>0||e.pointerType==='touch') return; if(e.target.closest('a,button,input,select,label,.card,.hwrap,.modal,.gate,.pz-txt')) return; if(hitPawn(e.clientX,e.clientY)){drag={x:e.clientX,y:e.clientY};document.body.classList.add('dragged');document.body.classList.add('grabbing');e.preventDefault();const h=document.getElementById('hint3d');h&&(h.style.opacity=0)}});
addEventListener('pointerup',()=>{if(drag){drag=null;document.body.classList.remove('grabbing')}});
addEventListener('touchstart',e=>{const t=e.touches[0]; if(t&&hitPawn(t.clientX,t.clientY)){drag={x:t.clientX,y:t.clientY};document.body.classList.add('dragged');e.preventDefault()}},{passive:false});
addEventListener('touchmove',e=>{if(!drag)return;const t=e.touches[0];const dx=t.clientX-drag.x;drag.x=t.clientX;dragYaw+=dx*.014;vYaw=dx*.014*.6;e.preventDefault()},{passive:false});
addEventListener('touchend',()=>{drag=null});
function toWorld(sx,sy){ray.setFromCamera(ndc(sx,sy),cam);ray.ray.intersectPlane(pl,tmp);return tmp.clone()}
const wpp=()=>2*CZ*Math.tan(THREE.MathUtils.degToRad(FOV/2))/innerHeight;

const cur={pos:new THREE.Vector3(3,-1,0),s:1,lift:0}; let boardMix=0, spin=0, last=performance.now(), lastScroll=scrollY, vel=0, frameN=0;
const qSpin=new THREE.Quaternion(), qTilt=new THREE.Quaternion(), qTarget=new THREE.Quaternion(), yAxis=new THREE.Vector3(0,1,0), qCur=new THREE.Quaternion();
const smooth=t=>t*t*(3-2*t), clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), lerp=(a,b,t)=>a+(b-a)*t; let hopNow=0;
const xAxis=new THREE.Vector3(1,0,0), qInv=new THREE.Quaternion(), qB=new THREE.Quaternion(), vOff=new THREE.Vector3(), qId=new THREE.Quaternion(); let outCur=0;

function tick(now){
  const dt=Math.max(0,Math.min(.05,(now-last)/1000)); last=now; frameN++;
  const W=innerWidth,H=innerHeight,mob=W<761,k=1-Math.exp(-dt*6);
  const sv=(scrollY-lastScroll)/Math.max(dt,.001); lastScroll=scrollY; vel+=(sv-vel)*(1-Math.exp(-dt*5));
  if(!drag){dragYaw+=vYaw; vYaw*=Math.pow(.04,dt); dragPitch*=Math.pow(.2,dt)}
  spin=(MC.reduce?0:now*.00025)+scrollY*.0022+dragYaw;
  if(spinBoost>0){const d=Math.min(spinBoost,dt*9);spinBoost-=d;dragYaw+=d}
  rim.color.lerp(rimColor,k*.5); key.color.lerp(keyColor,k*.5);
  cam.position.x+=((MC.reduce?0:mx*.6)-cam.position.x)*k; cam.position.y+=((MC.reduce?0:-my*.4)-cam.position.y)*k; cam.lookAt(0,0,0);

  let tp, ts, tiltX=0, tiltZ=0, onBoard=false, posK=k, vis=true;
  const mode=MC.mode, p=MC.p;
  if(mode==='board'){
    onBoard=true;
    const vh=2*CZ*Math.tan(THREE.MathUtils.degToRad(FOV/2)), vw=vh*cam.aspect;
    const bsF=Math.min(1.35,vw*(mob?.98:.7)/BW,vh*1.02/(BH*.74)), bsI=Math.min(vw*(mob?.92:.5)/BW, vh*(mob?.46:.5)/BH);
    const rise=smooth(clamp(((MC.boardIn??1)-.45)/.55)), mv=smooth(clamp((p-.11)/.11));
    const ox=lerp(0,mob?0:vw*.2,mv), oy=lerp(-vh*(mob?.1:.14),mob?-vh*.06:vh*.09,mv)-(1-rise)*vh*.9+(MC.boardOut||0)*vh*1.1;
    const bs=lerp(bsI,bsF,mv); board.scale.setScalar(bs); board.position.set(ox,oy,0);
    board.rotation.x=lerp(1.28,.95,mv)-(1-rise)*.5; board.rotation.y=lerp(-1.1+rise*.5+p*1.2,-.3+p*.6,mv);
    const s=Math.min(36,Math.max(0,(p-.22)/.74*36)), i=Math.floor(s), f=smooth(s-i);
    const a=casaLocal[i], b=casaLocal[Math.min(36,i+1)]; const loc=a.clone().lerp(b,f);
    const hop=Math.sin(Math.PI*f)*.35; hopNow=hop;
    loc.y=hop; board.updateMatrixWorld(); tp=board.localToWorld(loc); ts=.72*bs; vis=p>.16; posK=1-Math.exp(-dt*14);
  } else if(mode==='story'){
    const sp=MC.storyPawn||0; tp=toWorld(W/2,H*(mob?.74:.8)); ts=Math.max(.0001,H*(mob?.34:.46)*wpp()*(.6+.4*sp)); vis=sp>.02; tiltX=.18; posK=1-Math.exp(-dt*9);
  } else if(mode==='zoom'){
    tp=toWorld(W/2,H*(mob?.86:.92)); ts=H*(mob?.46:.58)*wpp(); posK=1-Math.exp(-dt*7); tiltX=.12;
  } else if(mode==='dock'||(!mode)){
    const d=MC.dock; tp=toWorld(d.left+d.width/2,d.bottom-2); ts=d.height*.92*wpp(); posK=1-Math.exp(-dt*3.2);
  } else if(mode==='portal'){
    const z=clamp(p/.44); tp=toWorld(W/2,H*.62-z*H*.1); ts=Math.max(.0001,(1-z)*H*.34*wpp()); vis=p<.44; tiltX=z*.4;
  } else if(mode==='fall' && MC.slot){
    // cai no centro do abismo: encolhe girando até sumir; depois reaparece ao lado da logo
    const d=smooth(clamp(p/.62)); tp=toWorld(W/2,H*((mob?.72:.5)+.04*d)); ts=Math.max(.0001,H*(mob?.3:.38)*(1-d)*wpp()); vis=d<.985; tiltX=d*2.2; tiltZ=d*1.4; posK=1-Math.exp(-dt*8);
  } else {
    tp=toWorld(MC.free.sx,MC.free.sy); ts=MC.free.hp*wpp();
    tiltZ=Math.max(-.35,Math.min(.35,-vel*.0002)); tiltX=Math.max(-.3,Math.min(.3,vel*.0001));
    if(mode==='hero') tiltX+=.3; else if(mode==='show') tiltX+=.12;
  }
  boardMix+=((onBoard?1:0)-boardMix)*(1-Math.exp(-dt*12)); board.visible=boardMix>.01; top.opacity=side.opacity=boardMix*(1-(MC.boardOut||0));
  if(vis&&!MC._pv&&mode==='dock'){cur.pos.copy(tp); cur.s=ts*.05} MC._pv=vis;
  pawn.visible=vis;
  cur.pos.lerp(tp,posK); cur.s+=(ts-cur.s)*posK; cur.lift+=(MC.lift-cur.lift)*k;
  if(onBoard){const lp=board.worldToLocal(cur.pos.clone()); shadow.position.x=lp.x; shadow.position.z=lp.z; const hh=clamp(lp.y,0,.5); shadow.scale.setScalar(Math.max(.3,1.1-hh*1.2)); const so=boardMix*(pawn.visible?1:0)*clamp(1-hh*1.6)*(1-(MC.boardOut||0)); shadow.material.opacity=so; shadow.visible=so>.02} else shadow.visible=false;
  baseOp+=((MC.baseVis??1)-baseOp)*k; baseMats.forEach(mm=>mm.opacity=baseOp); base.visible=baseOp>.02;
  // base do peão sob o baralho escolhido (deitada, vista de cima)
  // a base se solta do peão e desce até o baralho da vez
  if(MC.deckRect){const d=MC.deckRect; const t=toWorld(d.left+d.width/2,d.bottom+d.width*.42), ts2=d.width*.41*wpp()/0.78;
    // a base sai do peão da logo e desce devagar até o baralho da vez
    if(deckOp<.02){ const dk=MC.dock; deckCur.pos.copy(toWorld(dk.left+dk.width/2,dk.bottom-dk.height*.12)); deckCur.s=dk.height*.92*wpp()*.95; deckCur.t=0; deckCur.from=deckCur.pos.clone(); deckCur.k=0; deckOp=.05}
    if(deckCur.k!==undefined&&deckCur.k<1){ deckCur.k=Math.min(1,deckCur.k+dt/1.6); const e=deckCur.k<.5?4*deckCur.k**3:1-Math.pow(-2*deckCur.k+2,3)/2;
      deckCur.pos.lerpVectors(deckCur.from,t,e); deckCur.pos.y+=Math.sin(Math.PI*e)*.6; const s0=MC.dock.height*.92*wpp()*.95; deckCur.s=s0+(ts2-s0)*e; deckCur.t=e }
    else { const kk=1-Math.exp(-dt*2.6); deckCur.pos.lerp(t,kk); deckCur.s+=(ts2-deckCur.s)*kk; deckCur.t+=(1-deckCur.t)*kk }}
  deckOp+=((MC.deckRect?1:0)-deckOp)*(1-Math.exp(-dt*(MC.deckRect?6:14))); if(!MC.deckRect&&deckOp<.02) deckCur.k=undefined; deckMats.forEach(mm=>mm.opacity=deckOp); deckBase.visible=deckOp>.02;
  deckBase.position.copy(deckCur.pos); deckBase.position.z=0; deckBase.scale.setScalar(Math.max(.0001,deckCur.s)); const dtq=deckCur.t??1; deckBase.rotation.set((Math.PI/2+my*.25)*dtq,now*.0004,mx*.25*dtq);
  pawn.position.copy(cur.pos); pawn.scale.setScalar(Math.max(.0001,cur.s));
  if(onBoard){const v=cur.pos.clone().project(cam); MC.pawnScr={x:(v.x+1)/2*W,y:(1-v.y)/2*H}}
  // desencaixe: a figura sobe e gira um pouco além da base
  fig.position.set(0,cur.lift+(cur.lift>.05&&!MC.reduce?Math.sin(now/600)*.015:0),0); fig.rotation.y=cur.lift*1.2;
  qSpin.setFromAxisAngle(yAxis, onBoard? -0.4+dragYaw : (mode==='dock'? now*.0006 : spin + mx*.5));
  qTilt.setFromEuler(new THREE.Euler(tiltX+dragPitch,0,tiltZ));
  if(onBoard){qTarget.copy(board.quaternion).multiply(qSpin)} else {qTarget.copy(qTilt).multiply(qSpin)}
  qCur.slerp(qTarget, onBoard?k:Math.min(1,k*2.2)); pawn.quaternion.copy(qCur);
  // hero: a base sai de baixo do peão e fica ao lado, inclinada para mostrar o desenho
  // a peça: a figura sai da base (arco) e fica ao lado; a base inclina para mostrar o entalhe
  outCur+=((MC.sep||0)-outCur)*(1-Math.exp(-dt*5)); const o=clamp(outCur);
  if(o>.001){qInv.copy(qCur).invert();
    vOff.set(-o*(mob?.3:.46),Math.sin(Math.PI*o)*.5,0).applyQuaternion(qInv); fig.position.add(vOff);
    vOff.set(o*(mob?.28:.4),o*.3,0).applyQuaternion(qInv); base.position.copy(vOff);
    qB.setFromAxisAngle(xAxis,o*.95); qId.copy(qB).multiply(qCur); base.quaternion.copy(qInv).multiply(qId);
  } else {base.position.set(0,0,0); base.quaternion.identity()}
  base.scale.setScalar(1-o*.28);
  if(!drag && frameN%6===0){const h=hitPawn(lastPX,lastPY); if(h!==hovering){hovering=h;document.body.classList.toggle('grab',h)}}
  r.render(scene,cam); requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
