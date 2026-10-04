"""Builds the single-file explainer. Usage: python3 build.py"""
import json, os, base64, re
R = os.path.dirname(os.path.abspath(__file__)); os.chdir(R)
def j(o): return json.dumps(o, ensure_ascii=False).replace('</', '<\\/')
data = json.load(open('verses.json', encoding='utf-8')); narr = json.load(open('narration.json', encoding='utf-8'))
def uri(p): return 'data:audio/mpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
A, VA = {}, {}
for f in sorted(os.listdir('audio')):
    if not f.endswith('.mp3'): continue
    m = re.match(r'(n|v|t)_(.+?)\.[0-9a-f]{8}\.mp3$', f)
    if not m: continue
    kind, name = m.groups()
    if kind == 'n': A[name] = uri('audio/' + f)
    elif kind == 'v': VA['v_' + name] = uri('audio/' + f)
    else: VA['t_' + name] = uri('audio/' + f)
body = '''<div id="intro"><div class="box"><div class="om" aria-hidden="true">ॐ</div><h1>Why Shastras, in the Age of AI?</h1>
<p>A guided, narrated decoding of a 17-minute talk: every Sanskrit verse, word by word and root by root, tied back to the speaker's argument.</p>
<div class="btns"><button class="btn primary" id="enterSound">Enter with sound</button><button class="btn" id="enterSilent">Enter silently (captions only)</button></div>
<p style="font-size:.85rem">Narration: Microsoft neural voices. Verses are read by a Hindi voice from the Devanagari, so Sanskrit sounds are approximate.</p></div></div>
<header class="top"><span class="ttl">Why Shastras in the Age of AI</span><nav id="dots" aria-label="Scenes"></nav><span id="lvl"></span>
<div class="tools"><button class="btn small" id="fx" aria-pressed="false" aria-label="Toggle background texture">Texture</button><button class="btn small" id="theme" aria-label="Toggle light/dark">Theme</button></div></header>
<div class="app"><aside class="guide" aria-label="Your guide"><div class="row"><div id="charWrap"></div><div><div id="rank">Jijñāsu · seeker</div><div id="rankSub"></div></div></div>
<p id="cap" aria-live="polite"></p><div id="react" aria-live="polite"></div>
<div class="ctl"><button class="btn small" id="replay">↻ Replay</button><button class="btn small" id="stop">■ Stop</button><button class="btn small" id="mute" aria-pressed="false">Mute</button><button class="btn small" id="auto" aria-pressed="false">Auto-advance</button></div></aside>
<main class="stage" id="stage" tabindex="-1"></main></div>
<nav class="pager app" style="display:flex"><button class="btn" id="backBtn">← Back</button><button class="btn primary" id="nextBtn">Next →</button></nav>
<div id="toast" role="status"></div>
<p style="text-align:center;font-size:.8rem;color:var(--ink2);padding:0 16px 24px">Source texts are public-domain scripture. Transcript cleaned from YouTube auto-captions. Where a verse could not be matched to a source, the page says so.</p>
'''
head = open('src/head.html', encoding='utf-8').read()
html = (head + body + '<script>\nconst DATA=' + j(data) + ';\nconst NARR=' + j(narr) + ';\nconst AUDIO=' + j(A) + ';\nconst VAUDIO=' + j(VA) + ';\n</script>\n<script>\n' +
        open('src/engine.js', encoding='utf-8').read() + '\n</script>\n<script>\n' + open('src/scenes.js', encoding='utf-8').read() + '\n</script>\n</body></html>')
os.makedirs('dist', exist_ok=True); os.makedirs('docs', exist_ok=True)
for p in ('dist/shastra-ai-explainer.html', 'docs/index.html'): open(p, 'w', encoding='utf-8').write(html)
open('docs/.nojekyll', 'w').close()
print('built', len(html) // 1024, 'KB;', len(A), 'narration clips,', len(VA), 'verse/term clips')
