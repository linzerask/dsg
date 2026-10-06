export const viewDatenschutz = () => `
  <div class="container stagger-item" style="padding-top: var(--space-xl); max-width: 1000px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md);">
      <h1 style="color: var(--color-accent); margin: 0;">Datenschutzerklärung</h1>
      <span style="background: rgba(0, 179, 65, 0.12); color: var(--color-accent); border: 1px solid rgba(0, 179, 65, 0.3); font-weight: 700; font-size: 0.85rem; padding: 6px 14px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        100% Tracking-Frei & DSGVO-Konform
      </span>
    </div>

    <!-- Live Privacy & Storage Inspector Card -->
    <div class="glass-card" style="margin-bottom: var(--space-lg); border-left: 4px solid var(--color-accent);">
      <h3 style="margin-top: 0; margin-bottom: var(--space-xs); display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-accent);"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
        Speicher- & Datenschutz-Transparenz
      </h3>
      <p style="color: var(--color-text-secondary); font-size: 0.95rem; margin-bottom: var(--space-md);">
        Diese Website verzichtet vollständig auf Werbe-, Tracking- und Drittanbieter-Cookies. Es werden ausschließlich technisch notwendige Speicherungen auf Ihrem Endgerät genutzt (§ 165 Abs. 3 TKG 2021).
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-sm); margin-bottom: var(--space-md);">
        <div style="background: var(--color-surface-hover); padding: 12px 16px; border-radius: var(--border-radius-sm); border: var(--glass-border);">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); font-weight: 600; text-transform: uppercase;">Tracking- & Marketing-Cookies</div>
          <div style="font-weight: 700; color: #00b341; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Keine (0 aktiv)
          </div>
        </div>
        <div style="background: var(--color-surface-hover); padding: 12px 16px; border-radius: var(--border-radius-sm); border: var(--glass-border);">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); font-weight: 600; text-transform: uppercase;">Schriftarten (Fonts) & Assets</div>
          <div style="font-weight: 700; color: #00b341; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            100% Lokal gehostet
          </div>
        </div>
        <div style="background: var(--color-surface-hover); padding: 12px 16px; border-radius: var(--border-radius-sm); border: var(--glass-border);">
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); font-weight: 600; text-transform: uppercase;">Funktionaler Speicher</div>
          <div style="font-weight: 700; color: var(--color-text-primary); margin-top: 4px;" id="privacy-storage-status">
            Design-Präferenz & Tabellencache
          </div>
        </div>
      </div>

      <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
        <button id="btn-clear-cache" class="btn" style="background: rgba(255, 71, 87, 0.12); color: #ff4757; border: 1px solid rgba(255, 71, 87, 0.3); font-size: 0.9rem; padding: 8px 16px; border-radius: 999px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-weight: 600; transition: all 0.2s;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Lokale Einstellungen & Cache zurücksetzen
        </button>
      </div>
    </div>

    <!-- Main Legal Privacy Content -->
    <div class="glass-card" style="line-height: 1.8;">
      
      <h2 style="margin-bottom: var(--space-sm);">1. Allgemeine Hinweise & Verantwortliche Stelle</h2>
      <p style="margin-bottom: var(--space-sm);">
        Die Diözesansportgemeinschaft Oberösterreich (DSG OÖ) nimmt den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO, DSG) sowie des Telekommunikationsgesetzes 2021 (§ 165 TKG 2021).
      </p>
      <p style="margin-bottom: var(--space-md);">
        <strong>Verantwortliche Stelle für die Datenverarbeitung auf dieser Website:</strong><br>
        Diözesansportgemeinschaft Oberösterreich<br>
        Kapuzinerstraße 84, 4020 Linz, Österreich<br>
        Telefon: +43 (0)732 7610 3421<br>
        E-Mail: <a href="mailto:dsg@dioezese-linz.at" style="color: var(--color-accent); text-decoration: none;">dsg@dioezese-linz.at</a>
      </p>

      <h2 style="margin-bottom: var(--space-sm); padding-top: var(--space-md); border-top: var(--glass-border);">2. Rechtsgrundlagen der Datenverarbeitung</h2>
      <p style="margin-bottom: var(--space-xs);">Die Verarbeitung von Daten auf dieser Website erfolgt auf Basis folgender Rechtsgrundlagen gemäß Art. 6 DSGVO:</p>
      <ul style="margin-left: 24px; margin-bottom: var(--space-md);">
        <li style="margin-bottom: 6px;"><strong>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung & Organisation des Spielbetriebs):</strong> Verarbeitung von Spielergebnissen, Kadern, Spielberichten und Ligatabellen zur ordnungsgemäßen Abwicklung der DSG-Fußballmeisterschaft.</li>
        <li style="margin-bottom: 6px;"><strong>Art. 6 Abs. 1 lit. f DSGVO (Berechtigtes Interesse):</strong> Bereitstellung einer sicheren, stabilen, schnellen und nutzerfreundlichen Website.</li>
        <li style="margin-bottom: 6px;"><strong>§ 165 Abs. 3 Satz 2 TKG 2021:</strong> Zulässigkeit technisch unbedingt erforderlicher Speicherungen auf dem Endgerät ohne vorheriges Einwilligungserfordernis.</li>
      </ul>

      <h2 style="margin-bottom: var(--space-sm); padding-top: var(--space-md); border-top: var(--glass-border);">3. Speichertechnologien (Cookies & Lokaler Speicher)</h2>
      <h3 style="color: var(--color-text-secondary); margin-bottom: var(--space-xs);">A. Keine Marketing- oder Tracking-Cookies</h3>
      <p style="margin-bottom: var(--space-sm);">
        Diese Website verwendet <strong>keine</strong> Tracking-Cookies, keine Werbe-Cookies und keine Analyseprogramme Dritter (wie Google Analytics, Meta Pixel oder Werbenetzwerke). Es werden keine Nutzerprofile erstellt und kein seitenübergreifendes Tracking durchgeführt.
      </p>

      <h3 style="color: var(--color-text-secondary); margin-bottom: var(--space-xs);">B. Technisch notwendige lokale Speicherungen (HTML5 Storage)</h3>
      <p style="margin-bottom: var(--space-sm);">
        Zur Gewährleistung der fehlerfreien Funktion und optimalen Nutzererfahrung werden folgende Daten ausschließlich lokal auf Ihrem Endgerät gespeichert:
      </p>
      <div style="overflow-x: auto; margin-bottom: var(--space-md);">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.92rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--color-border); text-align: left;">
              <th style="padding: 10px 8px;">Schlüssel</th>
              <th style="padding: 10px 8px;">Art / Speicherort</th>
              <th style="padding: 10px 8px;">Zweck</th>
              <th style="padding: 10px 8px;">Speicherdauer</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--color-border);">
              <td style="padding: 10px 8px; font-family: monospace; color: var(--color-accent);">dsg_theme</td>
              <td style="padding: 10px 8px;">LocalStorage</td>
              <td style="padding: 10px 8px;">Speichert Ihre gewählte Farbansicht (Hell- oder Dunkelmodus) zur unterbrechungsfreien Darstellung.</td>
              <td style="padding: 10px 8px;">Persistent (bis zum Löschen)</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--color-border);">
              <td style="padding: 10px 8px; font-family: monospace; color: var(--color-accent);">dsg_store_data</td>
              <td style="padding: 10px 8px;">LocalStorage</td>
              <td style="padding: 10px 8px;">Lokaler Cache für Tabellenstände und Spielpläne, um schnelle Ladezeiten und Offline-Verfügbarkeit zu sichern.</td>
              <td style="padding: 10px 8px;">Persistent (automatisch aktualisiert)</td>
            </tr>
            <tr>
              <td style="padding: 10px 8px; font-family: monospace; color: var(--color-accent);">dsg_admin / dsg_admin_tab</td>
              <td style="padding: 10px 8px;">SessionStorage</td>
              <td style="padding: 10px 8px;">Sitzungsauthentifizierung und gewählter Reiter im geschützten Verwaltungsbereich für Liga-Administratoren.</td>
              <td style="padding: 10px 8px;">Endet mit Schließen des Browsers</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style="margin-bottom: var(--space-sm); padding-top: var(--space-md); border-top: var(--glass-border);">4. Lokales Hosting von Schriften und Programmbibliotheken</h2>
      <p style="margin-bottom: var(--space-md);">
        Um die Vorgaben der DSGVO und des EuGH vollumfänglich einzuhalten, werden sämtliche Schriftarten (u. a. <em>Outfit</em> und <em>Merriweather</em>) sowie Skriptbibliotheken (u. a. <em>Anime.js</em>) <strong>vollständig lokal auf unserem eigenen Server</strong> gehostet. Bei Ihrem Besuch werden <strong>keine</strong> Verbindungen zu Google-Servern oder Drittanbieter-Netzwerken (CDNs) in den USA aufgebaut, sodass Ihre IP-Adresse nicht an Dritte übertragen wird.
      </p>

      <h2 style="margin-bottom: var(--space-sm); padding-top: var(--space-md); border-top: var(--glass-border);">5. Server-Log-Dateien</h2>
      <p style="margin-bottom: var(--space-md);">
        Der Hosting-Provider dieser Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch übermittelt. Dies umfasst:<br>
        • Browsertyp und Browserversion<br>
        • Verwendetes Betriebssystem<br>
        • Referrer URL (die zuvor besuchte Seite)<br>
        • Hostname des zugreifenden Rechners bzw. IP-Adresse (anonymisiert)<br>
        • Uhrzeit der Serveranfrage<br><br>
        Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO zur Gewährleistung der Systemsicherheit und Stabilität.
      </p>

      <h2 style="margin-bottom: var(--space-sm); padding-top: var(--space-md); border-top: var(--glass-border);">6. Cloud-Datenbank & Bereitstellung von Inhalten (Firebase / Google Cloud)</h2>
      <p style="margin-bottom: var(--space-md);">
        Zur zuverlässigen, ausfallsicheren und synchronen Bereitstellung aktueller Spielergebnisse, Kaderdaten, Tabellen und Spielberichte nutzen wir die Cloud-Dienste Google Firebase (Cloud Firestore & Cloud Storage) der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.<br><br>
        Hierbei werden rein funktionale Anfragen zur Abfrage der Spieldaten verarbeitet. Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Durchführung des Spielbetriebs) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer stabilen und synchronen Liga-Plattform). Mit Google wurde eine Vereinbarung zur Auftragsverarbeitung (Data Processing Agreement) auf Basis der EU-Standardvertragsklauseln geschlossen.
      </p>

      <h2 style="margin-bottom: var(--space-sm); padding-top: var(--space-md); border-top: var(--glass-border);">7. Rechte der betroffenen Personen</h2>
      <p style="margin-bottom: var(--space-xs);">Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
      <ul style="margin-left: 24px; margin-bottom: var(--space-md);">
        <li style="margin-bottom: 6px;"><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre von uns verarbeiteten Daten verlangen.</li>
        <li style="margin-bottom: 6px;"><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Sie können die Berichtigung unrichtiger Daten verlangen.</li>
        <li style="margin-bottom: 6px;"><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer bei uns gespeicherten Daten verlangen.</li>
        <li style="margin-bottom: 6px;"><strong>Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie können die Einschränkung der Datenverarbeitung verlangen.</li>
        <li style="margin-bottom: 6px;"><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.</li>
        <li style="margin-bottom: 6px;"><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie können der Datenverarbeitung widersprechen.</li>
      </ul>

      <h2 style="margin-bottom: var(--space-sm); padding-top: var(--space-md); border-top: var(--glass-border);">8. Beschwerderecht bei der Aufsichtsbehörde</h2>
      <p style="margin-bottom: var(--space-md);">
        Sollten Sie der Ansicht sein, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt oder Ihre datenschutzrechtlichen Ansprüche verletzt worden sind, steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu:<br><br>
        <strong>Österreichische Datenschutzbehörde</strong><br>
        Barichgasse 40-42, 1030 Wien, Österreich<br>
        Telefon: +43 1 52 152-0<br>
        E-Mail: <a href="mailto:dsb@dsb.gv.at" style="color: var(--color-accent); text-decoration: none;">dsb@dsb.gv.at</a><br>
        Website: <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" style="color: var(--color-accent); text-decoration: none;">www.dsb.gv.at</a>
      </p>

      <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin-top: var(--space-lg); border-top: 1px solid var(--color-border); padding-top: var(--space-sm);">
        Stand dieser Datenschutzerklärung: Oktober 2026.
      </p>
    </div>
  </div>
`;

export const bindDatenschutz = () => {
  const clearBtn = document.getElementById('btn-clear-cache');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Möchten Sie alle lokal gespeicherten Einstellungen (Farbmodus & lokaler Tabellencache) zurücksetzen?')) {
        try {
          localStorage.removeItem('dsg_theme');
          localStorage.removeItem('dsg_store_data');
          sessionStorage.removeItem('dsg_admin');
          sessionStorage.removeItem('dsg_admin_tab');
          alert('Lokale Daten und Cache wurden erfolgreich geleert. Die Seite wird neu geladen.');
          window.location.reload();
        } catch(e) {
          console.error(e);
        }
      }
    });
  }
};
