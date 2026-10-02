import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1400, 'height': 1000})
        page = await context.new_page()
        
        url = 'https://linzerask.github.io/dsg/Website/#/liga'
        print(f"Navigating to {url}...")
        try:
            await page.goto(url, wait_until='domcontentloaded', timeout=15000)
            await page.wait_for_timeout(3000)
            
            # Extract dropdown options
            options = await page.locator('#season-select option').all_text_contents()
            print("Dropdown options found on live site:", options)
            
            # Extract active heading
            heading = await page.locator('h1').all_text_contents()
            print("Headings:", heading)
            
            # Extract top 3 teams in table
            teams = await page.locator('.table-row .team-name, .standings-table td:nth-child(2)').all_text_contents()
            print("Teams in table:", teams[:5])
            
            await page.screenshot(path="C:/Users/43670/.gemini/antigravity/brain/50a6e908-29f5-4de0-92ae-88f08ee7a8f5/live_pages_liga.png", full_page=True)
            print("Saved live_pages_liga.png")
        except Exception as e:
            print("Error:", e)
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(check())
