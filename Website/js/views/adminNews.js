import { Store } from '../store.js?v=1790957000000';
import { storage } from '../firebase.js?v=1790957000000';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";
import { renderIcon } from '../icons.js?v=1790957000000';

let stagedImages = []; // Array of { id, url, isCover, loading, fileName }
let editingArticleId = null;
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
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
          resolve(canvas.toDataURL('image/jpeg', 0.65));
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
    const storagePath = `news/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn("Firebase storage upload error, falling back to local compression:", err);
    return null;
  }
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
          ${renderIcon('edit', { size: 20, color: 'var(--color-accent)' })} Neuer Artikel
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
                  <button type="button" class="rte-btn" id="rte-link-btn" title="Link einfügen"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> Link</button>
                  <button type="button" class="rte-btn" data-command="removeFormat" title="Formatierung entfernen"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg></button>
                </div>
              </div>

              <!-- Editable Canvas -->
              <div id="rte-editor" class="rte-editor" contenteditable="true" data-placeholder="Schreibe deinen Artikel hier... Nutze die Leiste oben für Formatierungen."></div>
            </div>
          </div>

          <!-- Drag & Drop Media Section -->
          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-xs);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary);">Bilder & Titelbild (Cloud Upload)</label>
              <button type="button" id="btn-add-image-url" style="background: none; border: none; color: var(--color-accent); font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: underline;">+ Bild-URL hinzufügen</button>
            </div>

            <!-- Drop Zone -->
            <div class="dropzone-container" id="news-dropzone">
              <input type="file" id="news-file-input" accept="image/*" multiple style="display: none;">
              <div class="dropzone-icon" style="display: flex; justify-content: center; align-items: center;">${renderIcon('cloudUpload', { size: 40, color: 'var(--color-accent)' })}</div>
              <div class="dropzone-text">Bilder hierher ziehen oder <span style="color: var(--color-accent); text-decoration: underline; font-weight: 700;">durchsuchen</span></div>
              <div class="dropzone-hint">Bilder werden automatisch in Firebase Cloud Storage gespeichert und optimiert.</div>
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
      @keyframes dsg-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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
  const blockFormatSelect = document.getElementById('rte-block-format');
  const dropzone = document.getElementById('news-dropzone');
  const fileInput = document.getElementById('news-file-input');
  const stageGrid = document.getElementById('media-stage-grid');
  const cancelBtn = document.getElementById('news-cancel-btn');
  const submitBtn = document.getElementById('news-submit-btn');
  const submitText = document.getElementById('news-submit-text');
  const formTitle = document.getElementById('news-form-title');
  const dateInput = document.getElementById('news-date');
  const searchInput = document.getElementById('news-search-input');

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

  // --- 1. Rich Text Editor Range & Actions ---
  let savedRange = null;

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editor && (editor.contains(range.commonAncestorContainer) || editor === range.commonAncestorContainer)) {
        savedRange = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (!editor) return;
    editor.focus();
    if (savedRange) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
  };

  const executeCommand = (command, value = null) => {
    if (!editor) return;
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    updateToolbarActiveStates();
  };

  toolbar?.querySelectorAll('.rte-btn[data-command]').forEach(btn => {
    const command = btn.getAttribute('data-command');
    
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      executeCommand(command);
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });

  blockFormatSelect?.addEventListener('mousedown', () => {
    saveSelection();
  });

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
    saveSelection();
  });

  linkBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const url = prompt('Webadresse (URL) eingeben:', 'https://');
    if (url && url.trim() !== '' && url !== 'https://') {
      executeCommand('createLink', url.trim());
    }
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

    if (blockFormatSelect) {
      try {
        const val = document.queryCommandValue('formatBlock');
        if (val) {
          const cleanVal = val.toLowerCase().replace(/[<>]/g, '');
          if (['h2', 'h3', 'blockquote', 'p'].includes(cleanVal)) {
            blockFormatSelect.value = cleanVal;
          }
        }
      } catch(e) {}
    }
  };

  // Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)
  editor?.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        executeCommand('bold');
      } else if (key === 'i') {
        e.preventDefault();
        executeCommand('italic');
      } else if (key === 'u') {
        e.preventDefault();
        executeCommand('underline');
      }
    }
  });

  ['keyup', 'mouseup', 'touchend', 'input', 'focus', 'blur'].forEach(evt => {
    editor?.addEventListener(evt, () => {
      saveSelection();
      updateToolbarActiveStates();
    });
  });

  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editor && (editor.contains(range.commonAncestorContainer) || editor === range.commonAncestorContainer)) {
        savedRange = range.cloneRange();
        updateToolbarActiveStates();
      }
    }
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
      <div class="media-stage-card ${img.isCover ? 'is-cover' : ''} ${img.loading ? 'is-loading' : ''}" data-idx="${idx}">
        ${img.loading ? `
          <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.06); color: var(--color-text-secondary); font-size: 0.8rem; gap: 8px; padding: 10px; text-align: center; border-radius: 6px;">
            <div style="width: 22px; height: 22px; border: 2px solid var(--color-accent); border-top-color: transparent; border-radius: 50%; animation: dsg-spin 0.8s linear infinite;"></div>
            <span style="font-weight: 600;">Wird hochgeladen...</span>
          </div>
        ` : `
          <img src="${img.url}" alt="Vorschau">
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
    
    // Add placeholder cards with loading spinners
    const uploadTasks = files.map((file, i) => {
      const id = 'img_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substring(2, 5);
      const isFirst = stagedImages.length === 0 && i === 0;
      stagedImages.push({
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
      
      const item = stagedImages.find(img => img.id === id);
      if (item && finalUrl) {
        item.url = finalUrl;
        item.loading = false;
      } else if (item && !finalUrl) {
        const idx = stagedImages.indexOf(item);
        if (idx !== -1) stagedImages.splice(idx, 1);
      }
    }));

    if (stagedImages.length > 0 && !stagedImages.some(img => img.isCover)) {
      stagedImages[0].isCover = true;
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
  document.getElementById('btn-add-image-url')?.addEventListener('click', () => {
    const url = prompt('Bild-URL eingeben (z.B. https://example.com/foto.jpg):');
    if (url && url.trim() !== '') {
      const isFirst = stagedImages.length === 0;
      stagedImages.push({
        id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        url: url.trim(),
        isCover: isFirst,
        loading: false
      });
      renderMediaStage();
    }
  });

  // --- 3. Form Submit (Add / Update) ---
  let isSubmitting = false;

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Check if any images are still loading
    if (stagedImages.some(img => img.loading)) {
      showToast('Bilder werden noch hochgeladen. Bitte kurz warten...', true);
      return;
    }

    const id = document.getElementById('news-id').value;
    const title = document.getElementById('news-title').value.trim();
    const author = document.getElementById('news-author').value.trim() || 'DSG Redaktion';
    const date = document.getElementById('news-date').value || new Date().toISOString().split('T')[0];
    const htmlContent = editor.innerHTML.trim();

    if (!title) {
      showToast('Bitte gib einen Artikeltitel ein!', true);
      document.getElementById('news-title').focus();
      return;
    }

    // Check if plain text content is empty
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = (tempDiv.textContent || tempDiv.innerText || '').trim();

    if (!plainText) {
      showToast('Bitte gib einen Artikelinhalt ein!', true);
      editor.focus();
      return;
    }

    isSubmitting = true;
    if (submitBtn) submitBtn.disabled = true;

    try {
      // Determine cover and gallery
      let coverImage = 'dsg.avif';
      let galleryArray = [];

      if (stagedImages.length > 0) {
        const coverItem = stagedImages.find(img => img.isCover) || stagedImages[0];
        coverImage = coverItem.url;
        galleryArray = stagedImages.filter(img => img !== coverItem).map(img => ({ url: img.url }));
      }

      // Excerpt for cards: strip HTML
      const excerpt = plainText.substring(0, 160).trim() + (plainText.length > 160 ? '...' : '');

      // Reading time calculation
      const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
      const readMinutes = Math.max(1, Math.ceil(words / 180));
      const readTime = `${readMinutes} min read`;

      if (id) {
        // Update existing article
        Store.updateNews(id, title, excerpt, htmlContent, coverImage, galleryArray, author, date, readTime);
        showToast('Artikel erfolgreich aktualisiert!');
      } else {
        // Create new article
        Store.addNews(title, excerpt, htmlContent, coverImage, galleryArray, author, date, readTime);
        showToast('Artikel erfolgreich veröffentlicht!');
      }

      resetNewsForm();
      renderNewsList();
    } catch(err) {
      console.error("Error saving article:", err);
      showToast('Fehler beim Speichern des Artikels.', true);
    } finally {
      isSubmitting = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  };

  const resetNewsForm = () => {
    form.reset();
    document.getElementById('news-id').value = '';
    editor.innerHTML = '';
    stagedImages = [];
    editingArticleId = null;
    savedRange = null;
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (document.getElementById('news-author')) document.getElementById('news-author').value = 'DSG Redaktion';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (submitText) submitText.textContent = 'News veröffentlichen';
    if (formTitle) formTitle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Neuer Artikel';
    renderMediaStage();
    updateToolbarActiveStates();
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
        <div class="admin-item-card glass-card">
          <div class="admin-item-main">
            ${a.image ? `
              <img src="${a.image}" alt="Cover" class="admin-item-thumb">
            ` : ''}
            <div class="admin-item-info">
              <strong class="admin-item-title">${a.title}</strong>
              <div class="admin-item-meta">
                <span class="admin-item-meta-entry">${renderIcon('calendar', { size: 13, color: 'var(--color-text-secondary)' })} ${a.date || 'Kein Datum'}</span>
                ${a.author ? `<span class="admin-item-meta-entry">&bull; ${renderIcon('edit', { size: 13, color: 'var(--color-text-secondary)' })} ${a.author}</span>` : ''}
                ${hasGallery ? `<span class="admin-item-meta-entry" style="color: var(--color-accent); font-weight: 700;">&bull; ${renderIcon('camera', { size: 13, color: 'var(--color-accent)' })} +${a.gallery.length} Fotos</span>` : ''}
              </div>
              <div class="admin-item-preview">
                ${previewText}...
              </div>
            </div>
          </div>
          <div class="admin-item-actions">
            <a href="#/article/${a.id}" target="_blank" class="btn btn-outline admin-item-btn" title="Artikel ansehen">${renderIcon('eye', { size: 14 })} Ansehen</a>
            <button class="btn btn-outline edit-news-btn admin-item-btn" data-id="${a.id}">${renderIcon('edit', { size: 14 })} Bearbeiten</button>
            <button class="btn delete-news-btn admin-item-btn btn-danger" data-id="${a.id}">${renderIcon('trash', { size: 14 })} Löschen</button>
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
        if (dateInput) {
          let dVal = article.date || '';
          if (dVal.includes('.')) {
            const p = dVal.split('.');
            if (p.length === 3) dVal = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
          }
          dateInput.value = dVal;
        }

        // Load rich text
        editor.innerHTML = article.content || `<p>${article.excerpt || ''}</p>`;

        // Load staged images
        stagedImages = [];
        if (article.image) {
          stagedImages.push({
            id: 'cover_' + article.id,
            url: article.image,
            isCover: true,
            loading: false
          });
        }
        if (article.gallery && Array.isArray(article.gallery)) {
          article.gallery.forEach((g, i) => {
            const imgUrl = typeof g === 'string' ? g : g.url;
            if (imgUrl && imgUrl !== article.image) {
              stagedImages.push({
                id: 'gal_' + i + '_' + Date.now(),
                url: imgUrl,
                isCover: false,
                loading: false
              });
            }
          });
        }
        renderMediaStage();

        // UI state changes
        if (submitText) submitText.textContent = 'News aktualisieren';
        if (formTitle) formTitle.innerHTML = `${renderIcon('edit', { size: 20, color: 'var(--color-accent)' })} Artikel bearbeiten: <i>${article.title}</i>`;
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
          showToast('Artikel gelöscht.');
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
