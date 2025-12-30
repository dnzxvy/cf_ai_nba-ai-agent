export interface Env {
  AI: any;
  NBA_MEMORY: KVNamespace;
  ASSETS: Fetcher; // Bind this to the public folder
}

const PYTHON_API_BASE = "https://cf-ai-nba-ai-agent.onrender.com";

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Root endpoint: serve the HTML from public folder
    if (url.pathname === "/") {
      try {
        return await env.ASSETS.fetch("index.html"); // fetch index.html from public
      } catch (err) {
        return new Response("Error loading HTML", { status: 500 });
      }
    }

    // /search_player endpoint
    if (url.pathname === "/search_player") {
      const name = url.searchParams.get("name");
      if (!name)
        return new Response(JSON.stringify({ error: "Missing name parameter!" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });

      try {
        const response = await fetch(
          `${PYTHON_API_BASE}/search_player?name=${encodeURIComponent(name)}`
        );
        if (!response.ok) throw new Error(`Python API returned ${response.status}`);
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // /player/lastgames_by_name endpoint
    if (url.pathname === "/player/lastgames_by_name") {
      const name = url.searchParams.get("name");
      const numGames = url.searchParams.get("num_games") || "5";

      if (!name)
        return new Response(JSON.stringify({ error: "Missing name parameter" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });

      try {
        const response = await fetch(
          `${PYTHON_API_BASE}/player/lastgames_by_name?name=${encodeURIComponent(name)}&num_games=${numGames}`
        );
        if (!response.ok) throw new Error(`Python API returned ${response.status}`);
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // /ai/analyze_player endpoint
    if (url.pathname === "/ai/analyze_player" && request.method === "POST") {
      try {
        const body = (await request.json()) as AnalyzePlayerRequest;
        const playerName = body.name;

        if (!playerName) {
          return new Response(JSON.stringify({ error: "Missing player name" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const memoryKey = `player:${playerName.toLowerCase()}`;

        // check memory first
        const cached = await env.NBA_MEMORY.get(memoryKey);

        if (cached) {
          return new Response(
            JSON.stringify({
              player: playerName,
              analysis: cached,
              source: "memory",
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        // fetch stats from Python API
        const statsRes = await fetch(
          `${PYTHON_API_BASE}/player/lastgames_by_name?name=${encodeURIComponent(playerName)}&num_games=5`
        );

        if (!statsRes.ok) throw new Error("Failed to fetch player stats");

        const statsData = (await statsRes.json()) as LastGamesResponse;

        // build AI prompt
        const prompt = `
You are an expert NBA analyst.
Analyze the following recent game stats and summarize the player's performance clearly and concisely.

Player: ${playerName}
Stats:
${JSON.stringify(statsData.recent_games, null, 2)}
`;

        // call Llama AI
        const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          prompt,
          max_tokens: 300,
        });

        const analysis = aiResponse.response;
        await env.NBA_MEMORY.put(memoryKey, analysis);

        return new Response(
          JSON.stringify({
            player: playerName,
            analysis,
            source: "ai",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // fallback for unknown endpoints
    return new Response(JSON.stringify({ error: "Endpoint not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
};
