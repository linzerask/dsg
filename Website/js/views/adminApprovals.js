import { Store } from '../store.js?v=1793360000000';
import { showToast } from './admin.js?v=1791230000000';

let currentCategory = 'reports'; // 'reports' | 'passes'
let currentFilter = 'pending'; // 'pending' | 'all'

export const renderAdminApprovals = () => {
  return `
    <div class="datagrid-container stagger-item">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md);">
        <div>
          <h2 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11l-3 3-2-2"/></svg>
            Freigaben &amp; Bestätigungen
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Überprüfe und bestätige Schiedsrichter-Spielberichte und Spielerpass-Anträge</p>
        </div>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <div class="approvals-pill-group">
            <button id="cat-reports-btn" class="btn ${currentCategory === 'reports' ? 'btn-dsg' : 'btn-outline'}" style="padding: 6px 14px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              Spielberichte
              <span id="badge-cat-reports" style="display: none; background: #eab308; color: #000; font-size: 0.7rem; padding: 1px 6px; border-radius: 999px; font-weight: 800;"></span>
            </button>
            <button id="cat-passes-btn" class="btn ${currentCategory === 'passes' ? 'btn-dsg' : 'btn-outline'}" style="padding: 6px 14px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Passanträge
              <span id="badge-cat-passes" style="display: none; background: #eab308; color: #000; font-size: 0.7rem; padding: 1px 6px; border-radius: 999px; font-weight: 800;"></span>
            </button>
          </div>

          <div id="pass-subfilters" style="display: ${currentCategory === 'passes' ? 'flex' : 'none'}; gap: 6px;">
            <button id="filter-pending-btn" class="btn ${currentFilter === 'pending' ? 'btn-dsg' : 'btn-outline'}" style="font-weight: 700; padding: 6px 14px; font-size: 0.82rem;">Offen</button>
            <button id="filter-all-btn" class="btn ${currentFilter === 'all' ? 'btn-dsg' : 'btn-outline'}" style="font-weight: 700; padding: 6px 14px; font-size: 0.82rem;">Alle / Verlauf</button>
          </div>
        </div>
      </div>

      <div id="approvals-list-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
};

export const initAdminApprovals = () => {
  const container = document.getElementById('approvals-list-container');
  const btnCatReports = document.getElementById('cat-reports-btn');
  const btnCatPasses = document.getElementById('cat-passes-btn');
  const passSubfilters = document.getElementById('pass-subfilters');
  const btnPending = document.getElementById('filter-pending-btn');
  const btnAll = document.getElementById('filter-all-btn');

  const updateBadges = () => {
    const pendingReports = Store.getPendingMatchReports ? Store.getPendingMatchReports() : [];
    const allRequests = Store.getPlayerRequests ? Store.getPlayerRequests() : [];
    const pendingPasses = allRequests.filter(r => r.status === 'pending');

    const bReports = document.getElementById('badge-cat-reports');
    if (bReports) {
      if (pendingReports.length > 0) {
        bReports.textContent = pendingReports.length;
        bReports.style.display = 'inline-block';
      } else {
        bReports.style.display = 'none';
      }
    }

    const bPasses = document.getElementById('badge-cat-passes');
    if (bPasses) {
      if (pendingPasses.length > 0) {
        bPasses.textContent = pendingPasses.length;
        bPasses.style.display = 'inline-block';
      } else {
        bPasses.style.display = 'none';
      }
    }
  };

  const renderContent = () => {
    if (!container) return;
    updateBadges();

    if (currentCategory === 'reports') {
      renderReportsList();
    } else {
      renderPassesList();
    }
  };

  // --- RENDER MATCH REPORTS ---
  const renderReportsList = () => {
    const pendingReports = Store.getPendingMatchReports ? Store.getPendingMatchReports() : [];

    if (pendingReports.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 50px 20px; color: var(--color-text-secondary); border-radius: 8px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; color: #16a34a; opacity: 0.8;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <h3 style="margin-bottom: 6px; color: var(--color-text-primary);">Keine offenen Spielberichte</h3>
          <p style="font-size: 0.9rem; margin: 0;">Alle vom Schiedsrichter eingereichten Spielberichte wurden geprüft und freigegeben.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        ${pendingReports.map(item => {
          const { seasonKey, seasonName, match, report } = item;
          const submDate = report.submittedAt ? new Date(report.submittedAt).toLocaleString('de-AT') : '';

          return `
            <div class="glass-card" style="border: 1px solid rgba(234, 179, 8, 0.45); border-radius: 8px; padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); background: var(--color-surface);">
              <!-- Header Row -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap;">
                <div>
                  <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">
                    ${seasonName || seasonKey} &bull; ${match.round || 'Spiel'}
                  </div>
                  <h3 style="margin: 4px 0 2px 0; font-size: 1.25rem; font-weight: 800;">
                    ${match.home} <span style="color: var(--color-accent);">gegen</span> ${match.away}
                  </h3>
                  <div style="font-size: 0.82rem; color: var(--color-text-secondary);">
                    ${match.date || ''} ${match.time ? match.time + ' Uhr' : ''} &bull; ${match.venue || match.location || 'DSG-Platz'}
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="background: rgba(234, 179, 8, 0.18); color: #d97706; border: 1px solid rgba(234, 179, 8, 0.45); padding: 4px 10px; border-radius: 999px; font-size: 0.78rem; font-weight: 800; text-transform: uppercase;">
                    Wartet auf Admin-Freigabe
                  </span>
                  <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">
                    Eingereicht: ${submDate || 'Kürzlich'}
                  </div>
                </div>
              </div>

              <!-- Score Summary Display -->
              <div style="background: rgba(0, 150, 64, 0.06); border: 1px solid rgba(0, 150, 64, 0.2); border-radius: 6px; padding: 12px 16px; display: flex; justify-content: space-around; align-items: center; text-align: center; margin: 6px 0;">
                <div>
                  <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Endergebnis</div>
                  <div style="font-size: 1.8rem; font-weight: 900; color: var(--color-text-primary);">${report.score || '-:-'}</div>
                </div>
                ${report.ht ? `
                  <div style="border-left: 1px solid rgba(0, 150, 64, 0.2); padding-left: 20px;">
                    <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); text-transform: uppercase;">Halbzeit</div>
                    <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-text-secondary);">${report.ht}</div>
                  </div>
                ` : ''}
              </div>

              <!-- Events Grid (Tore, Karten, Wechsel) -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; font-size: 0.85rem;">
                <!-- Goals -->
                <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; padding: 10px 12px;">
                  <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #16a34a; margin-bottom: 6px;">
                    Torschützen (${(report.scorers || []).length})
                  </div>
                  ${(report.scorers || []).length === 0 ? `
                    <div style="color: var(--color-text-secondary); font-size: 0.8rem;">Keine Tore erfasst</div>
                  ` : (report.scorers || []).map(s => `
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed var(--glass-border);">
                      <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: -1px; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path><circle cx="12" cy="12" r="4"></circle></svg><strong>${s.name || s.player}</strong> (${s.team})</span>
                      <span style="color: var(--color-text-secondary); font-weight: 600;">${s.minute ? s.minute + "'" : ''}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- Cards -->
                <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; padding: 10px 12px;">
                  <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #d97706; margin-bottom: 6px;">
                    Karten &amp; Fairplay (${(report.cards || []).length})
                  </div>
                  ${(report.cards || []).length === 0 ? `
                    <div style="color: var(--color-text-secondary); font-size: 0.8rem;">Keine Verwarnungen</div>
                  ` : (report.cards || []).map(c => `
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed var(--glass-border);">
                      <span>
                        <span style="display: inline-block; width: 10px; height: 13px; background: ${c.type === 'red' ? '#dc2626' : c.type.includes('yellowRed') ? '#f97316' : '#eab308'}; border-radius: 2px; vertical-align: middle; margin-right: 4px;"></span>
                        <strong>${c.name || c.player}</strong> (${c.team})
                      </span>
                      <span style="color: var(--color-text-secondary); font-weight: 600;">${c.minute ? c.minute + "'" : ''}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- Auswechslungen -->
                <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px; padding: 10px 12px;">
                  <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--color-accent); margin-bottom: 6px;">
                    Auswechslungen (${(report.substitutions || []).length})
                  </div>
                  ${(report.substitutions || []).length === 0 ? `
                    <div style="color: var(--color-text-secondary); font-size: 0.8rem;">Keine Wechsel erfasst</div>
                  ` : (report.substitutions || []).map(s => `
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed var(--glass-border); font-size: 0.8rem;">
                      <span>
                        <span style="color: #dc2626; font-weight: 700;">&darr; ${s.playerOut || '-'}</span>
                        <span style="color: var(--color-text-secondary); margin: 0 4px;">&bull;</span>
                        <span style="color: #16a34a; font-weight: 700;">&uarr; ${s.playerIn || '-'}</span>
                        <span style="color: var(--color-text-secondary); font-size: 0.75rem; margin-left: 4px;">(${s.team})</span>
                      </span>
                      <span style="color: var(--color-text-secondary); font-weight: 600;">${s.minute ? s.minute + "'" : ''}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Referee Notes (if any) -->
              ${report.refereeNotes ? `
                <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--color-border); border-left: 3px solid var(--color-accent); border-radius: 4px; padding: 8px 12px; font-size: 0.82rem;">
                  <strong>Schiedsrichter-Notiz / Vorkommnisse:</strong> ${report.refereeNotes}
                </div>
              ` : ''}

              <!-- Action Bar -->
              <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; padding-top: 10px; border-top: 1px solid var(--glass-border);">
                <button type="button" class="btn btn-outline btn-reject-match-report" data-season="${seasonKey}" data-match-id="${match.id}" style="color: #dc2626 !important; background: #ffffff !important; border: 1px solid rgba(220, 38, 38, 0.35) !important; font-size: 0.85rem; padding: 8px 16px; font-weight: 700; border-radius: 6px; cursor: pointer;">
                  Bericht ablehnen
                </button>
                <button type="button" class="btn btn-dsg btn-approve-match-report" data-season="${seasonKey}" data-match-id="${match.id}" style="background: var(--color-accent); color: #fff; font-size: 0.85rem; padding: 8px 18px; font-weight: 800; border: 1px solid var(--color-accent); border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Spielbericht freigeben &amp; Tabelle aktualisieren
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Wire Approve buttons
    container.querySelectorAll('.btn-approve-match-report').forEach(btn => {
      btn.addEventListener('click', async () => {
        const season = btn.getAttribute('data-season');
        const matchId = btn.getAttribute('data-match-id');
        btn.disabled = true;
        btn.textContent = 'Wird freigegeben & Tabelle aktualisiert...';

        const success = await Store.approveMatchReport(season, matchId);
        if (success) {
          showToast('Spielbericht erfolgreich bestätigt & Tabelle aktualisiert!');
          renderContent();
        } else {
          showToast('Fehler bei der Freigabe.', true);
          btn.disabled = false;
        }
      });
    });

    // Wire Reject buttons
    container.querySelectorAll('.btn-reject-match-report').forEach(btn => {
      btn.addEventListener('click', async () => {
        const season = btn.getAttribute('data-season');
        const matchId = btn.getAttribute('data-match-id');
        const reason = prompt('Grund für die Ablehnung / Korrekturhinweis an Schiedsrichter:', 'Ergebnis / Torschützen unvollständig');
        if (reason !== null) {
          btn.disabled = true;
          const success = await Store.rejectMatchReport(season, matchId, reason);
          if (success) {
            showToast('Spielbericht abgelehnt. Schiedsrichter kann die Angaben korrigieren.');
            renderContent();
          } else {
            showToast('Fehler beim Ablehnen.', true);
            btn.disabled = false;
          }
        }
      });
    });
  };

  // --- RENDER PLAYER PASSES ---
  const renderPassesList = () => {
    const allRequests = Store.getPlayerRequests ? Store.getPlayerRequests() : [];
    const requests = (currentFilter === 'pending')
      ? allRequests.filter(r => r.status === 'pending')
      : allRequests;

    if (requests.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary); border-radius: 8px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.6;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <h3 style="margin-bottom: 6px; color: var(--color-text-primary);">${currentFilter === 'pending' ? 'Keine offenen Passanträge' : 'Keine Passanträge vorhanden'}</h3>
          <p style="font-size: 0.9rem;">${currentFilter === 'pending' ? 'Alle Neuanmeldungen und Passfotos wurden bearbeitet.' : 'Bisher wurden keine Anträge von Vereinsverwaltern eingereicht.'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-md);">
        ${requests.map(r => {
          const isPending = r.status === 'pending';
          const isApproved = r.status === 'approved';
          const statusBadge = isPending 
            ? `<span style="background: rgba(234, 179, 8, 0.15); color: #eab308; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Warten auf Prüfung</span>`
            : isApproved
            ? `<span style="background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Genehmigt</span>`
            : `<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Abgelehnt</span>`;

          const dateFormatted = r.createdAt ? new Date(r.createdAt).toLocaleDateString('de-AT') : '';

          return `
            <div class="glass-card" style="border: 1px solid ${isPending ? 'rgba(234, 179, 8, 0.4)' : 'var(--glass-border)'}; border-radius: 8px; padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); background: var(--color-surface);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div>
                  <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">${r.teamName || 'Verein'}</div>
                  <h3 style="margin: 4px 0 2px 0; font-size: 1.15rem;">${r.firstName} ${r.lastName}</h3>
                  <div style="font-size: 0.82rem; color: var(--color-text-secondary);">${r.birthDate ? `Geb.: ${r.birthDate}` : ''} ${r.position ? `&bull; ${r.position}` : ''} ${r.positionSide ? `(${r.positionSide})` : ''}</div>
                </div>
                ${statusBadge}
              </div>

              ${r.photoUrl ? `
                <div style="margin: 6px 0; text-align: center; background: rgba(0,0,0,0.2); border-radius: 6px; padding: 8px;">
                  <img src="${r.photoUrl}" alt="Passfoto" style="max-height: 140px; max-width: 100%; object-fit: contain; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;" onclick="window.open('${r.photoUrl}', '_blank')">
                  <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">Klicken zum Vergrößern</div>
                </div>
              ` : `
                <div style="padding: 12px; background: rgba(0,0,0,0.06); border-radius: 6px; font-size: 0.82rem; color: var(--color-text-secondary); text-align: center;">Kein Passfoto hochgeladen</div>
              `}

              ${r.note ? `
                <div style="font-size: 0.82rem; background: var(--color-surface); padding: 8px 10px; border-radius: 4px; border-left: 3px solid var(--color-accent);">
                  <strong>Notiz:</strong> ${r.note}
                </div>
              ` : ''}

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: var(--space-xs); font-size: 0.75rem; color: var(--color-text-secondary);">
                <span>Eingereicht: ${dateFormatted}</span>
                ${isPending ? `
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-dsg btn-approve-request" data-id="${r.id}" style="background: var(--color-accent); color: #fff; font-size: 0.82rem; padding: 6px 14px; font-weight: 700; border: 1px solid var(--color-accent); border-radius: 6px; cursor: pointer;">Genehmigen</button>
                    <button class="btn btn-outline btn-reject-request" data-id="${r.id}" style="color: #dc2626 !important; background: #ffffff !important; border: 1px solid rgba(220, 38, 38, 0.35) !important; font-size: 0.82rem; padding: 6px 12px; font-weight: 600; border-radius: 6px; cursor: pointer;">Ablehnen</button>
                  </div>
                ` : `
                  <span>${r.reviewNote ? `Hinweis: ${r.reviewNote}` : ''}</span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind Approve buttons
    container.querySelectorAll('.btn-approve-request').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        btn.disabled = true;
        btn.textContent = 'Wird gespeichert...';
        const success = await Store.approvePlayerRequest(id);
        if (success) {
          showToast('Spielerpass erfolgreich genehmigt & im Kader aktiviert!');
          renderContent();
        } else {
          showToast('Fehler bei der Genehmigung.', true);
          btn.disabled = false;
        }
      });
    });

    // Bind Reject buttons
    container.querySelectorAll('.btn-reject-request').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const reason = prompt('Grund für die Ablehnung (optional, für Vereinsverwalter):', 'Foto nicht lesbar / Pass unvollständig');
        if (reason !== null) {
          btn.disabled = true;
          const success = await Store.rejectPlayerRequest(id, reason);
          if (success) {
            showToast('Antrag abgelehnt.');
            renderContent();
          } else {
            showToast('Fehler beim Ablehnen.', true);
            btn.disabled = false;
          }
        }
      });
    });
  };

  // Wire Category buttons
  btnCatReports?.addEventListener('click', () => {
    currentCategory = 'reports';
    btnCatReports.className = 'btn btn-dsg';
    btnCatPasses.className = 'btn btn-outline';
    if (passSubfilters) passSubfilters.style.display = 'none';
    renderContent();
  });

  btnCatPasses?.addEventListener('click', () => {
    currentCategory = 'passes';
    btnCatPasses.className = 'btn btn-dsg';
    btnCatReports.className = 'btn btn-outline';
    if (passSubfilters) passSubfilters.style.display = 'flex';
    renderContent();
  });

  // Wire Pass subfilter buttons
  btnPending?.addEventListener('click', () => {
    currentFilter = 'pending';
    btnPending.className = 'btn btn-dsg';
    btnAll.className = 'btn btn-outline';
    renderContent();
  });

  btnAll?.addEventListener('click', () => {
    currentFilter = 'all';
    btnAll.className = 'btn btn-dsg';
    btnPending.className = 'btn btn-outline';
    renderContent();
  });

  renderContent();
};
