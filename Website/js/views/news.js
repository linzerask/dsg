import { Store } from '../store.js?v=1790560012000';

const renderCard = (n) => `
    <div class="glass-card stagger-item news-item-card">
      ${n.image ? `
      <a href="#/article/${n.id}" class="news-img-link" aria-label="${n.title}" style="display: block; position: relative; overflow: hidden; border-radius: 6px; margin-bottom: var(--space-sm); text-decoration: none; cursor: pointer;">
        <img src="${n.image}" alt="${n.title}" style="width: 100%; height: 200px; object-fit: cover; display: block; transition: transform var(--transition-smooth);">
      </a>` : ''}
      <div style="font-size: 0.8rem; color: var(--color-accent); font-weight: 700; margin-bottom: var(--space-xs); text-transform: uppercase; letter-spacing: 0.5px;">${n.date} &bull; ${n.readTime || ''}</div>
      <h3 style="margin-bottom: var(--space-sm); font-size: 1.2rem; line-height: 1.3;">
        <a href="#/article/${n.id}" class="news-title-link" style="color: inherit; text-decoration: none; transition: color var(--transition-fast); display: inline-block; cursor: pointer;">
          ${n.title}
        </a>
      </h3>
      <div style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: var(--space-md); flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
        ${(n.content ? n.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : (n.excerpt || '')).substring(0, 150)}...
      </div>
      <a href="#/article/${n.id}" class="text-btn" style="margin-top: auto; display: inline-block; color: var(--color-accent); font-weight: 600;">Weiterlesen &rarr;</a>
    </div>
`;

export const viewNews = () => {
  const news = Store.getNews();
  const articlesHTML = news.slice(0, 6).map(renderCard).join('');

  return `
    <div class="container" style="padding-top: var(--space-xl);">
      <h1 class="stagger-item" style="margin-bottom: var(--space-xl);">DSG <span class="accent-text">NEWS</span></h1>
      
      <div class="news-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);" id="news-grid">
        ${articlesHTML}
      </div>
      
      ${news.length > 6 ? `
      <div id="load-more-container" style="text-align: center; margin-top: var(--space-xl);">
        <button id="load-more-btn" class="primary-btn">Mehr anzeigen</button>
      </div>` : ''}
      
      <div id="infinite-scroll-trigger" style="height: 20px; width: 100%; margin-top: 20px; display: none;"></div>
    </div>
    <style>
      @media (max-width: 900px) { .news-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      @media (max-width: 600px) { .news-grid { grid-template-columns: 1fr !important; } }
      .news-item-card { display: flex; flex-direction: column; transition: all var(--transition-fast); height: 100%; position: relative; }
      .news-item-card:hover { transform: translateY(-4px); box-shadow: var(--glass-shadow); border-color: var(--color-border); }
      .news-item-card .news-img-link:hover img { transform: scale(1.04); }
      .news-item-card .news-title-link:hover { color: var(--color-accent) !important; text-decoration: underline; }
    </style>
  `;
};

export const bindNews = () => {
  let visibleCount = 6;
  let infiniteScrollActive = false;
  const news = Store.getNews();
  
  const loadMore = () => {
    if (visibleCount >= news.length) return;
    
    const nextNews = news.slice(visibleCount, visibleCount + 6);
    visibleCount += 6;
    
    const nextHtml = nextNews.map(renderCard).join('');
    const grid = document.getElementById('news-grid');
    if (grid) {
      grid.insertAdjacentHTML('beforeend', nextHtml);
      // Trigger small animation for newly added items
      anime({ targets: grid.children, opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(100, {start: (visibleCount - 6) * 100}) });
    }
    
    if (visibleCount >= news.length) {
      const container = document.getElementById('load-more-container');
      if (container) container.style.display = 'none';
      const trigger = document.getElementById('infinite-scroll-trigger');
      if (trigger) trigger.style.display = 'none';
    }
  };

  const btn = document.getElementById('load-more-btn');
  const trigger = document.getElementById('infinite-scroll-trigger');

  if (btn) {
    btn.addEventListener('click', () => {
      loadMore();
      const container = document.getElementById('load-more-container');
      if (container) container.style.display = 'none';
      infiniteScrollActive = true;
      if (trigger && visibleCount < news.length) {
        trigger.style.display = 'block';
      }
    });
  }

  if (trigger) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && infiniteScrollActive) {
        loadMore();
      }
    });
    observer.observe(trigger);
  }

  window.addEventListener('data-updated', () => {
    const grid = document.getElementById('news-grid');
    if (grid && window.location.hash.startsWith('#/news')) {
      const freshNews = Store.getNews();
      grid.innerHTML = freshNews.slice(0, visibleCount).map(renderCard).join('');
    }
  });
};
