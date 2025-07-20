import { join } from "path";

export const SERVER_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// paths
export const PROJECT_ROOT = join(import.meta.dir, "..", "..") as "{ROOT}";
export const LOCAL_DATA_DIR = join(PROJECT_ROOT, "local_data");

// URLs
export const API_URL = "/api";
export const POKEMON_URL = join(API_URL, "pokemon");
