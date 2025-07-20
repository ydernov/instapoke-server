import { join } from "path";

export const SERVER_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// paths
export const PROJECT_ROOT = join(import.meta.dir, "..", "..") as "{ROOT}";
export const ORIGINAL_DATA_DIR = join(PROJECT_ROOT, "original_data");
export const LOCAL_DATA_DIR = join(PROJECT_ROOT, "local_data");
export const PRELOAD_IMAGES_DIR = join(PROJECT_ROOT, "preload_images");

// URLs
export const API_URL = "/api";
export const POKEMON_URL = join(API_URL, "pokemon");
export const PRELOAD_IMAGE_URL = "/preload-image/:img";
