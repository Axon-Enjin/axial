/**
 * Renders OCR-friendly demo invoice PNGs (sharp SVG → PNG).
 * Run from web/: npm run generate:demo-png
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/samples/invoices");

const WIDTH = 1200;
const HEIGHT = 1550;

function formatPhp(n) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** OCR-friendly B2B invoices — amounts/terms match seed book where noted. */
const DEMOS = [
  {
    file: "invoice-inv-2023-8901.png",
    invoiceNo: "INV-2023-8901",
    date: "May 15, 2025",
    buyer: "Acme Logistics Corp",
    buyerTin: "987-654-321-00000",
    amount: formatPhp(125_000),
    terms: "Net 60",
    description: "Logistics and platform services",
  },
  {
    file: "invoice-inv-2023-8904.png",
    invoiceNo: "INV-2023-8904",
    date: "June 1, 2025",
    buyer: "Nexus Tech Solutions",
    buyerTin: "111-222-333-00000",
    amount: formatPhp(450_000),
    terms: "Net 90",
    description: "Enterprise software licensing",
  },
  {
    file: "invoice-inv-2023-8872.png",
    invoiceNo: "INV-2023-8872",
    date: "April 8, 2025",
    buyer: "Global Freight Systems",
    buyerTin: "555-666-777-00000",
    amount: formatPhp(75_500),
    terms: "Net 30",
    description: "Regional freight coordination",
  },
  {
    file: "invoice-inv-2023-8850.png",
    invoiceNo: "INV-2023-8850",
    date: "March 22, 2025",
    buyer: "Metro Retail Group",
    buyerTin: "444-555-666-00000",
    amount: formatPhp(210_000),
    terms: "Net 45",
    description: "Retail POS integration services",
  },
  {
    file: "invoice-inv-2023-8841.png",
    invoiceNo: "INV-2023-8841",
    date: "March 10, 2025",
    buyer: "Pacific Foods Inc",
    buyerTin: "333-444-555-00000",
    amount: formatPhp(88_400),
    terms: "Net 60",
    description: "Cold chain packaging supplies",
  },
  {
    file: "invoice-inv-2023-8833.png",
    invoiceNo: "INV-2023-8833",
    date: "February 28, 2025",
    buyer: "Cebu Manufacturing Co",
    buyerTin: "777-888-999-00000",
    amount: formatPhp(320_000),
    terms: "Net 90",
    description: "Industrial components and tooling",
  },
  {
    file: "invoice-inv-2023-8812.png",
    invoiceNo: "INV-2023-8812",
    date: "February 5, 2025",
    buyer: "Harbor Shipping Lines",
    buyerTin: "101-202-303-00000",
    amount: formatPhp(540_000),
    terms: "Net 60",
    description: "Port handling and vessel agency",
  },
  {
    file: "invoice-inv-2023-8805.png",
    invoiceNo: "INV-2023-8805",
    date: "January 18, 2025",
    buyer: "Digitel Services PH",
    buyerTin: "212-323-434-00000",
    amount: formatPhp(92_750),
    terms: "Net 45",
    description: "Telecom infrastructure maintenance",
  },
  {
    file: "invoice-inv-2023-8798.png",
    invoiceNo: "INV-2023-8798",
    date: "January 6, 2025",
    buyer: "Luzon Agri Supply",
    buyerTin: "313-424-535-00000",
    amount: formatPhp(178_200),
    terms: "Net 90",
    description: "Agricultural equipment lease",
  },
  {
    file: "invoice-inv-2023-8786.png",
    invoiceNo: "INV-2023-8786",
    date: "December 12, 2024",
    buyer: "Prime Healthcare Supplies",
    buyerTin: "414-525-636-00000",
    amount: formatPhp(245_000),
    terms: "Net 30",
    description: "Medical consumables distribution",
  },
  {
    file: "invoice-inv-2023-8771.png",
    invoiceNo: "INV-2023-8771",
    date: "November 30, 2024",
    buyer: "Visayas Cold Chain",
    buyerTin: "515-626-737-00000",
    amount: formatPhp(412_500),
    terms: "Net 60",
    description: "Refrigerated warehousing services",
  },
  {
    file: "invoice-inv-2023-8912.png",
    invoiceNo: "INV-2023-8912",
    date: "May 19, 2026",
    buyer: "Global Freight Systems",
    buyerTin: "555-666-777-00000",
    amount: formatPhp(275_000),
    terms: "Net 45",
    description: "Freight forwarding and customs clearance",
  },
  {
    file: "invoice-inv-2023-8918.png",
    invoiceNo: "INV-2023-8918",
    date: "May 22, 2026",
    buyer: "Pacific Rim Trading Corp",
    buyerTin: "222-333-444-00000",
    amount: formatPhp(180_500),
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
  <text x="620" y="310" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#555555">BILL TO</text>

  <text x="80" y="350" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#111111">Axial Demo MSME Inc.</text>
  <text x="620" y="350" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#111111">${e(demo.buyer)}</text>
  <text x="80" y="385" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#333333">TIN: 123-456-789-00000</text>
  <text x="620" y="385" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#333333">TIN: ${e(demo.buyerTin)}</text>
  <text x="80" y="420" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#333333">Makati City, Metro Manila</text>
  <text x="620" y="420" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#333333">Philippines</text>

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

console.log(`\nGenerated ${DEMOS.length} OCR demo PNGs in ${outDir}`);
