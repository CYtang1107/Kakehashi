// Turns a team photo into a demo asset: a resized WebP with no metadata (phone photos can carry GPS)
// and the item's 32x32 pixel icon. Usage: npx tsx scripts/make-demo-asset.ts <photo> <item id>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { pixelIcon } from '../src/pixelize';

const [src, itemId] = process.argv.slice(2);
if (!src || !itemId) {
  console.error('Usage: npx tsx scripts/make-demo-asset.ts <photo> <item id>');
  process.exit(1);
}
const out = path.resolve(__dirname, '..', 'demo');
fs.mkdirSync(out, { recursive: true });

(async () => {
  // rotate() applies the camera orientation; sharp drops EXIF and GPS unless asked to keep them.
  const photo = await sharp(fs.readFileSync(src)).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  fs.writeFileSync(path.join(out, `demo-${itemId}-photo.webp`), photo);
  const icon = await pixelIcon(photo, `ph-${itemId}-0`);
  fs.writeFileSync(path.join(out, `demo-${itemId}-icon.json`), JSON.stringify(icon));
  const meta = await sharp(photo).metadata();
  console.log(`demo-${itemId}-photo.webp ${meta.width}x${meta.height}, ${Math.round(photo.length / 1024)} KB, exif: ${meta.exif ? 'yes' : 'none'}`);
})();
