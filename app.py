from fastapi import FastAPI, HTTPException
from nba_api.stats.static import players
from nba_api.stats.endpoints import  playercareerstats, playergamelog

app = FastAPI()

@app.get("/")
def root():
    return {"message": "NBA API Python app is running"}
# test message to confirm that the api is running when going to
# http://localhost:8000

@app.get("/search_player")
def search_player(name: str):
    results = players.find_players_by_full_name(name)

    if not results:
        raise HTTPException(status_code=404, detail="Player not found")
    return results

@app.get("/player/lastgames_by_name")
def player_last_games(name: str, num_games: int = 5):

    """fetching the game log for a specific player
    also setting it to Regular Season as the NBA Playoffs have
    not started yet"""

    results = players.find_players_by_full_name(name)
    if not results:
        raise HTTPException(status_code=404, detail="Player not found")

        # take the first match (you could enhance later for multiple matches)
    player_id = results[0]['id']
    try:
        gamelog = playergamelog.PlayerGameLog(
            player_id=str(player_id),
            season_type_all_star="Regular Season"
        )
        df = gamelog.get_data_frames()[0]

        recent = df.head(num_games).to_dict(orient="records")
        #takes the first input number of rows which are the most recent
        #games

        return {"player_name": name, "player_id": player_id, "recent_games": recent}
        # returns a dictionary of the player id and recent games

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/player/career_by_name")
def player_career_by_name(name: str):
    """fetch career stats by typing player name
    Example:
    /player/career_by_name?name=LaMelo"""

    results = players.find_players_by_full_name(name)
    if not results:
        raise HTTPException(status_code=404, detail="Player not found")
    player_id = results[0]['id']

    try:
        career = playercareerstats.PlayerCareerStats(player_id=str(player_id))
        # fetch career totals

        df = career.season_totals_regular_season.get_data_frame()
        # extracting the dataframe containing season totals

        seasons = df.to_dict(orient="records")
        # convert the dataframe to a list of dictionaries
        return {"player_name": name, "player_id": player_id, "seasons": seasons}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))