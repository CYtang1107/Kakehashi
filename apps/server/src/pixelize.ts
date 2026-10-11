import sharp from 'sharp';

// A "pixel version" of a real photo: the whole picture at 56x42 (keeping 4:3) in its own 16 colours, then scaled
// up 6x with hard edges, so it reads as pixel art on any screen without relying on browser image scaling.
// Tested on a photo of a sewing machine table: 16x16 icons were unreadable; 56x42 keeps the object recognisable.
const W = 56, H = 42, SCALE = 6, COLOURS = 16;

export async function pixelPhoto(input: Buffer): Promise<Buffer> {
  const small = await sharp(input).rotate().resize(W, H, { fit: 'cover', position: 'centre' })
    .png({ palette: true, colours: COLOURS, dither: 0 }).toBuffer();
  return sharp(small).resize(W * SCALE, H * SCALE, { kernel: 'nearest' }).png({ palette: true, colours: COLOURS }).toBuffer();
}
