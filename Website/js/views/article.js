import { Store } from '../store.js';

export const viewArticle = (id) => {
  const article = Store.getArticle(id);
  
  if (!article) {
    return `
      <div class="container" style="padding-top: 100px; text-align: center;">
        <h1 class="stagger-item">Artikel nicht gefunden</h1>
        <a href="#/news" class="btn stagger-item" style="margin-top: 20px; display: inline-block;">Zurück zu News</a>
      </div>
    `;
  }

  // Generate grid if gallery exists
  let galleryHTML = '';
  if (article.gallery && article.gallery.length > 0) {
    galleryHTML = `
      <div class="article-carousel stagger-item">
        <h3 style="margin-bottom: var(--space-md); text-align: center;">Galerie</h3>
        <div class="carousel-track">
          ${article.gallery.map(img => `<img src="${img.url || img}" alt="Gallery Image" class="carousel-image">`).join('')}
        </div>
      </div>
      
      <!-- Lightbox Container -->
      <div id="article-lightbox" class="lightbox">
        <span class="lightbox-close">&times;</span>
        <span class="lightbox-nav lightbox-prev">&#10094;</span>
        <span class="lightbox-nav lightbox-next">&#10095;</span>
        <img class="lightbox-content" id="lightbox-img">
      </div>
    `;
  }

  return `
    <div class="reading-progress-bar" id="reading-progress"></div>
    
    <article class="article-page">
      <header class="article-hero stagger-item" style="background-image: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url('${article.image}')">
        <div class="container article-hero-content">
          <span class="article-meta">${article.date} &bull; ${article.readTime}</span>
          <h1 class="article-title">${article.title}</h1>
          <p class="article-author">Von ${article.author}</p>
        </div>
      </header>

      <div class="container">
        <div class="article-body stagger-item">
          ${article.content}
        </div>

        ${galleryHTML}

        <div class="article-share stagger-item">
          <h3>Diesen Artikel teilen</h3>
          <div class="share-buttons">
            <button class="share-btn" onclick="window.open('https://wa.me/?text=Check out this article: ' + window.location.href)">WhatsApp</button>
            <button class="share-btn" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + window.location.href)">Facebook</button>
            <button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href); alert('Link kopiert!')">Link kopieren</button>
          </div>
        </div>

        <div class="related-news stagger-item">
          <h3>Ähnliche Artikel</h3>
          <div class="related-grid">
            ${Store.getNews().filter(a => String(a.id) !== String(id)).slice(0, 3).map(a => `
              <a href="#/article/${a.id}" class="related-card glass-card">
                <img src="${a.image}" alt="${a.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">
                <h4>${a.title}</h4>
              </a>
            `).join('')}
          </div>
          <a href="#/news" class="btn" style="margin-top: 30px; display: inline-block;">Zurück zur Übersicht</a>
        </div>
      </div>
    </article>
  `;
};

export const bindArticle = () => {
  // Reading progress bar logic
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressBar = document.getElementById("reading-progress");
    if (progressBar) progressBar.style.width = scrolled + "%";
  });

  // Lightbox logic
  const lightbox = document.getElementById('article-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  
  if (lightbox && lightboxImg && closeBtn) {
    const images = Array.from(document.querySelectorAll('.carousel-image'));
    let currentIndex = 0;

    const showImage = (index) => {
      if (index < 0) index = images.length - 1;
      if (index >= images.length) index = 0;
      currentIndex = index;
      lightboxImg.src = images[currentIndex].src;
    };

    images.forEach((img, index) => {
      img.addEventListener('click', () => {
        lightbox.style.display = 'flex';
        showImage(index);
      });
    });

    closeBtn.addEventListener('click', () => {
      lightbox.style.display = 'none';
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.style.display = 'none';
      }
    });

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentIndex - 1);
      });
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentIndex + 1);
      });
    }
  }
};
