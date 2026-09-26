const fs = require('fs');
const p = 'Website/js/views/liga.js';
let lines = fs.readFileSync(p, 'utf8').split('\n');
lines = lines.slice(0, 372);
lines.push(`        targets: '.extra-scorer',
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(50),
        duration: 500,
        easing: 'easeOutCubic'
      });
    });
  }

  // Check URL for specific tab
  if (window.location.hash.includes('tab=stats')) {
    const statsTabBtn = document.querySelector('.tab-btn[data-target="stats"]');
    if (statsTabBtn) statsTabBtn.click();
  }
};`);
fs.writeFileSync(p, lines.join('\n'));
