import { createWorker } from "tesseract.js";

const MAX_OCR_BYTES = 8 * 1024 * 1024;
const TESSERACT_TIMEOUT_MS = 45_000;

/** Tesseract cold start often exceeds Vercel Hobby's 10s limit; PDF text extract is lighter. */
export function isImageOcrEnabled(): boolean {
  if (process.env.AXIAL_OCR_ENABLED === "true") return true;
  if (process.env.AXIAL_OCR_ENABLED === "false") return false;
  return process.env.VERCEL !== "1";
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (buffer.length > MAX_OCR_BYTES) {
    throw new Error("File too large for OCR (max 8MB)");
  }

  if (mimeType === "application/pdf") {
    return extractPdfText(buffer);
  }

  if (mimeType.startsWith("image/")) {
    if (!isImageOcrEnabled()) {
      throw new Error(
        "Image OCR is disabled on this host (Vercel serverless). Use a text-based PDF, click “sample invoice”, or set AXIAL_OCR_ENABLED=true on a Pro plan with 60s functions.",
      );
    }
    return runTesseract(buffer);
  }

  throw new Error("Unsupported file type. Use PNG, JPEG, or PDF.");
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            `${label} timed out after ${ms}ms — on Vercel Hobby the limit is 10s; image OCR needs Pro or use PDF / sample invoice.`,
          ),
        ),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await withTimeout(
      parser.getText(),
      25_000,
      "PDF text extraction",
    );
    const text = (result.text ?? "").trim();
    if (text.length >= 40) {
      return text;
    }
    throw new Error(
      "PDF has little extractable text — export as PNG/JPEG locally or use the sample invoice button.",
    );
  } finally {
    await parser.destroy();
  }
}

async function runTesseract(buffer: Buffer): Promise<string> {
  const cachePath =
    process.env.VERCEL === "1" ? "/tmp" : process.cwd();

  const worker = await withTimeout(
    createWorker("eng", 1, {
      cachePath,
      logger: () => {},
    }),
    30_000,
    "Tesseract worker startup",
  );

  try {
    const { data } = await withTimeout(
      worker.recognize(buffer),
      TESSERACT_TIMEOUT_MS,
      "Tesseract recognize",
    );
    const text = (data.text ?? "").trim();
    if (text.length < 12) {
      throw new Error("OCR returned too little text — try a clearer scan or PDF.");
    }
    return text;
  } finally {
    await worker.terminate();
  }
}
