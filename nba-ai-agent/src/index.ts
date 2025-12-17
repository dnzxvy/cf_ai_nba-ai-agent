export interface Env {}

const PYTHON_API_BASE = "https://your-fastapi-deployed-url.com";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

    // Catch-all 404
    return new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  },
};
