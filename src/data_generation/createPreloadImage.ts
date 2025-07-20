import { PRELOAD_IMAGES_DIR } from "@constants/paths";
import { join } from "path";

function getFilenameWithoutExtension(url: string) {
  const urlObj = new URL(url);
  const path = urlObj.pathname;

  const lastSlashIndex = path.lastIndexOf("/");
  let filenameWithExtension = path.substring(lastSlashIndex + 1);

  const dotIndex = filenameWithExtension.lastIndexOf(".");
  if (dotIndex > -1) {
    return filenameWithExtension.substring(0, dotIndex);
  }
  return filenameWithExtension;
}

export async function fetchAndCompressImage({
  url,
  targetWidth = 60,
  quality = 80,
}: {
  url: string;
  targetWidth?: number;
  quality?: number;
}) {
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to download image or response body is null: ${response.statusText}`
    );
  }

  const outputFileName = `${getFilenameWithoutExtension(url)}.webp`;
  const outputFilePath = join(PRELOAD_IMAGES_DIR, outputFileName);

  const ffmpegCommand = [
    "ffmpeg",
    "-i",
    "pipe:0", // Read input from stdin
    "-f",
    "image2pipe", // Specify input format as image pipe (helps FFmpeg detect format)
    "-vf",
    `scale=${targetWidth}:-1,boxblur=1:1:cr=0:ar=0`, // Scale to targetWidth, maintaining aspect ratio
    "-pix_fmt",
    "yuva420p", // Explicitly set pixel format to YUV for WebP
    "-q:v",
    quality.toString(), // Set quality for WebP output
    "-vframes",
    "1", // Process only one frame as it's an image
    "-f",
    "webp", // Specify output format as webp
    "pipe:1", // Write output to stdout
  ];

  const proc = Bun.spawn(ffmpegCommand, {
    stdin: response.body, // Pass the image buffer directly to stdin
    stdout: "pipe", // Capture FFmpeg's output
    stderr: "inherit", // Pipe FFmpeg's stderr to current process stderr for debugging
  });

  // Read the entire output from FFmpeg's stdout into a buffer
  const outputBuffer = await new Response(proc.stdout).arrayBuffer();
  const processedImageData = new Uint8Array(outputBuffer);

  // Wait for the FFmpeg process to complete
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`FFmpeg command failed with exit code ${exitCode}`);
  }

  // Write the processed image data to the output file
  await Bun.write(outputFilePath, processedImageData);

  console.log(
    `Image successfully processed from stream and saved to: ${outputFilePath}`
  );
  return outputFileName;
}
