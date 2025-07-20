import ability from "@r/original_data/ability.json";
import move from "@r/original_data/move.json";
import typeJson from "@r/original_data/type.json";
import { join } from "path";
import { LOCAL_DATA_DIR } from "src/constants/paths";

export async function createLocalFiltersJSON() {
  const abilityOutput = join(LOCAL_DATA_DIR, "ability.json");
  const typeOutput = join(LOCAL_DATA_DIR, "type.json");
  const moveOutput = join(LOCAL_DATA_DIR, "move.json");

  const localAbilityFile = Bun.file(abilityOutput, {
    type: "application/json",
  });
  const localTypeFile = Bun.file(typeOutput, {
    type: "application/json",
  });
  const localMoveFile = Bun.file(moveOutput, {
    type: "application/json",
  });

  const abilitiesArrJson = JSON.stringify(
    ability.results.map((m) => m.name),
    null,
    2
  );

  const typesArrJson = JSON.stringify(
    typeJson.results.map((m) => m.name),
    null,
    2
  );

  const movesArrJson = JSON.stringify(
    move.results.map((m) => m.name),
    null,
    2
  );

  await Promise.all([
    localAbilityFile.write(abilitiesArrJson).then(() => {
      console.log(
        `\nSuccessfully generated local Abilities data to: ${abilityOutput}`
      );
    }),
    localTypeFile.write(typesArrJson).then(() => {
      console.log(
        `\nSuccessfully generated local Types data to: ${typeOutput}`
      );
    }),
    localMoveFile.write(movesArrJson).then(() => {
      console.log(
        `\nSuccessfully generated local Moves data to: ${moveOutput}`
      );
    }),
  ]);

  console.log("Filters data generation finished");
}
