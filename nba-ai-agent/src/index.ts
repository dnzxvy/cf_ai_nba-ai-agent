export interface Env {
  AI: any;
}

const PYTHON_API_BASE = "https://cf-ai-nba-ai-agent.onrender.com";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Root endpoint
    if (url.pathname === "/") {
      return new Response(JSON.stringify({ message: "NBA API TypeScript Worker is running" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // /search_player endpoint
    if (url.pathname === "/search_player") {
      const name = url.searchParams.get("name");
      if (!name) return new Response(JSON.stringify({ error: "Missing name parameter!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

      try {
        const response = await fetch(`${PYTHON_API_BASE}/search_player?name=${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error(`Python API returned ${response.status}`);
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // /player/lastgames_by_name endpoint
    if (url.pathname === "/player/lastgames_by_name") {
      const name = url.searchParams.get("name");
      const numGames = url.searchParams.get("num_games") || "5";

      if (!name) return new Response(JSON.stringify({ error: "Missing name parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

      try {
        const response = await fetch(`${PYTHON_API_BASE}/player/lastgames_by_name?name=${encodeURIComponent(name)}&num_games=${numGames}`);
        if (!response.ok) throw new Error(`Python API returned ${response.status}`);
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    //ai/analyze_player endpoint
    if (url.pathname == "/ai/analyze_player" && request.method === "POST") {
      try {
        interface AnalyzePlayerRequest {
          name: string;
        }
        interface PlayerGame {
          game_date: string;
          pts: number;
          reb: number;
          ast: number;
        }
        interface LastGamesResponse {
          player_name: string;
          player_id: number;
          recent_games: PlayerGame[];
        }

        const body: AnalyzePlayerRequest = await request.json();
        const playerName = body.name;
        if (!playerName) {
          return new Response(JSON.stringify({ error: "Missing player name" }), {
            status: 400, headers: { "Content-type": "application/json" } });
            // this reads the user input
          }
          // fetches the last 5 games from Python code
          const statsRes = await fetch(`${PYTHON_API_BASE}/player/lastgames_by_name?name=${encodeURIComponent(
            playerName)}&num_games=5`)
            if (!statsRes.ok) throw new Error("Failed to fetch player stats");

            const statsData: LastGamesResponse = await statsRes.json();

            // building ai prompt

            const prompt = `
You are an expert NBA analyst.
Analyze the following recent game stats and summarize the player's performance clearly and concisely.

Player: ${playerName}
Stats:
${JSON.stringify(statsData.recent_games, null, 2)}
`;
            
            // call llama 3.3 workers ai
            const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct", {
              prompt, max_tokens: 300});

              return new Response(
                JSON.stringify({player: playerName, analysis: aiResponse.response }),
                { headers: {"Content-Type": "application/json" } }
              );
            } catch (err) {
              return new Response(JSON.stringify({ error: String(err) }), {
                status: 500, headers: { "Content-Type": "application/json" } });

              }
            }
            return new Response(JSON.stringify({ error: "Endpoint not found" }), {
              status: 404, headers: {"Content-Type": "application/json" } });
            },          
          
          
          
};
    

    
