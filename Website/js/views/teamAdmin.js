import { Store } from '../store.js?v=1793040000000';

import { logout } from '../auth.js';

import { Router } from '../router.js';

import { getPlayerAvatar } from '../playerUtils.js?v=1791182000000';

import { storage } from '../firebase.js';

import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";



let currentTeamTab = 'kader'; // 'kader' | 'nachmelden' | 'antraege'

let searchQuery = '';

let statusFilter = 'all'; // 'all' | 'Aktiv' | 'Inaktiv'

let activeUploadPlayer = null;



const compressImage = (file) => {

  return new Promise((resolve) => {

    const reader = new FileReader();

    reader.onload = (e) => {

      const img = new Image();

      img.onload = () => {

        const canvas = document.createElement('canvas');

        let width = img.width;

        let height = img.height;

        const maxDim = 800;

        if (width > maxDim || height > maxDim) {

          if (width > height) {

            height = Math.round((height * maxDim) / width);

            width = maxDim;

          } else {

            width = Math.round((width * maxDim) / height);

            height = maxDim;

          }

        }

        canvas.width = width;

        canvas.height = height;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));

      };

      img.onerror = () => resolve(null);

      img.src = e.target.result;

    };

    reader.onerror = () => resolve(null);

    reader.readAsDataURL(file);

  });

};



const uploadPhotoToStorage = async (file) => {

  if (!file) return null;

  try {

    const cleanName = (file.name || 'pass')

      .replace(/[^a-zA-Z0-9.-]/g, '_')

      .toLowerCase();

    const storagePath = `passes/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}`;

    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);

    return await getDownloadURL(snapshot.ref);

  } catch (err) {

    console.warn("Storage upload failed, falling back to compression:", err);

    return null;

  }

};



export const viewTeamAdmin = (auth) => {

  const teamName = auth.teamName || 'Mein Team';

  return `

    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: var(--space-md) var(--space-md);">

      

      <!-- Team Header Banner -->

      <div class="glass-card stagger-item" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); padding: var(--space-lg); margin-bottom: var(--space-lg); border-left: 4px solid var(--color-accent);">

        <div>

          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase; letter-spacing: 0.5px;">Vereinsverwaltung</div>

          <h1 style="margin: 4px 0 6px 0; font-size: 1.8rem;">${teamName}</h1>

          <p style="color: var(--color-text-secondary); font-size: 0.9rem; margin: 0;">Verwalte den Spielerkader, Passfotos und Neuanmeldungen deines Vereins</p>

        </div>

        <div style="display: flex; gap: var(--space-sm); align-items: center;">

          <button id="team-logout-btn" class="btn btn-outline" style="color: #dc2626 !important; border-color: rgba(220, 38, 38, 0.35) !important; font-weight: 700; padding: 8px 16px;">

            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>

            Abmelden

          </button>

        </div>

      </div>



      <!-- Navigation Tabs -->

      <div style="display: flex; gap: var(--space-xs); border-bottom: 1px solid var(--glass-border); margin-bottom: var(--space-lg); overflow-x: auto;">

        <button class="team-tab-btn ${currentTeamTab === 'kader' ? 'active' : ''}" data-tab="kader" style="padding: 10px 18px; background: none; border: none; border-bottom: 2px solid ${currentTeamTab === 'kader' ? 'var(--color-accent)' : 'transparent'}; color: ${currentTeamTab === 'kader' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; font-weight: 700; cursor: pointer;">

          Mein Kader

        </button>

        <button class="team-tab-btn ${currentTeamTab === 'nachmelden' ? 'active' : ''}" data-tab="nachmelden" style="padding: 10px 18px; background: none; border: none; border-bottom: 2px solid ${currentTeamTab === 'nachmelden' ? 'var(--color-accent)' : 'transparent'}; color: ${currentTeamTab === 'nachmelden' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; font-weight: 700; cursor: pointer;">

          + Spieler anmelden

        </button>

        <button class="team-tab-btn ${currentTeamTab === 'antraege' ? 'active' : ''}" data-tab="antraege" style="padding: 10px 18px; background: none; border: none; border-bottom: 2px solid ${currentTeamTab === 'antraege' ? 'var(--color-accent)' : 'transparent'}; color: ${currentTeamTab === 'antraege' ? 'var(--color-accent)' : 'var(--color-text-secondary)'}; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center;">

          Meine Anträge <span id="team-requests-badge" style="display: none; background: var(--color-accent); color: #fff; font-size: 0.72rem; padding: 2px 7px; border-radius: 10px; margin-left: 6px; font-weight: 700;"></span>

        </button>

      </div>



      <!-- Tab Content Area -->

      <div id="team-tab-content">

        <!-- Injected dynamically -->

      </div>



    </div>



    <!-- Upload Photo Modal -->

    <div id="photo-upload-modal" class="modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(4px);">

      <div class="glass-card modal-content" style="max-width: 480px; width: 90%; padding: var(--space-lg); border-radius: 10px; position: relative;">

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">

          <h3 id="modal-player-name" style="margin: 0; font-size: 1.25rem;">Passfoto hochladen</h3>

          <button type="button" id="modal-close-x-btn" aria-label="Schließen" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--color-text-secondary); line-height: 1; padding: 4px;">✕</button>

        </div>

        <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: var(--space-md);">Fotografiere den bestehenden Spielerpass oder lade ein klares Porträtfoto hoch.</p>

        

        <div style="text-align: center; margin-bottom: var(--space-md);">

          <div id="modal-avatar-preview-box" style="width: 110px; height: 110px; border-radius: 50%; overflow: hidden; margin: 0 auto 12px auto; border: 3px solid var(--color-accent); background: #111;">

            <img id="modal-avatar-preview-img" src="Spieler/1.jpg" style="width: 100%; height: 100%; object-fit: contain; object-position: bottom center;">

          </div>

          <input type="file" id="modal-file-input" accept="image/*" capture="environment" style="display: none;">

          <button type="button" id="modal-select-file-btn" class="btn btn-dsg" style="padding: 9px 18px; font-weight: 600;">

            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>

            Foto aufnehmen / auswählen

          </button>

          <div id="modal-upload-status" style="font-size: 0.8rem; margin-top: 8px; color: var(--color-text-secondary);"></div>

        </div>



        <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--glass-border); padding-top: var(--space-md);">

          <button type="button" id="modal-cancel-btn" class="btn btn-outline" style="padding: 8px 16px;">Abbrechen</button>

          <button type="button" id="modal-save-btn" class="btn btn-dsg" style="background: #22c55e; color: #fff; font-weight: 700; padding: 8px 20px;">Speichern</button>

        </div>

      </div>

    </div>

  `;

};



export const bindTeamAdmin = async (auth) => {

  const teamName = auth.teamName || 'Mein Team';

  let stagedPhotoUrl = null;



  document.getElementById('team-logout-btn')?.addEventListener('click', () => {

    logout();

    window.location.hash = '#/admin';

    window.location.reload();

  });



  const updateBadge = () => {

    const badge = document.getElementById('team-requests-badge');

    if (!badge) return;

    const allRequests = Store.getPlayerRequests();

    const teamRequests = allRequests.filter(r => (r.teamName || '').toLowerCase() === teamName.toLowerCase() && r.status === 'pending');

    if (teamRequests.length > 0) {

      badge.textContent = String(teamRequests.length);

      badge.style.display = 'inline-block';

    } else {

      badge.style.display = 'none';

    }

  };



  const tabButtons = document.querySelectorAll('.team-tab-btn');

  tabButtons.forEach(btn => {

    btn.addEventListener('click', () => {

      currentTeamTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {

        const isActive = b.getAttribute('data-tab') === currentTeamTab;

        b.style.borderBottomColor = isActive ? 'var(--color-accent)' : 'transparent';

        b.style.color = isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)';

      });

      renderTab();

    });

  });



  const renderTab = async () => {

    const container = document.getElementById('team-tab-content');

    if (!container) return;

    updateBadge();



    if (currentTeamTab === 'kader') {

      const allPlayers = await Store.getAdminPlayers();

      // Match players belonging to this team (flexible match)

      const teamPlayers = allPlayers.filter(p => {

        const t = (p.Team || '').trim().toLowerCase();

        const myT = teamName.trim().toLowerCase();

        return t === myT || t.includes(myT) || myT.includes(t);

      });



      const filtered = teamPlayers.filter(p => {

        // Status filter

        const pStatus = p.Status || p.status || 'Aktiv';

        if (statusFilter !== 'all' && pStatus.toLowerCase() !== statusFilter.toLowerCase()) {

          return false;

        }

        // Search query

        if (!searchQuery) return true;

        const q = searchQuery.toLowerCase();

        const name = `${p.Vorname || ''} ${p.Nachname || ''}`.toLowerCase();

        return name.includes(q);

      });



      const activeCount = teamPlayers.filter(p => (p.Status || p.status || 'Aktiv').toLowerCase() === 'aktiv').length;

      const inactiveCount = teamPlayers.length - activeCount;



      container.innerHTML = `

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md);">

          <div>

            <h3 style="margin: 0; font-size: 1.25rem;">Spielerkader (${filtered.length} von ${teamPlayers.length} Spielern)</h3>

            <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 2px;">

              ${activeCount} Aktiv &bull; ${inactiveCount} Inaktiv / Archiviert

            </p>

          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">

            <input type="text" id="kader-search" class="admin-input" placeholder="Spieler suchen..." value="${searchQuery}" style="width: 170px;">

            <select id="kader-status-filter" class="admin-input" style="width: 140px; font-size: 0.85rem;">

              <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Alle Spieler</option>

              <option value="Aktiv" ${statusFilter === 'Aktiv' ? 'selected' : ''}>Nur Aktive</option>

              <option value="Inaktiv" ${statusFilter === 'Inaktiv' ? 'selected' : ''}>Nur Inaktive</option>

            </select>

          </div>

        </div>



        ${filtered.length === 0 ? `

          <div class="glass-card" style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary); border-radius: 8px;">

            <h4>Keine passenden Spieler gefunden</h4>

            <p style="font-size: 0.85rem;">Passe den Filter oder den Suchbegriff an.</p>

          </div>

        ` : `

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);">

            ${filtered.map(p => {

              const hasCustomPhoto = Boolean(p.photoUrl && p.photoUrl.trim() !== '');

              const isSuspended = Boolean(p.Sperre && p.Sperre.trim() !== '');

              const pStatus = p.Status || p.status || 'Aktiv';

              const isInactive = pStatus.toLowerCase() !== 'aktiv';

              const avatarSrc = getPlayerAvatar(p);



              return `

                <div class="glass-card" style="display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 8px; border: 1px solid ${isSuspended ? 'rgba(239, 68, 68, 0.4)' : 'var(--glass-border)'};">

                  <div style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; background: #111; flex-shrink: 0; border: 2px solid ${hasCustomPhoto ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)'};">

                    <img src="${avatarSrc}" alt="${p.Vorname} ${p.Nachname}" style="width: 100%; height: 100%; object-fit: contain; object-position: bottom center;">

                  </div>

                  <div style="flex: 1; min-width: 0;">

                    <div style="font-weight: 700; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text-primary);">

                      ${p.Vorname} ${p.Nachname}

                    </div>

                    <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px;">

                      ${p.Geburtsdatum ? `Geb.: ${p.Geburtsdatum}` : 'Kein Geburtsdatum'}

                    </div>

                    <div style="margin-top: 5px; display: flex; gap: 4px; flex-wrap: wrap;">

                      ${isSuspended ? `

                        <span style="background: rgba(220, 38, 38, 0.12); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.25); font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Gesperrt</span>

                      ` : hasCustomPhoto ? `

                        <span style="background: rgba(22, 163, 74, 0.12); color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.25); font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Digital verifiziert</span>

                      ` : `

                        <span style="background: rgba(217, 119, 6, 0.12); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.25); font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Passfoto fehlt</span>

                      `}

                      ${isInactive ? `

                        <span style="background: rgba(100, 116, 139, 0.15); color: #64748b; border: 1px solid rgba(100, 116, 139, 0.25); font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Inaktiv</span>

                      ` : ''}

                    </div>

                  </div>

                  <div>

                    <button type="button" class="btn btn-outline btn-upload-player-photo" data-id="${p['#'] || (p.Vorname + '_' + p.Nachname)}" style="color: var(--color-text-primary) !important; font-size: 0.78rem; padding: 6px 10px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;" title="Passfoto / Alten Spielerpass hochladen">

                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>

                      Passfoto

                    </button>

                  </div>

                </div>

              `;

            }).join('')}

          </div>

        `}

      `;



      document.getElementById('kader-search')?.addEventListener('input', (e) => {

        searchQuery = e.target.value;

        renderTab();

      });



      document.getElementById('kader-status-filter')?.addEventListener('change', (e) => {

        statusFilter = e.target.value;

        renderTab();

      });



      // Bind photo upload modal openers

      container.querySelectorAll('.btn-upload-player-photo').forEach(btn => {

        btn.addEventListener('click', () => {

          const playerId = btn.getAttribute('data-id');

          const p = teamPlayers.find(pl => (pl['#'] || (pl.Vorname + '_' + pl.Nachname)) === playerId);

          if (p) {

            openUploadModal(p);

          }

        });

      });



    } else if (currentTeamTab === 'nachmelden') {

      container.innerHTML = `

        <div class="glass-card" style="max-width: 600px; margin: 0 auto; padding: var(--space-lg); border-radius: 8px;">

          <h3 style="margin-top: 0; margin-bottom: 6px;">Spieler anmelden / Passantrag</h3>

          <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: var(--space-lg);">

            Trage hier einen neuen Spieler oder einen bestehenden Spieler mit altem Spielerpass ein. Nach Prüfung durch den Vorstand wird der Spieler offiziell freigeschaltet.

          </p>



          <form id="team-player-request-form" style="display: flex; flex-direction: column; gap: var(--space-md);">

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">

              <div>

                <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Vorname *</label>

                <input type="text" id="req-vorname" class="admin-input" required placeholder="z.B. Max" style="width: 100%;">

              </div>

              <div>

                <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Nachname *</label>

                <input type="text" id="req-nachname" class="admin-input" required placeholder="z.B. Mustermann" style="width: 100%;">

              </div>

            </div>



            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">

              <div>

                <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Geburtsdatum *</label>

                <input type="date" id="req-geburtsdatum" class="admin-input" required style="width: 100%;">

              </div>

              <div>

                <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Position</label>

                <select id="req-position" class="admin-input" style="width: 100%;">

                  <option value="Feldspieler">Feldspieler</option>

                  <option value="Torwart">Torwart</option>

                  <option value="Verteidiger">Verteidiger</option>

                  <option value="Mittelfeld">Mittelfeld</option>

                  <option value="Stürmer">Stürmer</option>

                </select>

              </div>

            </div>



            <div>

              <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Foto / Alter Spielerpass</label>

              <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin: 0 0 6px 0;">Lade ein Passfoto oder ein Foto des physischen Spielerpasses hoch.</p>

              <input type="file" id="req-photo-file" accept="image/*" class="admin-input" style="width: 100%;">

              <div id="req-photo-status" style="font-size: 0.8rem; margin-top: 4px;"></div>

            </div>



            <div>

              <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Notiz / Bisheriger Pass (optional)</label>

              <textarea id="req-note" class="admin-input" placeholder="z.B. Bisheriger Pass vorhanden / Neuanmeldung / Ex-Verein..." rows="2" style="width: 100%;"></textarea>

            </div>



            <div style="margin-top: var(--space-sm);">

              <button type="submit" id="req-submit-btn" class="btn-dsg" style="background: var(--color-accent); color: #fff; font-weight: 700; width: 100%; padding: 12px; cursor: pointer;">

                Passantrag absenden

              </button>

            </div>

          </form>

        </div>

      `;



      // Form submit handler

      const form = document.getElementById('team-player-request-form');

      form?.addEventListener('submit', async (e) => {

        e.preventDefault();

        const submitBtn = document.getElementById('req-submit-btn');

        submitBtn.disabled = true;

        submitBtn.textContent = 'Wird übermittelt...';



        const fileInput = document.getElementById('req-photo-file');

        let photoUrl = '';

        if (fileInput && fileInput.files && fileInput.files[0]) {

          const file = fileInput.files[0];

          photoUrl = await uploadPhotoToStorage(file);

          if (!photoUrl) {

            photoUrl = await compressImage(file);

          }

        }



        const newReq = {

          teamName,

          firstName: document.getElementById('req-vorname').value.trim(),

          lastName: document.getElementById('req-nachname').value.trim(),

          birthDate: document.getElementById('req-geburtsdatum').value,

          position: document.getElementById('req-position').value,

          photoUrl: photoUrl || '',

          note: document.getElementById('req-note').value.trim()

        };



        const success = await Store.addPlayerRequest(newReq);

        if (success) {

          alert('Passantrag erfolgreich eingereicht! Der Liga-Vorstand wird den Antrag prüfen.');

          currentTeamTab = 'antraege';

          renderTab();

        } else {

          alert('Fehler beim Einreichen des Antrags.');

          submitBtn.disabled = false;

          submitBtn.textContent = 'Passantrag absenden';

        }

      });



    } else if (currentTeamTab === 'antraege') {

      const allRequests = Store.getPlayerRequests();

      const teamRequests = allRequests.filter(r => (r.teamName || '').toLowerCase() === teamName.toLowerCase());



      if (teamRequests.length === 0) {

        container.innerHTML = `

          <div class="glass-card" style="text-align: center; padding: 40px; color: var(--color-text-secondary); border-radius: 8px;">

            <h3 style="color: var(--color-text-primary);">Keine Anträge eingereicht</h3>

            <p style="font-size: 0.9rem;">Dein Verein hat bisher keine Neuanmeldungen oder Passanträge eingereicht.</p>

          </div>

        `;

        return;

      }



      container.innerHTML = `

        <h3 style="margin-bottom: var(--space-md);">Eingereichte Anträge (${teamRequests.length})</h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md);">

          ${teamRequests.map(r => {

            const isPending = r.status === 'pending';

            const isApproved = r.status === 'approved';

            const statusBadge = isPending 

              ? `<span style="background: rgba(234, 179, 8, 0.15); color: #d97706; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">In Prüfung</span>`

              : isApproved

              ? `<span style="background: rgba(34, 197, 94, 0.15); color: #16a34a; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Genehmigt</span>`

              : `<span style="background: rgba(239, 68, 68, 0.15); color: #dc2626; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Abgelehnt</span>`;



            return `

              <div class="glass-card" style="border: 1px solid var(--glass-border); border-radius: 8px; padding: var(--space-md); display: flex; flex-direction: column; gap: 8px;">

                <div style="display: flex; justify-content: space-between; align-items: flex-start;">

                  <div>

                    <h4 style="margin: 0; font-size: 1.1rem; color: var(--color-text-primary);">${r.firstName} ${r.lastName}</h4>

                    <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${r.birthDate ? `Geb.: ${r.birthDate}` : ''}</div>

                  </div>

                  ${statusBadge}

                </div>

                ${r.photoUrl ? `

                  <div style="text-align: center; margin: 4px 0;">

                    <img src="${r.photoUrl}" alt="Passfoto" style="max-height: 100px; border-radius: 4px; object-fit: contain;">

                  </div>

                ` : ''}

                ${r.note ? `<div style="font-size: 0.8rem; background: var(--color-surface); padding: 6px; border-radius: 4px; border: 1px solid var(--glass-border);"><strong>Notiz:</strong> ${r.note}</div>` : ''}

                ${r.reviewNote ? `<div style="font-size: 0.8rem; color: #dc2626; background: rgba(239, 68, 68, 0.08); padding: 6px; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.2);"><strong>Vorstands-Rückmeldung:</strong> ${r.reviewNote}</div>` : ''}

              </div>

            `;

          }).join('')}

        </div>

      `;

    }

  };



  // Upload Photo Modal Logic

  const modal = document.getElementById('photo-upload-modal');

  const closeModal = () => {

    if (modal) modal.style.display = 'none';

    stagedPhotoUrl = null;

    activeUploadPlayer = null;

  };



  const openUploadModal = (player) => {

    activeUploadPlayer = player;

    stagedPhotoUrl = null;

    const nameEl = document.getElementById('modal-player-name');

    const previewImg = document.getElementById('modal-avatar-preview-img');

    const statusText = document.getElementById('modal-upload-status');

    const fileInput = document.getElementById('modal-file-input');



    if (nameEl) nameEl.textContent = `Passfoto: ${player.Vorname} ${player.Nachname}`;

    if (previewImg) previewImg.src = getPlayerAvatar(player);

    if (statusText) statusText.textContent = '';

    if (fileInput) fileInput.value = '';

    if (modal) modal.style.display = 'flex';

  };



  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);

  document.getElementById('modal-close-x-btn')?.addEventListener('click', closeModal);



  // Close when clicking outside modal on backdrop

  modal?.addEventListener('click', (e) => {

    if (e.target === modal) {

      closeModal();

    }

  });



  // Close on Escape key

  window.addEventListener('keydown', (e) => {

    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {

      closeModal();

    }

  });



  document.getElementById('modal-select-file-btn')?.addEventListener('click', () => {

    document.getElementById('modal-file-input')?.click();

  });



  document.getElementById('modal-file-input')?.addEventListener('change', async (e) => {

    const file = e.target.files && e.target.files[0];

    if (!file) return;

    const previewImg = document.getElementById('modal-avatar-preview-img');

    const statusText = document.getElementById('modal-upload-status');



    if (statusText) statusText.textContent = 'Lade hoch...';

    let url = await uploadPhotoToStorage(file);

    if (!url) {

      url = await compressImage(file);

    }

    if (url) {

      stagedPhotoUrl = url;

      if (previewImg) previewImg.src = url;

      if (statusText) {

        statusText.textContent = 'Foto bereit zum Speichern!';

        statusText.style.color = '#22c55e';

      }

    } else {

      if (statusText) {

        statusText.textContent = 'Fehler beim Laden des Fotos.';

        statusText.style.color = '#ef4444';

      }

    }

  });



  document.getElementById('modal-save-btn')?.addEventListener('click', async () => {

    if (!stagedPhotoUrl || !activeUploadPlayer) {

      alert('Bitte wähle zuerst ein Foto aus.');

      return;

    }

    const saveBtn = document.getElementById('modal-save-btn');

    saveBtn.disabled = true;

    saveBtn.textContent = 'Wird gespeichert...';



    const pId = activeUploadPlayer['#'] || (activeUploadPlayer.Vorname + '_' + activeUploadPlayer.Nachname);

    const success = await Store.updatePlayerPassPhoto(pId, stagedPhotoUrl);

    saveBtn.disabled = false;

    saveBtn.textContent = 'Speichern';

    if (success) {

      closeModal();

      renderTab();

    } else {

      alert('Fehler beim Speichern des Fotos.');

    }

  });



  renderTab();

};

