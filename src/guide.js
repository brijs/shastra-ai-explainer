/* Grammar guide: case wheel, sentence builder, number/gender, word types, notation, sounds, paradigm gallery. */
(function(){
'use strict';
const {gtable,toDev,CN,CASEKEYS,G,esc}=EX; const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const ROLES={nom:'Doer',acc:'Done-to / goal',ins:'Tool / means',dat:'For whom',abl:'Source (from)',loc:'Where / when',gen:'Whose? (of)',voc:'Calling'};
const POS=[[34,9],[84,29],[84,71],[50,92],[16,71],[16,29]]; // nom acc ins dat abl loc around the action
const WHEEL=['nom','acc','ins','dat','abl','loc'];

function hl(str,hit){return esc(str).replace(esc(hit),`<mark>${esc(hit)}</mark>`);}
function caseDetail(c){
  const i=CASEKEYS.indexOf(c), m=G.cases[i];
  const devHit=toDev(m.ex.hit);
  return `<div class="cdet" data-c="${c}"><h4><span class="pill c" data-c="${c}">${m.n} · ${esc(m.en)}</span> <span class="iast">${esc(m.skt)}</span> <span class="dev" style="font-size:1.1em">${esc(m.sktd)}</span></h4>
  <p><b>Role:</b> ${esc(m.role)}.</p>
  <p><b>Pāṇini's term:</b> <span class="pill kp">${esc(m.kn)} <span class="dev">${esc(m.kd)}</span></span> (${esc(m.ken)})${G.karaka[m.kn].sutra?`<br><span class="gnote">Aṣṭādhyāyī ${esc(G.karaka[m.kn].sutra.ref)}: <span class="dev" style="font-size:1.05em">${esc(G.karaka[m.kn].sutra.dev)}</span> <i>${esc(G.karaka[m.kn].sutra.iast)}</i>. ${esc(G.karaka[m.kn].sutra.gloss)}</span>`:`<br><span class="gnote">${m.id==='gen'?'Not a kāraka: a relation (sambandha) between two nouns, not between a noun and the action.':'Not a kāraka: address, outside the action.'}</span>`}</p>
  <p class="gnote"><b>Affixes (sup):</b> ${esc(G.sup[m.id].join(' · '))} <span class="gnote">(singular · dual · plural; the ṅ, ṭ, ś, j, s marks are silent tags)</span></p>
  <p><b>Think of it as:</b> ${esc(m.think)}</p>
  <p><b>Ask:</b> ${esc(m.q)} &nbsp; <b>English:</b> ${esc(m.prep)} &nbsp; <b>Typical ending:</b> <code>${esc(m.end)}</code></p>
  <p class="cex"><span class="dev">${esc(m.ex.dev).replace(esc(devHit),`<mark>${esc(devHit)}</mark>`)}</span><br><span class="iast">${hl(m.ex.iast,m.ex.hit)}</span> · ${esc(m.ex.en)}</p>
  <p class="gnote"><b>In the talk:</b> ${esc(m.talk.en)}</p></div>`;
}
function wheel(root){
  let h=`<div class="wheel" data-id="wheel" role="group" aria-label="Case wheel"><svg viewBox="0 0 100 100" aria-hidden="true">`;
  POS.forEach(([x,y],i)=>{h+=`<line data-l="${WHEEL[i]}" x1="50" y1="50" x2="${x}" y2="${y}"/>`;});
  h+=`</svg><div class="hub">ACTION<br><small>the verb</small></div>`;
  WHEEL.forEach((c,i)=>{const [x,y]=POS[i];h+=`<button class="wnode" data-c="${c}" data-case="${c}" aria-pressed="false" style="left:${x}%;top:${y}%"><b>${esc(ROLES[c])}</b><small>${CN[c][1]}</small><em>${esc(G.cases[CASEKEYS.indexOf(c)].kn)}</em></button>`;});
  h+=`</div><div class="beyond"><span class="gnote">Beyond the action:</span> <button class="wnode flat" data-c="gen" data-case="gen" aria-pressed="false"><b>${ROLES.gen}</b><small>Genitive</small><em>sambandha</em></button><button class="wnode flat" data-c="voc" data-case="voc" aria-pressed="false"><b>${ROLES.voc}</b><small>Vocative</small><em>sambodhana</em></button></div>`;
  return h;
}
function sentence(root){
  const P=[{c:'voc',i:'he sīte',d:'हे सीते',en:'O Sītā,'},{c:'nom',i:'rāmaḥ',d:'रामः',en:'Rāma',base:1},{c:'loc',i:'prabhāte',d:'प्रभाते',en:'at dawn',q:'When?'},{c:'abl',i:'grāmāt',d:'ग्रामात्',en:'from the village',q:'From where?'},{c:'ins',i:'rathena',d:'रथेन',en:'by chariot',q:'By what?'},{c:'gen',i:'mitrasya',d:'मित्रस्य',en:'',q:'Whose house?',needs:'acc'},{c:'acc',i:'gṛham',d:'गृहम्',en:'',q:'To where?'},{c:'dat',i:'bhojanāya',d:'भोजनाय',en:'for a meal',q:'For what?'},{c:'verb',i:'āgacchati',d:'आगच्छति',en:'comes',base:1}];
  const on=new Set(['nom','verb']);
  const draw=()=>{
    const sk=P.filter(p=>on.has(p.c)||p.base);
    $('[data-id="sb-dev"]',root).innerHTML=sk.map(p=>`<span class="sw" data-c="${p.c}">${esc(p.d)}</span>`).join(' ')+' ।';
    $('[data-id="sb-iast"]',root).innerHTML=sk.map(p=>`<span class="sw" data-c="${p.c}">${esc(p.i)}</span>`).join(' ');
    const g=on.has('gen'), a=on.has('acc');
    const part=c=>{const p=P.find(x=>x.c===c);return on.has(c)?(c==='acc'?(g?'to the friend’s house':'to the house'):p.en):'';};
    const en=[part('voc'),'Rāma','comes',part('loc'),part('abl'),part('ins'),part('acc'),part('dat')].filter(Boolean).join(' ');
    $('[data-id="sb-en"]',root).textContent=en.replace(/^O Sītā, Rāma/,'O Sītā, Rāma')+'.';
    $$('[data-id="sb-btns"] button',root).forEach(b=>{const c=b.dataset.c;const p=P.find(x=>x.c===c);b.disabled=!!(p.needs&&!on.has(p.needs));b.setAttribute('aria-pressed',on.has(c));b.title=b.disabled?'Add the destination first':'';});
  };
  const btns=P.filter(p=>!p.base&&p.c!=='voc').concat(P.filter(p=>p.c==='voc')).map(p=>`<button class="btn small" data-c="${p.c}" aria-pressed="false">+ ${p.c==='voc'?'Call someone':esc(p.q)} <small>(${CN[p.c][1]})</small></button>`).join('');
  root.insertAdjacentHTML('beforeend',`<div class="sec">Why eight is enough: build a sentence</div><p>Start with the doer and the action. Then add one role at a time and watch what each ending contributes.</p>
   <div class="sbuild"><div class="dev" data-id="sb-dev"></div><div class="iast" data-id="sb-iast"></div><p data-id="sb-en" class="meaning"></p></div><div class="row2" data-id="sb-btns">${btns}</div>
   <p class="gnote">Everything we can say about an action answers one of a few questions: <b>who</b> (nominative), <b>what or where to</b> (accusative), <b>by what</b> (instrumental), <b>for whom or what</b> (dative), <b>from where</b> (ablative), <b>where or when</b> (locative). Those six are Pāṇini's <i>kārakas</i>. Two more cases live outside the action: the genitive says <b>whose</b> (a link from noun to noun) and the vocative says <b>whom I am calling</b>. Six + two = eight, so every noun in a sentence has a place. (Traditionally the seven <i>vibhaktis</i>, prathamā to saptamī, are counted, and the vocative is treated as a form of the first.)</p>`);
  $$('[data-id="sb-btns"] button',root).forEach(b=>b.onclick=()=>{const c=b.dataset.c;if(on.has(c))on.delete(c);else on.add(c);if(c==='acc'&&!on.has('acc'))on.delete('gen');draw();EX.react(on.has(c)?`${CN[c][1]}: ${ROLES[c].toLowerCase()}.`:'Removed.','happy');});
  draw();
}
function casesTab(root,pick){
  root.innerHTML=`<p class="lead">English uses little words (<i>by, from, to, in</i>) to show how a noun relates to the action. Sanskrit puts that information into the <b>ending of the word</b>, called its <i>vibhakti</i> (case). Tap a role.</p>${wheel()}<div data-id="cdet"></div>`;
  const show=c=>{$$('.wnode',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.case===c));$$('[data-id="wheel"] line',root).forEach(l=>l.classList.toggle('on',l.dataset.l===c));$('[data-id="cdet"]',root).innerHTML=caseDetail(c);EX.react(CN[c][1]+': '+ROLES[c].toLowerCase()+'.','happy');};
  $$('.wnode',root).forEach(b=>b.onclick=()=>show(b.dataset.case));
  show(pick||'abl');
  sentence(root);
  root.insertAdjacentHTML('beforeend',`<div class="sec">Pāṇini's two layers: kāraka and vibhakti</div><p>Pāṇini works in two steps. First he defines the <b>kārakas</b>, the roles a noun can play in an action: <i>kartṛ</i> (agent), <i>karman</i> (object), <i>karaṇa</i> (instrument), <i>sampradāna</i> (recipient), <i>apādāna</i> (point of departure) and <i>adhikaraṇa</i> (locus), starting at Aṣṭādhyāyī 1.4.23. Then he says which case ending expresses each, starting at 2.3.1. They usually line up (the table below), but not always: in a passive sentence the agent takes the <b>instrumental</b> and the object takes the <b>nominative</b>, since the verb already expresses the object. Word cards mark such cases with a <b>kāraka</b> tag.</p><p class="gnote">The case endings themselves have Pāṇini's affix names: <i>su au jas</i>, <i>am auṭ śas</i>, <i>ṭā bhyām bhis</i>, <i>ṅe bhyām bhyas</i>, <i>ṅasi bhyām bhyas</i>, <i>ṅas os ām</i>, <i>ṅi os sup</i> (the vocative reuses the first set). The consonants ṅ, ṭ, ś, j, s are silent markers that guide the rules, and drop out when the word is built.</p>`);
  let t=`<div class="sec">All eight at a glance</div><div class="tscroll"><table class="wt"><tr><th>#</th><th>Case (vibhakti)</th><th>Pāṇini's kāraka</th><th>Role</th><th>Ask</th><th>English</th><th>Affixes (sup)</th><th>Ending (a-stem)</th></tr>`;
  G.cases.forEach(m=>{t+=`<tr><td>${m.n}</td><td><span class="pill c" data-c="${m.id}">${esc(m.en)}</span><br><span class="iast">${esc(m.skt)}</span> <span class="dev">${esc(m.sktd)}</span></td><td><b>${esc(m.kn)}</b><br><span class="dev">${esc(m.kd)}</span><br><span class="gnote">${esc(m.ken)}</span></td><td>${esc(m.role)}</td><td>${esc(m.q)}</td><td>${esc(m.prep)}</td><td><code>${esc(G.sup[m.id].join(' · '))}</code></td><td><code>${esc(m.end)}</code></td></tr>`;});
  root.insertAdjacentHTML('beforeend',t+'</table></div>');
}
function numgenTab(root){
  root.innerHTML=`<div class="sec">Number (vacana)</div><p>Sanskrit has <b>three</b> numbers: <b>singular</b> (one), <b>dual</b> (exactly two) and <b>plural</b> (three or more). English has no dual. In the talk, <i>nṛtya-gīte</i> “dance and song” is a dual: a pair.</p>
  <div class="row2"><span class="pill">1 · eka · singular</span><span class="pill">2 · dvi · dual</span><span class="pill">3+ · bahu · plural</span></div>
  <div class="sec">Gender (liṅga)</div><p>Nouns are <b>masculine</b>, <b>feminine</b> or <b>neuter</b>. It is grammatical: it decides which endings a noun takes, and adjectives must agree. Try it: pick a noun, and the adjective <i>sundara</i> (“beautiful”) changes to match.</p>
  <div class="row2" data-id="gsel"><button class="btn small" data-g="m" aria-pressed="true">puruṣa (man, m.)</button><button class="btn small" data-g="f" aria-pressed="false">nārī (woman, f.)</button><button class="btn small" data-g="n" aria-pressed="false">phala (fruit, n.)</button></div>
  <p class="meaning" data-id="gout"></p>
  <div class="sec">Agreement</div><p>An adjective copies the <b>case, number and gender</b> of the noun it describes. So <i>puṇya-tamāḥ mahābhāgāḥ</i> (V2) are both nominative plural masculine, matching the people they describe.</p>`;
  const D={m:['सुन्दरः पुरुषः','sundaraḥ puruṣaḥ','a beautiful man'],f:['सुन्दरी नारी','sundarī nārī','a beautiful woman'],n:['सुन्दरं फलम्','sundaraṁ phalam','a beautiful fruit']};
  const f=g=>{$$('[data-id="gsel"] button',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.g===g));$('[data-id="gout"]',root).innerHTML=`<span class="dev">${D[g][0]}</span><br><span class="iast">${D[g][1]}</span> · ${D[g][2]}`;};
  $$('[data-id="gsel"] button',root).forEach(b=>b.onclick=()=>f(b.dataset.g));f('m');
}
function typesTab(root){
  const T=[['Noun · nāman','names a person, place, thing or idea. It has a stem, gender, and 24 forms (8 cases × 3 numbers).','muktiḥ (V7), vittena (V8a), pṛthivyām (V3)'],
  ['Pronoun · sarvanāman','stands in for a noun: I, you, this, who, what.','aham, tena, kim, yena, tava'],
  ['Adjective · viśeṣaṇa','describes a noun and copies its case, number and gender.','alpam (V9), mahābhāgāḥ (V2)'],
  ['Verb · ākhyāta / tiṅanta','shows an action with person, number, tense or mood and voice. Built from a root (dhātu).','karomi (V1), asti (V8a), gacchanti (V10)'],
  ['Participle · kṛdanta','a verbal adjective made from a root: -ta (“done”, past passive) or -ya (“can be done”). It declines like an adjective.','uktam (V6) “said”, labhyam (V5) “obtainable”'],
  ['Gerundive · kṛtya','-tavya makes “should be done”.','kartavyam (V1)'],
  ['Gerund · ktvā','-tvā makes “having done”. It is indeclinable and joins two actions.','hitvā (V7), yācitvā (V1)'],
  ['Indeclinable · avyaya','never changes form: adverbs, particles, conjunctions.','api, eva, na, tu, iha, sarvatra'],
  ['Compound · samāsa','several words joined into one. Only the last member takes the case ending; earlier members stay in bare stem form.','etad-deśa-prasūtasya (V3), yama-ālayam (V10)'],
  ['Prefix · upasarga','a small word added before a verb or noun to tilt its meaning: pra- (forth), vi- (apart), ā- (towards).','pra-vakṣyāmi (V6), vi-ava-sthiti (V7)']];
  root.innerHTML=`<p class="lead">Every Sanskrit word falls into one of a few types. Each word you tap in a verse shows its type.</p>`+T.map(t=>`<div class="tcard"><b>${t[0]}</b><p>${t[1]}</p><p class="gnote"><b>In the talk:</b> ${t[2]}</p></div>`).join('');
}
function notationTab(root){
  const EXS=[
   {t:'vyavasthiti ← vi + ava + √sthā + -ti',c:[['vyavasthiti','The finished word: “being established”.'],['←','“comes from”.'],['vi','A prefix (upasarga): apart, specifically.'],['+','“joined to”.'],['ava','A prefix: down, off. Together vi + ava + sthā gives the sense “to settle, be established”.'],['√sthā','The root (dhātu) sthā, “to stand”. The √ sign means “root”.'],['-ti','A suffix (pratyaya) that makes a feminine action noun: “the act of standing”.']]},
   {t:'hitvā ← √hā + -tvā',c:[['hitvā','The finished word: “having abandoned”.'],['←','“comes from”.'],['√hā','The root hā, “to abandon”. Before -tvā it becomes hi-.'],['+','“joined to”.'],['-tvā','A suffix that makes a gerund (“having …”). The hyphen means it attaches to something.']]},
   {t:'kartavyam ← √kṛ + -tavya',c:[['kartavyam','The finished word: “ought to be done”.'],['←','“comes from”.'],['√kṛ','The root kṛ, “to do”. It strengthens to kar- before -tavya.'],['+','“joined to”.'],['-tavya','A suffix making a “should be done” adjective (gerundive).']]}];
  root.innerHTML=`<p class="lead">The little symbols in the cards are a shorthand. Tap the parts of an example to read them.</p>
  <table class="wt"><tr><th>Symbol</th><th>Read it as</th></tr><tr><td><b>√kāś</b></td><td>“the root kāś” (dhātu). Say “root kaash”.</td></tr><tr><td><b>sa + √kāś</b></td><td>“prefix sa-, plus root kāś”: joined to build a word.</td></tr><tr><td><b>←</b></td><td>“comes from”</td></tr><tr><td><b>-tvā, -ti</b></td><td>a leading hyphen: a suffix (pratyaya) added after a root or stem.</td></tr><tr><td><b>pra-</b></td><td>a trailing hyphen: a prefix (upasarga) added before.</td></tr><tr><td><b>a / b</b></td><td>two forms that both exist (often short alternates).</td></tr><tr><td><b>(n.)</b> <b>(m.)</b> <b>(f.)</b></td><td>neuter / masculine / feminine</td></tr><tr><td><b>sg · du · pl</b></td><td>singular, dual (two), plural</td></tr><tr><td><b>bare stem</b></td><td>the word with no case ending, as inside a compound.</td></tr></table>
  <div class="sec">Try one</div><div class="row2" data-id="exsel">${EXS.map((e,i)=>`<button class="btn small" data-i="${i}" aria-pressed="${i===0}">Example ${i+1}</button>`).join('')}</div><div class="row2" data-id="exchips"></div><div class="wdetail" data-id="exdet" aria-live="polite">Tap a part.</div>`;
  const draw=i=>{$$('[data-id="exsel"] button',root).forEach(b=>b.setAttribute('aria-pressed',+b.dataset.i===i));$('[data-id="exchips"]',root).innerHTML=EXS[i].c.map((p,k)=>`<button class="wchip" data-k="${k}"><span class="wd" style="font-family:var(--serif)">${esc(p[0])}</span></button>`).join('');
    $$('[data-id="exchips"] .wchip',root).forEach(b=>b.onclick=()=>{$$('[data-id="exchips"] .wchip',root).forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');$('[data-id="exdet"]',root).innerHTML=`<b>${esc(EXS[i].c[+b.dataset.k][0])}</b>: ${esc(EXS[i].c[+b.dataset.k][1])}`;});$('[data-id="exdet"]',root).textContent='Tap a part.';};
  $$('[data-id="exsel"] button',root).forEach(b=>b.onclick=()=>draw(+b.dataset.i));draw(0);
}
function soundsTab(root){
  const R=[['a','u in “but”','sa'],['ā','a in “father”, held about twice as long','kāś → “kaash”'],['i / ī','i in “bit” / ee in “feet”','muktiḥ'],['u / ū','u in “put” / oo in “food”','puṇya'],['ṛ','“ri” as in “rim”','√mṛ → “mri”'],['e / o','ay in “day” / o in “go” (always long)','deśa, loka'],['ai / au','ai in “aisle” / ow in “cow”','eva, tavaiva'],['c / ch','ch in “chair” / the same with a puff of air','√muc → “much”'],['ś','sh in “shine”','kāś → “kaash”'],['ṣ','sh, with the tongue curled back','√śikṣ → “shiksh”'],['ṭ ḍ ṇ','t, d, n with the tongue curled back','puṇya'],['t d n','tongue touches the back of the teeth','√tuṣ'],['ṃ / ṁ','a soft nasal “m/ng” after the vowel','sarvaṁ'],['ḥ','a faint breath “h” echoing the vowel','muktiḥ → “muk-ti-hi”'],['j · y · v','j in “jam” · y in “yes” · between v and w','√jīv, √yāc, √vac']];
  root.innerHTML=`<p class="lead">A rough guide for English speakers. A dot under a consonant means the tongue is curled back; a bar over a vowel means hold it longer.</p><table class="wt"><tr><th>Letter</th><th>Sounds like</th><th>Example</th></tr>${R.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>`;
}
const GAL=[['a_m:veda','veda · a-stem masc.'],['a_n:phala','phala · a-stem neut.'],['aa_f:āśā','āśā · ā-stem fem.'],['i_f:mukti','mukti · i-stem fem.'],['ii_f:pṛthivī','pṛthivī · ī-stem fem.'],['n_m:agrajanman','janman · n-stem'],['pron_a:sarva','sarva · pronominal adj.'],['tad','tad · that'],['yad','yad · who/which'],['kim','kim · what?'],['idam','idam · this'],['etad','etad · this here'],['asmad','asmad · I / we'],['tvad','tvad · you'],['mahat','mahat · great'],['ahan','ahan · day'],['kr_pres','√kṛ present'],['kr_opt','√kṛ optative'],['vac_fut','√vac future'],['gam_pres','√gam present'],['is_pres','√iṣ present'],['bhu_pres','√bhū present'],['as_pres','√as present'],['as_opt','√as optative'],['as_imp','√as imperative'],['siks_opt','√śikṣ optative (ātm.)']];
function devLabel(id){const P=G.paradigms[id];return P.kind==='noun'?toDev(P.stem):toDev(P.root)+' '+toDev(P.tense.split(' (')[0]);}
function galleryTab(root,pick){
  root.innerHTML=`<p class="lead">Every table from the talk. Pick one, tap any cell for its meaning, or hide the forms and test yourself.</p><div class="rootgrid galgrid" data-id="gal">${GAL.map(([id,t])=>`<button data-pd="${esc(id)}" aria-pressed="false"><span class="dev" style="font-size:1.2rem;display:block">${esc(devLabel(id))}</span><span>${esc(t)}</span></button>`).join('')}</div>
  <div class="row2"><label><input type="checkbox" data-id="cover"> Hide the forms (tap a cell to reveal it)</label></div><div data-id="galtab"></div>`;
  const show=id=>{$$('[data-id="gal"] button',root).forEach(b=>b.setAttribute('aria-pressed',b.dataset.pd===id));$('[data-id="galtab"]',root).innerHTML=gtable(id,[],[],null);$('.gt',root).classList.toggle('covered',$('[data-id="cover"]',root).checked);};
  $$('[data-id="gal"] button',root).forEach(b=>b.onclick=()=>show(b.dataset.pd));
  $('[data-id="cover"]',root).onchange=e=>{const gt=$('.gt',root);if(gt){gt.classList.toggle('covered',e.target.checked);$$('td.revealed',gt).forEach(x=>x.classList.remove('revealed'));}};
  show(GAL.some(g=>g[0]===pick)?pick:'a_m:veda');
}


function anvayaTab(root){
  root.innerHTML=`<p class="lead"><b>Anvaya</b> (<span class="dev">अन्वय</span>, from <i>anu</i> + <i>√i</i> “to go along”) is the order of words in a plain prose sentence. Verses are written in <i>chandas</i> (metre), so the poet puts words where the rhythm needs them. Because every word carries its case ending, the meaning survives any order. To read a verse, you first re-order it.</p>
  <div class="sec">The usual recipe</div>
  <ol class="sandhi"><li><b>Connectors and calls</b>: yadyapi, tasmāt, he … (vocative)</li><li><b>Subject</b> (nominative) with its describing words</li><li><b>Time, place, means</b>: locative, instrumental, ablative words</li><li><b>Indirect object</b> (dative)</li><li><b>Object</b> (accusative) with its describing words</li><li><b>Gerund “having …”</b> just before the main verb</li><li><b>The main verb, last</b></li></ol>
  <p class="gnote">That is why case endings are so useful: <i>vittena</i> is “by wealth” wherever it stands. Words in a dashed box are ones I had to supply, because verse often leaves out “is”.</p>
  <div class="sec">Try it on the Yakṣa verse</div>${EX.anvayaHtml('V10')}`;
}
const TABS=[['cases','Cases'],['anvaya','Anvaya'],['numgen','Number & gender'],['types','Word types'],['notation','Notation'],['sounds','Sounds'],['para','Paradigms']];
const FN={anvaya:anvayaTab,cases:casesTab,numgen:numgenTab,types:typesTab,notation:notationTab,sounds:soundsTab,para:galleryTab};
let last=null;
function openGuide(spec){
  const [tab,arg]=String(spec||'cases').split(':'); const g=$('#gg'); last=document.activeElement; g.hidden=false; document.body.style.overflow='hidden';
  $('#ggtabs').innerHTML=TABS.map(([k,t])=>`<button role="tab" data-t="${k}" aria-selected="${k===tab}">${t}</button>`).join('');
  const render=(k,a)=>{$$('#ggtabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===k));FN[k]($('#ggbody'),a);};
  $$('#ggtabs button').forEach(b=>b.onclick=()=>render(b.dataset.t));
  render(FN[tab]?tab:'cases',arg); $('#ggx').focus();
}
function closeGuide(){$('#gg').hidden=true;document.body.style.overflow='';if(last&&last.focus)last.focus();}
document.addEventListener('DOMContentLoaded',()=>{$('#ggx').onclick=closeGuide;$('#gg').addEventListener('click',e=>{if(e.target.id==='gg')closeGuide();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#gg').hidden)closeGuide();});});
Object.assign(EX,{openGuide,closeGuide,casesTab,galleryTab,GAL});
})();
