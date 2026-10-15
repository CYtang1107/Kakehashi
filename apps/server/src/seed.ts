import fs from 'node:fs';
import path from 'node:path';
import type { Delivery, Handover, Home, Item, ItemIcon, ItemPhoto, Place, Plan, PublicStory, TrackPoint } from '@kakehashi/shared';
// Same folder as db.ts's UPLOAD_DIR (not imported, to avoid a circular import).
const UPLOAD_DIR = path.resolve(__dirname, '..', 'data', 'uploads');
import { NEARBY } from './nearby';

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
    seniorNameJa: '田中 美智子',
    town: 'Niigata',
    townJa: '新潟',
    childName: 'Kenji',
    childNameJa: '健二',
    seniorInterests: ['gardening', 'cooking', 'letters'],
    students: [
      { id: 'yui', name: 'Yui', initial: 'Y', interests: 'gardening, cooking', interestsJa: '園芸・料理', university: 'Niigata University', universityJa: '新潟大学', visits: 4, role: 'pair', goal: { name: 'Driving licence', targetJpy: 300000, setAsidePct: 20 },
        passed: { identity: '2026-06-20', interview: '2026-06-24', training: '2026-07-02', dementia: '2026-07-05', quiz: '2026-07-06', shadow: '2026-07-11', signoff: '2026-07-12' } },
      { id: 'arif', name: 'Arif', initial: 'A', interests: 'photography, repairs', interestsJa: '写真・修理', university: 'Niigata University', universityJa: '新潟大学', visits: 4, role: 'pair',
        passed: { identity: '2026-06-21', interview: '2026-06-24', training: '2026-07-02', dementia: '2026-07-05', quiz: '2026-07-07', shadow: '2026-07-11', signoff: '2026-07-12' } },
      { id: 'haruto', name: 'Haruto', initial: 'H', interests: 'gardening, history', interestsJa: '園芸・歴史', university: 'Niigata University', universityJa: '新潟大学', visits: 0, role: 'trainee',
        passed: { identity: '2026-09-28', interview: '2026-10-02', training: '2026-10-06' } },
    ],
    consent: { recording: true, at: '2026-07-18' },
    rooms: [
      { id: 'living', name: 'Living room', nameJa: '居間', status: 'sorted', x: 10, y: 10, w: 170, h: 120, photos: [] },
      { id: 'kitchen', name: 'Kitchen', nameJa: '台所', status: 'sorted', x: 180, y: 10, w: 130, h: 80, photos: [] },
      { id: 'washitsu', name: 'Tatami room', nameJa: '和室', status: 'now', x: 180, y: 90, w: 130, h: 140, photos: [] },
      { id: 'bedroom', name: 'Bedroom', nameJa: '寝室', status: 'later', x: 10, y: 130, w: 110, h: 100, photos: [] },
      { id: 'storage', name: 'Storage', nameJa: '物置', status: 'later', x: 120, y: 130, w: 60, h: 100, photos: [] },
    ],
    visits: [
      { id: 'v5', date: '2026-10-24', roomId: 'washitsu', summary: 'Tatami room, part 2', summaryJa: '和室・続き', status: 'planned' },
      { id: 'v4', date: '2026-10-10', roomId: 'washitsu', summary: 'Most of the hour was stories about Osaka. She chose to keep the kimono and, when she was ready, to pass on the desk and sewing machine.', summaryJa: 'ほとんどの時間、大阪の思い出話を聞きました。着物は手元に残すことに。文机とミシンは、ご本人の気持ちが固まってから次の方へ譲ると決めました。', status: 'done', checked: 'offline' },
      { id: 'v3', date: '2026-09-12', roomId: 'kitchen', summary: 'Cleared the floor by the stairs so she can walk safely. At her request, the spare rice cooker went to a student.', summaryJa: '階段の近くの床を片付け、安全に歩けるようにしました。ご本人の希望で、予備の炊飯器を学生に譲りました。', status: 'done', checked: 'offline' },
      { id: 'v2', date: '2026-08-15', roomId: 'living', summary: 'Photo albums and tea; nothing left the house. The TV, broken for years, went to a licensed recycler at her request.', summaryJa: 'お茶を飲みながらアルバムを見ました。家から出た物はありません。何年も映らないテレビは、ご本人の希望で認定リサイクル業者へ。', status: 'done', checked: 'offline' },
      { id: 'v1', date: '2026-07-18', roomId: 'living', summary: 'First visit. Tea and photo albums, nothing sorted. That was the plan.', summaryJa: '初回の訪問。お茶とアルバムの時間で、片付けはしていません。予定どおりです。', status: 'done', checked: 'offline' },
    ],
    activities: [
      { id: 'act-garden', title: 'Gardening group', titleJa: '園芸の会', interest: 'gardening', interestJa: '園芸', placeId: 'osm-n12880273263', place: 'Najimi no Ie Kinaseya (community salon)', placeJa: 'なじみの家きなせや天神尾', date: '2026-10-29 14:00', companion: 'Yui', status: 'accepted' },
      { id: 'act-cooking', title: 'Community lunch cooking', titleJa: 'みんなの昼ごはん作り', interest: 'cooking', interestJa: '料理', placeId: 'osm-w392703365', place: 'Ekinan Community Centre, kitchen', placeJa: '駅南コミュニティーセンター 調理室', date: '2026-11-12 11:00', status: 'suggested' },
      { id: 'act-letters', title: 'Calligraphy and letters circle', titleJa: '書道と手紙の会', interest: 'letters', interestJa: '手紙', placeId: 'osm-n3958970808', place: 'Toyano City Library', placeJa: '新潟市立鳥屋野図書館', date: '2026-11-20 13:30', status: 'suggested' },
      { id: 'act-photo', title: 'Old photos talk', titleJa: '昔の写真を語る会', interest: 'photography', interestJa: '写真', placeId: 'osm-n12880273263', place: 'Najimi no Ie Kinaseya (community salon)', placeJa: 'なじみの家きなせや天神尾', date: '2026-09-18 14:00', companion: 'Arif', status: 'attended' },
    ],
    planId: 'monthly',
    payments: [],
    proceedsChoice: 'grandchild',
    letters: [
      { id: 'l-2026-09', month: '2026-09', itemIds: ['cooker'], note: 'Thank you for the stories about your kitchen. The stairs are clear now, so please walk safely! See you in October.', noteJa: '台所の思い出話をありがとうございました。階段まわりがすっきりしたので、足元に気をつけてお過ごしください。10月にまたお会いしましょう。', status: 'mailed', mailedAt: '2026-09-14' },
    ],
    safety: [
      { id: 'f1', roomId: 'bedroom', kind: 'handrail', amount: 1.8, status: 'agreed', x: 40, y: 200, note: 'Along the wall from the bed to the door; she holds the wall at night.', noteJa: 'ベッドから扉までの壁沿い。夜は壁を伝って歩いています。' },
      { id: 'f2', roomId: 'washitsu', kind: 'step', amount: 1, status: 'suggested', x: 186, y: 150, note: 'The raised threshold into the tatami room; she lifts her foot slowly here.', noteJa: '和室の敷居の段差。ここでゆっくり足を上げています。' },
      { id: 'f3', roomId: 'kitchen', kind: 'nonslip', amount: 4, status: 'suggested', x: 210, y: 70, note: 'Floor by the sink gets wet.', noteJa: '流し台の前の床が濡れやすい。' },
      { id: 'f4', roomId: 'bedroom', kind: 'light', amount: 2, status: 'agreed', x: 90, y: 160, note: 'Sensor night lights on the way to the toilet.', noteJa: 'トイレまでの通路にセンサー付き足元灯。' },
      { id: 'f5', roomId: 'living', kind: 'door', amount: 1, status: 'not-now', x: 170, y: 40, note: 'Swing door could become a sliding door. She prefers to keep it for now.', noteJa: '開き戸を引き戸に。今はこのままが良いそうです。' },
    ],
    // Her home is a demo point; every other place is real, from OpenStreetMap (see nearby.ts). Her places come first, in letter order.
    places: herPlaces(),
    pay: [
      ...['2026-07-18', '2026-08-15', '2026-09-12', '2026-10-10'].flatMap((date) => ['yui', 'arif'].map((sid) => ({
        id: `pay-${sid}-${date}`, studentId: sid, date, kind: 'visit' as const, hours: 3, amountJpy: 3900,
        status: date < '2026-10-01' ? 'paid' as const : 'pending' as const, ...(date < '2026-10-01' ? { paidAt: '2026-10-05' } : {}) }))),
      { id: 'pay-yui-call-1', studentId: 'yui', date: '2026-08-29', kind: 'call', amountJpy: 500, status: 'paid', paidAt: '2026-09-05' },
      { id: 'pay-yui-call-2', studentId: 'yui', date: '2026-09-26', kind: 'call', amountJpy: 500, status: 'paid', paidAt: '2026-10-05' },
      { id: 'pay-arif-outing-1', studentId: 'arif', date: '2026-09-18', kind: 'outing', hours: 2, amountJpy: 2600, status: 'paid', paidAt: '2026-10-05' },
    ],
    weather: { office: '150000', area: '1510000', areaName: 'Niigata City', areaNameJa: '新潟市', checks: [], demo: null },
    // Demo: Yui is walking with her to the gardening group right now (simulated, so it moves on any screen).
    outings: [
      { id: 'o-demo', activityId: 'act-garden', placeId: 'osm-n12880273263', by: 'Yui', consentAt: new Date().toISOString(),
        startedAt: new Date().toISOString(), status: 'live', trail: [], simulated: true },
    ],
    workers: [
      { id: 'w-sato', name: 'Takeshi Sato', nameJa: '佐藤 武', from: 'Silver Human Resources Centre', fromJa: 'シルバー人材センター', skills: ['garden', 'lifting', 'repair'],
        checks: { identity: '2026-05-10', interview: '2026-05-14', training: '2026-05-20' }, jobs: 38 },
      { id: 'w-kobayashi', name: 'Emi Kobayashi', nameJa: '小林 恵美', from: 'Home-help cooperative', fromJa: '家事支援の協同組合', skills: ['cleaning'],
        checks: { identity: '2026-04-02', interview: '2026-04-06', training: '2026-04-15' }, jobs: 21 },
      { id: 'w-mori', name: 'Mori Builders', nameJa: '森工務店', from: 'Licensed builder, registered for care-insurance work', fromJa: '住宅改修の登録業者', skills: ['builder', 'repair'],
        checks: { identity: '2026-03-01', interview: '2026-03-03', training: '2026-03-10' }, jobs: 64 },
      { id: 'w-ryo', name: 'Ryo Ishida', nameJa: '石田 涼', from: 'Gig worker, joining', fromJa: '登録中のギグワーカー', skills: ['lifting', 'garden'],
        checks: { identity: '2026-10-05' }, jobs: 0 },
    ],
    services: [
      { id: 's1', kind: 'garden', when: 'soon', by: 'her', note: 'Weeds by the veranda; the tomatoes need stakes.', noteJa: 'ベランダ脇の草取りと、トマトの支柱立て。', status: 'booked', createdAt: '2026-10-08', workerId: 'w-sato', date: '2026-10-15', hours: 2, priceJpy: 4000 },
      { id: 's2', kind: 'builder', when: 'soon', by: 'student', fixId: 'f1', note: 'Handrail in the bedroom she agreed to.', noteJa: 'ご本人が同意した寝室の手すり。', status: 'requested', createdAt: '2026-10-10' },
      { id: 's4', kind: 'lifting', when: 'soon', by: 'her', note: 'Move the old wardrobe from the bedroom to the entrance for collection.', noteJa: '寝室の古い箪笥を、回収のため玄関まで運ぶ。', status: 'open', createdAt: '2026-10-09', postedAt: '2026-10-10', date: '2026-10-18', hours: 2, priceJpy: 6000 },
      { id: 's3', kind: 'cleaning', when: 'soon', by: 'her', note: 'Kitchen and bathroom before the autumn.', noteJa: '秋の前に台所とお風呂の掃除。', status: 'done', createdAt: '2026-09-14', workerId: 'w-kobayashi', date: '2026-09-20', hours: 2, priceJpy: 6000, feedback: 'good' },
    ],
    future: {
      wish: 'young-family',
      words: 'I am staying here as long as I can. After that, I would rather a young family lived here than see it stand empty.',
      wordsJa: 'できる限りここで暮らします。そのあとは、空き家にするより、若い家族に住んでもらえたら嬉しいです。',
      recordedBy: 'Yui', recordedAt: '2026-10-10',
      familyNotes: [
        { by: 'Kenji', note: 'I cannot move back to Niigata. If that is what Mum wants, I am happy with it.', noteJa: '新潟には戻れません。母がそう望むなら、それで良いと思います。', at: '2026-10-11' },
      ],
      condition: {
        roof: { level: 'ok', at: '2026-09-12' },
        water: { level: 'watch', note: 'Kitchen drain is slow.', noteJa: '台所の排水が遅い。', at: '2026-09-12' },
        wood: { level: 'watch', note: 'Two veranda boards feel soft.', noteJa: 'ベランダの板が2枚柔らかい。', at: '2026-10-10' },
        walls: { level: 'ok', at: '2026-10-10' },
      },
      emptyCost: { landTaxJpy: 38000, buildingTaxJpy: 22000, upkeepJpy: 120000, insuranceJpy: 25000 },
      steps: { papers: '2026-09-12' },
    },
    fieldNotes: [
      { id: 'n1', date: '2026-10-10', by: 'Yui', kind: 'likes', text: 'Hojicha first, always. She opens up when we ask about Osaka in the 1960s.', textJa: 'まずはほうじ茶から。1960年代の大阪の話を聞くと、たくさん話してくださいます。' },
      { id: 'n2', date: '2026-10-10', by: 'Arif', kind: 'avoid', text: 'Do not open the kimono drawer unless she offers. It belonged to her mother.', textJa: '着物の引き出しは、ご本人が勧めない限り開けないこと。お母さまの物です。' },
      { id: 'n3', date: '2026-09-12', by: 'Yui', kind: 'tip', text: 'She tires after about an hour. Take a tea break, then decide whether to continue.', textJa: '1時間ほどで疲れが出ます。お茶休憩をはさみ、続けるかどうかはご本人と決めましょう。' },
      { id: 'n4', date: '2026-08-15', by: 'Arif', kind: 'likes', text: 'Loves her tomato plants on the veranda. Ask how they are doing.', textJa: 'ベランダのトマトが自慢です。様子を聞いてみてください。' },
    ],
    calls: [
      { id: 'c1', date: '2026-08-29', by: 'Yui', status: 'done', minutes: 15, mood: 'good', note: 'Talked about her tomatoes. She asked if we could look at the photo albums again next time.', noteJa: 'トマトの話をしました。次回またアルバムを一緒に見たいそうです。' },
      { id: 'c2', date: '2026-09-26', by: 'Yui', status: 'done', minutes: 12, mood: 'okay', note: 'A little tired after a cold, now better. Happy that the rice cooker went to a student.', noteJa: '風邪で少し疲れ気味でしたが、もう元気。炊飯器が学生さんの役に立って嬉しいそうです。' },
      { id: 'c3', date: '2026-10-17', by: 'Yui', status: 'planned' },
    ],
  };
}

const at = (d: string) => `${d}T10:00:00+09:00`;

// Demo points for item journeys: her home, a partner repair shop, a licensed recycler, and new owners' areas.
export const TRACK = {
  home: { lat: 37.9035, lng: 139.0545, label: 'Her home', labelJa: 'ご自宅' },
  repair: { lat: 37.9150, lng: 139.0640, label: 'Partner repair shop (demo point)', labelJa: '提携の修理店（デモ）' },
  recycler: { lat: 37.9290, lng: 139.1050, label: 'Licensed recycler (demo point)', labelJa: '認定リサイクル業者（デモ）' },
  ownerNishi: { lat: 37.8700, lng: 138.9500, label: 'New owner’s area, Nishi-ku (area only)', labelJa: '新しい持ち主の地域・西区（地域のみ）', area: true },
  ownerIkarashi: { lat: 37.8660, lng: 138.9420, label: 'New owner’s area, near the university (area only)', labelJa: '新しい持ち主の地域・大学の近く（地域のみ）', area: true },
} satisfies Record<string, TrackPoint>;
export function stagePoint(stage: Handover['stage'], owner: TrackPoint = TRACK.ownerNishi): TrackPoint {
  return stage === 'repair' ? TRACK.repair : stage === 'recycler' ? TRACK.recycler : stage === 'delivered' ? owner : TRACK.home;
}

export function seedItems(): Item[] {
  return withTracks([
    { id: 'sewing', share: { at: '2026-10-10', name: 'first', audio: false, photos: true }, hearts: 128, comments: [
      { id: 'cm1', from: 'Aiko, Sendai', message: 'My mother sewed my school uniform on one just like this. Thank you for the story.', at: '2026-10-11T09:20:00Z', status: 'shown' },
      { id: 'cm2', from: 'Ken', message: 'Lovely. Is the pattern book still around? I would love to see it.', at: '2026-10-12T18:05:00Z', status: 'pending' },
    ], homeId: HOME_ID, roomId: 'washitsu', name: 'Sewing machine', nameJa: 'ミシン', year: '1972', glyph: '縫', decision: 'pass',
      story: "I sewed all three children's school bags on this machine. Kenji's had a rocket on it. I'd like it to go to a young person who will make something with it.", storyJa: 'このミシンで、子ども三人の通園かばんを縫いました。健二のにはロケットの刺しゅう。何かを作ってくれる若い人に使ってほしいです。',
      x: 228, y: 148,
      estimate: { category: 'Household sewing machine', priceLowJpy: 3000, priceHighJpy: 8000, routeIfLetGo: 'pass', reason: 'Older mechanical machines are still useful after a service.', source: 'offline' },
      proceedsJpy: 3000,
      journey: [
        { at: at('2026-10-10'), stage: 'home', by: 'Michiko Tanaka', note: 'In the family since 1972' },
        { at: at('2026-10-10'), stage: 'sorted', by: 'Yui and Arif', note: 'Michiko chose to pass it on' },
        { at: at('2026-10-16'), stage: 'repair', by: 'Partner repair shop', note: 'Serviced and tested' },
      ], thanks: [] },
    { id: 'desk', share: { at: '2026-10-10', name: 'anonymous', audio: false }, hearts: 46, comments: [
      { id: 'cm3', from: '', message: 'My father wrote to us the same way from Nagoya. Thank you for sharing this.', at: '2026-10-11T12:40:00Z', status: 'shown' },
    ], homeId: HOME_ID, roomId: 'washitsu', name: 'Writing desk', nameJa: '文机', year: '1968', glyph: '机', decision: 'pass',
      story: 'This is where I wrote letters to my husband when he worked in Osaka. Every Sunday night, one letter.', storyJa: '夫が大阪で働いていた頃、この机で手紙を書きました。毎週日曜の夜に一通ずつ。',
      x: 282, y: 200,
      journey: [
        { at: at('2026-10-10'), stage: 'home', by: 'Michiko Tanaka' },
        { at: at('2026-10-10'), stage: 'sorted', by: 'Yui and Arif', note: 'Michiko chose to pass it on' },
      ], thanks: [] },
    { id: 'kimono', homeId: HOME_ID, roomId: 'washitsu', name: 'Wedding kimono', nameJa: '着物', year: '1966', glyph: '衣', decision: 'keep',
      story: 'My mother made the obi for this. I want to keep it. Maybe a granddaughter will wear it one day.', storyJa: 'この帯は母が作ってくれました。手元に置いておきたいの。いつか孫娘が着てくれるかもしれません。', x: 208, y: 204,
      journey: [{ at: at('2026-10-10'), stage: 'home', by: 'Michiko Tanaka', note: 'Kept at home' }], thanks: [] },
    { id: 'camera', homeId: HOME_ID, roomId: 'living', name: 'Film camera', nameJa: 'カメラ', year: '1979', glyph: '写', decision: 'open',
      story: 'My husband took every family photo with this camera. Kenji used to carry the bag for him on trips.', storyJa: '家族の写真は全部、夫がこのカメラで撮りました。旅行のときは健二がかばん持ちでした。', x: 62, y: 58,
      journey: [{ at: at('2026-08-15'), stage: 'home', by: 'Michiko Tanaka', note: 'On the shelf where it has always been' }], thanks: [] },
    { id: 'sunglasses', share: { at: '2026-10-12', name: 'first', audio: false, photos: true }, hearts: 23, comments: [
      { id: 'cm4', from: '', message: 'My father had a pair just like these. Thank you for sharing.', at: '2026-10-13T08:00:00Z', status: 'shown' },
    ], homeId: HOME_ID, roomId: 'living', name: 'Sunglasses', nameJa: 'サングラス', year: '1985', glyph: '眼', decision: 'family',
      story: "My husband bought these for our trip to Okinawa in 1985 and wore them every summer after. I'd like Kenji to have them.", storyJa: '1985年に沖縄へ旅行したとき、夫が買ったサングラスです。それから毎年、夏になるとかけていました。健二に持っていてほしいです。', x: 104, y: 36,
      journey: [
        { at: at('2026-10-10'), stage: 'home', by: 'Michiko Tanaka', note: 'In the drawer by the door' },
        { at: at('2026-10-10'), stage: 'sorted', by: 'Yui and Arif', note: 'Michiko chose to give them to Kenji' },
      ], thanks: [] },
    { id: 'tv', homeId: HOME_ID, roomId: 'living', name: 'Old television', nameJa: 'テレビ', year: '1998', glyph: '映', decision: 'recycle',
      story: "It stopped working years ago. I kept it because I didn't know where to take it.", storyJa: 'もう何年も前に映らなくなりました。どこに持っていけばいいか分からなくて、そのままにしていたの。', x: 146, y: 98,
      journey: [
        { at: at('2026-08-15'), stage: 'home', by: 'Michiko Tanaka' },
        { at: at('2026-08-15'), stage: 'sorted', by: 'Yui and Arif', note: 'Recycle' },
        { at: at('2026-08-19'), stage: 'collected', by: 'Licensed collector', note: 'Handover signed, 21.4 kg' },
        { at: at('2026-08-22'), stage: 'recycler', by: 'Licensed recycler', note: 'Received, weight matches' },
      ], thanks: [] },
    { id: 'cooker', homeId: HOME_ID, roomId: 'kitchen', name: 'Rice cooker', nameJa: '炊飯器', year: '2015', glyph: '炊', decision: 'pass',
      story: 'It still works perfectly. I only cook for one now, and this one is for a family.', storyJa: 'まだちゃんと炊けます。今は一人分しか炊かないから、家族向けのこれは誰かに使ってほしい。', x: 244, y: 50,
      journey: [
        { at: at('2026-09-12'), stage: 'home', by: 'Michiko Tanaka' },
        { at: at('2026-09-12'), stage: 'sorted', by: 'Yui and Arif', note: 'Michiko chose to pass it on' },
        { at: at('2026-09-20'), stage: 'delivered', by: 'Yui', note: 'Delivered to a first-year student' },
      ], thanks: [{ from: 'Ravi', message: 'Thank you, I cooked rice for my whole floor on the first night!', at: at('2026-09-21') }] },
  ]);
}

// Each journey step gets its place; the desk is on its way to its new owner with Arif (simulated for the demo).
// Demo photos are the team's own pictures, committed in apps/server/demo and copied into uploads at start-up.
// Each comes with a pixel icon made from it (scripts/make-demo-asset.ts). Never a stranger's or a seller's photo.
const DEMO_PHOTOS: Record<string, { file: string; kind: ItemPhoto['kind']; caption: string; captionJa: string }[]> = {
  sunglasses: [
    { file: 'demo-sunglasses-photo.webp', kind: 'photo', caption: 'His sunglasses today, from the drawer by the door', captionJa: '今のサングラス（玄関横の引き出しから）' },
  ],
};
function demoPhotos(itemId: string): ItemPhoto[] {
  return (DEMO_PHOTOS[itemId] ?? []).filter((p) => fs.existsSync(path.join(UPLOAD_DIR, p.file)))
    .map((p, i) => ({ id: `ph-${itemId}-${i}`, url: `/files/${p.file}`, kind: p.kind, caption: p.caption, captionJa: p.captionJa, by: 'Yui', at: at('2026-10-10') }));
}

function withTracks(items: Item[]): Item[] {
  return items.map((it) => {
    const owner = it.id === 'cooker' ? TRACK.ownerIkarashi : TRACK.ownerNishi;
    const journey = it.journey.map((j) => ({ ...j, pt: stagePoint(j.stage, owner) }));
    const delivery: Delivery | undefined = it.id === 'desk'
      ? { by: 'Arif', from: TRACK.home, to: TRACK.ownerNishi, startedAt: at('2026-10-10'), minutes: 35, simulated: true } : undefined;
    const photos = demoPhotos(it.id);
    const iconFile = path.join(UPLOAD_DIR, `demo-${it.id}-icon.json`);
    const icon: ItemIcon | undefined = DEMO_PHOTOS[it.id] && fs.existsSync(iconFile) ? JSON.parse(fs.readFileSync(iconFile, 'utf8')) : undefined;
    return { ...it, journey, ...(delivery ? { delivery } : {}), ...(photos.length ? { photos } : {}), ...(icon ? { icon } : {}) };
  });
}

// Her places on the neighbourhood map, lettered A, B, C… in this order, then everything else nearby.
const MINE = [
  'osm-n12880273263', // なじみの家きなせや天神尾: community salon (gardening group, old photos talk)
  'osm-w392703365', // 駅南コミュニティーセンター (community lunch cooking)
  'osm-n12704105958', // 地域包括支援センター: her care support centre
  'osm-n12743687389', // わかばやし内科クリニック: her doctor
  'osm-n12747104715', // イオン: where she shops
  'osm-n3958970808', // 鳥屋野図書館 (calligraphy and letters circle)
];
function herPlaces(): Place[] {
  const home: Place = { id: 'p-home', kind: 'home', name: 'Her home (demo point)', nameJa: 'ご自宅（デモ）', lat: 37.9035, lng: 139.0545 };
  const mine = MINE.map((id) => ({ ...NEARBY.find((p) => p.id === id)!, mine: true }));
  return [home, ...mine, ...NEARBY.filter((p) => !MINE.includes(p.id))];
}

// Invented example stories from other towns, so the demo story globe shows how it fills up.
// They are labelled "Example" in the app and take no messages.
export function exampleStories(): PublicStory[] {
  const ex = (id: string, o: Omit<PublicStory, 'id' | 'photos' | 'example' | 'comments' | 'audioUrl'> & { comments?: PublicStory['comments'] }): PublicStory =>
    ({ id: `ex-${id}`, photos: [], comments: [], example: true, ...o });
  return [
    ex('kotatsu', { name: 'Kotatsu table', nameJa: 'こたつ', year: '1985', glyph: '炬', lat: 39.7, lng: 140.1, hearts: 73, sharedAt: '2026-10-08',
      teller: 'Someone in Akita', tellerJa: '秋田の方',
      story: 'Every winter all four of us did homework under it and peeled mikan until our fingers were orange.',
      storyJa: '冬になると、家族四人でこの中で宿題をして、指が黄色くなるまでみかんをむきました。',
      journey: [{ stage: 'home', at: '2026-09-20' }, { stage: 'sorted', at: '2026-09-20' }, { stage: 'delivered', at: '2026-10-04' }] }),
    ex('bicycle', { name: 'Delivery bicycle', nameJa: '自転車', year: '1990', glyph: '輪', lat: 38.3, lng: 140.9, hearts: 41, sharedAt: '2026-10-06',
      teller: 'Takeshi, Sendai', tellerJa: '武さん（仙台）',
      story: 'I rode it to the fish market before sunrise for thirty years. The bell still works.',
      storyJa: '三十年、夜明け前の魚市場へこれで通いました。ベルはまだ鳴ります。',
      journey: [{ stage: 'home', at: '2026-09-12' }, { stage: 'sorted', at: '2026-09-12' }, { stage: 'repair', at: '2026-09-26' }] }),
    ex('teaset', { name: 'Kutani tea set', nameJa: '九谷焼の茶器', year: '1979', glyph: '茶', lat: 36.6, lng: 136.7, hearts: 58, sharedAt: '2026-10-05',
      teller: 'Someone in Kanazawa', tellerJa: '金沢の方',
      story: 'A wedding gift from my teacher. We only used it when someone came to say thank you.',
      storyJa: '恩師からの結婚祝いです。誰かがお礼を言いに来た時だけ使いました。',
      journey: [{ stage: 'home', at: '2026-09-28' }] }),
    ex('records', { name: 'Record player', nameJa: 'レコードプレーヤー', year: '1974', glyph: '音', lat: 34.4, lng: 133.2, hearts: 96, sharedAt: '2026-10-03',
      teller: 'Fumiko, Onomichi', tellerJa: '文子さん（尾道）',
      story: 'My husband played the same jazz record every Sunday morning. I still know where it skips.',
      storyJa: '夫は毎週日曜の朝、同じジャズのレコードをかけました。どこで音が飛ぶか、今も覚えています。',
      journey: [{ stage: 'home', at: '2026-09-15' }, { stage: 'sorted', at: '2026-09-15' }, { stage: 'repair', at: '2026-09-22' }, { stage: 'delivered', at: '2026-10-01' }],
      comments: [{ from: '', message: 'Now I want to know which record it was.', at: '2026-10-04T10:00:00Z' }] }),
    ex('tansu', { name: 'Clothes chest', nameJa: '桐たんす', year: '1958', glyph: '箪', lat: 31.6, lng: 130.6, hearts: 34, sharedAt: '2026-09-30',
      teller: 'Someone in Kagoshima', tellerJa: '鹿児島の方',
      story: 'It came with my mother when she married. The drawers still close with a soft puff of air.',
      storyJa: '母が嫁入りの時に持ってきたたんすです。引き出しは今も、ふっと空気の音をさせて閉まります。',
      journey: [{ stage: 'home', at: '2026-09-10' }, { stage: 'sorted', at: '2026-09-10' }] }),
    ex('knitting', { name: 'Knitting basket', nameJa: '編み物かご', year: '1981', glyph: '編', lat: 43.1, lng: 141.4, hearts: 62, sharedAt: '2026-09-27',
      teller: 'Setsuko, Sapporo', tellerJa: '節子さん（札幌）',
      story: 'Every grandchild got a scarf from this basket before their first snow.',
      storyJa: '孫たちはみんな、初雪の前にこのかごから編んだマフラーをもらいました。',
      journey: [{ stage: 'home', at: '2026-09-05' }, { stage: 'sorted', at: '2026-09-05' }, { stage: 'delivered', at: '2026-09-21' }] }),
  ];
}
