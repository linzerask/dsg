import { Store } from '../store.js';

let stagedImages = []; // Array of { id, url, isCover }
let editingArticleId = null;
let searchQuery = '';
let savedSelectionRange = null;

const compressImage = (file) => {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height = Math.round(height * (MAX_WIDTH / width)); width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width = Math.round(width * (MAX_HEIGHT / height)); height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (err) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export const renderAdminNews = () => {
  return `
    <div class="datagrid-container stagger-item">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-lg);">
        <div>
          <h2 style="margin: 0;">News verwalten</h2>
          <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Artikel erstellen, formatieren und Medien verwalten</p>
        </div>
      </div>

      <!-- Modern News Editor Form Card -->
      <div class="glass-card" style="padding: var(--space-lg); margin-bottom: var(--space-xl); border: 1px solid rgba(255, 255, 255, 0.12);">
        <h3 id="news-form-title" style="margin-bottom: var(--space-md); color: var(--color-accent); font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
          <span>📝</span> Neuer Artikel
        </h3>

        <form id="news-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
          <input type="hidden" id="news-id">

          <!-- Title & Meta Grid -->
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: var(--space-md);">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Titel *</label>
              <input type="text" id="news-title" class="admin-input" placeholder="Titel des Artikels..." required style="width: 100%; font-size: 0.95rem;">
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Autor</label>
              <input type="text" id="news-author" class="admin-input" placeholder="z.B. DSG Redaktion" value="DSG Redaktion" style="width: 100%; font-size: 0.95rem;">
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Datum</label>
              <input type="date" id="news-date" class="admin-input" style="width: 100%; font-size: 0.95rem;">
            </div>
          </div>

          <!-- Rich Text Editor Section -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Inhalt & Formatierung *</label>
            <div class="rte-container">
              <!-- Toolbar -->
              <div class="rte-toolbar" id="rte-toolbar">
                <div class="rte-btn-group">
                  <select id="rte-block-format" class="rte-select" title="Textformat">
                    <option value="p">Absatz</option>
                    <option value="h2">Überschrift 2</option>
                    <option value="h3">Überschrift 3</option>
                    <option value="blockquote">Zitatblock</option>
                  </select>
                </div>

                <div class="rte-btn-group">
                  <button type="button" class="rte-btn" data-command="bold" title="Fett (Strg+B)"><b>B</b></button>
                  <button type="button" class="rte-btn" data-command="italic" title="Kursiv (Strg+I)"><i>I</i></button>
                  <button type="button" class="rte-btn" data-command="underline" title="Unterstrichen (Strg+U)"><u>U</u></button>
                  <button type="button" class="rte-btn" data-command="strikeThrough" title="Durchgestrichen"><s>S</s></button>
                </div>

                <div class="rte-btn-group">
                  <button type="button" class="rte-btn" data-command="justifyLeft" title="Linksbündig">⇤</button>
                  <button type="button" class="rte-btn" data-command="justifyCenter" title="Zentriert">≡</button>
                  <button type="button" class="rte-btn" data-command="justifyRight" title="Rechtsbündig">⇥</button>
                </div>

                <div class="rte-btn-group">
                  <button type="button" class="rte-btn" data-command="insertUnorderedList" title="Aufzählungsliste">• Liste</button>
                  <button type="button" class="rte-btn" data-command="insertOrderedList" title="Nummerierte Liste">1. Liste</button>
                </div>

                <div class="rte-btn-group">
                  <button type="button" class="rte-btn" id="rte-link-btn" title="Link einfügen">🔗 Link</button>
                  <button type="button" class="rte-btn" data-command="removeFormat" title="Formatierung entfernen">🧹</button>
                </div>
              </div>

              <!-- Editable Canvas -->
              <div id="rte-editor" class="rte-editor" contenteditable="true" data-placeholder="Schreibe deinen Artikel hier... Nutze die Leiste oben für Formatierungen."></div>
            </div>
          </div>

          <!-- Drag & Drop Media Section -->
          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-xs);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Bilder & Titelbild (Drag & Drop)</label>
              <button type="button" id="btn-add-image-url" style="background: none; border: none; color: var(--color-accent); font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: underline;">+ Bild-URL hinzufügen</button>
            </div>

            <!-- Drop Zone -->
            <div class="dropzone-container" id="news-dropzone">
              <input type="file" id="news-file-input" accept="image/*" multiple style="display: none;">
              <div class="dropzone-icon">📁</div>
              <div class="dropzone-text">Bilder hierher ziehen oder <span style="color: var(--color-accent); text-decoration: underline; font-weight: 700;">durchsuchen</span></div>
              <div class="dropzone-hint">Unterstützt JPG, PNG, WEBP, AVIF. Mehrere Bilder gleichzeitig auswählen oder ablegen.</div>
            </div>

            <!-- Staged Images Grid (With Cover Selector) -->
            <div id="media-stage-grid" class="media-stage-grid" style="display: none;"></div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: var(--space-sm); align-items: center; margin-top: var(--space-sm);">
            <button type="submit" id="news-submit-btn" class="btn-dsg" style="padding: 10px 24px; font-size: 0.95rem;">
              <span id="news-submit-text">News veröffentlichen</span>
            </button>
            <button type="button" id="news-cancel-btn" class="btn btn-outline" style="display: none; padding: 10px 18px;">
              Bearbeiten abbrechen
            </button>
          </div>
        </form>
      </div>

      <!-- Articles List Section -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md);">
          <h3 style="margin: 0; font-size: 1.15rem;">Vorhandene Artikel (<span id="news-count">0</span>)</h3>
          <input type="text" id="news-search-input" class="admin-input" placeholder="Artikel durchsuchen..." style="width: 220px;">
        </div>

        <div id="admin-news-list" style="display: flex; flex-direction: column; gap: var(--space-sm);"></div>
      </div>
    </div>

    <style>
      @media (max-width: 768px) {
        #news-form > div[style*="grid-template-columns"] {
          grid-template-columns: 1fr !important;
        }
      }
    </style>
  `;
};

export const initAdminNews = () => {
  const form = document.getElementById('news-form');
  if (!form) return;

  const editor = document.getElementById('rte-editor');
  const toolbar = document.getElementById('rte-toolbar');
  const dropzone = document.getElementById('news-dropzone');
  const fileInput = document.getElementById('news-file-input');
  const stageGrid = document.getElementById('media-stage-grid');
  const cancelBtn = document.getElementById('news-cancel-btn');
  const submitText = document.getElementById('news-submit-text');
  const formTitle = document.getElementById('news-form-title');
  const dateInput = document.getElementById('news-date');
  const searchInput = document.getElementById('news-search-input');

  // Set default date to today
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // --- 1. Rich Text Editor Toolbar Actions ---
  const executeCommand = (command, value = null) => {
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, value);
    updateToolbarActiveStates();
  };

  toolbar?.querySelectorAll('.rte-btn[data-command]').forEach(btn => {
    const command = btn.getAttribute('data-command');
    
    // Execute on mousedown so selection is never lost
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      executeCommand(command);
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });

  const blockFormatSelect = document.getElementById('rte-block-format');
  blockFormatSelect?.addEventListener('change', (e) => {
    const value = e.target.value;
    if (value === 'blockquote') {
      executeCommand('formatBlock', 'blockquote');
    } else {
      executeCommand('formatBlock', `<${value}>`);
    }
  });

  const linkBtn = document.getElementById('rte-link-btn');
  linkBtn?.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const url = prompt('Webadresse (URL) eingeben:', 'https://');
    if (url && url.trim() !== '' && url !== 'https://') {
      executeCommand('createLink', url.trim());
    }
  });

  linkBtn?.addEventListener('click', (e) => {
    e.preventDefault();
  });

  const updateToolbarActiveStates = () => {
    toolbar?.querySelectorAll('.rte-btn[data-command]').forEach(btn => {
      const command = btn.getAttribute('data-command');
      try {
        if (document.queryCommandState(command)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      } catch (err) {}
    });
  };

  // Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)
  editor?.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        executeCommand('bold');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        executeCommand('italic');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        executeCommand('underline');
      }
    }
  });

  ['keyup', 'mouseup', 'touchend', 'input'].forEach(evt => {
    editor?.addEventListener(evt, updateToolbarActiveStates);
  });

  // --- 2. Drag & Drop & Multi-Image Stage ---
  const renderMediaStage = () => {
    if (!stageGrid) return;
    if (stagedImages.length === 0) {
      stageGrid.style.display = 'none';
      stageGrid.innerHTML = '';
      return;
    }

    stageGrid.style.display = 'grid';
    stageGrid.innerHTML = stagedImages.map((img, idx) => `
      <div class="media-stage-card ${img.isCover ? 'is-cover' : ''}" data-idx="${idx}">
        <img src="${img.url}" alt="Vorschau">
        <div class="cover-badge select-cover-btn" data-idx="${idx}" title="Klicken, um als Titelbild festzulegen">
          ${img.isCover ? '★ Titelbild' : '☆ Als Titelbild'}
        </div>
        <button type="button" class="media-remove-btn remove-image-btn" data-idx="${idx}" title="Bild entfernen">✕</button>
      </div>
    `).join('');

    // Bind cover switchers
    stageGrid.querySelectorAll('.select-cover-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetIdx = parseInt(btn.getAttribute('data-idx'));
        stagedImages.forEach((img, i) => {
          img.isCover = (i === targetIdx);
        });
        renderMediaStage();
      });
    });

    // Bind remove image buttons
    stageGrid.querySelectorAll('.remove-image-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetIdx = parseInt(btn.getAttribute('data-idx'));
        const wasCover = stagedImages[targetIdx]?.isCover;
        stagedImages.splice(targetIdx, 1);
        if (wasCover && stagedImages.length > 0) {
          stagedImages[0].isCover = true;
        }
        renderMediaStage();
      });
    });
  };

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    
    // Process all files in parallel
    const processed = await Promise.all(files.map(async (file) => {
      return await compressImage(file);
    }));

    processed.forEach(compressed => {
      if (compressed) {
        const isFirst = stagedImages.length === 0;
        stagedImages.push({
          id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          url: compressed,
          isCover: isFirst
        });
      }
    });

    renderMediaStage();
  };

  dropzone?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  fileInput?.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  });

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('dragover');
  });

  dropzone?.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('dragover');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });

  // URL input modal
  document.getElementById('btn-add-image-url')?.addEventListener('click', () => {
    const url = prompt('Bild-URL eingeben (z.B. https://example.com/foto.jpg):');
    if (url && url.trim() !== '') {
      const isFirst = stagedImages.length === 0;
      stagedImages.push({
        id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        url: url.trim(),
        isCover: isFirst
      });
      renderMediaStage();
    }
  });

  // --- 3. Form Submit (Add / Update) ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('news-id').value;
    const title = document.getElementById('news-title').value.trim();
    const author = document.getElementById('news-author').value.trim() || 'DSG Redaktion';
    const date = document.getElementById('news-date').value || new Date().toISOString().split('T')[0];
    const htmlContent = editor.innerHTML.trim();

    if (!htmlContent || htmlContent === '<br>' || htmlContent === '<p></p>') {
      alert('Bitte gib einen Artikelinhalt ein!');
      editor.focus();
      return;
    }

    // Determine cover and gallery
    let coverImage = 'dsg.avif';
    let galleryArray = [];

    if (stagedImages.length > 0) {
      const coverItem = stagedImages.find(img => img.isCover) || stagedImages[0];
      coverImage = coverItem.url;
      galleryArray = stagedImages.filter(img => img !== coverItem).map(img => ({ url: img.url }));
    }

    // Excerpt for cards: strip HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const excerpt = plainText.substring(0, 160).trim() + (plainText.length > 160 ? '...' : '');

    // Reading time calculation
    const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
    const readMinutes = Math.max(1, Math.ceil(words / 180));
    const readTime = `${readMinutes} min read`;

    if (id) {
      // Update existing article
      Store.updateNews(id, title, excerpt, htmlContent, coverImage, galleryArray, author, date, readTime);
      alert('Artikel erfolgreich aktualisiert!');
    } else {
      // Create new article
      Store.addNews(title, excerpt, htmlContent, coverImage, galleryArray, author, date, readTime);
      alert('Artikel erfolgreich veröffentlicht!');
    }

    resetNewsForm();
    renderNewsList();
  });

  const resetNewsForm = () => {
    form.reset();
    document.getElementById('news-id').value = '';
    editor.innerHTML = '';
    stagedImages = [];
    editingArticleId = null;
    savedSelectionRange = null;
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (document.getElementById('news-author')) document.getElementById('news-author').value = 'DSG Redaktion';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (submitText) submitText.textContent = 'News veröffentlichen';
    if (formTitle) formTitle.innerHTML = '<span>📝</span> Neuer Artikel';
    renderMediaStage();
  };

  cancelBtn?.addEventListener('click', resetNewsForm);

  // --- 4. Render Articles List ---
  const renderNewsList = () => {
    const list = document.getElementById('admin-news-list');
    const countBadge = document.getElementById('news-count');
    if (!list) return;

    let articles = Store.getNews() || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter(a => (a.title && a.title.toLowerCase().includes(q)) || (a.content && a.content.toLowerCase().includes(q)));
    }

    if (countBadge) countBadge.textContent = articles.length;

    if (articles.length === 0) {
      list.innerHTML = `<div style="text-align: center; padding: var(--space-lg); color: var(--color-text-secondary);">Keine Artikel gefunden.</div>`;
      return;
    }

    list.innerHTML = articles.map(a => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = a.content || a.excerpt || '';
      const previewText = (tempDiv.textContent || tempDiv.innerText || '').substring(0, 100);
      const hasGallery = a.gallery && a.gallery.length > 0;

      return `
        <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-sm) var(--space-md); gap: var(--space-md);">
          <div style="display: flex; align-items: center; gap: var(--space-md); min-width: 0;">
            ${a.image ? `
              <img src="${a.image}" alt="Cover" style="width: 55px; height: 55px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1); flex-shrink: 0;">
            ` : ''}
            <div style="min-width: 0;">
              <strong style="font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${a.title}</strong>
              <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px;">
                <span>📅 ${a.date || 'Kein Datum'}</span>
                ${a.author ? ` &bull; <span>✍ ${a.author}</span>` : ''}
                ${hasGallery ? ` &bull; <span style="color: var(--color-accent); font-weight: 700;">📷 +${a.gallery.length} Fotos</span>` : ''}
              </div>
              <div style="font-size: 0.8rem; color: var(--color-text-secondary); opacity: 0.75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                ${previewText}...
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            <a href="#/article/${a.id}" target="_blank" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" title="Artikel ansehen">👁 Ansehen</a>
            <button class="btn btn-outline edit-news-btn" data-id="${a.id}" style="padding: 6px 12px; font-size: 0.8rem;">Bearbeiten</button>
            <button class="btn delete-news-btn" data-id="${a.id}" style="padding: 6px 12px; font-size: 0.8rem; background: #e74c3c; border: none; color: white;">Löschen</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind Edit Buttons
    list.querySelectorAll('.edit-news-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const article = Store.getArticle(id);
        if (!article) return;

        editingArticleId = article.id;
        document.getElementById('news-id').value = article.id;
        document.getElementById('news-title').value = article.title || '';
        if (document.getElementById('news-author')) document.getElementById('news-author').value = article.author || 'DSG Redaktion';
        if (dateInput) dateInput.value = article.date || '';

        // Load rich text
        editor.innerHTML = article.content || `<p>${article.excerpt || ''}</p>`;

        // Load staged images
        stagedImages = [];
        if (article.image) {
          stagedImages.push({
            id: 'cover_' + article.id,
            url: article.image,
            isCover: true
          });
        }
        if (article.gallery && Array.isArray(article.gallery)) {
          article.gallery.forEach((g, i) => {
            const imgUrl = typeof g === 'string' ? g : g.url;
            if (imgUrl && imgUrl !== article.image) {
              stagedImages.push({
                id: 'gal_' + i + '_' + Date.now(),
                url: imgUrl,
                isCover: false
              });
            }
          });
        }
        renderMediaStage();

        // UI state changes
        if (submitText) submitText.textContent = 'News aktualisieren';
        if (formTitle) formTitle.innerHTML = `<span>✏️</span> Artikel bearbeiten: <i>${article.title}</i>`;
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        // Smooth scroll to top of form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Bind Delete Buttons
    list.querySelectorAll('.delete-news-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Möchtest du diesen Artikel wirklich unwiderruflich löschen?')) {
          Store.deleteArticle(id);
          if (editingArticleId === id) resetNewsForm();
          renderNewsList();
        }
      });
    });
  };

  // Search input event
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderNewsList();
  });

  // Initial render
  renderNewsList();
};
