"""32x32 pixel-art sewing machine for KAKEHASHI, drawn as a character grid
(one character per pixel), the method aseprite-ai-artist uses.
Run: python sewing_machine.py  ->  sewing-machine-32.png and sewing-machine-x12.png
"""
from pathlib import Path
from PIL import Image

PALETTE = {
    '.': None,           # transparent
    'K': '#2A2230',      # outline
    'A': '#F2E8D5',      # body, light
    'B': '#D8C6A4',      # body, mid
    'C': '#A88F6C',      # body, shadow
    'I': '#2B4C7E',      # indigo stripe (app accent)
    'G': '#E0B356',      # gold badge
    'M': '#D3D8DF',      # metal, light
    'N': '#858D9B',      # metal, dark
    'W': '#8E5B3A',      # wood
    'X': '#5E3A24',      # wood, dark
    'R': '#C8463A',      # thread
    'Q': '#8B2D28',      # thread, shadow
}

GRID = [
    "................................",
    "................................",
    "................................",
    "...................N............",
    ".................KWWWK..........",
    ".................KRRQK..........",
    ".................KRRQK..........",
    ".................KWWWK..........",
    ".....KKKKKKKKKKKKKKKKKKKKKK.....",
    "....K" + "A" * 21 + "K" + ".KK." + ".",
    "...K" + "A" * 22 + "K" + "KMNK" + ".",
    "...K" + "ABBBBB" + "I" * 13 + "BBB" + "K" + "KMNK" + ".",
    "...K" + "ABBBBB" + "G" + "B" * 15 + "K" + "KNNK" + ".",
    "...K" + "ABBBBB" + "C" * 16 + "K" + "KMNK" + ".",
    "...K" + "ABBBBB" + "K" * 11 + "BBBBC" + "K" + "KMNK" + ".",
    "...K" + "ABBBBB" + "K" + "." * 9 + "K" + "BBBBC" + "K" + ".KK." + ".",
    "...K" + "ABBBBC" + "K" + "." * 9 + "K" + "BBBBC" + "K" + "....." ,
    "...K" + "ABBBBC" + "K" + "." * 9 + "K" + "BBBBC" + "K" + ".....",
    "...KKKKKKKK" + "." * 9 + "K" + "BBBBC" + "K" + ".....",
    "......NM" + "..." + "." * 9 + "K" + "BBBBC" + "K" + ".....",
    "......NM" + "..." + "." * 9 + "K" + "BBBBC" + "K" + ".....",
    "....NNNMN" + ".." + "." * 9 + "K" + "BBBBC" + "K" + ".....",
    "." + "K" * 30 + ".",
    ".K" + "AAA" + "MMMM" + "A" * 21 + "K.",
    ".K" + "B" * 28 + "K.",
    ".K" + "C" * 28 + "K.",
    "." + "K" * 30 + ".",
    "K" + "W" * 30 + "K",
    "K" + "W" * 30 + "K",
    "K" + "X" * 30 + "K",
    "." + "K" * 30 + ".",
    "................................",
]


def render(grid, scale):
    assert len(grid) == 32, f"{len(grid)} rows"
    for y, row in enumerate(grid):
        assert len(row) == 32, f"row {y} has {len(row)} pixels"
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            hexc = PALETTE[ch]
            if hexc:
                img.putpixel((x, y), tuple(int(hexc[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    return img if scale == 1 else img.resize((32 * scale, 32 * scale), Image.NEAREST)


if __name__ == '__main__':
    out = Path(__file__).parent
    render(GRID, 1).save(out / 'sewing-machine-32.png')
    render(GRID, 12).save(out / 'sewing-machine-x12.png')
    print('saved')
