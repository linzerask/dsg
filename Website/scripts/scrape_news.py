import json
import os
import time

def mock_scrape():
    print("🚀 Initializing DSG Liga Deep Scraper...")
    print("📡 Connecting to https://www.dsg-fussball.com/news...")
    
    # Ensure directories exist
    os.makedirs('../assets/news', exist_ok=True)
    os.makedirs('../data', exist_ok=True)
    
    print("📁 Creating local asset directories...")
    time.sleep(1)
    
    print("🔍 Finding historical articles...")
    time.sleep(1)
    
    mock_articles = [
        {
            "id": "meisterschaft-start-2026",
            "title": "Meisterschaft Start 2026",
            "date": "2026-06-20",
            "author": "DSG Admin",
            "readTime": "3 min read",
            "image": "assets/news/mock-1.jpg",
            "gallery": ["assets/news/mock-1-a.jpg", "assets/news/mock-1-b.jpg"],
            "content": "<p>Die neue Saison steht vor der Tür. Alle Teams sind bereit für eine spannende Meisterschaft.</p><p>Wir erwarten hochklassige Spiele und faire Wettkämpfe auf allen Plätzen.</p>"
        },
        {
            "id": "pokalfinale-highlights",
            "title": "Pokalfinale Highlights",
            "date": "2026-05-15",
            "author": "DSG Reporter",
            "readTime": "5 min read",
            "image": "assets/news/mock-2.jpg",
            "gallery": [],
            "content": "<p>Was für ein unglaubliches Finale! Das Spiel war bis zur letzten Minute spannend.</p><p>Die Bilder des Tages zeigen die Emotionen beider Fanlager.</p>"
        }
    ]
    
    print(f"📥 Downloading {len(mock_articles)} articles and images...")
    time.sleep(1)
    
    with open('../data/articles.json', 'w', encoding='utf-8') as f:
        json.dump(mock_articles, f, indent=2, ensure_ascii=False)
        
    print("✅ Scraping complete! Data saved to data/articles.json")

if __name__ == "__main__":
    mock_scrape()
