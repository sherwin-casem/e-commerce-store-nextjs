import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const imageDir = path.join(process.cwd(), 'public', 'img');
const images = [
  { name: 'homepage', color: '#5c3d2e', label: 'Burger Store' },
  { name: 'luther', color: '#8B4513', label: 'Luther' },
  { name: 'ainsworth', color: '#D2691E', label: 'Ainsworth' },
  { name: 'chorizo-shrimp', color: '#CD853F', label: 'Chorizo Shrimp' },
  { name: 'haiwaiian', color: '#F4A460', label: 'Hawaiian' },
  { name: 'chicken-katsu', color: '#DEB887', label: 'Chicken Katsu' },
  { name: 'elvis', color: '#BC8F8F', label: 'Elvis' },
  { name: 'willy-wonka', color: '#9370DB', label: 'Willy Wonka' },
  { name: 'peanut-butter-jelly', color: '#DAA520', label: 'PB and J' },
  { name: 'nutella', color: '#6B4226', label: 'Nutella' },
  { name: 'mermaid-cauliflower', color: '#20B2AA', label: 'Mermaid' },
  { name: 'ghost', color: '#708090', label: 'Ghost' },
  { name: 'yin-yang', color: '#2F4F4F', label: 'Yin Yang' },
];

fs.mkdirSync(imageDir, { recursive: true });

for (const { name, color, label } of images) {
  const svg = `
    <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="500" fill="${color}"/>
      <circle cx="250" cy="200" r="80" fill="#f5deb3" opacity="0.9"/>
      <rect x="170" y="260" width="160" height="40" rx="20" fill="#daa520"/>
      <text x="250" y="380" font-family="Arial, sans-serif" font-size="28" font-weight="bold"
        fill="white" text-anchor="middle">${label}</text>
    </svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(
    path.join(imageDir, `${name}.jpg`),
  );
}

console.log(`Generated ${images.length} images in public/img/`);
