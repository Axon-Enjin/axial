const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  pdf: "application/pdf",
};

/** Browsers on Windows often send an empty `file.type` for uploads. */
export function resolveUploadMimeType(
  declared: string,
  filename?: string,
): string {
  if (declared && declared !== "application/octet-stream") {
    return declared;
  }
  const ext = filename?.split(".").pop()?.toLowerCase();
  if (ext && EXT_TO_MIME[ext]) {
    return EXT_TO_MIME[ext];
  }
  return declared || "application/octet-stream";
}
