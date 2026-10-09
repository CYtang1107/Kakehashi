import Anthropic from '@anthropic-ai/sdk';
import type { Estimate } from '@kakehashi/shared';

// AI value estimates. With ANTHROPIC_API_KEY set, Claude looks at the item photo;
// otherwise a simple keyword rule gives an "offline estimate".

export const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

const client = () => new Anthropic();

const SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string', description: 'Short name of what the item is, in English' },
    priceLowJpy: { type: 'integer', description: 'Low end of a realistic second-hand price in Japan, in yen' },
    priceHighJpy: { type: 'integer', description: 'High end of a realistic second-hand price in Japan, in yen' },
    routeIfLetGo: { type: 'string', enum: ['pass', 'recycle', 'family'] },
    reason: { type: 'string', description: 'One or two plain sentences about the item and the route' },
  },
  required: ['category', 'priceLowJpy', 'priceHighJpy', 'routeIfLetGo', 'reason'],
  additionalProperties: false,
} as const;

const PROMPT = `You help university students who visit an elderly person's home every month for company and to keep the home safe.
The senior decides what happens to her belongings, and most items stay. Never encourage her to let anything go.
The students only ask you because she or her family asked what this item might be worth.
Look at the photo of one item and estimate a realistic second-hand price range in Japan.
Then say which route would suit it ONLY IF she chooses to let it go:
- "pass" if it is usable and someone else could use it (a student starting out, a second-hand shop, a charity)
- "recycle" if it is broken or unsafe (electronics go to a licensed recycler)
- "family" if it may be valuable, an heirloom, or likely to matter to the family, so they should be asked first
Write the reason gently and plainly, about the item, not about getting rid of it.
If you cannot tell what the item is, say so in the reason and give a wide price range.`;

export async function estimateWithClaude(base64: string, mime: string, name?: string): Promise<Estimate> {
  const mediaType = (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mime) ? mime : 'image/jpeg') as
    'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  const response = await client().beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 2000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: name ? `${PROMPT}\n\nThe students call this item: ${name}` : PROMPT },
      ],
    }],
  } as any);

  if (response.stop_reason === 'refusal') throw new Error('The model declined this photo.');
  const text = response.content.find((b: { type: string }) => b.type === 'text') as { text: string } | undefined;
  if (!text) throw new Error('No estimate in the response.');
  const parsed = JSON.parse(text.text) as Omit<Estimate, 'source'>;
  const low = Math.max(0, Math.round(parsed.priceLowJpy));
  const high = Math.max(low, Math.round(parsed.priceHighJpy));
  return { ...parsed, priceLowJpy: low, priceHighJpy: high, source: 'claude' };
}

const RULES: { match: RegExp; e: Omit<Estimate, 'source'> }[] = [
  { match: /tv|television|テレビ|monitor|microwave|電子レンジ|fridge|冷蔵庫|washing|洗濯/i,
    e: { category: 'Large electrical appliance', priceLowJpy: 0, priceHighJpy: 0, routeIfLetGo: 'recycle', reason: 'Old large appliances rarely resell. If she wants it gone, a licensed recycler is the right place, with the handover tracked.' } },
  { match: /camera|カメラ|watch|時計|ring|指輪|gold|金|jewel|宝石|kimono|着物|antique|骨董/i,
    e: { category: 'Possible valuable or heirloom', priceLowJpy: 3000, priceHighJpy: 30000, routeIfLetGo: 'family', reason: 'This may be valuable or matter to the family. If she ever wants to let it go, ask the family first.' } },
  { match: /sewing|ミシン|desk|机|chair|椅子|table|テーブル|shelf|棚|bicycle|自転車|cooker|炊飯器|kettle|やかん/i,
    e: { category: 'Usable household item', priceLowJpy: 1000, priceHighJpy: 8000, routeIfLetGo: 'pass', reason: 'If she wants to let it go, students setting up a first home would welcome it.' } },
];

export function offlineEstimate(name?: string): Estimate {
  const hit = RULES.find((r) => name && r.match.test(name));
  const e = hit?.e ?? { category: 'Household item', priceLowJpy: 300, priceHighJpy: 3000, routeIfLetGo: 'pass' as const, reason: 'No AI key is set, so this is a rough rule-based estimate.' };
  return { ...e, source: 'offline' };
}
