import type { Home, Item, Plan } from '@kakehashi/shared';

// Example family used for demos. Every person here is illustrative.
export const HOME_ID = 'tanaka';

export const plans: Plan[] = [
  { id: 'monthly', name: 'Monthly visit', nameJa: '月1回プラン', priceJpy: 12000, visitsPerMonth: 1,
    description: 'One 2–3 hour visit a month by the same two students. The fee is the same whatever stays or goes. Example price, to be tested in interviews.' },
  { id: 'twice', name: 'Twice a month', nameJa: '月2回プラン', priceJpy: 22000, visitsPerMonth: 2,
    description: 'Two visits a month, for company and a safer home. Example price, to be tested in interviews.' },
];

export function seedHome(): Home {
  return {
    id: HOME_ID,
    seniorName: 'Michiko Tanaka',
    town: 'Niigata',
    childName: 'Kenji',
    students: [
      { name: 'Yui', initial: 'Y', interests: 'gardening, cooking' },
      { name: 'Arif', initial: 'A', interests: 'photography, repairs' },
    ],
    consent: { recording: true, at: '2026-07-18' },
    rooms: [
      { id: 'living', name: 'Living room', nameJa: '居間', status: 'sorted', x: 10, y: 10, w: 170, h: 120 },
      { id: 'kitchen', name: 'Kitchen', nameJa: '台所', status: 'sorted', x: 180, y: 10, w: 130, h: 80 },
      { id: 'washitsu', name: 'Tatami room', nameJa: '和室', status: 'now', x: 180, y: 90, w: 130, h: 140 },
      { id: 'bedroom', name: 'Bedroom', nameJa: '寝室', status: 'later', x: 10, y: 130, w: 110, h: 100 },
      { id: 'storage', name: 'Storage', nameJa: '物置', status: 'later', x: 120, y: 130, w: 60, h: 100 },
    ],
    visits: [
      { id: 'v5', date: '2026-10-24', roomId: 'washitsu', summary: 'Tatami room, part 2', status: 'planned' },
      { id: 'v4', date: '2026-10-10', roomId: 'washitsu', summary: 'Most of the hour was stories about Osaka. She chose to keep the kimono and, when she was ready, to pass on the desk and sewing machine.', status: 'done' },
      { id: 'v3', date: '2026-09-12', roomId: 'kitchen', summary: 'Cleared the floor by the stairs so she can walk safely. At her request, the spare rice cooker went to a student.', status: 'done' },
      { id: 'v2', date: '2026-08-15', roomId: 'living', summary: 'Photo albums and tea; nothing left the house. The TV, broken for years, went to a licensed recycler at her request.', status: 'done' },
      { id: 'v1', date: '2026-07-18', roomId: 'living', summary: 'First visit. Tea and photo albums, nothing sorted. That was the plan.', status: 'done' },
    ],
    activity: { title: 'Gardening group', date: '2026-10-29 14:00', place: 'Neighbourhood gathering place (通いの場)', companion: 'Yui', status: 'accepted' },
    planId: 'monthly',
    payments: [],
    proceedsChoice: 'grandchild',
    letters: [
      { id: 'l-2026-09', month: '2026-09', itemIds: ['cooker'], note: 'Thank you for the stories about your kitchen. The stairs are clear now, so please walk safely! See you in October.', status: 'mailed', mailedAt: '2026-09-14' },
    ],
    calls: [
      { id: 'c1', date: '2026-08-29', by: 'Yui', status: 'done', minutes: 15, mood: 'good', note: 'Talked about her tomatoes. She asked if we could look at the photo albums again next time.' },
      { id: 'c2', date: '2026-09-26', by: 'Yui', status: 'done', minutes: 12, mood: 'okay', note: 'A little tired after a cold, now better. Happy that the rice cooker went to a student.' },
      { id: 'c3', date: '2026-10-17', by: 'Yui', status: 'planned' },
    ],
  };
}

const at = (d: string) => `${d}T10:00:00+09:00`;

export function seedItems(): Item[] {
  return [
    { id: 'sewing', homeId: HOME_ID, roomId: 'washitsu', name: 'Sewing machine', nameJa: 'ミシン', year: '1972', glyph: '縫', decision: 'pass',
      story: "I sewed all three children's school bags on this machine. Kenji's had a rocket on it. I'd like it to go to a young person who will make something with it.",
      tagCode: 'KK-0472-SEW', x: 228, y: 148,
      estimate: { category: 'Household sewing machine', priceLowJpy: 3000, priceHighJpy: 8000, routeIfLetGo: 'pass', reason: 'Older mechanical machines are still useful after a service.', source: 'offline' },
      proceedsJpy: 3000,
      journey: [
        { at: at('2026-10-10'), stage: 'home', by: 'Michiko Tanaka', note: 'In the family since 1972' },
        { at: at('2026-10-10'), stage: 'sorted', by: 'Yui and Arif', note: 'Michiko chose to pass it on' },
        { at: at('2026-10-16'), stage: 'repair', by: 'Partner repair shop', note: 'Serviced and tested' },
      ], thanks: [] },
    { id: 'desk', homeId: HOME_ID, roomId: 'washitsu', name: 'Writing desk', nameJa: '文机', year: '1968', glyph: '机', decision: 'pass',
      story: 'This is where I wrote letters to my husband when he worked in Osaka. Every Sunday night, one letter.',
      tagCode: 'KK-0472-DSK', x: 282, y: 200,
      journey: [
        { at: at('2026-10-10'), stage: 'home', by: 'Michiko Tanaka' },
        { at: at('2026-10-10'), stage: 'sorted', by: 'Yui and Arif', note: 'Michiko chose to pass it on' },
      ], thanks: [] },
    { id: 'kimono', homeId: HOME_ID, roomId: 'washitsu', name: 'Wedding kimono', nameJa: '着物', year: '1966', glyph: '衣', decision: 'keep',
      story: 'My mother made the obi for this. I want to keep it. Maybe a granddaughter will wear it one day.', x: 208, y: 204,
      journey: [{ at: at('2026-10-10'), stage: 'home', by: 'Michiko Tanaka', note: 'Kept at home' }], thanks: [] },
    { id: 'camera', homeId: HOME_ID, roomId: 'living', name: 'Film camera', nameJa: 'カメラ', year: '1979', glyph: '写', decision: 'open',
      story: 'My husband took every family photo with this camera. Kenji used to carry the bag for him on trips.', x: 62, y: 58,
      journey: [{ at: at('2026-08-15'), stage: 'home', by: 'Michiko Tanaka', note: 'On the shelf where it has always been' }], thanks: [] },
    { id: 'tv', homeId: HOME_ID, roomId: 'living', name: 'Old television', nameJa: 'テレビ', year: '1998', glyph: '映', decision: 'recycle',
      story: "It stopped working years ago. I kept it because I didn't know where to take it.", x: 146, y: 98,
      journey: [
        { at: at('2026-08-15'), stage: 'home', by: 'Michiko Tanaka' },
        { at: at('2026-08-15'), stage: 'sorted', by: 'Yui and Arif', note: 'Recycle' },
        { at: at('2026-08-19'), stage: 'collected', by: 'Licensed collector', note: 'Handover signed, 21.4 kg' },
        { at: at('2026-08-22'), stage: 'recycler', by: 'Licensed recycler', note: 'Received, weight matches' },
      ], thanks: [] },
    { id: 'cooker', homeId: HOME_ID, roomId: 'kitchen', name: 'Rice cooker', nameJa: '炊飯器', year: '2015', glyph: '炊', decision: 'pass',
      story: 'It still works perfectly. I only cook for one now, and this one is for a family.', tagCode: 'KK-0472-RCE', x: 244, y: 50,
      journey: [
        { at: at('2026-09-12'), stage: 'home', by: 'Michiko Tanaka' },
        { at: at('2026-09-12'), stage: 'sorted', by: 'Yui and Arif', note: 'Michiko chose to pass it on' },
        { at: at('2026-09-20'), stage: 'delivered', by: 'Yui', note: 'Delivered to a first-year student' },
      ], thanks: [{ from: 'Ravi', message: 'Thank you, I cooked rice for my whole floor on the first night!', at: at('2026-09-21') }] },
  ];
}
