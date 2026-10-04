"""Headless walkthrough: steps every scene, exercises one interaction each, collects errors, screenshots.
Run: ~/.cache/pw-venv/bin/python walk.py"""
import asyncio, sys, os, json
from playwright.async_api import async_playwright
URL = 'file://' + os.path.abspath('dist/shastra-ai-explainer.html')
os.makedirs('shots', exist_ok=True)
async def run(width, height, tag, full):
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless=True, args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': width, 'height': height})
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' else None)
        await pg.goto(URL); await pg.click('#enterSound'); await pg.wait_for_timeout(400)
        n = await pg.evaluate('EX.SCENES.length'); print(tag, 'scenes', n)
        async def shot(i): await pg.screenshot(path=f'shots/{tag}_{i+1:02d}.png', full_page=True)
        for i in range(n):
            await pg.evaluate(f'EX.go({i})'); await pg.wait_for_timeout(250)
            if full:
                sc = '.scene'
                if i == 0: await pg.click('#diya'); await pg.click('#intent button')
                if i == 1: await pg.click('#paths button[data-p="2"]'); await pg.click('.wchip >> nth=0')
                if i == 2:
                    for k in [0,1,2,3,4,5,6,7,8,9]:
                        # click tiles in correct word order by matching text
                        pass
                    order = ['etad','deśa','prasūtasya','sakāśāt','agrajanmanaḥ','svaṁ svam','caritram','śikṣeran','pṛthivyām','sarvamānavāḥ']
                    for w in order:
                        await pg.locator('#tiles .tile', has=pg.locator('.wt', has_text=w)).first.click()
                    assert await pg.locator('#after .card').count() == 1, 'V3 card not shown'
                if i == 3: await pg.fill('#yrs','12') if False else await pg.evaluate("const s=document.querySelector('#yrs');s.value=12;s.dispatchEvent(new Event('input'))")
                if i == 4: await pg.click('#toks .tile >> nth=2')
                if i == 5: await pg.click('#pg')
                if i == 6:
                    for d in await pg.locator('#items .row2').all():
                        await d.locator('button').first.click()
                if i == 7: await pg.evaluate("const s=document.querySelector('#mr');s.value=90;s.dispatchEvent(new Event('input'))")
                if i == 8:
                    for k in range(4): await pg.locator('.ring:not(.gone)').first.click()
                if i == 9:
                    await pg.locator('#dlg .opt').nth(1).click(); await pg.locator('#dlg .opt').nth(1).click()
                    assert await pg.locator('#cards .card').count() == 2, 'maitreyi cards'
                if i == 10: await pg.evaluate("const s=document.querySelector('#zr');s.value=1000000;s.dispatchEvent(new Event('input'))")
                if i == 11:
                    for w in ['अहन्यहनि','गच्छन्तीह','शेषाः','किमाश्चर्य']:
                        await pg.locator('#tiles .tile', has_text=w).first.click()
                    await pg.locator('#q2 .opt').nth(1).click()
                if i == 12:
                    for k in range(6): await pg.click('#why')
                    await pg.click('#alt')
                    await pg.evaluate("const s=document.querySelector('#pr');s.value=20;s.dispatchEvent(new Event('input'))")
                if i == 13:
                    await pg.click('#rg button >> nth=2')
                    await pg.click('.tabs button[data-t="quiz"]')
                    import json as J
                    ans = await pg.evaluate('DATA.quiz.map(q=>q.a)')
                    for a in ans:
                        await pg.locator('#qz .opt').nth(a).click(); await pg.click('#qn')
                    await pg.wait_for_timeout(200)
                    assert 'Ācārya' in await pg.inner_text('#rank'), 'rank not upgraded'
                    await pg.click('.tabs button[data-t="sheet"]')
                # verse audio smoke: play first line, check no throw
                if await pg.locator('.vline .play').count():
                    await pg.locator('.vline .play').first.click()
                # card word detail
                if await pg.locator('.wchip').count():
                    await pg.locator('.wchip').first.click()
            sw = await pg.evaluate('document.documentElement.scrollWidth'); iw = await pg.evaluate('innerWidth')
            if sw > iw: errs.append(f'HSCROLL scene {i+1}: {sw}>{iw}')
            if i in (0,2,5,8,9,13) or full is False: await shot(i)
        await b.close()
    print(tag, 'errors:', errs if errs else 'none')
    return errs
async def main():
    e1 = await run(1280, 800, 'desk', True)
    e2 = await run(390, 800, 'mob', True)
    sys.exit(1 if (e1 or e2) else 0)
asyncio.run(main())
