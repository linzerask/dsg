import json
import glob
import re

def main():
    print("=================================================================")
    print("DETAILED VERIFICATION: GOAL TOTALS & MATCH COMPARISON")
    print("=================================================================\n")

    # 1. Load liga.json
    with open('Website/data/liga.json', 'r', encoding='utf-8') as f:
        liga_data = json.load(f)

    seasons = liga_data.get('seasons', {})
    
    grand_total_goals = 0
    grand_total_played = 0
    grand_total_matches = 0
    
    for s_key, s_data in seasons.items():
        s_name = s_data.get('name', s_key)
        matches = s_data.get('matches', [])
        teams = s_data.get('teams', [])
        
        print("==================================================")
        print(f"LEAGUE / SEASON: {s_key} ({s_name})")
        print("==================================================")
        print(f"Total Matches in DB: {len(matches)}")
        
        # Group by rounds
        rounds_dict = {}
        for m in matches:
            r = m.get('round', 'Unknown')
            if r not in rounds_dict:
                rounds_dict[r] = []
            rounds_dict[r].append(m)
            
        print(f"Total Rounds: {len(rounds_dict)}")
        
        total_season_goals = 0
        played_matches_count = 0
        unplayed_matches_count = 0
        high_scoring_games = []
        
        print("\n--- MATCH BY MATCH BREAKDOWN ---")
        for r_name, r_matches in rounds_dict.items():
            round_goals = 0
            round_played = 0
            print(f"\n[{r_name}] ({len(r_matches)} matches):")
            for m in r_matches:
                score = m.get('score', '-:-')
                status = m.get('status', '')
                home = m.get('home', '')
                away = m.get('away', '')
                date = m.get('date', '')
                
                # Check score
                goals_in_game = 0
                is_played = False
                
                if score and ':' in score and score != '-:-' and score != ':':
                    main_score = score.split('(')[0].strip()
                    parts = main_score.split(':')
                    try:
                        h = int(parts[0].strip())
                        a = int(parts[1].strip())
                        goals_in_game = h + a
                        round_goals += goals_in_game
                        round_played += 1
                        is_played = True
                        if goals_in_game >= 8:
                            high_scoring_games.append((f"{home} vs {away}", score, goals_in_game, r_name))
                    except:
                        pass
                
                if is_played:
                    print(f"  [OK] {home} vs {away} | Score: {score} | Goals: {goals_in_game} | Date: {date}")
                else:
                    print(f"  [--] {home} vs {away} | Score: {score} ({status}) | Goals: 0 | Date: {date}")
                    unplayed_matches_count += 1
            
            total_season_goals += round_goals
            played_matches_count += round_played
            print(f"  >> Round Total: {round_goals} goals in {round_played} played matches")
            
        print(f"\n>>> SEASON SUMMARY FOR {s_key}:")
        print(f"    Played Matches: {played_matches_count}")
        print(f"    Unplayed / Canceled: {unplayed_matches_count}")
        print(f"    Total Goals: {total_season_goals}")
        print(f"    Average Goals / Match: {total_season_goals / played_matches_count:.2f}" if played_matches_count else "0")
        
        # Verify table standings
        table_gf = sum(t.get('goalsFor', 0) for t in teams)
        table_ga = sum(t.get('goalsAgainst', 0) for t in teams)
        print(f"    Standings Table Goals For: {table_gf}")
        print(f"    Standings Table Goals Against: {table_ga}")
        print(f"    Goals Match vs Standings Discrepancy: {total_season_goals - table_gf}")
        
        print("\n    Notable High Scoring Games (>= 8 goals):")
        for hg in high_scoring_games:
            print(f"      - {hg[0]} -> {hg[1]} ({hg[2]} goals in {hg[3]})")
        print()
        
        grand_total_goals += total_season_goals
        grand_total_played += played_matches_count
        grand_total_matches += len(matches)

    print("==================================================")
    print(f"GRAND TOTAL OVER ALL SEASONS:")
    print(f"  Total Matches: {grand_total_matches}")
    print(f"  Played Matches: {grand_total_played}")
    print(f"  Total Goals: {grand_total_goals}")
    print(f"  Overall Average: {grand_total_goals / grand_total_played:.2f} goals/match")
    print("==================================================")

if __name__ == '__main__':
    main()
