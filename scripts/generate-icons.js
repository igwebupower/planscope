const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');
const EXTENSION_ICONS_PATH = path.join(__dirname, '..', 'extension', 'public', 'icons');
const WEBSITE_ASSETS_PATH = path.join(__dirname, '..', 'website', 'assets');
const ROOT_ASSETS_PATH = path.join(__dirname, '..', 'assets');

async function generateIcons() {
  console.log('Reading logo from:', LOGO_PATH);

  // Get logo metadata
  const metadata = await sharp(LOGO_PATH).metadata();
  console.log('Logo dimensions:', metadata.width, 'x', metadata.height);

  // The logo has the icon on the left and text on the right
  // We need to extract just the icon portion
  // Icon is roughly from 8% to 28% horizontally, 28% to 72% vertically
  const iconLeft = Math.floor(metadata.width * 0.08);
  const iconTop = Math.floor(metadata.height * 0.28);
  const iconWidth = Math.floor(metadata.width * 0.22);
  const iconHeight = Math.floor(metadata.height * 0.44);

  // Extract the icon portion
  const iconBuffer = await sharp(LOGO_PATH)
    .extract({ left: iconLeft, top: iconTop, width: iconWidth, height: iconHeight })
    .toBuffer();

  // Generate extension icons
  const sizes = [16, 48, 128];

  for (const size of sizes) {
    const outputPath = path.join(EXTENSION_ICONS_PATH, `icon-${size}.png`);
    await sharp(iconBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }

  // Generate favicon.png for website (32x32)
  const faviconPath = path.join(ROOT_ASSETS_PATH, 'favicon.png');
  await sharp(iconBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(faviconPath);
  console.log(`Generated: ${faviconPath}`);

  // Copy to website assets too
  const websiteFaviconPath = path.join(WEBSITE_ASSETS_PATH, 'favicon.png');
  await sharp(iconBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(websiteFaviconPath);
  console.log(`Generated: ${websiteFaviconPath}`);

  // Also create a full logo version for website (resized to reasonable web size)
  const webLogoPath = path.join(WEBSITE_ASSETS_PATH, 'logo.png');
  await sharp(LOGO_PATH)
    .resize(400, null, { fit: 'inside' })
    .png()
    .toFile(webLogoPath);
  console.log(`Generated: ${webLogoPath}`);

  // Copy to root assets
  const rootLogoPath = path.join(ROOT_ASSETS_PATH, 'logo-web.png');
  await sharp(LOGO_PATH)
    .resize(400, null, { fit: 'inside' })
    .png()
    .toFile(rootLogoPath);
  console.log(`Generated: ${rootLogoPath}`);

  console.log('\nDone! Icons generated successfully.');
}

generateIcons().catch(console.error);
