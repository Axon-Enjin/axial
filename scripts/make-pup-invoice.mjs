import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="900" height="1100" xmlns="http://www.w3.org/2000/svg">
  <rect width="900" height="1100" fill="#ffffff"/>
  <rect x="24" y="24" width="852" height="1052" fill="none" stroke="#cbd5e1" stroke-width="2"/>
  <text x="56" y="90" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#0f172a">SALES INVOICE</text>
  <text x="844" y="78" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#334155">Invoice No.</text>
  <text x="844" y="104" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#0f172a">INV-2026-7701</text>
  <text x="844" y="132" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#475569">Date</text>
  <text x="844" y="154" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#0f172a">July 18, 2026</text>
  <line x1="56" y1="180" x2="844" y2="180" stroke="#14b8a6" stroke-width="3"/>
  <text x="56" y="220" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#64748b">SELLER</text>
  <text x="56" y="248" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#0f172a">Axial Demo MSME Inc.</text>
  <text x="56" y="274" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#334155">TIN: 123-456-789-00000</text>
  <text x="56" y="296" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#334155">Makati City, Metro Manila, Philippines</text>
  <text x="480" y="220" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#64748b">BILL TO</text>
  <text x="480" y="248" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#0f172a">PUP</text>
  <text x="480" y="274" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#334155">TIN: 000-123-456-00000</text>
  <text x="480" y="296" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#334155">Sta. Mesa, Manila, Philippines</text>
  <rect x="56" y="340" width="788" height="44" fill="#f1f5f9"/>
  <text x="72" y="368" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#475569">DESCRIPTION</text>
  <text x="420" y="368" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#475569">QTY</text>
  <text x="520" y="368" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#475569">UNIT PRICE</text>
  <text x="720" y="368" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#475569">AMOUNT (PHP)</text>
  <text x="72" y="420" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#0f172a">Campus services and materials Net 60</text>
  <text x="420" y="420" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#0f172a">1</text>
  <text x="520" y="420" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#0f172a">PHP 150,000.00</text>
  <text x="720" y="420" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#0f172a">PHP 150,000.00</text>
  <line x1="56" y1="450" x2="844" y2="450" stroke="#e2e8f0" stroke-width="1"/>
  <text x="560" y="520" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#475569">Subtotal (PHP)</text>
  <text x="844" y="520" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#0f172a">PHP 150,000.00</text>
  <text x="560" y="560" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#0f172a">TOTAL AMOUNT DUE</text>
  <text x="844" y="560" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#0f172a">PHP 150,000.00</text>
  <line x1="560" y1="575" x2="844" y2="575" stroke="#0f172a" stroke-width="2"/>
  <text x="56" y="640" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#0f172a">PAYMENT TERMS</text>
  <text x="56" y="668" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#0f172a">Net 60</text>
  <text x="56" y="710" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#64748b">Please settle payment within 60 days from the invoice date.</text>
  <text x="450" y="980" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-style="italic" fill="#94a3b8">Thank you for your business.</text>
  <text x="56" y="1040" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#94a3b8">BILL TO PUP · Invoice Number: INV-2026-7701 · Axial Demo — OCR sample</text>
</svg>`;

const outPublic = path.join(
  root,
  "web",
  "public",
  "samples",
  "invoices",
  "invoice-inv-2026-7701-pup.png",
);
const outDocs = path.join(
  root,
  "docs",
  "samples",
  "invoices",
  "invoice-inv-2026-7701-pup.png",
);

fs.mkdirSync(path.dirname(outPublic), { recursive: true });
fs.mkdirSync(path.dirname(outDocs), { recursive: true });

await sharp(Buffer.from(svg)).png().toFile(outPublic);
fs.copyFileSync(outPublic, outDocs);
console.log("wrote", outPublic);
console.log("wrote", outDocs);
