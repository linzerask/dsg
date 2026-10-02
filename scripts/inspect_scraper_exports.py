import json
import glob

def check_all():
    print("=== INSPECTING SCRAPER JSON EXPORTS ===")
    for fn in sorted(glob.glob('scraper/raw_berichte*.json')):
        try:
            with open(fn, 'r', encoding='utf-8') as f:
                d = json.load(f)
                print(f"{fn}: {len(d)} items")
                if len(d) > 0 and isinstance(d[0], dict):
                    m0 = d[0]
                    print(f"   sample: {m0.get('home')} vs {m0.get('away')} -> {m0.get('score')} (round: {m0.get('round')})")
        except Exception as e:
            print(f"{fn}: {e}")

    try:
        with open('scraper/export_1790446619908.json', 'r', encoding='utf-8') as f:
            exp = json.load(f)
            print("\nexport_1790446619908.json keys:", list(exp.keys()))
            if 'seasons' in exp:
                for sk, sv in exp['seasons'].items():
                    m_list = sv.get('matches', [])
                    g_count = 0
                    for m in m_list:
                        sc = m.get('score', '')
                        if sc and ':' in sc and sc != '-:-':
                            p = sc.split('(')[0].split(':')
                            try:
                                g_count += int(p[0].strip()) + int(p[1].strip())
                            except:
                                pass
                    print(f"  Season {sk}: {len(m_list)} matches, {len(sv.get('teams', []))} teams, {g_count} goals")
    except Exception as e:
        print("export error:", e)

if __name__ == '__main__':
    check_all()
