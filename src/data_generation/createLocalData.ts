import { createLocalFiltersJSON } from "./createLocalFiltersData";
import { generateLocalPokemonJSON } from "./createLocalPokemonData";
import { runChecks } from "./runChecks";

async function createLocalData() {
  await runChecks();

  try {
    await createLocalFiltersJSON();
  } catch (e) {
    console.error(
      "An error occured, while trying to generate local filters",
      e
    );
    throw new Error("createLocalData aborted");
  }

  try {
    await generateLocalPokemonJSON();
  } catch (e) {
    console.error(
      "An error occured, while trying to generate local pokemon json",
      e
    );
    throw new Error("createLocalData aborted");
  }
}

createLocalData();
