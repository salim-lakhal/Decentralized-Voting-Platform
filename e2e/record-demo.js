const { chromium } = require("@playwright/test");
const path = require("path");

const BASE_URL = process.env.DEMO_URL || "http://localhost:4567";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    recordVideo: {
      dir: path.resolve(__dirname, "../videos"),
      size: { width: 1400, height: 900 },
    },
  });

  const page = await context.newPage();

  // Home page
  await page.goto(BASE_URL, { waitUntil: "load", timeout: 15000 });
  await sleep(3000);

  // Scroll down to features
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: "smooth" }));
  await sleep(2500);

  // Scroll to CTA
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "smooth" }));
  await sleep(2500);

  // Back to top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(1500);

  // Navigate to Elections via URL
  await page.goto(BASE_URL + "/elections", { waitUntil: "load", timeout: 10000 });
  await sleep(3000);

  // Navigate to Admin via URL
  await page.goto(BASE_URL + "/admin", { waitUntil: "load", timeout: 10000 });
  await sleep(3000);

  // Back to Home
  await page.goto(BASE_URL, { waitUntil: "load", timeout: 10000 });
  await sleep(2000);

  await context.close();
  await browser.close();

  console.log("Recording complete!");
}

main().catch(console.error);
