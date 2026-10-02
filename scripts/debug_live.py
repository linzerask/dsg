import asyncio
from playwright.async_api import async_playwright

async def debug_live():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        logs = []
        page.on('console', lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: logs.append(f"[PAGE_ERROR] {err}"))
        
        url = 'https://linzerask.github.io/dsg/Website/#/liga'
        print(f"Opening {url}...")
        await page.goto(url, wait_until='domcontentloaded', timeout=15000)
        await page.wait_for_timeout(3000)
        
        state_info = await page.evaluate("""() => {
            return {
                localStorageKeys: Object.keys(localStorage),
                dsg_data: localStorage.getItem('dsg_data_v79') ? 'v79 present' : 'no v79',
                dsg_admin_leagues: localStorage.getItem('dsg_admin_leagues_v35'),
                memoryDataSeasons: window.__DSG_STATE__ ? Object.keys(window.__DSG_STATE__.memoryData?.seasons || {}) : 'no state',
                htmlHeading: document.querySelector('h1')?.innerText,
                dropdownHtml: document.querySelector('.custom-select-container')?.outerHTML || document.querySelector('.season-select-wrapper')?.outerHTML || document.querySelector('select')?.outerHTML
            };
        }""")
        
        print("=== BROWSER STATE INFO ===")
        print("State:", state_info)
        print("\n=== CONSOLE LOGS ===")
        for log in logs:
            print(log)
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(debug_live())
