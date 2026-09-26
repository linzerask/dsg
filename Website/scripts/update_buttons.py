import re

# 1. Update CSS
with open('css/global.css', 'r', encoding='utf-8') as f:
    css = f.read()

old_stats_toggle_css = """
.stats-toggle {
    display: flex;
    gap: 10px;
    margin-bottom: var(--space-md);
}
.stats-toggle-btn {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--color-text-secondary);
    padding: 8px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s;
}
.stats-toggle-btn.active {
    background: rgba(255,255,255,0.1);
    border-color: var(--color-accent);
    color: var(--color-text-primary);
}
"""

new_stats_toggle_css = """
.stats-toggle {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-sm);
}
.stats-toggle-btn {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    font-size: 1.1rem;
    font-weight: 700;
    position: relative;
    cursor: pointer;
    padding: 0;
    transition: all 0.3s;
}
.stats-toggle-btn.active {
    color: var(--color-text-primary);
}
.stats-toggle-btn.active::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--color-accent);
    border-radius: 2px;
}
"""

css = css.replace(old_stats_toggle_css.strip(), new_stats_toggle_css.strip())

with open('css/global.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Update liga.js "Alle anschauen" buttons
with open('js/views/liga.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace button in scorersHTML
old_btn = '<button id="btn-show-all-scorers" class="btn" style="width: 100%; margin-top: var(--space-md); padding: 8px; font-size: 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--color-accent); color: var(--color-text-primary);">Alle anschauen</button>'
new_btn = """<div style="text-align: center; margin-top: var(--space-md);"><button id="btn-show-all-scorers" style="background: transparent; border: none; color: var(--color-text-secondary); font-size: 0.9rem; font-weight: 700; cursor: pointer; position: relative; padding-bottom: 2px; border-bottom: 2px solid var(--color-accent); transition: color 0.3s;" onmouseover="this.style.color='var(--color-text-primary)'" onmouseout="this.style.color='var(--color-text-secondary)'">Alle anschauen</button></div>"""
js = js.replace(old_btn, new_btn)

# Replace button in cards logic
old_btn_cards = '<button id="btn-show-all-${typeKey}" class="btn" style="width: 100%; margin-top: var(--space-md); padding: 8px; font-size: 0.85rem; background: rgba(255,255,255,0.05); border: 1px solid var(--color-accent); color: var(--color-text-primary);">Alle anschauen</button>'
new_btn_cards = """<div style="text-align: center; margin-top: var(--space-md);"><button id="btn-show-all-${typeKey}" style="background: transparent; border: none; color: var(--color-text-secondary); font-size: 0.9rem; font-weight: 700; cursor: pointer; position: relative; padding-bottom: 2px; border-bottom: 2px solid var(--color-accent); transition: color 0.3s;" onmouseover="this.style.color='var(--color-text-primary)'" onmouseout="this.style.color='var(--color-text-secondary)'">Alle anschauen</button></div>"""
js = js.replace(old_btn_cards, new_btn_cards)

with open('js/views/liga.js', 'w', encoding='utf-8') as f:
    f.write(js)
