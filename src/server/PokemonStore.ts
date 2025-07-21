import { existsSync } from "node:fs";
import type { Pokemon } from "../data_generation/createLocalPokemonData";

export type FilteredPokemonResponse = {
  count: number;
  hasMore: boolean;
  pokemon: Pokemon[];
};

export class PokemonStore {
  private pokemonById: Map<number, Pokemon> = new Map();
  private allPokemonIds: number[] = [];

  // Inverted indexes for efficient filtering
  private pokemonByTypes: Map<string, Set<number>> = new Map();
  private pokemonByAbilities: Map<string, Set<number>> = new Map();
  private pokemonByMoves: Map<string, Set<number>> = new Map();

  async init(jsonFilePath: string): Promise<void> {
    console.log(`Attempting to load Pokemon data from: ${jsonFilePath}`);

    if (!existsSync(jsonFilePath)) {
      throw new Error(`Pokemon data file not found at: ${jsonFilePath}`);
    }

    const file = Bun.file(jsonFilePath);
    let pokemonArray: Pokemon[];
    try {
      pokemonArray = await file.json();
    } catch (error) {
      throw new Error(`Failed to parse Pokemon JSON file: ${error}`);
    }

    if (!pokemonArray || !Array.isArray(pokemonArray)) {
      throw new Error("Invalid PJSON format: 'pokemon' array not found.");
    }

    console.log(`Loaded ${pokemonArray.length} Pokemon. Building indexes...`);
    this.buildIndexes(pokemonArray);
    console.log("Indexes built successfully.");
  }

  /**
   * Builds the in-memory indexes from the raw Pokemon data.
   * @param pokemonList An array of `Pokemon` objects.
   */
  private buildIndexes(pokemonList: Pokemon[]): void {
    // Clear existing indexes before rebuilding
    this.pokemonById.clear();
    this.allPokemonIds = [];
    this.pokemonByTypes.clear();
    this.pokemonByAbilities.clear();
    this.pokemonByMoves.clear();

    for (const pokemon of pokemonList) {
      this.pokemonById.set(pokemon.id, pokemon);
      this.allPokemonIds.push(pokemon.id);

      // Populate types index
      for (const type of pokemon.types) {
        const normalizedType = type.toLowerCase();
        if (!this.pokemonByTypes.has(normalizedType)) {
          this.pokemonByTypes.set(normalizedType, new Set());
        }
        this.pokemonByTypes.get(normalizedType)!.add(pokemon.id);
      }

      // Populate abilities index
      for (const ability of pokemon.abilities) {
        const normalizedAbility = ability.toLowerCase();
        if (!this.pokemonByAbilities.has(normalizedAbility)) {
          this.pokemonByAbilities.set(normalizedAbility, new Set());
        }
        this.pokemonByAbilities.get(normalizedAbility)!.add(pokemon.id);
      }

      // Populate moves index
      for (const move of pokemon.moves) {
        const normalizedMove = move.toLowerCase();
        if (!this.pokemonByMoves.has(normalizedMove)) {
          this.pokemonByMoves.set(normalizedMove, new Set());
        }
        this.pokemonByMoves.get(normalizedMove)!.add(pokemon.id);
      }
    }

    this.allPokemonIds.sort((a, b) => a - b);
  }

  private intersectSets = (
    currentSet: Set<number> | null,
    newSet: Set<number>
  ): Set<number> => {
    if (!currentSet) {
      return new Set(newSet);
    }
    return currentSet.intersection(newSet);
  };

  getFilteredPokemon({
    types,
    abilities,
    moves,
    offset = 0,
    limit = 20,
  }: {
    types?: Set<string>;
    abilities?: Set<string>;
    moves?: Set<string>;
    offset: number;
    limit: number;
  }): FilteredPokemonResponse {
    let resultSet: Set<number> | null = null;

    // Filter by Types
    if (types && types.size > 0) {
      let typeIntersection: Set<number> | null = null;
      for (const type of types) {
        const normalizedType = type.toLowerCase();
        const idsForType = this.pokemonByTypes.get(normalizedType);
        if (idsForType) {
          typeIntersection = this.intersectSets(typeIntersection, idsForType);
        } else {
          typeIntersection = new Set();
          break;
        }
      }
      resultSet = this.intersectSets(resultSet, typeIntersection!);

      if (resultSet.size === 0) {
        return {
          count: 0,
          hasMore: false,
          pokemon: [],
        };
      }
    }

    // Filter by Abilities
    if (abilities && abilities.size > 0) {
      let abilityIntersection: Set<number> | null = null;
      for (const ability of abilities) {
        const normalizedAbility = ability.toLowerCase();
        const idsForAbility = this.pokemonByAbilities.get(normalizedAbility);
        if (idsForAbility) {
          abilityIntersection = this.intersectSets(
            abilityIntersection,
            idsForAbility
          );
        } else {
          abilityIntersection = new Set();
          break;
        }
      }
      resultSet = this.intersectSets(resultSet, abilityIntersection!);

      if (resultSet.size === 0) {
        return {
          count: 0,
          hasMore: false,
          pokemon: [],
        };
      }
    }

    // Filter by Moves
    if (moves && moves.size > 0) {
      let moveIntersection: Set<number> | null = null;
      for (const move of moves) {
        const normalizedMove = move.toLowerCase();
        const idsForMove = this.pokemonByMoves.get(normalizedMove);
        if (idsForMove) {
          moveIntersection = this.intersectSets(moveIntersection, idsForMove);
        } else {
          moveIntersection = new Set();
          break;
        }
      }
      resultSet = this.intersectSets(resultSet, moveIntersection!);

      if (resultSet.size === 0) {
        return {
          count: 0,
          hasMore: false,
          pokemon: [],
        };
      }
    }

    // If no filters were applied, use all Pokemon IDs
    const finalPokemonIds = resultSet
      ? Array.from(resultSet)
      : [...this.allPokemonIds];

    finalPokemonIds.sort((a, b) => a - b);

    const totalCount = finalPokemonIds.length;
    const paginatedIds = finalPokemonIds.slice(offset, offset + limit);

    // Retrieve full Pokemon objects
    const paginatedPokemon: Pokemon[] = [];
    for (const id of paginatedIds) {
      const pokemon = this.pokemonById.get(id);
      if (pokemon) {
        paginatedPokemon.push(pokemon);
      }
    }

    const hasMore = offset + limit < totalCount;

    return {
      count: totalCount,
      hasMore: hasMore,
      pokemon: paginatedPokemon,
    };
  }
}
