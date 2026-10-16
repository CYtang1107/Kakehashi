import sharp from 'sharp';
import type { ItemIcon } from '@kakehashi/shared';

// A pixel icon made from a real photo of the item: 32x32 in its own 16 colours, with the photo's background removed
// ('.' = transparent) so the item sits on the floor plan and the 3D house like a drawn sprite.
// Tested on a photo of a sewing-machine table: 16x16 was unreadable, 32x32 keeps it recognisable.
const N = 32, COLOURS = 16, S = 128;
const KEYS = '0123456789abcdef';
const toHex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

// Background = everything reachable from the photo's edges through small colour steps, never drifting far from the
// edge colour it started from. Works for an item on a plain wall, floor or table; a busy background stays as it is.
const STEP = 22, DRIFT = 70;
const SIDES: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function backgroundMask(rgb: Buffer, w: number, h: number): Uint8Array | null {
  const bg = new Uint8Array(w * h);
  const seed = new Int32Array(w * h).fill(-1);
  const queue: number[] = [];
  const dist = (a: number, b: number) => Math.hypot(rgb[a * 3] - rgb[b * 3], rgb[a * 3 + 1] - rgb[b * 3 + 1], rgb[a * 3 + 2] - rgb[b * 3 + 2]);
  const start = (p: number) => { if (!bg[p]) { bg[p] = 1; seed[p] = p; queue.push(p); } };
  for (let x = 0; x < w; x++) { start(x); start((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { start(y * w); start(y * w + w - 1); }
  for (let q = 0; q < queue.length; q++) {
    const p = queue[q], x = p % w, y = (p / w) | 0;
    for (const [dx, dy] of SIDES) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const n = ny * w + nx;
      if (bg[n] || dist(n, p) > STEP || dist(n, seed[p]) > DRIFT) continue;
      bg[n] = 1; seed[n] = seed[p]; queue.push(n);
    }
  }
  // Specks (marks on the floor, wood grain) become background: keep only pieces at least a fifth of the largest.
  const label = new Int32Array(w * h).fill(-1);
  const sizes: number[] = [];
  for (let p = 0; p < w * h; p++) {
    if (bg[p] || label[p] >= 0) continue;
    const id = sizes.length, stack = [p];
    label[p] = id; let n = 0;
    while (stack.length) {
      const c = stack.pop()!, x = c % w, y = (c / w) | 0; n++;
      for (const [dx, dy] of SIDES) {
        const nx = x + dx, ny = y + dy, m = ny * w + nx;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || bg[m] || label[m] >= 0) continue;
        label[m] = id; stack.push(m);
      }
    }
    sizes.push(n);
  }
  const keep = Math.max(0, ...sizes) / 5;
  for (let p = 0; p < w * h; p++) if (!bg[p] && sizes[label[p]] < keep) bg[p] = 1;
  const share = bg.reduce((s, v) => s + v, 0) / bg.length;
  // Too little background found (the item fills the photo) or too much (the item blends in): keep the whole photo.
  return share < 0.08 || share > 0.95 ? null : bg;
}

export async function pixelIcon(input: Buffer, fromId: string): Promise<ItemIcon> {
  const { data: raw, info } = await sharp(input).rotate().resize(S, S, { fit: 'inside' })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const rgb = Buffer.alloc(w * h * 3);
  const cut = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) { rgb.set(raw.subarray(p * 4, p * 4 + 3), p * 3); cut[p] = raw[p * 4 + 3] < 128 ? 1 : 0; }
  // A picture that is already cut out (transparent background) keeps its own cut; otherwise find the background.
  const bg = cut.some((v) => v) ? cut : backgroundMask(rgb, w, h);
  const rgba = Buffer.alloc(w * h * 4);
  let left = w, top = h, right = -1, bottom = -1;
  for (let p = 0; p < w * h; p++) {
    rgba.set([rgb[p * 3], rgb[p * 3 + 1], rgb[p * 3 + 2], bg?.[p] ? 0 : 255], p * 4);
    if (!bg?.[p]) {
      const x = p % w, y = (p / w) | 0;
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  // Crop to the item with a pixel of margin; without a background found, the centre square as before.
  const side = bg ? Math.min(w, h, Math.max(right - left, bottom - top) + 3) : Math.min(w, h);
  const cx = bg ? (left + right) / 2 : w / 2, cy = bg ? (top + bottom) / 2 : h / 2;
  const cw = bg ? Math.min(w, right - left + 3) : side, ch = bg ? Math.min(h, bottom - top + 3) : side;
  const crop = {
    left: Math.round(Math.min(Math.max(cx - cw / 2, 0), w - cw)),
    top: Math.round(Math.min(Math.max(cy - ch / 2, 0), h - ch)),
    width: cw, height: ch,
  };
  const quantised = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).extract(crop)
    .resize(N, N, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ palette: true, colours: COLOURS, dither: 0 }).toBuffer();
  const { data } = await sharp(quantised).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const palette: string[] = [];
  const rows: string[] = [];
  for (let y = 0; y < N; y++) {
    let row = '';
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      if (data[i + 3] < 128) { row += '.'; continue; }
      const c = toHex(data[i], data[i + 1], data[i + 2]);
      let k = palette.indexOf(c);
      if (k < 0) { k = palette.length < KEYS.length ? palette.push(c) - 1 : 0; }
      row += KEYS[k];
    }
    rows.push(row);
  }
  return { w: N, h: N, palette, rows, fromId };
}
