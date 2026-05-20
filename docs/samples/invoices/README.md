# Sample invoices (demo)

Use these for **upload UI mockups**, pitch decks, or manual testing. They match the hardcoded Liquidity rows and EIS demo seller/buyer TINs in `web/lib/eis/schema.ts`.

| File | Invoice ID | Buyer | Face amount | Terms |
|------|------------|-------|-------------|-------|
| `invoice-inv-2023-8901.png` | INV-2023-8901 | Acme Logistics Corp | ₱125,000 | Net 60 |
| `invoice-inv-2023-8904.png` | INV-2023-8904 | (see image) | ₱450,000 | Net 90 |

**Liquidity row:** INV-2023-8872 (Global Freight, ₱75,500, Net 30) — no image yet; copy layout from 8901 if needed.

## Free real-world templates (PDF)

Philippine B2B / BIR-style blanks you can download and edit:

- [Xero PH — Commercial invoice template](https://www.xero.com/ph/templates/invoice-template/commercial-template/)
- [Mochi — Sales invoice template Philippines (PDF)](https://www.mochi.ph/templates/sales-invoice-template-philippines)
- [Genie AI — Commercial invoice (PH)](https://www.genieai.co/en-ph/template/commercial-invoice)
- [UsePDF — Commercial invoice](https://usepdf.com/invoice-templates/commercial-invoice)

## Browser (dev server)

Also copied to `web/public/samples/invoices/`:

- http://localhost:3000/samples/invoices/invoice-inv-2023-8901.png
- http://localhost:3000/samples/invoices/invoice-inv-2023-8904.png

## Upload in app

**Liquidity → Upload B2B Invoice** runs OCR (`tesseract.js`) + field extraction, then adds a row to **Active Factoring**.

Best results: PNG/JPEG of clear invoices (use samples above). PDF works when it contains selectable text.
