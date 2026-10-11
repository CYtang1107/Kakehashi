import fs from 'node:fs';
import path from 'node:path';
import type { Home, Item } from '@kakehashi/shared';
import { seedHome, seedItems } from './seed';

// A small JSON-file store. Good enough for a pilot with a handful of families.
export const DATA_DIR = path.resolve(__dirname, '..', 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface Db {
  homes: Home[];
  items: Item[];
}

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function fresh(): Db {
  return { homes: [seedHome()], items: seedItems() };
}

// Older data files from earlier versions lack newer fields; demo data is simply re-seeded.
const isCurrent = (d: Db) => d.homes.every((h) => Array.isArray(h.activities) && Array.isArray(h.letters) && Array.isArray(h.fieldNotes) && Array.isArray(h.safety) && Array.isArray(h.future?.familyNotes) && Array.isArray(h.services) && Array.isArray(h.places) && h.places.some((p) => p.mine) && Array.isArray(h.outings) && Array.isArray(h.weather?.checks) && Array.isArray(h.pay) && h.services.some((s) => s.status === 'open') && d.items.some((i) => i.share) && d.items.some((i) => typeof i.hearts === 'number') && d.items.some((i) => i.delivery) && h.students.every((s) => s.passed) && h.rooms.every((r) => Array.isArray(r.photos)));

function load(): Db {
  try {
    const d = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Db;
    if (!isCurrent(d)) throw new Error('outdated');
    return d;
  } catch {
    const db = fresh();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    return db;
  }
}

export const db: Db = load();

export function save() {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export function reset() {
  const next = fresh();
  db.homes = next.homes;
  db.items = next.items;
  save();
}

export const findHome = (id: string) => db.homes.find((h) => h.id === id);
export const findItem = (id: string) => db.items.find((i) => i.id === id);

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'audio/m4a': 'm4a', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac',
  'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav',
};

// Saves a base64 upload and returns its public path under /files.
export function saveUpload(id: string, base64: string, mime: string): string {
  const ext = EXT[mime.split(';')[0]] ?? 'bin';
  const name = `${id}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(base64, 'base64'));
  return `/files/${name}`;
}
