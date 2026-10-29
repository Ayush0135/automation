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
      width: 1280,
      height: 820,
      deviceScaleFactor: 1.5,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5050...');
  await page.goto('http://localhost:5050', { waitUntil: 'networkidle2' });

  // Wait for results to be populated
  await page.waitForSelector('.grid', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1500));

  let frameCount = 0;
  const captureFrame = async (delay = 100) => {
    const framePath = path.join(framesDir, `frame_${String(frameCount).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath });
    frameCount++;
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  };

  console.log('Capturing initial state...');
  for (let i = 0; i < 10; i++) {
    await captureFrame(100);
  }

  console.log('Scrolling down results...');
  for (let scroll = 0; scroll <= 700; scroll += 35) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scroll);
    await captureFrame(80);
  }

  // Pause at middle of results
  for (let i = 0; i < 8; i++) {
    await captureFrame(100);
  }

  // Click on the first result card's details
  console.log('Opening detail modal...');
  const cardClicked = await page.evaluate(() => {
    const cards = document.querySelectorAll('.grid > div');
    if (cards.length > 0) {
      cards[0].click();
      return true;
    }
    return false;
  });

  if (cardClicked) {
    await new Promise((r) => setTimeout(r, 600));
    // Capture modal open
    for (let i = 0; i < 15; i++) {
      await captureFrame(100);
    }

    // Close modal
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 400));
  }

  // Scroll back to top
  console.log('Scrolling back to top...');
  for (let scroll = 700; scroll >= 0; scroll -= 50) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scroll);
    await captureFrame(70);
  }

  // Hold top state
  for (let i = 0; i < 8; i++) {
    await captureFrame(100);
  }

  await browser.close();
  console.log(`Captured ${frameCount} frames. Generating GIF and MP4 with ffmpeg...`);

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
