# Why Shastras, in the Age of AI?

An animated, narrated, interactive explainer of a 17-minute talk by Dr. Pratosh on why the Indian scriptures still matter in the age of AI. Every Sanskrit verse he quotes is decoded word by word, with dhātu (root) breakdowns, sandhi notes, and a "why he quoted this" link back to his argument.

[![Live explainer](https://img.shields.io/badge/Live-explainer-b5481e)](https://brijs.github.io/shastra-ai-explainer/)

**Live explainer:** https://brijs.github.io/shastra-ai-explainer/ (live once GitHub Pages is enabled for `main` + `/docs`)

## What it covers
17 scenes across the talk's three levels: intellect (Nyāya, the Transformer analogy, "crop and straw"), society (AI ethics, contentment), and the self (Bhāgavata on mukti, Maitreyī–Yājñavalkya, Nachiketa, the Yakṣa-praśna). It opens with a map of Sanskrit's eight cases, and ends with a root-explorer Word Lab, a paradigm gallery, a 13-question quiz and a copyable decoder card.

Each verse carries a confidence badge: ● matches a source, ◐ recognised but wording may differ, ○ reconstructed from audio and not matched to any source. Four passages (V2, V4, V5, V11) could not be matched online and are labelled as such.

## Grammar for every word
Tap any word in a verse to see its word type (noun, pronoun, adjective, verb, participle, gerund, indeclinable), its case, number and gender (or person, tense and voice for verbs), its stem or root, how it is used in the verse, and the **full declension or conjugation table with the exact form highlighted**. Tables show every form in Devanagari with the Roman transliteration beneath, plus Sanskrit labels for case, number and person; a header button cycles Devanagari + Roman / Devanagari only / Roman only.

## Pāṇini's own rules (new)
- **"Pāṇini's six kārakas, in his own words"**: three example sentences (*Devadattaḥ gṛhe sthālyā odanaṁ pacati*, *viprāya gāṁ dadāti*, *vṛkṣāt patraṁ patati*). Tap any word to see its role, the defining sūtra in Devanagari with audio, and what it does in the sentence. Includes a six-row reference table and a short quiz.
- **"Pāṇini's code: hidden tags"**: an animated derivation machine. Five words built from √kṛ (*karaṇa, adhikaraṇa, kāraka, kartṛ, kṛtvā*) are assembled step by step: tag letters are flagged, struck out and deleted; suffix cores are substituted (*yu → ana*, *vu → aka*); vowels strengthen (guṇa, vṛddhi); and the "ghost" of a deleted tag is shown still triggering vṛddhi (ṇ) or blocking guṇa (k). Also a tag-spotting game (lyuṭ, ṇvul, ktvā, tṛc, jas, ṅe), a guṇa/vṛddhi table, and every sūtra used with audio.
- A **Pāṇini's rules** tab in the Grammar guide lists the tag rules, building rules and kāraka definitions, with jumps to both scenes.
Data lives in `gen_pani.py` → `pani.json` (derivations are authored as operations and each step is a snapshot; the build checks every derivation ends in the right word).

## Pāṇini's terms
Case rows and the case wheel carry Pāṇini's own names: the six **kārakas** (*kartṛ, karman, karaṇa, sampradāna, apādāna, adhikaraṇa*, plus *śeṣa*, the genitive's "remainder", and *sambodhana*, which are not kārakas) with Devanagari and his defining sūtras (Aṣṭādhyāyī 1.4.24, 1.4.32, 1.4.42, 1.4.45, 1.4.49, 1.4.54; and 2.3.47, 2.3.50 for the vocative and genitive), and his affix names (*su au jas, am auṭ śas, …* for nouns; *tip tas jhi, …* for verbs). Word cards show a **kāraka** tag only where a word's role in the action is clear, and flag cases where case and role differ (e.g. passive agent in the instrumental).

## Anvaya (prose order)
Every verse card has an **Anvaya** section: tap *Rearrange into anvaya* and the words glide into plain prose order (subject … object … verb last), with numbered positions, dashed chips for words the verse leaves out (like *asti*), and the re-ordered sentence in Devanagari and Roman. *Slow motion* shows it word by word. The orders live in `gen_anvaya.py`, which checks every word is used exactly once. The **Grammar guide** (top right) has a case wheel (the eight vibhaktis as roles around the action), a sentence builder showing why eight cases are enough, number and gender, word types, notation (√, +, ←), a sound guide, and a gallery of 41 paradigm tables covering about two dozen noun families (including the contrast between a-stems like *deva* and n-stems like *rājan*), a "Stem families" map, and with a "hide the forms" self-test mode.

All 96 word annotations are checked by `gen_grammar.py`: each word's form must appear in the table cell it claims, or the build fails.

## Rebuild
```
~/.cache/edge-tts-venv/bin/python tts.py   # Microsoft neural voices via edge-tts (needs: pip install edge-tts)
python3 gen_grammar.py                      # regenerates grammar.json (verifies every word against its table)
python3 gen_anvaya.py                       # regenerates anvaya.json (prose order for each verse)
python3 gen_pani.py                         # regenerates pani.json (kāraka sūtras, tag rules, derivations)
python3 build.py                            # writes dist/shastra-ai-explainer.html and docs/index.html
~/.cache/pw-venv/bin/python walk.py         # optional: headless walkthrough (needs Playwright + Chrome)
```
Narration: `en-IN-PrabhatNeural`. Verses: `hi-IN-MadhurNeural` reading the Devanagari, so Sanskrit sounds (ṛ, ś, ṣ, vowel length) are approximate. The on-screen text is the authority.

## Files
`verses.json` (all verse/word/root data, roots, quiz) · `gen_grammar.py` → `grammar.json` (tables + per-word grammar) · `narration.json` · `src/` (CSS, engine, scenes) · `audio/` (cached clips) · `STORYBOARD.md` · `transcript_clean.md` (cleaned from YouTube auto-captions)

Source texts are public-domain scripture.
