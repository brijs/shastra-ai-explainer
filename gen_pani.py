"""Builds pani.json: the six kāraka definitions, Pāṇini's tag (it) rules, and step-by-step derivations that the
animated 'derivation machine' plays. Derivations are authored as operations on letter-units; every step is a snapshot."""
import json, copy

# ---------------- rules (sūtras) ----------------
def R(ref, dev, iast, plain): return ref, {'dev': dev, 'iast': iast, 'plain': plain}
RULES = dict([
 R('1.1.5',  'क्ङिति च', 'kṅiti ca', 'No guṇa or vṛddhi vowel-strengthening happens before a suffix that has a k or ṅ tag (even after the tag is deleted).'),
 R('1.3.2',  'उपदेशेऽजनुनासिक इत्', 'upadeśe \'j-anunāsika it', 'A nasalised vowel in the original text of a root or suffix is a tag.'),
 R('1.3.3',  'हलन्त्यम्', 'halantyam', 'A final consonant of a root or suffix is a tag.'),
 R('1.3.4',  'न विभक्तौ तुस्माः', 'na vibhaktau tusmāḥ', 'But the final t-class consonants, s and m of a case ending (vibhakti) are NOT tags. That is why jas, am and bhyām keep their last letter.'),
 R('1.3.5',  'आदिर्ञिटुडवः', 'ādir ñiṭuḍavaḥ', 'An initial ñi, ṭu or ḍu of a root is a tag. (ḍukṛñ → kṛ.)'),
 R('1.3.6',  'षः प्रत्ययस्य', 'ṣaḥ pratyayasya', 'An initial ṣ of a suffix is a tag.'),
 R('1.3.7',  'चुटू', 'cuṭū', 'An initial c-class or ṭ-class consonant of a suffix is a tag. (ṇvul loses ṇ; jas loses j.)'),
 R('1.3.8',  'लशक्वतद्धिते', 'laśakv-ataddhite', 'An initial l, ś or k-class consonant of a suffix, other than a taddhita suffix, is a tag. (lyuṭ loses l; ktvā loses k; ṅe loses ṅ.)'),
 R('1.3.9',  'तस्य लोपः', 'tasya lopaḥ', 'A tag is deleted.'),
 R('1.4.24', 'ध्रुवमपायेऽपादानम्', 'dhruvam apāye \'pādānam', 'The fixed point from which separation occurs is the apādāna (source).'),
 R('1.4.32', 'कर्मणा यमभिप्रैति स सम्प्रदानम्', 'karmaṇā yam abhipraiti sa sampradānam', 'The one whom the agent intends to reach through the object is the sampradāna (recipient).'),
 R('1.4.42', 'साधकतमं करणम्', 'sādhakatamaṁ karaṇam', 'The most effective means is the karaṇa (instrument).'),
 R('1.4.45', 'आधारोऽधिकरणम्', 'ādhāro \'dhikaraṇam', 'The support or substrate is the adhikaraṇa (locus).'),
 R('1.4.49', 'कर्तुरीप्सिततमं कर्म', 'kartur īpsitatamaṁ karma', 'What the agent most wishes to reach is the karman (object).'),
 R('1.4.54', 'स्वतन्त्रः कर्ता', 'svatantraḥ kartā', 'The independent one is the kartṛ (agent).'),
 R('3.1.133','ण्वुल्तृचौ', 'ṇvul-tṛcau', 'The suffixes ṇvul and tṛc form agent nouns from a root: kṛ → kāraka, kartṛ.'),
 R('3.3.117','करणाधिकरणयोश्च', 'karaṇādhikaraṇayoś ca', 'The suffix lyuṭ forms nouns meaning the instrument or the locus of an action: kṛ → karaṇa.'),
 R('7.1.1',  'युवोरनाकौ', 'yuvor anākau', 'The suffix pieces yu and vu are replaced by ana and aka.'),
 R('7.1.24', 'अतोऽम्', 'ato \'m', 'After an a-ending neuter stem, the nominative and accusative singular ending is -am.'),
 R('7.2.115','अचो ञ्णिति', 'aco ñṇiti', 'Before a suffix with a ñ or ṇ tag, the final vowel of the root grows to vṛddhi (ṛ → ār).'),
 R('7.3.84', 'सार्वधातुकार्धधातुकयोः', 'sārvadhātuka-ārdhadhātukayoḥ', 'Before most verbal and verb-derived suffixes, the root vowel strengthens to guṇa (ṛ → ar).'),
 R('8.2.66', 'ससजुषोः रुः', 'sasajuṣoḥ ruḥ', 'A word-final s becomes r (and then, at the end of a sentence, a visarga).'),
 R('8.3.15', 'खरवसानयोर्विसर्जनीयः', 'kharavasānayor visarjanīyaḥ', 'At the end of a word, r becomes a visarga (ḥ).'),
 R('8.4.1',  'रषाभ्यां नो णः समानपदे', 'raṣābhyāṁ no ṇaḥ samānapade', 'In the same word, n becomes the retroflex ṇ after r or ṣ, if only vowels and certain consonants (h, y, v, r, k-class, p-class) lie between.'),
])

# ---------------- kārakas: Pāṇini's definitions ----------------
KARAKAS = [
 {'id':'kartṛ','dev':'कर्तृ','en':'Agent','vib':'usually 1st (prathamā, nominative)','ref':'1.4.54','meaning':'The independent one is the agent.','fn':'The main instigator or doer of the action.','ex':{'dev':'देवदत्तः पचति।','iast':'devadattaḥ pacati','en':'Devadatta cooks.'}},
 {'id':'karman','dev':'कर्म','en':'Object','vib':'usually 2nd (dvitīyā, accusative)','ref':'1.4.49','meaning':'What the agent desires most to achieve is the object.','fn':'The entity most directly affected by the action.','ex':{'dev':'देवदत्तः ओदनं पचति।','iast':'devadattaḥ odanaṁ pacati','en':'Devadatta cooks rice.'}},
 {'id':'karaṇa','dev':'करण','en':'Instrument','vib':'usually 3rd (tṛtīyā, instrumental)','ref':'1.4.42','meaning':'The most effective means or helper is the instrument.','fn':'The tool or immediate instrument used to accomplish the action.','ex':{'dev':'देवदत्तः स्थाल्या ओदनं पचति।','iast':'devadattaḥ sthālyā odanaṁ pacati','en':'Devadatta cooks rice with a pot.'}},
 {'id':'sampradāna','dev':'सम्प्रदान','en':'Recipient','vib':'usually 4th (caturthī, dative)','ref':'1.4.32','meaning':'Whom one intends to reach through the object given is the recipient.','fn':'The person or thing for whom the action is performed (usually giving).','ex':{'dev':'विप्राय गां ददाति।','iast':'viprāya gāṁ dadāti','en':'He gives a cow to the scholar.'}},
 {'id':'apādāna','dev':'अपादान','en':'Source','vib':'usually 5th (pañcamī, ablative)','ref':'1.4.24','meaning':'The fixed point during separation is the source.','fn':'The starting point from which separation, movement or fear occurs.','ex':{'dev':'वृक्षात् पत्रं पतति।','iast':'vṛkṣāt patraṁ patati','en':'A leaf falls from the tree.'}},
 {'id':'adhikaraṇa','dev':'अधिकरण','en':'Locus','vib':'usually 7th (saptamī, locative)','ref':'1.4.45','meaning':'The substratum or support of the action is the locus.','fn':'The location, time or abstract domain where the action takes place.','ex':{'dev':'देवदत्तः गृहे ओदनं पचति।','iast':'devadattaḥ gṛhe odanaṁ pacati','en':'Devadatta cooks rice in the house.'}},
]
def T(d, t, en, role, gram, note): return {'d':d,'t':t,'en':en,'role':role,'gram':gram,'note':note}
SENTENCES = [
 {'id':'cook','en':'Devadatta cooks rice in the house with a pot.','tokens':[
   T('देवदत्तः','devadattaḥ','Devadatta','kartṛ','nominative singular masculine','He is the independent doer: nobody else is acting through him.'),
   T('गृहे','gṛhe','in the house','adhikaraṇa','locative singular neuter','The house is the support or setting of the cooking.'),
   T('स्थाल्या','sthālyā','with a pot','karaṇa','instrumental singular feminine','The pot is the most effective means: without it the cooking does not happen.'),
   T('ओदनम्','odanam','rice','karman','accusative singular masculine','Rice is what the cook most wishes to bring about: it is changed by the action.'),
   T('पचति','pacati','cooks','verb','√pac, present, 3rd person singular','The verb ending -ti already tells us: one agent, third person.')]},
 {'id':'give','en':'He gives a cow to the scholar.','tokens':[
   T('विप्राय','viprāya','to the scholar','sampradāna','dative singular masculine','The scholar is whom the giver intends the cow to reach.'),
   T('गाम्','gām','a cow','karman','accusative singular feminine','The cow is the thing given: the object.'),
   T('ददाति','dadāti','gives','verb','√dā, present, 3rd person singular','The ending -ti supplies “he”.')]},
 {'id':'fall','en':'A leaf falls from the tree.','tokens':[
   T('वृक्षात्','vṛkṣāt','from the tree','apādāna','ablative singular masculine','The tree is the fixed point the leaf separates from.'),
   T('पत्रम्','patram','a leaf','kartṛ','nominative singular neuter','The leaf is the one that falls, so it is the agent (kartṛ), not an object: roles come from the action, not from grammar labels.'),
   T('पतति','patati','falls','verb','√pat, present, 3rd person singular','“Falling” is an action done by the leaf.')]},
]

# ---------------- derivation machine ----------------
class Der:
    def __init__(s, id, title, result, segs, rule_note=''):
        s.id, s.title, s.result, s.rule_note = id, title, result, rule_note
        s.segs = segs; s.merged = False; s.states = []
    def _snap(s, rule, say, tag=None):
        for sg in s.segs:
            for u in sg['u']: u.setdefault('k', sg['k'])
        s.states.append({'segs': copy.deepcopy(s.segs), 'merged': s.merged, 'rule': rule, 'say': say})
        for sg in s.segs:
            for u in sg['u']:
                if u['cls'] in ('new', 'protect'): u['cls'] = ''
    def _find(s, i):
        for sg in s.segs:
            for k, u in enumerate(sg['u']):
                if u['id'] == i: return sg, k
        raise KeyError(i)
    def start(s, say): s._snap(None, say)
    def tag(s, ids, rule, say):
        for i in ids: sg, k = s._find(i); sg['u'][k]['cls'] = 'tag'
        s._snap(rule, say)
    def delete(s, ids, rule, say, ghost=()):
        for i in ids:
            sg, k = s._find(i)
            if i in ghost: sg['u'][k]['cls'] = 'ghost'
            else: del sg['u'][k]
        s._snap(rule, say)
    def replace(s, old, new, rule, say):
        sg, k = s._find(old[0])
        for i in old[1:]:
            sg2, k2 = s._find(i); del sg2['u'][k2]
        sg, k = s._find(old[0]); kk = sg['u'][k].get('k', sg['k'])
        sg['u'][k:k+1] = [{'id': i, 't': t, 'cls': 'new', 'k': kk} for i, t in new]
        s._snap(rule, say)
    def protect(s, ids, rule, say):
        for i in ids: sg, k = s._find(i); sg['u'][k]['cls'] = 'protect'
        s._snap(rule, say)
    def join(s, say, rule=None):
        units = [u for sg in s.segs for u in sg['u'] if u['cls'] != 'ghost']
        s.segs = [{'k': 'word', 'u': units}]; s.merged = True; s._snap(rule, say)
    def add(s, kind, units, rule, say):
        new = [{'id': i, 't': t, 'cls': 'new', 'k': kind} for i, t in units]
        if s.merged: s.segs[0]['u'] += new
        else: s.segs.append({'k': kind, 'u': new})
        s._snap(rule, say)
    def out(s): return {'id': s.id, 'title': s.title, 'result': s.result, 'ruleNote': s.rule_note, 'states': s.states}
def U(i, t): return {'id': i, 't': t, 'cls': ''}
def seg(k, *u): return {'k': k, 'u': list(u)}

def lyut(id, title, result, prefix=None, rule_note='3.3.117'):
    segs = ([seg('prefix', *prefix)] if prefix else []) + [seg('root', U('k1','k'), U('r1','ṛ')), seg('suffix', U('l1','l'), U('y1','y'), U('u1','u'), U('t1','ṭ'))]
    d = Der(id, title, result, segs, rule_note)
    d.start('Start with the root √kṛ (“to do”) and the raw suffix lyuṭ. By 3.3.117, lyuṭ forms words meaning the instrument or the locus of an action.' if True else '')
    d.tag(['t1'], '1.3.3', 'The last consonant of a suffix is a tag (an “it” letter). ṭ is flagged.')
    d.tag(['l1'], '1.3.8', 'An initial l, ś or k-class letter of a suffix is also a tag. l is flagged.')
    d.delete(['t1', 'l1'], '1.3.9', 'A tag is deleted. Only the working core “yu” remains.')
    d.replace(['y1', 'u1'], [('a2','a'), ('n2','n'), ('a3','a')], '7.1.1', 'The core yu is replaced by ana.')
    d.replace(['r1'], [('a1','a'), ('r2','r')], '7.3.84', 'The root vowel strengthens to guṇa: ṛ becomes ar. Nothing blocks it, because no k or ṅ tag is hiding here.')
    d.join('The pieces join: ' + ('adhi + ' if prefix else '') + 'kar + ana.')
    d.replace(['n2'], [('N2','ṇ')], '8.4.1', 'The sound r is earlier in the same word with only vowels between, so the dental n turns into the retroflex ṇ.')
    d.add('sup', [('m1','m')], '7.1.24', 'As a neuter a-stem noun, the nominative singular ending is -am. The word is complete.')
    return d.out()

def nvul():
    d = Der('karaka', 'kāraka (“doer”): kṛ + ṇvul', {'dev':'कारकः','iast':'kārakaḥ','en':'the doer'}, [seg('root', U('k1','k'), U('r1','ṛ')), seg('suffix', U('n1','ṇ'), U('v1','v'), U('u1','u'), U('l1','l'))], '3.1.133')
    d.start('Start with √kṛ and the suffix ṇvul. By 3.1.133, ṇvul forms agent nouns (the doer).')
    d.tag(['l1'], '1.3.3', 'The last consonant of a suffix is a tag. l is flagged.')
    d.tag(['n1'], '1.3.7', 'An initial c-class or ṭ-class consonant of a suffix is a tag. ṇ belongs to the ṭ-class, so it is flagged.')
    d.delete(['l1', 'n1'], '1.3.9', 'Both tags are deleted. But look: the ṇ leaves a faint ghost. Pāṇini’s rules still “remember” that the suffix had a ṇ tag.', ghost=['n1'])
    d.replace(['v1', 'u1'], [('a2','a'), ('k2','k'), ('a3','a')], '7.1.1', 'The core vu is replaced by aka.')
    d.replace(['r1'], [('a1','ā'), ('r2','r')], '7.2.115', 'Because the suffix had a ṇ tag, the root vowel grows to its fullest strength, vṛddhi: ṛ becomes ār. The ghost has done its job.')
    d.join('The ghost vanishes and the pieces join: kār + aka.')
    d.add('sup', [('h1','ḥ')], '8.3.15', 'As a masculine noun, the nominative singular ends in s, which becomes r and then a visarga (8.2.66, 8.3.15): kārakaḥ.')
    return d.out()

def trc():
    d = Der('kartr', 'kartṛ (“doer”): kṛ + tṛc', {'dev':'कर्तृ','iast':'kartṛ','en':'the doer (stem)'}, [seg('root', U('k1','k'), U('r1','ṛ')), seg('suffix', U('t1','t'), U('rr','ṛ'), U('c1','c'))], '3.1.133')
    d.start('Start with √kṛ and the other agent suffix, tṛc (also from 3.1.133).')
    d.tag(['c1'], '1.3.3', 'The last consonant of a suffix is a tag. c is flagged.')
    d.delete(['c1'], '1.3.9', 'The tag is deleted. The core tṛ remains.')
    d.replace(['r1'], [('a1','a'), ('r2','r')], '7.3.84', 'The root vowel strengthens to guṇa: ṛ becomes ar.')
    d.join('The pieces join: kar + tṛ = kartṛ. This is Pāṇini’s own word for the agent. Its nominative singular is kartā.')
    return d.out()

def ktva():
    d = Der('krtva', 'kṛtvā (“having done”): kṛ + ktvā', {'dev':'कृत्वा','iast':'kṛtvā','en':'having done'}, [seg('root', U('k1','k'), U('r1','ṛ')), seg('suffix', U('k2','k'), U('t1','t'), U('v1','v'), U('a1','ā'))], '1.1.5')
    d.start('Start with √kṛ and the gerund suffix ktvā (“having …”), like hitvā and yācitvā in the verses.')
    d.tag(['k2'], '1.3.8', 'An initial k-class letter of a suffix is a tag. k is flagged.')
    d.delete(['k2'], '1.3.9', 'The tag is deleted, but it leaves a ghost: the suffix is still “kit” (it had a k tag).', ghost=['k2'])
    d.protect(['r1'], '1.1.5', 'Because of the ghost k, guṇa and vṛddhi are blocked. The vowel stays a short ṛ. Compare the guṇa in kar-aṇa and the vṛddhi in kār-aka.')
    d.join('The ghost vanishes and the pieces join: kṛ + tvā = kṛtvā. It is indeclinable, so no case ending is added.')
    return d.out()

DERS = [
 lyut('karana', 'karaṇa (“instrument”): kṛ + lyuṭ', {'dev':'करणम्','iast':'karaṇam','en':'the instrument'}),
 lyut('adhikarana', 'adhikaraṇa (“locus”): adhi + kṛ + lyuṭ', {'dev':'अधिकरणम्','iast':'adhikaraṇam','en':'the locus'}, prefix=[U('a0','a'), U('dh0','dh'), U('i0','i')]),
 nvul(), trc(), ktva(),
]

# ---------------- tag-spotting game ----------------
GAME = [
 {'s':'lyuṭ','letters':['l','y','u','ṭ'],'tags':{'l':'1.3.8','ṭ':'1.3.3'},'protected':{},'core':'yu'},
 {'s':'ṇvul','letters':['ṇ','v','u','l'],'tags':{'ṇ':'1.3.7','l':'1.3.3'},'protected':{},'core':'vu'},
 {'s':'ktvā','letters':['k','t','v','ā'],'tags':{'k':'1.3.8'},'protected':{},'core':'tvā'},
 {'s':'tṛc','letters':['t','ṛ','c'],'tags':{'c':'1.3.3'},'protected':{},'core':'tṛ'},
 {'s':'jas','letters':['j','a','s'],'tags':{'j':'1.3.7'},'protected':{'s':'1.3.4'},'core':'as'},
 {'s':'ṅe','letters':['ṅ','e'],'tags':{'ṅ':'1.3.8'},'protected':{},'core':'e'},
]
# ---------------- vowel grades ----------------
GRADES = {'rule':'Guṇa: a→a, i/ī→e, u/ū→o, ṛ/ṝ→ar. Vṛddhi: a→ā, i/ī→ai, u/ū→au, ṛ/ṝ→ār.','rows':[
  {'root':'√kṛ','basic':'kṛ','guna':'kar','vrddhi':'kār','gw':'karaṇa, kartavya (V1)','vw':'kāraka'},
  {'root':'√vid','basic':'vid','guna':'ved','vrddhi':'vaid','gw':'veda (V2)','vw':'vaidya'},
  {'root':'√bhū','basic':'bhū','guna':'bho → bhav-','vrddhi':'bhau → bhāv-','gw':'bhavati (V5)','vw':'bhāva'}]}

out = {'rules': RULES, 'karakas': KARAKAS, 'sentences': SENTENCES, 'derivations': DERS, 'game': GAME, 'grades': GRADES}
# sanity: every rule cited exists
cited = set()
for d in DERS:
    for st in d['states']:
        if st['rule']: cited.add(st['rule'])
for g in GAME:
    cited |= set(g['tags'].values()) | set(g['protected'].values())
for k in KARAKAS: cited.add(k['ref'])
missing = [c for c in cited if c not in RULES]; assert not missing, missing
# sanity: final strings
def final(d):
    st = d['states'][-1]; return ''.join(u['t'] for sg in st['segs'] for u in sg['u'] if u['cls'] != 'ghost')
exp = {'karana':'karaṇam','adhikarana':'adhikaraṇam','karaka':'kārakaḥ','kartr':'kartṛ','krtva':'kṛtvā'}
for d in DERS: assert final(d) == exp[d['id']], (d['id'], final(d))
json.dump(out, open('pani.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('rules', len(RULES), '| derivations', [(d['id'], len(d['states'])) for d in DERS], '| finals ok')
