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

function load(): Db {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as Db;
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
export const findTag = (code: string) => db.items.find((i) => i.tagCode?.toUpperCase() === code.toUpperCase());

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
