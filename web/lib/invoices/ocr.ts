import { createWorker } from "tesseract.js";

const MAX_OCR_BYTES = 8 * 1024 * 1024;

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
    return runTesseract(buffer);
  }

  throw new Error("Unsupported file type. Use PNG, JPEG, or PDF.");
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = (result.text ?? "").trim();
    if (text.length >= 40) {
      return text;
    }
    throw new Error(
      "PDF has little extractable text — export as PNG/JPEG or use a text-based PDF.",
    );
  } finally {
    await parser.destroy();
  }
}

async function runTesseract(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return (data.text ?? "").trim();
  } finally {
    await worker.terminate();
  }
}
