/* Pāṇini scenes: the six kārakas in his own words, and the animated derivation machine for suffix tags. */
(function(){
'use strict';
const {esc,toDev,quiz}=EX; const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const PAN=PANINI; const RC={'kartṛ':'nom','karman':'acc','karaṇa':'ins','sampradāna':'dat','apādāna':'abl','adhikaraṇa':'loc',verb:'verb'};
const KB=Object.fromEntries(PAN.karakas.map(k=>[k.id,k])); const akey=ref=>'s_'+ref.replace(/\./g,'_');
function sutra(ref,extra){const r=PAN.rules[ref];return `<div class="sutra"><button class="play" data-sutra="${ref}" aria-label="Hear sūtra ${ref}">▶</button><div><span class="pill">${ref}</span> <span class="dev" style="font-size:1.2em">${esc(r.dev)}</span> <span class="iast">${esc(r.iast)}</span><br>${esc(r.plain)}${extra||''}</div></div>`;}
document.addEventListener('click',e=>{
  const b=e.target.closest('button[data-sutra]'); if(b){EX.playClip(akey(b.dataset.sutra),b.closest('.sutra'));return;}
  const g=e.target.closest('button[data-gotoscene]'); if(g){EX.goId(g.dataset.gotoscene);}
});
EX.goId=id=>{const i=EX.SCENES.findIndex(s=>s.id===id); if(i<0)return; if(EX.closeGuide)EX.closeGuide(); EX.go(i);};

/* ---------------- Scene: the six kārakas ---------------- */
EX.SK={id:'sk',level:0,mood:'think',title:'Pāṇini’s six kārakas, in his own words',
html:`<p class="lead">Pāṇini defines each role in a few words. Pick a sentence, then tap a word to see its role and the sūtra that defines it. ▶ reads the sūtra aloud.</p>
<div class="tabs" role="tablist">${PAN.sentences.map((s,i)=>`<button role="tab" aria-selected="${i===0}" data-s="${i}">${esc(s.en)}</button>`).join('')}</div>
<div class="sline" data-id="sline" role="list"></div><div data-id="kdet" aria-live="polite"><p class="gnote">Tap a word.</p></div>
<div class="sec">The six at a glance</div>
<div class="tscroll"><table class="wt"><tr><th>Kāraka</th><th>Defining sūtra</th><th>What it says</th><th>Core function</th><th>Example</th></tr>${PAN.karakas.map(k=>`<tr><td data-c="${RC[k.id]}"><span class="pill c" data-c="${RC[k.id]}">${esc(k.id)}</span><br><span class="dev">${esc(k.dev)}</span><br><span class="gnote">${esc(k.en)}<br>${esc(k.vib)}</span></td><td><span class="dev">${esc(PAN.rules[k.ref].dev)}</span><br><span class="iast">${esc(PAN.rules[k.ref].iast)}</span> <span class="pill">${k.ref}</span><br><button class="btn small" data-sutra="${k.ref}">▶ hear</button></td><td>${esc(k.meaning)}</td><td>${esc(k.fn)}</td><td><span class="dev">${esc(k.ex.dev)}</span><br><span class="iast">${esc(k.ex.iast)}</span><br>${esc(k.ex.en)}</td></tr>`).join('')}</table></div>
<p class="gnote">The case named under each kāraka is the <i>usual</i> one, not a rule. In a passive sentence the agent takes the instrumental and the object takes the nominative (see the Cases scene). Roles come from what a word does in the action, not from its ending.</p>
<div class="sec">Check yourself</div><div data-id="kq"></div>`,
init(r,a){
  let cur=0;
  const draw=()=>{const S=PAN.sentences[cur];
    $('[data-id="sline"]',r).innerHTML=S.tokens.map((t,i)=>`<button class="stok" role="listitem" data-c="${RC[t.role]}" data-i="${i}" aria-pressed="false"><span class="dev">${esc(t.d)}</span><span class="iast">${esc(t.t)}</span><span class="am">${esc(t.en)}</span><span class="ag">${esc(t.role==='verb'?'verb (the action)':t.role)}</span></button>`).join('');
    $('[data-id="kdet"]',r).innerHTML=`<p class="meaning">${esc(S.en)}</p><p class="gnote">Tap a word.</p>`;
    $$('.stok',r).forEach(b=>b.onclick=()=>{$$('.stok',r).forEach(x=>x.setAttribute('aria-pressed',x===b));show(S.tokens[+b.dataset.i]);});};
  const show=t=>{let h;
    if(t.role==='verb'){h=`<div class="cdet" data-c="verb"><h4><span class="pill c" data-c="verb">verb</span> <span class="dev">${esc(t.d)}</span> <i>${esc(t.t)}</i> “${esc(t.en)}”</h4><p><b>${esc(t.gram)}.</b> ${esc(t.note)}</p><p class="gnote">Every kāraka is defined by its relation to this action. The verb itself is not a kāraka.</p></div>`;}
    else{const k=KB[t.role];h=`<div class="cdet" data-c="${RC[t.role]}"><h4><span class="pill c" data-c="${RC[t.role]}">${esc(k.id)} <span class="dev">${esc(k.dev)}</span></span> <span class="dev">${esc(t.d)}</span> <i>${esc(t.t)}</i> “${esc(t.en)}”</h4>${sutra(k.ref)}<p><b>Core function:</b> ${esc(k.fn)}</p><p><b>In this sentence:</b> ${esc(t.note)}</p><p class="gnote">${esc(t.gram)}. ${esc(k.vib)}.</p></div>`;}
    $('[data-id="kdet"]',r).innerHTML=h;a.react(t.role==='verb'?'The action itself.':(t.role+': '+KB[t.role].en.toLowerCase()+'.'),'happy');};
  $$('.tabs button',r).forEach(b=>b.onclick=()=>{cur=+b.dataset.s;$$('.tabs button',r).forEach(x=>x.setAttribute('aria-selected',x===b));draw();});
  draw();
  quiz($('[data-id="kq"]',r),[
   {q:'In “vṛkṣāt patraṁ patati”, what role does the tree (vṛkṣāt) play?',o:['Agent (kartṛ)','Source (apādāna)','Locus (adhikaraṇa)','Instrument (karaṇa)'],a:1,e:'The tree is the fixed point the leaf separates from: apādāna, defined by dhruvam apāye ’pādānam.'},
   {q:'In the same sentence, why is the leaf (patram) the agent and not an object?',o:['Because it is in the nominative','Because it is the one performing the action of falling','Because it comes first','Because it is neuter'],a:1,e:'Roles come from the action. The leaf does the falling, so it is the independent doer (svatantra), the kartṛ.'},
   {q:'In “viprāya gāṁ dadāti”, who is the sampradāna?',o:['The cow','The giver','The scholar (vipra)','Nobody'],a:2,e:'The scholar is whom the giver intends the cow to reach through the giving.'},
   {q:'What does svatantra (“independent”) mean in svatantraḥ kartā?',o:['The agent acts freely, not as someone else’s tool','The agent is alone','The agent is nominative','The agent is the speaker'],a:0,e:'The other participants help the action; the kartṛ is the one who initiates it, free of the others.'}],()=>{});}};

/* ---------------- Scene: the derivation machine ---------------- */
function devOf(st){return st.segs.map(sg=>toDev(sg.u.filter(u=>u.cls!=='ghost').map(u=>u.t).join(''))).filter(Boolean).join(st.merged?'':' + ');}
function items(st){const o=[];st.segs.forEach((sg,gi)=>{if(gi>0&&!st.merged)o.push({key:'plus'+gi,plus:true});sg.u.forEach(u=>o.push({key:u.id,t:u.t,cls:u.cls,k:u.k||sg.k}));});return o;}
function machine(r,a){
  const D=PAN.derivations; let di=0,si=0,timer=null; const stage=$('[data-id="mstage"]',r); const els=new Map();
  const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(n,instant){
    const st=D[di].states[n]; const its=items(st); const keep=new Set(its.map(i=>i.key)); const sr=stage.getBoundingClientRect();
    const before=new Map(); els.forEach((e,k)=>before.set(k,e.getBoundingClientRect()));
    els.forEach((e,k)=>{if(!keep.has(k)){const rc=before.get(k);e.style.position='absolute';e.style.left=(rc.left-sr.left)+'px';e.style.top=(rc.top-sr.top)+'px';e.style.margin='0';e.classList.add('out');setTimeout(()=>e.remove(),instant?0:450);els.delete(k);}});
    its.forEach(i=>{let e=els.get(i.key);const fresh=!e;if(fresh){e=document.createElement('span');els.set(i.key,e);}
      e.className='mu k-'+(i.k||'')+(i.plus?' plus':'')+(i.cls?' '+i.cls:'');e.textContent=i.plus?'+':i.t;e.dataset.fresh=fresh?'1':'';e.title=i.cls==='ghost'?'A deleted tag. The rules still remember it.':i.cls==='tag'?'A tag (it-letter), about to be deleted.':'';stage.appendChild(e);});
    const dur=(reduce()||instant)?0:650;
    its.forEach(i=>{const e=els.get(i.key);
      if(e.dataset.fresh){if(dur)e.animate([{opacity:0,transform:'scale(.3)'},{opacity:1,transform:'none'}],{duration:dur,delay:150,fill:'backwards'});}
      else{const f=before.get(i.key),l=e.getBoundingClientRect(),dx=f.left-l.left,dy=f.top-l.top;if(dur&&(dx||dy))e.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:dur,easing:'cubic-bezier(.2,.8,.2,1)'});}});
    $('[data-id="mdev"]',r).textContent=devOf(st);
    const last=n===D[di].states.length-1, d=D[di];
    $('[data-id="mrule"]',r).innerHTML=`<p class="lead"><b>Step ${n+1} of ${d.states.length}.</b> ${esc(st.say)}</p>`+(st.rule?sutra(st.rule):'')+(last?`<p class="meaning">Result: <span class="dev">${esc(d.result.dev)}</span> <i>${esc(d.result.iast)}</i> “${esc(d.result.en)}”</p>`:'');
    $('[data-id="mback"]',r).disabled=n===0; $('[data-id="mnext"]',r).disabled=last; if(last)stopAuto();
    $$('[data-id="msteps"] i',r).forEach((x,k)=>x.className=k<=n?'on':'');
  }
  function stopAuto(){if(timer){clearInterval(timer);timer=null;}$('[data-id="mauto"]',r).textContent='▶ Auto-play';}
  function pick(i){stopAuto();di=i;si=0;els.clear();stage.innerHTML='';$$('[data-id="dtabs"] button',r).forEach((b,k)=>b.setAttribute('aria-selected',k===i));
    $('[data-id="msteps"]',r).innerHTML=D[i].states.map(()=>'<i></i>').join('');show(0,true);}
  $('[data-id="dtabs"]',r).innerHTML=D.map((d,i)=>`<button role="tab" aria-selected="${i===0}" data-i="${i}">${esc(d.title.split(':')[0])}</button>`).join('');
  $$('[data-id="dtabs"] button',r).forEach(b=>b.onclick=()=>pick(+b.dataset.i));
  $('[data-id="mnext"]',r).onclick=()=>{if(si<D[di].states.length-1){si++;show(si);}};
  $('[data-id="mback"]',r).onclick=()=>{if(si>0){si--;show(si);}};
  $('[data-id="mreset"]',r).onclick=()=>{stopAuto();si=0;show(0);};
  $('[data-id="mauto"]',r).onclick=()=>{if(timer){stopAuto();return;}if(si>=D[di].states.length-1){si=0;show(0);}$('[data-id="mauto"]',r).textContent='❚❚ Pause';timer=setInterval(()=>{if(si<D[di].states.length-1){si++;show(si);}else stopAuto();},3000);};
  pick(0);
  r._cleanup=stopAuto;
}
function tagGame(r,a){
  const G=PAN.game; let gi=0; const box=$('[data-id="game"]',r);
  const draw=()=>{const g=G[gi];
    $('[data-id="gtabs"]',r).innerHTML=G.map((x,i)=>`<button role="tab" aria-selected="${i===gi}" data-i="${i}"><span class="dev">${esc(toDev(x.s))}</span> ${esc(x.s)}</button>`).join('');
    $$('[data-id="gtabs"] button',r).forEach(b=>b.onclick=()=>{gi=+b.dataset.i;draw();});
    box.innerHTML=`<p>Which letters of <b class="dev">${esc(toDev(g.s))}</b> (<i>${esc(g.s)}</i>) are tags that Pāṇini deletes? Tap them, then check.</p><div class="row2" data-id="glets">${g.letters.map(l=>`<button class="glet" aria-pressed="false" data-l="${esc(l)}"><span>${esc(l)}</span><small class="dev">${esc(toDev(l))}</small></button>`).join('')}</div><div class="row2"><button class="btn small primary" data-id="gcheck">Check</button></div><div data-id="gres" aria-live="polite"></div>`;
    $$('.glet',box).forEach(b=>b.onclick=()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true'));
    $('[data-id="gcheck"]',box).onclick=()=>{let ok=true;const lines=[];
      g.letters.forEach(l=>{const b=$(`.glet[data-l="${l}"]`,box);const on=b.getAttribute('aria-pressed')==='true';const isTag=l in g.tags,isProt=l in g.protected;
        b.classList.remove('right','wrong');
        if(isTag){b.classList.add(on?'right':'wrong');if(!on)ok=false;lines.push(`<li><b>${esc(l)}</b> is a tag: ${esc(PAN.rules[g.tags[l]].iast)} (${g.tags[l]}). ${esc(PAN.rules[g.tags[l]].plain)}</li>`);}
        else if(isProt){b.classList.add(on?'wrong':'right');if(on)ok=false;lines.push(`<li><b>${esc(l)}</b> looks like a tag (a final consonant) but is saved: ${esc(PAN.rules[g.protected[l]].iast)} (${g.protected[l]}). ${esc(PAN.rules[g.protected[l]].plain)}</li>`);}
        else{b.classList.add(on?'wrong':'right');if(on)ok=false;}});
      $('[data-id="gres"]',box).innerHTML=`<p class="${ok?'ok':'bad'}">${ok?'Correct.':'Not quite; the highlighted letters show where.'} The working core that remains is <b>${esc(g.core)}</b>.</p><ul class="sandhi">${lines.join('')}</ul>`;a.react(ok?'You can read the tags.':'Check the rule for each letter.',ok?'happy':'think');};};
  draw();
}
function grades(r){
  const G=PAN.grades; let col='guna';
  const draw=()=>{$('[data-id="gtab"]',r).innerHTML=`<tr><th>Root</th><th class="${col==='basic'?'sel':''}">Basic</th><th class="${col==='guna'?'sel':''}">Guṇa</th><th class="${col==='vrddhi'?'sel':''}">Vṛddhi</th><th>Examples (${col==='guna'?'guṇa':col==='vrddhi'?'vṛddhi':'basic'})</th></tr>`+G.rows.map(x=>`<tr><td><b>${esc(x.root)}</b></td><td class="${col==='basic'?'sel':''}">${esc(x.basic)}</td><td class="${col==='guna'?'sel':''}">${esc(x.guna)}</td><td class="${col==='vrddhi'?'sel':''}">${esc(x.vrddhi)}</td><td>${col==='guna'?esc(x.gw):col==='vrddhi'?esc(x.vw):'—'}</td></tr>`).join('');};
  $$('[data-id="gbtns"] button',r).forEach(b=>b.onclick=()=>{col=b.dataset.c;$$('[data-id="gbtns"] button',r).forEach(x=>x.setAttribute('aria-pressed',x===b));draw();});
  draw();
}
EX.SX={id:'sx',level:4,mood:'alert',title:'Pāṇini’s code: hidden tags',
html:`<p class="lead">Pāṇini’s grammar runs like a program. Suffixes carry silent <b>tags</b> (<i>it</i>-letters, or <i>anubandhas</i>) that trigger operations and then delete themselves. Step through five words built from the root √kṛ. Two of them, <i>karaṇa</i> and <i>adhikaraṇa</i>, and the agent nouns <i>kāraka</i> and <i>kartṛ</i>, are Pāṇini’s own kāraka vocabulary.</p>
<div class="tabs" role="tablist" data-id="dtabs"></div>
<div class="machine"><div class="mdev dev" data-id="mdev" aria-live="polite"></div><div class="mstage" data-id="mstage" aria-label="Letters of the word being built"></div><div class="msteps" data-id="msteps" aria-hidden="true"></div>
<div class="mkey"><span class="mu k-root">root</span><span class="mu k-prefix">prefix</span><span class="mu k-suffix">suffix</span><span class="mu k-sup">ending</span><span class="mu tag">tag</span><span class="mu ghost">ghost</span></div></div>
<div class="row2"><button class="btn small" data-id="mback">◀ Back</button><button class="btn small primary" data-id="mnext">Next step ▶</button><button class="btn small" data-id="mreset">⟲ Reset</button><button class="btn small" data-id="mauto">▶ Auto-play</button></div>
<div class="rulecard" data-id="mrule" aria-live="polite"></div>
<div class="sec">The big idea: same core, different tags</div>
<p><i>yu</i> and <i>vu</i> look alike, but wrapped in different tags they do different things. <b>lyuṭ</b> (tags l, ṭ) gives <i>kar-aṇa</i> with ordinary guṇa. <b>ṇvul</b> (tags ṇ, l) gives <i>kār-aka</i> with the larger vṛddhi, because the ghost of the deleted ṇ still triggers it. <b>ktvā</b> (tag k) gives <i>kṛ-tvā</i> with no strengthening at all, because the ghost of the deleted k blocks it.</p>
<div class="sec">Find the hidden tags</div><div class="tabs" role="tablist" data-id="gtabs"></div><div data-id="game"></div>
<div class="sec">Strong, stronger: guṇa and vṛddhi</div><p class="gnote">${esc(PAN.grades.rule)}</p>
<div class="row2" data-id="gbtns"><button class="btn small" data-c="basic" aria-pressed="false">Basic</button><button class="btn small" data-c="guna" aria-pressed="true">Guṇa</button><button class="btn small" data-c="vrddhi" aria-pressed="false">Vṛddhi</button></div><div class="tscroll"><table class="wt" data-id="gtab"></table></div>
<details class="tbl"><summary>Every sūtra used here, with audio</summary><div data-id="allrules"></div></details>
<p class="gnote">Sūtra numbers and the order of rule application are from memory and from standard references; check them against an edition of the Aṣṭādhyāyī before quoting.</p>`,
init(r,a){machine(r,a);tagGame(r,a);grades(r);
  const used=['1.1.5','1.3.2','1.3.3','1.3.4','1.3.5','1.3.6','1.3.7','1.3.8','1.3.9','3.1.133','3.3.117','7.1.1','7.1.24','7.2.115','7.3.84','8.2.66','8.3.15','8.4.1'];
  $('[data-id="allrules"]',r).innerHTML=used.map(x=>sutra(x)).join('');}};
EX.rulesTab=function(root){
  root.innerHTML=`<p class="lead">Pāṇini’s <b>tag rules</b> clean a suffix, and his <b>building rules</b> turn what is left into a word. The two scenes “Pāṇini’s six kārakas” and “Pāṇini’s code” show them at work.</p>
  <div class="row2"><button class="btn small primary" data-gotoscene="sk">Open the kāraka scene</button><button class="btn small primary" data-gotoscene="sx">Open the derivation machine</button></div>
  <div class="sec">Tag (it) rules</div>${['1.3.2','1.3.3','1.3.4','1.3.5','1.3.6','1.3.7','1.3.8','1.3.9','1.1.5'].map(x=>sutra(x)).join('')}
  <div class="sec">Building rules</div>${['3.1.133','3.3.117','7.1.1','7.3.84','7.2.115','8.4.1','7.1.24','8.2.66','8.3.15'].map(x=>sutra(x)).join('')}
  <div class="sec">The six kāraka definitions</div>${PAN.karakas.map(k=>sutra(k.ref)).join('')}`;
};
})();
