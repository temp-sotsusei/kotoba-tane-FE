import { useMemo } from 'react';
import { JSONContent } from '@tiptap/react';

type UseWordCheckResult = {
  usedWords: string[];      // 実際に使われている単語
  unusedWords: string[];    // まだ使われていない単語
  allUsed: boolean;         // すべて使われているか
};

/**
 * TipTap の JSONContent から currentWords の使用状況を取得
 */
export const useWordCheck = (json: JSONContent, currentWords: string[] | undefined): UseWordCheckResult => {
  return useMemo(() => {
    if (!json || !currentWords) return { usedWords: [], unusedWords: [], allUsed: false };

    const usedSet = new Set<string>();

    const traverse = (node: any) => {
      if (!node) return;
      if (node.type === 'customWord' && node.attrs?.text) {
        usedSet.add(node.attrs.text.toLowerCase());
      }
      if (Array.isArray(node.content)) node.content.forEach(traverse);
    };

    traverse(json);

    const usedWords = currentWords.filter(w => usedSet.has(w.toLowerCase()));
    const unusedWords = currentWords.filter(w => !usedSet.has(w.toLowerCase()));
    const allUsed = unusedWords.length === 0;

    return { usedWords, unusedWords, allUsed };
  }, [json, currentWords]);
};