import { Store } from '../store.js?v=1790560007000';
import { storage } from '../firebase.js?v=1790560007000';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";
import { renderIcon } from '../icons.js?v=1790560007000';

let stagedGalleryImages = []; // Array of { id, url, isCover, loading, fileName }
let editingAlbumId = null;
let searchQuery = '';

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
            if (height > MAX_HEIGHT) { width = Math.round(height * (MAX_HEIGHT / height)); height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
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

const uploadToFirebaseStorage = async (file) => {
  if (!file) return null;
  try {
    const cleanName = (file.name || 'image')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
    const storagePath = `gallery/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn("Firebase storage upload error, falling back to local compression:", err);
    return null;
  }
};

export const renderAdminGallery = () => {
  return `
    <div class="datagrid-container stagger-item">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-lg);">
        <div>
          <h2 style="margin: 0;">Galerie verwalten</h2>
          <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Fotoalben erstellen, verwalten und Bilder hochladen</p>
        </div>
      </div>

      <!-- Modern Album Editor Form Card -->
      <div class="glass-card" style="padding: var(--space-lg); margin-bottom: var(--space-xl); border: 1px solid rgba(255, 255, 255, 0.12);">
        <h3 id="gal-form-title" style="margin-bottom: var(--space-md); color: var(--color-accent); font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
          ${renderIcon('camera', { size: 20, color: 'var(--color-accent)' })} Neues Album erstellen
        </h3>

        <form id="gallery-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
          <input type="hidden" id="gal-id">

          <!-- Title & Date Grid -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Albumtitel *</label>
              <input type="text" id="gal-title" class="admin-input" placeholder="z.B. Meisterfeier 2026..." required style="width: 100%; font-size: 0.95rem;">
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Datum</label>
              <input type="date" id="gal-date" class="admin-input" style="width: 100%; font-size: 0.95rem;">
            </div>
          </div>

          <!-- Excerpt -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Beschreibung / Auszug</label>
            <textarea id="gal-excerpt" class="admin-input" placeholder="Kurze Beschreibung des Albums..." rows="2" style="width: 100%; font-size: 0.95rem; resize: vertical;"></textarea>
          </div>

          <!-- Drag & Drop Media Section -->
          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-xs);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Fotos & Titelbild (Cloud Upload)</label>
              <button type="button" id="btn-add-gal-image-url" style="background: none; border: none; color: var(--color-accent); font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: underline;">+ Bild-URL hinzufügen</button>
            </div>

            <!-- Drop Zone -->
            <div class="dropzone-container" id="gal-dropzone">
              <input type="file" id="gal-file-input" accept="image/*" multiple style="display: none;">
              <div class="dropzone-icon" style="display: flex; justify-content: center; align-items: center;">${renderIcon('cloudUpload', { size: 40, color: 'var(--color-accent)' })}</div>
              <div class="dropzone-text">Fotos hierher ziehen oder <span style="color: var(--color-accent); text-decoration: underline; font-weight: 700;">durchsuchen</span></div>
              <div class="dropzone-hint">Lade mehrere Fotos gleichzeitig hoch. Wähle anschließend per Klick das Titelbild aus.</div>
            </div>

            <!-- Staged Images Grid (With Cover Selector) -->
            <div id="gal-media-stage-grid" class="media-stage-grid" style="display: none;"></div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: var(--space-sm); align-items: center; margin-top: var(--space-sm);">
            <button type="submit" id="gal-submit-btn" class="btn-dsg" style="padding: 10px 24px; font-size: 0.95rem;">
              <span id="gal-submit-text">Album erstellen</span>
            </button>
            <button type="button" id="gal-cancel-btn" class="btn btn-outline" style="display: none; padding: 10px 18px;">
              Bearbeiten abbrechen
            </button>
          </div>
        </form>
      </div>

      <!-- Existing Albums List Section -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md);">
          <h3 style="margin: 0; font-size: 1.15rem;">Vorhandene Alben (<span id="gal-count">0</span>)</h3>
          <input type="text" id="gal-search-input" class="admin-input" placeholder="Alben durchsuchen..." style="width: 220px;">
        </div>

        <div id="admin-albums-list" style="display: flex; flex-direction: column; gap: var(--space-sm);"></div>
      </div>
    </div>

    <style>
      @media (max-width: 768px) {
        #gallery-form > div[style*="grid-template-columns"] {
          grid-template-columns: 1fr !important;
        }
      }
    </style>
  `;
};

export const initAdminGallery = () => {
  const form = document.getElementById('gallery-form');
  if (!form) return;

  const dropzone = document.getElementById('gal-dropzone');
  const fileInput = document.getElementById('gal-file-input');
  const stageGrid = document.getElementById('gal-media-stage-grid');
  const cancelBtn = document.getElementById('gal-cancel-btn');
  const submitBtn = document.getElementById('gal-submit-btn');
  const submitText = document.getElementById('gal-submit-text');
  const formTitle = document.getElementById('gal-form-title');
  const dateInput = document.getElementById('gal-date');
  const searchInput = document.getElementById('gal-search-input');

  // Set default date to today
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Toast Notification Helper
  const showToast = (message, isError = false) => {
    let toast = document.getElementById('dsg-admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dsg-admin-toast';
      toast.className = 'dsg-toast';
      document.body.appendChild(toast);
    }
    toast.className = `dsg-toast ${isError ? 'error' : ''}`;
    const iconSvg = isError
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  };

  // --- 1. Drag & Drop & Multi-Image Stage ---
  const renderMediaStage = () => {
    if (!stageGrid) return;
    if (stagedGalleryImages.length === 0) {
      stageGrid.style.display = 'none';
      stageGrid.innerHTML = '';
      return;
    }

    stageGrid.style.display = 'grid';
    stageGrid.innerHTML = stagedGalleryImages.map((img, idx) => `
      <div class="media-stage-card ${img.isCover ? 'is-cover' : ''} ${img.loading ? 'is-loading' : ''}" data-idx="${idx}">
        ${img.loading ? `
          <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.06); color: var(--color-text-secondary); font-size: 0.8rem; gap: 8px; padding: 10px; text-align: center; border-radius: 6px;">
            <div style="width: 22px; height: 22px; border: 2px solid var(--color-accent); border-top-color: transparent; border-radius: 50%; animation: dsg-spin 0.8s linear infinite;"></div>
            <span style="font-weight: 600;">Wird hochgeladen...</span>
          </div>
        ` : `
          <img src="${img.url}" alt="Vorschau" onerror="this.onerror=null; this.src='stadion.png';">
          <div class="cover-badge select-cover-btn" data-idx="${idx}" title="Klicken, um als Titelbild festzulegen">
            ${img.isCover ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="margin-right: 4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Titelbild' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Als Titelbild'}
          </div>
          <button type="button" class="media-remove-btn remove-image-btn" data-idx="${idx}" title="Bild entfernen"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        `}
      </div>
    `).join('');

    // Bind cover switchers
    stageGrid.querySelectorAll('.select-cover-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetIdx = parseInt(btn.getAttribute('data-idx'));
        stagedGalleryImages.forEach((img, i) => {
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
        const wasCover = stagedGalleryImages[targetIdx]?.isCover;
        stagedGalleryImages.splice(targetIdx, 1);
        if (wasCover && stagedGalleryImages.length > 0) {
          stagedGalleryImages[0].isCover = true;
        }
        renderMediaStage();
      });
    });
  };

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    
    // Add placeholder cards with loading spinners
    const uploadTasks = files.map((file, i) => {
      const id = 'gal_img_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substring(2, 5);
      const isFirst = stagedGalleryImages.length === 0 && i === 0;
      stagedGalleryImages.push({
        id,
        url: '',
        isCover: isFirst,
        loading: true,
        fileName: file.name
      });
      return { id, file };
    });
    renderMediaStage();

    // Upload files to Firebase Storage (with compression fallback)
    await Promise.all(uploadTasks.map(async ({ id, file }) => {
      let finalUrl = await uploadToFirebaseStorage(file);
      if (!finalUrl) {
        finalUrl = await compressImage(file);
      }
      
      const item = stagedGalleryImages.find(img => img.id === id);
      if (item && finalUrl) {
        item.url = finalUrl;
        item.loading = false;
      } else if (item && !finalUrl) {
        const idx = stagedGalleryImages.indexOf(item);
        if (idx !== -1) stagedGalleryImages.splice(idx, 1);
      }
    }));

    if (stagedGalleryImages.length > 0 && !stagedGalleryImages.some(img => img.isCover)) {
      stagedGalleryImages[0].isCover = true;
    }

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
  document.getElementById('btn-add-gal-image-url')?.addEventListener('click', () => {
    const url = prompt('Bild-URL eingeben (z.B. https://example.com/foto.jpg):');
    if (url && url.trim() !== '') {
      const isFirst = stagedGalleryImages.length === 0;
      stagedGalleryImages.push({
        id: 'gal_img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        url: url.trim(),
        isCover: isFirst,
        loading: false
      });
      renderMediaStage();
    }
  });

  // --- 2. Form Submit (Add / Update) ---
  let isSubmitting = false;

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (stagedGalleryImages.some(img => img.loading)) {
      showToast('Bilder werden noch hochgeladen. Bitte kurz warten...', true);
      return;
    }

    const id = document.getElementById('gal-id').value;
    const title = document.getElementById('gal-title').value.trim();
    const date = document.getElementById('gal-date').value || new Date().toISOString().split('T')[0];
    const excerpt = document.getElementById('gal-excerpt').value.trim();

    if (!title) {
      showToast('Bitte gib einen Albumtitel ein!', true);
      document.getElementById('gal-title').focus();
      return;
    }

    if (stagedGalleryImages.length === 0) {
      showToast('Bitte lade mindestens ein Foto für das Album hoch!', true);
      return;
    }

    isSubmitting = true;
    if (submitBtn) submitBtn.disabled = true;

    try {
      const coverItem = stagedGalleryImages.find(img => img.isCover) || stagedGalleryImages[0];
      const coverImage = coverItem.url;
      const imagesArray = stagedGalleryImages.map((img, idx) => ({
        url: img.url,
        title: `${title} ${idx + 1}`
      }));

      if (id) {
        Store.updateAlbum(id, title, date, excerpt, coverImage, imagesArray);
        showToast('Album erfolgreich aktualisiert!');
      } else {
        Store.addAlbum(title, date, excerpt, coverImage, imagesArray);
        showToast('Album erfolgreich erstellt!');
      }

      resetGalleryForm();
      renderAlbumsList();
    } catch(err) {
      console.error("Error saving album:", err);
      showToast('Fehler beim Speichern des Albums.', true);
    } finally {
      isSubmitting = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  const resetGalleryForm = () => {
    form.reset();
    document.getElementById('gal-id').value = '';
    stagedGalleryImages = [];
    editingAlbumId = null;
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (submitText) submitText.textContent = 'Album erstellen';
    if (formTitle) formTitle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg> Neues Album erstellen';
    renderMediaStage();
  };

  cancelBtn?.addEventListener('click', resetGalleryForm);

  // --- 3. Render Albums List ---
  const renderAlbumsList = () => {
    const list = document.getElementById('admin-albums-list');
    const countBadge = document.getElementById('gal-count');
    if (!list) return;

    let albums = Store.getGallery() || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      albums = albums.filter(a => (a.title && a.title.toLowerCase().includes(q)) || (a.excerpt && a.excerpt.toLowerCase().includes(q)));
    }

    if (countBadge) countBadge.textContent = albums.length;

    if (albums.length === 0) {
      list.innerHTML = `<div style="text-align: center; padding: var(--space-lg); color: var(--color-text-secondary);">Keine Fotoalben gefunden.</div>`;
      return;
    }

    list.innerHTML = albums.map(a => {
      const photosCount = (a.images && Array.isArray(a.images)) ? a.images.length : 1;
      const coverUrl = a.image || (a.images && a.images[0]?.url) || 'stadion.png';

      return `
        <div class="admin-item-card glass-card">
          <div class="admin-item-main">
            <img src="${coverUrl}" alt="Cover" onerror="this.onerror=null; this.src='stadion.png';" class="admin-item-thumb">
            <div class="admin-item-info">
              <strong class="admin-item-title">${a.title}</strong>
              <div class="admin-item-meta">
                <span class="admin-item-meta-entry">${renderIcon('calendar', { size: 13, color: 'var(--color-text-secondary)' })} ${a.date || 'Kein Datum'}</span>
                <span class="admin-item-meta-entry" style="color: var(--color-accent); font-weight: 700;">&bull; ${renderIcon('camera', { size: 13, color: 'var(--color-accent)' })} ${photosCount} ${photosCount === 1 ? 'Foto' : 'Fotos'}</span>
              </div>
              ${a.excerpt ? `
                <div class="admin-item-preview">
                  ${a.excerpt}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="admin-item-actions">
            <a href="#/galerie" class="btn btn-outline admin-item-btn" title="Galerie ansehen">${renderIcon('eye', { size: 14 })} Ansehen</a>
            <button class="btn btn-outline edit-gal-btn admin-item-btn" data-id="${a.id}">${renderIcon('edit', { size: 14 })} Bearbeiten</button>
            <button class="btn delete-gal-btn admin-item-btn btn-danger" data-id="${a.id}">${renderIcon('trash', { size: 14 })} Löschen</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind Edit Buttons
    list.querySelectorAll('.edit-gal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const album = Store.getAlbum(id);
        if (!album) return;

        editingAlbumId = album.id;
        document.getElementById('gal-id').value = album.id;
        document.getElementById('gal-title').value = album.title || '';
        document.getElementById('gal-excerpt').value = album.excerpt || '';

        if (dateInput) {
          let dVal = album.date || '';
          if (dVal.includes('.')) {
            const p = dVal.split('.');
            if (p.length === 3) dVal = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
          }
          dateInput.value = dVal;
        }

        // Load staged images
        stagedGalleryImages = [];
        const coverSrc = album.image;
        if (album.images && Array.isArray(album.images) && album.images.length > 0) {
          album.images.forEach((img, i) => {
            const url = typeof img === 'string' ? img : img.url;
            if (url) {
              const isCover = coverSrc ? (url === coverSrc) : (i === 0);
              stagedGalleryImages.push({
                id: 'gal_' + i + '_' + Date.now(),
                url: url,
                isCover: isCover,
                loading: false
              });
            }
          });
        } else if (coverSrc) {
          stagedGalleryImages.push({
            id: 'cover_' + album.id,
            url: coverSrc,
            isCover: true,
            loading: false
          });
        }

        if (stagedGalleryImages.length > 0 && !stagedGalleryImages.some(img => img.isCover)) {
          stagedGalleryImages[0].isCover = true;
        }

        renderMediaStage();

        // UI state changes
        if (submitText) submitText.textContent = 'Album aktualisieren';
        if (formTitle) formTitle.innerHTML = `${renderIcon('edit', { size: 20, color: 'var(--color-accent)' })} Album bearbeiten: <i>${album.title}</i>`;
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        // Smooth scroll to top of form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Bind Delete Buttons
    list.querySelectorAll('.delete-gal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Möchtest du dieses Album wirklich unwiderruflich löschen?')) {
          Store.deleteAlbum(id);
          if (editingAlbumId === id) resetGalleryForm();
          renderAlbumsList();
          showToast('Album gelöscht.');
        }
      });
    });
  };

  // Search input event
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderAlbumsList();
  });

  // Initial render
  renderAlbumsList();
};
