import { POKEMON_URL, SERVER_PORT } from "@constants/paths";

async function main() {
  const server = Bun.serve({
    port: SERVER_PORT,
    routes: {
      [POKEMON_URL]: {
        GET: async (req) => {
          const url = new URL(req.url);
          const params = url.searchParams;

          const offset = parseInt(params.get("offset") || "0");
          const limit = parseInt(params.get("limit") || "10");

          const types = params.getAll("types");
          const abilities = params.getAll("abilities");
          const moves = params.getAll("moves");

          return Response.json(
            `Response from ${url}, ${offset} ${limit} ${types} ${abilities} ${moves}`
          );
        },
      },
    },
    error(error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    },
  });

  console.log(`Listening on http://localhost:${server.port} ...`);
}

main();
