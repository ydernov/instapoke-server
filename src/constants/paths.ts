import { join } from "path";

const SERVER_DOMAIN_NAME = Bun.env.ORIGIN || "http://localhost";
export const SERVER_PORT = Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000;
export const SERVER_URL = new URL(SERVER_DOMAIN_NAME);
SERVER_URL.port = SERVER_PORT.toString();

// paths
export const PROJECT_ROOT = join(import.meta.dir, "..", "..") as "{ROOT}";
export const ORIGINAL_DATA_DIR = join(PROJECT_ROOT, "original_data");
export const LOCAL_DATA_DIR = join(PROJECT_ROOT, "local_data");
export const PRELOAD_IMAGES_DIR = join(PROJECT_ROOT, "preload_images");

// URLs
export const API_URL = "/api";
export const POKEMON_URL = join(API_URL, "pokemon");
export const PRELOAD_IMAGES_URL = "/preload-image";
export const PRELOAD_IMAGE_URL = join(PRELOAD_IMAGES_URL, ":img");
