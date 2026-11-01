from nba_api.stats.static import players
from nba_api.stats.endpoints import playergamelog

# Test 1: Find player locally
results = players.find_players_by_full_name("LeBron James")

print("Player search results:")
print(results)

# Test 2: Retrieve game statistics
player_id = results[0]["id"]

print("\nFetching NBA game statistics...")

try:
    gamelog = playergamelog.PlayerGameLog(
        player_id=player_id,
        season="2026-27",
        season_type_all_star="Regular Season",
        timeout=15
    )

    df = gamelog.get_data_frames()[0]

    print(df[["GAME_DATE", "PTS", "REB", "AST"]].head())

except Exception as e:
    print("NBA API ERROR:")
    print(type(e).__name__)
    print(str(e))