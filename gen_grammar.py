"""Generates grammar.json: declension/conjugation tables + per-word grammatical annotations.
Every annotated word is VERIFIED: its form must appear in the generated table cell it claims. Run: python3 gen_grammar.py"""
import json, sys, re
V = json.load(open('verses.json', encoding='utf-8'))['verses']
WT = {}
for v in V:
    for li, l in enumerate(v['lines']):
        for wi, w in enumerate(l['words']): WT[f"{v['id']}:{li}:{wi}"] = w['t']
CASES = ['nom', 'acc', 'ins', 'dat', 'abl', 'gen', 'loc', 'voc']; CI = {c: i for i, c in enumerate(CASES)}
NUMS = ['sg', 'du', 'pl']; NI = {n: i for i, n in enumerate(NUMS)}

# ---------- retroflexion (ṇatva) ----------
VOWEL = set('aāiīuūṛṝeo'); ALLOW = set('hyvrkgṅpbmṃṁ')
def natva(base, ending):
    w = base + ending; out = list(w)
    for i in range(len(base), len(w)):
        if w[i] != 'n': continue
        nxt = w[i + 1] if i + 1 < len(w) else ''
        if nxt == '' or nxt not in 'aāiīuūṛeoynmv': continue
        j = i - 1; hit = False
        while j >= 0:
            c = w[j]
            if c in 'rṛṝṣ': hit = True; break
            if c in VOWEL or c in ALLOW: j -= 1; continue
            break
        if hit: out[i] = 'ṇ'
    return ''.join(out)
def build(base, rows):
    return [[' / '.join(natva(base, e) if e and e[0] not in '—' else e for e in cell.split(' / ')) for cell in row] for row in rows]
def build_plain(base, rows):  # no prefix handling needed
    return build(base, rows)

# ---------- regular noun classes: endings after removing the final vowel(s) of the stem ----------
E = {
 'a_m': ('a', [['aḥ','au','āḥ'],['am','au','ān'],['ena','ābhyām','aiḥ'],['āya','ābhyām','ebhyaḥ'],['āt','ābhyām','ebhyaḥ'],['asya','ayoḥ','ānām'],['e','ayoḥ','eṣu'],['a','au','āḥ']]),
 'a_n': ('a', [['am','e','āni'],['am','e','āni'],['ena','ābhyām','aiḥ'],['āya','ābhyām','ebhyaḥ'],['āt','ābhyām','ebhyaḥ'],['asya','ayoḥ','ānām'],['e','ayoḥ','eṣu'],['a','e','āni']]),
 'aa_f': ('ā', [['ā','e','āḥ'],['ām','e','āḥ'],['ayā','ābhyām','ābhiḥ'],['āyai','ābhyām','ābhyaḥ'],['āyāḥ','ābhyām','ābhyaḥ'],['āyāḥ','ayoḥ','ānām'],['āyām','ayoḥ','āsu'],['e','e','āḥ']]),
 'i_f': ('i', [['iḥ','ī','ayaḥ'],['im','ī','īḥ'],['yā','ibhyām','ibhiḥ'],['yai / aye','ibhyām','ibhyaḥ'],['yāḥ / eḥ','ibhyām','ibhyaḥ'],['yāḥ / eḥ','yoḥ','īnām'],['yām / au','yoḥ','iṣu'],['e','ī','ayaḥ']]),
 'ii_f': ('ī', [['ī','yau','yaḥ'],['īm','yau','īḥ'],['yā','ībhyām','ībhiḥ'],['yai','ībhyām','ībhyaḥ'],['yāḥ','ībhyām','ībhyaḥ'],['yāḥ','yoḥ','īnām'],['yām','yoḥ','īṣu'],['i','yau','yaḥ']]),
 'n_m': ('an', [['ā','ānau','ānaḥ'],['ānam','ānau','anaḥ'],['anā','abhyām','abhiḥ'],['ane','abhyām','abhyaḥ'],['anaḥ','abhyām','abhyaḥ'],['anaḥ','anoḥ','anām'],['ani','anoḥ','asu'],['an','ānau','ānaḥ']]),
}
# pronominal-adjective pattern (sarva, sva, para …)
PRON_M = [['aḥ','au','e'],['am','au','ān'],['ena','ābhyām','aiḥ'],['asmai','ābhyām','ebhyaḥ'],['asmāt','ābhyām','ebhyaḥ'],['asya','ayoḥ','eṣām'],['asmin','ayoḥ','eṣu'],['a','au','e']]
PRON_N = [r[:] for r in PRON_M]; PRON_N[0] = ['am','e','āni']; PRON_N[1] = ['am','e','āni']; PRON_N[7] = ['a','e','āni']
GENDER_LABEL = {'m': 'masculine', 'f': 'feminine', 'n': 'neuter', 'x': ''}
PARAD = {}
def noun_table(cls, stem):
    pid = f'{cls}:{stem}'
    if pid in PARAD: return pid
    strip, rows = E[cls]; assert stem.endswith(strip), (stem, cls); base = stem[:-len(strip)]
    g = cls[-1]
    PARAD[pid] = {'id': pid, 'kind': 'noun', 'stem': stem, 'gender': g, 'forms': {g: build(base, rows)}, 'pattern': {'a_m': 'a-stem masculine (like deva)', 'a_n': 'a-stem neuter (like phala)', 'aa_f': 'ā-stem feminine (like latā)', 'i_f': 'i-stem feminine (like mati)', 'ii_f': 'ī-stem feminine (like nadī)', 'n_m': 'n-stem masculine (like rājan)'}[cls], 'note': ''}
    return pid
def pron_a_table(stem):
    pid = f'pron_a:{stem}'
    if pid in PARAD: return pid
    base = stem[:-1]
    PARAD[pid] = {'id': pid, 'kind': 'noun', 'stem': stem, 'gender': 'mn', 'forms': {'m': build(base, PRON_M), 'n': build(base, PRON_N)}, 'pattern': f'pronominal adjective ({stem}), pronoun-like endings in dative/ablative/locative', 'note': 'Feminine forms follow the ā-stem pattern with pronoun-style endings, e.g. sarvasyai.'}
    return pid
def explicit(pid, stem, gender, forms, pattern, note=''):
    PARAD[pid] = {'id': pid, 'kind': 'noun', 'stem': stem, 'gender': gender, 'forms': forms, 'pattern': pattern, 'note': note}; return pid
def rows3(lst): return [r.split('|') for r in lst]
def mn(m, n_override):  # neuter = masculine with nom/acc overridden
    n = [r[:] for r in m]
    for k, v in n_override.items(): n[k] = v
    return n
tad_m = rows3(['saḥ|tau|te','tam|tau|tān','tena|tābhyām|taiḥ','tasmai|tābhyām|tebhyaḥ','tasmāt|tābhyām|tebhyaḥ','tasya|tayoḥ|teṣām','tasmin|tayoḥ|teṣu','—|—|—'])
yad_m = rows3(['yaḥ|yau|ye','yam|yau|yān','yena|yābhyām|yaiḥ','yasmai|yābhyām|yebhyaḥ','yasmāt|yābhyām|yebhyaḥ','yasya|yayoḥ|yeṣām','yasmin|yayoḥ|yeṣu','—|—|—'])
kim_m = rows3(['kaḥ|kau|ke','kam|kau|kān','kena|kābhyām|kaiḥ','kasmai|kābhyām|kebhyaḥ','kasmāt|kābhyām|kebhyaḥ','kasya|kayoḥ|keṣām','kasmin|kayoḥ|keṣu','—|—|—'])
idam_m = rows3(['ayam|imau|ime','imam / enam|imau / enau|imān / enān','anena|ābhyām|ebhiḥ','asmai|ābhyām|ebhyaḥ','asmāt|ābhyām|ebhyaḥ','asya|anayoḥ|eṣām','asmin|anayoḥ|eṣu','—|—|—'])
etad_m = rows3(['eṣaḥ|etau|ete','etam / enam|etau / enau|etān / enān','etena|etābhyām|etaiḥ','etasmai|etābhyām|etebhyaḥ','etasmāt|etābhyām|etebhyaḥ','etasya|etayoḥ|eteṣām','etasmin|etayoḥ|eteṣu','—|—|—'])
PN = 'Pronouns have no vocative. Feminine forms differ (e.g. sā, tām, tayā) and are not shown.'
explicit('tad', 'tad', 'mn', {'m': tad_m, 'n': mn(tad_m, {0: ['tat','te','tāni'], 1: ['tat','te','tāni']})}, 'pronoun tad ("that, he/she/it")', PN)
explicit('yad', 'yad', 'mn', {'m': yad_m, 'n': mn(yad_m, {0: ['yat','ye','yāni'], 1: ['yat','ye','yāni']})}, 'relative pronoun yad ("who, which, what")', PN + ' Before a vowel or voiced sound, yat is written yad.')
explicit('kim', 'kim', 'mn', {'m': kim_m, 'n': mn(kim_m, {0: ['kim','ke','kāni'], 1: ['kim','ke','kāni']})}, 'interrogative pronoun kim ("who? what?")', PN)
explicit('idam', 'idam', 'mn', {'m': idam_m, 'n': mn(idam_m, {0: ['idam','ime','imāni'], 1: ['idam','ime','imāni']})}, 'pronoun idam ("this")', PN + ' The enam/enau/enān forms are short, unstressed alternates.')
explicit('etad', 'etad', 'mn', {'m': etad_m, 'n': mn(etad_m, {0: ['etat','ete','etāni'], 1: ['etat','ete','etāni']})}, 'pronoun etad ("this here")', PN)
explicit('asmad', 'asmad', 'x', {'x': rows3(['aham|āvām|vayam','mām / mā|āvām / nau|asmān / naḥ','mayā|āvābhyām|asmābhiḥ','mahyam / me|āvābhyām / nau|asmabhyam / naḥ','mat|āvābhyām|asmat','mama / me|āvayoḥ / nau|asmākam / naḥ','mayi|āvayoḥ|asmāsu','—|—|—'])}, 'first-person pronoun ("I, we")', 'Same for all genders. Forms after "/" (mā, me, nau, naḥ) are short, unstressed alternates. No vocative.')
explicit('tvad', 'tvad', 'x', {'x': rows3(['tvam|yuvām|yūyam','tvām / tvā|yuvām / vām|yuṣmān / vaḥ','tvayā|yuvābhyām|yuṣmābhiḥ','tubhyam / te|yuvābhyām / vām|yuṣmabhyam / vaḥ','tvat|yuvābhyām|yuṣmat','tava / te|yuvayoḥ / vām|yuṣmākam / vaḥ','tvayi|yuvayoḥ|yuṣmāsu','—|—|—'])}, 'second-person pronoun ("you")', 'Same for all genders. Forms after "/" are short, unstressed alternates. No vocative.')
explicit('ahan', 'ahan', 'n', {'n': rows3(['ahaḥ|ahnī / ahanī|ahāni','ahaḥ|ahnī / ahanī|ahāni','ahnā|ahobhyām|ahobhiḥ','ahne|ahobhyām|ahobhyaḥ','ahnaḥ|ahobhyām|ahobhyaḥ','ahnaḥ|ahnoḥ|ahnām','ahni / ahani|ahnoḥ|ahaḥsu / ahassu','ahaḥ|ahnī / ahanī|ahāni'])}, 'n-stem neuter ahan ("day"), irregular', 'The nominative is also seen as ahar. Day: ahan. The stem shortens (ahn-) before vowel endings.')
explicit('mahat', 'mahat', 'mn', {'m': rows3(['mahān|mahāntau|mahāntaḥ','mahāntam|mahāntau|mahataḥ','mahatā|mahadbhyām|mahadbhiḥ','mahate|mahadbhyām|mahadbhyaḥ','mahataḥ|mahadbhyām|mahadbhyaḥ','mahataḥ|mahatoḥ|mahatām','mahati|mahatoḥ|mahatsu','mahan|mahāntau|mahāntaḥ']), 'n': rows3(['mahat|mahatī|mahānti','mahat|mahatī|mahānti','mahatā|mahadbhyām|mahadbhiḥ','mahate|mahadbhyām|mahadbhyaḥ','mahataḥ|mahadbhyām|mahadbhyaḥ','mahataḥ|mahatoḥ|mahatām','mahati|mahatoḥ|mahatsu','mahat|mahatī|mahānti'])}, 't-stem adjective mahat ("great")', 'Adjectives take the gender, case and number of the noun they describe. Feminine: mahatī.')

# ---------- verbs ----------
PERS = ['prathama (3rd person: he/she/it/they)', 'madhyama (2nd person: you)', 'uttama (1st person: I/we)']
def vt(pid, root, meaning, tense, voice, rows, gana, note='', prefix=''):
    PARAD[pid] = {'id': pid, 'kind': 'verb', 'root': root, 'meaning': meaning, 'tense': tense, 'voice': voice, 'gana': gana, 'forms': {'x': rows3(rows)}, 'note': note, 'prefix': prefix}; return pid
vt('kr_pres', '√kṛ', 'to do, make', 'laṭ (present)', 'parasmaipada', ['karoti|kurutaḥ|kurvanti','karoṣi|kurutaḥ|kurutha','karomi|kurvaḥ|kurmaḥ'], '8th class (tanādi)', 'The root changes shape: kar- (strong) and kur- (weak).')
vt('kr_opt', '√kṛ', 'to do, make', 'vidhiliṅ (optative: "should/may")', 'parasmaipada', ['kuryāt|kuryātām|kuryuḥ','kuryāḥ|kuryātam|kuryāta','kuryām|kuryāva|kuryāma'], '8th class (tanādi)', 'The optative expresses wish, possibility or "should".')
vt('vac_fut', '√vac', 'to speak', 'lṛṭ (future)', 'parasmaipada', ['vakṣyati|vakṣyataḥ|vakṣyanti','vakṣyasi|vakṣyathaḥ|vakṣyatha','vakṣyāmi|vakṣyāvaḥ|vakṣyāmaḥ'], '2nd class (adādi)', 'In the verse the prefix pra- is added: pra-vakṣyāmi.', 'pra')
vt('gam_pres', '√gam', 'to go', 'laṭ (present)', 'parasmaipada', ['gacchati|gacchataḥ|gacchanti','gacchasi|gacchathaḥ|gacchatha','gacchāmi|gacchāvaḥ|gacchāmaḥ'], '1st class (bhvādi)', 'The root gam- becomes gaccha- before endings.')
vt('is_pres', '√iṣ', 'to wish', 'laṭ (present)', 'parasmaipada', ['icchati|icchataḥ|icchanti','icchasi|icchathaḥ|icchatha','icchāmi|icchāvaḥ|icchāmaḥ'], '6th class (tudādi)', 'The root iṣ- becomes iccha- before endings.')
vt('bhu_pres', '√bhū', 'to be, become', 'laṭ (present)', 'parasmaipada', ['bhavati|bhavataḥ|bhavanti','bhavasi|bhavathaḥ|bhavatha','bhavāmi|bhavāvaḥ|bhavāmaḥ'], '1st class (bhvādi)', 'The vowel strengthens: bhū → bhav-.')
vt('as_pres', '√as', 'to be', 'laṭ (present)', 'parasmaipada', ['asti|staḥ|santi','asi|sthaḥ|stha','asmi|svaḥ|smaḥ'], '2nd class (adādi)', 'Irregular: the a of the root drops in many forms (staḥ, santi).')
vt('as_opt', '√as', 'to be', 'vidhiliṅ (optative: "should/may")', 'parasmaipada', ['syāt|syātām|syuḥ','syāḥ|syātam|syāta','syām|syāva|syāma'], '2nd class (adādi)', 'Here the root appears only as s-.')
vt('as_imp', '√as', 'to be', 'loṭ (imperative: "let it be")', 'parasmaipada', ['astu|stām|santu','edhi|stam|sta','asāni|asāva|asāma'], '2nd class (adādi)', 'Command, blessing or permission: "let it be".')
vt('siks_opt', '√śikṣ', 'to learn (wish to be able)', 'vidhiliṅ (optative: "should/may")', 'ātmanepada', ['śikṣeta|śikṣeyātām|śikṣeran','śikṣethāḥ|śikṣeyāthām|śikṣedhvam','śikṣeya|śikṣevahi|śikṣemahi'], '1st class (bhvādi)', 'Ātmanepada endings: the action is "for oneself".')

# ---------- annotations ----------
POS = {'noun': 'noun', 'adj': 'adjective', 'pron': 'pronoun', 'verb': 'verb', 'part': 'participle', 'gerund': 'gerund', 'ger_ive': 'gerundive', 'indecl': 'indeclinable', 'cmem': 'compound member'}
WORDS = {}
def pid_for(cls, stem): return pron_a_table(stem) if cls == 'pron_a' else noun_table(cls, stem) if cls in E else cls
def form_cells(pid, g, case, num):
    P = PARAD[pid]; gk = g if g in P['forms'] else ('x' if 'x' in P['forms'] else list(P['forms'])[0])
    return P['forms'][gk][CI[case]][NI[num]], gk
def label(case, num, g):
    c = {'nom':'Nom.','acc':'Acc.','ins':'Instr.','dat':'Dat.','abl':'Abl.','gen':'Gen.','loc':'Loc.','voc':'Voc.'}[case]
    return f"{c} {num}." + (f" {g}." if g in ('m', 'f', 'n') else '')
def A(key, pos, cls=None, stem=None, case=None, num=None, g=None, use=None, form=None, alt=None, note=None, cmp=None, sub=None):
    """Annotate one word (or part of a composite word). alt: list of (case,num) also valid (same spelling)."""
    t = form or WT[key]
    ent = {'pos': POS[pos], 'use': use or '', 'note': note or '', 'cmp': cmp or ''}
    if cls:
        pid = pid_for(cls, stem); ent['pd'] = pid
        if case:
            cell, gk = form_cells(pid, g, case, num)
            assert t in [x.strip() for x in cell.split('/')] or t.replace('ṁ', 'm') in [x.strip() for x in cell.split('/')], f'{key}: {t!r} not in cell {cell!r} of {pid} ({case} {num})'
            ent['hit'] = [[CI[case], NI[num]]]; ent['gk'] = gk
            for (c2, n2) in (alt or []):
                cell2, _ = form_cells(pid, g, c2, n2); assert t in [x.strip() for x in cell2.split('/')], f'{key}: alt {c2} {n2} -> {cell2!r}'
                ent.setdefault('alt', []).append([CI[c2], NI[n2]])
            ent['case'] = case; ent['num'] = num; ent['gen'] = g; ent['label'] = label(case, num, g)
        ent['stem'] = stem
    ent['form'] = t
    if sub: return ent
    WORDS[key] = ent; return ent
def Vb(key, pid, pr, num, use=None, form=None, note=None, cmp=None, sub=False):
    t = form or WT[key]; P = PARAD[pid]; r, c = {'3': 0, '2': 1, '1': 2}[pr], NI[num]
    cell = P['forms']['x'][r][c]
    assert t == cell or t in [x.strip() for x in cell.split('/')], f'{key}: {t!r} vs {cell!r} in {pid}'
    ent = {'pos': 'verb', 'pd': pid, 'hit': [[r, c]], 'use': use or '', 'note': note or '', 'cmp': cmp or '', 'form': t, 'root': P['root'], 'label': f"{P['tense'].split(' ')[0]} {pr}{ {'sg':'sg','du':'du','pl':'pl'}[num]}.", 'person': pr, 'num': num}
    if sub: return ent
    WORDS[key] = ent; return ent
def I(key, use=None, note=None, form=None, cmp=None, pos='indecl'):
    WORDS[key] = {'pos': POS[pos], 'use': use or '', 'note': note or '', 'cmp': cmp or '', 'form': form or WT[key], 'label': 'indeclinable' if pos == 'indecl' else POS[pos]}
def IP(form, use='', note=''):
    return {'pos': 'indeclinable', 'label': 'indeclinable', 'form': form, 'use': use, 'note': note}
def M(key, parts, use=None):
    WORDS[key] = {'pos': 'composite', 'multi': parts, 'use': use or '', 'form': WT[key]}

# V1
I('V1:0:0', 'although', 'yad + api: "even what", i.e. "although".', cmp='yad + api')
I('V1:0:1', 'everywhere', 'sarva + -tra: the -tra ending makes "in/at" adverbs (tatra "there", atra "here").')
A('V1:0:2', 'noun', 'a_n', 'bhāratavarṣa', 'loc', 'sg', 'n', 'in Bharatavarsha: the place where the action happens.', cmp='bhārata + varṣa (the "region of Bharata")')
A('V1:0:3', 'pron', 'asmad', 'asmad', 'ins', 'pl', None, 'by us: with a "should be done" verb, the doer takes the instrumental.', note='asmad = "we" (first-person pronoun).')
I('V1:0:4', 'always', 'sarva + -dā: the -dā ending makes "at the time" adverbs (tadā "then", yadā "when").')
A('V1:0:5', 'noun', 'aa_f', 'gīrvāṇabhāṣā', 'ins', 'sg', 'f', 'by means of the language of the gods: the instrument.', cmp='gīrvāṇa + bhāṣā')
A('V1:0:6', 'adj', 'a_n', 'vyavahārādika', 'nom', 'sg', 'n', 'dealings and so on: the thing that ought to be done (subject of the passive).', alt=[('acc', 'sg')], cmp='vyavahāra + ādika ("beginning with")')
A('V1:0:7', 'ger_ive', 'a_n', 'kartavya', 'nom', 'sg', 'n', 'ought to be done: -tavya makes a "should be done" adjective from √kṛ.', alt=[('acc', 'sg')], note='Gerundive (kṛtya): √kṛ + -tavya.')
A('V1:1:0', 'pron', 'tad', 'tad', 'abl', 'sg', 'n', 'therefore: "from that", i.e. for that reason.', alt=[('abl','sg')], note='The ablative of tad is used as "therefore".')
A('V1:1:1', 'pron', 'asmad', 'asmad', 'nom', 'sg', None, 'I: the doer.')
I('V1:1:2', 'now', note='From idam ("this") + a time ending.')
A('V1:1:3', 'noun', 'a_m', 'vāgvyāpāra', 'acc', 'sg', 'm', 'the work of speech: the thing being done (object).', cmp='vāc + vyāpāra')
A('V1:1:4', 'noun', 'aa_f', 'mlecchabhāṣā', 'ins', 'sg', 'f', 'in/with a mleccha tongue: the means.', cmp='mleccha + bhāṣā')
Vb('V1:1:5', 'kr_pres', '1', 'sg', 'I do: first person singular, present.')
A('V1:2:0', 'noun', 'aa_f', 'kṣamā', 'acc', 'sg', 'f', 'pardon: what is being begged (object of yācitvā).')
I('V1:2:1', 'having begged', '√yāc + -tvā: the "having done" ending makes a gerund (absolutive). It never changes form.', pos='gerund')
# V2
A('V2:0:0', 'adj', 'a_m', 'puṇyatama', 'nom', 'pl', 'm', 'the most meritorious ones: subject.', form='puṇyatamāḥ', note='Written puṇyatamā before a voiced sound (visarga drops).', cmp='puṇya + -tama ("most")')
A('V2:0:1', 'adj', 'a_m', 'mahābhāga', 'nom', 'pl', 'm', 'the greatly fortunate ones: subject.', form='mahābhāgāḥ', cmp='mahā + bhāga')
A('V2:0:2', 'adj', 'a_m', 'maheśasadṛśa', 'nom', 'pl', 'm', 'like Maheśa: describes the same people.', form='maheśasadṛśāḥ', cmp='maheśa + sadṛśa')
A('V2:0:3', 'pron', 'yad', 'yad', 'nom', 'pl', 'm', 'who: the relative pronoun; links the clause to the people described.')
A('V2:0:4', 'noun', 'a_m', 'veda', 'acc', 'sg', 'm', 'the Veda: object (of the dedication).')
# V3
A('V3:0:0', 'pron', 'etad', 'etad', None, None, None, 'this: first member of the compound etad-deśa-prasūta.', form='etad', cmp='etad + deśa + prasūta', note='In a compound, the first members appear in their bare stem form; only the last member takes the case ending. The ending on prasūtasya applies to the whole compound.')
A('V3:0:1', 'noun', 'a_m', 'deśa', None, None, 'm', 'land: second member of the compound.', form='deśa', note='Bare stem inside a compound. Shown: how deśa declines on its own.')
A('V3:0:2', 'part', 'a_m', 'etaddeśaprasūta', 'gen', 'sg', 'm', 'of one born in this land: the genitive for the whole compound.', form='etaddeśaprasūtasya', note='prasūta = pra + √sū + -ta ("born"), a past participle. The compound qualifies agrajanmanaḥ.', cmp='etad + deśa + prasūta')
A('V3:0:3', 'noun', 'a_m', 'sakāśa', 'abl', 'sg', 'm', 'from the presence of: the source one learns from.', note='sakāśāt functions almost like a postposition "from".')
A('V3:0:4', 'noun', 'n_m', 'agrajanman', 'gen', 'sg', 'm', 'of the foremost-born: whose presence it is.', alt=[('abl', 'sg')], cmp='agra + janman', note='Genitive and ablative singular are spelled the same here. The sense is "of the foremost-born".')
A('V3:1:0', 'pron', 'pron_a', 'sva', 'acc', 'sg', 'n', 'each their own: repeating a word means "each one’s".', form='svam', note='The repetition svaṁ svam means "each their own".')
A('V3:1:1', 'noun', 'a_n', 'caritra', 'acc', 'sg', 'n', 'conduct: what is to be learned (object).')
Vb('V3:1:2', 'siks_opt', '3', 'pl', 'should learn: "let them learn".')
A('V3:1:3', 'noun', 'ii_f', 'pṛthivī', 'loc', 'sg', 'f', 'on the earth: location.')
A('V3:1:4', 'adj', 'a_m', 'sarvamānava', 'nom', 'pl', 'm', 'all humans: the learners (subject).', cmp='sarva + mānava')
# V4
A('V4:0:0', 'pron', 'pron_a', 'sarva', 'gen', 'pl', 'm', 'of all: relates the power to the words.', alt=[], note='Same spelling in the neuter.')
A('V4:0:1', 'noun', 'a_m', 'śabda', 'gen', 'pl', 'm', 'of words: whose power it is.')
A('V4:0:2', 'noun', 'a_m', 'svārtha', 'loc', 'sg', 'm', 'in their own meaning: where the power lies.', cmp='sva + artha')
A('V4:0:3', 'noun', 'i_f', 'śakti', 'nom', 'sg', 'f', 'power: the subject of the statement.')
# V5
A('V5:0:0', 'part', 'a_n', 'labhya', 'nom', 'sg', 'n', 'obtainable: -ya makes a "can be obtained" adjective from √labh.', alt=[('acc', 'sg')], note='Potential passive participle: √labh + -ya.')
I('V5:0:1', 'even', 'api')
M('V5:0:2', [IP('na', 'not'), A('V5:0:2', 'pron', 'idam', 'idam', 'gen', 'sg', 'n', 'of this', form='asya', sub=True)], 'not of this')
A('V5:0:3', 'noun', 'a_n', 'phala', 'nom', 'sg', 'n', 'fruit: the subject.', alt=[('acc', 'sg')])
Vb('V5:0:4', 'bhu_pres', '3', 'sg', 'is / becomes: third person singular, present.')
A('V5:1:0', 'noun', 'i_f', 'kṛṣi', None, None, 'f', 'farming: first member of the compound.', form='kṛṣi', note='Bare stem inside a compound. Shown: how kṛṣi declines on its own.')
WORDS['V5:1:1'] = {'pos': 'compound member', 'use': 'straw: second member of the compound.', 'note': 'palāla: straw or chaff (it can be masculine or neuter). In the recording the ending is unclear, so no table is shown.', 'form': 'palāla', 'label': 'compound member'}
# V6
A('V6:0:0', 'noun', 'a_n', 'ślokārdha', 'ins', 'sg', 'n', 'with half a verse: the means.', cmp='śloka + ardha', note='ardha as "a half" in this kind of compound is neuter (Pāṇini 2.2.2).')
Vb('V6:0:1', 'vac_fut', '1', 'sg', 'I shall tell: first person singular, future.', form='vakṣyāmi', note='Full verse form: pra-vakṣyāmi (prefix pra- “forth”). The table shows the root without the prefix.', cmp='pra + √vac')
A('V6:0:2', 'pron', 'yad', 'yad', 'nom', 'sg', 'n', 'what: the thing that has been said.', form='yat', alt=[('acc', 'sg')], note='yat becomes yad before a vowel (yad uktam).')
A('V6:0:3', 'part', 'a_n', 'ukta', 'nom', 'sg', 'n', 'said: past participle of √vac.', alt=[('acc', 'sg')], note='√vac + -ta, with the vowel change vac → uk.')
A('V6:0:4', 'noun', 'i_f', 'granthakoṭi', 'ins', 'pl', 'f', 'by crores of books: who/what has said it (the agent of the passive).', cmp='grantha + koṭi')
A('V6:1:0', 'noun', 'a_m', 'paropakāra', 'nom', 'sg', 'm', 'helping others: the subject.', cmp='para + upakāra')
A('V6:1:1', 'noun', 'a_n', 'puṇya', 'dat', 'sg', 'n', 'for merit: the purpose or result.')
A('V6:1:2', 'noun', 'a_n', 'pāpa', 'dat', 'sg', 'n', 'for sin: the purpose or result.')
A('V6:1:3', 'noun', 'a_n', 'parapīḍana', 'nom', 'sg', 'n', 'hurting others: the subject of the second half.', alt=[('acc', 'sg')], cmp='para + pīḍana')
# V7
A('V7:0:0', 'noun', 'i_f', 'mukti', 'nom', 'sg', 'f', 'liberation: the subject of the definition.')
I('V7:0:1', 'having abandoned', '√hā + -tvā: hā becomes hi- before -tvā. Gerunds never change form.', pos='gerund')
A('V7:0:2', 'noun', 'a_n', 'anyathārūpa', 'acc', 'sg', 'n', 'the other forms: what is given up (object of hitvā).', cmp='anyathā + rūpa')
A('V7:0:3', 'noun', 'a_n', 'svarūpa', 'ins', 'sg', 'n', 'in/by one’s own form: the state one rests in.', cmp='sva + rūpa', note='ṇ: after r, the n of -ena turns into ṇ (rūpeṇa).')
A('V7:0:4', 'noun', 'i_f', 'vyavasthiti', 'nom', 'sg', 'f', 'being established: second part of the definition.')
# V8a
A('V8a:0:0', 'noun', 'a_n', 'amṛtatva', 'gen', 'sg', 'n', 'of immortality: what the hope concerns.', cmp='a + mṛta + -tva')
I('V8a:0:1', 'but')
M('V8a:0:2', [IP('na', 'not'), A('V8a:0:2', 'noun', 'aa_f', 'āśā', 'nom', 'sg', 'f', 'hope: the subject.', form='āśā', sub=True), Vb('V8a:0:2', 'as_pres', '3', 'sg', 'there is', form='asti', sub=True)], 'there is no hope')
A('V8a:0:3', 'noun', 'a_n', 'vitta', 'ins', 'sg', 'n', 'by means of wealth: the instrument.', note='vitta = "obtained", from √vid (to obtain). Here a neuter noun: wealth.')
# V8b
A('V8b:0:0', 'pron', 'yad', 'yad', 'ins', 'sg', 'n', 'by which: the means through which one might become immortal.', alt=[])
A('V8b:0:1', 'pron', 'asmad', 'asmad', 'nom', 'sg', None, 'I: the doer.')
M('V8b:0:2', [IP('na', 'not'), A('V8b:0:2', 'adj', 'aa_f', 'amṛtā', 'nom', 'sg', 'f', 'immortal (feminine: the speaker is Maitreyī).', form='amṛtā', sub=True)], 'not immortal')
Vb('V8b:0:3', 'as_opt', '1', 'sg', 'I should be: first person optative.')
A('V8b:0:4', 'pron', 'kim', 'kim', 'nom', 'sg', 'n', 'what: asks for the object.', alt=[('acc', 'sg')])
A('V8b:0:5', 'pron', 'tad', 'tad', 'ins', 'sg', 'n', 'with that: the thing I would use.', alt=[])
Vb('V8b:0:6', 'kr_opt', '1', 'sg', 'should I do: first person optative.')
# V9
I('V9:0:0', 'even')
A('V9:0:1', 'pron', 'pron_a', 'sarva', 'nom', 'sg', 'n', 'all: describes jīvita.', alt=[('acc', 'sg')])
A('V9:0:2', 'noun', 'a_n', 'jīvita', 'nom', 'sg', 'n', 'life: the subject.', alt=[('acc', 'sg')], note='√jīv + -ta: a past participle used as a noun, "lived-ness", life.')
A('V9:0:3', 'adj', 'a_n', 'alpa', 'nom', 'sg', 'n', 'short: describes life.', alt=[('acc', 'sg')])
I('V9:0:4', 'indeed', 'Emphasises the word before it.')
M('V9:1:0', [A('V9:1:0', 'pron', 'tvad', 'tvad', 'gen', 'sg', None, 'yours', form='tava', sub=True), IP('eva', 'only, alone')], 'yours alone')
A('V9:1:1', 'noun', 'a_m', 'vāha', 'nom', 'pl', 'm', 'vehicles (horses, chariots): the things that are yours.')
A('V9:1:2', 'pron', 'tvad', 'tvad', 'gen', 'sg', None, 'your: whose dance and song.')
A('V9:1:3', 'noun', 'a_n', 'nṛtyagīta', 'nom', 'du', 'n', 'dance and song (two things): subject of the second half.', alt=[('acc', 'du'), ('voc', 'du')], form='nṛtyagīte', cmp='nṛtya + gīta (a pair)', note='Dual: exactly two things. The ending -e marks dual in the neuter nominative/accusative/vocative.')
# V10
A('V10:0:0', 'noun', 'ahan', 'ahan', 'loc', 'sg', 'n', 'on a day, repeated: "day after day".', form='ahani', note='Repeating a word gives "each / every": ahany ahani, day after day.')
A('V10:0:1', 'noun', 'a_n', 'bhūta', 'nom', 'pl', 'n', 'beings: the ones who go.', alt=[('acc', 'pl'), ('voc', 'pl')], note='bhūta = “become, been”: a past participle used as a noun for “beings”.')
Vb('V10:0:2', 'gam_pres', '3', 'pl', 'they go.')
I('V10:0:3', 'here', 'Related to idam ("this").')
A('V10:0:4', 'noun', 'a_m', 'yamālaya', 'acc', 'sg', 'm', 'to Yama’s abode: the destination.', cmp='yama + ālaya')
A('V10:1:0', 'noun', 'a_m', 'śeṣa', 'nom', 'pl', 'm', 'the remaining ones: the subject.')
A('V10:1:1', 'adj', 'a_m', 'sthāvara', 'acc', 'sg', 'm', 'the permanent state: what they wish for.', alt=[], note='sthāvara = “stationary”, from √sthā (to stand). Also seen as neuter.')
Vb('V10:1:2', 'is_pres', '3', 'pl', 'they wish.')
A('V10:1:3', 'pron', 'kim', 'kim', 'nom', 'sg', 'n', 'what: asks which wonder.', alt=[('acc', 'sg')])
A('V10:1:4', 'noun', 'a_n', 'āścarya', 'nom', 'sg', 'n', 'a wonder: what is being asked about.', alt=[('acc', 'sg')])
M('V10:1:5', [IP('ataḥ', 'from this, therefore'), IP('param', 'beyond', 'param is actually the neuter singular of para (“other, beyond”) used as an adverb.')], 'beyond this')
# V11
A('V11:0:0', 'adj', 'mahat', 'mahat', 'ins', 'sg', 'n', 'by great: describes bhāgya.', form='mahatā', alt=[])
A('V11:0:1', 'noun', 'a_n', 'bhāgya', 'ins', 'sg', 'n', 'by fortune: the cause.')
A('V11:0:2', 'adj', 'a_m', 'īdṛśa', 'nom', 'pl', 'm', 'such: describes puruṣāḥ.', form='īdṛśāḥ')
A('V11:0:3', 'noun', 'a_m', 'puruṣa', 'nom', 'pl', 'm', 'men, persons: the subject.')
M('V11:0:4', [IP('adya', 'today'), IP('api', 'even')], 'even today')
Vb('V11:0:5', 'as_pres', '3', 'pl', 'they are.')
# V12
A('V12:0:0', 'noun', 'a_m', 'śrīkṛṣṇa', None, None, 'm', 'Śrī Kṛṣṇa: first member of the compound.', form='śrīkṛṣṇa', note='Bare stem inside a compound (śrī + kṛṣṇa). Shown: how kṛṣṇa declines on its own.', cmp='śrī + kṛṣṇa')
A('V12:0:1', 'noun', 'a_n', 'arpaṇa', 'nom', 'sg', 'n', 'an offering: the subject of "let it be".')
Vb('V12:0:2', 'as_imp', '3', 'sg', 'let it be.')

# ---------- case metadata ----------
CASEINFO = [
 {'id':'nom','n':1,'skt':'prathamā','sktd':'प्रथमा','en':'Nominative','role':'the doer (subject)','kar':'kartṛ · agent','q':'who? what? (does it)','prep':'—','end':'-aḥ (m), -am (n), -ā (f)','think':'The star of the sentence: who or what performs the action, or is described.','ex':{'dev':'रामः गच्छति','iast':'rāmaḥ gacchati','en':'Rāma goes.','hit':'rāmaḥ'},'talk':{'v':'V7','w':'muktiḥ','en':'muktiḥ: "liberation" is what is being defined.'}},
 {'id':'acc','n':2,'skt':'dvitīyā','sktd':'द्वितीया','en':'Accusative','role':'what is acted on, or where it reaches','kar':'karman · object','q':'whom? what? to where?','prep':'(direct object); “to, towards”','end':'-am','think':'The action lands on it: the thing done to, or the place gone to.','ex':{'dev':'रामः ग्रामं गच्छति','iast':'rāmaḥ grāmaṁ gacchati','en':'Rāma goes to the village.','hit':'grāmaṁ'},'talk':{'v':'V10','w':'yamālayam','en':'yamālayam: “to Yama’s abode”, the destination of the beings.'}},
 {'id':'ins','n':3,'skt':'tṛtīyā','sktd':'तृतीया','en':'Instrumental','role':'the means or tool; the one accompanying','kar':'karaṇa · instrument','q':'by what? with what? with whom?','prep':'by, with, by means of','end':'-ena (a-stem)','think':'The tool or route by which it happens. Also the agent of a passive verb.','ex':{'dev':'रामः रथेन गच्छति','iast':'rāmaḥ rathena gacchati','en':'Rāma goes by chariot.','hit':'rathena'},'talk':{'v':'V8a','w':'vittena','en':'vittena: “by means of wealth”, no immortality comes by that route.'}},
 {'id':'dat','n':4,'skt':'caturthī','sktd':'चतुर्थी','en':'Dative','role':'the recipient or purpose','kar':'sampradāna · recipient','q':'to whom? for what?','prep':'to, for','end':'-āya (a-stem)','think':'The one who receives, or the goal something is for.','ex':{'dev':'रामः मित्राय फलं ददाति','iast':'rāmaḥ mitrāya phalaṁ dadāti','en':'Rāma gives fruit to a friend.','hit':'mitrāya'},'talk':{'v':'V6','w':'puṇyāya','en':'puṇyāya: “for merit”, helping others leads to merit.'}},
 {'id':'abl','n':5,'skt':'pañcamī','sktd':'पञ्चमी','en':'Ablative','role':'the source; where it separates or comes from','kar':'apādāna · source','q':'from where? from what? why?','prep':'from, out of, because of','end':'-āt (a-stem)','think':'The starting point: the place, person or cause something moves away from.','ex':{'dev':'रामः ग्रामात् आगच्छति','iast':'rāmaḥ grāmāt āgacchati','en':'Rāma comes from the village.','hit':'grāmāt'},'talk':{'v':'V3','w':'sakāśāt','en':'sakāśāt: “from the presence of” the teachers, the source of learning.'}},
 {'id':'gen','n':6,'skt':'ṣaṣṭhī','sktd':'षष्ठी','en':'Genitive','role':'of: a link between two nouns','kar':'not a kāraka (relates noun to noun)','q':'whose? of what?','prep':'of, ’s','end':'-asya (a-stem)','think':'Belonging and relation: it joins one noun to another, not to the action.','ex':{'dev':'रामस्य पुस्तकम्','iast':'rāmasya pustakam','en':'Rāma’s book.','hit':'rāmasya'},'talk':{'v':'V9','w':'tava','en':'tava: “your” chariots, dance and song.'}},
 {'id':'loc','n':7,'skt':'saptamī','sktd':'सप्तमी','en':'Locative','role':'the place or time where','kar':'adhikaraṇa · locus','q':'where? when? in what?','prep':'in, on, at','end':'-e (a-stem)','think':'The setting: where or when the action takes place.','ex':{'dev':'रामः गृहे तिष्ठति','iast':'rāmaḥ gṛhe tiṣṭhati','en':'Rāma stays in the house.','hit':'gṛhe'},'talk':{'v':'V3','w':'pṛthivyām','en':'pṛthivyām: “on the earth”, where all people should learn.'}},
 {'id':'voc','n':8,'skt':'sambodhana','sktd':'सम्बोधन','en':'Vocative','role':'calling or addressing someone','kar':'not a kāraka (address)','q':'O …!','prep':'O …','end':'-a (a-stem: short)','think':'Not part of the action at all: you are calling someone.','ex':{'dev':'हे राम','iast':'he rāma','en':'O Rāma!','hit':'rāma'},'talk':{'v':'','w':'—','en':'No vocative appears in his quoted verses. Yājñavalkya would say he maitreyi (“O Maitreyī!”).'}},
]


# ---------- Pāṇini's terms ----------
KARAKA = {
 'kartṛ':      {'dev':'कर्तृ','en':'agent','sutra':{'dev':'स्वतन्त्रः कर्ता','iast':'svatantraḥ kartā','ref':'1.4.54','gloss':'The independent one (the one who acts on its own) is the kartṛ.'}},
 'karman':     {'dev':'कर्म','en':'object','sutra':{'dev':'कर्तुरीप्सिततमं कर्म','iast':'kartur īpsitatamaṁ karma','ref':'1.4.49','gloss':'What the agent most wishes to reach is the karman.'}},
 'karaṇa':     {'dev':'करण','en':'instrument','sutra':{'dev':'साधकतमं करणम्','iast':'sādhakatamaṁ karaṇam','ref':'1.4.42','gloss':'The most effective means is the karaṇa.'}},
 'sampradāna': {'dev':'सम्प्रदान','en':'recipient','sutra':{'dev':'कर्मणा यमभिप्रैति स सम्प्रदानम्','iast':'karmaṇā yam abhipraiti sa sampradānam','ref':'1.4.32','gloss':'The one whom the agent intends to reach through the object is the sampradāna.'}},
 'apādāna':    {'dev':'अपादान','en':'point of departure','sutra':{'dev':'ध्रुवमपायेऽपादानम्','iast':'dhruvam apāye \'pādānam','ref':'1.4.24','gloss':'The fixed point from which separation occurs is the apādāna.'}},
 'adhikaraṇa': {'dev':'अधिकरण','en':'locus','sutra':{'dev':'आधारोऽधिकरणम्','iast':'ādhāro \'dhikaraṇam','ref':'1.4.45','gloss':'The support or substrate is the adhikaraṇa.'}},
 'śeṣa':       {'dev':'शेष','en':'remainder (relation)','sutra':{'dev':'षष्ठी शेषे','iast':'ṣaṣṭhī śeṣe','ref':'2.3.50','gloss':'The sixth case is used for the remainder: any relation that is not a kāraka. Later grammarians call this sambandha, “relation”.'}},
 'sambodhana': {'dev':'सम्बोधन','en':'address','sutra':{'dev':'सम्बोधने च','iast':'sambodhane ca','ref':'2.3.47','gloss':'In addressing someone, the first-case affixes are used too. So for Pāṇini the vocative is a use of the first case, not an eighth case.'}},
}
CASE_KAR = {'nom':'kartṛ','acc':'karman','ins':'karaṇa','dat':'sampradāna','abl':'apādāna','gen':'śeṣa','loc':'adhikaraṇa','voc':'sambodhana'}
for c in CASEINFO:
    k = CASE_KAR[c['id']]; c['kn'] = k; c['kd'] = KARAKA[k]['dev']; c['ken'] = KARAKA[k]['en']
SUP = {'nom':['su','au','jas'],'acc':['am','auṭ','śas'],'ins':['ṭā','bhyām','bhis'],'dat':['ṅe','bhyām','bhyas'],'abl':['ṅasi','bhyām','bhyas'],'gen':['ṅas','os','ām'],'loc':['ṅi','os','sup'],'voc':['su','au','jas']}
TING = {'parasmaipada':[['tip','tas','jhi'],['sip','thas','tha'],['mip','vas','mas']],'ātmanepada':[['ta','ātām','jha'],['thās','āthām','dhvam'],['iṭ','vahi','mahiṅ']]}

# role of each word in the ACTION (kāraka), only where it is clear. Case and kāraka usually match but not always.
KAR = {
 'V1:0:2':'adhikaraṇa','V1:0:3':'kartṛ','V1:0:5':'karaṇa','V1:0:6':'karman','V1:1:1':'kartṛ','V1:1:3':'karman','V1:1:4':'karaṇa','V1:2:0':'karman',
 'V3:0:3':'apādāna','V3:0:4':'śeṣa','V3:0:2':'śeṣa','V3:1:1':'karman','V3:1:3':'adhikaraṇa','V3:1:4':'kartṛ',
 'V4:0:0':'śeṣa','V4:0:1':'śeṣa','V4:0:2':'adhikaraṇa',
 'V5:0:2#1':'śeṣa',
 'V6:0:0':'karaṇa','V6:0:2':'karman','V6:0:4':'kartṛ',
 'V7:0:2':'karman',
 'V8a:0:0':'śeṣa','V8a:0:3':'karaṇa','V8b:0:0':'karaṇa','V8b:0:1':'kartṛ','V8b:0:5':'karman','V8b:0:6':'karaṇa',
 'V9:1:0#0':'śeṣa','V9:1:2':'śeṣa',
 'V10:0:0':'adhikaraṇa','V10:0:1':'kartṛ','V10:0:4':'karman','V10:1:0':'kartṛ','V10:1:1':'karman',
}
KAR_NOTE = {
 'V1:0:3':'Here the case and the role differ: the doer (kartṛ) of a “should be done” verb is put in the instrumental, because the verb already expresses the object.',
 'V1:0:6':'Here the object (karman) takes the nominative, because the “should be done” form of the verb (kartavyam) is passive and expresses the object itself.',
 'V6:0:2':'The object (karman) takes the nominative because uktam (“said”) is a passive participle.',
 'V6:0:4':'The agent (kartṛ) takes the instrumental because uktam is passive: “said by crores of books”.',
 'V6:1:1':'A dative of purpose (“for the sake of”), so Pāṇini’s sampradāna (recipient) does not apply strictly here.',
 'V6:1:2':'A dative of purpose (“for the sake of”), so Pāṇini’s sampradāna (recipient) does not apply strictly here.',
 'V10:0:4':'With verbs of going, the destination takes the accusative and counts as the karman.',
}
for k, v in KAR.items():
    if '#' in k:
        kk, i = k.split('#'); WORDS[kk]['multi'][int(i)]['kar'] = v
    else: WORDS[k]['kar'] = v
for k, n in KAR_NOTE.items():
    w = WORDS[k]; w['note'] = (w.get('note', '') + ' ' + n).strip()

# ---------- write ----------
for k, w in WORDS.items():
    assert 'form' in w, k
missing = [k for k in WT if k not in WORDS]
print('annotated', len(WORDS), 'of', len(WT), 'words; missing:', missing)
json.dump({'cases': CASEINFO, 'karaka': KARAKA, 'sup': SUP, 'ting': TING, 'paradigms': PARAD, 'words': WORDS}, open('grammar.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('paradigms:', len(PARAD))
