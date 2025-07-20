import { LOCAL_DATA_DIR, PRELOAD_IMAGES_DIR } from "@constants/paths";
import { existsSync, mkdirSync } from "node:fs";

function checkImagesDir() {
  if (!existsSync(PRELOAD_IMAGES_DIR)) {
    console.log(`Creating output directory: ${PRELOAD_IMAGES_DIR}`);
    mkdirSync(PRELOAD_IMAGES_DIR, { recursive: true });
  }
}

function checkLocalDataDir() {
  if (!existsSync(LOCAL_DATA_DIR)) {
    console.log(`Creating output directory: ${LOCAL_DATA_DIR}`);
    mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }
}

export function checkDirs() {
  checkLocalDataDir();
  checkImagesDir();
}
