# Why Shastras, in the Age of AI?

An animated, narrated, interactive explainer of a 17-minute talk by Dr. Pratosh on why the Indian scriptures still matter in the age of AI. Every Sanskrit verse he quotes is decoded word by word, with dhātu (root) breakdowns, sandhi notes, and a "why he quoted this" link back to his argument.

[![Live explainer](https://img.shields.io/badge/Live-explainer-b5481e)](https://brijs.github.io/shastra-ai-explainer/)

**Live explainer:** https://brijs.github.io/shastra-ai-explainer/ (live once GitHub Pages is enabled for `main` + `/docs`)

## What it covers
15 scenes across the talk's three levels: intellect (Nyāya, the Transformer analogy, "crop and straw"), society (AI ethics, contentment), and the self (Bhāgavata on mukti, Maitreyī–Yājñavalkya, Nachiketa, the Yakṣa-praśna). It opens with a map of Sanskrit's eight cases, and ends with a root-explorer Word Lab, a paradigm gallery, a 13-question quiz and a copyable decoder card.

Each verse carries a confidence badge: ● matches a source, ◐ recognised but wording may differ, ○ reconstructed from audio and not matched to any source. Four passages (V2, V4, V5, V11) could not be matched online and are labelled as such.

## Grammar for every word
Tap any word in a verse to see its word type (noun, pronoun, adjective, verb, participle, gerund, indeclinable), its case, number and gender (or person, tense and voice for verbs), its stem or root, how it is used in the verse, and the **full declension or conjugation table with the exact form highlighted**. Tables show every form in Devanagari with the Roman transliteration beneath, plus Sanskrit labels for case, number and person; a header button cycles Devanagari + Roman / Devanagari only / Roman only.

## Anvaya (prose order)
Every verse card has an **Anvaya** section: tap *Rearrange into anvaya* and the words glide into plain prose order (subject … object … verb last), with numbered positions, dashed chips for words the verse leaves out (like *asti*), and the re-ordered sentence in Devanagari and Roman. *Slow motion* shows it word by word. The orders live in `gen_anvaya.py`, which checks every word is used exactly once. The **Grammar guide** (top right) has a case wheel (the eight vibhaktis as roles around the action), a sentence builder showing why eight cases are enough, number and gender, word types, notation (√, +, ←), a sound guide, and a gallery of 26 paradigm tables with a "hide the forms" self-test mode.

All 96 word annotations are checked by `gen_grammar.py`: each word's form must appear in the table cell it claims, or the build fails.

## Rebuild
```
~/.cache/edge-tts-venv/bin/python tts.py   # Microsoft neural voices via edge-tts (needs: pip install edge-tts)
python3 gen_grammar.py                      # regenerates grammar.json (verifies every word against its table)
python3 gen_anvaya.py                       # regenerates anvaya.json (prose order for each verse)
python3 build.py                            # writes dist/shastra-ai-explainer.html and docs/index.html
~/.cache/pw-venv/bin/python walk.py         # optional: headless walkthrough (needs Playwright + Chrome)
```
Narration: `en-IN-PrabhatNeural`. Verses: `hi-IN-MadhurNeural` reading the Devanagari, so Sanskrit sounds (ṛ, ś, ṣ, vowel length) are approximate. The on-screen text is the authority.

## Files
`verses.json` (all verse/word/root data, roots, quiz) · `gen_grammar.py` → `grammar.json` (tables + per-word grammar) · `narration.json` · `src/` (CSS, engine, scenes) · `audio/` (cached clips) · `STORYBOARD.md` · `transcript_clean.md` (cleaned from YouTube auto-captions)

Source texts are public-domain scripture.
