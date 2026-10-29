const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  const framesDir = path.join(__dirname, '../.tmp_frames');
  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: 'new',
    defaultViewport: {
      width: 1360,
      height: 860,
      deviceScaleFactor: 1.5,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5050...');
  await page.goto('http://localhost:5050', { waitUntil: 'networkidle2' });

  // Wait for results to be populated
  await page.waitForSelector('.grid', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1200));

  let frameCount = 0;
  const captureFrame = async (delay = 80) => {
    const framePath = path.join(framesDir, `frame_${String(frameCount).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath });
    frameCount++;
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  };

  console.log('1. Capturing hero deck & KPI strip...');
  for (let i = 0; i < 8; i++) {
    await captureFrame(100);
  }

  // Hover over the first video card to trigger autoplay preview
  console.log('2. Hovering over first video reel...');
  const firstCard = await page.$('.grid > div');
  if (firstCard) {
    const box = await firstCard.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      for (let i = 0; i < 12; i++) {
        await captureFrame(90);
      }
    }
  }

  console.log('3. Scrolling down the 9:16 Reels Wall...');
  for (let scroll = 0; scroll <= 600; scroll += 40) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scroll);
    await captureFrame(70);
  }

  // Hover over another card lower down
  const cards = await page.$$('.grid > div');
  if (cards.length > 3) {
    const box = await cards[3].boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      for (let i = 0; i < 8; i++) {
        await captureFrame(90);
      }
    }
  }

  // Scroll back to filter bar
  console.log('4. Scrolling back to filters and switching to Cinema Studio View...');
  for (let scroll = 600; scroll >= 300; scroll -= 60) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scroll);
    await captureFrame(60);
  }

  // Click on "Cinema Studio" view button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cinemaBtn = buttons.find((b) => b.textContent && b.textContent.includes('Cinema Studio'));
    if (cinemaBtn) cinemaBtn.click();
  });

  await new Promise((r) => setTimeout(r, 600));

  console.log('5. Capturing Cinema Studio split theater...');
  for (let i = 0; i < 14; i++) {
    await captureFrame(100);
  }

  // Scroll back to top
  for (let scroll = 300; scroll >= 0; scroll -= 60) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scroll);
    await captureFrame(60);
  }

  // Final hold
  for (let i = 0; i < 6; i++) {
    await captureFrame(100);
  }

  await browser.close();
  console.log(`Captured ${frameCount} frames. Generating high-def GIF and MP4 with ffmpeg...`);

  const outputGif = path.join(__dirname, '../docs/assets/demo.gif');
  const outputMp4 = path.join(__dirname, '../docs/assets/demo.mp4');

  // Generate MP4
  execSync(
    `ffmpeg -y -framerate 10 -i "${framesDir}/frame_%04d.png" -c:v libx264 -pix_fmt yuv420p -vf "scale=1280:-2" "${outputMp4}"`,
    { stdio: 'inherit' }
  );

  // Generate high quality optimized GIF with palettegen
  execSync(
    `ffmpeg -y -framerate 10 -i "${framesDir}/frame_%04d.png" -vf "fps=10,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" "${outputGif}"`,
    { stdio: 'inherit' }
  );

  // Cleanup temporary frames
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log('Demo recording generated successfully:');
  console.log(' - ' + outputGif);
  console.log(' - ' + outputMp4);
}

main().catch((err) => {
  console.error('Recording failed:', err);
  process.exit(1);
});
