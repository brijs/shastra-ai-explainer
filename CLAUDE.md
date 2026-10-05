# Shastra-in-the-age-of-AI explainer

Live: https://brijs.github.io/shastra-ai-explainer/ (GitHub Pages, branch `main`, folder `/docs`)
Home page entry: https://brijs.github.io/explainers/ (topic "Sanskrit & Indian Heritage", read from the `explainer:*` meta tags in `src/head.html`).

Rebuild (from this folder):
```
~/.cache/edge-tts-venv/bin/python tts.py     # Microsoft voices via edge-tts; cached by hash
python3 gen_grammar.py && python3 gen_anvaya.py && python3 gen_pani.py   # data generators (they validate themselves)
python3 build.py                              # writes dist/shastra-ai-explainer.html and docs/index.html
~/.cache/pw-venv/bin/python walk.py           # headless walkthrough (needs Playwright + Chrome)
```
Data files: `verses.json`, `narration.json`, `grammar.json`, `anvaya.json`, `pani.json`. Scenes: `src/scenes.js`, `src/pani.js`; shared: `src/engine.js`, `src/guide.js`.
Keep `docs/thumb.png` (card image) and `docs/.nojekyll`. Never reintroduce external hosts: the page is a single self-contained file.
