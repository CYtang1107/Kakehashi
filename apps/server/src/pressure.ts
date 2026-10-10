import Anthropic from '@anthropic-ai/sdk';
import type { CheckResult, PressureFlag } from '@kakehashi/shared';
import { aiEnabled } from './estimate';

// Fresh-eyes check: before a visit report reaches the family, a reviewer that did not write it
// reads it cold and flags wording that pressures the senior or treats her belongings as junk.

const SCHEMA = {
  type: 'object',
  properties: {
    flags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          phrase: { type: 'string', description: 'The exact words from the report, copied character for character' },
          reason: { type: 'string', description: 'One short sentence on why a family member might read this as pressure or disrespect' },
          suggestion: { type: 'string', description: 'A kinder rewording of just that phrase, in the same language as the report' },
        },
        required: ['phrase', 'reason', 'suggestion'],
        additionalProperties: false,
      },
    },
  },
  required: ['flags'],
  additionalProperties: false,
} as const;

const PROMPT = `You are reviewing a short visit report written by university students who visit an elderly woman at home every month.
You did not write it. Read it the way her adult child would, cold.
KAKEHASHI's promise: the senior decides everything about her belongings, "not now" is always a good answer, nobody pushes her to let go, and her things are treated with respect.
Flag only phrases that break that promise, for example:
- pressure or persuasion ("we convinced her", "she finally agreed", "she should get rid of")
- someone else deciding for her ("we threw out", "we cleared the room")
- disrespect for her belongings ("junk", "clutter", "useless stuff")
Do not flag neutral facts, her own decisions told plainly, or warm language. If nothing needs changing, return an empty list.
The report may be in English or Japanese; answer in the report's language.`;

export async function checkWithClaude(text: string): Promise<PressureFlag[]> {
  const response = await new Anthropic().beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 2000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: PROMPT,
    messages: [{ role: 'user', content: `Visit report:\n\n${text}` }],
  } as any);
  if (response.stop_reason === 'refusal') throw new Error('The reviewer declined this report.');
  const block = response.content.find((b: { type: string }) => b.type === 'text') as { text: string } | undefined;
  if (!block) throw new Error('No review in the response.');
  return (JSON.parse(block.text) as { flags: PressureFlag[] }).flags.filter((f) => f.phrase && text.includes(f.phrase));
}

// Offline word list, English and Japanese. Coarser than the AI reviewer, but never silent.
const RULES: { match: RegExp; reason: string; suggestion: string }[] = [
  { match: /\b(finally )?(got|get|getting) rid of\b/i, reason: 'Sounds like the goal was removing her things.', suggestion: 'she chose to pass on' },
  { match: /\bthr(ew|ow|owing) (out|away)\b/i, reason: 'Sounds like someone else disposed of her things.', suggestion: 'at her request, went to' },
  { match: /\bclear(ed|ing)? (out|the room|everything)\b/i, reason: 'Sounds like a clearance, not her choice.', suggestion: 'tidied together' },
  { match: /\b(convinced|persuaded|talked her into|pushed her)\b/i, reason: 'Describes persuading her.', suggestion: 'she decided' },
  { match: /\bfinally agreed\b/i, reason: 'Suggests she was worn down.', suggestion: 'she decided' },
  { match: /\bshe (should|must|needs to) (let go|give up|get rid)/i, reason: 'Tells her what to do with her things.', suggestion: 'when she is ready, she may' },
  { match: /\b(junk|clutter|useless|rubbish|trash)\b/i, reason: 'Treats her belongings as worthless.', suggestion: 'her things' },
  { match: /捨て(た|る|ました|させ)/, reason: '本人以外が処分したように読めます。', suggestion: 'ご本人の希望で手放した' },
  { match: /処分(した|する|しました)/, reason: '片付け業者のような表現です。', suggestion: 'ご本人が次の方へ譲ると決めた' },
  { match: /説得/, reason: '本人を説得したように読めます。', suggestion: 'ご本人が決めた' },
  { match: /(ゴミ|がらくた|不用品)/, reason: '持ち物を価値のない物として扱っています。', suggestion: 'お持ちの品' },
  { match: /やっと(手放|納得)/, reason: '本人が押し切られたように読めます。', suggestion: 'ご本人が決めた' },
];

export function checkOffline(text: string): PressureFlag[] {
  const flags: PressureFlag[] = [];
  for (const r of RULES) {
    const m = text.match(r.match);
    if (m) flags.push({ phrase: m[0], reason: r.reason, suggestion: r.suggestion });
  }
  return flags;
}

export async function checkReport(text: string): Promise<CheckResult> {
  if (aiEnabled()) {
    try {
      const flags = await checkWithClaude(text);
      return { ok: flags.length === 0, flags, source: 'claude' };
    } catch (err) {
      console.warn('Fresh-eyes check by AI failed, using the word list:', err instanceof Error ? err.message : err);
    }
  }
  const flags = checkOffline(text);
  return { ok: flags.length === 0, flags, source: 'offline' };
}
