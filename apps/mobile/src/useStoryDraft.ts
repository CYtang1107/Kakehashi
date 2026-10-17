import { useEffect, useState } from 'react';
import { pick, type Item } from '@kakehashi/shared';
import type { Lang } from './i18n';

// Both item presentations edit the prose they display, without resetting unsaved words on refresh.
export function useStoryDraft(item: Item | undefined, language: Lang) {
  const makeDraft = () => { const value = item ? pick(language, item.story, item.storyJa) : '';
    return { itemId: item?.id, language, value, original: value }; };
  const [draft, setDraft] = useState(makeDraft);
  useEffect(() => {
    setDraft(previous => previous.itemId === item?.id && previous.value !== previous.original ? previous : makeDraft());
  }, [item?.id, item?.story, item?.storyJa, language]);
  return { draft, setValue: (value: string) => setDraft(previous => ({ ...previous, value })),
    markSaved: () => setDraft(previous => ({ ...previous, original: previous.value })),
    dirty: draft.value !== draft.original };
}
