import {
  POKEMON_URL,
  PRELOAD_IMAGE_URL,
  PRELOAD_IMAGES_DIR,
  SERVER_PORT,
} from "@constants/paths";
import { file } from "bun";
import { join } from "path";

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
      [PRELOAD_IMAGE_URL]: {
        GET: async (req) => {
          const { img } = req.params;
          const filePath = join(PRELOAD_IMAGES_DIR, img);
          const staticFile = file(filePath);
          if (await staticFile.exists()) {
            return new Response(staticFile);
          } else {
            console.warn(`  Static file not found: ${filePath}`);
            return new Response("Static File Not Found", { status: 404 });
          }
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
