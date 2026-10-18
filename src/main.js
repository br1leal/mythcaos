(()=>{
const MANI=__MANI__, CUTS=new Set(__CUTS__);
const MC=window.MC={pawn:'saci',mode:'hero',p:0,slot:null,free:{sx:0,sy:0,hp:300},theme:'base',lift:0,reduce:matchMedia('(prefers-reduced-motion: reduce)').matches};

// R4d: altura estável da tela (= 100lvh). A barra do navegador aparecendo/sumindo não mexe mais nas contas da rolagem
{const pr=document.createElement('div'); pr.style.cssText='position:fixed;top:0;left:0;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none'; document.documentElement.appendChild(pr);
 let w=0; const touchUI=matchMedia('(hover:none)').matches; const up=()=>{ if(touchUI&&innerWidth===w&&MC.VH) return; /* no desktop a altura sempre acompanha a janela */ w=innerWidth; MC.VH=Math.max(pr.offsetHeight,innerHeight)||innerHeight }; up(); addEventListener('resize',up); addEventListener('orientationchange',()=>setTimeout(()=>{w=0; up()},300))}
MC.store=window.MC_STORE||Promise.resolve(null); // definido em store.js
// lead lembrado neste navegador (para preencher sozinho)
// MODO TESTE: a cada carregamento o contato é esquecido, para testar os fluxos que pedem dados
const TEST_RESET=!!window.MC_TEST_RESET; // ligado/desligado em store.js
MC.lead=null; try{ if(TEST_RESET) localStorage.removeItem('mc-lead'); else MC.lead=JSON.parse(localStorage.getItem('mc-lead')||'null')}catch(e){}
MC.rememberLead=d=>{MC.lead={...(MC.lead||{}),...d}; try{localStorage.setItem('mc-lead',JSON.stringify(MC.lead))}catch(e){}};
MC.store.then(async st=>{if(!st||MC.lead||TEST_RESET) return; try{const l=await st.myLead(); if(l&&l.email){MC.rememberLead({nome:l.nome||'',email:l.email,tel:l.tel||''}); MC.onLead&&MC.onLead()}}catch(e){}});
document.addEventListener('error',e=>{const t=e.target; if(t&&t.tagName==='IMG'&&!t.dataset.retry){t.dataset.retry=1; const u=t.getAttribute('src'); if(u) setTimeout(()=>{t.src=u+(u.includes('?')?'&':'?')+'r=1'},400)}},true);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, lerp=(a,b,t)=>a+(b-a)*t, sstep=t=>t*t*(3-2*t);
const WHERE={}; for(const k in MANI) for(const c of MANI[k]) WHERE[c.f.slice(0,-4)]=k;
const IMP=f=>`assets/imp/${WHERE[f]}/${f}.jpg`;
const find=f=>{const k=WHERE[f]; return k?{k,c:MANI[k].find(x=>x.f===f+'.jpg')}:null};

// ---------- peões e tema ----------
const PAWNS=[['saci','Saci','#c8281e','#e0362a'],['iara','Iara','#2f6fd0','#3f8cff'],['medusa','Medusa','#7a8a34','#9cb03c'],['mula','Mula sem Cabeça','#2a2a30','#ff7a1a'],['papainoel','Klaus','#ede6da','#e6edf5'],['valquiria','Valquíria','#e8b923','#f2c230']];
if(PAWNS.some(p=>p[0]===window.MC_L)) MC.pawn=window.MC_L; // R4d: o peão que acompanha é o mesmo da logo sorteada na chegada
function applyPawn(id){const p=PAWNS.find(x=>x[0]===id);MC.pawn=id;if(MC.pawnReady) document.querySelectorAll('img.mclogo').forEach(i=>{const f=v=>v.replace(/logo-[a-z]+-(\d)/g,'logo-'+id+'-$1'); i.srcset=f(i.srcset); if(i.getAttribute('src')) i.src=f(i.src)});document.documentElement.style.setProperty('--accent',p[3]);MC.onAccent&&MC.onAccent(p[3]);document.documentElement.style.setProperty('--btn-ink',id==='papainoel'?'#0d1a1c':'#140c08');
  try{localStorage.setItem('mc-pawn',id)}catch(e){}; $$('#gpick button,#ptagm button,#pzpick button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===id)); const tn=$('#ptagn'); if(tn) tn.textContent=p[1]; const zn=$('#pzn'); if(zn) zn.textContent=p[1]; MC.onPawn&&MC.onPawn(id); MC.onTheme&&MC.onTheme()}
const gpick=$('#gpick');
if(gpick) PAWNS.forEach(([id,name,c])=>{const b=document.createElement('button');b.type='button';b.dataset.id=id;b.style.setProperty('--c',c);b.innerHTML=`<i></i><span>${name.split(' ')[0]}</span>`;b.setAttribute('aria-label',name);b.onclick=()=>applyPawn(id);gpick.appendChild(b)});
{const pp=$('#pzpick'); if(pp) PAWNS.forEach(([id,name,c])=>{const b=document.createElement('button');b.type='button';b.dataset.id=id;b.style.setProperty('--c',c);b.innerHTML=`<i></i><span>${name}</span>`;b.setAttribute('aria-pressed',id===MC.pawn);b.onclick=()=>applyPawn(id);pp.appendChild(b)})}
const ptm=$('#ptagm'), ptb=$('#ptagb');
PAWNS.forEach(([id,name,c])=>{const b=document.createElement('button');b.type='button';b.dataset.id=id;b.style.setProperty('--c',c);b.innerHTML=`<i></i>${name}`;b.onclick=()=>{applyPawn(id);togTag(false)};ptm.appendChild(b)});
function togTag(on){ptm.hidden=!on;ptb.setAttribute('aria-expanded',on)}
ptb.onclick=e=>{e.stopPropagation();togTag(ptm.hidden)}; document.addEventListener('click',e=>{if(!e.target.closest('.ptag')) togTag(false)}); addEventListener('keydown',e=>{if(e.key==='Escape') togTag(false)});
applyPawn(MC.pawn); MC.pawnReady=true; // a logo de chegada é sorteada (MC_L); só muda quando a pessoa escolhe uma lenda
window.MC_LOGO&&window.MC_LOGO();

let mxN=0,myN=0; addEventListener('pointermove',e=>{mxN=e.clientX/innerWidth-.5;myN=e.clientY/MC.VH-.5});
const gate={hidden:true}; const gateOpen=false;


// ---------- holo laminado + parallax interno ----------
const holos=[];
function holo(el,max=16,grow=.05){el.classList.add('holo');const st={el,tx:0,ty:0,x:0,y:0,px:50,py:50,tpx:50,tpy:50,h:0,th:0,max,grow};holos.push(st);el._holo=st;
  el.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=el.getBoundingClientRect();const x=clamp((e.clientX-r.left)/r.width),y=clamp((e.clientY-r.top)/r.height);st.tx=(x-.5)*2;st.ty=(y-.5)*2;st.tpx=x*100;st.tpy=y*100;st.th=1;el.style.zIndex=40});
  el.addEventListener('pointerleave',()=>{st.tx=st.ty=0;st.tpx=st.tpy=50;st.th=0;el.style.zIndex=''});return st}
function tickHolo(dt){const k=1-Math.exp(-dt*6);
  for(const s of holos){ if(s.th===0&&s.h<.002&&Math.abs(s.x)<.002&&Math.abs(s.y)<.002) continue;
    s.x+=(s.tx-s.x)*k;s.y+=(s.ty-s.y)*k;s.px+=(s.tpx-s.px)*k;s.py+=(s.tpy-s.py)*k;s.h+=(s.th-s.h)*k;const e=s.el.style;
    e.setProperty('--ry',(s.x*s.max)+'deg');e.setProperty('--rx',(-s.y*s.max)+'deg');e.setProperty('--px',s.px+'%');e.setProperty('--py',s.py+'%');e.setProperty('--hov',s.h.toFixed(3));e.setProperty('--ang',(115+s.x*25)+'deg');e.setProperty('--hs',(1+s.h*s.grow).toFixed(3));e.setProperty('--lx',s.x.toFixed(3));e.setProperty('--ly',s.y.toFixed(3))}}
// carta em camadas: fundo sem o personagem + personagem recortado (parallax sutil)
function layersHTML(f,alt){ if(CUTS.has(f)) return `<img class="plate" src="assets/plate/${f}.jpg" alt=""><img class="char" src="assets/cut/${f}.webp" alt="${alt}">`; return `<img src="${IMP(f)}" alt="${alt}">`}
const fxHTML='<div class="fx sheen"></div><div class="fx film"></div><div class="fx glare"></div>';
const nameOf=f=>{const d=find(f);return d?d.c.n:f};

// ---------- teaser ----------
const strip=$('#strip'); const T=['19-c-saci','31-c-medusa','07-g-thor','02-g-iara','33-c-dracula','38-c-hades','09-g-zeus','28-c-mula-sem-cabeca','40-c-yuki-onna','30-c-holandes-voador','32-c-lobisomem','45-o-cuca','13-g-hercules','39-c-kaiju'];
[...T,...T].forEach(n=>{const i=new Image();i.src=IMP(n);i.alt='';strip.appendChild(i)});
const tzf=$('#tzframe'), tzs=$('#teaser'); let tzr=-24;

// ---------- raspadinha (seção removida; código mantido inativo) ----------
if($('#sccv')){
const SCMAX=5; let scUsed=0; try{scUsed=+localStorage.getItem('mc-scratch')||0}catch(e){}
const scPool=['raizes','mares','tormentas','titas'].flatMap(k=>MANI[k].filter(c=>['Guardião','Caos','Oráculo'].includes(c.c)).map(c=>c.f.slice(0,-4)));
const scCard=$('#sccard'), scCv=$('#sccv'), scImg=$('#scimg'), scName=$('#scname'), scBtn=$('#scnew'); let scCtx=scCv.getContext('2d'), scCur=null, scDone=false, scLast=null, scCheckT=0;
function scPaint(){const r=scCard.getBoundingClientRect(), d=Math.min(2,devicePixelRatio||1); scCv.width=Math.round(r.width*d); scCv.height=Math.round(r.height*d); const W=scCv.width,H=scCv.height, c=scCtx;
  c.globalCompositeOperation='source-over';
  const v=new Image(); v.src=`assets/imp/${WHERE[scCur]}/114-verso.jpg`;
  const draw=()=>{c.drawImage(v,0,0,W,H); const g=c.createLinearGradient(0,0,W,H); g.addColorStop(0,'rgba(220,220,230,.55)'); g.addColorStop(.5,'rgba(120,120,135,.35)'); g.addColorStop(1,'rgba(230,230,240,.55)'); c.fillStyle=g; c.fillRect(0,0,W,H);
    c.fillStyle='rgba(0,0,0,.55)'; c.font=`${Math.round(W*.09)}px TerraSans, Georgia, serif`; c.textAlign='center'; c.fillText('RASPE AQUI',W/2,H*.53)};
  if(v.complete) draw(); else {c.fillStyle='#777';c.fillRect(0,0,W,H); v.onload=draw}}
function scNew(){ if(scUsed>=SCMAX){scEnd();return}
  scCur=scPool[Math.floor(Math.random()*scPool.length)]; scDone=false; scCard.classList.remove('done'); scName.textContent='';
  scImg.src=IMP(scCur); scImg.alt=''; scPaint(); $('#scleft').textContent=SCMAX-scUsed; scBtn.disabled=true}
function scEnd(){scBtn.disabled=true; $('#scleft').textContent=0; if(!$('.scfull')) scBtn.parentElement.insertAdjacentHTML('afterend','<p class="scfull" style="margin-top:14px">Suas raspadinhas acabaram. Quer conhecer todas as lendas antes de todo mundo? <button class="btn small" type="button" data-lead>Entrar na lista</button></p>')}
function scReveal(){ if(scDone) return; scDone=true; scUsed++; try{localStorage.setItem('mc-scratch',scUsed)}catch(e){} $('#scleft').textContent=SCMAX-scUsed; scCard.classList.add('done','flash'); setTimeout(()=>scCard.classList.remove('flash'),900); const d=find(scCur);
  scName.innerHTML=`${d.c.n}<small>${d.c.c} · ${RN[d.k]} · ${ptsTxt(d.c.c,parseInt(d.c.p)||0)}</small>`; scBtn.disabled=scUsed>=SCMAX; if(scUsed>=SCMAX) scEnd(); MC.onDraw&&MC.onDraw(d.c.c)}
function scStroke(x,y){ if(scDone) return; const r=scCv.getBoundingClientRect(), k=scCv.width/r.width, px=(x-r.left)*k, py=(y-r.top)*k, c=scCtx, rad=scCv.width*.075;
  c.globalCompositeOperation='destination-out'; c.lineCap='round'; c.lineWidth=rad*2;
  c.beginPath(); if(scLast){c.moveTo(scLast[0],scLast[1]);c.lineTo(px,py);c.stroke()} c.beginPath(); c.arc(px,py,rad,0,Math.PI*2); c.fill(); scLast=[px,py];
  const now=performance.now(); if(now-scCheckT>250){scCheckT=now; const W=scCv.width,H=scCv.height, data=c.getImageData(0,0,W,H).data; let cl=0,n=0; for(let i=3;i<data.length;i+=4*61){n++; if(data[i]<40) cl++} if(cl/n>.5) scReveal()}}
scCv.addEventListener('pointermove',e=>{ if(e.pointerType==='touch'&&!e.pressure) return; scStroke(e.clientX,e.clientY)});
scCv.addEventListener('pointerdown',e=>{scCv.setPointerCapture&&scCv.setPointerCapture(e.pointerId); scLast=null; scStroke(e.clientX,e.clientY)});
scCv.addEventListener('pointerleave',()=>scLast=null); scCv.addEventListener('pointerup',()=>scLast=null);
scBtn.onclick=scNew;
if(scUsed>=SCMAX){scCur=scPool[Math.floor(Math.random()*scPool.length)]; scImg.src=IMP(scCur); scDone=true; scCard.classList.add('done'); scEnd(); scName.textContent=nameOf(scCur)}
else requestAnimationFrame(()=>scNew());
addEventListener('resize',()=>{if(!scDone&&scCur) scPaint()});

}
// ---------- modal de lead ----------
let leadSaved=!!(MC.lead&&MC.lead.email);
const leadM=$('#lead'); let lastFocus=null;
function openModal(m){lastFocus=document.activeElement;m.hidden=false;document.documentElement.classList.add('locked');setTimeout(()=>{const f=[...m.querySelectorAll('input,.btn,.mx')].find(x=>x.offsetParent!==null);f&&f.focus({preventScroll:true})},60)}
function closeModal(m){if(m.hidden)return;m.hidden=true; if(m.id==='lb'&&MC.afterCard) MC.afterCard();if(gate.hidden||!gateOpen)document.documentElement.classList.remove('locked');lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})}
function openLead(opts={}){ if(MC.lead){ if(!$('#l-nome').value) $('#l-nome').value=MC.lead.nome||''; if(!$('#l-email').value) $('#l-email').value=MC.lead.email||''; if(!$('#l-tel').value) $('#l-tel').value=MC.lead.tel||''}$('#leadk').textContent=opts.k||'Novidades';$('#leadt').textContent=opts.t||'Fique por dentro';$('#leadd').textContent=opts.d||'Cartas novas, convites para playtest e o aviso de lançamento. Sem spam.';$('#leadf button[type=submit]').textContent=opts.b||'Quero receber novidades';$('#lok').textContent='';openModal(leadM)}
document.addEventListener('click',e=>{const au=e.target.closest('[data-autor]'); if(au){e.preventDefault(); openModal($('#autorm')); return}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-lead]'); if(b){e.preventDefault(); if(!lb.hidden) closeModal(lb); openLead()}});
const MCONT='.galm-img,.mbox,.lb-card,.lb-info,.rf-fan,.rf-in>.label,.rf-in>h3,.rf-hint,.mx'; // tudo fora disso é 'fora'
let downIn=false; document.addEventListener('pointerdown',e=>{downIn=!!(e.target.closest&&e.target.closest(MCONT))},true); MC.outside=e=>!downIn&&!e.target.closest(MCONT);
$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target.closest('[data-close]')||MC.outside(e)) closeModal(m)}));
addEventListener('keydown',e=>{if(e.key==='Escape') $$('.modal').forEach(closeModal)});
async function updCounter(){const st=await MC.store; if(!st) return; try{const n=await st.mesa(); $('#counter').innerHTML=n>=15?`<b>${n}</b> pessoas já guardaram lugar na mesa`:'Seja um dos primeiros da mesa.'}catch(e){}}
updCounter();
$('#tzplay').addEventListener('click',()=>openLead({k:'Teaser',t:'O teaser está quase pronto',d:'Deixe seu contato e receba o vídeo em primeira mão, antes de ir ao ar.'}));
const okEmail=v=>/^\S+@\S+\.\S+$/.test(v);
async function saveLead(d){ MC.rememberLead({nome:d.nome||'',email:d.email,tel:d.tel||''}); MC.onLead&&MC.onLead(); const store=await MC.store; if(!store) return false; try{ await store.saveLead(d); return true }catch(e){ return false } }
// R5 anti-robô sem captcha visível: campo-isca escondido + tempo mínimo de preenchimento + limite por sessão
const BOT={t:{},n:0}; ['form','pform','leadf'].forEach(id=>{const f=document.getElementById(id); f&&f.addEventListener('focusin',()=>{BOT.t[id]=BOT.t[id]||performance.now()})});
MC.isBot=id=>{const f=document.getElementById(id), hp=f&&f.querySelector('.hpf input'); if(hp&&hp.value) return true; const t=BOT.t[id]; if(!t||performance.now()-t<1500) return true; if(++BOT.n>6) return true; return false};
$('#leadf').addEventListener('submit',async e=>{e.preventDefault();const n=$('#l-nome').value.trim(),m=$('#l-email').value.trim(),t=$('#l-tel').value.trim(),ok=$('#lok');
  if(MC.afterLead&&!n){ok.textContent='Escreva seu nome.';$('#l-nome').focus();return}
  if(!okEmail(m)){ok.textContent='Esse e-mail parece incompleto. Confira e tente de novo.';$('#l-email').focus();return}
  if(MC.afterLead&&t.replace(/\D/g,'').length<10){ok.textContent='Coloque um celular com DDD.';$('#l-tel').focus();return}
  const saved=MC.isBot('leadf')?true:await saveLead({nome:n,email:m,tel:t,origem:'popup'}); leadSaved=true;
  ok.textContent=saved?`Pronto${n?', '+n.split(' ')[0]:''}! Você vai receber as novidades.`:'Recebemos seus dados nesta tela, mas o envio ainda não está ligado nesta prévia.'; MC.onJoin&&MC.onJoin(); updCounter(); const al=MC.afterLead; MC.afterLead=null; al&&al(); setTimeout(()=>closeModal(leadM),al?900:1800)});
$('#form').addEventListener('submit',async e=>{e.preventDefault();const n=$('#f-nome').value.trim(),m=$('#f-email').value.trim(),ok=$('#ok');
  if(!n){ok.textContent='Escreva seu nome para entrar na lista.';$('#f-nome').focus();return}
  if(!okEmail(m)){ok.textContent='Esse e-mail parece incompleto. Confira e tente de novo.';$('#f-email').focus();return}
  const saved=MC.isBot('form')?true:await saveLead({nome:n,email:m,tel:$('#f-tel').value.trim(),mesa:$('#f-mesa').value,catarse:$('#f-catarse').checked,origem:'lista'}); leadSaved=true;
  ok.textContent=saved?`Pronto, ${n.split(' ')[0]}. Seu lugar na mesa está guardado.`:'Recebemos seus dados nesta tela, mas o envio ainda não está ligado nesta prévia.'; MC.onJoin&&MC.onJoin()});

// ---------- lightbox: carta centralizada ----------
const KC={'Guardião':'#d6a84c','Caos':'#e0362a','Oráculo':'#a88bff','Relíquia':'#3fe0a6','Portal':'#7fb8ff','Limbo':'#c4161c','Magia':'#7cf0b0'};
const EXPL={'Guardião':'Defende você do Caos e soma pontos positivos.','Caos':'Ataca os outros jogadores. Mas se sobrar na sua mão, os pontos são negativos.','Oráculo':'Informação: espiar mãos, olhar o topo dos baralhos, reordenar o destino.','Relíquia':'Baixe 3 iguais ou 4 diferentes e você fecha a rodada.','Portal':'Use na hora e suba um Reino. Ou guarde para o momento certo.','Limbo':'Caiu no Limbo! Volte às Raízes e passe a vez.'};
const RN={raizes:'Raízes',mares:'Marés',tormentas:'Tormentas',titas:'Titãs'};
const ptsTxt=(cls,pts)=>['Relíquia','Portal','Limbo'].includes(cls)?'':(pts>0?'+':'')+pts+(Math.abs(pts)===1?' ponto':' pontos');
const lb=$('#lb'), lbt=$('#lbtilt'), lbl=$('#lblayers'); holo(lbt,10); let lbToken=0;
async function openCard(f,fromEl,flip){
  const d=find(f); if(!d) return; const {k,c}=d, cls=c.c, pts=parseInt(c.p)||0, my=++lbToken;
  lb.classList.remove('ready'); lb.style.setProperty('--kc',KC[cls]||'var(--accent)');
  $('#lbback').src=`assets/imp/${k}/114-verso.jpg`;
  lbl.innerHTML=layersHTML(f,'Carta '+c.n);
  $('#lbk').textContent=`${cls} · ${RN[k]||''}`; $('#lbn').textContent=c.n; $('#lbp').textContent=ptsTxt(cls,pts);
  $('#lbe').textContent=c.e||''; $('#lbfl').textContent=c.fl?`“${c.fl}”`:''; $('#lbx').textContent=EXPL[cls]||'';
  openModal(lb);
  await Promise.all([...lbl.querySelectorAll('img')].map(i=>i.decode().catch(()=>{}))); if(my!==lbToken) return;
  lb.classList.add('ready');
  if(fromEl&&!MC.reduce){const card=lb.querySelector('.lb-card'), r0=fromEl.getBoundingClientRect(), r1=card.getBoundingClientRect();
    card.animate([{transform:`translate(${r0.left-r1.left}px,${r0.top-r1.top}px) scale(${r0.width/r1.width})`,transformOrigin:'0 0'},{transform:'none',transformOrigin:'0 0'}],{duration:flip?900:620,easing:'cubic-bezier(.2,.8,.15,1)'});
    if(flip) lbt.animate([{transform:'rotateY(180deg) rotateZ(-8deg)'},{transform:'rotateY(0deg)'}],{duration:900,easing:'cubic-bezier(.3,.7,.2,1)'})}
}

// ---------- baralhos ----------
const piles={}; const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
for(const k of ['raizes','mares','tormentas','titas']) piles[k]=shuffle([...MANI[k]]);
// compra livre: clique em qualquer baralho e veja uma carta aleatória. Portal sobe um Reino, Limbo derruba às Raízes.
const ORD=['raizes','mares','tormentas','titas']; let cur='raizes';
let dMsg='';
// só o Reino onde você está fica liberado; os outros ficam cinza até um Portal abrir o caminho
function paintDecks(){ $$('.deck').forEach(d=>{const k=d.dataset.r, on=k===cur; d.classList.toggle('active',on); d.classList.toggle('locked',!on); d.disabled=false; d.removeAttribute('aria-disabled');
  d.querySelector('.dlock').textContent=on?dMsg:(ORD.indexOf(k)>ORD.indexOf(cur)?'':'')}); selDeck=$(`.deck[data-r="${cur}"]`)}
function deckFx(kind,from,to){ const a=$(`.deck[data-r="${from}"] .stack`), b=$(`.deck[data-r="${to}"] .stack`); if(!a||!b) return;
  const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect(), fx=document.createElement('div'); fx.className='deckfx '+kind;
  const x1=ra.left+ra.width/2, y1=ra.top+ra.height/2, x2=rb.left+rb.width/2, y2=rb.top+rb.height/2;
  fx.style.cssText=`left:${x1}px;top:${y1}px;--dx:${x2-x1}px;--dy:${y2-y1}px`; document.body.appendChild(fx); setTimeout(()=>fx.remove(),1400);
  if(kind==='limbo'){document.body.classList.add('limboflash'); $('#decks').classList.add('shake'); setTimeout(()=>{document.body.classList.remove('limboflash');$('#decks').classList.remove('shake')},800)}
  b.parentElement.classList.add('arrive'); setTimeout(()=>b.parentElement.classList.remove('arrive'),1300)}
let selDeck=$('.deck');
const KCOL={'Guardião':'#e8892c','Caos':'#e0362a','Oráculo':'#a88bff','Portal':'#c58cff','Limbo':'#ff2a1a','Relíquia':'#3fe0a6'};
const DSHOW={raizes:['01-g-curupira','65-p-floresta'],mares:['33-c-dracula','70-p-naufrago'],tormentas:['07-g-thor','63-p-arco'],titas:['31-c-medusa','57-l-tormenta']}, dIdx={raizes:0,mares:0,tormentas:0,titas:0};
let drawing=false, deckPend=null;
MC.afterCard=()=>{ if(!drawing) return; drawing=false; dMsg='Compre mais 1'; paintDecks(); if(!deckPend) return; const f=deckPend; deckPend=null; setTimeout(f,280)};
function deckTip(btn,msg){ let t=btn.querySelector('.dtip'); if(!t){t=document.createElement('span'); t.className='dtip'; t.setAttribute('role','status'); btn.appendChild(t)} t.innerHTML=msg; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'),2600);
  const a=$(`.deck[data-r="${cur}"]`); a.classList.remove('nudge'); void a.offsetWidth; a.classList.add('nudge')}
$$('.deck').forEach(btn=>btn.addEventListener('click',()=>{ if(drawing) return; const k=btn.dataset.r;
  if(k!==cur){ deckTip(btn,ORD.indexOf(k)>ORD.indexOf(cur)?`Bloqueado. Clique de novo em <b>${RN[cur]}</b> até achar um Portal.`:`Você já passou daqui. Continue em <b>${RN[cur]}</b>.`); return }
  drawing=true; cur=k; paintDecks();
  // só cartas que o site já mostrou: um personagem e um Portal (Limbo nos Titãs), sempre os mesmos
  const f=DSHOW[k][dIdx[k]++%2], cls=find(f).c.c; MC.onDraw&&MC.onDraw(cls);
  if(cls==='Portal'&&k!=='titas'){ const nx=ORD[ORD.indexOf(k)+1]; deckPend=()=>{deckFx('portal',k,nx); cur=nx; dMsg='Portal aberto! Compre aqui'; paintDecks()} }
  else if(cls==='Limbo'&&k!=='raizes') deckPend=()=>{deckFx('limbo',k,'raizes'); cur='raizes'; dMsg='Caiu no Limbo! Recomece aqui'; paintDecks()};
  openCard(f,btn.querySelector('.stack'),true) }));
paintDecks();

// ---------- Reinos ----------
const R={
 raizes:['01-g-curupira','28-c-mula-sem-cabeca','19-c-saci','25-c-bloody-mary','03-g-boitata'],
 mares:['30-c-holandes-voador','15-g-poseidon','02-g-iara','49-o-boto','33-c-dracula'],
 tormentas:['40-c-yuki-onna','52-o-loki','07-g-thor','46-o-merlin','10-g-freya'],
 titas:['11-g-valkyria','34-c-minotauro','09-g-zeus','38-c-hades','12-g-odin']};
const reinos=[];
for(const id in R){const sec=document.getElementById(id), fan=sec.querySelector('.fan'), cards=[];
  R[id].forEach(f=>{const el=document.createElement('div');el.className='card';el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Ver a carta '+nameOf(f));
    el.innerHTML=`<div class="f"><div class="layers">${layersHTML(f,'')}</div>${fxHTML}</div><div class="b"><img src="assets/imp/${id}/114-verso.jpg" alt=""></div>`;
    holo(el,9); el.addEventListener('click',()=>openCard(f,el)); el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCard(f,el)}});
    fan.appendChild(el);cards.push(el)});
  reinos.push({sec,fan,cards,stage:sec.querySelector('.stage'),txt:sec.querySelector('.txt')})}
const prog=sec=>{const r=sec.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-MC.VH))};
// Reinos: as cartas entram sozinhas (tempo, não rolagem) e saem subindo quando o bloco vai embora
function updReino(o,now){const r=o.sec.getBoundingClientRect(), W=innerWidth, H=MC.VH, mob=W<761; if(r.bottom<-50||r.top>H+50){o.st=0;return}
  const cw=mob?Math.min(W*.26,140):clamp(W*.13,120,215); o.fan.style.setProperty('--cw',cw+'px');
  const active=r.top<H*.45&&r.bottom>H*.55; if(active&&!o.st){o.st=1;o.t0=now} else if(r.top>H*.6){o.st=0}
  const tin=o.st?(now-o.t0)/1000:0, P=prog(o.sec);
  // saída presa à rolagem: as cartas se espalham, sobem girando e somem
  o.cards.forEach((el,i)=>{const off=i-(o.cards.length-1)/2, dir=off||(i%2?.6:-.6);
    const t=MC.reduce?(o.st?1:0):1-Math.pow(1-clamp((tin-i*.08)/.95),3), X=MC.reduce?0:Math.pow(clamp((P-.58-Math.abs(off)*.03)/.34),1.6);
    const spread=mob?.6:.8;
    const x=lerp(0,off*cw*spread,t)+X*dir*cw*1.6, y=lerp(H*.8,off*off*cw*.045,t)-X*H*(.9+Math.abs(off)*.12), rz=lerp(-off*10,off*(mob?5:6.5),t)+X*dir*28, ry=lerp(180,0,t)+X*dir*25;
    el.style.opacity=(clamp(t*3)*(1-clamp((X-.45)/.5))).toFixed(3);
    el.style.transform=`translate3d(${x}px,${y}px,0) rotateZ(${rz}deg) rotateY(${ry}deg) scale(var(--hs,1)) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))`});
}

// ---------- Duelos ----------
const DUELS=[
 {a:'19-c-saci',b:'07-g-thor',atk:'Troca 1 carta sua por uma aleatória da mão do alvo.',def:'Desvia o golpe para outro jogador e ainda avança 2 casas.',lost:1},
 {a:'32-c-lobisomem',b:'13-g-hercules',atk:'Espia a mão de um jogador e manda descartar 1 carta.',def:'Defende o descarte. O golpe não passa.',lost:1},
 {a:'31-c-medusa',b:'45-o-cuca',atk:'Um olhar e o alvo perde o próximo turno.',def:'A Cuca não defende, ela se vinga: manda qualquer jogador um Reino para cima ou para baixo.',lost:0},
 {a:'38-c-hades',b:'09-g-zeus',atk:'O alvo descarta a mão inteira.',def:'Anula o golpe, e quem tentou recua 2 casas.',lost:1}];
const duelSec=$('#duelos'), dl=$('#dl'), dr=$('#dr'), dimp=$('#impact'), dvs=duelSec.querySelector('.vs'); let duelIdx=-1;
function setSide(el,f){el.querySelector('.layers').innerHTML=layersHTML(f,'Carta '+nameOf(f));el.querySelector('.dname').textContent=nameOf(f)}
function updDuel(){const r=duelSec.getBoundingClientRect(); if(r.bottom<0||r.top>MC.VH) return;
  const p0=prog(duelSec); duelSec.querySelector('.dhead').style.setProperty('--ds',lerp(1.7,.62,ease(clamp(p0/.07))).toFixed(3));
  const p=p0, seg=Math.min(3.999,p*4), i=Math.floor(seg), f=seg-i, D=DUELS[i];
  if(i!==duelIdx){duelIdx=i;setSide(dl,D.a);setSide(dr,D.b);$('#datk').innerHTML=`<b>Ataque · ${nameOf(D.a)}</b>${D.atk}`;$('#ddef').innerHTML=`<b>Resposta · ${nameOf(D.b)}</b>${D.def}`;$('#dnum').textContent=`Duelo ${i+1} de 4`}
  const W=innerWidth, cw=dl.offsetWidth, mob=W<761;
  const e=ease(clamp(f/.22)), x=ease(clamp((f-.86)/.14)), ch=clamp((f-.24)/.14), rc=clamp((f-.42)/.1), imp=Math.max(0,1-Math.abs(f-.40)/.05);
  const rest=cw*(mob?.56:.9), near=cw*(mob?.46:.58); let gap=lerp(rest,near,ease(ch)); gap=lerp(gap,rest*1.02,ease(rc));
  const shake=imp>0&&!MC.reduce?(Math.random()-.5)*14*imp:0;
  [[dl,-1],[dr,1]].forEach(([el,sd])=>{const sx=lerp(sd*W*.75,sd*gap,e), ry=lerp(-sd*70,-sd*18,e)+(-sd*8*imp), y=-x*MC.VH*.7, rot=sd*lerp(0,6,rc);
    el.style.transform=`translate3d(${sx+shake}px,${y+shake*.6}px,0) rotateY(${ry}deg) rotateZ(${rot}deg)`; el.style.opacity=1-x;
    el.style.setProperty('--lx',(sd*-.6+mxN*.8).toFixed(3)); el.style.setProperty('--ly',(myN*.8).toFixed(3))});
  dl.classList.toggle('lost',!!D.lost&&f>.44&&f<.86); dr.classList.toggle('lost',!D.lost&&f>.44&&f<.86);
  dimp.style.setProperty('--io',imp.toFixed(3)); dimp.style.setProperty('--is',(.4+imp*1.2).toFixed(3));
  dvs.style.setProperty('--vso',(e*(1-x)*(1-imp*.6)).toFixed(3)); dvs.style.setProperty('--vs',(1+imp*.6).toFixed(3));
  $('#datk').style.opacity=clamp((f-.26)/.06)*(1-x); $('#dnum').style.opacity=i===3?(1-x).toFixed(3):1; duelSec.querySelector('.dhead').style.opacity=i===3?(1-x).toFixed(3):1; $('#ddef').style.opacity=clamp((f-.46)/.06)*(1-x)}

// ---------- Travessia ----------
const trav=$('#travessia'), pcard=$('#portalcard'), tflash=$('#travflash'), twarn=$('#travwarn'), ttxt=$('#travtxt');
const meltCv=$('#melt'), mctx=meltCv.getContext('2d'), ZM=2.6; // o próprio vídeo do portal dá o zoom e derrete
let meltCols=null;
function meltDraw(m){const W=meltCv.width=meltCv.clientWidth, H=meltCv.height=meltCv.clientHeight; const V=$('#pvid'); if(!W||V.readyState<2) return;
  const N=Math.ceil(W/3); if(!meltCols||meltCols.length!==N){const R=()=>Math.random()*6.28, f=[[2,.12,R()],[5,.08,R()],[11,.05,R()],[23,.025,R()]];
    meltCols=[]; for(let i=0;i<N;i++){const u=i/N; meltCols.push(.32+f.reduce((a,[q,am,ph])=>a+am*Math.sin(u*q*6.28+ph),0))}
    for(let d=0;d<14;d++){const c=Math.random()*N, w=N*(.008+Math.random()*.022), a=.12+Math.random()*.22; for(let i=0;i<N;i++) meltCols[i]-=a*Math.exp(-Math.pow((i-c)/w,2))}}
  const c=mctx; c.clearRect(0,0,W,H);
  // a carta cobre a tela inteira (mesmo enquadramento do zoom)
  const vw=V.videoWidth||1280, vh=V.videoHeight||720, sc=Math.max(W/vw,H/vh)*ZM, dw=vw*sc, dh=vh*sc, ox=(W-dw)/2, oy=(H-dh)/2;
  const cw=W/N;
  for(let i=0;i<N;i++){const d=clamp(m*1.5-meltCols[i]-.0), e=d*d, dy=e*H*1.2, st=1+e*.5;
    const sx=(i*cw-ox)/sc, sw=cw/sc; c.drawImage(V,sx,(0-oy)/sc,sw,H/sc,i*cw,dy,cw+.6,H*st)}
  // brilho roxo escorrendo na borda
  c.globalCompositeOperation='lighter'; c.fillStyle='rgba(197,140,255,.35)';
  for(let i=0;i<N;i+=1){const d=clamp(m*1.5-meltCols[i]), e=d*d; if(e<=0||e>=1) continue; c.fillRect(i*cw,e*H*1.2-4,cw+.6,7)}
  c.globalCompositeOperation='source-over'}
function updTrav(){const r=trav.getBoundingClientRect(); if(r.bottom<0||r.top>MC.VH){pvid.style.opacity=0; return} const p=prog(trav); bgvFade(trav,pvid,p>.47?0:1);
  // 0–.42 zoom na carta · .42–.48 clarão · .48–.78 a tela derrete · depois o aviso
  const z=MC.reduce?1:1+Math.pow(clamp(p/.44),2.2)*(ZM-1); pvid.style.transform=`scale(${z.toFixed(3)})`;
  ttxt.style.opacity=1-clamp((p-.1)/.14); const fl=Math.max(0,1-Math.abs(p-.46)/.05); tflash.style.opacity=fl*.9;
  const m=clamp((p-.47)/.32); meltCv.style.opacity=p>.46&&m<1?1:0; if(p>.44&&m<1) meltDraw(MC.reduce?1:m);
  twarn.style.opacity=clamp((p-.7)/.06)*(1-clamp((p-.93)/.07)); trav.style.setProperty('--dk',clamp((p-.5)/.3).toFixed(3))}

// ---------- Limbo ----------
const limboSec=$('#limbo'), lst=$('#limbostage'), lvid=$('#lvid'), ltxt=$('#limbotxt'), pvid=$('#pvid'); let wasLimbo=false; limboSec.prepend(lvid); // fora do palco: o tremor (transform) prendia o vídeo fixo à seção
// vídeos de fundo: fixos na tela (não sobem com a rolagem), entram com fade e só tocam quando visíveis
// vídeos de fundo só baixam quando a seção chega perto (versão leve no celular)
[[limboSec,lvid],[trav,pvid]].forEach(([sec,v])=>{ new IntersectionObserver((es,o)=>es.forEach(en=>{ if(en.isIntersecting&&!v.src){ v.src=v.dataset.src+(innerWidth<761?'-m':'')+'.mp4'; v.preload='auto'; v.load(); o.disconnect() }}),{rootMargin:'150% 0px'}).observe(sec);
  new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting) v.play().catch(()=>{}); else v.pause()})).observe(sec)});
function bgvFade(sec,v,inEnd){const r=sec.getBoundingClientRect(), H=MC.VH; if(r.bottom<0||r.top>H){v.style.opacity=0;return 0}
  const a=clamp((H-r.top)/(H*.9)), b=clamp(r.bottom/(H*.9)); const o=MC.reduce?1:Math.min(sstep(a),inEnd??b); v.style.opacity=o.toFixed(3); return o}
function updLimbo(now){ const o=bgvFade(limboSec,lvid); if(o<=0) return; const p=prog(limboSec);
  ltxt.style.opacity=(clamp((p-.02)/.08)*(1-clamp((p-.78)/.15))).toFixed(3)}

// relíquias com holo
$$('img[data-holo]').forEach(img=>{const w=document.createElement('div');w.className='hwrap';img.removeAttribute('data-holo');img.replaceWith(w);w.appendChild(img);w.insertAdjacentHTML('beforeend',fxHTML);holo(w,14,.12)});
// clique troca para outra versão da mesma relíquia
const RELS={}; for(const k of ['raizes','mares','tormentas','titas']) for(const c of MANI[k]) if(c.c==='Relíquia'){const g=c.f.split('-r-')[1].replace('.jpg',''); (RELS[g]=RELS[g]||[]).push(`assets/imp/${k}/${c.f}`)}
for(const g in RELS) RELS[g]=[...new Set(RELS[g])].sort();
const relM=$('#relm'), rfFan=$('#rffan'), canHover=matchMedia('(hover:hover)').matches; let relT=0, relFor=null;
function relFill(el){ const list=el._rl; $('#relmt').textContent=el.querySelector('h3').textContent; relM.style.setProperty('--rc',getComputedStyle(el).getPropertyValue('--rc'));
  const n=list.length; rfFan.classList.remove('on'); rfFan.innerHTML=list.map((u,i)=>{const o=i-(n-1)/2; return `<div class="rf-c" style="--o:${o};--i:${i}"><img src="${u}" alt="Versão ${i+1}"></div>`}).join('');
  requestAnimationFrame(()=>requestAnimationFrame(()=>rfFan.classList.add('on'))) }
// passar o mouse: o leque abre na tela, sem modal (fundo escurece e desfoca); tirar o mouse fecha
function relShow(el){ clearTimeout(relT); relT=0; if(relFor===el&&!relM.hidden) return; relFor=el; relFill(el); relM.classList.add('hov'); relM.hidden=false }
function relHide(){ relFor=null; rfFan.classList.remove('on'); relM.classList.add('closing'); setTimeout(()=>{ if(!relFor){relM.hidden=true; relM.classList.remove('hov','closing')} },320) }
// um único rastreador de ponteiro decide: sobre uma relíquia ou sobre o leque = aberto; fora dos dois por um instante = fecha
if(canHover) addEventListener('pointermove',e=>{ if(e.pointerType==='touch') return; const t=e.target, rel=t.closest&&t.closest('.rel'), card=t.closest&&t.closest('.rf-c');
  if(rel||card){ clearTimeout(relT); relT=0; return }
  if(relM.classList.contains('hov')&&relFor&&!relT) relT=setTimeout(()=>{relT=0; relHide()},260) },{passive:true});
$$('.rel').forEach(el=>{const img=el.querySelector('img'), g=Object.keys(RELS).find(k=>img.src.includes('-r-'+k)); if(!g) return; el._rl=RELS[g];
  el.insertAdjacentHTML('afterbegin',`<span class="rn">${el._rl.length} versões</span>`);
  const open=()=>{ relFor=null; relM.classList.remove('hov','closing'); relFill(el); openModal(relM) };
  el.addEventListener('click',()=>{ if(canHover) relShow(el); else open() }); el.tabIndex=0; el.setAttribute('role','button'); el.setAttribute('aria-label','Ver as versões de '+el.querySelector('h3').textContent);
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});
document.addEventListener('click',e=>{ if(relM.classList.contains('hov')&&relFor&&!e.target.closest('.rel,.rf-c')) relHide() });
addEventListener('keydown',e=>{ if(e.key==='Escape'&&relM.classList.contains('hov')) relHide() });
new MutationObserver(()=>{ if(relM.hidden) rfFan.classList.remove('on') }).observe(relM,{attributes:true,attributeFilter:['hidden']});

// ---------- tabuleiro HUD ----------
const SP={0:'Largada: a cratera',7:'Portal · role o d6 e avance',13:'Geleiras · congelado por 1 rodada',14:'Geleiras · congelado por 1 rodada',15:'Geleiras · congelado por 1 rodada',16:'Geleiras · congelado por 1 rodada',28:'Pântano · role o d6 e recue',29:'Pântano · role o d6 e recue',30:'Pântano · role o d6 e recue',31:'Pântano · role o d6 e recue',33:'Desfiladeiro · volte ao centro',36:'O templo nas nuvens'};
let lastCasa=-1;

// ---------- Caldeirão ----------
const INGS=[['bala','Bala de Prata'],['lagrima','Lágrima de Sereia'],['moeda','Moeda da Fada'],['cinza','Cinza de Fênix'],['pena','Pena de Corvo']];
const TOK=id=>`assets/hex/${id}.webp`;
const REC=[{f:'97-m-ritual',r:{pena:2,bala:1}},{f:'98-m-abismo',r:{cinza:2,bala:2}},{f:'99-m-eternos',r:{pena:2,lagrima:1,cinza:1}},{f:'100-m-caminho',r:{moeda:2,pena:1,lagrima:1}},
 {f:'101-m-lamento',r:{lagrima:2,cinza:1,bala:1}},{f:'102-m-sopro',r:{moeda:2,lagrima:1}},{f:'103-m-cacador',r:{bala:2,pena:1,cinza:1}},{f:'104-m-rastro',r:{moeda:2,cinza:1,lagrima:1}}];
const pot=$('#pot'), slotsEl=[...$$('#slots span')], mix=[], ingEls=[]; let mstate='idle', target=null;
const INGN=Object.fromEntries(INGS);
INGS.forEach(([id,n])=>{const b=document.createElement('button');b.type='button';b.className='ing';b.innerHTML=`<img src="${TOK(id)}" alt=""><span>${n}</span>`;
  b.onclick=()=>{ if(mstate!=='play'){ pot.classList.remove('nudge'); void pot.offsetWidth; pot.classList.add('nudge'); return } if(mix.length>=4) return; mix.push(id); paintSlots()}; $('#ings').appendChild(b); ingEls.push(b)});
function paintSlots(){slotsEl.forEach((s,i)=>{s.classList.toggle('on',!!mix[i]);s.style.backgroundImage=mix[i]?`url(${TOK(mix[i])})`:''})}
function recHTML(R){return Object.entries(R.r).map(([k,v])=>`<span class="ri"><img src="${TOK(k)}" alt=""><b>${v}×</b><em>${INGN[k]}</em></span>`).join('')}
function setM(st){ mstate=st; $('#caldeirao').classList.toggle('playing',st==='play'); const m=target&&MANI.magia.find(c=>c.f===target.f+'.jpg');
  const T={idle:['Clique na carta para revelar seu Feitiço','Clique na carta para receber seu Feitiço secreto e ver a receita.','Crie seu Feitiço','Primeiro descubra a receita, depois monte no caldeirão.'],
    recipe:['Clique na carta para virar e começar','Decore a receita. Clique na carta de novo para virar e começar.',m&&m.n,'Essa é a sua Magia secreta.'],
    play:['Clique na carta para rever a receita','Escolha os ingredientes da receita e mexa o caldeirão.',m&&m.n,'Monte a receita: '+(target?Object.entries(target.r).map(([k,v])=>v+' '+INGN[k]).join(' + '):'')],
    won:['','Feitiço realizado!',m&&m.n,m?m.e.replace(/Ingredientes:[^.]*\.\s*/,''):'']}[st];
  $('#pothint').textContent=T[0]; $('#cxhint').textContent=T[1]; $('#cn').textContent=T[2]||''; $('#ce').textContent=T[3]||'';
  ingEls.forEach(b=>b.setAttribute('aria-disabled',st!=='play')); $('#again').hidden=st!=='won'; $('#brew').hidden=st==='won'}
pot.setAttribute('role','button'); pot.tabIndex=0;
function potClick(){ if(pot.classList.contains('brew')) return;
  if(mstate==='idle'||mstate==='won'){ mix.length=0; paintSlots(); target=REC[Math.floor(Math.random()*REC.length)]; const m=MANI.magia.find(c=>c.f===target.f+'.jpg');
    $('#mrec').innerHTML=`<p class="label">Seu Feitiço secreto</p><h4>${m.n}</h4><div class="rrow">${recHTML(target)}</div>`; $('#mrec').hidden=false; $('#magimg').hidden=true; pot.classList.add('flip'); setM('recipe') }
  else if(mstate==='recipe'){ pot.classList.remove('flip'); setM('play') }
  else if(mstate==='play'){ pot.classList.add('flip'); setM('recipe') } }
$('#again').onclick=()=>{ pot.classList.remove('flip','won'); setTimeout(()=>{mstate='idle'; potClick()},450) };
{const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){io.disconnect(); setTimeout(()=>pot.classList.add('laid'),350)}}),{threshold:.45}); if(MC.reduce) pot.classList.add('laid'); else io.observe(pot)} // 12 entra em pé e deita na mesa
holo(pot,9,.05); pot.querySelectorAll('.face').forEach(f=>f.insertAdjacentHTML('beforeend',fxHTML));
pot.addEventListener('click',potClick); pot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();potClick()}});
function resetPot(){mix.length=0;paintSlots();pot.classList.remove('brew')}
$('#cclear').onclick=()=>resetPot();
setM('idle');
// efeito de tela por ingrediente dominante
const FXOF={lagrima:'neve',cinza:'fogo',bala:'prata',moeda:'lava',pena:'gosma'};
const FXN={neve:'A tela congelou',fogo:'Fogo de Fênix',prata:'Brilho de prata',lava:'Lava dourada',gosma:'Gosma de pântano'};
$('#brew').onclick=()=>{
  if(mstate!=='play'){ pot.classList.remove('nudge'); void pot.offsetWidth; pot.classList.add('nudge'); return }
  if(!mix.length){$('#ce').textContent='Coloque pelo menos um ingrediente no caldeirão.';return}
  const cnt={}; mix.forEach(i=>cnt[i]=(cnt[i]||0)+1);
  const ok=(()=>{const a=Object.entries(target.r), b=Object.keys(cnt); return a.length===b.length&&a.every(([k,v])=>cnt[k]===v)})();
  const dom=Object.entries(cnt).sort((a,b)=>b[1]-a[1]||mix.lastIndexOf(b[0])-mix.lastIndexOf(a[0]))[0][0], kind=FXOF[dom];
  pot.classList.add('brew'); if(kind!=='prata') screenFX(kind); else {pot.classList.remove('silver'); void pot.offsetWidth; pot.classList.add('silver')}
  setTimeout(()=>{ pot.classList.remove('brew');
    if(ok){ const m=MANI.magia.find(c=>c.f===target.f+'.jpg'); $('#magimg').src=`assets/imp/magia/${target.f}.jpg`; $('#magimg').alt='Carta de Magia '+m.n; $('#magimg').hidden=false; $('#mrec').hidden=true; pot.classList.add('flip','won'); setM('won'); MC.onDraw&&MC.onDraw('Magia') }
    else{ $('#cn').textContent=FXN[kind]; $('#ce').textContent='A receita não bateu. Confira: '+Object.entries(target.r).map(([k,v])=>v+' '+INGN[k]).join(' + ')+'.'; mix.length=0; setTimeout(paintSlots,600)}},1100)};

// ---------- efeitos de tela (caldeirão) ----------
const fxc=$('#fxc'), fctx=fxc.getContext('2d'); let fxRun=null;
function screenFX(kind){ if(MC.reduce) return; const W=fxc.width=innerWidth, H=fxc.height=MC.VH, t0=performance.now(), D=3400, P=[];
  const drip=['derreter','lava','gosma'].includes(kind), col={derreter:['#cfd6dc','#8a949c'],lava:['#ffb02e','#d2340f'],gosma:['#8cff4a','#2f8f1a']}[kind];
  if(drip){const N=Math.ceil(W/34); for(let i=0;i<N;i++) P.push({x:i*W/N+Math.random()*12,w:W/N*(.35+Math.random()*.75),sp:Math.random()<.25?.55+Math.random()*.35:.08+Math.random()*.32,dl:Math.random()*.3,b:Math.random()})}
  else for(let i=0;i<(kind==='neve'?260:220);i++) P.push({x:Math.random()*W,y:kind==='neve'?-Math.random()*H:H+Math.random()*H*.6,r:kind==='neve'?1+Math.random()*3.4:4+Math.random()*10,v:kind==='neve'?60+Math.random()*120:180+Math.random()*320,ph:Math.random()*6,l:Math.random()});
  cancelAnimationFrame(fxRun); fxc.style.filter=drip?'url(#goo)':'none';
  const step=now=>{const t=(now-t0)/D, c=fctx, dt=1/60; c.clearRect(0,0,W,H); const fade=t<.75?1:1-(t-.75)/.25; if(t>=1){c.clearRect(0,0,W,H);return}
    c.globalAlpha=fade;
    if(kind==='neve'){const g=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75); g.addColorStop(0,'rgba(200,230,255,0)'); g.addColorStop(1,'rgba(210,235,255,.55)'); c.fillStyle=g; c.fillRect(0,0,W,H);
      c.fillStyle='#fff'; for(const q of P){q.y+=q.v*dt; q.x+=Math.sin(now/700+q.ph)*.8; c.globalAlpha=fade*(.5+q.l*.5); c.beginPath(); c.arc(q.x,q.y,q.r,0,Math.PI*2); c.fill()}}
    else if(kind==='fogo'){const g=c.createLinearGradient(0,H,0,H*.3); g.addColorStop(0,'rgba(255,90,20,.75)'); g.addColorStop(.5,'rgba(255,60,10,.25)'); g.addColorStop(1,'rgba(255,90,20,0)'); c.fillStyle=g; c.fillRect(0,0,W,H);
      c.globalCompositeOperation='lighter'; for(const q of P){q.y-=q.v*dt; q.x+=Math.sin(now/300+q.ph)*1.4; const life=clamp((H-q.y)/H); c.globalAlpha=fade*(1-life)*.9; c.fillStyle=`hsl(${18+q.l*30},100%,${50+q.l*20}%)`; c.beginPath(); c.arc(q.x,q.y,q.r*(1-life*.6),0,Math.PI*2); c.fill()} c.globalCompositeOperation='source-over'}
    else { const g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,col[0]); g.addColorStop(1,col[1]); c.fillStyle=g;
      if(kind==='lava'){c.shadowColor='#ff6a00';c.shadowBlur=30}
      c.globalAlpha=fade*.94; const band=H*.07*clamp(t/.25); c.fillRect(0,0,W,band);
      for(const q of P){const k=clamp((t-q.dl)/.6), e=1-Math.pow(1-k,2.2), h=band+e*H*q.sp; if(h<=0) continue; const r=q.w*.5;
        c.fillRect(q.x-r,0,q.w,h); c.beginPath(); c.arc(q.x,h,r*(1+q.b*.3),0,Math.PI*2); c.fill()}
      c.shadowBlur=0; if(kind==='derreter'){c.globalAlpha=fade*.25;c.fillStyle='#fff';for(const q of P){const k=clamp((t-q.dl)/.6),h=(1-Math.pow(1-k,2.2))*H*q.sp*1.3;c.fillRect(q.x-q.w*.3,0,q.w*.12,(H*.07+h)*.9)}}}
    c.globalAlpha=1; fxRun=requestAnimationFrame(step)};
  fxRun=requestAnimationFrame(step)}

// (votação removida na v9.8)

// ---------- Em breve ----------
const SOON=[['29-c-freira','sil'],['18-g-mecha','bw'],['22-c-charlotte','sil'],['14-g-arcanjo','bw'],['48-o-kimera','sil'],['36-c-pesadelo','bw'],['35-c-furias','sil'],['21-c-veio-do-saco','bw'],['53-o-sun-wukong','sil'],['42-o-jurumim','bw'],['24-c-et','sil'],['06-g-rocco','bw']];
$('#sgrid').innerHTML=SOON.map(([f,t])=>`<div class="scard ${t}" aria-hidden="true"><img src="${t==='sil'?`assets/cut/${f}.webp`:IMP(f)}" alt="" draggable="false"><span>${t==='sil'?'Em breve':'Em produção'}</span></div>`).join('');
$('#sgrid').addEventListener('contextmenu',e=>e.preventDefault());

// ---------- Minigame: monte a lenda (3 níveis, tempo, ranking) ----------
const LV=[{f:'20-c-bicho-papao',n:'Bicho-Papão',c:3,r:3},{f:'52-o-loki',n:'Loki',c:3,r:4},{f:'05-g-klaus',n:'Klaus',c:4,r:5}];
const pb=$('#pboard'), pgate=$('#pgate'), pgame=$('#pgame'), pend=$('#pend'), pcount=$('#pcount'), ptime=$('#ptime');
let lv=0, order=[], selTile=null, moves=0, totalMoves=0, solved=true, tStart=0, times=[], timerOn=false;
const fmt=ms=>{if(ms==null||!isFinite(ms)) return '—'; const s=ms/1000, m=Math.floor(s/60); return String(m).padStart(2,'0')+':'+(s-m*60).toFixed(1).padStart(4,'0')};
function gateState(){const L=MC.lead; if(L&&L.email&&L.nome&&L.tel){$('#pform').hidden=true; $('#pknown').hidden=false; $('#pwho').textContent=L.nome.split(' ')[0]; $('#pgated').textContent='Seu tempo vai direto para o ranking.'}
  else {$('#pform').hidden=false; $('#pknown').hidden=true; if(L){$('#p-nome').value=$('#p-nome').value||L.nome||''; $('#p-email').value=$('#p-email').value||L.email||''; $('#p-tel').value=$('#p-tel').value||L.tel||''}}}
const prevOnLead=MC.onLead; MC.onLead=()=>{prevOnLead&&prevOnLead(); gateState()}; gateState();
$('#pnot').onclick=()=>{MC.lead=null; try{localStorage.removeItem('mc-lead')}catch(e){} ['#p-nome','#p-email','#p-tel'].forEach(q=>$(q).value=''); gateState()};
$('#pform').addEventListener('submit',async e=>{e.preventDefault(); const n=$('#p-nome').value.trim(), m=$('#p-email').value.trim(), t=$('#p-tel').value.trim(), ok=$('#pok');
  if(!n){ok.textContent='Escreva o nome que vai aparecer no ranking.';$('#p-nome').focus();return}
  if(!okEmail(m)){ok.textContent='Esse e-mail parece incompleto. Confira e tente de novo.';$('#p-email').focus();return}
  if(t.replace(/\D/g,'').length<10){ok.textContent='Coloque o celular com DDD.';$('#p-tel').focus();return}
  ok.textContent=''; if(!MC.isBot('pform')) await saveLead({nome:n,email:m,tel:t,origem:'desafio'}); leadSaved=true; startGame()});
$('#pgo').onclick=startGame;
const pmodal=$('#pmodal');
$('#popen').onclick=()=>{pmodal.hidden=false; document.documentElement.classList.add('locked'); pgate.hidden=false; pgame.hidden=true; pend.hidden=true; gateState()};
function pClose(){tutKill(); tutForce=false; pmodal.hidden=true; document.documentElement.classList.remove('locked'); timerOn=false; solved=true; loadRank()}
$('#pclose').onclick=pClose; pmodal.addEventListener('click',e=>{if(!e.target.closest('.pm-in>*,#pclose')&&pgame.hidden) pClose()}); addEventListener('keydown',e=>{if(e.key==='Escape'&&!pmodal.hidden&&pgame.hidden) pClose()});
// 17 tutorial guiado do desafio (primeira vez; dá para rever em "Como jogar")
let tutForce=false, tutRun=0; const tutKill=()=>{tutRun++; document.querySelectorAll('.ptut').forEach(x=>x.remove()); document.querySelectorAll('.tut-hl').forEach(x=>x.classList.remove('tut-hl'))}; const tutNeed=()=>{if(tutForce) return true; try{return !localStorage.getItem('mc-tut')}catch(e){return true}};
const TUT=[['#pboard','Estas são as peças da carta, embaralhadas.'],['#pboard','Arraste uma peça até outra, ou toque em duas, para trocar de lugar.',1],['#ptime','O relógio só começa no "Já!". Cada troca conta como movimento.'],['#plevel','São 3 lendas: 9, 12 e 20 peças. A soma dos tempos vai para o ranking.']];
function runTut(done){ tutForce=false; tutKill(); const my=tutRun; const box=document.createElement('div'); box.className='ptut'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Como jogar'); pgame.appendChild(box); let k=0;
  const end=()=>{if(my!==tutRun) return; try{localStorage.setItem('mc-tut','1')}catch(e){} tutKill(); done()};
  const show=()=>{const [sel,txt,hand]=TUT[k]; pgame.querySelectorAll('.tut-hl').forEach(x=>x.classList.remove('tut-hl')); const tg=document.querySelector(sel); tg&&tg.classList.add('tut-hl');
    box.innerHTML=`<div class="tut-b"><p class="label">Como jogar · ${k+1} de ${TUT.length}</p><p class="tut-t">${txt}</p><div class="tut-a"><button class="linkb" type="button" data-skip>Pular</button><button class="btn small" type="button" data-next>${k<TUT.length-1?'Próximo':'Começar'}</button></div></div>${hand?'<span class="tut-hand" aria-hidden="true"></span>':''}`;
    box.querySelector('[data-next]').onclick=()=>{ if(++k<TUT.length) show(); else end()}; box.querySelector('[data-skip]').onclick=end; box.querySelector('[data-next]').focus({preventScroll:true})};
  show()}
document.addEventListener('click',e=>{if(e.target.closest('[data-howto]')){tutForce=true; $('#popen').click()}});
function startGame(){pgate.hidden=true; pend.hidden=true; pgame.hidden=false; lv=0; times=[]; totalMoves=0; loadLevel()}
function loadLevel(){const L=LV[lv]; pb.style.setProperty('--pc',L.c); pb.style.setProperty('--pr',L.r); $('#plevel').textContent=`Nível ${lv+1} de 3 · ${L.n}`;
  order=[...Array(L.c*L.r).keys()]; do shuffle(order); while(order.some((v,i)=>v===i)&&Math.random()<.7||order.every((v,i)=>v===i)); moves=0; $('#pmoves').textContent=0; ptime.textContent='00:00.0'; solved=true; pb.classList.remove('done'); renderPuz();
  if(lv===0&&tutNeed()){runTut(()=>countIn(L)); return} countIn(L)}
function countIn(L){
  const img=new Image(); img.src=IMP(L.f); let n=3; pcount.hidden=false; const tick=()=>{pcount.innerHTML=n>0?`<div>${n}<small>${n===3?'carregando a lenda':'prepare-se'}</small></div>`:`<div>Já!</div>`; pcount.classList.remove('go'); void pcount.offsetWidth; pcount.classList.add('go');
    if(n<0){pcount.hidden=true; solved=false; tStart=performance.now(); timerOn=true; return} n--; setTimeout(async()=>{ if(n===-1){try{await img.decode()}catch(e){}} tick()},n===-1?500:800)}; tick()}
function renderPuz(){const L=LV[lv]; pb.innerHTML=''; order.forEach((v,i)=>{const t=document.createElement('button');t.type='button';t.className='tile';t.dataset.i=i;t.setAttribute('aria-label',`Peça ${i+1}`);
  t.style.backgroundImage=`url(${IMP(L.f)})`; t.style.backgroundPosition=`${(v%L.c)*100/(L.c-1)}% ${Math.floor(v/L.c)*100/(L.r-1)}%`; pb.appendChild(t)})}
setInterval(()=>{if(timerOn&&!solved) ptime.textContent=fmt(performance.now()-tStart)},100);
function swap(a,b){if(a===b||solved) return; [order[a],order[b]]=[order[b],order[a]]; moves++; totalMoves++; $('#pmoves').textContent=moves; renderPuz();
  if(order.every((v,i)=>v===i)){solved=true; timerOn=false; const ms=performance.now()-tStart; times.push(ms); ptime.textContent=fmt(ms); pb.classList.add('done'); MC.onJoin&&MC.onJoin();
    setTimeout(()=>{ if(++lv<LV.length) loadLevel(); else finish()},1500)}}
let dragFrom=null;
pb.addEventListener('pointerdown',e=>{const t=e.target.closest('.tile'); if(!t||solved) return; dragFrom=+t.dataset.i; t.setPointerCapture&&t.setPointerCapture(e.pointerId)});
pb.addEventListener('pointerup',e=>{if(dragFrom===null) return; const el=document.elementFromPoint(e.clientX,e.clientY), t=el&&el.closest&&el.closest('.tile'); const to=t?+t.dataset.i:null;
  if(to!==null&&to!==dragFrom){swap(dragFrom,to); selTile=null} else { if(selTile===null){selTile=dragFrom; pb.children[selTile].classList.add('sel')} else {const a=selTile; selTile=null; if(a===dragFrom) renderPuz(); else swap(a,dragFrom)} } dragFrom=null});
async function finish(){const total=times.reduce((a,b)=>a+b,0), nome=(MC.lead&&MC.lead.nome)||'Anônimo';
  pgame.hidden=true; pend.hidden=false;
  pend.innerHTML=`<p class="label">Desafio completo</p><h3>Obrigado, ${nome.split(' ')[0]}!</h3><p>Seu tempo já está no ranking.</p><table>${LV.map((L,i)=>`<tr><td>${L.n}</td><td>${fmt(times[i])}</td></tr>`).join('')}<tr><td><b>Total</b> · ${totalMoves} movimentos</td><td><b>${fmt(total)}</b></td></tr></table><div class="cact" style="justify-content:flex-start"><button class="btn" type="button" id="pagain">Jogar de novo</button><button class="btn ghost" type="button" id="prank">Ver o ranking</button></div>`; $("#prank").onclick=()=>{pClose(); $("#quebra").scrollIntoView({behavior:"smooth"})};
  $('#pagain').onclick=startGame;
  const st=await MC.store; let prev=null; const mine={nome,t:times.map(Math.round),total:Math.round(total),moves:totalMoves};
  if(st){try{prev=await st.myScore()}catch(e){}}
  if(prev&&Array.isArray(prev.t)){mine.t=mine.t.map((v,i)=>Math.min(v,prev.t[i]??Infinity)); if(prev.total<mine.total){mine.total=prev.total; mine.moves=prev.moves}}
  try{localStorage.setItem('mc-puz',JSON.stringify(mine))}catch(e){}
  if(st){try{await st.saveScore(mine)}catch(e){}} loadRank()}
let rankTab='total', rankData=[];
$$('.rtabs button').forEach(b=>b.onclick=()=>{rankTab=b.dataset.rt; $$('.rtabs button').forEach(x=>x.setAttribute('aria-selected',x===b)); paintRank()});
function paintRank(){const st=MC._st, me=st&&st.uid; const key=x=>rankTab==='total'?x.total:(x.t||[])[+rankTab];
  const all=rankData.filter(x=>isFinite(key(x))).sort((a,b)=>key(a)-key(b)), li=x=>`<li class="${x._id===me||x._me?'me':''}"><span>${(x.nome||'Anônimo').replace(/[<>&]/g,'')}</span><b>${fmt(key(x))}</b></li>`;
  $('#rlist').innerHTML=all.length?all.slice(0,5).map(li).join(''):'<li class="empty">Ninguém completou ainda. O primeiro lugar está livre.</li>';
  $('#rlistall').innerHTML=all.length?all.map(li).join(''):'<li class="empty">Ninguém completou ainda.</li>'; $('#rall').hidden=all.length<=5}
$('#rall').onclick=()=>openModal($('#rankm'));
async function loadRank(){const st=await MC.store; MC._st=st; let data=[];
  if(st){try{data=await st.scores()}catch(e){}} else {try{const m=JSON.parse(localStorage.getItem('mc-puz')||'null'); if(m) data=[{...m,_me:true}]}catch(e){}}
  rankData=data; paintRank()}
loadRank(); setInterval(()=>{const r=$('#quebra').getBoundingClientRect(); if(r.bottom>0&&r.top<MC.VH) loadRank()},10000);

// ---------- fundos vivos dos Reinos ----------
const rnd=(a,b)=>a+Math.random()*(b-a);
reinos.forEach(o=>{const cv=o.sec.querySelector('.bgfx'); o.bg={cv,ctx:cv.getContext('2d'),type:o.sec.id,w:0,h:0,next:0,flash:0}});
function bgGen(b){const w=b.w,h=b.h; b.parts=[]; b.roots=[]; b.vines=[];
  if(b.type==='raizes'){const mk=(x,y,a,w0,len,delay)=>{const pts=[[x,y]];let ang=a;for(let j=0;j<len;j++){ang+=rnd(-.32,.32);ang+=(-Math.PI/2-ang)*.04;x+=Math.cos(ang)*13;y+=Math.sin(ang)*13;pts.push([x,y]);if(j>8&&Math.random()<.06&&w0>3) b.roots.push(mk(x,y,ang+rnd(-1,1),w0*.55,len*.5|0,delay+j/len*.3))}return {pts,w0,delay}};
    for(let i=0;i<9;i++) b.roots.push(mk(rnd(0,w),h+10,-Math.PI/2+rnd(-.5,.5),rnd(7,16),rnd(40,80)|0,rnd(0,.25)));
    for(let i=0;i<4;i++) b.roots.push(mk(-10,rnd(h*.4,h),rnd(-.6,0),rnd(6,12),rnd(40,70)|0,rnd(0,.3)));
    for(let i=0;i<4;i++) b.roots.push(mk(w+10,rnd(h*.4,h),Math.PI+rnd(0,.6),rnd(6,12),rnd(40,70)|0,rnd(0,.3)));
    for(let i=0;i<12;i++) b.vines.push({x:rnd(0,w),len:rnd(h*.12,h*.42),ph:rnd(0,6)});
    for(let i=0;i<46;i++) b.parts.push({x:rnd(0,w),y:rnd(0,h),ph:rnd(0,6),s:rnd(.4,1)})}
  else if(b.type==='mares'){for(let i=0;i<55;i++) b.parts.push({x:rnd(0,w),y:rnd(0,h),r:rnd(1.5,6),v:rnd(20,60),ph:rnd(0,6)})}
  else if(b.type==='tormentas'){for(let i=0;i<160;i++) b.parts.push({x:rnd(0,w),y:rnd(0,h),l:rnd(12,30),v:rnd(700,1100)})}
  else {for(let i=0;i<90;i++) b.parts.push({x:rnd(0,w),y:rnd(0,h),r:rnd(.8,2.6),v:rnd(12,40),ph:rnd(0,6)}); for(let i=0;i<5;i++) b.vines.push({x:rnd(0,w),y:rnd(h*.2,h),r:rnd(h*.3,h*.6),ph:rnd(0,6)})}}
function bgDraw(o,p,now,dt){const b=o.bg, cv=b.cv, W=cv.clientWidth, H=cv.clientHeight; if(!W) return;
  if(W!==b.w||H!==b.h){b.w=cv.width=W;b.h=cv.height=H;bgGen(b)} const c=b.ctx, t=now/1000; c.clearRect(0,0,W,H);
  if(b.type==='raizes'){
    for(const r of b.roots){const g=clamp(p*1.5+.3-r.delay), n=Math.floor(r.pts.length*g); if(n<2) continue;
      for(let pass=0;pass<2;pass++){c.strokeStyle=pass?'rgba(92,140,60,.35)':'#1c140b';c.lineCap='round';
        for(let j=1;j<n;j++){const k=1-j/r.pts.length;c.lineWidth=Math.max(.6,(pass?r.w0*.25:r.w0)*k);c.beginPath();c.moveTo(r.pts[j-1][0],r.pts[j-1][1]);c.lineTo(r.pts[j][0]+(pass?-1:0),r.pts[j][1]);c.stroke()}}}
    for(const v of b.vines){const sw=Math.sin(t*.8+v.ph)*12+mxN*20;c.strokeStyle='#1d3320';c.lineWidth=2;c.beginPath();c.moveTo(v.x,0);c.quadraticCurveTo(v.x+sw,v.len*.5,v.x+sw*1.6,v.len);c.stroke();
      c.fillStyle='#24452a';for(let y=14;y<v.len;y+=18){const q=y/v.len, lx=v.x+sw*1.6*q*q*1.2;c.beginPath();c.ellipse(lx+((y/18)%2?7:-7),y,7,3.4,((y/18)%2?.6:-.6),0,Math.PI*2);c.fill()}}
    for(const f of b.parts){f.x+=Math.sin(t+f.ph)*.3;f.y+=Math.cos(t*.7+f.ph)*.25;const a=(Math.sin(t*2+f.ph)*.5+.5)*f.s;c.fillStyle=`rgba(214,255,120,${a*.9})`;c.shadowColor='#d6ff78';c.shadowBlur=12;c.beginPath();c.arc(f.x,f.y,1.8,0,Math.PI*2);c.fill()} c.shadowBlur=0}
  else if(b.type==='mares'){
    for(let k=0;k<4;k++){const a=c.createLinearGradient(0,0,0,H*.8);a.addColorStop(0,'rgba(120,230,230,.10)');a.addColorStop(1,'rgba(120,230,230,0)');c.fillStyle=a;const x0=W*(.15+k*.22)+Math.sin(t*.3+k)*40+mxN*40;c.beginPath();c.moveTo(x0,0);c.lineTo(x0+70,0);c.lineTo(x0+200,H*.8);c.lineTo(x0+40,H*.8);c.fill()}
    c.lineWidth=2;for(let k=0;k<6;k++){c.strokeStyle=`rgba(140,240,240,${.05+k*.01})`;c.beginPath();for(let x=0;x<=W;x+=20){const y=H*(.15+k*.14)+Math.sin(x*.012+t*(.6+k*.1)+k)*14;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
    for(const q of b.parts){q.y-=q.v*dt;q.x+=Math.sin(t*2+q.ph)*.4;if(q.y<-10){q.y=H+10;q.x=rnd(0,W)}c.strokeStyle='rgba(180,250,250,.35)';c.lineWidth=1;c.beginPath();c.arc(q.x,q.y,q.r,0,Math.PI*2);c.stroke()}}
  else if(b.type==='tormentas'){
    c.strokeStyle='rgba(190,180,255,.28)';c.lineWidth=1;c.beginPath();for(const d of b.parts){d.y+=d.v*dt;d.x-=d.v*dt*.25;if(d.y>H){d.y=-20;d.x=rnd(0,W*1.2)}c.moveTo(d.x,d.y);c.lineTo(d.x+d.l*.25,d.y-d.l)}c.stroke();
    if(now>b.next){b.next=now+rnd(2200,5200);b.flash=1;let x=rnd(W*.2,W*.9),y=0;b.bolt=[[x,y]];while(y<H*.65){y+=rnd(20,50);x+=rnd(-40,40);b.bolt.push([x,y])}}
    if(b.flash>.02){c.fillStyle=`rgba(220,210,255,${b.flash*.22})`;c.fillRect(0,0,W,H);c.strokeStyle=`rgba(240,235,255,${b.flash})`;c.lineWidth=3;c.shadowColor='#c9b8ff';c.shadowBlur=20;c.beginPath();b.bolt.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.shadowBlur=0;b.flash*=Math.pow(.02,dt)}}
  else { // Titãs: névoa dourada, halo de templo e brasas
    for(const v of b.vines){const x=v.x+Math.sin(t*.15+v.ph)*80+mxN*-60, y=v.y+Math.cos(t*.12+v.ph)*40; const g=c.createRadialGradient(x,y,0,x,y,v.r);g.addColorStop(0,'rgba(232,181,76,.10)');g.addColorStop(1,'rgba(232,181,76,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}
    c.save();c.translate(W*.66,H*.5);c.strokeStyle='rgba(255,214,140,.10)';for(let k=1;k<6;k++){c.lineWidth=1+k*.3;c.beginPath();c.arc(0,0,k*H*.12+Math.sin(t*.6+k)*6,0,Math.PI*2);c.stroke()}c.restore();
    for(const e of b.parts){e.y-=e.v*dt;e.x+=Math.sin(t+e.ph)*.4;if(e.y<-10){e.y=H+10;e.x=rnd(0,W)}const a=.35+.65*Math.abs(Math.sin(t*2.4+e.ph));c.fillStyle=`rgba(255,${170+e.r*25|0},80,${a})`;c.beginPath();c.arc(e.x,e.y,e.r,0,Math.PI*2);c.fill()}}}

// ---------- fundo ambiente que reage ao mouse ----------
const amb=$('#amb'), actx=amb.getContext('2d'); const motes=[]; let ambW=0,ambH=0, pmx=-999, pmy=-999;
addEventListener('pointermove',e=>{pmx=e.clientX;pmy=e.clientY});
let glowC='#e0362a'; const readGlow=()=>{glowC=getComputedStyle(document.body).getPropertyValue('--glow').trim()||'#e0362a'}; readGlow(); new MutationObserver(()=>requestAnimationFrame(readGlow)).observe(document.body,{attributes:true,attributeFilter:['data-theme']}); // lido só quando o tema muda (antes era a cada quadro)
function ambDraw(dt){const W=innerWidth,H=MC.VH; if(W!==ambW||H!==ambH){ambW=amb.width=W;ambH=amb.height=H;motes.length=0;for(let i=0;i<70;i++) motes.push({x:rnd(0,W),y:rnd(0,H),vx:rnd(-8,8),vy:rnd(-14,-4),r:rnd(.8,2.4),s:rnd(.3,1)})}
  actx.clearRect(0,0,W,H); actx.fillStyle=glowC;
  for(const m of motes){const dx=m.x-pmx, dy=m.y-pmy, d2=dx*dx+dy*dy; if(d2<16000){const f=(16000-d2)/16000*220; const d=Math.sqrt(d2)||1; m.vx+=dx/d*f*dt; m.vy+=dy/d*f*dt}
    m.vx*=Math.pow(.6,dt); m.vy=m.vy*Math.pow(.6,dt)+(-8*(1-Math.pow(.6,dt))); m.x+=m.vx*dt; m.y+=m.vy*dt;
    if(m.y<-10){m.y=H+10;m.x=rnd(0,W)} if(m.x<-10)m.x=W+10; if(m.x>W+10)m.x=-10;
    actx.globalAlpha=.35*m.s; actx.beginPath(); actx.arc(m.x,m.y,m.r,0,Math.PI*2); actx.fill()} actx.globalAlpha=1}

// R10: a tela de carregamento "queima" de baixo para cima (borda de brasa na cor da lenda) e revela o site
window.MC_BURN=function(host,dur,logo){ const cv=document.createElement('canvas'); cv.className='ld-burn'; host.prepend(cv);
  const gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false}); if(!gl){cv.remove(); return null}
  const W=Math.round(innerWidth*Math.min(devicePixelRatio,1.5)), H=Math.round(innerHeight*Math.min(devicePixelRatio,1.5)); cv.width=W; cv.height=H;
  const sh=(t,src)=>{const o=gl.createShader(t); gl.shaderSource(o,src); gl.compileShader(o); return o};
  const p=gl.createProgram(); gl.attachShader(p,sh(gl.VERTEX_SHADER,'attribute vec2 a;varying vec2 u;void main(){u=a*.5+.5;gl_Position=vec4(a,0.,1.);}'));
  gl.attachShader(p,sh(gl.FRAGMENT_SHADER,`precision highp float;varying vec2 u;uniform float t,ar,hl;uniform vec3 bg,ac;uniform vec4 lr;uniform sampler2D lt;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float fb(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
    void main(){vec2 q=vec2(u.x*ar,u.y);float nz=fb(q*3.2+vec2(0.,t*.25));float e=mix(-.35,1.35,t);float d=e-(u.y+(nz-.5)*.42);
      if(d>.0){float ember=smoothstep(.16,0.,d);vec3 c=ac*(1.5*exp(-d*95.)+.32*ember);float a=clamp(max(max(c.r,c.g),c.b),0.,1.);gl_FragColor=vec4(min(c,vec3(a)),a);}
      else{float glow=exp(d*150.);vec3 b=bg;if(hl>.5){vec2 lu=(u-lr.xy)/lr.zw;if(lu.x>0.&&lu.x<1.&&lu.y>0.&&lu.y<1.){vec4 L=texture2D(lt,lu);b=b*(1.-L.a)+L.rgb;}}vec3 c=mix(b,ac*1.6,glow*.9);gl_FragColor=vec4(c,1.);}}`));
  gl.bindAttribLocation(p,0,'a'); gl.linkProgram(p); if(!gl.getProgramParameter(p,gl.LINK_STATUS)){cv.remove(); return null}
  gl.useProgram(p); gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);
  const hex=c=>{const m=/#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(c||'')||[0,'e0','36','2a']; return [1,2,3].map(i=>parseInt(m[i],16)/255)};
  const U=k=>gl.getUniformLocation(p,k); gl.uniform1f(U('ar'),W/H); gl.uniform3fv(U('bg'),hex('#0a0d0e')); gl.uniform3fv(U('ac'),hex(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()));
  gl.uniform1f(U('hl'),0);
  if(logo&&logo.complete&&logo.naturalWidth){ try{ const r=logo.getBoundingClientRect(); const tx=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tx); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,logo); [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR)); [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));
    gl.uniform1i(U('lt'),0); gl.uniform4f(U('lr'),r.left/innerWidth,1-(r.bottom/innerHeight),r.width/innerWidth,r.height/innerHeight); gl.uniform1f(U('hl'),1); logo.closest('.ld-in').style.visibility='hidden' }catch(e){} }
  gl.viewport(0,0,W,H); const t0=performance.now();
  return new Promise(res=>{ const f=now=>{ const k=Math.min(1,(now-t0)/dur), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; gl.uniform1f(U('t'),e); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); if(k<1) requestAnimationFrame(f); else {cv.remove(); res()} }; requestAnimationFrame(f) }) };
// ---------- loading ----------
document.documentElement.classList.add('loading');
const LD={fonts:0,page:0,models:0,vid:0,img:0}, ldEl=$('#loader'); let ldDone=false, ldShown=0;
MC.modelLoaded=()=>{LD.models=Math.min(1,LD.models+1/12)};
document.fonts&&document.fonts.ready.then(()=>LD.fonts=1); if(!document.fonts) LD.fonts=1;
addEventListener('load',()=>LD.page=1); if(document.readyState==='complete') LD.page=1;
const t0=performance.now();
// R13: aproveita o carregamento para baixar e decodificar as imagens do começo do site (história, tabuleiro, primeiros reinos) — evita travadas depois
setTimeout(()=>{ const U=[...new Set([...document.querySelectorAll('#stcards img, #raizes img, .lv-panel img, #historia img')].map(i=>i.currentSrc||i.getAttribute('src')).filter(Boolean))].slice(0,40);
  if(!U.length){LD.img=1; return} let d=0; const one=()=>{d++; LD.img=d/U.length};
  U.forEach(u=>{const im=new Image(); im.decoding='async'; im.src=u; (im.decode?im.decode():new Promise(r=>{im.onload=im.onerror=r})).then(one,one)}) },60);
function ldTick(){ if(ldDone) return; const pr=(LD.fonts*.15+LD.page*.3+LD.models*.35+LD.img*.2), el=performance.now()-t0, tg=Math.min(pr,MC.reduce?1:el/6600); /* R13: ~7s, nunca mais rápido que o relógio nem que o carregamento */ ldShown+=(tg-ldShown)*.18; if(tg>=1&&ldShown>.985) ldShown=1; const pc=Math.round(ldShown*100);
  {const msg=pc<25?'Acordando as lendas':pc<50?'Embaralhando os Reinos':pc<75?'Procurando o gorro do Saci':'Que comece o Caos', me=$('#ldmsg'); if(me&&me.textContent!==msg) me.textContent=msg}
  $('#ldbar').parentElement.style.setProperty('--lp',pc+'%'); $('#ldbar').style.width=pc+'%'; $('#ldpct').textContent=pc;
  if((pr>.98&&ldShown>=1)||performance.now()-t0>14000){ if(!LD.tr) LD.tr=performance.now(); }
  if(LD.tr&&performance.now()-LD.tr>(MC.reduce?150:350)){ ldDone=true; $('#ldbar').style.width='100%'; $('#ldpct').textContent=100;
    setTimeout(()=>{ const L=ldEl.querySelector('.ld-logo'), S=ldEl.querySelector('.ld-sub'), HL=$('#hlogot'), HS=$('#hlogos');
      const flyTo=(el,tg)=>{if(!el||!tg) return; const a=el.getBoundingClientRect(), t=tg.getBoundingClientRect(); if(!a.height||!t.height) return; const _=0, k=t.height/a.height; el.style.transformOrigin='50% 50%'; el.style.transform=`translate(${(t.left+t.width/2)-(a.left+a.width/2)}px,${(t.top+t.height/2)-(a.top+a.height/2)}px) scale(${k})`};
      ldEl.classList.add('fly'); let BURN=null; if(!MC.reduce){ try{ BURN=window.MC_BURN(ldEl,2500,ldEl.querySelector('.ld-logo img')) }catch(e){ BURN=null } } if(BURN) ldEl.classList.add('burn'); document.documentElement.classList.remove('loading'); if(L&&HL&&!MC.reduce&&!BURN){flyTo(L,HL); flyTo(S,HS)}
      setTimeout(()=>{MC.logoLanded=true; if(!BURN) ldEl.classList.add('out')},MC.reduce?0:(BURN?1500:1050)); if(BURN) BURN.then(()=>{ldEl.classList.add('out'); setTimeout(()=>ldEl.classList.add('gone'),300)}); else setTimeout(()=>ldEl.classList.add('gone'),MC.reduce?600:1700); MC.loaded=performance.now()},250); return}
  requestAnimationFrame(ldTick)}
requestAnimationFrame(ldTick);

// ---------- lendas em vídeo (a rolagem controla o vídeo) ----------
const lendSec=$('#lendas'), lendTrack=lendSec.querySelector('.lv-track'), lendDots=[...lendSec.querySelectorAll('.lv-dots i')];
const LR=[[0,1]]; // só a Medusa (rodada 4)
const LENDAS=[...lendSec.querySelectorAll('.lv-panel')].map((pn,i)=>({sec:lendSec,pn,name:pn.dataset.l,cls:'#e0362a',r:LR[i],st:pn,v:pn.querySelector('.lv'),card:pn.querySelector('.lv-card'),kind:'',cur:0,dur:6,url:null}));
LENDAS.forEach(L=>L.pn.querySelectorAll('.layers').forEach(el=>{const f=el.innerHTML.match(/__L:([^_]+)__/); if(f) el.innerHTML=layersHTML(f[1],'Carta '+nameOf(f[1]))}));
// o vídeo é baixado inteiro (blob) para a rolagem poder ir e voltar sem travar
function lvLoad(L){ const kind=innerWidth<761?'9x16':'16x9'; if(L.kind===kind) return; L.kind=kind;
  fetch(`assets/video/${L.name}-${kind}-v2.mp4`).then(r=>r.blob()).then(b=>{ if(L.kind!==kind) return; if(L.url) URL.revokeObjectURL(L.url); L.url=URL.createObjectURL(b); L.v.src=L.url; L.v.load();
    L.v.addEventListener('loadedmetadata',()=>{L.dur=L.v.duration||6},{once:true}); L.v.addEventListener('loadeddata',()=>{LD.vid=1},{once:true})}).catch(()=>{LD.vid=1})}
LENDAS.forEach(L=>{L.st.style.setProperty('--cls',L.cls); holo(L.pn.querySelector('.lv-tilt'),12,.04)}); let lvNear=false; new IntersectionObserver((es,o)=>es.forEach(en=>{if(en.isIntersecting){lvNear=true; LENDAS.forEach(lvLoad); o.disconnect()}}),{rootMargin:'250% 0px'}).observe(lendSec); addEventListener('resize',()=>{if(lvNear) LENDAS.forEach(lvLoad)});
setTimeout(()=>{LD.vid=Math.max(LD.vid,1)},9000);
LENDAS.forEach(L=>{const flip=()=>L.card.classList.toggle('flip'); L.card.addEventListener('click',flip); L.card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}})});
function updLendTrack(){if(LENDAS.length<2) return; const r=lendSec.getBoundingClientRect(); if(r.bottom<0||r.top>MC.VH) return; const p=prog(lendSec), hx=MC.reduce?(p>.5?1:0):sstep(clamp((p-LR[0][1])/(LR[1][0]-LR[0][1])));
  lendTrack.style.transform=`translate3d(${(-hx*100).toFixed(3)}vw,0,0)`; lendDots.forEach((d,i)=>d.classList.toggle('on',(hx>.5?1:0)===i))}
const eio=t=>-(Math.cos(Math.PI*t)-1)/2;
function updLenda(L,dt){ const r=L.sec.getBoundingClientRect(), H=MC.VH; if(r.bottom<-50||r.top>H+50) return; const P=prog(L.sec), p=clamp((P-L.r[0])/(L.r[1]-L.r[0])), st=L.st.style; if(P<L.r[0]-.06||P>L.r[1]+.06){ if(!L.v.paused) L.v.pause(); return }
  const fin=L.r[0]>0?1:(r.top>0?clamp(1.15-r.top/H):1), vp=clamp((p-.03)/.6); // o vídeo já entra enquanto a seção sobe (sem bloco preto)
  st.setProperty('--lvo',(MC.reduce?1:fin).toFixed(3)); st.setProperty('--lvs',(1.14-.14*sstep(fin)+vp*.05).toFixed(4));
  const g=clamp((p-.62)/.08); st.setProperty('--lvg',g.toFixed(3)); st.setProperty('--lvsh',(g*.9).toFixed(3));
  const ce=clamp((p-.69)/.13), e=1-Math.pow(1-ce,3); st.setProperty('--lce',(MC.reduce?1:e).toFixed(4)); st.setProperty('--lco',clamp(ce*4).toFixed(3)); st.setProperty('--lgl',(clamp((p-.8)/.03)*(1-clamp((p-.86)/.08)*.6)).toFixed(3));
  st.setProperty('--lio',clamp((p-.8)/.07).toFixed(3));
  // a rolagem é o controle: o tempo do vídeo persegue o alvo com suavidade
  const v=L.v; if(v.readyState<2) return; const target=(MC.reduce?1:eio(vp))*(L.dur-.05), d=target-v.currentTime;
  // para frente: play com velocidade que acompanha a rolagem (easing natural); para trás: busca suave
  if(d>.03){ const want=clamp(d*1.6,.35,3.2); L.rate=(L.rate||.5)+(want-(L.rate||.5))*(1-Math.exp(-dt*4)); try{v.playbackRate=Math.max(.25,L.rate)}catch(e){} if(v.paused) v.play().catch(()=>{}) }
  else if(d<-.25){ if(!v.paused) v.pause(); L.rate=.5; if(!v.seeking){ const tg=v.currentTime+d*(1-Math.exp(-dt*8)); try{v.currentTime=Math.max(0,tg)}catch(e){} } }
  else if(d<.005&&!v.paused){ v.pause(); L.rate=.5 }}

// ---------- história de abertura (texto acende com a rolagem; palavras-chave chamam as cartas) ----------
const STORY=[
 {c:'#e0362a',l:['Imagina um jogo','onde o {Saci|19-c-saci} enfrenta o {Thor|07-g-thor}.']},
 {c:'#9cb03c',l:['Onde a {Cuca|45-o-cuca} encara o {Drácula|33-c-dracula}.','E o {Klaus|05-g-klaus} dá de cara','com a {Loira do Banheiro|25-c-bloody-mary}.']},
 {c:'#e8892c',l:['{Folclore|01-g-curupira}, {mitologias|09-g-zeus}','e {lendas urbanas|27-c-chupa-cabra},','tudo na mesma mesa.','*Isso só pode acabar em Caos.*']},
 {c:'#4fc3c7',early:true,l:['Cada lenda é uma carta.','Cada carta mora em um {Reino|v:raizes,v:mares,v:tormentas,v:titas}.']},
 {c:'#a88bff',red:true,early:true,split:'Portal',l:['Para subir de Reino,','um {Portal|63-p-arco,65-p-floresta,70-p-naufrago}.','Mas cuidado: tire um {Limbo|57-l-tormenta}','e sua queda será *rápida demais.*']},
 {c:'#3fe0a6',early:true,l:['Reúna as {Relíquias|73-r-cristal,79-r-perola,85-r-talisma,91-r-orquidea} sagradas','e feche a rodada.','O que sobrar na sua mão','*decide o seu fôlego.*']},
 {c:'#f3c16b',l:['No fim da trilha, um templo.','*Só uma lenda chega lá.*']},
 {c:'#e0362a',early:true,l:['Ah, e não se distraia:','o {tabuleiro|@board} *joga contra você.*']},
 {c:'#e0362a',end:true}];
const stSec=$('#historia'), stTxt=$('#sttxt'), stCards=$('#stcards'), stProg=$('#stprog');
const ST=STORY.map((B,bi)=>{ const el=document.createElement('div'); el.className='st-block'+(B.end?' st-end':''); const words=[], cards=[];
  if(B.end){ el.innerHTML=`<p class="st-logo">__LOGO__</p>`+'<p class="st-sub">O Despertar das Lendas</p><p class="st-cred"><span>Um jogo 100% brasileiro</span><span class="st-dot"> · </span><span>criado e desenvolvido por Bruno Leal</span></p>'; stTxt.appendChild(el); return {el,words:[...el.children],cards,B,order:[]} }
  B.l.forEach(line=>{ const p=document.createElement('p'); p.className='st-line';
    line.split(/(\{[^}]+\}|\*[^*]+\*)/).filter(Boolean).forEach(tok=>{
      if(tok[0]==='{'){ const [txt,ref]=tok.slice(1,-1).split('|'); const sp=document.createElement('span'); sp.className='st-w kw'; sp.textContent=txt; sp.dataset.ref=ref; p.appendChild(sp); words.push(sp); p.appendChild(document.createTextNode(' '));
        ref.split(',').forEach(r=>cards.push({ref:r,i:cards.length,w:sp})) }
      else { const hl=tok[0]==='*'; let t=hl?tok.slice(1,-1):tok; const pm=t.match(/^[.,:;!?]+/); if(pm&&words.length){const lw=words[words.length-1]; lw.textContent+=pm[0]; if(p.lastChild&&p.lastChild.nodeType===3) p.removeChild(p.lastChild); p.appendChild(document.createTextNode(' ')); t=t.slice(pm[0].length)}
        t.split(/\s+/).filter(Boolean).forEach(w=>{const sp=document.createElement('span'); sp.className='st-w'+(hl?' hl':''); sp.textContent=w; p.appendChild(sp); p.appendChild(document.createTextNode(' ')); words.push(sp)}) } });
    el.appendChild(p)});
  stTxt.appendChild(el);
  if(B.split){const kw=words.find(w=>w.dataset.ref&&w.textContent.startsWith(B.split)); B.splitN=kw?words.indexOf(kw)+1:words.length}
  cards.forEach((c,ci)=>{ const d=document.createElement('div'); d.className='st-card'; const n=cards.length;
    if(c.ref==='@board'){ d.className='st-bigboard'; d.innerHTML='<img src="assets/misc/tabuleiro2.webp" alt="">'; c.big=true; stCards.appendChild(d); c.d=d; return }
    { const pre=bi===0&&ci===0, src=c.ref.startsWith('v:')?`assets/imp/${c.ref.slice(2)}/114-verso.jpg`:IMP(c.ref); const face=c.ref.startsWith('v:')?`<img src="${src}" alt="">`:`<div class="layers">${layersHTML(c.ref,'')}</div>`; d.innerHTML=`<div class="st-ci"><div class="st-face">${face}${fxHTML}</div>${pre?'<div class="st-back"><img src="assets/imp/raizes/114-verso.jpg" alt=""></div>':''}</div>`; if(pre) d.classList.add('pre','in');
      holo(d.querySelector('.st-ci'),12,.06) }
    d.addEventListener('click',()=>{ const S=ST[bi]; if(S.order[S.order.length-1]===ci&&!c.ref.startsWith('v:')){ openCard(c.ref,d); return } S.order=S.order.filter(x=>x!==ci); S.order.push(ci); stackPaint(S) });
    // posições alternadas ao redor do texto
    d.style.setProperty('--i',ci); d.style.setProperty('--rot',((ci%2?1:-1)*(4+ci*2.5))+'deg');
    stCards.appendChild(d); c.d=d});
  const ord=cards.map((_,k)=>k).filter(k=>!cards[k].big);
  return {el,words,cards,B,order:ord} });
function stackPaint(S){ const n=S.order.length; S.order.forEach((ci,pos)=>{const c=S.cards[ci]; c.d.style.setProperty('--i',pos); c.d.style.setProperty('--ic',(pos-(n-1)/2).toFixed(2)); c.d.style.setProperty('--sp',(n<=2?.72:n===3?.5:.36)); c.d.style.zIndex=10+pos}) }
ST.forEach(S=>S.order&&stackPaint(S));
ST.forEach(stackPaint);
// hover: as cartas do bloco se afastam para mostrar todas as ilustrações (continuam levemente sobrepostas)
if(matchMedia('(hover:hover)').matches){ let spT=0;
  stCards.addEventListener('pointerover',e=>{ if(e.target.closest('.st-card.in')){clearTimeout(spT); stCards.classList.add('spread')} });
  stCards.addEventListener('pointerout',e=>{ const to=e.relatedTarget; if(to&&to.closest&&to.closest('.st-card.in')) return; clearTimeout(spT); spT=setTimeout(()=>stCards.classList.remove('spread'),220) }) }
{const E=ST[ST.length-1].el; stSec.querySelector('.stage').appendChild(E)}
stProg.innerHTML=STORY.map(()=>'<i></i>').join(''); const stDots=[...stProg.children];
{const row=$('#stpickrow'); PAWNS.forEach(([id,name,c])=>{const b=document.createElement('button');b.type='button';b.dataset.id=id;b.style.setProperty('--c',c);b.innerHTML=`<i></i><span>${name}</span>`;b.onclick=()=>applyPawn(id);row.appendChild(b)}); const mark=()=>row.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===MC.pawn)); mark(); const prev=MC.onPawn; setInterval(mark,400)}
// setas da abertura: bloco anterior/próximo (a rolagem continua valendo)
$$('#stnav button').forEach(b=>b.onclick=()=>{const N=ST.length, x=prog(stSec)*N, bi=Math.min(N-1,Math.floor(x)), to=clamp(bi+ +b.dataset.d,0,N-1); scrollTo({top:stSec.offsetTop+(stSec.offsetHeight-MC.VH)*Math.min(.985,(to+.04)/N),behavior:'smooth'})});
// o tabuleiro do fundo acompanha levemente o mouse
addEventListener('pointermove',e=>{ if(e.pointerType==='touch') return; stSec.style.setProperty('--mx',(e.clientX/innerWidth-.5).toFixed(3)); stSec.style.setProperty('--my',(e.clientY/MC.VH-.5).toFixed(3))},{passive:true});
// logo: o subtítulo sempre na mesma proporção da palavra (topo, abertura, loader)
function fitLogo(){ [['#hlogot','#hlogos'],['.st-end .st-logo','.st-end .st-sub'],['.ld-logo','.ld-sub']].forEach(([a,b])=>{const L=$(a), S=$(b); if(!L||!S) return; S.style.fontSize=''; const lw=L.offsetWidth, sw=S.offsetWidth; if(!lw||!sw) return; const fs=parseFloat(getComputedStyle(S).fontSize); S.style.fontSize=(fs*lw*.8/sw).toFixed(2)+'px'})}
fitLogo(); document.fonts&&document.fonts.ready.then(fitLogo); addEventListener('resize',fitLogo); setTimeout(fitLogo,1200);
$('#stskip').onclick=()=>{const y=stSec.offsetTop+(stSec.offsetHeight-MC.VH)*.985; scrollTo({top:y,behavior:'smooth'})};
let stBi=-1, stT0=0;
const pickH=$('#pickhand');
let stM=null; const ST_GAP=()=>innerWidth<761?18:34;
function stMeasure(){ const b=ST.map(S=>{const k=[...S.el.children].filter(c=>c.offsetHeight>0); if(!k.length) return {t:0,h:0,bt:0}; const t=k[0].offsetTop, bt=k[k.length-1].offsetTop+k[k.length-1].offsetHeight; return {t,h:bt-t,bt}});
  stM={w:innerWidth,h:MC.VH,top:stTxt.getBoundingClientRect().top-(stSec.querySelector('.stage')||stSec).getBoundingClientRect().top, /* topo do texto dentro do palco fixo */b,l0:(()=>{const w=ST[0].words.filter(x=>x.offsetHeight>0); if(!w.length) return 0; const t0=w[0].offsetTop; return w.filter(x=>Math.abs(x.offsetTop-t0)<6).length})(),S:b.map((m,i)=>i<b.length-1?(b[i+1].t-ST_GAP())-m.bt:0)}}
document.fonts&&document.fonts.ready.then(()=>{stM=null});
function updStory(){ const r=stSec.getBoundingClientRect(); if(r.bottom<MC.VH*.5||r.top>MC.VH){stBi=-1; pickH.style.opacity=0; if(r.bottom<0||r.top>MC.VH) return} const p=prog(stSec), N=ST.length, x=p*N, bi=Math.min(N-1,Math.floor(x)), q=x-bi;
  // as palavras acendem junto com a rolagem (sem tempo, sem espera): rolou, acendeu; voltou, apaga
  if(bi!==stBi){stBi=bi; stT0=performance.now()} const tq=99, tl=n=>{const st=bi===0&&stM&&stM.l0?stM.l0/(n*1.02):0; return (st+(MC.reduce?1:clamp((q-.04)/.56))*(1-st))*n*1.02};
  let sc=STORY[bi].c, red=false; if(STORY[bi].red){const lw=ST[bi].cards.find(c=>c.ref==='57-l-tormenta'); const nn=ST[bi].words.length, lt=tl(nn); red=lw&&lt-ST[bi].words.indexOf(lw.w)>.6&&q<.9} if(red) sc='#ff2a1a';
  stSec.style.setProperty('--sc',sc); stSec.classList.toggle('st-red',!!red); $('#stskip').style.opacity=bi===N-1?0:1; stProg.style.opacity=bi===N-1?0:1; $('#stskip').style.pointerEvents=bi===N-1?'none':''; {const cu=$('#stcue'); if(cu) cu.style.opacity=(bi===N-1||scrollY>40)?0:1; const nv=$('#stnav'); nv.style.opacity=bi===N-1?0:1; nv.style.pointerEvents=bi===N-1?'none':''; const pr=$('#stpickrow'); if(pr){const k=clamp((r.bottom-MC.VH*.72)/(MC.VH*.22)); pr.style.opacity=bi===N-1?k.toFixed(3):''; pr.style.pointerEvents=k<.5?'none':''}}
  // R4: os blocos se empilham — o novo entra subindo embaixo, os anteriores sobem e ficam esmaecidos até sair pelo topo
  if(!stM||stM.w!==innerWidth||stM.h!==MC.VH) stMeasure();
  const e=bi===0?1:sstep(clamp(q/.28)), endB=bi===N-1, push=bi>0?-stM.S[bi-1]*(1-e):0;
  let cum=0; const Y=[]; for(let i=bi;i>=0;i--){ Y[i]=cum+push; if(i>0) cum+=stM.S[i-1] }
  const MOB=innerWidth<761;
  ST.forEach((S,i)=>{ let o=0, y=0; if(MOB){ if(i===bi){ const fin=i===0?1:clamp(q/.08), fout=i===N-1?1:1-clamp((q-.88)/.12); o=Math.min(fin,fout); y=0 } } else if(i===bi){o=e; y=Y[i]} else if(i<bi){ y=Y[i]; const mob=innerWidth<761, dim=i===bi-1?1-(1-(mob?.26:.32))*e:(mob?(i===bi-2?.26*(1-e):0):.32), M=stM.b[i], vis=clamp((stM.top+M.t+y+M.h*.6-90)/(M.h*.6)); o=dim*vis*(endB?1-e:1) }
    S.el.style.opacity=o.toFixed(3); S.el.style.transform=`translateY(${y.toFixed(1)}px)`; S.el.style.visibility=o>0.005?'visible':'hidden';
    const n=S.words.length, lit=i<bi?n:i>bi?0:(S.B.end?n*clamp(q/.3):tl(n));
    S.words.forEach((w,j)=>{const a=clamp(lit-j); w.style.setProperty('--a',a.toFixed(3))});
    S.cards.forEach((c,ci)=>{ /* R15: tudo booleano — quando S.B.early era undefined, `on` virava undefined e classList.toggle('in',undefined) ALTERNAVA a classe a cada quadro (a carta piscava) */ const wOn=lit-S.words.indexOf(c.w)>.5||!!(S.B.early&&c.w===S.cards[0].w&&tq>.15), on=!!(i===bi&&(S.B.red?(lit-S.words.indexOf(c.w)>.5||!!(S.B.early&&c.w===S.cards[0].w&&tq>.15+ci*.18)):(wOn&&tq>ci*.7))), gone=i<bi||(i===bi&&q>.9), pre=c.d.classList.contains('pre')||c.d.dataset.pre;
      if(c.big){ // o tabuleiro surge aos poucos desde o início, desfocado, e fica nítido no bloco dele
        const bp=i<bi?1:clamp((bi+q)/(i+.35)), gb=i<bi||(i===bi&&q>.9); c.d.style.setProperty('--rv',bp.toFixed(3));
        c.d.style.opacity=gb?0:(.08+.92*Math.pow(bp,1.6)).toFixed(3); c.d.style.filter=innerWidth<761?'none':`blur(${((1-bp)*16).toFixed(1)}px)`; c.d.classList.add('in'); return }
      if(pre){ c.d.dataset.pre=1; c.d.classList.toggle('pre',!!(!on&&!gone&&i===bi)); c.d.classList.toggle('in',!!(i===bi&&!gone)); c.d.classList.toggle('out',!!gone); return }
      c.d.classList.toggle('in',!!(on&&!gone)); c.d.classList.toggle('out',!!gone) }) });
  stDots.forEach((d,i)=>d.classList.toggle('on',i===bi));
  // final: o logo grande voa para o lugar do logo do topo, o topo aparece e o peão surge no centro
  const last=N-1, E=ST[last], qe=bi===last?q:(bi<last?0:1), mv=sstep(clamp(qe/.18)), hd=bi===last?clamp((qe-.05)/.15):0;
  const big=E.el.querySelector('.st-logo'), sub=E.el.querySelector('.st-sub'), hl=$('#hlogot'), hs=$('#hlogos');
  const fly=(el,tg)=>{el.style.transform='none'; const a=el.getBoundingClientRect(), t=tg.getBoundingClientRect(), k=t.height/a.height; const dx=(t.left+t.width/2)-(a.left+a.width/2), dy=(t.top+t.height/2)-(a.top+a.height/2); el.style.transform=`translate(${dx*mv}px,${dy*mv}px) scale(${1+(k-1)*mv})`; el.style.opacity=mv>.98?0:1};
  if(bi===last&&big&&big.offsetParent){fly(big,hl); fly(sub,hs)}
  stSec.style.setProperty('--mv',(bi===last?mv:0).toFixed(3));
  const pk=bi===last?clamp((qe-.06)/.12):0; $('#stpick').style.opacity=pk.toFixed(3); $('#pickhand').style.opacity=pk.toFixed(3); $('#stpick').style.pointerEvents=pk>.5?'auto':'none';
  MC.storyLogo=bi===last&&mv>.98?1:0; MC.storyHead=hd; MC.storyPawn=bi===last?sstep(clamp(qe/.2)):0}
MC.storyHead=0; MC.storyPawn=0;

// ---------- transições entre seções ----------
const RVSEL='main > section > .label, main > section > h2, main > section > .lead2, main > section > p, .intro > *, .verbs > div, .deckrow, .igrid, .rgrid, .sgrid, .vgrid, .pwrap, .ings, .pot, .scratch > div, .tz-txt > *, .lista form, footer .credit';
const rvObs=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in'); rvObs.unobserve(en.target)}}),{rootMargin:'0px 0px -8% 0px'});
$$(RVSEL).forEach(el=>{ if(el.closest('.stage')||el.closest('#inicio')) return; const sib=[...el.parentElement.children].indexOf(el); el.classList.add('rv','d'+Math.min(3,sib%4)); rvObs.observe(el)});
// Reinos: um esmaece no lugar e o próximo surge por cima (sem a tela rolar entre eles)
function stageFade(sec){const r=sec.getBoundingClientRect(), H=MC.VH; if(r.bottom<0||r.top>H) return; const pr=sec.previousElementSibling, nx=sec.nextElementSibling;
  const a=pr&&pr.classList.contains('reino')?clamp(1-r.top/(H*.3)):clamp((H-r.top)/(H*.55)), b=1-clamp((prog(sec)-.72)/.17);
  const v=MC.reduce?1:Math.min(a,b), st=sec.querySelector('.stage'); st.style.setProperty('--stin',v.toFixed(3)); st.style.pointerEvents=v<.5?'none':''}

// ---------- coreografia do peão ----------
const sections=$$('main > section'), rail=$$('.rail a');
let stops=[];
function buildStops(){const mob=innerWidth<761; stops=[]; for(const s of sections){const k=(mob&&s.dataset.km)||s.dataset.k; if(!k) continue; const v=k.split(',').map(Number), top=s.offsetTop, h=s.offsetHeight, H=MC.VH;
  if(h>H*1.5){stops.push({y:top,k:v});stops.push({y:top+h-H,k:v})} else stops.push({y:Math.max(0,top+h/2-H/2),k:v})}}
buildStops(); addEventListener('resize',buildStops); addEventListener('load',buildStops); setTimeout(buildStops,1500);
function freeTarget(){const y=scrollY; let a=stops[0],b=stops[stops.length-1];
  if(y<=a.y) b=a; else if(y>=b.y) a=b; else for(let i=0;i<stops.length-1;i++){if(y>=stops[i].y&&y<=stops[i+1].y){a=stops[i];b=stops[i+1];break}}
  const t=a===b?0:sstep(clamp((y-a.y)/Math.max(1,b.y-a.y))), k=a.k.map((v,i)=>lerp(v,b.k[i],t));
  MC.free.sx=k[0]*innerWidth; MC.free.sy=k[1]*MC.VH; MC.free.hp=k[2]*MC.VH}
// peão ampliado ao clicar no peão da logo
const pz=$('#pzoom'); MC.zoom=false;
function pzOpen(){ const p=PAWNS.find(x=>x[0]===MC.pawn); $('#pzn').textContent=p[1]; pz.hidden=false; MC.zoom=true; document.documentElement.classList.add('locked'); setTimeout(()=>pz.querySelector('.mx').focus({preventScroll:true}),50)}
function pzClose(){ if(pz.hidden) return; pz.hidden=true; MC.zoom=false; document.documentElement.classList.remove('locked'); $('#dock').focus({preventScroll:true})}
$('#dock').addEventListener('click',pzOpen);
pz.addEventListener('click',e=>{ if(e.target.closest('[data-pzclose]')&&!(e.target.classList.contains('pz-bg')&&document.body.classList.contains('grab'))) pzClose()});
addEventListener('keydown',e=>{if(e.key==='Escape') pzClose()});
const sunEl=$('#sunfx'), dockEl=$('#dock'), pcSec=$('#peca'), pctxt=$('#pctxt'), pchint=$('#pchint'), tabSec=$('#tabuleiro'); let lastT=performance.now();
function frame(now){const dt=Math.max(0,Math.min(.05,(now-lastT)/1000)); lastT=now;
  const mid=MC.VH*.5; let act=sections[0]; for(const s of sections){const r=s.getBoundingClientRect(), ov=s.classList.contains('reino')&&s.previousElementSibling&&s.previousElementSibling.classList.contains('reino'); if(r.top<=(ov?MC.VH*.1:mid)&&r.bottom>0) act=s}
  let th=act.dataset.theme; if(act.id==='tabuleiro'&&(MC.boardOut||0)>.5) th='luz'; if(th!==MC.theme){MC.theme=th; if(th==='base') delete document.body.dataset.theme; else document.body.dataset.theme=th; MC.onTheme&&MC.onTheme()}
  rail.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+act.id));
  MC.mode=MC.zoom?'zoom':act.dataset.mode; {const top=$('.top'), sr=stSec.getBoundingClientRect(), inStory=sr.bottom>MC.VH*.5; const hv=inStory?MC.storyHead:1; top.classList.toggle('instory',inStory&&hv<.5); top.style.setProperty('--hv',hv.toFixed(3)); top.style.setProperty('--lv',MC.logoLanded?1:0); top.classList.toggle('nodock',MC.mode!=='dock'); } MC.p=prog(act); MC.slot=act.querySelector('[data-slot]'); MC.dock=dockEl.getBoundingClientRect();
  MC.baseVis=['hero','show','board','zoom','free','story'].includes(MC.mode)?1:0;
  // a peça: o peão sai da base e fica ao lado; depois entra o texto
  {const q=MC.mode==='show'?MC.p:0; MC.sep=MC.mode==='show'?sstep(clamp((q-.1)/.45)):0;
    const tq=MC.mode==='show'?clamp((q-.58)/.12):0; pctxt.style.opacity=tq.toFixed(3); pctxt.style.transform=`translateY(${((1-tq)*24).toFixed(1)}px)`;
    pchint.style.opacity=(MC.mode==='show'?clamp(q/.06)*(1-tq*.4):0).toFixed(3)}
  {const tr2=tabSec.getBoundingClientRect(); MC.boardIn=clamp((MC.VH-tr2.top)/MC.VH); MC.boardOut=clamp((MC.VH*.98-tr2.bottom)/(MC.VH*.6))}
  // chegada ao templo: sol nascente saindo do peão, nuvens entram e o site clareia
  {const tr3=tabSec.getBoundingClientRect(), on=tr3.top<MC.VH&&tr3.bottom>-MC.VH*.5, sf=sunEl.style;
   if(!on||MC.reduce){ if(sunEl.dataset.on){sf.opacity=0; delete sunEl.dataset.on} }
   else { const tp=prog(tabSec), sn=sstep(clamp((tp-.9)/.08)), bo=MC.boardOut||0, cl=sstep(clamp(bo*1.5+clamp((tp-.97)/.03)*.25)), fo=1-clamp((bo-.7)/.3);
     sunEl.dataset.on=1; sf.opacity=(Math.max(sn,cl)*fo).toFixed(3); const P=MC.pawnScr||{x:innerWidth*.8,y:MC.VH*.15};
     sf.setProperty('--sx',P.x.toFixed(0)+'px'); sf.setProperty('--sy',P.y.toFixed(0)+'px'); sf.setProperty('--sn',sn.toFixed(3)); sf.setProperty('--cl',cl.toFixed(3)); sf.setProperty('--ra',((now*.004)%360).toFixed(2)+'deg') } }
  MC.deckRect=act.id==='decks'?selDeck.querySelector('.stack').getBoundingClientRect():null;
  if(MC.mode==='free') MC.lift=.22; else MC.lift=0;
  freeTarget(); reinos.forEach(o=>updReino(o,now)); reinos.forEach(o=>stageFade(o.sec)); LENDAS.forEach(L=>updLenda(L,dt)); updLendTrack(); updStory(); updDuel(); updTrav(); updLimbo(now); tickHolo(dt);
  if(!MC.reduce){reinos.forEach(o=>{const r=o.sec.getBoundingClientRect(); if(r.bottom>0&&r.top<MC.VH) bgDraw(o,prog(o.sec),now,dt)}); ambDraw(dt)}
  const tr=tzs.getBoundingClientRect(); if(tr.bottom>0&&tr.top<MC.VH){const c=clamp(1-Math.abs((tr.top+tr.height/2)-MC.VH/2)/(MC.VH*.9)); const target=MC.reduce?-8:lerp(-30,-6,ease(c))+mxN*10;
    tzr+=(target-tzr)*(1-Math.exp(-dt*6)); tzf.style.setProperty('--try',tzr+'deg'); tzf.style.setProperty('--trx',(4-myN*8)+'deg'); strip.style.setProperty('--sx',(-mxN*60)+'px')}
  if(MC.mode==='fall'){ if(!wasLimbo&&!MC.reduce){lst.classList.remove('shake');void lst.offsetWidth;lst.classList.add('shake')} } wasLimbo=MC.mode==='fall';
  {const tb=$('#tabuleiro').getBoundingClientRect(); if(tb.bottom>0&&tb.top<MC.VH){const q=prog($('#tabuleiro')), ti=$('#tintro'), tt=$('#tabtxt');
    ti.style.opacity=(clamp((MC.VH-tb.top)/(MC.VH*.7))*(1-clamp((q-.08)/.05))).toFixed(3); ti.style.transform=`scale(${(1+q*.6).toFixed(3)})`;
    const a2=clamp((q-.15)/.07); tt.style.opacity=a2.toFixed(3); tt.style.transform=`translateY(${((1-a2)*30).toFixed(1)}px)`}}
  if(MC.mode==='board'){const c=Math.min(36,Math.floor(clamp((MC.p-.22)/.74)*36.999)); if(c!==lastCasa){lastCasa=c;$('#casa').innerHTML=String(c).padStart(2,'0')+'<small> / 36</small>';$('#esp').textContent=SP[c]||''}}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
MC.enter=()=>{};
// ===== R2 =====
// 1 parallax interno nas cartas sem recorte: a ilustração se move por dentro da moldura
{const mark=root=>root.querySelectorAll&&root.querySelectorAll('.layers').forEach(l=>l.classList.toggle('deep',!l.querySelector('.char')));
 mark(document); new MutationObserver(ms=>ms.forEach(m=>{const t=m.target; if(t.classList&&t.classList.contains('layers')) t.classList.toggle('deep',!t.querySelector('.char')); m.addedNodes.forEach(n=>{if(n.nodeType===1){ if(n.classList.contains('layers')) n.classList.toggle('deep',!n.querySelector('.char')); mark(n)}})})).observe(document.body,{childList:true,subtree:true})}
// 2 giroscópio: inclinar o celular mexe as cartas visíveis
{const touch=matchMedia('(hover:none)').matches||'ontouchstart' in window; if(false&&touch&&!MC.reduce&&window.DeviceOrientationEvent){ // R4c: giroscópio desligado (cartas tremiam ao abrir no celular)
  let b0=null, raf=0, gx=0, gy=0, fx=0, fy=0, on=false; const D=window.DeviceOrientationEvent, needs=typeof D.requestPermission==='function';
  const ask=()=>{D.requestPermission().then(r=>{ if(r==='granted') on=true; if(r==='granted'||r==='denied') removeEventListener('click',ask,true)}).catch(()=>{})};
  if(needs) addEventListener('click',ask,true); else on=true;
  const apply=()=>{raf=0; for(const st of holos){const r=st.el.getBoundingClientRect(), vis=r.bottom>0&&r.top<MC.VH&&r.width>0;
      if(!vis){ if(st.gyro){st.tx=st.ty=st.th=0; st.tpx=st.tpy=50; st.gyro=false} continue }
      st.gyro=true; st.tx=gx; st.ty=gy; st.tpx=50+gx*40; st.tpy=50+gy*40; st.th=Math.min(1,Math.hypot(gx,gy)*1.2)}};
  addEventListener('deviceorientation',e=>{ if(!on||e.beta==null) return; const ang=((window.orientation??screen.orientation?.angle??0)+360)%360, land=ang===90||ang===270, sg=ang===90?1:-1;
    const B=land?(e.gamma||0)*sg:e.beta, G=land?-(e.beta||0)*sg:(e.gamma||0);
    if(b0===null) b0=B; b0+=(B-b0)*.01; const dz=v=>Math.abs(v)<.12?0:(v-Math.sign(v)*.12)/.88, rx=dz(clamp(G/25,-1,1)), ry=dz(clamp((B-b0)/25,-1,1)); fx+=(rx-fx)*.12; fy+=(ry-fy)*.12; const nx=Math.abs(fx)<.02?0:fx, ny=Math.abs(fy)<.02?0:fy; if(Math.abs(nx-gx)<.008&&Math.abs(ny-gy)<.008) return; gx=nx; gy=ny; if(!raf) raf=requestAnimationFrame(apply)})}}
// arco curvo em loop (as peças giram num arco) — usado no "Em breve" (rodada 4)
function makeRing(st,items,dir=1,spd=1){ const N=items.length, step=360/N, prev=items.map(()=>({o:-1,t:'',z:-1}));
  let base=0, lastY=scrollY, lt=0, boost=0, R=900, run=false, raf=0;
  const readR=()=>{R=parseFloat(getComputedStyle(st).getPropertyValue('--R'))||900}; readR(); addEventListener('resize',readR);
  const draw=()=>items.forEach((it,i)=>{const a=((i*step+base)%360+540)%360-180, r=a*Math.PI/180, vis=Math.abs(a)<78, P=prev[i];
      const o=vis?Math.min(1,(78-Math.abs(a))/12):0, oS=o.toFixed(2); if(oS!==P.o){it.style.opacity=oS; P.o=oS}
      if(vis){const t=`translate(-50%,-50%) translateX(${(R*Math.sin(r)).toFixed(1)}px) perspective(900px) rotateY(${(-a*.75).toFixed(1)}deg) scale(${(1+(1-Math.cos(r))*.9).toFixed(3)})`; if(t!==P.t){it.style.transform=t; P.t=t}
        const z=Math.round(100-Math.abs(a)); if(z!==P.z){it.style.zIndex=z; P.z=z}}});
  const tick=now=>{ if(!run){raf=0; return} const dt=lt?Math.min(.05,(now-lt)/1000):0; lt=now; const dy=scrollY-lastY; lastY=scrollY; boost+=(Math.abs(dy)*.06-boost)*.2; base-=dir*(7*spd+boost*18)*dt; draw(); raf=requestAnimationFrame(tick)};
  draw(); if(!MC.reduce) new IntersectionObserver(es=>es.forEach(en=>{run=en.isIntersecting; if(run&&!raf){lt=0; lastY=scrollY; raf=requestAnimationFrame(tick)}}),{rootMargin:'150px'}).observe(st)}
// R5: em breve volta a ser uma galeria parada (grade maior), com o brilho de quase revelação

// 11 galeria: volta ao mosaico (R4d); clicar amplia a foto como as cartas
{const sec=document.getElementById('galeria'), mo=sec&&sec.querySelector('#gzspace'); if(mo){
  // R5: galeria em túnel — as fotos nascem no centro, crescem rumo às bordas com a rolagem e saem de cena
  [...mo.children].forEach(f=>mo.appendChild(f.cloneNode(true)));
  const gzH=sec.querySelector('.gz-head'), figs=[...mo.querySelectorAll('figure')], N=figs.length, GAP=700, PRE=1200, POST=1300;
  const pos=figs.map((f,i)=>{const a=i*2.39996+.6; return {a, ax:Math.cos(a), ay:Math.sin(a), o:-1, t:''}});
  figs.forEach((f,i)=>f.classList.add(i%3===1?'gz-v':'gz-h'));
  const gz=()=>{const r=sec.getBoundingClientRect(); if(r.bottom<0||r.top>MC.VH) return; const P=clamp(-r.top/Math.max(1,r.height-MC.VH)), W=innerWidth, H=MC.VH, mob=W<761;
    const sx=W*(mob?.3:.33), sy=H*(mob?.26:.27), cam=P*(N*GAP+PRE+POST); {const ho=(1-clamp((P-.03)/.07))+clamp((P-.94)/.05), hs=ho.toFixed(2); if(gzH.style.opacity!==hs) gzH.style.opacity=hs}
    figs.forEach((f,i)=>{const z=-(i*GAP)-PRE+cam, q=pos[i]; let o=clamp((z+3700)/900)*clamp((900-z)/450); if(MC.reduce) o=o>.05?1:0;
      const oS=o.toFixed(2); if(oS!==q.o){f.style.opacity=oS; f.style.visibility=o>.01?'visible':'hidden'; f.style.pointerEvents=o>.6?'auto':'none'; q.o=oS}
      if(o>.01){const t=`translate(-50%,-50%) translate3d(${(q.ax*sx).toFixed(1)}px,${(q.ay*sy).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(-q.ax*8).toFixed(2)}deg) rotateX(${(q.ay*5).toFixed(2)}deg)`; if(t!==q.t){f.style.transform=t; q.t=t}}})};
  MC.gz=gz; addEventListener('scroll',()=>requestAnimationFrame(gz),{passive:true}); addEventListener('resize',gz); gz();
  const gm=document.createElement('div'); gm.className='modal galm'; gm.id='galm'; gm.hidden=true; gm.setAttribute('role','dialog'); gm.setAttribute('aria-modal','true'); gm.setAttribute('aria-label','Foto da galeria');
  gm.innerHTML='<div class="mbg" data-close></div><img class="galm-img" alt="Foto do MythCaos na mesa"><button class="mx" type="button" aria-label="Fechar" data-close>×</button>'; document.body.appendChild(gm);
  const big=gm.querySelector('.galm-img');
  gm.addEventListener('click',e=>{if(e.target.closest('[data-close]')||MC.outside(e)) closeModal(gm)});
  figs.forEach(f=>{ f.setAttribute('role','button'); f.tabIndex=0; f.setAttribute('aria-label','Ampliar foto');
    const open=()=>{ const im=f.querySelector('img'), r=im.getBoundingClientRect(); big.src=im.currentSrc||im.src; openModal(gm);
      // sai do lugar da foto e cresce até o centro, como as cartas
      requestAnimationFrame(()=>{ const t=big.getBoundingClientRect(); if(!t.width||MC.reduce) return; const k=r.width/t.width;
        big.animate([{transform:`translate(${(r.left+r.width/2)-(t.left+t.width/2)}px,${(r.top+r.height/2)-(t.top+t.height/2)}px) scale(${k})`,opacity:.6},{transform:'none',opacity:1}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'}) }) };
    f.addEventListener('click',open); f.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault(); open()}}) })}}
// 6 em breve: as silhuetas acendem e apagam em loop
{const cards=[...document.querySelectorAll('#sgrid .scard')]; if(cards.length&&!MC.reduce){ // só acende as que estão à vista no arco
  const shown=()=>cards.filter(c=>+(c.parentElement.style.opacity||1)>.6);
  const pulse=()=>{const r=document.getElementById('sgrid').getBoundingClientRect(); if(r.bottom>0&&r.top<MC.VH){ const L=shown(); const c=L[Math.floor(Math.random()*L.length)]; if(c&&!c.classList.contains('lit')){c.classList.add('lit'); setTimeout(()=>c.classList.remove('lit'),2200)} } };
  setInterval(pulse,700)}}

})();

// menu do topo no celular
{const tm=document.getElementById('tmenu'), tp=document.querySelector('.top'); if(tm){tm.onclick=e=>{e.stopPropagation(); const o=!tp.classList.contains('menu-open'); tp.classList.toggle('menu-open',o); tm.setAttribute('aria-expanded',o)}; document.addEventListener('click',e=>{if(!e.target.closest('#tlinks')||e.target.closest('.tlink')){tp.classList.remove('menu-open'); tm.setAttribute('aria-expanded','false')}}); addEventListener('scroll',()=>{if(tp.classList.contains('menu-open')){tp.classList.remove('menu-open'); tm.setAttribute('aria-expanded','false')}},{passive:true})}}
{const lx=document.querySelector('#lead > .mx'), lb=document.querySelector('#lead .mbox'); if(lx&&lb) lb.prepend(lx)}

// ===== Rodada 4 =====
// 18 inscrição: o formulário dá lugar a uma confirmação; os outros formulários já mostram que a pessoa está na lista
{const paint=()=>{const L=MC.lead&&MC.lead.email?MC.lead:null, nm=L&&L.nome?', '+L.nome.trim().split(/\s+/)[0]:'';
   document.querySelectorAll('.joined .jn').forEach(e=>e.textContent=nm);
   const f=document.getElementById('form'), jl=document.querySelector('#lista .joined'); if(f&&jl){f.hidden=!!L; jl.hidden=!L}
   const lf=document.getElementById('leadf'), jm=document.querySelector('#lead .joined'); if(lf&&jm){const show=!!L&&!MC.afterLead; lf.hidden=show; jm.hidden=!show}};
 const po=MC.onLead; MC.onLead=()=>{po&&po(); paint()}; paint(); MC.paintJoined=paint;
 document.addEventListener('click',e=>{ if(e.target.closest('[data-lead]')) setTimeout(paint,0);
   const g=e.target.closest('[data-jgo]'); if(g){const m=g.closest('.modal'); const x=m&&m.querySelector('[data-close]'); x&&x.click()}})}

// 10 liquid glass: refração (filtro SVG no backdrop) só onde o navegador suporta (Chrome/Edge)
try{ if(false&&matchMedia('(pointer:fine)').matches&&navigator.userAgentData&&navigator.userAgentData.brands.some(b=>/Chromium/i.test(b.brand))) document.documentElement.classList.add('lgr') }catch(e){}

// R8: rastro do mouse em fluido (WebGL) — tinta na cor da lenda que é empurrada pelo mouse,
// gira (vorticidade), se espalha e evapora. Técnica clássica "stable fluids" na GPU:
// advecção → vorticidade → divergência → pressão (Jacobi) → projeção. Só desktop.
window.MC_FLUID=function(cv,opts){
  const O=Object.assign({sim:128,dye:768,velDiss:1.4,dyeDiss:2.6,pressure:.8,iters:18,curl:14,radius:.09,force:3600,amount:.14},opts||{});
  const gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});
  if(!gl) return null;
  const hf=gl.getExtension('OES_texture_half_float'), hl=gl.getExtension('OES_texture_half_float_linear');
  if(!hf||!hl) return null;
  const HF=hf.HALF_FLOAT_OES;
  const sh=(t,s)=>{const o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o); if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o};
  const VS=sh(gl.VERTEX_SHADER,`precision highp float;attribute vec2 aP;varying vec2 vUv,vL,vR,vT,vB;uniform vec2 tx;
    void main(){vUv=aP*.5+.5;vL=vUv-vec2(tx.x,0.);vR=vUv+vec2(tx.x,0.);vT=vUv+vec2(0.,tx.y);vB=vUv-vec2(0.,tx.y);gl_Position=vec4(aP,0.,1.);}`);
  const P=src=>{const p=gl.createProgram(); gl.attachShader(p,VS); gl.attachShader(p,sh(gl.FRAGMENT_SHADER,'precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform vec2 tx;'+src)); gl.bindAttribLocation(p,0,'aP'); gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw gl.getProgramInfoLog(p); const u={}; const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS); for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i).name; u[a]=gl.getUniformLocation(p,a)} return {p,u}};
  let prg;
  try{ prg={
    splat:P(`uniform sampler2D uT;uniform float ar,r;uniform vec3 c;uniform vec2 pt;void main(){vec2 p=vUv-pt;p.x*=ar;vec3 s=exp(-dot(p,p)/r)*c;gl_FragColor=vec4(texture2D(uT,vUv).xyz+s,1.);}`),
    adv:P(`uniform sampler2D uV,uS;uniform float dt,ds;void main(){vec2 co=vUv-dt*texture2D(uV,vUv).xy*tx;gl_FragColor=texture2D(uS,co)/(1.+ds*dt);}`),
    div:P(`uniform sampler2D uV;void main(){float L=texture2D(uV,vL).x,R=texture2D(uV,vR).x,T=texture2D(uV,vT).y,B=texture2D(uV,vB).y;vec2 C=texture2D(uV,vUv).xy;
      if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}`),
    curl:P(`uniform sampler2D uV;void main(){float L=texture2D(uV,vL).y,R=texture2D(uV,vR).y,T=texture2D(uV,vT).x,B=texture2D(uV,vB).x;gl_FragColor=vec4(.5*(R-L-T+B),0.,0.,1.);}`),
    vort:P(`uniform sampler2D uV,uC;uniform float cs,dt;void main(){float L=texture2D(uC,vL).x,R=texture2D(uC,vR).x,T=texture2D(uC,vT).x,B=texture2D(uC,vB).x,C=texture2D(uC,vUv).x;
      vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+1e-4;f*=cs*C;f.y*=-1.;vec2 v=texture2D(uV,vUv).xy+f*dt;gl_FragColor=vec4(clamp(v,-1000.,1000.),0.,1.);}`),
    clr:P(`uniform sampler2D uT;uniform float v;void main(){gl_FragColor=v*texture2D(uT,vUv);}`),
    prs:P(`uniform sampler2D uP,uD;void main(){float L=texture2D(uP,vL).x,R=texture2D(uP,vR).x,T=texture2D(uP,vT).x,B=texture2D(uP,vB).x,d=texture2D(uD,vUv).x;gl_FragColor=vec4((L+R+B+T-d)*.25,0.,0.,1.);}`),
    grd:P(`uniform sampler2D uP,uV;void main(){float L=texture2D(uP,vL).x,R=texture2D(uP,vR).x,T=texture2D(uP,vT).x,B=texture2D(uP,vB).x;vec2 v=texture2D(uV,vUv).xy-vec2(R-L,T-B);gl_FragColor=vec4(v,0.,1.);}`),
    show:P(`uniform sampler2D uT;uniform float k;void main(){vec3 c=texture2D(uT,vUv).rgb*k;c=c/(1.+c*.35);float a=clamp(max(c.r,max(c.g,c.b)),0.,1.);gl_FragColor=vec4(min(c,vec3(a)),a);}`)
  }}catch(e){ return null }
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),gl.STATIC_DRAW);
  gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);
  const fbo=(w,h)=>{const t=gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,t);
    [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR)); [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,HF,null); const f=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,f); gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
    gl.viewport(0,0,w,h); gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
    return {t,f,w,h,tx:[1/w,1/h],at(i){gl.activeTexture(gl.TEXTURE0+i); gl.bindTexture(gl.TEXTURE_2D,t); return i}}};
  const dbl=(w,h)=>{let a=fbo(w,h),b=fbo(w,h); return {w,h,tx:a.tx,get r(){return a},get w_(){return b},swap(){const t=a;a=b;b=t}}};
  const res=r=>{const ar=gl.drawingBufferWidth/gl.drawingBufferHeight, lo=Math.round(r), hi=Math.round(r*(ar<1?1/ar:ar)); return ar>1?[hi,lo]:[lo,hi]};
  let vel,dye,dv,cu,pr;
  const build=()=>{const [sw,shh]=res(O.sim), [dw,dh]=res(O.dye); vel=dbl(sw,shh); dye=dbl(dw,dh); dv=fbo(sw,shh); cu=fbo(sw,shh); pr=dbl(sw,shh)};
  const resize=()=>{const W=Math.round(innerWidth*Math.min(devicePixelRatio,1)), H=Math.round(innerHeight*Math.min(devicePixelRatio,1)); if(cv.width!==W||cv.height!==H){cv.width=W; cv.height=H; build()}};
  const use=(pg,tx)=>{gl.useProgram(pg.p); gl.uniform2f(pg.u.tx,tx[0],tx[1]); return pg.u};
  const blit=t=>{ if(t){gl.viewport(0,0,t.w,t.h); gl.bindFramebuffer(gl.FRAMEBUFFER,t.f)} else {gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER,null)} gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0)};
  resize(); addEventListener('resize',resize);
  let col=[1,.2,.15];
  const splat=(x,y,dx,dy,c)=>{const ar=cv.width/cv.height, r=O.radius/100*(ar>1?ar:1);
    let u=use(prg.splat,vel.tx); gl.uniform1i(u.uT,vel.r.at(0)); gl.uniform1f(u.ar,ar); gl.uniform2f(u.pt,x,y); gl.uniform3f(u.c,dx,dy,0); gl.uniform1f(u.r,r); blit(vel.w_); vel.swap();
    u=use(prg.splat,dye.tx); gl.uniform1i(u.uT,dye.r.at(0)); gl.uniform3f(u.c,c[0],c[1],c[2]); blit(dye.w_); dye.swap()};
  const step=dt=>{ gl.disable(gl.BLEND);
    let u=use(prg.curl,vel.tx); gl.uniform1i(u.uV,vel.r.at(0)); blit(cu);
    u=use(prg.vort,vel.tx); gl.uniform1i(u.uV,vel.r.at(0)); gl.uniform1i(u.uC,cu.at(1)); gl.uniform1f(u.cs,O.curl); gl.uniform1f(u.dt,dt); blit(vel.w_); vel.swap();
    u=use(prg.div,vel.tx); gl.uniform1i(u.uV,vel.r.at(0)); blit(dv);
    u=use(prg.clr,vel.tx); gl.uniform1i(u.uT,pr.r.at(0)); gl.uniform1f(u.v,O.pressure); blit(pr.w_); pr.swap();
    u=use(prg.prs,vel.tx); gl.uniform1i(u.uD,dv.at(0)); for(let i=0;i<O.iters;i++){gl.uniform1i(u.uP,pr.r.at(1)); blit(pr.w_); pr.swap()}
    u=use(prg.grd,vel.tx); gl.uniform1i(u.uP,pr.r.at(0)); gl.uniform1i(u.uV,vel.r.at(1)); blit(vel.w_); vel.swap();
    u=use(prg.adv,vel.tx); gl.uniform1i(u.uV,vel.r.at(0)); gl.uniform1i(u.uS,vel.r.at(0)); gl.uniform1f(u.dt,dt); gl.uniform1f(u.ds,O.velDiss); blit(vel.w_); vel.swap();
    u=use(prg.adv,vel.tx); gl.uniform1i(u.uV,vel.r.at(0)); gl.uniform1i(u.uS,dye.r.at(1)); gl.uniform1f(u.dt,dt); gl.uniform1f(u.ds,O.dyeDiss); blit(dye.w_); dye.swap() };
  const show=()=>{const u=use(prg.show,dye.tx); gl.uniform1i(u.uT,dye.r.at(0)); gl.uniform1f(u.k,1); gl.clearColor(0,0,0,0); gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.clear(gl.COLOR_BUFFER_BIT); blit(null)};
  let raf=0,lt=0,last=0,px=-1,py=-1,pend=[];
  const loop=now=>{ const dt=Math.min(.033,lt?(now-lt)/1000:.016); lt=now;
    pend.forEach(a=>splat(...a)); pend.length=0; step(dt); show();
    if(now-last<3800) raf=requestAnimationFrame(loop); else {raf=0; lt=0; gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT); cv.classList.remove('on')} };
  return {
    color(hex){const m=/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec((hex||'').trim()); if(m) col=[1,2,3].map(i=>parseInt(m[i],16)/255)},
    move(x,y){ const W=innerWidth,H=innerHeight; if(px<0){px=x;py=y; return} const dx=(x-px)/W, dy=(y-py)/H; px=x; py=y; if(!dx&&!dy) return;
      const sp=Math.min(1,Math.hypot(dx,dy)*40), k=O.amount*(.45+.55*sp);
      pend.push([x/W,1-y/H,dx*O.force,-dy*O.force,[col[0]*k,col[1]*k,col[2]*k]]); last=performance.now(); cv.classList.add('on'); if(!raf) raf=requestAnimationFrame(loop)},
    leave(){px=-1;py=-1},
    gl
  };
};

// 1 cursor próprio + rastro quase imperceptível que deforma o que passa por baixo (lente líquida na cor da lenda)
{const fine=matchMedia('(pointer:fine)').matches&&matchMedia('(hover:hover)').matches;
 if(fine&&!MC.reduce){ const de=document.documentElement; de.classList.add('cur'); MC.trailN=0;
  const cur=document.createElement('div'); cur.id='mcur'; cur.setAttribute('aria-hidden','true'); cur.innerHTML='<svg viewBox="0 0 22 22"><path d="M2.5 2 L19.5 9.6 L11.4 11.6 L8.9 19.8 Z"/></svg>';
  // R5: rastro de fumaça na cor da lenda — fita suave com mola, afina e some (canvas em meia resolução + desfoque na GPU)
  const fcv=document.createElement('canvas'); fcv.id='mfluid'; fcv.setAttribute('aria-hidden','true'); document.body.appendChild(fcv);
  let FL=null; try{ FL=window.MC_FLUID(fcv) }catch(e){ FL=null } if(!FL) fcv.remove(); MC.fluid=FL;
  const tr=document.createElement('canvas'); tr.id='mtrail'; tr.setAttribute('aria-hidden','true'); const tx=tr.getContext('2d');
  document.body.append(tr,cur);
  let mx=-200,my=-200,raf=0,W=0,H=0,acc='#e0362a',lastMove=0; const S=.5, pts=[], fo={x:-200,y:-200,vx:0,vy:0};
  const size=()=>{W=innerWidth; H=innerHeight; tr.width=Math.ceil(W*S); tr.height=Math.ceil(H*S)}; size(); addEventListener('resize',size);
  const readAcc=()=>{acc=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||acc; FL&&FL.color(acc)}; readAcc(); MC.onAccent=c=>{acc=c; FL&&FL.color(c)}; const _ot=MC.onTheme; MC.onTheme=()=>{_ot&&_ot(); readAcc()};
  const loop=now=>{ // mola: o rastro segue o mouse com atraso e curva natural
    fo.vx+=(mx-fo.x)*.16; fo.vy+=(my-fo.y)*.16; fo.vx*=.66; fo.vy*=.66; fo.x+=fo.vx; fo.y+=fo.vy;
    const sp=Math.hypot(fo.vx,fo.vy); if(now-lastMove<120||sp>.4) pts.unshift({x:fo.x,y:fo.y,l:1,w:Math.min(1,.35+sp/22)});
    for(const p of pts) p.l-=.028; while(pts.length&&pts[pts.length-1].l<=0) pts.pop(); if(pts.length>48) pts.length=48;
    tx.setTransform(S,0,0,S,0,0); tx.clearRect(0,0,W,H);
    if(pts.length>2){ tx.lineCap='round'; tx.lineJoin='round'; tx.strokeStyle=acc; tx.fillStyle=acc;
      for(let k=0;k<2;k++){ // camada larga (fumaça) e núcleo
        for(let i=1;i<pts.length-1;i++){const a=pts[i-1], b=pts[i], c=pts[i+1], f=1-i/pts.length;
          tx.globalAlpha=(k?.55:.22)*b.l*f; tx.lineWidth=(k?14:46)*b.w*(.25+.75*f);
          tx.beginPath(); tx.moveTo((a.x+b.x)/2,(a.y+b.y)/2); tx.quadraticCurveTo(b.x,b.y,(b.x+c.x)/2,(b.y+c.y)/2); tx.stroke()}}
      tx.globalAlpha=.5*pts[0].l; tx.beginPath(); tx.arc(pts[0].x,pts[0].y,16*pts[0].w,0,6.283); tx.fill(); tx.globalAlpha=1 }
    if(pts.length||sp>.3){raf=requestAnimationFrame(loop)} else {raf=0; tr.classList.remove('on')} };
  addEventListener('pointermove',e=>{ if(e.pointerType&&e.pointerType!=='mouse') return; mx=e.clientX; my=e.clientY; lastMove=performance.now(); MC.trailN++; cur.style.transform=`translate3d(${mx-2.5}px,${my-2}px,0)`; cur.style.opacity=1; if(FL){FL.move(mx,my); return} tr.classList.add('on'); if(fo.x<-100){fo.x=mx; fo.y=my} if(!raf) raf=requestAnimationFrame(loop)},{passive:true});
  const HOV='a,button,[role="button"],label,select,.lv-card,.scard,.rel,.ring-item,.plv,.ing,[data-holo],.grv-fr';
  document.addEventListener('pointerover',e=>cur.classList.toggle('on',!!e.target.closest(HOV)));
  addEventListener('pointerdown',()=>cur.classList.add('down')); addEventListener('pointerup',()=>cur.classList.remove('down'));
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget){cur.style.opacity=0; tr.classList.remove('on'); FL&&FL.leave()}}) }}
