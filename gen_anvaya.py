"""Builds anvaya.json: prose order (anvaya) for each verse. Validates that every word token appears exactly once."""
import json
from anvaya_tokens import tokens_for
V = json.load(open('verses.json', encoding='utf-8'))['verses']; G = json.load(open('grammar.json', encoding='utf-8'))
def add(d, t, m): return {'add': {'d': d, 't': t, 'm': m}}
TE, SANTI, ASTI = add('ते', 'te', 'those'), add('सन्ति', 'santi', 'are'), add('अस्ति', 'asti', 'is')
AHAM, TAT, BHAVATI, IDAM = add('अहम्', 'aham', 'I'), add('तत्', 'tat', 'that'), add('भवति', 'bhavati', 'leads to'), add('इदम्', 'idam', 'this')
SANTU, STAH, DOTS = add('सन्तु', 'santu', 'let them be'), add('स्तः', 'staḥ', 'are (two)'), add('…', '…', 'rest unclear')
A = {
 'V1': ([0,3,2,1,4,5,6,7, 8,9,10,14,15,12,11,13], 'Two sentences. In the second, the gerund yācitvā (“having begged”) and its object kṣamām move up so the main verb karomi comes last.'),
 'V2': ([TE,0,1,2,SANTI,3,4,DOTS], 'Already close to prose order. I add “te … santi” (those … are) to complete the sentence; the rest of the line was unclear in the recording.'),
 'V3': ([9,8,0,1,2,4,3,5,6,7], 'The subject sarvamānavāḥ moves to the front. The compound etad-deśa-prasūta stays together just before agrajanmanaḥ, which it describes. The verb śikṣeran closes the sentence.'),
 'V4': ([0,1,3,2,ASTI], 'The subject śaktiḥ (“power”) moves ahead of svārthe (“in its own meaning”). The verse leaves out “is”, so I add asti.'),
 'V5': ([0,1,3,4,2,5,6,7], 'The negative na moves next to the verb: asya phalaṁ na bhavati, “is not its fruit”. This verse could not be matched to a source, so this order is a best reading.'),
 'V6': ([AHAM,2,4,3,TAT,0,1,5,6,BHAVATI,8,7,BHAVATI], 'Relative clause first: “what (yad) was said by crores of books (granthakoṭibhiḥ)”, then “that (tat) I shall tell in half a verse”. The second half drops “leads to”, so I add bhavati twice.'),
 'V7': ([0,2,1,3,4,ASTI], 'The object anyathārūpam moves before the gerund hitvā (“having abandoned”). The verse leaves out “is”, so I add asti.'),
 'V8a': ([0,1,3,5,2,4], 'The negative na moves next to asti (“is not” → nāsti). The instrumental vittena (“by wealth”) comes before it.'),
 'V8b': ([0,1,3,2,4,6,AHAM,5,7], 'Two clauses: “by which I would not be immortal (yena … syām)” and “with that, what should I do (tena … kim kuryām)”. I add the second aham.'),
 'V9': ([1,0,2,3,4,ASTI,7,5,6,SANTU,9,8,STAH], 'First half: sarvam api jīvitam alpam eva. Second half: “the chariots are yours alone; the dance and song are yours”. The verse leaves out the verbs, so I add asti, santu and staḥ.'),
 'V10': ([3,1,0,4,2,5,6,7,10,11,8,9,ASTI], 'First half: “beings go here to Yama’s abode, day after day”. Second half: the rest wish to be permanent. The question “kim āścaryam ataḥ param” moves into the usual order (ataḥ param first), with asti added.'),
 'V11': ([2,3,4,5,0,1,6], 'Subject īdṛśāḥ puruṣāḥ first, then “even today” (adya api), then the cause “by great fortune”, then the verb santi. This verse could not be matched to a source, so this is a best reading.'),
 'V12': ([IDAM,0,1,2], 'Already in order. I add idam (“this”) so the sentence reads “let this be an offering to Śrī Kṛṣṇa”.'),
}
out = {}
for v in V:
    toks = tokens_for(v, G); order, note = A[v['id']]
    ints = [o for o in order if isinstance(o, int)]
    assert sorted(ints) == list(range(len(toks))), (v['id'], sorted(ints), len(toks))
    out[v['id']] = {'tokens': toks, 'order': order, 'note': note}
json.dump(out, open('anvaya.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('anvaya for', len(out), 'verses; tokens:', sum(len(x['tokens']) for x in out.values()))
