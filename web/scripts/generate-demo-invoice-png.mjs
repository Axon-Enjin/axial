/**
 * Renders OCR-friendly demo invoice PNGs (sharp SVG → PNG).
 * Run: node scripts/generate-demo-invoice-png.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/samples/invoices");

const WIDTH = 1200;
const HEIGHT = 1550;

const DEMOS = [
  {
    file: "invoice-inv-2023-8912.png",
    invoiceNo: "INV-2023-8912",
    date: "May 19, 2026",
    buyer: "Global Freight Systems",
    buyerTin: "555-666-777-00000",
    amount: "275,000.00",
    terms: "Net 45",
    description: "Freight forwarding and customs clearance",
  },
  {
    file: "invoice-inv-2023-8918.png",
    invoiceNo: "INV-2023-8918",
    date: "May 22, 2026",
    buyer: "Pacific Rim Trading Corp",
    buyerTin: "222-333-444-00000",
    amount: "180,500.00",
    terms: "Net 30",
    description: "Wholesale inventory and distribution",
  },
];

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildInvoiceSvg(demo) {
  const e = escapeXml;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}" fill="none" stroke="#333333" stroke-width="2"/>

  <text x="80" y="120" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#111111">SALES INVOICE</text>
  <text x="80" y="165" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#444444">Axial Demo — OCR sample</text>

  <text x="880" y="110" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#444444">Invoice No.</text>
  <text x="880" y="145" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#111111">${e(demo.invoiceNo)}</text>
  <text x="880" y="185" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#444444">Date</text>
  <text x="880" y="218" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#111111">${e(demo.date)}</text>

  <rect x="80" y="250" width="1040" height="4" fill="#0d9488"/>

  <text x="80" y="310" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#555555">SELLER</text>
  <text x="620" y="310" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#555555">BUYER</text>

  <text x="80" y="350" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#111111">Axial Demo MSME Inc.</text>
  <text x="620" y="350" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#111111">${e(demo.buyer)}</text>
  <text x="80" y="385" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#333333">TIN: 123-456-789-00000</text>
  <text x="620" y="385" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#333333">TIN: ${e(demo.buyerTin)}</text>
  <text x="80" y="420" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#333333">Makati City, Metro Manila</text>
  <text x="620" y="420" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#333333">Cebu City, Philippines</text>

  <rect x="80" y="460" width="1040" height="44" fill="#f3f4f6" stroke="#cccccc"/>
  <text x="100" y="490" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#333333">DESCRIPTION</text>
  <text x="520" y="490" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#333333">QTY</text>
  <text x="640" y="490" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#333333">UNIT PRICE</text>
  <text x="860" y="490" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#333333">AMOUNT (PHP)</text>

  <rect x="80" y="504" width="1040" height="72" fill="none" stroke="#cccccc"/>
  <text x="100" y="550" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#111111">${e(demo.description)}</text>
  <text x="540" y="550" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#111111">1</text>
  <text x="640" y="550" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#111111">PHP ${e(demo.amount)}</text>
  <text x="900" y="550" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#111111">PHP ${e(demo.amount)}</text>

  <text x="720" y="630" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#444444">Subtotal (PHP)</text>
  <text x="980" y="630" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#111111" text-anchor="end">PHP ${e(demo.amount)}</text>
  <text x="720" y="675" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#111111">TOTAL AMOUNT DUE</text>
  <text x="980" y="710" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#111111" text-anchor="end">PHP ${e(demo.amount)}</text>
  <line x1="720" y1="722" x2="980" y2="722" stroke="#111111" stroke-width="2"/>

  <text x="80" y="760" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#333333">PAYMENT TERMS</text>
  <text x="80" y="795" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="#111111">${e(demo.terms)}</text>
  <text x="80" y="840" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#555555">BILL TO ${e(demo.buyer)}</text>
  <text x="80" y="875" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#555555">Invoice Number: ${e(demo.invoiceNo)}</text>

  <text x="600" y="1480" font-family="Arial, Helvetica, sans-serif" font-size="18" font-style="italic" fill="#666666" text-anchor="middle">Thank you for your business.</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

for (const demo of DEMOS) {
  const svg = buildInvoiceSvg(demo);
  const outPath = path.join(outDir, demo.file);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toFile(outPath);
  const stat = fs.statSync(outPath);
  console.log("Wrote", outPath, `(${stat.size} bytes)`);
}
