const INITIAL_DATA = {
  news: [
    {
      id: 1,
      title: "SV Croatia Linz sichert sich den Meistertitel der DSG Liga 2025/26",
      date: "2026-06-15",
      author: "Michael Angerbauer",
      excerpt: "SV Croatia Linz beendet die Saison als Tabellenerster und feiert den verdienten Meistertitel."
    },
    {
      id: 2,
      title: "Meisterentscheidung am DSG Platz am 12. Juni 2026",
      date: "2026-06-12",
      author: "Michael Angerbauer",
      excerpt: "Am DSG Platz in Linz fiel am 12. Juni die endgÃ¼ltige Entscheidung Ã¼ber die diesjÃ¤hrige Meisterschaft."
    },
    {
      id: 3,
      title: "Saisonabschluss bei sommerlichen Temperaturen",
      date: "2026-06-08",
      author: "Michael Angerbauer",
      excerpt: "Das entscheidende Meisterschaftsspiel am 8. Juni war von hohen Temperaturen geprÃ¤gt, beide Teams zeigten vollen Einsatz."
    },
    {
      id: 4,
      title: "Viele Tore und Verschiebungen in der Tabelle in Runde 13",
      date: "2026-06-01",
      author: "Michael Angerbauer",
      excerpt: "In der 13. Runde der DSG Liga fielen zahlreiche Tore, was zu wichtigen VerÃ¤nderungen in der Gesamttabelle fÃ¼hrte."
    }
  ],
  currentSeason: "2026/2027",
  seasons: {
    "2025/2026": {
      teams: [
        { id: 1, name: "SV Croatia Linz", played: 14, won: 11, drawn: 2, lost: 1, gf: 40, ga: 12, points: 35 },
        { id: 2, name: "DSG Union", played: 14, won: 10, drawn: 3, lost: 1, gf: 35, ga: 10, points: 33 },
        { id: 3, name: "FC Dynamo", played: 14, won: 8, drawn: 4, lost: 2, gf: 28, ga: 18, points: 28 },
        { id: 4, name: "Athletik Club", played: 14, won: 6, drawn: 2, lost: 6, gf: 20, ga: 22, points: 20 }
      ],
      matches: [],
      stats: {
        topScorers: [
          { name: "Lukas M.", team: "SV Croatia Linz", goals: 18 },
          { name: "Felix K.", team: "DSG Union", goals: 15 }
        ],
        cards: []
      }
    },
    "2026/2027": {
      teams: [],
      matches: [],
      stats: {
        topScorers: [],
        cards: []
      }
    }
  },
  gallery: [
    {
      id: 'meisterfeier-2026',
      title: 'Meisterfeier 2026',
      date: '12. Juni 2026',
      excerpt: 'Feierlicher FuÃŸballabend am DSG Platz mit Ehrung des neuen Meisters SV Croatia Linz.',
      image: 'stadion.png',
      images: [
        { url: 'stadion.png', title: 'Meisterfeier 2026' }
      ]
    }
  ]
};

import { db } from './firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let memoryData = null;
let memoryNews = [];
let memoryGallery = [];

function trySetLocal(key, dataStr) {
  try {
    localStorage.setItem(key, dataStr);
  } catch (e) {
    console.warn("localStorage quota exceeded. Attempting to clear old caches...", e);
    try {
      for (let i = 1; i < 16; i++) {
        localStorage.removeItem(`dsg_data_v${i}`);
        localStorage.removeItem(`dsg_articles_v${i}`);
        localStorage.removeItem(`dsg_gallery_v${i}`);
      }
      localStorage.setItem(key, dataStr);
    } catch(err) {
      console.error("Still exceeded after cleanup:", err);
    }
  }
}

const loadLocal = (prefix, maxVer) => {
  for (let i = maxVer; i >= 1; i--) {
    const data = JSON.parse(localStorage.getItem(`${prefix}_v${i}`));
    if (data && (!Array.isArray(data) || data.length > 0)) {
      return data;
    }
  }
  return null;
};

export const Store = {
  init() {
    // Eagerly load local memory so the app doesn't block on network
    memoryData = loadLocal('dsg_data', 35) || INITIAL_DATA;
    memoryNews = loadLocal('dsg_articles', 18) || INITIAL_DATA.news || [];
    memoryGallery = loadLocal('dsg_gallery', 18) || INITIAL_DATA.gallery || [];

    // Trigger Firebase sync in the background
    this.syncFirebase();
  },

  async syncFirebase() {
    const dataRef = doc(db, 'system', 'liga_data');
    const newsRef = doc(db, 'system', 'news_data');
    const galleryRef = doc(db, 'system', 'gallery_data');

    try {
      const [dataSnap, newsSnap, gallerySnap] = await Promise.all([
        getDoc(dataRef), getDoc(newsRef), getDoc(galleryRef)
      ]);

      let needsMigration = false;
      let hasUpdates = false;

      // Sync Data
      if (dataSnap.exists() && dataSnap.data().data) {
        const fbData = dataSnap.data().data;
        const localData = loadLocal('dsg_data', 35);
        if (localData && localData.lastUpdated && (!fbData.lastUpdated || localData.lastUpdated > fbData.lastUpdated)) {
          memoryData = localData;
          needsMigration = true;
        } else {
          memoryData = fbData;
          hasUpdates = true;
        }
      } else {
        let legacyData = loadLocal('dsg_data', 35);
        if (!legacyData) legacyData = INITIAL_DATA;
        memoryData = legacyData;
        needsMigration = true;
      }

      // Sync News
      if (newsSnap.exists() && newsSnap.data().data) {
        const fbNews = newsSnap.data().data;
        const localNews = loadLocal('dsg_articles', 17) || INITIAL_DATA.news || [];
        if (localNews.length > fbNews.length) {
          memoryNews = localNews;
          needsMigration = true;
        } else {
          memoryNews = fbNews;
          hasUpdates = true;
        }
      } else {
        memoryNews = loadLocal('dsg_articles', 17) || INITIAL_DATA.news || [];
        needsMigration = true;
      }

      // Sync Gallery
      if (gallerySnap.exists() && gallerySnap.data().data) {
        const fbGallery = gallerySnap.data().data;
        const localGallery = loadLocal('dsg_gallery', 17) || INITIAL_DATA.gallery || [];
        const memTime = fbGallery[0]?.lastUpdated || 0;
        const locTime = localGallery[0]?.lastUpdated || 0;
        if (localGallery.length > fbGallery.length || locTime > memTime) {
          memoryGallery = localGallery;
          needsMigration = true;
        } else {
          memoryGallery = fbGallery;
          hasUpdates = true;
        }
      } else {
        memoryGallery = loadLocal('dsg_gallery', 17) || INITIAL_DATA.gallery || [];
        needsMigration = true;
      }

                              // START ONE-TIME MIGRATION FOR R4
if (memoryData.seasons && memoryData.seasons["2026/2027"]) {
    let season = memoryData.seasons["2026/2027"];
    let realEvents = [
        {
            home: "DSG Union Traun",
            away: "FC Gornjak",
            status: "Played",
            score: "8:2",
            ht: "4:1",
            events: [
                { type: "goal", name: "Dominik Prilmüller", team: "DSG Union Traun" },
                { type: "goal", name: "Dominik Prilmüller", team: "DSG Union Traun" },
                { type: "goal", name: "Dominik Prilmüller", team: "DSG Union Traun" },
                { type: "goal", name: "Ioan Gafincu", team: "DSG Union Traun" },
                { type: "goal", name: "Ioan Gafincu", team: "DSG Union Traun" },
                { type: "goal", name: "Taher Akbar", team: "DSG Union Traun" },
                { type: "goal", name: "Lukas Wahl", team: "DSG Union Traun" },
                { type: "goal", name: "Michael Mayr", team: "DSG Union Traun" },
                { type: "yellow", name: "Taher Akbar", team: "DSG Union Traun" },
                { type: "yellow", name: "Ninoslav Matanovic", team: "DSG Union Traun" },
                { type: "yellow", name: "Süleyman Targil", team: "DSG Union Traun" },
                { type: "goal", name: "Ilija Stojchovski", team: "FC Gornjak" },
                { type: "yellow", name: "Vladica Petrovic", team: "FC Gornjak" },
                { type: "yellow", name: "Sani Stancic", team: "FC Gornjak" }
            ]
        }
    ];

    realEvents.forEach(re => {
        let match = season.matches.find(m => m.home === re.home && m.away === re.away);
        if (match) {
            match.status = re.status;
            match.score = re.score;
            match.ht = re.ht;
            match.events = re.events;
            match.events.forEach(e => { e.player = e.name; }); 
            match.scorers = match.events.filter(e => e.type === "goal");
            match.cards = match.events.filter(e => e.type === "yellow" || e.type === "red" || e.type === "yellowRed");
        }
    });
    
    season.teams.forEach(t => {
        t.played = 0; t.won = 0; t.drawn = 0; t.lost = 0; t.gf = 0; t.ga = 0; t.points = 0;
    });
    season.stats.topScorers = [];
    season.stats.cards = [];
    
    season.matches.forEach(m => {
        if (m.status !== "Played" && m.status !== "Abgesagt 3:0" && m.status !== "Abgesagt 0:3") return;
        let homeTeam = season.teams.find(t => t.name === m.home);
        let awayTeam = season.teams.find(t => t.name === m.away);
        if (!homeTeam || !awayTeam) return;
        
        let hg = 0, ag = 0;
        if (m.status === "Abgesagt 3:0") { hg = 3; ag = 0; }
        else if (m.status === "Abgesagt 0:3") { hg = 0; ag = 3; }
        else if (m.score) {
            let pts = m.score.split(':');
            if (pts.length === 2) {
                hg = parseInt(pts[0].trim());
                ag = parseInt(pts[1].trim());
            }
        }
        
        homeTeam.played++; awayTeam.played++;
        homeTeam.gf += hg; homeTeam.ga += ag;
        awayTeam.gf += ag; awayTeam.ga += hg;
        
        if (hg > ag) { homeTeam.won++; homeTeam.points += 3; awayTeam.lost++; }
        else if (ag > hg) { awayTeam.won++; awayTeam.points += 3; homeTeam.lost++; }
        else { homeTeam.drawn++; awayTeam.drawn++; homeTeam.points += 1; awayTeam.points += 1; }
        
        if (m.scorers) {
            m.scorers.forEach(s => {
                let obj = season.stats.topScorers.find(ts => ts.name === s.name && ts.team === s.team);
                if (!obj) { obj = { name: s.name, team: s.team, goals: 0 }; season.stats.topScorers.push(obj); }
                obj.goals++;
            });
        }
        if (m.cards) {
            m.cards.forEach(c => {
                let obj = season.stats.cards.find(tc => tc.name === c.name && tc.team === c.team);
                if (!obj) { obj = { name: c.name, team: c.team, yellow: 0, yellowRed: 0, red: 0 }; season.stats.cards.push(obj); }
                if (c.type === "yellow") obj.yellow++;
                if (c.type === "yellowRed") obj.yellowRed++;
                if (c.type === "red") obj.red++;
            });
        }
    });
    
    season.stats.topScorers.sort((a,b) => b.goals - a.goals);
    
    memoryData.lastUpdated = Date.now();
    needsMigration = true;
}
// END ONE-TIME MIGRATION FOR R4

        // --- HARDCODED HISTORICAL DATA ---
      if (!memoryData.seasons) memoryData.seasons = {};
      
      try {
        const res = await fetch('data/liga.json');
        if (res.ok) {
          const originalData = await res.json();
          memoryData.seasons["2025/2026"] = {
            teams: originalData.teams || [],
            matches: originalData.matches || [],
            stats: originalData.stats || { topScorers: [], cards: [] }
          };
        }
      } catch(e) {
        console.log("Could not fetch liga.json for 2025/2026 history:", e);
      }

      if (!memoryData.seasons["2025/2026"] || !memoryData.seasons["2025/2026"].teams) {
          memoryData.seasons["2025/2026"] = INITIAL_DATA.seasons["2025/2026"];
      }

      for (let s in INITIAL_DATA.seasons) {
        if (s === "2025/2026") continue;
        if (!memoryData.seasons[s]) {
          memoryData.seasons[s] = INITIAL_DATA.seasons[s];
          needsMigration = true;
        }
        if (!memoryData.seasons[s].stats) {
          memoryData.seasons[s].stats = { topScorers: [], cards: [] };
          needsMigration = true;
        }
      }



      if (memoryData.teams) { delete memoryData.teams; needsMigration = true; }
      if (memoryData.matches) { delete memoryData.matches; needsMigration = true; }
      if (memoryData.stats) { delete memoryData.stats; needsMigration = true; }

      memoryNews.forEach(article => {
        if (!article.image) {
          article.image = 'dsg.avif';
          needsMigration = true;
        }
      });

      if (needsMigration) {
        const fbSaveData = JSON.parse(JSON.stringify(memoryData));
        if (fbSaveData.seasons && fbSaveData.seasons["2025/2026"]) {
          delete fbSaveData.seasons["2025/2026"];
        }
        await setDoc(dataRef, { data: fbSaveData }).catch(e => console.error("Firebase save error (data):", e));
        await setDoc(newsRef, { data: memoryNews }).catch(e => console.error("Firebase save error (news):", e));
        await setDoc(galleryRef, { data: memoryGallery }).catch(e => console.error("Firebase save error (gallery):", e));
      }
        
      trySetLocal('dsg_data_v35', JSON.stringify(memoryData));
      trySetLocal('dsg_articles_v18', JSON.stringify(memoryNews));
      trySetLocal('dsg_gallery_v18', JSON.stringify(memoryGallery));
      console.log("Migrated local data to Firebase.");

      if (hasUpdates) {
        window.dispatchEvent(new Event('data-updated'));
      }
    } catch(e) {
      console.error("Firebase sync failed or timed out. Relying on local cache.", e);
    }
  },
  
  getData() {
    return memoryData;
  },
  
  saveData(data) {
    data.lastUpdated = Date.now();
    memoryData = data;
    trySetLocal('dsg_data_v35', JSON.stringify(data));
    
    const fbSaveData = JSON.parse(JSON.stringify(data));
    if (fbSaveData.seasons && fbSaveData.seasons["2025/2026"]) {
      delete fbSaveData.seasons["2025/2026"];
    }
    setDoc(doc(db, 'system', 'liga_data'), { data: fbSaveData }).catch(e => console.error("Firebase save error:", e));
  },

  getNews() {
    return memoryNews;
  },
  
  getArticle(id) {
    return this.getNews().find(a => String(a.id) === String(id));
  },

  deleteArticle(id) {
    memoryNews = memoryNews.filter(a => String(a.id) !== String(id));
    trySetLocal('dsg_articles_v18', JSON.stringify(memoryNews));
    setDoc(doc(db, 'system', 'news_data'), { data: memoryNews }).catch(e => console.error("Firebase save error:", e));
  },
  
  addNews(title, excerpt, content, image, gallery) {
    const newId = title.toLowerCase().replace(/\s+/g, '-');
    memoryNews.unshift({
      id: newId,
      title,
      content: content || `<p>${excerpt}</p>`,
      author: "Admin",
      readTime: "2 min read",
      image: image || 'dsg.avif',
      gallery: gallery || [],
      date: new Date().toISOString().split('T')[0]
    });
    trySetLocal('dsg_articles_v18', JSON.stringify(memoryNews));
    setDoc(doc(db, 'system', 'news_data'), { data: memoryNews }).catch(e => console.error("Firebase save error:", e));
  },

  getLiga(seasonId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    if (!data.seasons || !data.seasons[sid] || !data.seasons[sid].teams) return [];
    const teams = [...data.seasons[sid].teams];
    return teams.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
  },
  
  getStats(seasonId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    if (!data.seasons || !data.seasons[sid] || !data.seasons[sid].stats) return { topScorers: [], cards: [] };
    return data.seasons[sid].stats;
  },

  getMatches(seasonId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    if (!data.seasons || !data.seasons[sid] || !data.seasons[sid].matches) return [];
    return data.seasons[sid].matches;
  },

  getMatch(seasonId, matchId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    if (!data.seasons || !data.seasons[sid] || !data.seasons[sid].matches) return null;
    return (data.seasons[sid].matches || []).find(m => String(m.id) === String(matchId));
  },

  getPlayers() {
    return this.getData().players || [];
  },

  saveMatch(seasonId, matchData) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    
    // Reverse previous match stats if editing
    if (matchData.id) {
      this._reverseMatchStats(data, sid, matchData.id);
    } else {
      matchData.id = Date.now().toString();
    }

    // Process new match stats
    this._applyMatchStats(data, sid, matchData);
    
    // Update players autocomplete list
    const newPlayers = new Set(data.players || []);
    (matchData.scorers || []).forEach(s => newPlayers.add(s.name.trim()));
    (matchData.cards || []).forEach(c => newPlayers.add(c.name.trim()));
    data.players = Array.from(newPlayers).filter(n => n.length > 0);

    // Save match
    const matches = data.seasons[sid].matches;
    const existingIndex = matches.findIndex(m => String(m.id) === String(matchData.id));
    if (existingIndex > -1) {
      matches[existingIndex] = matchData;
    } else {
      matches.push(matchData);
    }
    
    // Sort matches by date then round loosely
    matches.sort((a, b) => {
      const parseDate = (d) => {
        if (!d) return 0;
        const p = d.split('.');
        if (p.length === 3) return new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime();
        return new Date(d).getTime() || 0;
      };
      return parseDate(b.date) - parseDate(a.date);
    });

    this.saveData(data);
  },

  deleteMatch(seasonId, matchId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    this._reverseMatchStats(data, sid, matchId);
    data.seasons[sid].matches = data.seasons[sid].matches.filter(m => String(m.id) !== String(matchId));
    this.saveData(data);
  },

  _reverseMatchStats(data, sid, matchId) {
    const match = data.seasons[sid].matches.find(m => String(m.id) === String(matchId));
    if (!match) return;

    // Reverse Team Points
    if (match.status === 'Played' || match.status === 'Walkover' || match.status === 'Abgesagt 3:0' || match.status === 'Abgesagt 0:3' || !match.status) { // legacy matches might not have status
      const teamA = data.seasons[sid].teams.find(t => t.name === match.home);
      const teamB = data.seasons[sid].teams.find(t => t.name === match.away);
      
      let goalsA = 0;
      let goalsB = 0;
      let validScore = false;

      if (match.status === 'Abgesagt 3:0') {
        goalsA = 3; goalsB = 0; validScore = true;
      } else if (match.status === 'Abgesagt 0:3') {
        goalsA = 0; goalsB = 3; validScore = true;
      } else {
        let scoreStr = match.score || "";
        if (scoreStr.includes(':')) {
          let parts = scoreStr.split(' ')[0].replace('*', '').split(':');
          goalsA = parseInt(parts[0]);
          goalsB = parseInt(parts[1]);
          validScore = true;
        }
      }
      
      if (validScore && !isNaN(goalsA) && !isNaN(goalsB) && teamA && teamB) {
        teamA.played--; teamB.played--;
        teamA.gf -= goalsA; teamA.ga -= goalsB;
        teamB.gf -= goalsB; teamB.ga -= goalsA;

        if (goalsA > goalsB) { teamA.won--; teamA.points -= 3; teamB.lost--; }
        else if (goalsA < goalsB) { teamB.won--; teamB.points -= 3; teamA.lost--; }
        else { teamA.drawn--; teamB.drawn--; teamA.points--; teamB.points--; }
      }
    }

    // Reverse Scorers
    if (match.scorers) {
      if (!data.seasons[sid].stats.topScorers) data.seasons[sid].stats.topScorers = [];
      match.scorers.forEach(s => {
        const statsObj = data.seasons[sid].stats.topScorers.find(ts => ts.name === s.name && ts.team === s.team);
        if (statsObj) statsObj.goals--;
      });
      data.seasons[sid].stats.topScorers = data.seasons[sid].stats.topScorers.filter(ts => ts.goals > 0);
    }

    // Reverse Cards
    if (match.cards) {
      match.cards.forEach(c => {
        if (!data.seasons[sid].stats.cards) data.seasons[sid].stats.cards = [];
        const cObj = data.seasons[sid].stats.cards.find(ts => ts.name === c.name && ts.team === c.team);
        if (cObj) {
          if (c.type === 'yellow') cObj.yellow--;
          if (c.type === 'yellowRed') cObj.yellowRed--;
          if (c.type === 'red') cObj.red--;
        }
      });
      data.seasons[sid].stats.cards = data.seasons[sid].stats.cards.filter(ts => ts.yellow > 0 || ts.yellowRed > 0 || ts.red > 0);
    }
  },

  _applyMatchStats(data, sid, match) {
    // Apply Team Points
    if (match.status === 'Played' || match.status === 'Walkover' || match.status === 'Abgesagt 3:0' || match.status === 'Abgesagt 0:3') {
      const teamA = data.seasons[sid].teams.find(t => t.name === match.home);
      const teamB = data.seasons[sid].teams.find(t => t.name === match.away);
      
      let goalsA = 0;
      let goalsB = 0;

      if (match.status === 'Abgesagt 3:0') {
        goalsA = 3; goalsB = 0;
      } else if (match.status === 'Abgesagt 0:3') {
        goalsA = 0; goalsB = 3;
      } else {
        let parts = (match.score || "0:0").split(' ')[0].replace('*', '').split(':');
        goalsA = parseInt(parts[0]) || 0;
        goalsB = parseInt(parts[1]) || 0;
      }
      
      if (!isNaN(goalsA) && !isNaN(goalsB) && teamA && teamB) {
        teamA.played++; teamB.played++;
        teamA.gf += goalsA; teamA.ga += goalsB;
        teamB.gf += goalsB; teamB.ga += goalsA;

        if (goalsA > goalsB) { teamA.won++; teamA.points += 3; teamB.lost++; }
        else if (goalsA < goalsB) { teamB.won++; teamB.points += 3; teamA.lost++; }
        else { teamA.drawn++; teamB.drawn++; teamA.points++; teamB.points++; }
      }
    }

    // Apply Scorers
    if (match.scorers) {
      match.scorers.forEach(s => {
        let statsObj = data.seasons[sid].stats.topScorers.find(ts => ts.name === s.name && ts.team === s.team);
        if (!statsObj) {
          statsObj = { name: s.name, team: s.team, goals: 0 };
          data.seasons[sid].stats.topScorers.push(statsObj);
        }
        statsObj.goals++;
      });
      data.seasons[sid].stats.topScorers.sort((a, b) => b.goals - a.goals);
    }

    // Apply Cards
    if (match.cards) {
      if (!data.seasons[sid].stats.cards) data.seasons[sid].stats.cards = [];
      match.cards.forEach(c => {
        let cObj = data.seasons[sid].stats.cards.find(ts => ts.name === c.name && ts.team === c.team);
        if (!cObj) {
          cObj = { name: c.name, team: c.team, yellow: 0, yellowRed: 0, red: 0, suspension: "" };
          data.seasons[sid].stats.cards.push(cObj);
        }
        if (c.type === 'yellow') cObj.yellow++;
        if (c.type === 'yellowRed') cObj.yellowRed++;
        if (c.type === 'red') cObj.red++;
      });
    }
  },

  getGallery() {
    return memoryGallery;
  },

  getAlbum(id) {
    return this.getGallery().find(a => String(a.id) === String(id));
  },

  deleteAlbum(id) {
    memoryGallery = memoryGallery.filter(a => String(a.id) !== String(id));
    trySetLocal('dsg_gallery_v18', JSON.stringify(memoryGallery));
    setDoc(doc(db, 'system', 'gallery_data'), { data: memoryGallery }).catch(e => console.error("Firebase save error:", e));
  },

  addAlbum(title, date, excerpt, coverImage, imagesArray) {
    const newId = title.toLowerCase().replace(/\s+/g, '-');
    memoryGallery.unshift({ id: newId, title, date, excerpt, image: coverImage, images: imagesArray });
    trySetLocal('dsg_gallery_v18', JSON.stringify(memoryGallery));
    setDoc(doc(db, 'system', 'gallery_data'), { data: memoryGallery }).catch(e => console.error("Firebase save error:", e));
  },

  updateAlbum(id, title, date, excerpt, coverImage, imagesArray) {
    const index = memoryGallery.findIndex(a => String(a.id) === String(id));
    if (index !== -1) {
      memoryGallery[index] = { id, title, date, excerpt, image: coverImage, images: imagesArray };
      trySetLocal('dsg_gallery_v18', JSON.stringify(memoryGallery));
      setDoc(doc(db, 'system', 'gallery_data'), { data: memoryGallery }).catch(e => console.error("Firebase save error:", e));
    }
  }
};
















