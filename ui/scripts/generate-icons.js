import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputSvg = path.join(__dirname, '../public/favicon.svg');
const outputDir = path.join(__dirname, '../public');

// Icon sizes needed for PWA
const icons = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 192, name: 'pwa-maskable-192x192.png', maskable: true },
  { size: 512, name: 'pwa-maskable-512x512.png', maskable: true },
  { size: 1200, name: 'og-image.png', width: 1200, height: 630 },
  { size: 1280, name: 'screenshot-wide.png', width: 1280, height: 720 },
  { size: 750, name: 'screenshot-narrow.png', width: 750, height: 1334 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from favicon.svg...\n');

  for (const icon of icons) {
    try {
      const outputPath = path.join(outputDir, icon.name);
      
      // For maskable icons, add padding (safe zone is 80% of canvas)
      const padding = icon.maskable ? Math.floor(icon.size * 0.1) : 0;
      
      if (icon.width && icon.height) {
        // For Open Graph and screenshot images (rectangular)
        await sharp(inputSvg)
          .resize(icon.width, icon.height, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
      } else if (icon.maskable) {
        // For maskable icons with padding and solid background
        await sharp(inputSvg)
          .resize(icon.size - padding * 2, icon.size - padding * 2)
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 25, g: 118, b: 210, alpha: 1 } // Theme color #1976d2
          })
          .png()
          .toFile(outputPath);
      } else {
        // Standard square icons
        await sharp(inputSvg)
          .resize(icon.size, icon.size)
          .png()
          .toFile(outputPath);
      }
      
      console.log(`✅ Generated: ${icon.name}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error.message);
    }
  }

  // Generate favicon.ico (multi-resolution)
  try {
    await sharp(inputSvg)
      .resize(32, 32)
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('✅ Generated: favicon.ico');
  } catch (error) {
    console.error('❌ Failed to generate favicon.ico:', error.message);
  }

  console.log('\n🎉 Icon generation complete!');
  console.log('\n📝 Note: You may want to customize screenshot images with actual dashboard screenshots.');
}

generateIcons().catch(console.error);
