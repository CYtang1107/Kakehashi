import { PIXEL_PALETTE, type Item } from '@kakehashi/shared';

// Pixel-art sprites drawn as character grids: one character per pixel, '.' is transparent.
// The same grids feed the 3D house (as textures) and the item lists (as SVG icons).

export const PALETTE: Record<string, string> = PIXEL_PALETTE;

export const SPRITES: Record<string, string[]> = {
  sewing: [
    '................',
    '.........N......',
    '........KRK.....',
    '........KRK.....',
    '..KKKKKKKKKKKK..',
    '.KAAAAAAAAAAAAK.',
    '.KBBIIIIIIIBBBKM',
    '.KBGCCCCCCCCBBKN',
    '.KBBKKKKKKKKBBK.',
    '.KBBK......KBCK.',
    '.KKKK......KBCK.',
    '...N.......KBCK.',
    '..NNN......KBCK.',
    'KKKKKKKKKKKKKKKK',
    'KAAMMAAAAAAAAAAK',
    'KWWWWWWWWWWWWWWK',
  ],
  desk: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '......KKKK......',
    '......KHHK...X..',
    '......KHCK...X..',
    'KKKKKKKKKKKKKKKK',
    'KWWWWWWWWWWWWWWK',
    'KXXXXXXXXXXXXXXK',
    '.KWK........KWK.',
    '.KWK........KWK.',
    '.KWK........KWK.',
    '.KXK........KXK.',
    '.KKK........KKK.',
  ],
  kimono: [
    '................',
    '................',
    'XXXXXXXXXXXXXXXX',
    'KKKKKKKKKKKKKKKK',
    'KPPPPPPHHPPPPPPK',
    'KPpPPPPPHPPPPpPK',
    'KPPPPPPPPHPPPPPK',
    'KKKKKPPPPPPKKKKK',
    '....KGGGGGGK....',
    '....KGGQGGGK....',
    '....KPPPPPPK....',
    '....KPpPPPPK....',
    '....KPPPPpPK....',
    '....KPPPPPPK....',
    '....KPpPPPPK....',
    '....KKKKKKKK....',
  ],
  camera: [
    '................',
    '................',
    '................',
    '................',
    '....KKK...KKK...',
    '..KKKKKKKKKKKK..',
    '.KMMMMMMMMMMMMK.',
    '.KNNNNKKKKNNNNK.',
    '.KSSSKLLLLKSSSK.',
    '.KSSSKLHLLKSSSK.',
    '.KSSSKLLLLKSSSK.',
    '.KSSSSKKKKSSSSK.',
    '.KSSSSSSSSSSSSK.',
    '..KKKKKKKKKKKK..',
    '................',
    '................',
  ],
  tv: [
    '...N.......N....',
    '....N.....N.....',
    '.....N...N......',
    '......KKKK......',
    '.KKKKKKKKKKKKKK.',
    '.KBBBBBBBBBBBBK.',
    '.KBKKKKKKKKBMBK.',
    '.KBKLLLLLLKBBBK.',
    '.KBKLSSSSLKBMBK.',
    '.KBKLSSSSLKBBBK.',
    '.KBKLLLLLLKBNBK.',
    '.KBKKKKKKKKBBBK.',
    '.KCCCCCCCCCCCCK.',
    '.KKKKKKKKKKKKKK.',
    '..KK........KK..',
    '................',
  ],
  cooker: [
    '................',
    '................',
    '................',
    '.....KKKKKK.....',
    '.....K....K.....',
    '...KKKKKKKKKK...',
    '..KMMMMMMMMMMK..',
    '..KNNNNNNNNNNK..',
    '.KAAAAAAAAAAAAK.',
    '.KAAAAAAAAAAAAK.',
    '.KAAAAKKKKAAAAK.',
    '.KAAAAKRSKAAAAK.',
    '.KBAAAKKKKAAABK.',
    '.KBBBBBBBBBBBBK.',
    '..KKKKKKKKKKKK..',
    '................',
  ],
  box: [
    '................',
    '................',
    '................',
    '................',
    '..KKKKKKKKKKKK..',
    '..KBBBBGGBBBBK..',
    '..KBBBBGGBBBBK..',
    '..KKKKKKKKKKKK..',
    '..KCBBBBBBBBCK..',
    '..KCBBBBBBBBCK..',
    '..KCBBBBBBBBCK..',
    '..KCBBBBBBBBCK..',
    '..KCBBBBBBBBCK..',
    '..KKKKKKKKKKKK..',
    '................',
    '................',
  ],
};

const BY_NAME: [RegExp, string][] = [
  [/sewing|ミシン/i, 'sewing'],
  [/desk|机/i, 'desk'],
  [/kimono|着物/i, 'kimono'],
  [/camera|カメラ/i, 'camera'],
  [/tv|television|テレビ/i, 'tv'],
  [/cooker|炊飯器/i, 'cooker'],
];

export function spriteFor(item: Pick<Item, 'id' | 'name' | 'nameJa'>): string {
  if (SPRITES[item.id]) return item.id;
  const label = `${item.name} ${item.nameJa ?? ''}`;
  return BY_NAME.find(([re]) => re.test(label))?.[1] ?? 'box';
}

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// RGBA pixels, top row first.
export function spritePixels(key: string): { data: Uint8Array; w: number; h: number } {
  const grid = SPRITES[key] ?? SPRITES.box;
  const h = grid.length, w = grid[0].length;
  const data = new Uint8Array(w * h * 4);
  grid.forEach((row, y) => [...row].forEach((ch, x) => {
    const c = PALETTE[ch];
    if (!c) return;
    const [r, g, b] = hex(c);
    data.set([r, g, b, 255], (y * w + x) * 4);
  }));
  return { data, w, h };
}

// Small tiling textures for floors, walls and grass, drawn pixel by pixel.
type Tile = { data: Uint8Array; w: number; h: number };
function tile(w: number, h: number, color: (x: number, y: number) => string): Tile {
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const [r, g, b] = hex(color(x, y));
    data.set([r, g, b, 255], (y * w + x) * 4);
  }
  return { data, w, h };
}
// Deterministic noise so the art is the same every render.
const noise = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) % 7;

export const FLOORS: Record<string, () => Tile> = {
  tatami: () => tile(16, 16, (x, y) => (x === 0 || x === 15 ? '#3E4A2E' : y % 2 ? '#A9A462' : '#BDB874')),
  wood: () => tile(16, 16, (x, y) => (y % 4 === 3 ? '#7A4C2E' : x === (y < 8 ? 5 : 12) ? '#7A4C2E' : noise(x, y) === 0 ? '#A36F47' : '#B07A4F')),
  lightwood: () => tile(16, 16, (x, y) => (y % 4 === 3 ? '#93633F' : x === (y < 8 ? 9 : 2) ? '#93633F' : noise(x, y) === 0 ? '#BB875A' : '#C8956A')),
  tiles: () => tile(16, 16, (x, y) => (x % 8 === 7 || y % 8 === 7 ? '#B9B1A0' : (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? '#E9E4D8' : '#D8D1C2')),
  dark: () => tile(16, 16, (x, y) => (y % 4 === 3 ? '#4A2F1E' : noise(x, y) === 0 ? '#6A4630' : '#7A5236')),
};

export const ROOM_FLOOR: Record<string, keyof typeof FLOORS> = {
  living: 'wood', kitchen: 'tiles', washitsu: 'tatami', bedroom: 'lightwood', storage: 'dark',
};

export const wallTile = () => tile(16, 8, (x, y) => (y <= 1 || y === 7 ? '#6B4A2E' : x === 0 ? '#C9BBA0' : noise(x, y) === 0 ? '#DCCFB4' : '#E8DCC2'));
export const grassTile = () => tile(16, 16, (x, y) => (noise(x, y) === 0 ? '#5F7F3F' : noise(x, y) < 3 ? '#7FA05A' : '#6E8F4B'));
