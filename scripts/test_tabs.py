import asyncio
from playwright.async_api import async_playwright

async def test_all_admin_tabs():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        errors = []
        page.on('pageerror', lambda err: errors.append(f'PAGE ERROR: {err}'))
        page.on('console', lambda msg: errors.append(f'CONSOLE {msg.type}: {msg.text}') if msg.type in ['error', 'warning'] else None)

        await page.goto('http://localhost:8000/#/admin', wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)

        # Login
        await page.fill('#pin-input', '1111')
        await page.click('#pin-btn')
        await page.wait_for_timeout(1000)

        tabs = ['admin-rounds', 'admin-games', 'admin-players', 'admin-teams', 'admin-leagues', 'admin-news', 'admin-gallery']
        for tab in tabs:
            print(f'Clicking tab {tab}...')
            btn = page.locator(f'button.admin-nav-btn[data-target="{tab}"]')
            if await btn.count() > 0:
                await btn.click()
                await page.wait_for_timeout(800)
            else:
                print(f'Tab button {tab} not found!')

        print('Errors encountered:')
        for e in errors:
            print(e)
        if not errors:
            print('ALL TABS RENDERED CLEANLY WITHOUT ERRORS!')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_all_admin_tabs())
