import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getExecutablePath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function generatePDF() {
  console.log('Launching browser...');
  const executablePath = getExecutablePath();
  if (!executablePath) {
    throw new Error('No local Chrome or Edge installation found. Please ensure Google Chrome or Microsoft Edge is installed.');
  }
  const browser = await puppeteer.launch({ executablePath });
  const page = await browser.newPage();
  
  const htmlPath = `file:///${path.join(__dirname, 'pitch-deck.html').replace(/\\/g, '/')}`;
  const pdfPath = path.join(__dirname, 'pitch-deck.pdf');
  
  console.log(`Navigating to ${htmlPath}...`);
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  
  console.log('Waiting for all images to load...');
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return;
      return new Promise((resolve) => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve); // Resolve anyway to not block forever
      });
    }));
  });
  
  console.log('Injecting print styles...');
  await page.addStyleTag({
    content: `
      @media print {
        body, html {
          height: auto !important;
          overflow: visible !important;
          background: #0A0F1C !important;
        }
        .deck {
          height: auto !important;
          position: static !important;
        }
        .slide {
          position: relative !important;
          opacity: 1 !important;
          transform: none !important;
          height: 100vh !important;
          page-break-inside: avoid !important;
          page-break-after: always !important;
          /* Reset the stagger animation states */
        }
        .slide .stagger > * {
          opacity: 1 !important;
          transform: none !important;
        }
        .nav {
          display: none !important;
        }
        .logo-mark, .watermark {
          position: absolute !important;
        }
      }
    `
  });

  // Emulate screen media to trigger the print media styles we just added,
  // but wait, if we emulate screen, @media print won't apply during pdf generation?
  // page.pdf() automatically uses print media unless we do emulateMediaType('screen').
  // Let's not emulate screen, let page.pdf use print media.
  // Wait, the original CSS styles the background for screen. 
  // Let's ensure background graphics are printed.

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });
  
  await browser.close();
  console.log(`PDF successfully generated at ${pdfPath}`);
}

generatePDF().catch(console.error);
