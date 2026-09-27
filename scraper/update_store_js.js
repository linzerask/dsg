const fs = require('fs');
const path = require('path');

const ligaJsonPath = path.resolve(__dirname, '../Website/data/liga.json');
const articlesJsonPath = path.resolve(__dirname, '../Website/data/articles.json');
const leaguesJsonPath = path.resolve(__dirname, '../Website/data/leagues.json');
const storeJsPath = path.resolve(__dirname, '../Website/js/store.js');

const ligaData = JSON.parse(fs.readFileSync(ligaJsonPath, 'utf-8'));
const articlesData = JSON.parse(fs.readFileSync(articlesJsonPath, 'utf-8'));
const leaguesData = JSON.parse(fs.readFileSync(leaguesJsonPath, 'utf-8'));

// Build INITIAL_DATA
const initialData = {
    news: articlesData,
    currentSeason: "2025/2026",
    players: ligaData.players || [],
    seasons: ligaData.seasons,
    gallery: [
        {
            id: 'meisterfeier-2026',
            title: 'Meisterfeier 2026',
            date: '12. Juni 2026',
            excerpt: 'Feierlicher Fußballabend am DSG Platz mit Ehrung des neuen Meisters SV Croatia Linz.',
            image: 'stadion.png',
            images: [
                { url: 'stadion.png', title: 'Meisterfeier 2026' }
            ]
        }
    ]
};

const storeTemplate = `const INITIAL_DATA = ${JSON.stringify(initialData, null, 2)};

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
      for (let i = 1; i <= 60; i++) {
        localStorage.removeItem(\`dsg_data_v\${i}\`);
        localStorage.removeItem(\`dsg_articles_v\${i}\`);
        localStorage.removeItem(\`dsg_gallery_v\${i}\`);
      }
      localStorage.setItem(key, dataStr);
    } catch(err) {
      console.error("Still exceeded after cleanup:", err);
    }
  }
}

const loadLocal = (prefix, exactVer) => {
  try {
    const raw = localStorage.getItem(\`\${prefix}_v\${exactVer}\`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && (!Array.isArray(data) || data.length > 0)) {
      return data;
    }
  } catch (e) {}
  return null;
};

export const Store = {
  init() {
    // Clear all obsolete cache versions to prevent old corrupt/timestamp data
    try {
      for (let i = 1; i <= 60; i++) {
        if (i !== 50) localStorage.removeItem(\`dsg_data_v\${i}\`);
        if (i !== 25) localStorage.removeItem(\`dsg_articles_v\${i}\`);
        if (i !== 25) localStorage.removeItem(\`dsg_gallery_v\${i}\`);
        if (i !== 10) localStorage.removeItem(\`dsg_admin_players_v\${i}\`);
        if (i !== 10) localStorage.removeItem(\`dsg_admin_teams_v\${i}\`);
        if (i !== 10) localStorage.removeItem(\`dsg_admin_rounds_v\${i}\`);
        if (i !== 6) localStorage.removeItem(\`dsg_admin_leagues_v\${i}\`);
      }
    } catch(e) {}

    // Eagerly load local memory so the app doesn't block on network
    memoryData = loadLocal('dsg_data', 50) || INITIAL_DATA;
    memoryNews = loadLocal('dsg_articles', 25) || INITIAL_DATA.news || [];
    memoryGallery = loadLocal('dsg_gallery', 25) || INITIAL_DATA.gallery || [];

    // Ensure all leagues have an initialized season object in memoryData
    if (!memoryData.seasons) memoryData.seasons = {};
    const initialLeagues = this.getAdminLeaguesSync();
    initialLeagues.forEach(l => {
      let sKey = l.seasonKey;
      if (!sKey) {
        sKey = (l.name && l.year && !l.name.includes(String(l.year))) ? \`\${l.name} \${l.year}\` : l.name;
      }
      if (sKey && !memoryData.seasons[sKey]) {
        memoryData.seasons[sKey] = {
          teams: [],
          matches: [],
          stats: { topScorers: [], cards: [] }
        };
      }
    });

    // Trigger Firebase sync in the background
    this.syncFirebase();
  },

  async syncFirebase() {
    const dataRef = doc(db, 'system', 'liga_data');
    const newsRef = doc(db, 'system', 'news_data');
    const galleryRef = doc(db, 'system', 'gallery_data');
    const leagueRef = doc(db, 'system', 'leagues_data');

    try {
      const [dataSnap, newsSnap, gallerySnap, leagueSnap] = await Promise.all([
        getDoc(dataRef), getDoc(newsRef), getDoc(galleryRef), getDoc(leagueRef)
      ]);

      let needsMigration = false;
      let hasUpdates = false;

      // Sync Data
      if (dataSnap.exists() && dataSnap.data().data) {
        const fbData = dataSnap.data().data;
        const localData = loadLocal('dsg_data', 50);
        if (localData && localData.lastUpdated && (!fbData.lastUpdated || localData.lastUpdated > fbData.lastUpdated)) {
          memoryData = localData;
          needsMigration = true;
        } else {
          memoryData = fbData;
          hasUpdates = true;
        }
      } else {
        let legacyData = loadLocal('dsg_data', 50);
        if (!legacyData) legacyData = INITIAL_DATA;
        memoryData = legacyData;
        needsMigration = true;
      }

      // Sync News
      if (newsSnap.exists() && newsSnap.data().data) {
        const fbNews = newsSnap.data().data;
        const localNews = loadLocal('dsg_articles', 25) || INITIAL_DATA.news || [];
        if (localNews.length > fbNews.length) {
          memoryNews = localNews;
          needsMigration = true;
        } else {
          memoryNews = fbNews;
          hasUpdates = true;
        }
      } else {
        memoryNews = loadLocal('dsg_articles', 25) || INITIAL_DATA.news || [];
        needsMigration = true;
      }

      // Auto-sync all leagues to seasons
      if (leagueSnap && leagueSnap.exists() && leagueSnap.data()?.data) {
        const leagues = leagueSnap.data().data;
        if (!memoryData.seasons) memoryData.seasons = {};
        leagues.forEach(l => {
          let sKey = l.seasonKey;
          if (!sKey) {
            sKey = (l.name && l.year && !l.name.includes(String(l.year))) ? \`\${l.name} \${l.year}\` : l.name;
          }
          if (sKey && !memoryData.seasons[sKey]) {
            memoryData.seasons[sKey] = {
              teams: [],
              matches: [],
              stats: { topScorers: [], cards: [] }
            };
            needsMigration = true;
          }
        });
      }

      // Sync Gallery
      if (gallerySnap.exists() && gallerySnap.data().data) {
        const fbGallery = gallerySnap.data().data;
        const localGallery = loadLocal('dsg_gallery', 25) || INITIAL_DATA.gallery || [];
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
        memoryGallery = loadLocal('dsg_gallery', 25) || INITIAL_DATA.gallery || [];
        needsMigration = true;
      }

      // Sanitize Gallery items (fix broken image paths)
      if (memoryGallery && Array.isArray(memoryGallery)) {
        memoryGallery.forEach(album => {
          if (!album.image || album.image.includes('assets/hero') || album.image.includes('sample.jpg') || album.image.startsWith('undefined')) {
            album.image = 'stadion.png';
            needsMigration = true;
          }
          if (album.images && Array.isArray(album.images)) {
            album.images = album.images.map((img, idx) => {
              const url = typeof img === 'string' ? img : (img?.url || '');
              const title = typeof img === 'object' ? img.title : \`\${album.title || 'Foto'} \${idx + 1}\`;
              let cleanUrl = url;
              if (!cleanUrl || cleanUrl.includes('assets/hero') || cleanUrl.includes('sample.jpg') || cleanUrl.startsWith('undefined')) {
                cleanUrl = 'stadion.png';
                needsMigration = true;
              }
              return { url: cleanUrl, title: title || \`\${album.title} \${idx + 1}\` };
            });
          } else {
            album.images = [{ url: 'stadion.png', title: album.title || 'Foto 1' }];
            needsMigration = true;
          }
        });
      }

      // Initialize / ensure seasons are present
      if (!memoryData.seasons) memoryData.seasons = {};
      if (memoryData.seasons['2026_sommer']) {
        delete memoryData.seasons['2026_sommer'];
        needsMigration = true;
      }
      if (memoryData.seasons['DSG Sommercup 2026']) {
        delete memoryData.seasons['DSG Sommercup 2026'];
        needsMigration = true;
      }
      if (memoryData.seasons['Liga 26/27 2026']) {
        delete memoryData.seasons['Liga 26/27 2026'];
        needsMigration = true;
      }
      
      for (let s in INITIAL_DATA.seasons) {
        if (!memoryData.seasons[s] || !memoryData.seasons[s].teams || memoryData.seasons[s].teams.length === 0) {
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
        await setDoc(dataRef, { data: memoryData }).catch(e => console.error("Firebase save error (data):", e));
        await setDoc(newsRef, { data: memoryNews }).catch(e => console.error("Firebase save error (news):", e));
        await setDoc(galleryRef, { data: memoryGallery }).catch(e => console.error("Firebase save error (gallery):", e));
      }
        
      trySetLocal('dsg_data_v50', JSON.stringify(memoryData));
      trySetLocal('dsg_articles_v25', JSON.stringify(memoryNews));
      trySetLocal('dsg_gallery_v25', JSON.stringify(memoryGallery));
      console.log("Synced local and Firebase data.");

      if (hasUpdates) {
        window.dispatchEvent(new Event('data-updated'));
      }
    } catch(e) {
      console.error("Firebase sync failed or timed out. Relying on local cache.", e);
    }
  },
  
  getData() {
    return memoryData || INITIAL_DATA;
  },
  
  saveData(data) {
    data.lastUpdated = Date.now();
    memoryData = data;
    trySetLocal('dsg_data_v50', JSON.stringify(data));
    setDoc(doc(db, 'system', 'liga_data'), { data }).catch(e => console.error("Firebase save error:", e));
    window.dispatchEvent(new CustomEvent('data-updated'));
  },

  getNews() {
    return memoryNews && memoryNews.length > 0 ? memoryNews : INITIAL_DATA.news;
  },
  
  getArticle(id) {
    if (!id) return null;
    const cleanId = decodeURIComponent(String(id)).trim().toLowerCase();
    return this.getNews().find(a => {
      if (!a) return false;
      const aId = decodeURIComponent(String(a.id || '')).trim().toLowerCase();
      if (aId === cleanId || String(a.id) === String(id)) return true;
      const aTitleSlug = (a.title || '').toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return aTitleSlug === cleanId;
    });
  },

  deleteArticle(id) {
    const cleanId = decodeURIComponent(String(id)).trim().toLowerCase();
    memoryNews = memoryNews.filter(a => {
      if (!a) return false;
      const aId = decodeURIComponent(String(a.id || '')).trim().toLowerCase();
      const aTitleSlug = (a.title || '').toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return aId !== cleanId && String(a.id) !== String(id) && aTitleSlug !== cleanId;
    });
    trySetLocal('dsg_articles_v25', JSON.stringify(memoryNews));
    setDoc(doc(db, 'system', 'news_data'), { data: memoryNews }).catch(e => console.error("Firebase save error:", e));
    window.dispatchEvent(new CustomEvent('data-updated'));
  },
  
  addNews(title, excerpt, content, image, gallery) {
    const slug = title.toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const newId = slug || Date.now().toString();
    memoryNews.unshift({
      id: newId,
      title,
      content: content || \`<p>\${excerpt}</p>\`,
      author: "Admin",
      readTime: "2 min read",
      image: image || 'dsg.avif',
      gallery: gallery || [],
      date: new Date().toISOString().split('T')[0]
    });
    trySetLocal('dsg_articles_v25', JSON.stringify(memoryNews));
    setDoc(doc(db, 'system', 'news_data'), { data: memoryNews }).catch(e => console.error("Firebase save error:", e));
    window.dispatchEvent(new CustomEvent('data-updated'));
  },

  updateNews(id, title, excerpt, content, image, gallery) {
    const cleanId = decodeURIComponent(String(id)).trim().toLowerCase();
    const index = memoryNews.findIndex(a => {
      if (!a) return false;
      const aId = decodeURIComponent(String(a.id || '')).trim().toLowerCase();
      const aTitleSlug = (a.title || '').toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return aId === cleanId || String(a.id) === String(id) || aTitleSlug === cleanId;
    });
    if (index !== -1) {
      memoryNews[index] = {
        ...memoryNews[index],
        title,
        excerpt,
        content: content || \`<p>\${excerpt}</p>\`,
        image: image || memoryNews[index].image || 'dsg.avif',
        gallery: gallery || memoryNews[index].gallery || []
      };
      trySetLocal('dsg_articles_v25', JSON.stringify(memoryNews));
      setDoc(doc(db, 'system', 'news_data'), { data: memoryNews }).catch(e => console.error("Firebase save error:", e));
      window.dispatchEvent(new CustomEvent('data-updated'));
    }
  },

  _resolveSeason(data, seasonId) {
    if (!data || !data.seasons || !seasonId) return null;
    if (data.seasons[seasonId]) return data.seasons[seasonId];
    
    // Check aliases from admin leagues
    const leagues = this.getAdminLeaguesSync();
    for (const l of leagues) {
      const sKey = l.seasonKey || ((l.name && l.year && !l.name.includes(String(l.year))) ? \`\${l.name} \${l.year}\` : l.name);
      if (sKey === seasonId || l.name === seasonId || \`\${l.name} \${l.year}\` === seasonId) {
        if (l.seasonKey && data.seasons[l.seasonKey]) return data.seasons[l.seasonKey];
        if (data.seasons[sKey]) return data.seasons[sKey];
        if (data.seasons[l.name]) return data.seasons[l.name];
        if (data.seasons[\`\${l.name} \${l.year}\`]) return data.seasons[\`\${l.name} \${l.year}\`];
      }
    }
    return null;
  },

  getLiga(seasonId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    const season = this._resolveSeason(data, sid);
    if (!season || !season.teams) return [];
    const teams = [...season.teams];
    return teams.sort((a, b) => (b.points || 0) - (a.points || 0) || (((b.gf || 0) - (b.ga || 0)) - ((a.gf || 0) - (a.ga || 0))));
  },
  
  getStats(seasonId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    const season = this._resolveSeason(data, sid);
    if (!season || !season.stats) return { topScorers: [], cards: [] };
    return season.stats;
  },

  getMatches(seasonId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    const season = this._resolveSeason(data, sid);
    if (!season || !season.matches) return [];
    return season.matches;
  },

  getMatch(seasonId, matchId) {
    const data = this.getData();
    const sid = seasonId || data.currentSeason;
    const season = this._resolveSeason(data, sid);
    if (!season || !season.matches) return null;
    return (season.matches || []).find(m => String(m.id) === String(matchId));
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
        if (p.length === 3) return new Date(\`\${p[2]}-\${p[1]}-\${p[0]}\`).getTime();
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
    if (match.status === 'Played' || match.status === 'Walkover' || match.status === 'Abgesagt 3:0' || match.status === 'Abgesagt 0:3' || !match.status) {
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
        if (statsObj) statsObj.goals -= (s.goals || 1);
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

    if (match.scorers) {
      if (!data.seasons[sid].stats.topScorers) data.seasons[sid].stats.topScorers = [];
      match.scorers.forEach(s => {
        let statsObj = data.seasons[sid].stats.topScorers.find(ts => ts.name === s.name && ts.team === s.team);
        if (!statsObj) {
          statsObj = { name: s.name, team: s.team, goals: 0 };
          data.seasons[sid].stats.topScorers.push(statsObj);
        }
        statsObj.goals += (s.goals || 1);
      });
      data.seasons[sid].stats.topScorers.sort((a, b) => b.goals - a.goals);
    }

    if (match.cards) {
      if (!data.seasons[sid].stats.cards) data.seasons[sid].stats.cards = [];
      match.cards.forEach(c => {
        let cObj = data.seasons[sid].stats.cards.find(ts => ts.name === c.name && ts.team === c.team);
        if (!cObj) {
          cObj = { name: c.name, team: c.team, yellow: 0, yellowRed: 0, red: 0 };
          data.seasons[sid].stats.cards.push(cObj);
        }
        if (c.type === 'yellow') cObj.yellow++;
        if (c.type === 'yellowRed') cObj.yellowRed++;
        if (c.type === 'red') cObj.red++;
      });
    }
  },

  async getAdminPlayers() {
    let local = loadLocal('dsg_admin_players', 10);
    if (local && local.length > 0) return local;

    let baseline = [];
    try {
      const res = await fetch('data/players.json');
      baseline = await res.json();
    } catch(e) {}

    try {
      const metaSnap = await getDoc(doc(db, 'system', 'players_meta'));
      if (metaSnap.exists()) {
        const meta = metaSnap.data();
        const partsCount = meta.parts || 0;
        const partPromises = [];
        for (let i = 0; i < partsCount; i++) {
          partPromises.push(getDoc(doc(db, 'system', \`players_part_\${i}\`)));
        }
        const partSnaps = await Promise.all(partPromises);
        let fbPlayers = [];
        partSnaps.forEach(snap => {
          if (snap.exists() && snap.data().data) {
            fbPlayers = fbPlayers.concat(snap.data().data);
          }
        });

        if (fbPlayers.length > 0) {
          trySetLocal('dsg_admin_players_v10', JSON.stringify(fbPlayers));
          return fbPlayers;
        }
      }
    } catch(e) {
      console.warn("Could not fetch players from Firebase:", e);
    }

    if (baseline && baseline.length > 0) {
      trySetLocal('dsg_admin_players_v10', JSON.stringify(baseline));
      return baseline;
    }

    return [];
  },

  saveAdminPlayers(players) {
    trySetLocal('dsg_admin_players_v10', JSON.stringify(players));
    const CHUNK_SIZE = 400;
    const chunks = [];
    for (let i = 0; i < players.length; i += CHUNK_SIZE) {
      chunks.push(players.slice(i, i + CHUNK_SIZE));
    }
    setDoc(doc(db, 'system', 'players_meta'), { 
      count: players.length, 
      parts: chunks.length, 
      lastUpdated: Date.now() 
    }).catch(e => console.error("Firebase save error (players_meta):", e));

    chunks.forEach((chunk, idx) => {
      setDoc(doc(db, 'system', \`players_part_\${idx}\`), { 
        data: chunk 
      }).catch(e => console.error(\`Firebase save error (players_part_\${idx}):\`, e));
    });
  },

  async getAdminLeagues() {
    let local = loadLocal('dsg_admin_leagues', 6);
    if (local && local.length > 0) return local;

    let baseline = [];
    try {
      const res = await fetch('data/leagues.json');
      baseline = await res.json();
    } catch(e) {}

    try {
      const leagueSnap = await getDoc(doc(db, 'system', 'leagues_data'));
      if (leagueSnap.exists() && leagueSnap.data()?.data) {
        let fbLeagues = leagueSnap.data().data;
        
        // Strict deduplication by ID
        const seenIds = new Set();
        const uniqueLeagues = [];
        fbLeagues.forEach(l => {
          const numId = parseInt(l.id) || 0;
          if (numId > 0 && !seenIds.has(numId)) {
            seenIds.add(numId);
            uniqueLeagues.push(l);
          }
        });

        baseline.forEach(b => {
          const numId = parseInt(b.id) || 0;
          if (numId > 0 && !seenIds.has(numId)) {
            seenIds.add(numId);
            uniqueLeagues.push(b);
          }
        });

        trySetLocal('dsg_admin_leagues_v6', JSON.stringify(uniqueLeagues));
        setDoc(doc(db, 'system', 'leagues_data'), { data: uniqueLeagues, lastUpdated: Date.now() })
          .catch(e => console.error("Firebase save error (leagues):", e));
        return uniqueLeagues;
      }
    } catch(e) {
      console.warn("Could not fetch leagues from Firebase:", e);
    }

    if (baseline && baseline.length > 0) {
      trySetLocal('dsg_admin_leagues_v6', JSON.stringify(baseline));
      setDoc(doc(db, 'system', 'leagues_data'), { data: baseline, lastUpdated: Date.now() })
        .catch(e => console.error("Firebase save error (leagues):", e));
      return baseline;
    }

    return [];
  },

  ensureLeagueSeason(league) {
    if (!league) return;
    const data = this.getData();
    if (!data.seasons) data.seasons = {};

    let sKey = league.seasonKey;
    if (!sKey) {
      sKey = (league.name && league.year && !league.name.includes(String(league.year))) ? \`\${league.name} \${league.year}\` : league.name;
    }

    if (sKey && !data.seasons[sKey]) {
      data.seasons[sKey] = {
        teams: [],
        matches: [],
        stats: { topScorers: [], cards: [] }
      };
      this.saveData(data);
    }
  },

  setLeagueSeasonTeams(seasonKey, selectedTeamNames) {
    if (!seasonKey) return;
    const data = this.getData();
    if (!data.seasons) data.seasons = {};
    if (!data.seasons[seasonKey]) {
      data.seasons[seasonKey] = {
        teams: [],
        matches: [],
        stats: { topScorers: [], cards: [] }
      };
    }

    const currentTeams = data.seasons[seasonKey].teams || [];
    const currentMap = new Map();
    currentTeams.forEach(t => currentMap.set(t.name.trim().toLowerCase(), t));

    const updatedTeams = (selectedTeamNames || []).map(name => {
      const existing = currentMap.get(name.trim().toLowerCase());
      if (existing) {
        return existing;
      }
      return {
        name: name.trim(),
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        points: 0
      };
    });

    data.seasons[seasonKey].teams = updatedTeams;
    this.saveData(data);
  },

  deleteLeagueSeason(deletedLeague) {
    if (!deletedLeague) return;
    const data = this.getData();
    if (!data || !data.seasons) return;

    const protectedKeys = ['2021/2022', '2022/2023', '2023/2024', '2024/2025', '2025/2026', '2026/2027'];
    const seasonKey = deletedLeague.seasonKey || deletedLeague.name;
    const normName = (deletedLeague.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const keysToDelete = Object.keys(data.seasons).filter(k => {
      if (protectedKeys.includes(k)) return false;
      if (k === seasonKey || k === deletedLeague.name) return true;
      const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normName && (normK.includes(normName) || normName.includes(normK))) return true;
      return false;
    });

    let changed = false;
    keysToDelete.forEach(k => {
      delete data.seasons[k];
      changed = true;
    });

    if (data.seasons['2026_sommer']) {
      delete data.seasons['2026_sommer'];
      changed = true;
    }

    if (changed) {
      if (data.currentSeason && !data.seasons[data.currentSeason]) {
        data.currentSeason = '2025/2026';
      }
      this.saveData(data);
    }
  },

  saveAdminLeagues(leagues) {
    const seenIds = new Set();
    const cleanLeagues = [];
    (leagues || []).forEach(l => {
      const num = parseInt(l.id) || 0;
      if (num > 0 && !seenIds.has(num)) {
        seenIds.add(num);
        cleanLeagues.push({ ...l, id: num });
      }
    });

    trySetLocal('dsg_admin_leagues_v6', JSON.stringify(cleanLeagues));
    setDoc(doc(db, 'system', 'leagues_data'), { data: cleanLeagues, lastUpdated: Date.now() })
      .catch(e => console.error("Firebase save error (leagues):", e));
    window.dispatchEvent(new CustomEvent('leagues-updated'));
    window.dispatchEvent(new CustomEvent('data-updated'));
  },

  getAdminLeaguesSync() {
    let local = loadLocal('dsg_admin_leagues', 6);
    if (local && Array.isArray(local) && local.length > 0) return local;
    return ${JSON.stringify(leaguesData, null, 2)};
  },

  getVisibleSeasonItems() {
    const leagues = this.getAdminLeaguesSync();
    const items = [];
    const seenKeys = new Set();
    const hiddenKeys = new Set();

    leagues.forEach(l => {
      if (l.showOnHomepage === false) {
        if (l.seasonKey) hiddenKeys.add(l.seasonKey);
        if (l.name && l.year) hiddenKeys.add(\`\${l.name} \${l.year}\`);
        const sKey = (l.name && l.year && !l.name.includes(String(l.year))) ? \`\${l.name} \${l.year}\` : l.name;
        hiddenKeys.add(sKey);
      }
    });

    const sorted = [...leagues].sort((a, b) => {
      const yA = parseInt(a.year) || 0;
      const yB = parseInt(b.year) || 0;
      if (yB !== yA) return yB - yA;
      return (parseInt(b.id) || 0) - (parseInt(a.id) || 0);
    });

    sorted.forEach(l => {
      if (l.showOnHomepage === false) return;

      let sKey = l.seasonKey;
      if (!sKey) {
        if (l.name && l.year && !l.name.includes(String(l.year))) sKey = \`\${l.name} \${l.year}\`;
        else sKey = l.name;
      }

      const compoundName = (l.name && l.year) ? \`\${l.name} \${l.year}\` : '';
      if (seenKeys.has(sKey) || hiddenKeys.has(sKey) || (compoundName && hiddenKeys.has(compoundName))) return;
      seenKeys.add(sKey);

      let label = l.name;
      if (l.name === 'Saison' || l.name === 'Liga') {
        label = \`Saison \${l.year}\`;
      } else if (l.name && l.year && !l.name.includes(String(l.year))) {
        label = \`\${l.name} \${l.year}\`;
      }

      items.push({
        key: sKey,
        label: label,
        year: l.year,
        id: l.id
      });
    });

    return items;
  },

  getVisibleSeasonKeys() {
    return this.getVisibleSeasonItems().map(i => i.key);
  },

  async getAdminRounds() {
    let local = loadLocal('dsg_admin_rounds', 10);
    if (local && local.length > 0) return local;

    let baseline = [];
    try {
      const res = await fetch('data/rounds.json');
      baseline = await res.json();
    } catch(e) {}

    try {
      const roundsSnap = await getDoc(doc(db, 'system', 'rounds_data'));
      if (roundsSnap.exists() && roundsSnap.data()?.data) {
        let fbRounds = roundsSnap.data().data;
        const seen = new Set();
        fbRounds = fbRounds.filter(r => {
          const key = \`\${r.seasonKey || ''}_\${r.saison || ''}_\${r.jahr || ''}_\${r.runde || ''}_\${r.liga || ''}\`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        trySetLocal('dsg_admin_rounds_v10', JSON.stringify(fbRounds));
        return fbRounds;
      }
    } catch(e) {
      console.warn("Could not fetch rounds from Firebase:", e);
    }

    if (baseline && baseline.length > 0) {
      trySetLocal('dsg_admin_rounds_v10', JSON.stringify(baseline));
      return baseline;
    }

    return [];
  },

  saveAdminRounds(rounds) {
    trySetLocal('dsg_admin_rounds_v10', JSON.stringify(rounds));
    setDoc(doc(db, 'system', 'rounds_data'), { data: rounds, lastUpdated: Date.now() })
      .catch(e => console.error("Firebase save error (rounds):", e));
    window.dispatchEvent(new CustomEvent('rounds-updated'));
  },

  async getAdminTeams() {
    let local = loadLocal('dsg_admin_teams', 10);
    if (local && local.length > 0) return local;

    let baseline = [];
    try {
      const res = await fetch('data/teams.json');
      baseline = await res.json();
    } catch(e) {}

    try {
      const teamsSnap = await getDoc(doc(db, 'system', 'teams_data'));
      if (teamsSnap.exists() && teamsSnap.data()?.data) {
        let fbTeams = teamsSnap.data().data;
        trySetLocal('dsg_admin_teams_v10', JSON.stringify(fbTeams));
        return fbTeams;
      }
    } catch(e) {
      console.warn("Could not fetch teams from Firebase:", e);
    }

    if (baseline && baseline.length > 0) {
      trySetLocal('dsg_admin_teams_v10', JSON.stringify(baseline));
      return baseline;
    }

    return [];
  },

  saveAdminTeams(teams) {
    trySetLocal('dsg_admin_teams_v10', JSON.stringify(teams));
    setDoc(doc(db, 'system', 'teams_data'), { data: teams, lastUpdated: Date.now() })
      .catch(e => console.error("Firebase save error (teams):", e));
    window.dispatchEvent(new CustomEvent('teams-updated'));
  },

  getGallery() {
    return memoryGallery && memoryGallery.length > 0 ? memoryGallery : INITIAL_DATA.gallery;
  },

  getAlbum(id) {
    return this.getGallery().find(a => String(a.id) === String(id));
  },

  deleteAlbum(id) {
    memoryGallery = memoryGallery.filter(a => String(a.id) !== String(id));
    trySetLocal('dsg_gallery_v25', JSON.stringify(memoryGallery));
    setDoc(doc(db, 'system', 'gallery_data'), { data: memoryGallery }).catch(e => console.error("Firebase save error:", e));
    window.dispatchEvent(new CustomEvent('data-updated'));
  },

  addAlbum(title, date, excerpt, coverImage, imagesArray) {
    const newId = title.toLowerCase().replace(/\\s+/g, '-');
    memoryGallery.unshift({ id: newId, title, date, excerpt, image: coverImage, images: imagesArray });
    trySetLocal('dsg_gallery_v25', JSON.stringify(memoryGallery));
    setDoc(doc(db, 'system', 'gallery_data'), { data: memoryGallery }).catch(e => console.error("Firebase save error:", e));
  },

  updateAlbum(id, title, date, excerpt, coverImage, imagesArray) {
    const index = memoryGallery.findIndex(a => String(a.id) === String(id));
    if (index !== -1) {
      memoryGallery[index] = { id, title, date, excerpt, image: coverImage, images: imagesArray };
      trySetLocal('dsg_gallery_v25', JSON.stringify(memoryGallery));
      setDoc(doc(db, 'system', 'gallery_data'), { data: memoryGallery }).catch(e => console.error("Firebase save error:", e));
    }
  }
};
`;

fs.writeFileSync(storeJsPath, storeTemplate, 'utf-8');
console.log(`💾 Successfully updated store.js with full historical database and v50 cache!`);
