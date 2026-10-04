/* Engine: audio, captions, lip-sync, guide character, progress, decode cards. Globals injected by build.py: DATA, NARR, AUDIO, VAUDIO */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const V=Object.fromEntries(DATA.verses.map(v=>[v.id,v])), T=Object.fromEntries(DATA.terms.map(t=>[t.id,t]));
const LEVELS=['Prastāvanā (Opening)','Buddhi (Intellect)','Samāja (Society)','Ātman (Self)','Samāpana (Close)'];
const RANKS=['Jijñāsu · seeker','Śiṣya · student','Vidvān · learner','Paṇḍita · scholar','Ācārya · teacher'];
const SHAWL=['#c9b27a','#c97b3a','#b5481e','#7a2e1d','#d4a017'];
const S={idx:0,sound:false,muted:false,auto:false,seen:new Set(),quizPassed:false,level:0,ended:false};
const SCENES=window.SCENES=[]; const au=new Audio(), vau=new Audio(); au.preload=vau.preload='auto';
let ctx=null,analyser=null,buf=null,raf=0,blinkT=0,capW=[],capCum=[],capTotal=0,wobble=false;

/* ---------- audio + lip sync ---------- */
function wire(a){
  try{ if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)(); analyser=ctx.createAnalyser(); analyser.fftSize=512; buf=new Uint8Array(analyser.fftSize); analyser.connect(ctx.destination);}
    if(!a._wired){ctx.createMediaElementSource(a).connect(analyser); a._wired=true;}
    if(ctx.state==='suspended') ctx.resume();
  }catch(e){wobble=true;}
}
function mouthLoop(){
  const m=$('#mouth'); let open=0;
  const playing=(!au.paused&&!au.ended)||(!vau.paused&&!vau.ended);
  if(playing){
    if(analyser&&!wobble){analyser.getByteTimeDomainData(buf);let s=0;for(const v of buf){const d=(v-128)/128;s+=d*d;} open=Math.min(1,Math.sqrt(s/buf.length)*5);} else open=.4+.4*Math.sin(Date.now()/90);
  }
  if(m) m.setAttribute('ry',(1.5+open*9).toFixed(2));
  if(!au.paused&&capTotal) litCaption(au.currentTime/(au.duration||1));
  raf=requestAnimationFrame(mouthLoop);
}
function blink(){const e=$$('#char .eye');e.forEach(x=>x.setAttribute('ry','.6'));setTimeout(()=>e.forEach(x=>x.setAttribute('ry','5')),130);blinkT=setTimeout(blink,2200+Math.random()*3000);}

/* ---------- caption ---------- */
function setCaption(text){
  const cap=$('#cap'); cap.innerHTML=''; capW=[]; capCum=[]; let acc=0;
  text.split(/\s+/).forEach((w,i,arr)=>{const sp=document.createElement('span');sp.textContent=w;cap.appendChild(sp);cap.appendChild(document.createTextNode(i<arr.length-1?' ':''));capW.push(sp);acc+=w.length+1;capCum.push(acc);});
  capTotal=acc;
}
function litCaption(p){const t=p*capTotal;capW.forEach((s,i)=>{s.className=capCum[i]<=t?'on':(capCum[i-1]||0)<=t?'cur':'';});}
function react(t,mood){const r=$('#react');r.textContent=t||'';if(mood)setMood(mood);}
function setMood(m){const c=$('#char');if(c)c.dataset.mood=m||'neutral';}

/* ---------- narration ---------- */
function speak(id){
  const text=NARR[id]||''; setCaption(text); document.body.classList.toggle('silent',!S.sound);
  au.pause(); vau.pause(); $('#nextBtn').classList.remove('pulse');
  if(S.sound&&!S.muted&&AUDIO[id]){ au.src=AUDIO[id]; wire(au); au.currentTime=0; au.play().catch(()=>{litCaption(1);}); }
  else litCaption(S.sound?0:1);
}
au.addEventListener('ended',()=>{litCaption(1);$('#nextBtn').classList.add('pulse'); if(S.auto&&S.idx<SCENES.length-1) setTimeout(()=>{if(au.ended)go(S.idx+1);},1800);});
function stopAll(){au.pause();vau.pause();$$('.vline.playing').forEach(x=>x.classList.remove('playing'));litCaption(1);}

/* ---------- verse audio ---------- */
let chain=null;
function playClip(key,lineEl){
  const src=VAUDIO[key]; if(!src||!S.sound||S.muted){react(S.sound?'(muted)':'Audio is off. Re-enter with sound to hear the verse.');return Promise.resolve();}
  au.pause(); vau.pause(); vau.src=src; wire(vau); vau.currentTime=0;
  $$('.vline.playing').forEach(x=>x.classList.remove('playing')); if(lineEl)lineEl.classList.add('playing');
  return new Promise(res=>{const done=()=>{vau.removeEventListener('ended',done);vau.removeEventListener('pause',done);if(lineEl)lineEl.classList.remove('playing');res();};vau.addEventListener('ended',done);vau.addEventListener('pause',done);vau.play().catch(done);});
}
async function playVerse(vid){
  const v=V[vid]||T[vid]; const token=chain={}; const lines=v.lines||[null];
  const card=document.querySelector(`.card[data-v="${vid}"]`);
  for(let i=0;i<lines.length;i++){ if(chain!==token)return; const el=card&&card.querySelectorAll('.vline')[i]; await playClip(V[vid]?`v_${vid}_${i}`:`t_${vid}`,el); }
}
window.playVerse=playVerse;


/* ---------- grammar: tables, transliteration, word blocks ---------- */
const G=GRAMMAR; const CASEKEYS=['nom','acc','ins','dat','abl','gen','loc','voc']; const NUMN=['Singular','Dual','Plural'];
const CMAP={k:'क',kh:'ख',g:'ग',gh:'घ','ṅ':'ङ',c:'च',ch:'छ',j:'ज',jh:'झ','ñ':'ञ','ṭ':'ट','ṭh':'ठ','ḍ':'ड','ḍh':'ढ','ṇ':'ण',t:'त',th:'थ',d:'द',dh:'ध',n:'न',p:'प',ph:'फ',b:'ब',bh:'भ',m:'म',y:'य',r:'र',l:'ल',v:'व','ś':'श','ṣ':'ष',s:'स',h:'ह'};
const VMAP={a:['अ',''],'ā':['आ','ा'],i:['इ','ि'],'ī':['ई','ी'],u:['उ','ु'],'ū':['ऊ','ू'],'ṛ':['ऋ','ृ'],'ṝ':['ॠ','ॄ'],e:['ए','े'],ai:['ऐ','ै'],o:['ओ','ो'],au:['औ','ौ']};
function toDev(src){
  const s=src.normalize('NFC'); const out=[]; let i=0; const toks=[];
  while(i<s.length){
    const two=s.slice(i,i+2), one=s[i];
    if(two==='ai'||two==='au'){toks.push(['V',two]);i+=2;continue;}
    if(CMAP[two]&&two.length===2){toks.push(['C',two]);i+=2;continue;}
    if(CMAP[one]){toks.push(['C',one]);i++;continue;}
    if(VMAP[one]){toks.push(['V',one]);i++;continue;}
    if(one==='ṃ'||one==='ṁ'){toks.push(['M','ं']);i++;continue;} if(one==='ḥ'){toks.push(['M','ः']);i++;continue;}
    toks.push(['O',one]);i++;
  }
  for(let k=0;k<toks.length;k++){const [t,v]=toks[k];
    if(t==='C'){const nx=toks[k+1]; if(nx&&nx[0]==='V'){out.push(CMAP[v]+VMAP[nx[1]][1]);k++;} else out.push(CMAP[v]+'्');}
    else if(t==='V')out.push(VMAP[v][0]); else out.push(v);}
  return out.join('');
}
function cellHtml(txt){ if(txt==='—')return '—'; return txt.split(' / ').map(f=>`<span class="fi">${esc(f)}</span><span class="fd">${esc(toDev(f))}</span>`).join(' / '); }
const CN={nom:['1','Nominative','prathamā','the doer'],acc:['2','Accusative','dvitīyā','the object / goal'],ins:['3','Instrumental','tṛtīyā','by, with'],dat:['4','Dative','caturthī','to, for'],abl:['5','Ablative','pañcamī','from (source)'],gen:['6','Genitive','ṣaṣṭhī','of'],loc:['7','Locative','saptamī','in, on, at'],voc:['8','Vocative','sambodhana','O …!']};
function gtable(pdId,hit,alt,gk,opts){
  opts=opts||{}; const P=G.paradigms[pdId]; if(!P)return ''; const keys=Object.keys(P.forms); gk=keys.includes(gk)?gk:keys[0];
  const hs=new Set((hit||[]).map(x=>x.join(','))), as=new Set((alt||[]).map(x=>x.join(',')));
  let h=`<div class="gt" data-pd="${esc(pdId)}" data-hit='${JSON.stringify(hit||[])}' data-alt='${JSON.stringify(alt||[])}' data-gk="${gk}">`;
  if(keys.length>1){h+=`<div class="gtabs" role="group" aria-label="Gender">`+keys.map(k=>`<button class="btn small" data-gtgk="${k}" aria-pressed="${k===gk}">${{m:'Masculine',n:'Neuter',f:'Feminine'}[k]}</button>`).join('')+`</div>`;}
  const rows=P.forms[gk];
  if(P.kind==='noun'){
    h+=`<table class="gtab"><caption>${esc(P.stem)} · ${esc(P.pattern)}${keys.length===1&&{m:1,f:1,n:1}[P.gender]?' · '+{m:'masculine',f:'feminine',n:'neuter'}[P.gender]:''}</caption><thead><tr><th scope="col">Case</th>${NUMN.map(n=>`<th scope="col">${n}</th>`).join('')}</tr></thead><tbody>`;
    CASEKEYS.forEach((c,r)=>{const m=CN[c];h+=`<tr data-c="${c}"><th scope="row"><span class="cn">${m[0]} ${m[1]}</span><span class="cs">${m[2]} · ${m[3]}</span></th>`;
      for(let n=0;n<3;n++){const k=r+','+n;h+=`<td data-r="${r}" data-n="${n}" class="${hs.has(k)?'hit':as.has(k)?'alt':''}" tabindex="0">${cellHtml(rows[r][n])}</td>`;}h+='</tr>';});
    h+='</tbody></table>';
  } else {
    h+=`<table class="gtab"><caption>${esc(P.root)} (${esc(P.meaning)}) · ${esc(P.tense)} · ${esc(P.voice)} · ${esc(P.gana)}</caption><thead><tr><th scope="col">Person</th>${NUMN.map(n=>`<th scope="col">${n}</th>`).join('')}</tr></thead><tbody>`;
    ['prathama · 3rd (he, they)','madhyama · 2nd (you)','uttama · 1st (I, we)'].forEach((p,r)=>{h+=`<tr data-c="verb"><th scope="row"><span class="cn">${p}</span></th>`;
      for(let n=0;n<3;n++){const k=r+','+n;h+=`<td data-r="${r}" data-n="${n}" class="${hs.has(k)?'hit':''}" tabindex="0">${cellHtml(rows[r][n])}</td>`;}h+='</tr>';});
    h+='</tbody></table>';
  }
  if(P.note)h+=`<p class="gnote">${esc(P.note)}</p>`;
  h+=`<p class="gcap" aria-live="polite">${opts.cap||'Tap any cell to see what that form means.'}</p></div>`;
  return h;
}
function cellMeaning(gt,r,n){
  const P=G.paradigms[gt.dataset.pd];
  if(P.kind==='noun'){const c=CASEKEYS[r],m=CN[c];const num=['one','two','many'][n];return `<b>${m[1]} ${NUMN[n].toLowerCase()}</b> (${m[2]}): ${m[3]}, ${num}. Question: ${(G.cases[r].q)}`;}
  const t=P.tense.split(' (')[0];return `<b>${t}, ${['3rd','2nd','1st'][r]} person ${NUMN[n].toLowerCase()}</b> of ${P.root}.`;
}
function posPill(ent){return `<span class="pill">${esc(ent.pos[0].toUpperCase()+ent.pos.slice(1))}</span>`;}
function wordGram(ent,open){
  let h='';
  if(ent.pos==='composite'){
    h+=`<p><b>This entry holds ${ent.multi.length} words:</b></p>`;
    ent.multi.forEach(p=>{h+=`<div class="gsub">`+wordGram(p,false)+`</div>`;});
    return h;
  }
  h+=`<div class="gram">${posPill(ent)}`;
  if(ent.case)h+=`<span class="pill c" data-c="${ent.case}">${esc(CN[ent.case][1])} · ${esc(NUMN[NUMS(ent.num)].toLowerCase())}${ent.gen?' · '+({m:'masculine',f:'feminine',n:'neuter'}[ent.gen]):''}</span>`;
  if(ent.person)h+=`<span class="pill">${esc(G.paradigms[ent.pd].tense.split(' (')[0])} · ${{3:'3rd',2:'2nd',1:'1st'}[ent.person]} person · ${esc(NUMN[NUMS(ent.num)].toLowerCase())}</span>`;
  if(ent.stem)h+=`<span class="pill">stem: ${esc(ent.stem)}</span>`;
  if(ent.root)h+=`<span class="pill">root: ${esc(ent.root)}</span>`;
  h+=`</div>`;
  if(ent.form&&ent.pos!=='verb'&&ent.pos!=='noun')h+='';
  if(ent.use)h+=`<p class="guse"><b>In this verse:</b> ${esc(ent.use)}</p>`;
  if(ent.cmp)h+=`<p class="gnote"><b>Built from:</b> ${esc(ent.cmp)}</p>`;
  if(ent.note)h+=`<p class="gnote">${esc(ent.note)}</p>`;
  if(ent.pd){h+=`<details class="gdet" ${open?'open':''}><summary>${ent.pos==='verb'?'Full conjugation table':'Full declension table'} <span class="gnote">(the form used here is highlighted)</span></summary>`+gtable(ent.pd,ent.hit,ent.alt,ent.gk||ent.gen)+`</details>`;}
  if(ent.case)h+=`<button class="btn small" data-guide="cases:${ent.case}">What does the ${esc(CN[ent.case][1].toLowerCase())} case do?</button> `;
  if(ent.pos==='verb')h+=`<button class="btn small" data-guide="para:${esc(ent.pd)}">All verb tables</button>`;
  return h;
}
const NUMS=n=>({sg:0,du:1,pl:2}[n]||0);

/* ---------- decode cards ---------- */
const CONF={ok:['●','Verified against a source'],mid:['◐','Recognised verse; wording may differ'],low:['○','Not matched to a source']};
function decodeCard(vid){
  const v=V[vid]; const c=CONF[v.conf];
  let h=`<article class="card" data-v="${v.id}"><div class="chead"><span class="vid">${esc(v.id)}</span><h3>${esc(v.short)}</h3><span class="badge conf-${v.conf}" title="${esc(v.confNote)}">${c[0]} ${c[1]}</span></div>`;
  h+=`<p class="src">Source: ${esc(v.source)} · heard at ${esc(v.time)}</p>`;
  v.lines.forEach((l,i)=>{
    h+=`<div class="vline"><button class="play" data-play="${v.id}:${i}" aria-label="Play line ${i+1} of ${esc(v.id)}">▶</button><div><div class="dev">${esc(l.dev)}</div><div class="iast">${esc(l.iast)}</div></div><div class="chips">`;
    l.words.forEach((w,j)=>{h+=`<button class="wchip" aria-pressed="false" data-vw="${v.id}:${i}:${j}"><span class="wd">${esc(w.d)}</span><span class="wt">${esc(w.t)}</span></button>`;});
    h+=`</div></div>`;
  });
  h+=`<div class="wdetail" aria-live="polite">Tap any word to unpack its meaning and root.</div>`;
  h+=`<div class="row2"><button class="btn small" data-playall="${v.id}">▶ Play whole verse</button></div>`;
  h+=`<details class="tbl"><summary>Word-by-word table</summary><table class="wt"><tr><th>Word</th><th>Meaning</th><th>Grammar</th><th>Root / build</th></tr>`;
  v.lines.forEach((l,li)=>l.words.forEach((w,wi)=>{const g=G.words[`${v.id}:${li}:${wi}`];const gl=g?(g.pos==='composite'?g.multi.map(p=>p.label||p.pos).join(' + '):(g.label||g.pos)+(g.pos&&g.label&&g.pos!==g.label&&!/^(indecl)/.test(g.label)?' ('+g.pos+')':'')):'—';h+=`<tr><td>${esc(w.d)}<br><span class="iast" style="font-size:.8rem">${esc(w.t)}</span></td><td>${esc(w.m)}</td><td>${esc(gl)}</td><td>${esc(w.r||'—')}</td></tr>`;}));
  h+=`</table></details>`;
  if(v.sandhi&&v.sandhi.length){h+=`<div class="sec">How the words fused (sandhi)</div><ul class="sandhi">`+v.sandhi.map(s=>`<li><code>${esc(s.from)}</code> → <code>${esc(s.to)}</code>: ${esc(s.rule)}</li>`).join('')+`</ul>`;}
  h+=`<p class="meaning"><b>Whole meaning:</b> ${esc(v.meaning)}</p><p class="why"><b>Why he quoted this:</b> ${esc(v.why)}</p><p class="confnote">${c[0]} ${esc(v.confNote)}</p></article>`;
  return h;
}
function termCard(tid){
  const t=T[tid];
  let h=`<article class="card" data-v="${t.id}"><div class="chead"><span class="vid">word</span><h3>${esc(t.iast)} <span class="dev" style="font-size:1.1em">${esc(t.dev)}</span></h3></div><div class="vline"><button class="play" data-play="${t.id}" aria-label="Play ${esc(t.iast)}">▶</button><div class="chips" style="grid-column:auto;margin:0">`;
  t.parts.forEach((p,j)=>{h+=`<button class="wchip" aria-pressed="false" data-tw="${t.id}:${j}"><span class="wd">${esc(p.d)}</span><span class="wt">${esc(p.t)}</span></button>`;});
  h+=`</div></div><div class="wdetail" aria-live="polite">Tap a part to see its root.</div><p class="meaning"><b>Together:</b> ${esc(t.meaning)}</p><p class="why"><b>Why he said it:</b> ${esc(t.why)}</p></article>`;
  return h;
}
function showDetail(card,w,key){
  const d=$('.wdetail',card);
  d.innerHTML=`<div class="big">${esc(w.d)}</div><div class="iast">${esc(w.t)}</div><div><b>Means:</b> ${esc(w.m)}</div>`+(w.r?`<div><b>Root / build:</b> ${esc(w.r)}</div>`:'')+(w.n?`<div><b>Note:</b> ${esc(w.n)}</div>`:'')+(key&&G.words[key]?`<div class="gblock"><div class="sec" style="margin-top:.8em">Grammar of this word</div>${wordGram(G.words[key],true)}</div>`:'');
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  if(b.dataset.vw){const [id,li,wi]=b.dataset.vw.split(':');const card=b.closest('.card');$$('.wchip',card).forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');showDetail(card,V[id].lines[+li].words[+wi],`${id}:${li}:${wi}`);}
  else if(b.dataset.tw){const [id,wi]=b.dataset.tw.split(':');const card=b.closest('.card');$$('.wchip',card).forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');showDetail(card,T[id].parts[+wi]);}
  else if(b.dataset.play){const p=b.dataset.play.split(':');chain={};if(p.length===2)playClip(`v_${p[0]}_${p[1]}`,b.closest('.vline'));else playClip(`t_${p[0]}`,b.closest('.vline'));}
  else if(b.dataset.playall){playVerse(b.dataset.playall);}
  else if(b.dataset.gtgk){const gt=b.closest('.gt');const html=gtable(gt.dataset.pd,JSON.parse(gt.dataset.hit),JSON.parse(gt.dataset.alt),b.dataset.gtgk);gt.outerHTML=html;}
  else if(b.dataset.guide){window.EX.openGuide&&window.EX.openGuide(b.dataset.guide);}
});
function cellAct(td){const gt=td.closest('.gt');if(!gt)return;if(gt.classList.contains('covered'))td.classList.add('revealed');$('.gcap',gt).innerHTML=cellMeaning(gt,+td.dataset.r,+td.dataset.n);$$('td.sel',gt).forEach(x=>x.classList.remove('sel'));td.classList.add('sel');}
document.addEventListener('click',e=>{const td=e.target.closest('.gt td');if(td)cellAct(td);});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.gt td')){e.preventDefault();cellAct(e.target);}});

/* ---------- reusable widgets ---------- */
function quiz(root,qs,onDone){
  let i=0,score=0;
  const draw=()=>{
    if(i>=qs.length){root.innerHTML=`<p><b>Score: ${score} / ${qs.length}</b></p>`;onDone&&onDone(score,qs.length);return;}
    const q=qs[i];root.innerHTML=`<p class="sec">Question ${i+1} of ${qs.length}</p><p><b>${esc(q.q)}</b></p>`+q.o.map((o,k)=>`<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')+`<div class="expl" aria-live="polite"></div>`;
    $$('.opt',root).forEach(bt=>bt.onclick=()=>{
      const k=+bt.dataset.k; $$('.opt',root).forEach(x=>x.disabled=true); $$('.opt',root)[q.a].classList.add('right'); if(k!==q.a)bt.classList.add('wrong'); else score++;
      $('.expl',root).innerHTML=`<p class="${k===q.a?'ok':'bad'}">${k===q.a?'Correct.':'Not quite.'}</p><p>${esc(q.e)}</p><button class="btn small" id="qn">${i+1<qs.length?'Next question':'See result'}</button>`;
      react(k===q.a?'Well seen.':'Good try. Read the note.',k===q.a?'happy':'think'); $('#qn',root).onclick=()=>{i++;draw();};
    });
  };
  draw();
}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2600);}
function setAccessory(){const r=S.quizPassed?4:Math.min(S.level,3)+(S.level>=4?0:0); const sh=$('#shawl'); if(sh)sh.setAttribute('fill',SHAWL[Math.min(S.quizPassed?4:S.level,4)]);
  $('#rank').textContent=RANKS[S.quizPassed?4:Math.min(S.level,3)]; $('#rankSub').textContent='Level: '+LEVELS[S.level]; }

/* ---------- navigation ---------- */
function render(){
  const sc=SCENES[S.idx]; const st=$('#stage'); S.seen.add(S.idx);
  st.innerHTML=`<section class="scene" aria-labelledby="stt"><h2 id="stt">${S.idx+1}. ${esc(sc.title)}</h2>${sc.html}</section>`;
  sc.init&&sc.init($('.scene',st),{react,setMood,toast,playVerse,S,quizPassed:()=>{S.quizPassed=true;setAccessory();}});
  $$('#dots button').forEach((d,i)=>{d.className=(i===S.idx?'cur ':'')+(S.seen.has(i)?'seen':'');d.setAttribute('aria-current',i===S.idx?'step':'false');});
  $('#backBtn').disabled=S.idx===0; $('#nextBtn').disabled=S.idx===SCENES.length-1;
  react('',sc.mood||'neutral'); speak(sc.id); window.scrollTo({top:0,behavior:'smooth'});
}
function go(n){
  n=Math.max(0,Math.min(SCENES.length-1,n)); if(n===S.idx&&$('#stage').children.length)return; S.idx=n; chain={};
  const lv=SCENES[n].level; if(lv>S.level){S.level=lv;const c=$('#char');c.classList.remove('bow');void c.offsetWidth;c.classList.add('bow');toast('Level up: '+LEVELS[lv]);}
  setAccessory(); render();
}
document.addEventListener('keydown',e=>{
  const sc=SCENES[S.idx]; if(sc&&sc.onKey&&sc.onKey(e))return;
  if(/INPUT|TEXTAREA|SELECT/.test((e.target.tagName||''))||(sc&&sc.captureArrows))return;
  if(e.key==='ArrowRight')go(S.idx+1); else if(e.key==='ArrowLeft')go(S.idx-1);
});

/* ---------- boot ---------- */
const CHAR=`<svg id="char" viewBox="0 0 200 230" role="img" aria-label="The Acharya, your guide" data-mood="neutral"><g class="bob">
<path id="shawl" d="M20 230 C24 175 60 160 100 160 C140 160 176 175 180 230Z" fill="#c9b27a" stroke="#3a2a15" stroke-width="3"/>
<path d="M100 160 L100 230" stroke="#3a2a15" stroke-width="2" opacity=".5"/>
<rect x="88" y="138" width="24" height="26" rx="8" fill="#c88c55" stroke="#3a2a15" stroke-width="3"/>
<ellipse cx="100" cy="30" rx="15" ry="13" fill="#e9e4d8" stroke="#3a2a15" stroke-width="3"/>
<ellipse cx="100" cy="92" rx="52" ry="58" fill="#dca66c" stroke="#3a2a15" stroke-width="3"/>
<path d="M50 80 C50 40 150 40 150 80 C140 56 60 56 50 80Z" fill="#e9e4d8" stroke="#3a2a15" stroke-width="3"/>
<path d="M72 64 L128 64" stroke="#b5481e" stroke-width="4" stroke-linecap="round"/><path d="M78 70 L122 70" stroke="#b5481e" stroke-width="3" stroke-linecap="round"/>
<g class="brow browL"><path d="M66 84 Q78 76 90 84" fill="none" stroke="#6a5a48" stroke-width="5" stroke-linecap="round"/></g>
<g class="brow"><path d="M110 84 Q122 76 134 84" fill="none" stroke="#6a5a48" stroke-width="5" stroke-linecap="round"/></g>
<ellipse class="eye" cx="78" cy="98" rx="6" ry="5" fill="#2a1a0a"/><ellipse class="eye" cx="122" cy="98" rx="6" ry="5" fill="#2a1a0a"/>
<path d="M98 100 Q94 114 100 118" fill="none" stroke="#3a2a15" stroke-width="3" stroke-linecap="round"/>
<path d="M54 118 C56 170 144 170 146 118 C140 138 124 148 100 148 C76 148 60 138 54 118Z" fill="#efeadd" stroke="#3a2a15" stroke-width="3"/>
<path d="M76 124 Q100 114 124 124 Q112 134 100 130 Q88 134 76 124Z" fill="#efeadd" stroke="#3a2a15" stroke-width="2.5"/>
<ellipse id="mouth" cx="100" cy="138" rx="9" ry="2" fill="#5a1d10" stroke="#3a2a15" stroke-width="2"/>
<circle cx="100" cy="82" r="3.2" fill="#b5481e"/></g></svg>`;
function boot(){
  $('#charWrap').innerHTML=CHAR; const dots=$('#dots');
  SCENES.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',`Scene ${i+1}: ${s.title}`);b.title=`${i+1}. ${s.title}`;b.onclick=()=>go(i);dots.appendChild(b);});
  $('#backBtn').onclick=()=>go(S.idx-1); $('#nextBtn').onclick=()=>go(S.idx+1);
  $('#replay').onclick=()=>speak(SCENES[S.idx].id); $('#stop').onclick=stopAll;
  $('#mute').onclick=e=>{S.muted=!S.muted;e.currentTarget.setAttribute('aria-pressed',S.muted);if(S.muted)stopAll();};
  $('#auto').onclick=e=>{S.auto=!S.auto;e.currentTarget.setAttribute('aria-pressed',S.auto);};
  $('#devf').onclick=e=>{const on=document.body.classList.toggle('show-dev');e.currentTarget.setAttribute('aria-pressed',on);};
  $('#guideBtn').onclick=()=>window.EX.openGuide&&window.EX.openGuide('cases');
  $('#fx').onclick=e=>{const off=document.body.classList.toggle('fx-off');e.currentTarget.setAttribute('aria-pressed',off);};
  $('#theme').onclick=()=>{const d=document.documentElement;const dark=d.dataset.theme==='dark'||(d.dataset.theme!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);d.dataset.theme=dark?'light':'dark';};
  const enter=snd=>{S.sound=snd;$('#intro').style.display='none';if(snd){try{ctx||wire(au);}catch(e){}}document.body.classList.toggle('silent',!snd);if(!snd){$('#mute').disabled=true;}setAccessory();render();};
  $('#enterSound').onclick=()=>enter(true); $('#enterSilent').onclick=()=>enter(false);
  blink(); mouthLoop();
}
window.addEventListener('DOMContentLoaded',()=>{boot();});
window.EX={gtable,toDev,cellHtml,CN,CASEKEYS,NUMN,G,decodeCard,termCard,quiz,react,setMood,toast,esc,V,T,go,S,SCENES,playVerse,playClip};
})();
