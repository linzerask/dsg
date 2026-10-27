import { Store } from '../store.js?v=1793040000000';
import { showToast } from './admin.js?v=1791230000000';

let currentFilter = 'pending'; // 'pending' | 'all'

export const renderAdminApprovals = () => {
  return `
    <div class="datagrid-container stagger-item">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md);">
        <div>
          <h2 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent);"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11l-3 3-2-2"/></svg>
            Spieler- & Passanträge
          </h2>
          <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px;">Überprüfe und genehmige Neuanmeldungen und Passfotos der Vereine</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="filter-pending-btn" class="btn ${currentFilter === 'pending' ? 'btn-dsg' : 'btn-outline'}" style="font-weight: 700; padding: 7px 14px; font-size: 0.85rem;">Offene Anträge</button>
          <button id="filter-all-btn" class="btn ${currentFilter === 'all' ? 'btn-dsg' : 'btn-outline'}" style="font-weight: 700; padding: 7px 14px; font-size: 0.85rem;">Alle / Verlauf</button>
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
  const btnPending = document.getElementById('filter-pending-btn');
  const btnAll = document.getElementById('filter-all-btn');

  const renderList = () => {
    if (!container) return;
    const allRequests = Store.getPlayerRequests();
    const requests = (currentFilter === 'pending')
      ? allRequests.filter(r => r.status === 'pending')
      : allRequests;

    if (requests.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 40px 20px; color: var(--color-text-secondary);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.6;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <h3 style="margin-bottom: 6px; color: var(--color-text-primary);">${currentFilter === 'pending' ? 'Keine offenen Anträge' : 'Keine Anträge vorhanden'}</h3>
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
            <div class="glass-card" style="border: 1px solid ${isPending ? 'rgba(234, 179, 8, 0.4)' : 'var(--glass-border)'}; border-radius: 8px; padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div>
                  <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase;">${r.teamName || 'Verein'}</div>
                  <h3 style="margin: 4px 0 2px 0; font-size: 1.15rem;">${r.firstName} ${r.lastName}</h3>
                  <div style="font-size: 0.82rem; color: var(--color-text-secondary);">${r.birthDate ? `Geb.: ${r.birthDate}` : ''} ${r.position ? `&bull; ${r.position}` : ''}</div>
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
                    <button class="btn btn-dsg btn-approve-request" data-id="${r.id}" style="background: #22c55e; color: #fff; font-size: 0.82rem; padding: 6px 12px; font-weight: 700; border: none; border-radius: 4px;">Genehmigen</button>
                    <button class="btn btn-outline btn-reject-request" data-id="${r.id}" style="color: #dc2626 !important; border-color: rgba(220, 38, 38, 0.3) !important; font-size: 0.82rem; padding: 6px 10px; font-weight: 600; border-radius: 4px;">Ablehnen</button>
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
          renderList();
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
            renderList();
          } else {
            showToast('Fehler beim Ablehnen.', true);
            btn.disabled = false;
          }
        }
      });
    });
  };

  const updateFilterStyles = () => {
    if (btnPending) {
      btnPending.className = `btn ${currentFilter === 'pending' ? 'btn-dsg' : 'btn-outline'}`;
      btnPending.style.background = currentFilter === 'pending' ? 'var(--color-accent)' : '';
      btnPending.style.color = currentFilter === 'pending' ? '#fff' : 'var(--color-text-primary)';
    }
    if (btnAll) {
      btnAll.className = `btn ${currentFilter === 'all' ? 'btn-dsg' : 'btn-outline'}`;
      btnAll.style.background = currentFilter === 'all' ? 'var(--color-accent)' : '';
      btnAll.style.color = currentFilter === 'all' ? '#fff' : 'var(--color-text-primary)';
    }
  };

  btnPending?.addEventListener('click', () => {
    currentFilter = 'pending';
    updateFilterStyles();
    renderList();
  });

  btnAll?.addEventListener('click', () => {
    currentFilter = 'all';
    updateFilterStyles();
    renderList();
  });

  renderList();
};
