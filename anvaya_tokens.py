"""Shared: flatten each verse into movable word tokens (composite entries are split into their words)."""
import json, re
def short(s):
    s = re.split(r'[:(]', s)[0].strip().rstrip('.').strip()
    return s
def tokens_for(v, G):
    toks = []
    for li, l in enumerate(v['lines']):
        for wi, w in enumerate(l['words']):
            key = f"{v['id']}:{li}:{wi}"; g = G['words'].get(key, {})
            if g.get('pos') == 'composite':
                ds, ts = w['d'].split(), w['t'].split()
                assert len(ds) == len(ts) == len(g['multi']), (key, ds, ts, len(g['multi']))
                for d, t, p in zip(ds, ts, g['multi']):
                    toks.append({'key': key, 'd': d, 't': t, 'm': short(p.get('use') or w['m']), 'tag': p.get('label') or p.get('pos', ''), 'c': p.get('case') or ('verb' if p.get('pos') == 'verb' else '')})
            else:
                toks.append({'key': key, 'd': w['d'], 't': w['t'], 'm': w['m'], 'tag': g.get('label') or g.get('pos', ''), 'c': g.get('case') or ('verb' if g.get('pos') == 'verb' else '')})
    return toks
if __name__ == '__main__':
    V = json.load(open('verses.json', encoding='utf-8'))['verses']; G = json.load(open('grammar.json', encoding='utf-8'))
    for v in V:
        t = tokens_for(v, G)
        print(v['id'], ' | '.join(f"{i}:{x['t']}" for i, x in enumerate(t)))
