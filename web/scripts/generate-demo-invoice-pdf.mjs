/**
 * Generates text-based demo invoice PDFs (no OCR needed on upload).
 * Run: node scripts/generate-demo-invoice-pdf.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/samples/invoices");

const DEMOS = [
  {
    file: "invoice-inv-2023-8901.pdf",
    lines: [
      "AXIAL DEMO — B2B INVOICE",
      "",
      "Invoice Number: INV-2023-8901",
      "Invoice Date: May 15, 2025",
      "",
      "FROM",
      "Axial Demo MSME Inc.",
      "TIN: 123-456-789-00000",
      "",
      "BILL TO",
      "Acme Logistics Corp",
      "TIN: 987-654-321-00000",
      "",
      "Payment Terms: Net 60",
      "",
      "Description                          Amount",
      "Logistics and platform services      PHP 100,000.00",
      "Tax                                  PHP 25,000.00",
      "",
      "TOTAL AMOUNT DUE: PHP 125,000.00",
    ],
  },
  {
    file: "invoice-inv-2023-8904.pdf",
    lines: [
      "AXIAL DEMO — B2B INVOICE",
      "",
      "Invoice Number: INV-2023-8904",
      "Invoice Date: June 1, 2025",
      "",
      "BILL TO",
      "Nexus Tech Solutions",
      "TIN: 111-222-333-00000",
      "",
      "Payment Terms: Net 90",
      "",
      "TOTAL AMOUNT DUE: PHP 450,000.00",
    ],
  },
];

function escapePdfText(s) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdf(lines) {
  const fontSize = 11;
  const lineHeight = 15;
  const x = 50;
  const startY = 740;

  let stream = "BT\n/F1 " + fontSize + " Tf\n";
  for (let i = 0; i < lines.length; i++) {
    const y = startY - i * lineHeight;
    const text = lines[i].length === 0 ? " " : lines[i];
    stream += `1 0 0 1 ${x} ${y} Tm\n(${escapePdfText(text)}) Tj\n`;
  }
  stream += "ET\n";

  const streamLen = Buffer.byteLength(stream, "utf8");

  const objects = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
  );
  objects.push(
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}endstream\nendobj\n`,
  );
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  );

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF\n`;

  return pdf;
}

fs.mkdirSync(outDir, { recursive: true });

for (const demo of DEMOS) {
  const pdf = buildPdf(demo.lines);
  const outPath = path.join(outDir, demo.file);
  fs.writeFileSync(outPath, pdf, "utf8");
  console.log("Wrote", outPath, `(${Buffer.byteLength(pdf)} bytes)`);
}
