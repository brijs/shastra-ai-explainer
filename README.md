# Why Shastras, in the Age of AI?

An animated, narrated, interactive explainer of a 17-minute talk by Dr. Pratosh on why the Indian scriptures still matter in the age of AI. Every Sanskrit verse he quotes is decoded word by word, with dhātu (root) breakdowns, sandhi notes, and a "why he quoted this" link back to his argument.

[![Live explainer](https://img.shields.io/badge/Live-explainer-b5481e)](https://brijs.github.io/shastra-ai-explainer/)

**Live explainer:** https://brijs.github.io/shastra-ai-explainer/ (live once GitHub Pages is enabled for `main` + `/docs`)

## What it covers
14 scenes across the talk's three levels: intellect (Nyāya, the Transformer analogy, "crop and straw"), society (AI ethics, contentment), and the self (Bhāgavata on mukti, Maitreyī–Yājñavalkya, Nachiketa, the Yakṣa-praśna). It ends with a root-explorer Word Lab, a 10-question quiz and a copyable decoder card.

Each verse carries a confidence badge: ● matches a source, ◐ recognised but wording may differ, ○ reconstructed from audio and not matched to any source. Four passages (V2, V4, V5, V11) could not be matched online and are labelled as such.

## Rebuild
```
~/.cache/edge-tts-venv/bin/python tts.py   # Microsoft neural voices via edge-tts (needs: pip install edge-tts)
python3 build.py                            # writes dist/shastra-ai-explainer.html and docs/index.html
~/.cache/pw-venv/bin/python walk.py         # optional: headless walkthrough (needs Playwright + Chrome)
```
Narration: `en-IN-PrabhatNeural`. Verses: `hi-IN-MadhurNeural` reading the Devanagari, so Sanskrit sounds (ṛ, ś, ṣ, vowel length) are approximate. The on-screen text is the authority.

## Files
`verses.json` (all verse/word/root data, roots, quiz) · `narration.json` · `src/` (CSS, engine, scenes) · `audio/` (cached clips) · `STORYBOARD.md` · `transcript_clean.md` (cleaned from YouTube auto-captions)

Source texts are public-domain scripture.
