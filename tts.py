"""Narration (en-IN-PrabhatNeural) + Sanskrit verse lines (hi-IN-MadhurNeural, Devanagari) via edge-tts.
Run: ~/.cache/edge-tts-venv/bin/python tts.py   (cached by hash; edit text and re-run to refresh only changed clips)"""
import json, os, re, hashlib, asyncio, edge_tts
NV, VV = 'en-IN-PrabhatNeural', 'hi-IN-MadhurNeural'
os.makedirs('audio', exist_ok=True)
D = json.load(open('verses.json', encoding='utf-8')); N = json.load(open('narration.json', encoding='utf-8'))
jobs = []  # (name, text, voice, rate)
for k, t in N.items(): jobs.append((f'n_{k}', t, NV, '+0%'))
for v in D['verses']:
    for i, l in enumerate(v['lines']): jobs.append((f'v_{v["id"]}_{i}', l['dev'], VV, '-18%'))
for t in D['terms']: jobs.append((f't_{t["id"]}', t['dev'], VV, '-18%'))
P = json.load(open('pani.json', encoding='utf-8'))
for ref, r in P['rules'].items(): jobs.append(('s_' + ref.replace('.', '_'), r['dev'], VV, '-18%'))
async def main():
    n = 0
    for name, text, voice, rate in jobs:
        h = hashlib.md5(f'{text}|{voice}|{rate}'.encode()).hexdigest()[:8]; out = f'audio/{name}.{h}.mp3'
        if os.path.exists(out): continue
        for f in os.listdir('audio'):
            if f.startswith(name + '.'): os.remove('audio/' + f)
        for attempt in range(4):
            try:
                await asyncio.wait_for(edge_tts.Communicate(text, voice, rate=rate).save(out + '.part'), timeout=45)
                os.replace(out + '.part', out); n += 1; print(name, flush=True); break
            except Exception as e:
                print('retry', name, attempt, type(e).__name__, flush=True)
                if os.path.exists(out + '.part'): os.remove(out + '.part')
        else:
            print('FAILED', name, flush=True)
    print('DONE', n, 'new clips of', len(jobs))
asyncio.run(main())
