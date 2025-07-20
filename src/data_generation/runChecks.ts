import { checkDirs } from "./checkDirs";
import { checkFFmpegInstallation } from "./checkFFmpegInstallation";

export async function runChecks() {
  checkDirs();
  const isFFmpegInstalled = await checkFFmpegInstallation();
  if (!isFFmpegInstalled) {
    throw new Error(
      "FFmpeg is not installed or not found in PATH. Data generation aborted."
    );
  }
}
