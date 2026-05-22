import puppeteer from "puppeteer-core";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, "pitch-deck.html");
const pdfPath = join(__dirname, "pitch-deck.pdf");
const TOTAL_SLIDES = 12;

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" 
  });
  const page = await browser.newPage();

  // Set viewport to 16:9 landscape
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  // Load the HTML file
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  console.log("Page loaded. Preparing print layout...");

  // Inject CSS to show all slides stacked for print, each filling one page
  await page.evaluate((total) => {
    // Remove nav and watermark
    document.querySelector(".nav")?.remove();
    document.querySelector(".watermark")?.remove();
    document.querySelector(".logo-mark")?.remove();

    // Make body scrollable and sized for print
    document.body.style.overflow = "visible";
    document.body.style.height = "auto";
    document.body.style.width = "1920px";

    const deck = document.querySelector(".deck");
    deck.style.position = "relative";
    deck.style.width = "1920px";
    deck.style.height = "auto";

    // Stack all slides vertically, each exactly one viewport
    const slides = document.querySelectorAll(".slide");
    slides.forEach((slide, i) => {
      slide.style.position = "relative";
      slide.style.opacity = "1";
      slide.style.transform = "none";
      slide.style.pointerEvents = "auto";
      slide.style.width = "1920px";
      slide.style.height = "1080px";
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
  }, TOTAL_SLIDES);

  // Wait for fonts and images to load
  await page.waitForNetworkIdle({ timeout: 10000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Generating PDF...");

  await page.pdf({
    path: pdfPath,
    width: "1920px",
    height: "1080px",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log(`✅ PDF saved to: ${pdfPath}`);
})();
