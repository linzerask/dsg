import { Store } from '../store.js?v=1790560022000';
export let currentEvent = null;
let currentLightboxIndex = 0;
let currentImages = [];

export const viewGalerie = () => {
  if (!currentEvent) {
    // ---------------- ALBUMS VIEW ----------------
    const albums = Store.getGallery();

    const albumsHTML = albums.map(a => `
      <div class="masonry-item glass-card stagger-item album-card" data-id="${a.id}">
        <div style="position: relative; overflow: hidden; border-radius: 4px; margin-bottom: 10px;">
          <img src="${a.image || 'stadion.png'}" alt="${a.title || 'Galerie'}" onerror="this.onerror=null; this.src='stadion.png';" style="width: 100%; height: 200px; object-fit: cover; display: block; transition: transform var(--transition-smooth);">
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent); pointer-events: none;"></div>
        </div>
        <div style="font-size: 0.8rem; color: var(--color-accent); font-weight: 700; margin-bottom: var(--space-xs); text-transform: uppercase;">${a.date}</div>
        <h3 style="margin-bottom: var(--space-sm); font-size: 1.2rem; line-height: 1.3;">${a.title}</h3>
        <div style="color: var(--color-text-secondary); font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${a.excerpt}
        </div>
      </div>
    `).join('');

    return `
      <div class="container" style="padding-top: var(--space-xl);">
        <h1 class="stagger-item" style="margin-bottom: var(--space-xl); text-align: left;">DSG <span class="accent-text">GALERIE</span></h1>
        
        <div class="gallery-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);" id="albums-grid">
          ${albumsHTML}
        </div>
        
        <!-- Infinite Scroll Trigger Mock -->
        <div id="infinite-scroll-trigger" style="height: 20px; width: 100%; margin-top: 20px;"></div>
      </div>
      <style>
        @media (max-width: 900px) { .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .gallery-grid { grid-template-columns: 1fr !important; } }
        .album-card { cursor: pointer; transition: all var(--transition-fast); }
        .album-card:hover { transform: translateY(-4px); box-shadow: var(--glass-shadow); border-color: var(--color-border); }
        .album-card:hover img { transform: scale(1.05); }
      </style>
    `;
  } else {
    // ---------------- PICTURES VIEW ----------------
    const album = Store.getGallery().find(a => String(a.id) === String(currentEvent));
    if (!album) {
      return `<div class="container" style="padding-top: var(--space-xl);"><h1 style="text-align: center;">Album nicht gefunden</h1><button id="back-to-albums" class="primary-btn" style="display:block; margin: var(--space-md) auto;">&larr; Zurück</button></div>`;
    }
    currentImages = album.images || [];

    const masonryHtml = currentImages.map((img, i) => {
      const src = typeof img === 'string' ? img : (img?.url || '');
      const alt = (typeof img === 'object' && img?.title) ? img.title : `${album.title || 'Galerie'} ${i + 1}`;
      return `
      <div class="masonry-item stagger-item glass-card gallery-img-card" data-index="${i}">
        <img src="${src || 'stadion.png'}" alt="${alt}" onerror="this.onerror=null; this.src='stadion.png';" style="width: 100%; border-radius: var(--border-radius-sm); display: block;" loading="lazy">
      </div>
      `;
    }).join('');

    return `
      <div class="container" style="padding-top: var(--space-xl);">
        <div class="stagger-item" style="margin-bottom: var(--space-xl);">
          <button id="back-to-albums" class="primary-btn" style="margin-bottom: var(--space-md);">&larr; Zurück zu Alben</button>
          <h1 style="text-align: left;">${album.title}</h1>
          <p style="color: var(--color-text-secondary); margin-top: var(--space-xs);">${album.date} &bull; ${currentImages.length} Bilder</p>
        </div>
        
        <div class="gallery-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-md);">
          ${masonryHtml}
        </div>
      </div>
      
      <!-- Lightbox Container -->
      <div id="lightbox" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
        <button id="lightbox-close" style="position: absolute; top: 20px; right: 30px; color: white; font-size: 2rem; background: none; border: none; cursor: pointer;">&times;</button>
        <button id="lightbox-prev" style="position: absolute; left: 20px; color: white; font-size: 2rem; background: none; border: none; cursor: pointer;">&larr;</button>
        <img id="lightbox-img" src="" style="max-width: 90%; max-height: 90%; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
        <button id="lightbox-next" style="position: absolute; right: 20px; color: white; font-size: 2rem; background: none; border: none; cursor: pointer;">&rarr;</button>
      </div>

      <style>
        @media (max-width: 900px) { .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .gallery-grid { grid-template-columns: 1fr !important; } }
        
        .gallery-img-card {
          padding: var(--space-sm); 
          break-inside: avoid; 
          margin-bottom: var(--space-md); 
          cursor: pointer;
          transition: all 0.3s ease;
        }
        /* Hover effect: Glassmorphism glow */
        .gallery-img-card:hover {
          box-shadow: 0 0 15px var(--color-accent-glow);
          transform: scale(1.02);
          border-color: var(--color-accent);
        }
      </style>
    `;
  }
};

export const bindGalerie = () => {
  if (!currentEvent) {
    // Bind Album Clicks
    document.querySelectorAll('.album-card').forEach(card => {
      card.addEventListener('click', (e) => {
        currentEvent = e.currentTarget.getAttribute('data-id');
        import('../router.js').then(module => module.Router.handleRoute());
      });
    });

    // Infinite Scroll Observer Mock
    const trigger = document.getElementById('infinite-scroll-trigger');
    if (trigger) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log('Load more albums...');
        }
      });
      observer.observe(trigger);
    }
  } else {
    // Bind Back Button
    const backBtn = document.getElementById('back-to-albums');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        currentEvent = null;
        import('../router.js').then(module => module.Router.handleRoute());
      });
    }

    // Bind Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    const updateLightboxImage = () => {
      const item = currentImages[currentLightboxIndex];
      if (item) {
        lightboxImg.src = typeof item === 'string' ? item : (item.url || '');
      }
    };

    document.querySelectorAll('.gallery-img-card').forEach(card => {
      card.addEventListener('click', (e) => {
        currentLightboxIndex = parseInt(e.currentTarget.getAttribute('data-index'));
        updateLightboxImage();
        lightbox.style.display = 'flex';
        // Small animation
        lightboxImg.animate([{ transform: 'scale(0.9)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300, easing: 'ease-out' });
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
      });
    }
    
    // Close on background click
    if(lightbox) {
        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox) lightbox.style.display = 'none';
        });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentLightboxIndex = (currentLightboxIndex - 1 + currentImages.length) % currentImages.length;
        updateLightboxImage();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentLightboxIndex = (currentLightboxIndex + 1) % currentImages.length;
        updateLightboxImage();
      });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function lightboxKeys(e) {
        if(lightbox.style.display === 'flex') {
            if(e.key === 'Escape') lightbox.style.display = 'none';
            if(e.key === 'ArrowLeft') {
                currentLightboxIndex = (currentLightboxIndex - 1 + currentImages.length) % currentImages.length;
                updateLightboxImage();
            }
            if(e.key === 'ArrowRight') {
                currentLightboxIndex = (currentLightboxIndex + 1) % currentImages.length;
                updateLightboxImage();
            }
        }
    });
  }
};
