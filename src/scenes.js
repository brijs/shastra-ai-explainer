/* Scenes. Each: {id, level, mood, title, html, init(root, api)} */
(function(){
const {decodeCard:DC,termCard:TC,quiz,esc,V,T}=EX; const DATA_PD=p=>{const P=EX.G.paradigms[p];return P.root+' '+P.tense.split(' (')[0]+' table';}; const P=s=>SCENES.push(s);
const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));

/* 1 Welcome */
P({id:'s1',level:0,mood:'happy',title:'Namaskāram: the question',
html:`<p class="lead">One question drives the whole talk: <b>what is the relevance of the scriptures in the age of AI?</b></p>
<button class="diya unlit" id="diya" aria-label="Light the diya"><svg viewBox="0 0 80 70"><path d="M8 40 Q40 72 72 40 Z" fill="#b5481e" stroke="#3a2a15" stroke-width="3"/><g class="flame"><path d="M40 8 Q54 26 40 38 Q26 26 40 8Z" fill="#f5b83a" stroke="#b5481e" stroke-width="2"/></g></svg></button>
<p style="text-align:center" id="diyaMsg"><i>Tap the diya to light it.</i></p>
<div class="sec">Why are you here?</div>
<div class="row2" id="intent"><button class="btn small" data-i="c">I'm curious</button><button class="btn small" data-i="i">I want inspiration</button><button class="btn small" data-i="g">I want the grammar</button></div>
<p id="intentMsg" class="lead"></p>
<div class="sec">How to read a decode card</div>
<p>Every Sanskrit line is shown in <b>Devanagari</b> and Roman letters (<b>IAST</b>). Tap a word to see its meaning and <b>dhātu</b> (root). The badge tells you how sure I am of the verse. Tap <b>Grammar guide</b> (top right) any time for cases, word types, notation and full declension tables.</p>
<p><span class="badge conf-ok">● Verified</span> matches a source · <span class="badge conf-mid">◐ Recognised</span> wording may differ · <span class="badge conf-low">○ Not matched</span> reconstructed from audio</p>`,
init(r,a){let lit=false;
 $('#diya',r).onclick=()=>{lit=!lit;$('#diya',r).classList.toggle('unlit',!lit);$('#diyaMsg',r).innerHTML=lit?'<b>The lamp is lit.</b> Tamaso mā jyotirgamaya: from darkness, lead me to light.':'<i>Tap the diya to light it.</i>';a.react(lit?'Lovely. We can begin.':'',lit?'happy':'neutral');};
 const M={c:'Curiosity is the right start. Every card ends with "why he quoted this", so you always know the point.',i:'Look for the pattern: each verse answers the question "what lasts?"',g:'Wonderful. Watch for roots (dhātu) and sandhi (how words fuse). The Word Lab at the end gathers them.'};
 $$('#intent button',r).forEach(b=>b.onclick=()=>{$('#intentMsg',r).textContent=M[b.dataset.i];a.react('Noted.','happy');});}});

/* 1b Cases */
P({id:'sg',level:0,mood:'think',title:'Eight cases, one map',
html:`<div id="cwrap"></div><div class="sec">Check yourself</div><div id="cq"></div><p><button class="btn small" data-guide="cases">Open the full Grammar guide</button></p>`,
init(r,a){EX.casesTab($('#cwrap',r),'abl');
 quiz($('#cq',r),[{q:'“Rāma comes FROM the village.” Which case marks “from the village”?',o:['Instrumental','Ablative','Dative','Locative'],a:1,e:'Ablative (pañcamī) marks the source or point of departure: grāmāt.'},{q:'“rathena” means “by chariot”. Which case is it?',o:['Genitive','Accusative','Instrumental','Vocative'],a:2,e:'Instrumental (tṛtīyā): the tool or means, with the ending -ena.'},{q:'Which case answers “whose?”',o:['Genitive','Dative','Locative','Nominative'],a:0,e:'Genitive (ṣaṣṭhī): a link between two nouns, as in rāmasya pustakam, “Rāma’s book”.'}],()=>{});}});

P(EX.SK);

/* 2 Setting + V1 */
P({id:'s2',level:0,mood:'neutral',title:'The odd man out',
html:`<p class="lead">He studied the Vedas and went to IIT. Two paths, one person. Then he opened in Sanskrit.</p>
<div class="row2" id="paths"><button class="btn small" data-p="0">Path 1: Vedas &amp; Shastras</button><button class="btn small" data-p="1">Path 2: IIT, B.Tech, teaching</button><button class="btn small" data-p="2">Both at once</button></div>
<p id="pathMsg" class="lead"></p>
<div class="sec">His opening in Sanskrit</div>${DC('V1')}`,
init(r,a){const M=['The gurukula path: memorising and understanding the Vedas, and the Shastras, under a Guru.','The modern path: IIT, then teaching there. He says people ask him "do you send children to an IIT or a Veda school?"','He calls them "seemingly orthogonal", but he walked both. That is why he can build a bridge for his IIT students.'];
 $$('#paths button',r).forEach(b=>b.onclick=()=>{$('#pathMsg',r).textContent=M[+b.dataset.p];a.react(+b.dataset.p===2?'That is the bridge.':'',+b.dataset.p===2?'happy':'neutral');});}});

/* 3 Claim: V2, V3 */
P({id:'s3',level:0,mood:'alert',title:'A non-negotiable for everyone',
html:`<p class="lead">Some give their whole life to the Veda. But his claim is bigger: <b>basic study of the Shastras is for every person.</b></p>${DC('V2')}
<div class="sec">Build the verse he quoted (Manusmṛti 2.20)</div>
<p>Tap the words in the right order. The first word is <i>etad</i>.</p>
<div class="slot" id="slot" aria-label="Your verse so far"></div><div class="row2" id="tiles"></div><p id="tmsg"></p><div id="after"></div>`,
init(r,a){
 const ws=[...V.V3.lines[0].words,...V.V3.lines[1].words]; const order=[7,2,9,4,0,5,8,1,6,3]; let nxt=0;
 const mk=i=>{const w=ws[i];const b=document.createElement('button');b.className='tile';b.innerHTML=`<span class="wd">${esc(w.d)}</span><span class="wt">${esc(w.t)}</span>`;b.dataset.i=i;return b;};
 order.forEach(i=>{const b=mk(i);b.onclick=()=>{
   if(+b.dataset.i===nxt){nxt++;b.classList.add('used');const c=mk(+b.dataset.i);c.disabled=true;$('#slot',r).appendChild(c);a.react('Right.','happy');
     if(nxt===ws.length){$('#tmsg',r).innerHTML='<span class="ok">Complete.</span> Now decode it.';$('#after',r).innerHTML=DC('V3');a.react('You built the verse.','happy');}}
   else{b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');a.react('Not that one yet. Think: what does the line begin with?','think');}};
   $('#tiles',r).appendChild(b);});}});

/* 4 Intellect */
P({id:'s4',level:1,mood:'think',title:'Train the mind first',
html:`<p class="lead"><b>Level 1: the intellect.</b> His experience: someone trained in Nyāya for years can pick up quantum physics fast. (Illustrative. His own claim, not a study.)</p>
<label for="yrs"><b>Years of Nyāya training:</b> <span id="yv">0</span></label><input type="range" id="yrs" min="0" max="12" value="0">
<div class="meter"><span>Clarity of mind</span><div class="bar"><i id="b1"></i></div><span id="p1">0%</span></div>
<p id="ymsg" class="lead">Slide to 12.</p>${TC('T-nyaya')}${TC('T-vaisadya')}`,
init(r,a){const s=$('#yrs',r);const M=['No training yet.','Learning how to ask a good question.','Learning to spot a bad argument.','Learning to define terms before debating.','Starting to hold long chains of reasoning.','Comfortable with abstraction.','Your attention steadies.','You now notice hidden assumptions.','You build counter-examples easily.','Hard texts open up.','Hard subjects look like patterns.','Almost there.','Per his claim: ready to learn quantum physics in about a year.'];
 s.oninput=()=>{const y=+s.value;$('#yv',r).textContent=y;$('#b1',r).style.width=(y/12*100)+'%';$('#p1',r).textContent=Math.round(y/12*100)+'%';$('#ymsg',r).textContent=M[y];if(y===12)a.react('That is the claim.','happy');};}});

/* 5 Transformers + V4 */
P({id:'s5',level:1,mood:'think',title:'Words that depend on each other',
html:`<p class="lead">In a Transformer, a word's representation (its <i>embedding</i>) is a weighted mix of the other words'. Tap a word. <b>The weights below are made up to illustrate,</b> not from a real model.</p>
<div class="tabs" role="tablist"><button role="tab" aria-selected="true" data-s="0">The river bank</button><button role="tab" aria-selected="false" data-s="1">The bank loan</button></div>
<div class="row2" id="toks"></div><div id="bars"></div><p id="bmsg" class="lead"></p>
<p><b>Honest caveat:</b> this is a resemblance with an old idea (<i>anvitābhidhāna</i>), not proof that the Shastras "predicted" AI. He says so himself in the next scene.</p>${DC('V4')}`,
init(r,a){
 const SENT=[['The','river','bank','was','steep'],['The','bank','approved','the','loan']];
 const W=[[[.1,.1,.1,.1,.6],[.1,.2,.1,.1,.5]], 0]; // unused
 const wts=(s,i)=>{const n=SENT[s].length;const key=s===0?2:1;let w=Array(n).fill(.05);
   if(i===key){ if(s===0){w=[.05,.55,.1,.1,.2];}else{w=[.05,.15,.3,.05,.45];} }
   else{w[i]=.4;[i-1,i+1].forEach(j=>{if(j>=0&&j<n)w[j]=.2;});w[key]=Math.max(w[key],.2);}
   const t=w.reduce((x,y)=>x+y,0);return w.map(x=>x/t);};
 let cur=0;
 const draw=()=>{const T_=$('#toks',r);T_.innerHTML='';SENT[cur].forEach((w,i)=>{const b=document.createElement('button');b.className='tile';b.innerHTML=`<span class="wd" style="font-family:var(--serif)">${w}</span>`;b.onclick=()=>show(i);T_.appendChild(b);});$('#bars',r).innerHTML='';$('#bmsg',r).textContent='Tap "bank" to see what it borrows from its neighbours.';};
 const show=i=>{const w=wts(cur,i);$('#bars',r).innerHTML=SENT[cur].map((t,k)=>`<div class="meter"><span>${t}</span><div class="bar"><i style="width:${Math.round(w[k]*100)}%"></i></div><span>${Math.round(w[k]*100)}%</span></div>`).join('');
   if(SENT[cur][i]==='bank')$('#bmsg',r).textContent=cur===0?'"bank" leans on "river" and "steep": a riverbank.':'"bank" leans on "loan" and "approved": a money bank.';else $('#bmsg',r).textContent='Each word mixes in its neighbours; most weight stays on itself.';a.react('Meaning comes from context.','happy');};
 $$('.tabs button',r).forEach(b=>b.onclick=()=>{cur=+b.dataset.s;$$('.tabs button',r).forEach(x=>x.setAttribute('aria-selected',x===b));draw();});draw();}});

/* 6 Crop and straw */
P({id:'s6',level:1,mood:'alert',title:'Crop and straw',
html:`<p class="lead">His warning: <b>don't hunt for science in the Shastras.</b> If you find some, it's like straw that comes with a crop. Choose what to plant for.</p>
<div class="row2"><button class="btn small" id="pg">Plant for the grain</button><button class="btn small" id="ps">Plant for the straw</button></div>
<div class="field" id="field" aria-hidden="true"></div>
<div class="meter"><span>Grain</span><div class="bar"><i id="gb"></i></div><span id="gv">0</span></div>
<div class="meter"><span>Straw</span><div class="bar"><i id="sb" style="background:#c8a45a"></i></div><span id="sv">0</span></div>
<p id="cmsg" class="lead"></p>${DC('V5')}`,
init(r,a){const f=$('#field',r);for(let i=0;i<14;i++){f.insertAdjacentHTML('beforeend','<div class="stalk"><div class="head"></div><div class="stem"></div></div>');}
 const run=(g)=>{$$('.stalk',f).forEach((s,i)=>{s.classList.toggle('straw',!g);setTimeout(()=>{$('.stem',s).style.height=(40+(i%4)*8)+'px';$('.head',s).style.height=g?'18px':'0';},i*40);});
  $('#gb',r).style.width=g?'100%':'0';$('#sb',r).style.width=g?'70%':'45%';$('#gv',r).textContent=g?'100':'0';$('#sv',r).textContent=g?'70':'45';
  $('#cmsg',r).textContent=g?'Plant for the grain, and you get grain and straw: the straw is a by-product.':'Plant for the straw and you only ever get straw. The real harvest is lost.';a.react(g?'Aim at the real fruit.':'Aim higher.',g?'happy':'think');};
 $('#pg',r).onclick=()=>run(true);$('#ps',r).onclick=()=>run(false);}});

/* 7 Society: AI ethics + V6 */
P({id:'s7',level:2,mood:'alert',title:'AI, and the ethics we are missing',
html:`<p class="lead"><b>Level 2: society.</b> He calls AI a <i>deva-dānava</i> force: very powerful, and we don't yet know how to handle it. The old test is simple: does it help or harm? <span id="sc"></span></p>
<div id="items"></div>${TC('T-dharma')}${DC('V6')}`,
init(r,a){const I=[['A feed tuned to keep a teenager scrolling past midnight','p'],['An AI tutor that patiently explains a hard idea to a village child','u'],['A tool that spots early disease in scans','u'],['A cloned voice used to scam a family','p'],['A weather-alert translator for farmers','u'],['A model trained to hide its flaws from auditors','p'],['A loan algorithm that quietly penalises certain postcodes','p'],['Open research that helps others build safer systems','u']];
 let done=0,ok=0;I.forEach(([t,k])=>{const d=document.createElement('div');d.className='row2';d.innerHTML=`<span style="flex:1;min-width:200px">${esc(t)}</span><button class="btn small" data-a="u">Puṇya (helps)</button><button class="btn small" data-a="p">Pāpa (harms)</button><span class="res"></span>`;
  $$('button',d).forEach(b=>b.onclick=()=>{const right=b.dataset.a===k;$$('button',d).forEach(x=>x.disabled=true);$('.res',d).innerHTML=right?'<span class="ok">✓</span>':'<span class="bad">✗ it is '+(k==='u'?'puṇya':'pāpa')+'</span>';done++;if(right)ok++;$('#sc',r).textContent=`(${ok}/${done})`;a.react(right?'Yes.':'Think about who is affected.',right?'happy':'think');if(done===I.length)a.react('The question is old; the tools are new.','happy');});
  $('#items',r).appendChild(d);});}});

/* 8 Contentment */
P({id:'s8',level:2,mood:'think',title:'Santoṣa vs. "stay hungry"',
html:`<p class="lead">He says today's metric of success is <i>produce more, consume more</i>, and people are not happy. The scriptures point to <b>contentment with what comes</b>. (An illustration of his point, not data.)</p>
<label for="mr"><b>Ambition setting:</b> <span id="mv">Enough</span></label><input type="range" id="mr" min="0" max="100" value="0">
<div class="meter"><span>Output &amp; consumption</span><div class="bar"><i id="m1"></i></div><span id="v1">0</span></div>
<div class="meter"><span>Contentment</span><div class="bar"><i id="m2" style="background:var(--green)"></i></div><span id="v2">0</span></div>
<div class="meter"><span>Pressure on nature</span><div class="bar"><i id="m3" style="background:var(--red)"></i></div><span id="v3">0</span></div>
<p id="mmsg" class="lead">Slide toward "more".</p>${TC('T-santushti')}`,
init(r,a){const s=$('#mr',r);const f=()=>{const x=+s.value;$('#mv',r).textContent=x<20?'Enough':x<60?'A little more':'Always more';$('#m1',r).style.width=x+'%';$('#v1',r).textContent=x;
 const c=Math.max(0,100-Math.round(x*1.0)+(x<20?0:0));$('#m2',r).style.width=c+'%';$('#v2',r).textContent=c;$('#m3',r).style.width=x+'%';$('#v3',r).textContent=x;
 $('#mmsg',r).textContent=x<20?'Enough: output is modest, contentment is high, nature is spared.':x<60?'Each step up asks for a little more from nature.':'Always more: the pressure on nature rises and the satisfaction does not.';};s.oninput=f;f();}});

/* 9 Mukti + V7 */
P({id:'s9',level:3,mood:'think',title:'What liberation actually is',
html:`<p class="lead"><b>Level 3: the self.</b> Mukti is not escape. It is arrival. Tap the outer ring to peel away what is <i>not you</i>.</p>
<div class="rings" id="rings"></div><p id="rmsg" class="lead" style="text-align:center">Tap a ring.</p>${DC('V7')}`,
init(r,a){const L=[['Possessions','#a3261b',240],['Titles & roles','#b5481e',194],['Body','#a8791b',150],['Moods & thoughts','#3f6b37',112]];const R=$('#rings',r);let n=0;
 L.forEach(([t,c,sz],i)=>{const d=document.createElement('button');d.className='ring';d.style.cssText=`width:${sz}px;height:${sz}px;left:${(240-sz)/2}px;top:${(240-sz)/2}px;border-color:${c};color:${c};background:transparent;z-index:${10-i}`;d.textContent=t;d.setAttribute('aria-label','Peel away '+t);d.onclick=()=>{if(i!==n){a.react('Peel the outermost ring first.','think');return;}d.classList.add('gone');n++;a.react('Let go of '+t.toLowerCase()+'.','neutral');if(n===L.length){$('.core',R).classList.add('lit');$('#rmsg',r).innerHTML='<b>svarūpa</b>: your own form. What remains when the non-self is set down.';a.react('Svarūpeṇa vyavasthitiḥ.','happy');}};R.appendChild(d);});
 R.insertAdjacentHTML('beforeend','<div class="core">svarūpa</div>');}});

/* 10 Maitreyi */
P({id:'s10',level:3,mood:'alert',title:'Maitreyī and Yājñavalkya',
html:`<p class="lead">From the Bṛhadāraṇyaka Upaniṣad. (Paraphrased dialogue.) He says "Gārgī" in the talk; in the Upaniṣad the wife is <b>Maitreyī</b>, so we use her name here.</p><div id="dlg"></div><div id="cards"></div>`,
init(r,a){const D=$('#dlg',r);const say=(c,t)=>D.insertAdjacentHTML('beforeend',`<div class="bubble ${c}">${esc(t)}</div>`);
 const ask=(opts,right,after)=>{const w=document.createElement('div');opts.forEach((o,k)=>{const b=document.createElement('button');b.className='opt';b.textContent=o;b.onclick=()=>{if(k===right){w.remove();say('b',o);after();a.react('Yes, that is the question.','happy');}else{b.classList.add('wrong');a.react('She wants more than comfort. Try again.','think');}};w.appendChild(b);});D.appendChild(w);};
 say('a','Yājñavalkya: "I am leaving home for the forest. Let me divide my wealth between you and Kātyāyanī."');
 ask(['"Then please leave me the larger share."','"If this whole earth, full of wealth, were mine, would I become immortal?"','"Who will look after the house?"'],1,()=>{
  say('a','Yājñavalkya: "No. Your life would be like the life of the rich. But there is no hope of immortality through wealth."');
  $('#cards',r).insertAdjacentHTML('beforeend',DC('V8a'));
  ask(['"Then give me a bigger house."','"What shall I do with that by which I will not become immortal? Tell me what you know."','"Then I will keep the wealth anyway."'],1,()=>{
   say('a','Yājñavalkya: "You are dear to me, and have asked a dear question. Come, sit; I will explain."');
   $('#cards',r).insertAdjacentHTML('beforeend',DC('V8b'));a.react('He calls this the most beautiful line he has seen.','happy');});});}});

/* 11 Nachiketa */
P({id:'s11',level:3,mood:'think',title:'Nachiketa refuses the world',
html:`<p class="lead">Yama offers Nachiketa wealth, long life, chariots, song and dance. The boy answers: <i>all life is short anyway</i>. The speaker, a mathematician, adds an image.</p>
<label for="zr"><b>Years of life offered:</b> 1 followed by <b id="zv">3</b> zeros</label><input type="range" id="zr" min="3" max="1000000" value="3" step="1">
<div class="meter" style="grid-template-columns:150px 1fr 70px"><span>Share of eternity</span><div class="bar"><i id="zb"></i></div><span id="zp">0%</span></div>
<p id="zmsg" class="lead">Drag all the way right: a one followed by a million zeros.</p>${DC('V9')}`,
init(r,a){const s=$('#zr',r);s.oninput=()=>{const k=+s.value;$('#zv',r).textContent=k.toLocaleString('en-US');$('#zp',r).textContent='0%';$('#zb',r).style.width='0%';
 $('#zmsg',r).textContent=k>=900000?'Even a one followed by a million zeros, set against endlessness, is still zero. It ends, so it is not what Nachiketa wants.':'Keep going. It is huge, but finite.';if(k>=900000)a.react('Finite is finite.','happy');};}});

/* 12 Yaksha */
P({id:'s12',level:3,mood:'alert',title:'The greatest wonder',
html:`<p class="lead">In the Mahābhārata a Yaksha asks Yudhiṣṭhira questions. Arrange the four quarter-lines of the answer, then reply as Yudhiṣṭhira.</p>
<div class="slot" id="slot" aria-label="Your arrangement"></div><div class="row2" id="tiles"></div><div id="q2"></div>${DC('V10')}`,
init(r,a){const P4=[['अहन्यहनि भूतानि','ahany ahani bhūtāni'],['गच्छन्तीह यमालयम्','gacchantīha yamālayam'],['शेषाः स्थावरमिच्छन्ति','śeṣāḥ sthāvaram icchanti'],['किमाश्चर्यमतः परम्','kim āścaryam ataḥ param']];let n=0;
 [2,0,3,1].forEach(i=>{const b=document.createElement('button');b.className='tile';b.innerHTML=`<span class="wd">${P4[i][0]}</span><span class="wt">${P4[i][1]}</span>`;b.onclick=()=>{if(i===n){n++;b.classList.add('used');const c=b.cloneNode(true);c.classList.remove('used');c.disabled=true;$('#slot',r).appendChild(c);a.react('Good.','happy');
  if(n===4){$('#q2',r).innerHTML='<p><b>The Yaksha asks: what is the greatest wonder?</b></p>';quiz($('#q2',r).appendChild(document.createElement('div')),[{q:'Your answer, Yudhiṣṭhira?',o:['That the sun rises every day','That beings die daily, yet the rest wish to be permanent','That rivers flow to the sea'],a:1,e:'We see death every day, yet live as if we will stay forever. That, he says, is why we plan everything as if we will never leave.'}],()=>{});}}
  else{b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');a.react('Not that one yet. Which line begins the verse?','think');}};$('#tiles',r).appendChild(b);});}});

/* 13 Close */
P({id:'s13',level:4,mood:'alert',title:'Mars, proof, and the 20-year debate',
html:`<p class="lead">He contrasts "stay hungry, stay foolish" and Mars colonies with <i>mumukṣā</i>: the ambition to be happy forever. Ask "why?" until the chain ends.</p>
<div id="chain" class="lead"></div><div class="row2"><button class="btn small" id="why">Ask "why?"</button><button class="btn small" id="alt" style="display:none">What if the aim lasted?</button></div><div id="mum"></div>
<div class="sec">The proof question</div>
<p>People ask for quick proof of things beyond the senses (<i>atīndriya</i>). He compares this to asking a physicist to prove quantum entanglement in five minutes.</p>
<label for="pr"><b>Years of preparation:</b> <span id="pv">0</span></label><input type="range" id="pr" min="0" max="20" value="0">
<p id="pmsg" class="lead">Slide to 20.</p>${TC('T-atindriya')}
<div class="sec">His invitation</div><p>He asks his students to <b>study for 20 years and then debate</b>. If they become Chārvākas, he says, at least they'll be great ones. Study first; argue second.</p>
${DC('V11')}${DC('V12')}`,
init(r,a){const C=['Why study for JEE? To get into an IIT.','Why an IIT? For a good job.','Why a job? To earn.','Why earn? To get possessions.','Why possessions? To be happy.','But all of this ends in death.'];let n=0;
 $('#why',r).onclick=()=>{if(n<C.length){$('#chain',r).insertAdjacentHTML('beforeend',`<div class="bubble ${n%2?'b':'a'}">${C[n]}</div>`);n++;if(n===C.length){$('#why',r).disabled=true;$('#alt',r).style.display='';a.react('Is there a more ambitious aim?','think');}}};
 $('#alt',r).onclick=()=>{$('#alt',r).disabled=true;$('#mum',r).innerHTML=TC('T-mumuksha');a.react('Lasting happiness. That is mumukṣā.','happy');};
 const pr=$('#pr',r);pr.oninput=()=>{const y=+pr.value;$('#pv',r).textContent=y;$('#pmsg',r).textContent=y<5?'Alphabet and basic maths: you cannot yet follow the proof.':y<12?'Calculus and linear algebra: closer.':y<20?'Advanced courses: you can follow parts of it.':'Now the proof makes sense. He says the same is true of the Shastras: preparation first.';};}});

P(EX.SX);

/* 14 Lab, quiz, cheat sheet */
P({id:'s14',level:4,mood:'happy',title:'Word lab, quiz and decoder card',
html:`<div class="tabs" role="tablist"><button role="tab" aria-selected="true" data-t="lab">Word lab</button><button role="tab" aria-selected="false" data-t="quiz">Quiz</button><button role="tab" aria-selected="false" data-t="para">Word forms</button><button role="tab" aria-selected="false" data-t="sheet">Decoder card</button></div>
<div id="tab-lab"><p class="lead">Pick a root (<i>dhātu</i>) to see every word in the talk that grows from it.</p><div class="rootgrid" id="rg"></div><div class="wdetail" id="rd">Tap a root.</div></div>
<div id="tab-para" hidden><div id="pg2"></div></div>
<div id="tab-quiz" hidden><p class="lead" id="passline"></p><div id="qz"></div></div>
<div id="tab-sheet" hidden><p class="lead">Everything in one place. Copy it to keep.</p><div class="row2"><button class="btn small" id="cp">Copy decoder card</button><span id="cpm"></span></div><pre class="sheet" id="sheet"></pre></div>`,
init(r,a){
 $$('.tabs button',r).forEach(b=>b.onclick=()=>{$$('.tabs button',r).forEach(x=>x.setAttribute('aria-selected',x===b));['lab','quiz','para','sheet'].forEach(t=>$('#tab-'+t,r).hidden=t!==b.dataset.t);if(b.dataset.t==='para'&&!$('#pg2',r).firstChild)EX.galleryTab($('#pg2',r),'kr_pres');});
 const ROOTPD={'√kṛ':['kr_pres','kr_opt'],'√vac':['vac_fut'],'√gam':['gam_pres'],'√iṣ':['is_pres'],'√bhū':['bhu_pres'],'√as':['as_pres','as_opt','as_imp'],'√śikṣ':['siks_opt']};
 const need=Math.ceil(DATA.quiz.length*0.8);$('#passline',r).textContent=`Score ${need} or more out of ${DATA.quiz.length} to earn the rank of Ācārya.`;
 const rg=$('#rg',r);DATA.roots.forEach((o,i)=>{const b=document.createElement('button');b.setAttribute('aria-pressed','false');b.innerHTML=`<span class="dev">${esc(o.dev)}</span>${esc(o.r)}`;b.onclick=()=>{$$('button',rg).forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');$('#rd',r).innerHTML=`<div class="big">${esc(o.dev)} <span class="iast">${esc(o.r)}</span></div><div><b>Meaning:</b> ${esc(o.m)}</div><div><b>Words in this talk:</b> ${o.words.map(esc).join(', ')}</div><div><b>English cousins:</b> ${esc(o.en)}</div>`+(ROOTPD[o.r]?`<div class="row2">`+ROOTPD[o.r].map(p=>`<button class="btn small" data-guide="para:${p}">See ${esc(DATA_PD(p))}</button>`).join('')+`</div>`:`<div class="gnote">Tip: pick the Word forms tab to see how verb roots and nouns inflect.</div>`);a.react('Roots connect the verses.','happy');};rg.appendChild(b);});
 quiz($('#qz',r),DATA.quiz,(s,n)=>{$('#qz',r).insertAdjacentHTML('beforeend',s>=8?`<p class="ok">You are an Ācārya. Śrīkṛṣṇārpaṇam astu.</p>`:'<p class="bad">Not yet: review the Word lab and try again by reopening this scene.</p>');if(s>=need){a.quizPassed();a.toast('Rank earned: Ācārya');a.react('Well done.','happy');}});
 const txt=DATA.verses.map(v=>`${v.id} · ${v.short}\n  ${v.lines.map(l=>l.dev).join(' / ')}\n  ${v.lines.map(l=>l.iast).join(' / ')}\n  Meaning: ${v.meaning}\n  Source: ${v.source}\n  Why he said it: ${v.why}\n`).join('\n');
 $('#sheet',r).textContent='DECODER CARD: Why Shastras in the Age of AI\n\n'+txt+'\nKey roots: '+DATA.roots.map(o=>o.r+' ('+o.m+')').join('; ');
 $('#cp',r).onclick=()=>{const t=$('#sheet',r).textContent;const ok=()=>{$('#cpm',r).textContent='Copied.';};const fb=()=>{const s=window.getSelection(),g=document.createRange();g.selectNodeContents($('#sheet',r));s.removeAllRanges();s.addRange(g);$('#cpm',r).textContent='Selected. Press Ctrl/Cmd+C.';};
  try{navigator.clipboard.writeText(t).then(ok,fb);}catch(e){fb();}};}});
})();
