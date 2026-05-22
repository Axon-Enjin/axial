import { createWorker, PSM, type Worker } from "tesseract.js";

const MAX_OCR_BYTES = 8 * 1024 * 1024;
/** Cloud Run default request timeout is 30s — keep OCR under ~25s unless host allows more. */
const SERVERLESS_OCR_BUDGET_MS = 25_000;
const CLOUD_RUN_OCR_BUDGET_MS = 110_000;

function ocrBudgetMs(): number {
  if (process.env.K_SERVICE) return CLOUD_RUN_OCR_BUDGET_MS;
  if (process.env.VERCEL === "1") return SERVERLESS_OCR_BUDGET_MS;
  return CLOUD_RUN_OCR_BUDGET_MS;
}

function isCloudRun(): boolean {
  return Boolean(process.env.K_SERVICE);
}

function isServerlessHost(): boolean {
  return process.env.VERCEL === "1" || isCloudRun();
}

/** Cold Tesseract init on Cloud Run can exceed 8s; Vercel Hobby stays tight. */
function workerStartupBudgetMs(): number {
  if (isCloudRun()) return 60_000;
  if (process.env.VERCEL === "1") return 8_000;
  return 30_000;
}

/** Tesseract is heavy on cold serverless; PDF text + sample import stay enabled. */
export function isImageOcrEnabled(): boolean {
  if (process.env.AXIAL_OCR_ENABLED === "true") return true;
  if (process.env.AXIAL_OCR_ENABLED === "false") return false;
  if (process.env.VERCEL === "1") return false;
  return true;
}

let sharedWorker: Worker | null = null;
let sharedWorkerInit: Promise<Worker> | null = null;

async function getSharedWorker(): Promise<Worker> {
  if (sharedWorker) return sharedWorker;
  if (!sharedWorkerInit) {
    sharedWorkerInit = initWorker();
  }
  sharedWorker = await sharedWorkerInit;
  return sharedWorker;
}

async function initWorker(): Promise<Worker> {
  const isProd = process.env.NODE_ENV === "production";
  const cachePath = isProd ? "/tmp" : process.cwd();
  const langPath = isProd ? process.cwd() : undefined;

  const worker = await createWorker("eng", 1, {
    cachePath,
    langPath,
    logger: () => {},
  });
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
  });
  return worker;
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
        "Image OCR is disabled on Vercel Hobby. Use a text-based PDF, click “sample invoice”, or deploy on Cloud Run.",
      );
    }
    const normalized = await normalizeImageForOcr(buffer);
    return runTesseract(normalized);
  }

  throw new Error("Unsupported file type. Use PNG, JPEG, or PDF.");
}

async function normalizeImageForOcr(buffer: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import("sharp")).default;
    return await sharp(buffer)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
  } catch {
    return buffer;
  }
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
            `${label} timed out after ${Math.round(ms / 1000)}s. Try a smaller image, a text PDF, or sample invoice.`,
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
  const budget = ocrBudgetMs();
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await withTimeout(
      parser.getText(),
      Math.min(budget, 25_000),
      "PDF text extraction",
    );
    const text = (result.text ?? "").trim();
    if (text.length >= 40) {
      return text;
    }
    throw new Error(
      "PDF has little extractable text — use sample invoice or a text-based PDF export.",
    );
  } finally {
    await parser.destroy();
  }
}

async function runTesseract(buffer: Buffer): Promise<string> {
  const budget = ocrBudgetMs();
  const startupMs = workerStartupBudgetMs();
  const recognizeMs = Math.max(8_000, budget - startupMs);

  const worker = await withTimeout(
    getSharedWorker(),
    startupMs,
    "Tesseract worker startup",
  );

  try {
    const { data } = await withTimeout(
      worker.recognize(buffer),
      recognizeMs,
      "Tesseract recognize",
    );
    const text = (data.text ?? "").trim();
    if (text.length < 12) {
      throw new Error("OCR returned too little text — try a clearer scan or PDF.");
    }
    return text;
  } catch (err) {
    if (
      err instanceof Error &&
      /timed out/i.test(err.message) &&
      isServerlessHost()
    ) {
      throw new Error(
        `${err.message} On Cloud Run, redeploy with --timeout=120 (see deploy-cloudrun.yml).`,
      );
    }
    throw err;
  }
}
