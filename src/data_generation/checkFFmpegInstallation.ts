export async function checkFFmpegInstallation(): Promise<boolean> {
  console.log("Checking FFmpeg installation...");
  try {
    // Try to run a simple ffmpeg command (e.g., ffmpeg -version)
    // We redirect stdout/stderr to 'ignore' to keep the console clean
    const proc = Bun.spawn(["ffmpeg", "-version"], {
      stdout: "ignore",
      stderr: "ignore",
    });
    const exitCode = await proc.exited;
    if (exitCode === 0) {
      console.log("FFmpeg is installed and accessible.");
      return true;
    } else {
      console.error(
        `FFmpeg command exited with code ${exitCode}. It might not be installed correctly or in PATH.`
      );
      return false;
    }
  } catch (error) {
    console.error("Error checking FFmpeg installation:", error);
    console.error(
      "Please ensure FFmpeg is installed and added to your system's PATH."
    );
    return false;
  }
}
