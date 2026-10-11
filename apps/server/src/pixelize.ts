import sharp from 'sharp';
import type { ItemIcon } from '@kakehashi/shared';

// A pixel icon made from a real photo of the item: the centre of the photo at 32x32 in its own 16 colours.
// Tested on a photo of a sewing-machine table: 16x16 was unreadable, 32x32 from the centre keeps it recognisable.
const N = 32, COLOURS = 16;
const KEYS = '0123456789abcdef';
const toHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

export async function pixelIcon(input: Buffer, fromId: string): Promise<ItemIcon> {
  const quantised = await sharp(input).rotate().resize(N, N, { fit: 'cover', position: 'centre' })
    .png({ palette: true, colours: COLOURS, dither: 0 }).toBuffer();
  const { data } = await sharp(quantised).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const palette: string[] = [];
  const rows: string[] = [];
  for (let y = 0; y < N; y++) {
    let row = '';
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 3;
      const c = toHex(data[i], data[i + 1], data[i + 2]);
      let k = palette.indexOf(c);
      if (k < 0) { k = palette.length < KEYS.length ? palette.push(c) - 1 : 0; }
      row += KEYS[k];
    }
    rows.push(row);
  }
  return { w: N, h: N, palette, rows, fromId };
}
