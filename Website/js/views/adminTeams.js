import { Store, sanitizeMojibake, deepSanitize } from '../store.js?v=1791172000000';
import { showToast } from './admin.js?v=1791172000000';
import { renderTeamLogo, getTeamLogoUrl, getDefaultBadge } from '../logos.js?v=1791172000000';

let teamsData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 15;
let currentSort = { column: 'Status', asc: true };

const compressLogoImage = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        if (file.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Fehler beim Lesen der SVG-Datei'));
            reader.readAsDataURL(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round(height * (MAX_SIZE / width));
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round(width * (MAX_SIZE / height));
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Retain PNG alpha transparency
                    const result = canvas.toDataURL('image/png');
                    resolve(result);
                } catch (err) {
                    resolve(dataUrl);
                }
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        };
        reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
        reader.readAsDataURL(file);
    });
};

export const renderAdminTeams = () => {
    return `
    <div class="datagrid-container stagger-item">
        <div>
            <h2 style="margin: 0;">Teams verwalten</h2>
            <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Übersicht aller aktiven und inaktiven Mannschaften</p>
        </div>

        <!-- Controls Toolbar immediately above table -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-top: var(--space-xs); margin-bottom: var(--space-xs);">
            <button class="btn-dsg" id="btn-add-team" style="background: var(--color-accent); color: #fff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Team anlegen
            </button>
            <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; align-items: center;">
                <input type="text" id="team-search" class="admin-input" placeholder="Team suchen..." style="width: 180px;">
                <select id="team-status-filter" class="admin-input" style="width: 130px;">
                    <option value="all">Alle Status</option>
                    <option value="Aktiv">Aktiv</option>
                    <option value="Inaktiv">Inaktiv</option>
                </select>
                <select id="team-sort-select" class="admin-input" style="width: 170px;">
                    <option value="status">Status (Aktiv zuerst)</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="id-asc"># ID (aufsteigend)</option>
                    <option value="id-desc"># ID (absteigend)</option>
                    <option value="players-desc">Aktive Spieler (meiste)</option>
                </select>
            </div>
        </div>
        
        <!-- Desktop Table View -->
        <div class="table-responsive glass-card admin-desktop-table" style="padding: 0;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th data-sort="ID" class="sortable">ID ↕</th>
                        <th data-sort="Name" class="sortable">Name ↕</th>
                        <th data-sort="Aktive Spieler" class="sortable">Aktive Spieler ↕</th>
                        <th data-sort="Aktiv seit" class="sortable">Aktiv seit ↕</th>
                        <th data-sort="Inaktiv seit" class="sortable">Inaktiv seit ↕</th>
                        <th data-sort="Status" class="sortable">Status ↕</th>
                        <th style="width: 100px; text-align: center;">Aktion</th>
                    </tr>
                </thead>
                <tbody id="teams-table-body">
                    <tr><td colspan="7" style="text-align: center; padding: 2rem;">Lade Teams...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile Card Accordion View -->
        <div id="teams-mobile-cards" class="admin-mobile-cards">
            <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Lade Teams...</div>
        </div>

        <div class="datagrid-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md);">
            <span id="teams-page-info" style="color: var(--color-text-secondary); font-size: 0.9rem;">Zeige 0 bis 0 von 0</span>
            <div style="display: flex; gap: var(--space-xs);">
                <button id="btn-prev-page-t" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">&laquo; Zurück</button>
                <button id="btn-next-page-t" class="btn-dsg" style="padding: 6px 14px; font-size: 0.85rem;">Vor &raquo;</button>
            </div>
        </div>

        <!-- Edit / Create Team Modal -->
        <div id="team-modal" style="display:none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; height: 100dvh; box-sizing: border-box; background: rgba(0,0,0,0.65); z-index: 99999; justify-content: center; align-items: center; padding: 16px; margin: 0;">
            <div class="glass-card modal-content" style="width: 100%; max-width: 600px; max-height: 90vh; max-height: 90dvh; overflow-y: auto; background: var(--color-surface) !important; border: 1px solid var(--color-border); border-radius: var(--border-radius-md); padding: var(--space-lg); box-shadow: 0 16px 40px rgba(0,0,0,0.3); margin: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-sm);">
                    <h3 id="modal-team-title" style="margin: 0; font-size: 1.3rem; color: var(--color-text-primary);">Mannschaft bearbeiten</h3>
                    <button type="button" id="btn-close-team-modal" class="btn-outline" style="padding: 4px 12px; font-size: 0.85rem; border-radius: 4px; background: var(--color-surface); color: var(--color-text-primary); border: var(--glass-border); cursor: pointer;">Zurück</button>
                </div>
                <form id="team-edit-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                    <input type="hidden" id="edit-team-id">
                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Mannschaftsname</label>
                        <input type="text" id="edit-team-name" class="admin-input" style="width: 100%;" required>
                    </div>

                    <!-- Logo Upload & Preview Section -->
                    <div style="border: 1px solid var(--color-border); border-radius: 8px; padding: 14px; background: rgba(0,0,0,0.02);">
                        <label style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-primary); display: block; margin-bottom: 8px;">Vereinswappen / Logo</label>
                        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                            <div id="team-logo-preview-box" style="width: 64px; height: 64px; min-width: 64px; border: 1px dashed var(--color-border); border-radius: 10px; background: var(--color-surface); display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); position: relative;">
                                <img id="team-logo-preview-img" src="Logos/Ready/standard/default/shield_01_classic_heater.png" alt="Logo Vorschau" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                            </div>
                            <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 6px;">
                                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                                    <button type="button" id="btn-upload-team-logo" class="btn-outline" style="padding: 6px 14px; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer; border-radius: 6px; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-primary);">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        Logo hochladen
                                    </button>
                                    <button type="button" id="btn-remove-team-logo" class="btn-outline" style="display: none; padding: 6px 12px; font-size: 0.82rem; color: #dc3545; border-color: rgba(220,53,69,0.3); border-radius: 6px; background: transparent; cursor: pointer;">
                                        Entfernen
                                    </button>
                                </div>
                                <span style="font-size: 0.72rem; color: var(--color-text-secondary); line-height: 1.3;">
                                    PNG, SVG, WebP oder JPG (Quadratisch empfohlen, transparenter Hintergrund)
                                </span>
                            </div>
                        </div>
                        <input type="file" id="edit-team-logo-file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display: none;">
                        <input type="hidden" id="edit-team-logo-val" value="">
                    </div>

                    <div>
                        <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Status</label>
                        <select id="edit-team-status" class="admin-input" style="width: 100%;">
                            <option value="Aktiv">Aktiv</option>
                            <option value="Inaktiv">Inaktiv</option>
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
                        <div>
                            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Aktiv seit:</label>
                            <input type="date" id="edit-team-aktiv-seit" class="admin-input" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.8rem; color: var(--color-text-secondary); display: block; margin-bottom: 4px;">Inaktiv seit:</label>
                            <input type="date" id="edit-team-inaktiv-seit" class="admin-input" style="width: 100%;">
                        </div>
                    </div>
                    <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-md);">
                        <button type="button" id="btn-delete-team" style="display: none; padding: 10px 16px; background: #dc3545; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">Löschen</button>
                        <button type="submit" id="btn-submit-team" class="primary-btn" style="flex: 1; padding: 10px; font-weight: 700; background: var(--color-accent); color: #fff; border: none; border-radius: 4px; cursor: pointer; text-transform: uppercase;">Aktualisieren</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
};

const ensureModalInBody = () => {
    const allMatching = Array.from(document.querySelectorAll('#team-modal'));
    if (allMatching.length > 1) {
        const bodyModal = allMatching.find(el => el.parentElement === document.body);
        if (bodyModal) {
            allMatching.filter(el => el !== bodyModal).forEach(el => el.remove());
            return bodyModal;
        }
    }
    const modal = document.getElementById('team-modal');
    if (modal && modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }
    return modal;
};

export const initAdminTeams = async () => {
    const tbody = document.getElementById('teams-table-body');
    if (!tbody) return;

    ensureModalInBody();

    if (teamsData.length === 0) {
        const teams = await Store.getAdminTeams();
        teamsData = teams.map(t => ({
            ...t,
            Status: (t.Status === 'Nein' || !t.Status || t.Status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv',
            logoUrl: t.logoUrl || t.logo || t.Logo || ''
        }));
    }
    
    filteredData = [...teamsData];
    sortData('Status', true);
    bindEvents();
    renderTable();
};

const renderTable = () => {
    const tbody = document.getElementById('teams-table-body');
    const info = document.getElementById('teams-page-info');
    if (!tbody) return;

    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
    const pageRows = filteredData.slice(startIdx, endIdx);

    if (info) {
        info.innerText = `Zeige ${totalRows > 0 ? startIdx + 1 : 0} bis ${endIdx} von ${totalRows} Teams`;
    }

    const prevBtn = document.getElementById('btn-prev-page-t');
    const nextBtn = document.getElementById('btn-next-page-t');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (pageRows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Keine Teams gefunden.</td></tr>';
        return;
    }

    tbody.innerHTML = pageRows.map(t => {
        const status = (t.Status === 'Nein' || t.Status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
        let badgeClass = status === 'Aktiv' ? 'badge-success' : 'badge-secondary';

        const rawIndex = teamsData.indexOf(t);

        return `
            <tr>
                <td style="color: var(--color-text-secondary);">#${t.ID || '-'}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${renderTeamLogo(t, 'sm')}
                        <strong style="color: var(--color-text-primary);">${t.Name || '-'}</strong>
                    </div>
                </td>
                <td>${t["Aktive Spieler"] || '0'}</td>
                <td>${t["Aktiv seit"] || '-'}</td>
                <td>${t["Inaktiv seit"] || '-'}</td>
                <td><span class="badge ${badgeClass}">${status}</span></td>
                <td style="text-align: center;">
                    <button class="btn btn-outline edit-single-team-btn" data-idx="${rawIndex}" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        Bearbeiten
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Render Mobile Accordion Cards
    const mobileCardsContainer = document.getElementById('teams-mobile-cards');
    if (mobileCardsContainer) {
        if (pageRows.length === 0) {
            mobileCardsContainer.innerHTML = '<div class="glass-card" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">Keine Teams gefunden.</div>';
        } else {
            mobileCardsContainer.innerHTML = pageRows.map(t => {
                const status = (t.Status === 'Nein' || t.Status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
                let badgeClass = status === 'Aktiv' ? 'badge-success' : 'badge-secondary';
                const rawIndex = teamsData.indexOf(t);

                return `
                    <div class="admin-m-card" data-idx="${rawIndex}">
                        <div class="admin-m-header">
                            <div style="flex: 1; min-width: 0;">
                                <div class="admin-m-title" style="display: flex; align-items: center; gap: 8px;">
                                    <span style="color: var(--color-accent); font-weight: 800; margin-right: 2px;">#${t.ID || '-'}</span>
                                    ${renderTeamLogo(t, 'sm')}
                                    <strong style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.Name || '-'}</strong>
                                </div>
                                <div class="admin-m-subtitle">
                                    <span class="badge ${badgeClass}" style="font-size: 0.72rem;">${status}</span>
                                    <span>•</span>
                                    <span>${t["Aktive Spieler"] || '0'} Spieler</span>
                                </div>
                            </div>
                            <svg class="admin-m-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <div class="admin-m-body">
                            <div class="admin-m-grid">
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Aktiv seit</span>
                                    <span class="admin-m-value">${t["Aktiv seit"] || '-'}</span>
                                </div>
                                <div class="admin-m-grid-item">
                                    <span class="admin-m-label">Inaktiv seit</span>
                                    <span class="admin-m-value">${t["Inaktiv seit"] || '-'}</span>
                                </div>
                                <div class="admin-m-grid-item" style="grid-column: 1 / -1;">
                                    <span class="admin-m-label">Kadergröße</span>
                                    <span class="admin-m-value">${t["Aktive Spieler"] || '0'} aktive registrierte Spieler</span>
                                </div>
                            </div>
                            <div class="admin-m-actions">
                                <button class="edit-single-team-btn full-width" data-idx="${rawIndex}" style="background: var(--color-accent); color: #fff; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    Mannschaft bearbeiten
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Accordion toggle on header click
            mobileCardsContainer.querySelectorAll('.admin-m-header').forEach(hdr => {
                hdr.onclick = () => {
                    const card = hdr.closest('.admin-m-card');
                    if (card) card.classList.toggle('expanded');
                };
            });
        }
    }

    // Bind edit buttons across both Desktop and Mobile views
    const container = document.getElementById('admin-teams');
    if (container) {
        container.querySelectorAll('.edit-single-team-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                openEditModal(idx);
            };
        });
    }
};

const formatDateForInput = (dateStr) => {
    if (!dateStr || dateStr === '-' || dateStr.startsWith('0000')) return '';
    if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return `${parts[2].padStart(4, '20')}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return dateStr;
};

const updateModalLogoPreview = () => {
    const previewImg = document.getElementById('team-logo-preview-img');
    const removeBtn = document.getElementById('btn-remove-team-logo');
    const logoVal = document.getElementById('edit-team-logo-val')?.value || '';
    const nameVal = document.getElementById('edit-team-name')?.value || '';

    if (!previewImg) return;

    if (logoVal) {
        previewImg.src = logoVal;
        if (removeBtn) removeBtn.style.display = 'inline-flex';
    } else {
        const standardUrl = getTeamLogoUrl(nameVal);
        previewImg.src = standardUrl;
        if (removeBtn) removeBtn.style.display = 'none';
    }
};

const openEditModal = (idx = null) => {
    const modal = ensureModalInBody();
    const title = document.getElementById('modal-team-title');
    const deleteBtn = document.getElementById('btn-delete-team');
    const submitBtn = document.getElementById('btn-submit-team');
    const logoValInput = document.getElementById('edit-team-logo-val');
    const fileInput = document.getElementById('edit-team-logo-file');
    
    if (fileInput) fileInput.value = '';

    if (idx !== null && teamsData[idx]) {
        const t = teamsData[idx];
        title.innerText = 'Mannschaft bearbeiten';
        if (submitBtn) submitBtn.innerText = 'Aktualisieren';
        document.getElementById('edit-team-id').value = idx;
        document.getElementById('edit-team-name').value = t.Name || '';
        document.getElementById('edit-team-aktiv-seit').value = formatDateForInput(t["Aktiv seit"]);
        document.getElementById('edit-team-inaktiv-seit').value = formatDateForInput(t["Inaktiv seit"]);
        document.getElementById('edit-team-status').value = t.Status === 'Aktiv' ? 'Aktiv' : 'Inaktiv';
        if (logoValInput) logoValInput.value = t.logoUrl || t.logo || t.Logo || '';
        deleteBtn.style.display = 'block';
    } else {
        title.innerText = 'Neue Mannschaft anlegen';
        if (submitBtn) submitBtn.innerText = 'Erstellen';
        document.getElementById('edit-team-id').value = 'new';
        document.getElementById('team-edit-form').reset();
        document.getElementById('edit-team-status').value = 'Aktiv';
        if (logoValInput) logoValInput.value = '';
        deleteBtn.style.display = 'none';
    }

    updateModalLogoPreview();

    modal.style.display = 'flex';
    const content = modal.querySelector('.modal-content') || modal.firstElementChild;
    if (content) content.scrollTop = 0;
};

const closeEditModal = () => {
    document.querySelectorAll('#team-modal').forEach(m => {
        m.style.display = 'none';
    });
};

const applyFilters = () => {
    const searchInput = document.getElementById('team-search');
    const statusSelect = document.getElementById('team-status-filter');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusSelect ? statusSelect.value : 'all';

    filteredData = teamsData.filter(t => {
        const matchesSearch = (t.Name && t.Name.toLowerCase().includes(query)) ||
                              (t.ID && t.ID.toLowerCase().includes(query));
        
        const currentStatus = (t.Status === 'Nein' || t.Status === 'Inaktiv') ? 'Inaktiv' : 'Aktiv';
        const matchesStatus = status === 'all' || currentStatus === status;
        
        return matchesSearch && matchesStatus;
    });

    currentPage = 1;
    sortData(currentSort.column, currentSort.asc);
};

const sortData = (column, asc) => {
    currentSort = { column, asc };
    filteredData.sort((a, b) => {
        if (column === 'Status') {
            const priority = { 'Aktiv': 1, 'Inaktiv': 2 };
            const pA = priority[a.Status] || 99;
            const pB = priority[b.Status] || 99;
            if (pA !== pB) return asc ? pA - pB : pB - pA;
            return (a.Name || '').localeCompare(b.Name || '');
        }

        const valA = (a[column] || '').toString().toLowerCase();
        const valB = (b[column] || '').toString().toLowerCase();
        
        if (column === 'ID' || column === 'Aktive Spieler') {
            const numA = parseInt(valA) || 0;
            const numB = parseInt(valB) || 0;
            return asc ? numA - numB : numB - numA;
        }

        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
    });
    renderTable();
};

const bindEvents = () => {
    const search = document.getElementById('team-search');
    const status = document.getElementById('team-status-filter');
    const sortSelect = document.getElementById('team-sort-select');
    const prevBtn = document.getElementById('btn-prev-page-t');
    const nextBtn = document.getElementById('btn-next-page-t');
    const addBtn = document.getElementById('btn-add-team');
    const closeBtn = document.getElementById('btn-close-team-modal');
    const deleteBtn = document.getElementById('btn-delete-team');
    const form = document.getElementById('team-edit-form');
    const teamModal = document.getElementById('team-modal');
    const nameInput = document.getElementById('edit-team-name');
    const uploadBtn = document.getElementById('btn-upload-team-logo');
    const removeLogoBtn = document.getElementById('btn-remove-team-logo');
    const logoFileInput = document.getElementById('edit-team-logo-file');
    const logoValInput = document.getElementById('edit-team-logo-val');

    if (search) search.oninput = applyFilters;
    if (status) status.onchange = applyFilters;

    if (nameInput) {
        nameInput.oninput = () => {
            if (!logoValInput || !logoValInput.value) {
                updateModalLogoPreview();
            }
        };
    }

    if (uploadBtn && logoFileInput) {
        uploadBtn.onclick = () => {
            logoFileInput.click();
        };
    }

    if (removeLogoBtn && logoValInput) {
        removeLogoBtn.onclick = () => {
            logoValInput.value = '';
            if (logoFileInput) logoFileInput.value = '';
            updateModalLogoPreview();
            showToast('Benutzerdefiniertes Logo entfernt.');
        };
    }

    if (logoFileInput) {
        logoFileInput.onchange = async () => {
            const file = logoFileInput.files && logoFileInput.files[0];
            if (file) {
                try {
                    const dataUrl = await compressLogoImage(file);
                    if (dataUrl) {
                        if (logoValInput) logoValInput.value = dataUrl;
                        updateModalLogoPreview();
                        showToast('Logo erfolgreich geladen.');
                    }
                } catch (err) {
                    showToast('Fehler beim Laden des Bildes: ' + (err.message || err), true);
                }
            }
        };
    }

    if (sortSelect) {
        sortSelect.onchange = () => {
            const val = sortSelect.value;
            if (val === 'status') sortData('Status', true);
            else if (val === 'name') sortData('Name', true);
            else if (val === 'id-asc') sortData('ID', true);
            else if (val === 'id-desc') sortData('ID', false);
            else if (val === 'players-desc') sortData('Aktive Spieler', false);
        };
    }

    if (teamModal) {
        teamModal.onclick = (e) => {
            if (e.target === teamModal) closeEditModal();
        };
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            if (currentPage > 1) { currentPage--; renderTable(); }
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentPage++; renderTable();
        };
    }

    if (addBtn) addBtn.onclick = () => openEditModal(null);
    if (closeBtn) closeBtn.onclick = closeEditModal;

    if (deleteBtn) {
        deleteBtn.onclick = () => {
            const idVal = document.getElementById('edit-team-id').value;
            if (idVal !== 'new') {
                const idx = parseInt(idVal);
                const t = teamsData[idx];
                if (confirm(`Möchten Sie das Team "${t.Name}" wirklich löschen?`)) {
                    teamsData.splice(idx, 1);
                    Store.saveAdminTeams(teamsData);
                    closeEditModal();
                    applyFilters();
                    showToast('Mannschaft gelöscht.');
                }
            }
        };
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const idVal = document.getElementById('edit-team-id').value;
            const nameInput = document.getElementById('edit-team-name');
            const nameVal = nameInput ? nameInput.value.trim() : '';

            if (!nameVal) {
                showToast('Bitte geben Sie einen Mannschaftsnamen ein!', true);
                if (nameInput) nameInput.focus();
                return;
            }

            const updatedTeam = {
                Name: nameVal,
                "Aktiv seit": document.getElementById('edit-team-aktiv-seit').value,
                "Inaktiv seit": document.getElementById('edit-team-inaktiv-seit').value,
                Status: document.getElementById('edit-team-status').value,
                logoUrl: (document.getElementById('edit-team-logo-val')?.value || '').trim()
            };

            const isNew = (idVal === 'new');
            if (isNew) {
                const validIds = teamsData
                    .map(t => parseInt(t.ID || t.id) || 0)
                    .filter(n => n > 0 && n < 100000);
                const maxId = validIds.length > 0 ? Math.max(...validIds) : 54;
                teamsData.unshift({
                    ID: String(maxId + 1),
                    "Aktive Spieler": "0",
                    ...updatedTeam
                });
            } else {
                const idx = parseInt(idVal);
                teamsData[idx] = { ...teamsData[idx], ...updatedTeam };
            }

            Store.saveAdminTeams(teamsData);
            closeEditModal();
            applyFilters();
            showToast(isNew ? 'Mannschaft erfolgreich erstellt!' : 'Mannschaft erfolgreich aktualisiert!');
        };
    }

    document.querySelectorAll('#admin-teams .sortable').forEach(th => {
        th.onclick = (e) => {
            const col = e.target.getAttribute('data-sort');
            if (currentSort.column === col) {
                sortData(col, !currentSort.asc);
            } else {
                sortData(col, true);
            }
        };
    });
};
