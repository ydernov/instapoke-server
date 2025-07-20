import { LOCAL_DATA_DIR } from "@constants/paths";
import pokemon from "@r/original_data/pokemon.json";
import { join } from "path";
import { fetchAndCompressImage } from "./createPreloadImage";

type PokemonResponseFromPokeAPI = {
  id: number;
  name: string;

  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];

  sprites: {
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
  };

  abilities: { ability: { name: string; url: string } }[];

  moves: {
    move: { name: string; url: string };
  }[];
};

export type Pokemon = {
  id: number;
  name: string;
  types: string[];
  imageURL: string | null;
  smallImageURL: string | null;
  abilities: string[];
  moves: string[];
};

export async function generateLocalPokemonJSON() {
  const BATCH_SIZE = 5;
  const DELAY_MS = 1000;

  const outputFilePath = join(LOCAL_DATA_DIR, "pokemon.json");

  const localPokemonFile = Bun.file(outputFilePath, {
    type: "application/json",
  });
  const fileWriter = localPokemonFile.writer();

  fileWriter.write("[\n");
  await fileWriter.flush();

  let isFirstPokemonWritten = true;

  for (let i = 0; i < pokemon.results.length; i += BATCH_SIZE) {
    const batchUrls = pokemon.results.slice(i, i + BATCH_SIZE);
    const currentBatchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(pokemon.results.length / BATCH_SIZE);

    console.log(
      `\nProcessing batch ${currentBatchNum}/${totalBatches} (${batchUrls.length} items)...`
    );

    const batchPromises = batchUrls.map(
      async ({ url }): Promise<Pokemon | null> => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.error(
              `  Failed to fetch detail for ${url}: ${response.status} ${response.statusText}`
            );
            return null;
          }
          const result = (await response.json()) as PokemonResponseFromPokeAPI;
          const imageURL =
            result.sprites.other["official-artwork"].front_default;
          let smallImageURL: string | null = null;

          if (imageURL) {
            try {
              const imgFileName = await fetchAndCompressImage({
                url: imageURL,
              });
              if (imgFileName) {
                smallImageURL = imgFileName;
              } else {
                console.warn(
                  `  Failed to generate small image for ${result.name}. smallImageURL will be empty.`
                );
              }
            } catch (imgErr) {
              console.error(
                `  Error compressing image for ${result.name} (ID: ${result.id}):`,
                imgErr
              );
              smallImageURL = null;
            }
          }

          return {
            id: result.id,
            name: result.name,
            types: result.types.map((t) => t.type.name),
            abilities: result.abilities.map((a) => a.ability.name),
            moves: result.moves.map((m) => m.move.name),
            imageURL,
            smallImageURL,
          };
        } catch (error) {
          console.error(`  Error processing Pokemon from URL ${url}:`, error);
          return null; // Indicate failure for this Pokemon
        }
      }
    );

    const processedBatch = await Promise.all(batchPromises);

    for (const pokemon of processedBatch) {
      if (pokemon) {
        if (!isFirstPokemonWritten) {
          fileWriter.write(",\n");
        }
        fileWriter.write(
          "  " + JSON.stringify(pokemon, null, 2).replace(/\n/g, "\n  ")
        ); // Write with 4-space indent
        isFirstPokemonWritten = false;
      }
    }
    await fileWriter.flush();

    if (i + BATCH_SIZE < pokemon.results.length) {
      console.log(`Waiting ${DELAY_MS}ms before processing next batch...`);
      await Bun.sleep(DELAY_MS);
    }
  }

  fileWriter.write("\n]\n");

  await fileWriter.flush();
  fileWriter.end();

  console.log(
    `\nSuccessfully generated local Pokemon data to: ${outputFilePath}`
  );
}
