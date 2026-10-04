"""Headless walkthrough: every scene + interaction, every word chip's grammar block, guide overlay, tables.
Run: ~/.cache/pw-venv/bin/python walk.py"""
import asyncio, sys, os
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/shastra-ai-explainer.html')
os.makedirs('shots', exist_ok=True)
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
async def run(width, height, tag):
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, headless=True, args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': width, 'height': height})
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' else None)
        await pg.goto(URL); await pg.click('#enterSound'); await pg.wait_for_timeout(300)
        n = await pg.evaluate('EX.SCENES.length'); print(tag, 'scenes', n)
        for i in range(n):
            sid = await pg.evaluate(f'EX.SCENES[{i}].id'); await pg.evaluate(f'EX.go({i})'); await pg.wait_for_timeout(200)
            if sid == 's1': await pg.click('#diya'); await pg.click('#intent button')
            if sid == 'sg':
                for c in ['nom','acc','ins','dat','abl','gen','loc','voc']:
                    await pg.locator(f'.wnode[data-case="{c}"]').first.click()
                    assert await pg.locator('.cdet').count() == 1
                for c in ['loc','abl','ins','acc','gen','dat','voc']:
                    await pg.locator(f'[data-id="sb-btns"] button[data-c="{c}"]').click()
                en = await pg.inner_text('[data-id="sb-en"]'); assert 'Rāma comes' in en and 'friend’s house' in en and 'for a meal' in en, en
                for _ in range(3):
                    await pg.locator('#cq .opt').nth(1).click(); await pg.locator('#qn').click()
            if sid == 's2': await pg.click('#paths button[data-p="2"]')
            if sid == 's3':
                for w in ['etad','deśa','prasūtasya','sakāśāt','agrajanmanaḥ','svaṁ svam','caritram','śikṣeran','pṛthivyām','sarvamānavāḥ']:
                    await pg.locator('#tiles .tile', has=pg.locator('.wt', has_text=w)).first.click()
                assert await pg.locator('#after .card').count() == 1
            if sid == 's4': await pg.evaluate("const s=document.querySelector('#yrs');s.value=12;s.dispatchEvent(new Event('input'))")
            if sid == 's5': await pg.click('#toks .tile >> nth=2')
            if sid == 's6': await pg.click('#pg')
            if sid == 's7':
                for d in await pg.locator('#items .row2').all(): await d.locator('button').first.click()
            if sid == 's8': await pg.evaluate("const s=document.querySelector('#mr');s.value=90;s.dispatchEvent(new Event('input'))")
            if sid == 's9':
                for _ in range(4): await pg.locator('.ring:not(.gone)').first.click()
            if sid == 's10':
                await pg.locator('#dlg .opt').nth(1).click(); await pg.locator('#dlg .opt').nth(1).click()
                assert await pg.locator('#cards .card').count() == 2
            if sid == 's11': await pg.evaluate("const s=document.querySelector('#zr');s.value=1000000;s.dispatchEvent(new Event('input'))")
            if sid == 's12':
                for w in ['अहन्यहनि','गच्छन्तीह','शेषाः','किमाश्चर्य']: await pg.locator('#tiles .tile', has_text=w).first.click()
                await pg.locator('#q2 .opt').nth(1).click()
            if sid == 's13':
                for _ in range(6): await pg.click('#why')
                await pg.click('#alt'); await pg.evaluate("const s=document.querySelector('#pr');s.value=20;s.dispatchEvent(new Event('input'))")
            # every word chip in every card on this scene: click, expect a grammar block (verse words only)
            chips = pg.locator('.wchip[data-vw]'); cnt = await chips.count()
            for k in range(cnt):
                await chips.nth(k).click()
                if await pg.locator('.card[data-v] .gblock').count() == 0: errs.append(f'NO GRAMMAR BLOCK {sid} chip {k}')
                bad = await pg.evaluate("Array.from(document.querySelectorAll('.card .gt')).filter(t=>t.dataset.hit!=='[]'&&!t.querySelector('td.hit')).length")
                if bad: errs.append(f'NO HIT CELL {sid} chip {k}')
            if sid == 's12':
                await pg.locator('.card[data-v="V10"] .wchip[data-vw="V10:0:4"]').click()
                if 'kāraka: karman' not in await pg.inner_text('.card[data-v="V10"] .wdetail'): errs.append('V10 yamālayam missing kāraka karman')
            # anvaya: every verse card on this scene rearranges to the expected order and back
            for k in range(await pg.locator('.anv').count()):
                box = pg.locator('.anv').nth(k); vid = await box.get_attribute('data-anv')
                before = await box.locator('.achip .at').all_inner_texts()
                await box.locator('[data-anvgo]').click(); await pg.wait_for_timeout(2000)
                after = await box.locator('.achip .at').all_inner_texts()
                exp = await pg.evaluate("(v)=>ANV[v].order.map(o=>typeof o==='number'?ANV[v].tokens[o].t:o.add.t)", vid)
                if after != exp: errs.append(f'ANVAYA ORDER {vid}: {after} != {exp}')
                if await box.get_attribute('data-state') != 'anvaya': errs.append('anvaya state ' + vid)
                if await box.locator('.anvsent').inner_text() == '': errs.append('anvaya sentence empty ' + vid)
                await box.locator('[data-anvgo]').click(); await pg.wait_for_timeout(2000)
                back = await box.locator('.achip .at').all_inner_texts()
                if back != before: errs.append(f'ANVAYA RESET {vid}')
            if sid == 's14':
                await pg.click('#rg button >> nth=0')
                await pg.click('.tabs button[data-t="para"]'); assert await pg.locator('#pg2 .gt').count() == 1
                await pg.locator('#pg2 td').nth(5).click(); cap = await pg.inner_text('#pg2 .gcap'); assert '2nd person plural' in cap, cap
                await pg.locator('[data-id="gal"] button[data-pd="a_m:veda"]').click(); await pg.locator('#pg2 td').nth(6).click(); cap = await pg.inner_text('#pg2 .gcap'); assert 'Instrumental singular' in cap, cap
                await pg.check('[data-id="cover"]'); await pg.locator('#pg2 td').nth(3).click()
                await pg.click('.tabs button[data-t="quiz"]')
                ans = await pg.evaluate('DATA.quiz.map(q=>q.a)')
                for a in ans: await pg.locator('#qz .opt').nth(a).click(); await pg.click('#qn')
                await pg.wait_for_timeout(200); assert 'Ācārya' in await pg.inner_text('#rank'), 'rank'
                await pg.click('.tabs button[data-t="sheet"]')
            sw = await pg.evaluate('document.documentElement.scrollWidth'); iw = await pg.evaluate('innerWidth')
            if sw > iw: errs.append(f'HSCROLL {sid}: {sw}>{iw}')
            if sid in ('sg', 's3', 's7', 's10', 's14') : await pg.screenshot(path=f'shots/{tag}_{sid}.png', full_page=True)
        # guide overlay: all tabs
        await pg.click('#guideBtn'); assert await pg.locator('#gg:not([hidden])').count() == 1
        for t in ['cases','families','anvaya','numgen','types','notation','sounds','para']:
            await pg.locator(f'#ggtabs button[data-t="{t}"]').click(); await pg.wait_for_timeout(80)
            if await pg.inner_text('#ggbody') == '': errs.append('EMPTY TAB ' + t)
        await pg.locator('#ggtabs button[data-t="notation"]').click(); await pg.locator('[data-id="exchips"] .wchip').nth(5).click()
        await pg.locator('#ggtabs button[data-t="numgen"]').click(); await pg.locator('[data-id="gsel"] button[data-g="f"]').click()
        await pg.locator('#ggtabs button[data-t="para"]').click()
        for k in range(await pg.locator('#ggbody [data-id="gal"] button').count()):
            try: await pg.locator('#ggbody [data-id="gal"] button').nth(k).click(timeout=3000)
            except Exception as ex: errs.append(f'gallery click {k} failed: ' + str(ex).split(chr(10))[0]); break
            if await pg.locator('#ggbody [data-id="galtab"] .gt td').count() < 9: errs.append(f'short table {k}')
        await pg.locator('#ggbody [data-id="gal"] button[data-pd="a_m:veda"]').click()
        head = await pg.inner_text('#ggbody [data-id="galtab"] table')
        for needle in ['sampradāna','apādāna','karaṇa','kartṛ','adhikaraṇa','su · au · jas','ṅe · bhyām · bhyas']:
            if needle not in head: errs.append('table missing Pāṇini term: ' + needle)
        await pg.locator('#ggbody [data-id="gal"] button[data-pd="gam_pres"]').click()
        if 'tip · tas · jhi' not in await pg.inner_text('#ggbody [data-id="galtab"] table'): errs.append('verb table missing tiṅ affixes')
        await pg.locator('#ggtabs button[data-t="cases"]').click()
        ct = await pg.inner_text('#ggbody')
        for needle in ['sampradāna','सम्प्रदान','ध्रुवमपायेऽपादानम्'[:0] or 'apādāna','Aṣṭādhyāyī']:
            if needle not in ct: errs.append('cases tab missing ' + needle)
        await pg.locator('.wnode[data-case="dat"]').first.click(); 
        if '1.4.32' not in await pg.inner_text('.cdet'): errs.append('dative detail missing Pāṇini sutra 1.4.32')
        await pg.screenshot(path=f'shots/{tag}_guide.png')
        await pg.keyboard.press('Escape'); assert await pg.locator('#gg[hidden]').count() == 1
        # devanagari toggle
        await pg.evaluate('EX.go(3)'); await pg.locator('.wchip[data-vw]').first.click()
        if not (await pg.locator('.gt .fd >> nth=0').is_visible() and await pg.locator('.gt .fi >> nth=0').is_visible()): errs.append('table should show Devanagari + Roman by default')
        await pg.click('#devf'); 
        if await pg.locator('.gt .fi >> nth=0').is_visible(): errs.append('mode-dev should hide Roman')
        await pg.click('#devf')
        if await pg.locator('.gt .fd >> nth=0').is_visible(): errs.append('mode-iast should hide Devanagari')
        await pg.click('#devf')
        await pg.screenshot(path=f'shots/{tag}_dev.png', full_page=True)
        await b.close()
    print(tag, 'errors:', errs if errs else 'none'); return errs
async def main():
    e1 = await run(1280, 800, 'desk'); e2 = await run(390, 800, 'mob'); sys.exit(1 if (e1 or e2) else 0)
asyncio.run(main())
