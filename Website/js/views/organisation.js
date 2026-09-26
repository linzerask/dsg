export let currentSection = null;

const orgSections = [
  { id: 'funktionaere', title: 'Funktionäre', icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
  { id: 'betreuer', title: 'Betreuer', icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' },
  { id: 'sportplaetze', title: 'Sportplätze', icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' },
  { id: 'downloads', title: 'Downloads', icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' },
  { id: 'bestimmungen', title: 'DSG Meisterschaftsbestimmungen', icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' }
];

const renderContent = (id) => {
  if (id === 'downloads') {
    const allgemeines = [
      { name: 'Spielbericht', details: '(bitte beidseitig ausdrucken = Duplexdruck)', url: 'https://www.dsg-fussball.com/_files/ugd/f14441_fae3540050e843f891b02c3b8ee89523.pdf' },
      { name: 'Ausschlussbericht', details: '', url: 'https://www.dsg-fussball.com/_files/ugd/0b9675_a02b8a1053984a5b9248943384e04ca4.pdf' },
      { name: 'Statuten', details: '(letzte Änderung 29.07.2022)', url: 'https://www.dsg-fussball.com/organisation/dsg-meisterschaftsbestimmungen' },
      { name: 'Liste der Funktionäre', details: '', url: 'https://www.dsg-fussball.com/organisation/funktion%C3%A4re' },
      { name: 'Liste der Betreuer', details: '', url: 'https://www.dsg-fussball.com/organisation/betreuer' },
      { name: 'Kaderliste', details: '(Spielernamen werden automatisch in Großbuchstaben eingetragen)', url: 'https://www.dsg-fussball.com/_files/ugd/0b9675_10934e4f2ae9458bbc9dfa19a53208fc.doc?dn=Kaderliste.doc' }
    ];

    const archive = [
      { year: '2022', items: [
        { name: 'Gesamtspielplan Herbst 2022', url: 'http://dsgfussball.heimat.eu/downloads/ges_h2022.pdf' },
        { name: 'Gesamtspielplan Frühjahr 2022', url: 'http://dsgfussball.heimat.eu/downloads/ges_f2022.pdf' }
      ]},
      { year: '2021', items: [
        { name: 'Gesamtspielplan Herbst 2021', url: 'http://dsgfussball.heimat.eu/downloads/ges_h2021.pdf' }
      ]},
      { year: '2019', items: [
        { name: 'Gesamtspielplan Herbst 2019', url: 'http://dsgfussball.heimat.eu/downloads/ges_h2019.pdf' }
      ]},
      { year: '2018', items: [
        { name: 'Gesamtspielplan Frühjahr 2018', url: 'http://dsgfussball.heimat.eu/downloads/ges_f2018.pdf' },
        { name: 'Spielplan Liga Frühjahr 2018', url: 'http://dsgfussball.heimat.eu/downloads/liga_f2018.pdf' },
        { name: 'Spielplan 1. Klasse Frühjahr 2018', url: 'http://dsgfussball.heimat.eu/downloads/1kl_f2018.pdf' }
      ]},
      { year: '2017', items: [
        { name: 'Gesamtspielplan Herbst 2017', url: 'http://dsgfussball.heimat.eu/downloads/gesamt_h2017.pdf' },
        { name: 'Spielplan Liga Herbst 2017', url: 'http://dsgfussball.heimat.eu/downloads/liga_h2017.pdf' },
        { name: 'Spielplan 1. Klasse Herbst 2017', url: 'http://dsgfussball.heimat.eu/downloads/1kl_h2017.pdf' },
        { name: 'Gesamtspielplan Frühjahr 2017', url: 'http://dsgfussball.heimat.eu/downloads/gesamt_f2017.pdf' },
        { name: 'Spielplan Liga Frühjahr 2017', url: 'http://dsgfussball.heimat.eu/downloads/liga_f2017.pdf' },
        { name: 'Spielplan 1. Klasse Frühjahr 2017', url: 'http://dsgfussball.heimat.eu/downloads/1kl_f2017.pdf' }
      ]},
      { year: '2016', items: [
        { name: 'Gesamtspielplan Herbst 2016', url: 'http://dsgfussball.heimat.eu/downloads/gesamt_herbst2016.pdf' },
        { name: 'Spielplan Liga Herbst 2016', url: 'http://dsgfussball.heimat.eu/downloads/liga_herbst2016.pdf' },
        { name: 'Spielplan 1. Klasse Herbst 2016', url: 'http://dsgfussball.heimat.eu/downloads/1kl_herbst2016.pdf' }
      ]},
      { year: '2015', items: [
        { name: 'Gesamtspielplan Herbst 2015', url: 'http://dsgfussball.heimat.eu/downloads/gesamt_herbst2015.pdf' },
        { name: 'Spielplan Liga Herbst 2015', url: 'http://dsgfussball.heimat.eu/downloads/liga_herbst2015.pdf' },
        { name: 'Spielplan 1. Klasse Herbst 2015', url: 'http://dsgfussball.heimat.eu/downloads/1kl_herbst2015.pdf' }
      ]}
    ];

    const buildFileRow = (file) => `
      <div class="glass-card file-row hover-lift" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); margin-bottom: var(--space-sm); background: rgba(255,255,255,0.5); transition: transform 0.2s;">
        <div style="display: flex; align-items: center; gap: var(--space-md);">
          <div style="color: var(--color-accent); flex-shrink: 0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 700; color: var(--color-primary);">${file.name}</span>
            ${file.details ? `<span style="font-size: 0.85rem; color: var(--color-text-secondary);">${file.details}</span>` : ''}
          </div>
        </div>
        <a href="${file.url}" target="_blank" class="primary-btn" style="padding: 6px 16px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; text-decoration: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> 
          Download
        </a>
      </div>
    `;

    const allgemeinHTML = allgemeines.map(buildFileRow).join('');
    
    const archivHTML = archive.map(group => `
      <div style="margin-bottom: var(--space-lg);">
        <h4 style="font-size: 1.1rem; color: var(--color-text-secondary); margin-bottom: var(--space-sm); font-weight: 700; border-bottom: 2px solid var(--color-accent); display: inline-block; padding-bottom: 4px;">${group.year}</h4>
        ${group.items.map(buildFileRow).join('')}
      </div>
    `).join('');

    return `
      <div>
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-lg); text-align: center;">Berichte, Listen & Statuten</h2>
        
        <div class="downloads-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl);">
          <!-- Left Column: Allgemeines -->
          <div>
            <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-md);">Allgemeines</h3>
            ${allgemeinHTML}
          </div>

          <!-- Right Column: Archiv -->
          <div>
            <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-md);">Archiv Spielpläne</h3>
            ${archivHTML}
          </div>
        </div>
      </div>
      <style>
        @media (max-width: 900px) {
          .downloads-grid { grid-template-columns: 1fr !important; gap: var(--space-lg) !important; }
        }
        @media (max-width: 768px) {
          .file-row {
            flex-direction: column;
            align-items: flex-start !important;
            gap: var(--space-md) !important;
          }
        }
      </style>
    `;
  } else if (id === 'bestimmungen') {
    return `
      <div class="glass-card bestimmungen-card" style="padding: var(--space-xl); max-width: 900px; margin: 0 auto; background: rgba(255,255,255,0.85);">
        <div style="text-align: center; margin-bottom: var(--space-xl);">
          <h2 class="bestimmungen-title" style="font-size: 2rem; font-weight: 900; color: var(--color-primary); display: inline-block; border-bottom: 3px solid var(--color-accent); padding-bottom: var(--space-sm);">DSG-Meisterschaftsbestimmungen</h2>
        </div>
        
        <div style="font-family: 'Inter', sans-serif; line-height: 1.7; color: var(--color-text); text-align: left;">
          
          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-lg); margin-bottom: var(--space-sm);">§ 1 Teilnahmeberechtigung</h3>
          <p style="margin-bottom: var(--space-md);">Teilnahmeberechtigt sind alle Vereine und Sportgruppen der Diözesansportgemeinschaft, sowie Pfarr-, und Hobbymannschaften, sofern diese Teams nicht an der Meisterschaft des ÖFB teilnehmen. Neuaufnahmen von Mannschaften zur Meisterschaftsteilnahme unterliegen einem Vorstandsbeschluss der DSG OÖ.</p>
          <p style="margin-bottom: var(--space-md);">Alle Gästemannschaften haben bis 15. Juni (Poststempel) jedes Spieljahres einen schriftlichen Antrag um Spielerlaubnis für das folgende Meisterschaftsjahr beim geschäftsführenden Obmann der DSG-Fußballmeisterschaft einzureichen.</p>
          <p style="margin-bottom: var(--space-md);">Spieler, welche Mitglieder des ÖFB sind, können in einer der obengenannten Mannschaft spielen. Nicht spielberechtigt sind beim ÖFB in der laufenden Meisterschaft zum Einsatz gekommene Spieler der</p>
          <ul style="list-style-type: disc; margin-left: var(--space-xl); margin-bottom: var(--space-md);">
            <li>Bezirksligen und höheren Ligen</li>
            <li>sowohl Kampfmannschaften als auch deren Reserven</li>
            <li>sowie 1B-Teams.</li>
          </ul>
          <p style="margin-bottom: var(--space-md);">Die Spielberechtigung für die DSG-Meisterschaft verfällt mit dem erstmaligen Einsatz (=Aufscheinen auf dem Spielbericht) in einer der oben angeführten ÖFB-Mannschaften eines ÖFB-Bewerbs (Meisterschaft, Cup). Jeder einzelne Spieler muss am 31. August bzw. 31. März des Meisterschaftsjahres das 14. Lebensjahr vollendet haben.</p>
          <p style="margin-bottom: var(--space-md);">Spielberechtigt sind nur Spieler mit einem von der DSG-Leitung ausgestellten Spielerpass. Außerdem müssen die Spieler in der Kaderliste des jeweiligen Vereines aufscheinen.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 2 Spieleranmeldungen, Spielerkader, Anmeldetermine, Nenngeld</h3>
          <p style="margin-bottom: var(--space-md);">Vor Beginn der Herbstmeisterschaft können maximal 50 Spieler angemeldet werden. Voraussetzung sind die im § 1c) angeführten Bedingungen.</p>
          <p style="margin-bottom: var(--space-md);">Bei Übertritt zu einer anderen Mannschaft eines Teilnehmers an der DSG-Meisterschaft muss die nachweisliche Freigabe des Vereins vorliegen, bei welchem der Spieler gemeldet war. Der ausgestellte Spielerpass muss geändert werden, weshalb er mit der Kaderliste mitzuschicken ist. Bei Streitigkeiten entscheidet die Disziplinarkommission.</p>
          <p style="margin-bottom: var(--space-md);">Anmeldefristen für die Herbst- und Frühjahrsmeisterschaft sind der 1. August bzw. 1. März. Bis zu diesen Terminen sind auch eventuelle Terminwünsche schriftlich beim geschäftsführenden Obmann der DSG-Fußballmeisterschaft einzureichen.</p>
          <p style="margin-bottom: var(--space-sm);"><strong>Mannschaftskaderlisten:</strong><br>Es ist das auf der DSG-Homepage herunterladbare Formular zu verwenden. Die Familiennamen der Spieler sind in alphabetischer Reihenfolge in Blockschrift anzuführen. Bei Namensgleichheit muss die Kennzeichnung auch durch römische Ziffern erfolgen. Ist ein Spieler bei einem ÖFB-Verein gemeldet, so ist dieser namentlich anzuführen. Die Kaderlisten sind in einfacher Ausfertigung zu den in § 2c) angeführten Terminen ausnahmslos an den geschäftsführenden Obmann der DSG-Fußballmeisterschaft einzusenden.</p>
          <p style="margin-bottom: var(--space-sm);"><strong>DSG - Meisterschaftsnenngeld:</strong><br>Das Nenngeld für die DSG-Fußballmeisterschaft beträgt für</p>
          <ul style="list-style-type: none; margin-left: var(--space-xl); margin-bottom: var(--space-md);">
            <li>€ 250,- für DSG- und KJ-Mannschaften</li>
            <li>€ 300,- für Union-Vereine</li>
            <li>€ 350,- für Hobbymannschaften</li>
          </ul>
          <p style="margin-bottom: var(--space-md);">Das Nenngeld muss bis 1. August jedes Spieljahres auf das Konto mit dem IBAN: AT61 3427 6000 0058 3088 und der Kontobezeichnung Angerbauer Michael eingezahlt werden. Eine Zahlungsbestätigung ist bei der Funktionärsbesprechung vorzuweisen. Die Zahlung des Nenngeldes gilt als Fixanmeldung. Bei Rückzug der Anmeldung für die Meisterschaft nach dem 1. August verfällt das Nenngeld zugunsten der DSG OÖ.</p>
          <p style="margin-bottom: var(--space-md);">Zwischen 1.8. und dem Ende der Herbstmeisterschaft sowie zwischen 1.3. und dem Ende der Frühjahrsmeisterschaft kann jede Mannschaft jeden Monat eine unbegrenzte Zahl von Spielern nachmelden. Die neu angemeldeten Spieler dürfen auf keiner aktuellen Kaderliste einer anderen an der DSG-Fußballmeisterschaft teilnehmenden Mannschaft aufscheinen. Bezüglich Spieleranzahl gilt § 2a).</p>
          <p style="margin-bottom: var(--space-md);">Immer zum Monats-Zehnten werden die bis dahin per Post eingereichten Pässe (mit aufgeklebtem Passbild und vollständig ausgefüllt) bearbeitet. Weiters sind € 2,-- für ein Rücksendekuvert und Postgebühren beizulegen. Eine aktuelle Kaderliste ist per Mail an die für die Spielerpässe verantwortliche Person zu schicken. Die Spieler sind ab dem Zeitpunkt spielberechtigt, an dem die abgestempelten Spielerpässe beim Verein eingelangt sind.</p>
          <p style="margin-bottom: var(--space-md);">Vereine, die eine I. und II. Mannschaft stellen: Eine Spielerlaubnis kann nur vom DSG-Vorstand auf Grund eines Antrages erteilt werden.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 3 Spielregeln</h3>
          <p style="margin-bottom: var(--space-md);">Es gelten grundsätzlich die Satzungen und besonderen Bestimmungen des Österreichischen Fußballbundes für Kampfmannschaften (mit Ausnahme der DSG-Meisterschaftsbestimmungen, sowie nach Beschlüssen der Gesamtleitung).</p>
          <p style="margin-bottom: var(--space-md);">Auf dem Spielbericht dürfen vor Beginn des jeweiligen Spieles 16 Spieler schriftlich namhaft gemacht werden. Davon können 5 Spieler während der gesamten Spielzeit ausgetauscht werden. Ein Rücktausch ist nicht gestattet.</p>
          <p style="margin-bottom: var(--space-md);">Betreffend Dressenausstattung und -wahl gelten die Bestimmungen des OÖFV, d.h., Dressenwahl hat die Auswärtsmannschaft. Die Heimmannschaft muss, wenn benötigt, für Ersatztrikots oder Überziehleibchen sorgen. Der Torwart darf nicht in den selben Farben wie eines der beiden Teams auflaufen.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 4 Heimmannschaft</h3>
          <p style="margin-bottom: var(--space-md);">Heimmannschaft ist jeweils die am Spielplan erstgenannte Mannschaft.</p>
          <p style="margin-bottom: var(--space-md);">Die Heimmannschaft hat einen Matchball und einen Ersatzball sowie Spielberichts- und Ausschlussberichtsformulare mitzubringen.</p>
          <p style="margin-bottom: var(--space-md);">Das Spielberichtsformular ist von der Gast- und Heimmannschaft auszufertigen. Der Spielbericht und die Pässe der am Spielbericht aufscheinenden Spieler sind dem Schiedsrichter mindestens 20 Minuten vor Spielbeginn zu übergeben. Ebenso muss dem Schiedsrichter von der Heimmannschaft ein ausreichend frankiertes Kuvert (Stand 1.8.2022: € 0,85) mit der Anschrift des zuständigen Klassenausschussobmannes übergeben werden. Sollte kein frankiertes und beschriftetes Kuvert übergeben werden, so sind dem Schiedsrichter € 3,-- zusätzlich zu entrichten.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 5 Ausweispflicht</h3>
          <p style="margin-bottom: var(--space-md);">Vor dem Spiel müssen sich alle Aktiven einschließlich der Austauschspieler vor dem Schiedsrichter und den Mannschaftskapitänen mit den Spielerpässen der DSG-Fußballmeisterschaft legitimieren. Ist ein Spieler dazu nicht in der Lage, so darf er sich durch einen öffentlichen Lichtbildausweis ausweisen. Dies muss jedoch zur Überprüfung im Spielbericht angeführt werden.</p>
          <p style="margin-bottom: var(--space-md);">Spielerpässe ohne Lichtbild, Spielerunterschrift und DSG-Stempel sind ungültig.</p>
          <p style="margin-bottom: var(--space-md);">Die erhaltenen Karten müssen von den Mannschaftsbetreuern in den betreffenden Spielerpässen eingetragen werden. Bei Zuwiderhandlung entscheidet die Disziplinarkommission!</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 6 Ausfüllen des Spielberichtsformulars</h3>
          <p style="margin-bottom: var(--space-md);">Für das Ausfüllen des Spielberichts sind die Mannschaftsbetreuer verantwortlich. Der Spielbericht muss ordentlich, vollständig und leserlich ausgefüllt sein.</p>
          <p style="margin-bottom: var(--space-md);">Auf der Vorderseite ist die Mannschaftsaufstellung samt 5 Austauschspielern mit Rückennummern vor dem Anpfiff in Blockschrift einzutragen. Beginnt eine Mannschaft ein Spiel mit weniger als 11 Spielern, kann ab dem 8. Spieler jederzeit ergänzt werden.</p>
          <p style="margin-bottom: var(--space-md);">Der Schiedsrichter hat bei Verwarnungen und Ausschlüssen eine Begründung anzugeben. Gelb-rote Karten sind unter „Spielerausschlüsse“ als solche zu vermerken.</p>
          <p style="margin-bottom: var(--space-md);">Besondere Vorfälle soll der Schiedsrichter auf der Rückseite des Spielberichts notieren. [Spielerausschlüsse --> siehe § 13]</p>
          <p style="margin-bottom: var(--space-md);">Bei nicht exakter Anführung bestrafter Spieler wird die Strafe allen laut Kaderliste in Frage kommenden Spielern angerechnet.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 7 Wartezeit</h3>
          <p style="margin-bottom: var(--space-md);">Die Wartezeit beträgt 20 Minuten.</p>
          <p style="margin-bottom: var(--space-md);">Eine Mannschaft gilt als angetreten, wenn mindestens sieben Spieler zum festgesetzten Spielbeginn in Spielkleidung auf dem Spielfeld anwesend sind.</p>
          <p style="margin-bottom: var(--space-md);">Für das rechtzeitige Erscheinen der restlichen Spieler kann die Wartezeit von 20 Minuten nicht in Anspruch genommen werden.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 8 Sportplatzmarkierung</h3>
          <p style="margin-bottom: var(--space-md);">Jeder Heimverein muss sich immer zeitgerecht vor dem Spiel überzeugen, ob die Sportplatzmarkierung in Ordnung ist oder nachmarkiert werden muss.</p>
          <p style="margin-bottom: var(--space-md);">Bei nicht ordnungsgemäßer Markierung könnte es eintreten, dass der Schiedsrichter das Spiel nicht anpfeift, und das würde heißen, dass der Heimverein in Auslegung der ÖFB-Satzungen die Konsequenzen daraus tragen müsste.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 9 Schiedsrichtergeld</h3>
          <p style="margin-bottom: var(--space-md);">Der Betrag von € 50,-- ist jeweils von der Heimmannschaft an den Schiedsrichter vor dem Spiel zu entrichten.</p>
          <p style="margin-bottom: var(--space-md);">Bei Nichterscheinen einer Mannschaft sind dem Schiedsrichter von der anwesenden Mannschaft € 50,-- zu bezahlen, die jedoch bei der DSG rückverrechnet werden können.</p>
          <p style="margin-bottom: var(--space-md);">Bei unentschuldigtem Fernbleiben des Schiedsrichters sind von diesem € 50,-- in die Disziplinarkasse zu bezahlen.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 10 Spielabsagen, Spielverschiebungen</h3>
          <p style="margin-bottom: var(--space-md);">Spielabsagen und Spielverschiebungen sind nur durch den Obmann möglich!</p>
          <p style="margin-bottom: var(--space-md);">Bei anhaltendem Schlechtwetter werden die Mannschaftsbetreuer spätestens 3 Stunden vor dem Spiel von der Spielabsage verständigt.</p>
          <p style="margin-bottom: var(--space-md);">Wenn keine vorherige Spielabsage durchgegeben wird, haben die Mannschaften auf dem jeweiligen Sportplatz zu erscheinen.</p>
          <p style="margin-bottom: var(--space-md);">In letzter Konsequenz entscheidet der Platzwart, ob gespielt werden darf.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 11 Nichtantreten einer Mannschaft, Geldstrafen</h3>
          <p style="margin-bottom: var(--space-md);">Bei Nichtantreten einer Mannschaft wird diese Mannschaft mit € 150,-- bestraft, weiters ist dieses Spiel mit 0:3 strafzuverifizieren.</p>
          <p style="margin-bottom: var(--space-md);">Bei Fernbleiben einer Mannschaft bei offiziellen Besprechungen und an der Meisterschaftsfeier wird diese mit € 100,-- bestraft.</p>
          <p style="margin-bottom: var(--space-md);">Bei Abtreten vor dem Spielende € 50,-- Strafe sowie Strafverifizierung.</p>
          <p style="margin-bottom: var(--space-md);">Antreten mit einem nicht spielberechtigten Spieler € 50,-- pro Einsatz sowie Strafverifizierung.</p>
          <p style="margin-bottom: var(--space-md);">Bei verursachtem Spielabbruch € 100,-- Strafe sowie Strafverifizierung.</p>
          <p style="margin-bottom: var(--space-md);">Bei Strafverifizierung wird das Spiel mit 0:3 gewertet. Sollte bei Spielabbruch der Spielstand höher als 0:3 sein, so wird dieser gewertet. Die Torschützen und Karten behalten ihre Gültigkeit.</p>
          <p style="margin-bottom: var(--space-md);">Die Strafen sind spätestens 2 Wochen nach Erhalt des Schreibens der Disziplinarkommission auf das in §12 angeführte Konto zu überweisen.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 12 Spielabbruch, Abtreten einer Mannschaft, Protest</h3>
          <p style="margin-bottom: var(--space-md);">Bei einem Spielabbruch entscheidet die Disziplinarkommission auf Grund des Spielberichts und der Zeugeneinvernahmen auf Strafverifizierung bzw. Neuaustragung.</p>
          <p style="margin-bottom: var(--space-md);">Eine Mannschaft verursacht auch dadurch einen Spielabbruch, wenn sie weniger als 7 Spieler auf dem Platz hat.</p>
          <p style="margin-bottom: var(--space-md);">Für die Aufrechterhaltung der Ordnung am Sportplatz sind beide Mannschaften verantwortlich. Bei Zuwiderhandlungen entscheidet die Disziplinarkommission!</p>
          <p style="margin-bottom: var(--space-md);">Vor Spielbeginn sind die verantwortlichen Mannschaftsbetreuer berechtigt, Proteste am Spielbericht zu vermerken. Proteste nach dem Spiel sind innerhalb von 14 Tagen ab dem Spieltag bei der 1. Instanz schriftlich einzureichen. Gleichzeitig ist die Protestgebühr zur Einzahlung zu bringen (Nachweis Zahlungsabschnitt).</p>
          <p style="margin-bottom: var(--space-md);">Zur Behandlung eines Protests können der Schiedsrichter und weitere von beiden Mannschaftsbetreuern namhaft gemachte Zeugen zugezogen werden.<br>
          Entscheidungen trifft in 1. Instanz der Senat I der Disziplinarkommission. Gegen ein schriftlich ergangenes Urteil kann innerhalb von 14 Tagen nach dem Urteil der 1. Instanz (Datum des Poststempels) eine neuerliche Behandlung in 2. Instanz beantragt werden.<br>
          Der Senat II der Disziplinarkommission hat innerhalb von 3 Wochen letztgültig zu entscheiden. Ein weiteres Rechtsmittel ist gegen Erlag von € 100,-- nur bei Entscheidungen betreffend § 13d) möglich.</p>
          <ul style="list-style-type: none; margin-left: var(--space-xl); margin-bottom: var(--space-md);">
            <li>Protestgebühr 1. Instanz € 40,--</li>
            <li>2. Instanz € 80,--</li>
          </ul>
          <p style="margin-bottom: var(--space-md);">Der Betrag ist unter Angabe des Protests auf folgendes Konto einzuzahlen:</p>
          <ul style="list-style-type: none; margin-left: var(--space-xl); margin-bottom: var(--space-md);">
            <li>Empfänger: Angerbauer Michael</li>
            <li>IBAN: AT61 3427 6000 0058 3088</li>
          </ul>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 13 Spielerausschluss, Ausschluss aus der Meisterschaft</h3>
          <p style="margin-bottom: var(--space-md);">Wird ein Spieler mit der roten Karte ausgeschlossen (ausgenommen Torraub), ist bei Matchende der Spielerpass vom Schiedsrichter einzubehalten und mit einem Ausschlussbericht dem Disziplinarobmann zuzusenden. Der ausgeschlossene Spieler bleibt bis zum Entscheid der Disziplinarkommission in Suspension.</p>
          <p style="margin-bottom: var(--space-md);">Nach drei gelben Karten tritt eine automatische Sperre von einem Spiel ein, danach nach zwei weiteren gelben Karten. Nach der 5. gelben Karte erfolgt nach jeder weiteren Verwarnung automatisch ein Spiel Sperre.</p>
          <p style="margin-bottom: var(--space-md);">Bei Torraub und gelb-roter Karte tritt ein Sperre von einem Spiel in Kraft. Der Spielerpass verbleibt bei der Mannschaft.</p>
          <p style="margin-bottom: var(--space-md);">Bei besonders schweren Vergehen und undiszipliniertem Verhalten kann ein Spieler durch die Disziplinarkommission für die Dauer der gesamten Meisterschaft ausgeschlossen werden. Es ist auch eine lebenslange Sperre für DSG-Veranstaltungen möglich.</p>
          <p style="margin-bottom: var(--space-md);">Eine Mannschaft kann aus der laufenden Meisterschaft ausgeschlossen werden:</p>
          <ul style="list-style-type: disc; margin-left: var(--space-xl); margin-bottom: var(--space-md);">
            <li>bei zweimaligem Nichtantreten;</li>
            <li>bei zweimaligem verschuldeten Spielabbruch;</li>
            <li>bei mehrmaligem undisziplinierten Auftreten und Verhalten auf dem Sportplatz (betrifft Mannschaft, Funktionäre und Begleiter);</li>
            <li>bei zweimaligen Verstößen gegen die Meisterschaftsbestimmungen;</li>
            <li>bei zweimaligem Einsatz eines nicht spielberechtigten Spielers;</li>
            <li>bei unentschuldigtem Fernbleiben von den Funktionärsbesprechungen und Meisterschaftsfeiern.</li>
          </ul>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 14 Disziplinarkommission</h3>
          <p style="margin-bottom: var(--space-md);">Nach Ende der Meisterschaft wird für das folgende Spieljahr die Disziplinarkommission neu gewählt.</p>
          <ul style="list-style-type: none; margin-left: var(--space-xl); margin-bottom: var(--space-md);">
            <li>1. Instanz (Senat I): Obmann, 3 Mitglieder und 3 Ersatzmitglieder</li>
            <li>2. Instanz (Senat II): Obmann, 3 Mitglieder und 3 Ersatzmitglieder</li>
          </ul>
          <p style="margin-bottom: var(--space-md);">Verstöße gegen die ÖFB-Spielregeln sowie die DSG-Meisterschaftsbestimmungen – vor, während und nach dem Spiel – werden von der Disziplinarkommission behandelt, die sich an die Satzungen des ÖFB und die DSG-Meisterschaftsbestimmungen hält.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 15 Auf- und Abstiegsregelung</h3>
          <p style="margin-bottom: var(--space-md);">Der Erstplatzierte einer Spielklasse steigt automatisch in die nächsthöhere Klasse auf. Der Letzte muss in die tiefer liegende Klasse absteigen.</p>
          <p style="margin-bottom: var(--space-md);">Der Zweitplatzierte einer Spielklasse spielt um den Aufstieg mit dem Vorletzten der nächsthöheren Klasse. Endet diese Begegnung nach 90 Minuten unentschieden, gibt es eine Verlängerung von zweimal 15 Minuten. Ändert sich auch dann am Resultat "Unentschieden" nichts, so muss solange ein Elfmeterschießen durchgeführt werden, bis eine Entscheidung gefallen ist. Jede Mannschaft stellt anfänglich fünf Schützen. Die Reihenfolge des Elfmeterschießens wird durch das Los ermittelt (lt. ÖFB-Cupbestimmungen).</p>
          <p style="margin-bottom: var(--space-md);">Sollte sich die Anzahl der an der Meisterschaft teilnehmenden Mannschaften ändern wird die Zusammensetzung der Ligen zahlenmäßig so gestaltet, dass eine sinnvolle Organisation des Spielbetriebs möglich ist.</p>
          <p style="margin-bottom: var(--space-md);">Aus der laufenden Meisterschaft ausscheidende Mannschaften werden an die letzte Stelle gereiht.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 16 Fairness-Bewerb-Bestimmungen</h3>
          <p style="margin-bottom: var(--space-md);">Den Fairnesspreis erhält jene Mannschaft, welche am Ende der Meisterschaft die wenigsten Strafpunkte aufweist.</p>
          <p style="margin-bottom: var(--space-sm);"><strong>Strafpunkttarif:</strong></p>
          <ul style="list-style-type: disc; margin-left: var(--space-xl); margin-bottom: var(--space-md);">
            <li>Spielerpässe nicht in Ordnung: 3 Punkte</li>
            <li>Verwarnung: 5 Punkte</li>
            <li>Ausschluss: 10 Punkte</li>
          </ul>
          <p style="margin-bottom: var(--space-md);">Abtreten, Strafverifizierungen, Nichtantreten, Verschulden eines Spielabbruches sowie Einsatz eines nicht spielberechtigten Spielers führen automatisch zum Ausschluss aus dem Fairnessbewerb.<br>
          Die Disziplinarkommission ist berechtigt nach Begründung eine Mannschaft aus dem Fairnessbewerb auszuschließen.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 17 DSG-Meisterschafts-Auslosungstermine</h3>
          <p style="margin-bottom: var(--space-md);">Die DSG-Spielauslosungstermine sind stichhaltig. Die eingeplanten Ersatzspieltermine können nur für Absagen wegen Schlechtwetter in Anspruch genommen werden.</p>

          <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-top: var(--space-xl); margin-bottom: var(--space-sm);">§ 18 DSG-Meisterschaftsende und Preisverteilung</h3>
          <p style="margin-bottom: var(--space-md);">Nach Beendigung der Frühjahrsmeisterschaft erfolgt eine Meisterschaftsabschlussfeier mit Preisverteilung.</p>

          <hr style="margin: var(--space-xl) 0; border: none; border-top: 1px solid rgba(0,0,0,0.1);">
          
          <div style="text-align: right; font-style: italic; color: var(--color-text-secondary);">
            <p style="margin-bottom: var(--space-sm);">Die DSG-Meisterschaftsbestimmungen vom 28. Juni 2018 treten somit außer Kraft.</p>
            <p style="margin-bottom: 4px;">Linz, 29. Juli 2022</p>
            <p style="margin-bottom: 4px;">Für die Ausführung verantwortlich</p>
            <p style="margin-bottom: 4px; font-weight: bold; color: var(--color-primary);">Michael Angerbauer</p>
            <p>Geschäftsführender Obmann</p>
          </div>
        </div>
      </div>
      <style>
        @media (max-width: 768px) {
          .bestimmungen-card { padding: var(--space-md) !important; }
          .bestimmungen-title { 
            font-size: clamp(1.1rem, 5vw, 1.5rem) !important; 
            word-break: break-word; 
            hyphens: auto; 
            line-height: 1.4;
          }
        }
      </style>
    `;
  } else if (id === 'funktionaere') {
    const data = [
      { role: 'Geschäftsführender Obmann', name: 'Angerbauer Michael', phone: '0676/3446101', email: 'dsg.angerbauer@gmx.at' },
      { role: 'Geschäftsführender Obmann Stellvertreter', name: 'Walter-Raab Andreas', phone: '0676/9395275', email: 'andi_walter84@yahoo.de' },
      { role: 'Ligaausschuss', name: 'Habring Philipp', phone: '0680/1512407', email: '' },
      { role: 'Schiedsrichterbesetzung', name: 'Pammer Klaus', phone: '0664/5341585', email: '' },
      { role: 'Disziplinarausschuss 1. Instanz', name: 'Radler Sven', phone: '0664/1006315', email: '' },
      { role: 'Disziplinarausschuss 1. Instanz', name: 'Söllner Bernd', phone: '0664/8155577', email: '' },
      { role: 'Disziplinarausschuss 1. Instanz', name: 'Hartl Michael', phone: '0681/84219244', email: '' },
      { role: 'Disziplinarausschuss 1. Instanz', name: 'Langmayr Albert', phone: '0664/6274268', email: '' },
      { role: 'Disziplinarausschuss 2. Instanz', name: 'Garber Hubert', phone: '0676/6881295', email: '' },
      { role: 'Disziplinarausschuss 2. Instanz', name: 'Hintringer Günter', phone: '0722/721008', email: '' },
      { role: 'Disziplinarausschuss 2. Instanz', name: 'Angerbauer Michael', phone: '0676/3446101', email: '' }
    ];

    const rows = data.map(person => `
      <div class="contact-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-sm); padding: var(--space-sm) 0; border-bottom: 1px solid rgba(0,0,0,0.05); align-items: center;">
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: 700; font-size: 1.1rem;">${person.name}</span>
          <span style="color: var(--color-text-secondary); font-size: 0.9rem;">${person.role}</span>
        </div>
        <div>
          ${person.phone ? `<a href="tel:${person.phone.replace(/[ /]/g, '')}" class="primary-btn" style="padding: 4px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${person.phone}</a>` : ''}
        </div>
        <div>
          ${person.email ? `<a href="mailto:${person.email}" class="primary-btn" style="padding: 4px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px; background: var(--color-text-primary); color: var(--color-bg);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Email</a>` : ''}
        </div>
      </div>
    `).join('');

    return `
      <div class="glass-card" style="background: rgba(255,255,255,0.5); padding: var(--space-lg);">
        <div class="contact-header" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-sm); border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: var(--space-xs); margin-bottom: var(--space-sm); font-weight: 700; color: var(--color-accent);">
          <span>Name / Funktion</span>
          <span>Telefon</span>
          <span>Email</span>
        </div>
        ${rows}
      </div>
      <style>
        @media (max-width: 768px) {
          .contact-row {
            display: flex !important;
            flex-direction: column;
            align-items: flex-start !important;
            gap: var(--space-xs) !important;
            padding: var(--space-md) 0 !important;
          }
          .contact-header { display: none !important; }
        }
      </style>
    `;
  } else if (id === 'sportplaetze') {
    const data = [
      { name: 'DSG Platz', address: 'Landwiedstraße 3b, 4020 Linz, Österreich' },
      { name: 'DSG Traun', address: 'Schloßstraße 50, 4050 Traun, Österreich' },
      { name: 'Magistratsplatz', address: 'Semmelweisstraße 29, 4020 Linz, Österreich' },
      { name: 'FC Hinzenbach', address: 'Wörth 77, 4070 Eferding, Österreich' },
      { name: 'Union Heiligenberg', address: 'Sportplatz Heiligenberg, 4733 Heiligenberg, Österreich' },
      { name: 'Union Eschenau', address: 'Eschenau im Hausruckkreis 22, 4724 Eschenau im Hausruckkreis, Österreich' }
    ];

    const rows = data.map(place => `
      <div class="glass-card sportplatz-card" style="background: rgba(255,255,255,0.5); margin-bottom: var(--space-md); padding: var(--space-lg); display: flex; justify-content: space-between; align-items: center; gap: var(--space-md);">
        <div style="display: flex; flex-direction: column;">
          <h3 style="color: var(--color-primary); font-size: 1.3rem; font-weight: 800; margin-bottom: var(--space-xs);">${place.name}</h3>
          <p style="color: var(--color-text-secondary); font-size: 1rem; margin: 0;">${place.address}</p>
        </div>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}" target="_blank" class="primary-btn" style="padding: 6px 20px; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Auf Google Maps öffnen
        </a>
      </div>
    `).join('');

    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
        ${rows}
      </div>
      <style>
        @media (max-width: 768px) {
          .sportplatz-card {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }
      </style>
    `;
  } else if (id === 'betreuer') {
    const data = [
      { role: 'DSG St. Josef-Oed FC', name: 'Hubmair Oliver', phone: '0676/7151805', email: 'hubmaier.oliver@gmail.com' },
      { role: 'DSG St. Josef-Oed FC', name: 'Woschitz Stefan', phone: '0676/3676361', email: 'woschitz@austrocard.at' },
      { role: 'DSG Union Traun', name: 'Matanovic Ninoslav', phone: '0660/5696093', email: '' },
      { role: 'DSG Union Traun', name: 'Bauer Christopher', phone: '0664/2476475', email: 'christopher.bauer16@gmail.com' },
      { role: 'FC Gornjak', name: 'Radisavljevic Marko', phone: '0660/70464960', email: 'rdsvc.marko@gmail.com' },
      { role: 'FC Gornjak', name: 'Andjelkovic Darko', phone: '0676/5905044', email: 'andjelkovic89@gmail.com' },
      { role: 'FC Hinzenbach', name: 'Meindlhumer Rainer', phone: '0650/8832828', email: 'r.meindlhumer@gmail.com' },
      { role: 'FC Hinzenbach', name: 'Meindlhumer Roland', phone: '0677/63816143', email: 'roland.meindlhumer@gmx.at' },
      { role: 'SV Croatia Linz', name: 'Milic Manuel', phone: '0650/3465177', email: 'svcroatialinz@gmail.com' },
      { role: 'SV Croatia Linz', name: 'Zuljevic Ante', phone: '0660/6444765', email: 'svcroatialinz@gmail.com' },
      { role: 'Union Eschenau', name: 'Dornetshuber Michael', phone: '0664/4503487', email: 'mike.dornetshuber@gmx.at' },
      { role: 'Union Eschenau', name: 'Haslehner Markus', phone: '0664/3963404', email: 'markus.haslehner@ooe.gv.at' },
      { role: 'Union Heiligenberg', name: 'Haslehner Michael', phone: '0676/840314425', email: '' },
      { role: 'Union Heiligenberg', name: 'Freilinger Sebastian', phone: '0676/5224373', email: '' },
      { role: 'Walker FC', name: 'Gillmayr Thomas', phone: '0676/7895569', email: 'thomas.gillmayr@gmx.at' },
      { role: 'Walker FC', name: 'Zerenko Rainer', phone: '0664/88252275', email: 'Rainer.zerenko@gmx.at' }
    ];

    const rows = data.map(person => `
      <div class="contact-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-sm); padding: var(--space-sm) 0; border-bottom: 1px solid rgba(0,0,0,0.05); align-items: center;">
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: 700; font-size: 1.1rem;">${person.name}</span>
          <span style="color: var(--color-text-secondary); font-size: 0.9rem;">${person.role}</span>
        </div>
        <div>
          ${person.phone ? `<a href="tel:${person.phone.replace(/[ /]/g, '')}" class="primary-btn" style="padding: 4px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${person.phone}</a>` : ''}
        </div>
        <div>
          ${person.email ? `<a href="mailto:${person.email}" class="primary-btn" style="padding: 4px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px; background: var(--color-text-primary); color: var(--color-bg);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Email</a>` : ''}
        </div>
      </div>
    `).join('');

    return `
      <div class="glass-card" style="background: rgba(255,255,255,0.5); padding: var(--space-lg);">
        <div class="contact-header" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-sm); border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: var(--space-xs); margin-bottom: var(--space-sm); font-weight: 700; color: var(--color-accent);">
          <span>Name / Mannschaft</span>
          <span>Telefon</span>
          <span>Email</span>
        </div>
        ${rows}
      </div>
      <style>
        @media (max-width: 768px) {
          .contact-row {
            display: flex !important;
            flex-direction: column;
            align-items: flex-start !important;
            gap: var(--space-xs) !important;
            padding: var(--space-md) 0 !important;
          }
          .contact-header { display: none !important; }
        }
      </style>
    `;
  } else {
    // Mock Table Data for Mannschaften, etc.
    return `
      <div class="glass-card" style="background: rgba(255,255,255,0.5); padding: var(--space-lg);">
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: var(--space-sm); border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: var(--space-xs); margin-bottom: var(--space-sm); font-weight: 700; color: var(--color-accent);">
          <span>Name / Bezeichnung</span>
          <span>Details / Kontakt</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: var(--space-sm); padding: var(--space-xs) 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
          <span style="font-weight: 500;">Noch keine Daten vorhanden</span>
          <span style="color: var(--color-text-secondary);">-</span>
        </div>
      </div>
    `;
  }
};

export const viewOrganisation = () => {
  if (!currentSection) {
    const cardsHTML = orgSections.map((section, index) => {
      const colSpan = index < 2 ? 3 : 2;
      return `
      <div class="glass-card org-card hover-lift stagger-item" data-id="${section.id}" style="grid-column: span ${colSpan}; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-xl); transition: transform 0.3s ease, box-shadow 0.3s ease; height: 100%; min-height: 220px;">
        <div style="color: var(--color-accent); margin-bottom: var(--space-md); transition: transform 0.3s ease;" class="icon-wrapper">
          ${section.icon}
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary);">${section.title}</h3>
      </div>
    `}).join('');

    return `
      <div class="container" style="padding-top: var(--space-xl);">
        <h1 class="stagger-item" style="margin-bottom: var(--space-xl); text-align: left;">DSG <span class="accent-text">ORGANISATION</span></h1>
        
        <div class="org-grid bento-box" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--space-lg);">
          ${cardsHTML}
        </div>
      </div>
      <style>
        @media (max-width: 900px) { 
          .bento-box { grid-template-columns: repeat(2, 1fr) !important; } 
          .bento-box > div { grid-column: span 1 !important; }
        }
        @media (max-width: 600px) { 
          .bento-box { grid-template-columns: 1fr !important; } 
        }
        .org-card { transition: all 0.3s ease; }
        .org-card:hover { transform: scale(1.05); box-shadow: 0 0 20px var(--color-accent-glow); border-color: var(--color-accent); }
      </style>
    `;
  } else {
    const section = orgSections.find(s => s.id === currentSection);
    return `
      <div class="container" style="padding-top: var(--space-xl); animation: fadeIn 0.3s ease;">
        <div class="glass-card detail-view" style="position: relative; padding: var(--space-xl); background: rgba(255, 255, 255, 0.8); box-shadow: var(--glass-shadow); min-height: 60vh;">
          <button id="close-org-detail" style="position: absolute; top: var(--space-md); right: var(--space-md); background: none; border: none; color: var(--color-text-secondary); font-size: 2rem; cursor: pointer; transition: color 0.2s;">&times;</button>
          
          <div class="detail-header" style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-xl);">
            <div style="color: var(--color-accent);">${section.icon}</div>
            <h1 class="detail-title" style="font-size: 2rem;">${section.title}</h1>
          </div>
          
          <div class="content-area">
            ${renderContent(section.id)}
          </div>
        </div>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        #close-org-detail:hover { color: var(--color-accent) !important; }
        .file-row:hover { background: rgba(0, 153, 56, 0.1) !important; border-color: var(--color-accent); }
        @media (max-width: 768px) {
          .detail-view { padding: var(--space-md) !important; }
          .detail-title { 
            font-size: clamp(1.2rem, 6vw, 1.5rem) !important; 
            word-break: break-word; 
            hyphens: auto;
            line-height: 1.3;
          }
          .detail-header { margin-bottom: var(--space-md) !important; }
        }
      </style>
    `;
  }
};

export const bindOrganisation = () => {
  if (!currentSection) {
    document.querySelectorAll('.org-card').forEach(card => {
      card.addEventListener('click', (e) => {
        currentSection = e.currentTarget.getAttribute('data-id');
        import('../router.js').then(module => module.Router.handleRoute());
      });
    });
  } else {
    const closeBtn = document.getElementById('close-org-detail');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        currentSection = null;
        import('../router.js').then(module => module.Router.handleRoute());
      });
    }
  }
};
