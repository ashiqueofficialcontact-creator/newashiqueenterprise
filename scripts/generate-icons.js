import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

// Standard icon SVG (for 'any' purpose and apple-touch-icon)
const standardSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'), 'utf-8');

// Maskable icon SVG: full bleed background (no rx border-radius) + 15% safe margin
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="drop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  
  <!-- Full-bleed background for maskable OS cropping -->
  <rect width="512" height="512" fill="url(#bg)"/>
  
  <!-- Inner content scaled inside the 80% safe zone -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <!-- Outer Glow Ring -->
    <circle cx="256" cy="256" r="210" fill="none" stroke="#38bdf8" stroke-width="6" opacity="0.4"/>
    
    <!-- Water Droplet RO Symbol -->
    <path d="M256 80 C230 180 150 250 150 330 A106 106 0 0 0 362 330 C362 250 282 180 256 80 Z" fill="url(#drop)"/>
    
    <!-- Inner Water Ripple / Plant Wave -->
    <path d="M190 350 Q225 320 256 350 T322 350" fill="none" stroke="#0284c7" stroke-width="14" stroke-linecap="round"/>
    <circle cx="256" cy="280" r="14" fill="#0284c7"/>
    
    <!-- Text NAE -->
    <text x="256" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">ASHIQUE RO</text>
  </g>
</svg>`;

async function generate() {
  console.log('Generating PWA PNG icons with sharp...');

  // 1. 192x192 any PNG
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created public/pwa-192x192.png');

  // 2. 512x512 any PNG
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created public/pwa-512x512.png');

  // 3. 512x512 maskable PNG
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created public/pwa-maskable-512x512.png');

  // 4. 192x192 maskable PNG
  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-maskable-192x192.png'));
  console.log('Created public/pwa-maskable-192x192.png');

  // 5. 180x180 apple-touch-icon PNG
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created public/apple-touch-icon.png');

  // 6. 64x64 favicon PNG
  await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created public/favicon.png');

  console.log('All PNG icons generated successfully!');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
