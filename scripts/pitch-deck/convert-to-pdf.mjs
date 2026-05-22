import puppeteer from "puppeteer-core";
import { join, dirname } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, "../../docs/pitch-deck.html");
const pdfPath = join(__dirname, "../../docs/pitch-deck.pdf");
const DECK_W = 1024;
const DECK_H = 576;

function getExecutablePath() {
  const paths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const p of paths) {
    if (existsSync(p)) return p;
  }
  return null;
}

(async () => {
  console.log("Launching browser...");
  const executablePath = getExecutablePath();
  if (!executablePath) {
    throw new Error(
      "No local Chrome or Edge found. Install one or set BROWSER_PATH env var."
    );
  }
  console.log(`Using browser: ${executablePath}`);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
  });
  const page = await browser.newPage();

  // Set viewport to 16:9 landscape
  await page.setViewport({ width: DECK_W, height: DECK_H, deviceScaleFactor: 2 });

  // Load the HTML file
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  console.log("Page loaded. Waiting for images...");

  // Wait for all images to finish loading
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return;
        return new Promise((resolve) => {
          img.addEventListener("load", resolve);
          img.addEventListener("error", resolve);
        });
      })
    );
  });

  console.log("Preparing print layout...");

  // Inject CSS to show all slides stacked for print, each filling one page
  const slideCount = await page.evaluate(({ deckW, deckH }) => {
    // Remove nav and watermark
    document.querySelector(".nav")?.remove();
    document.querySelector(".watermark")?.remove();
    document.querySelector(".logo-mark")?.remove();

    // Make body scrollable and sized for print
    document.body.style.overflow = "visible";
    document.body.style.height = "auto";
    document.body.style.width = `${deckW}px`;
    document.body.style.display = "block";

    const deckStage = document.querySelector(".deck-stage");
    if (deckStage) {
      deckStage.style.width = `${deckW}px`;
      deckStage.style.height = "auto";
      deckStage.style.aspectRatio = "auto";
    }

    const deck = document.querySelector(".deck");
    deck.style.position = "relative";
    deck.style.width = `${deckW}px`;
    deck.style.height = "auto";

    // Stack all slides vertically, each exactly one viewport
    const slides = document.querySelectorAll(".slide");
    slides.forEach((slide) => {
      slide.style.position = "relative";
      slide.style.opacity = "1";
      slide.style.transform = "none";
      slide.style.pointerEvents = "auto";
      slide.style.width = `${deckW}px`;
      slide.style.height = `${deckH}px`;
      slide.style.overflow = "hidden";
      slide.style.pageBreakAfter = "always";
      slide.style.pageBreakInside = "avoid";
      slide.classList.add("active");
      slide.classList.remove("exit-up");

      // Force stagger children to be visible
      const stagger = slide.querySelector(".stagger");
      if (stagger) {
        Array.from(stagger.children).forEach((child) => {
          child.style.opacity = "1";
          child.style.transform = "translateY(0)";
          child.style.transitionDelay = "0s";
        });
      }
    });

    return slides.length;
  }, { deckW: DECK_W, deckH: DECK_H });

  console.log(`Prepared ${slideCount} slides for export.`);

  // Extra settle time for fonts/rendering
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Generating PDF...");

  await page.pdf({
    path: pdfPath,
    width: `${DECK_W}px`,
    height: `${DECK_H}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log(`✅ PDF saved to: ${pdfPath}`);
})();
