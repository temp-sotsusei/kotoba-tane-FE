import { useWordCheck } from '@/hooks/useWordCheck';
import { Stories, Story, StoryCreationPhase, WordCard } from '@/layout/StoryCreator/types';
import { postNextChapter, postStorySave } from '@/utils/apiClient';
import { JSONContent } from '@tiptap/react';
import { useMemo, useState } from "react";

export const useStoryCreator = () => {
    /* -------------------------------------------
     * 内部共通ロジック (Private Helpers)
     * ------------------------------------------- */
    // エディタの最新内容を stories 配列に確定・保存する
    const commitCurrentEpisode = (content: JSONContent) => {
        setStories(prev => {
            // 話数の重複をチェック（連打防止・データの整合性維持）
            const isAlreadyExists = prev.some(story => story.id === currentEpisode);

            if (isAlreadyExists) {
                // すでに存在する場合は内容を最新に塗り替える (Upsert)
                return prev.map(story => 
                    story.id === currentEpisode 
                        ? { ...story, story: content, words: selectedWords } 
                        : story
                );
            }

            // 新しいエピソードとしてリストの最後に追加
            const newEpisode: Story = {
                id: currentEpisode,
                story: content,
                words: selectedWords
            };
            return [...prev, newEpisode];
        });
    };

    const countStoryCharacters = (json: JSONContent): number => {
        if (!json) return 0;

        let textCount = 0;
        let paragraphCount = 0;
        let hardBreakCount = 0;

        const traverse = (node: any) => {
            if (!node) return;

            if (node.type === "text" && typeof node.text === "string") {
                textCount += node.text.length;
            }

            if (node.type === "hardBreak") {
                hardBreakCount += 1;
            }

            if (node.type === "customWord" && node.attrs?.text) {
                textCount += node.attrs.text.length;
            }

            if (node.type === "paragraph") {
                paragraphCount += 1;
            }

            if (Array.isArray(node.content)) {
                node.content.forEach(traverse);
            }
        };

        traverse(json);

        // text + hardBreak + (paragraph - 1)
        return textCount + hardBreakCount + Math.max(paragraphCount - 1, 0);
    };

    const validateStory = (targetStory) => {
        if (!targetStory) return false;

        if (storyTextLength < 1) {
        setErrorText("1文字以上入力してください");
        return false;
        }
        if (storyTextLength > 200) {
        setErrorText("200文字を超えています");
        return false;
        }

        if (!allUsed) {
        setErrorText("すべての単語を使ってください");
        return false;
        }

        return true;
    };

    /* -------------------------------------------
     * 進行管理 (Navigation / Progress)
     * ------------------------------------------- */
    // 作成中の話数 (第1話〜第5話)
    const [currentEpisode, setCurrentEpisode] = useState<number>(1);
    // 現在の制作ステップ (単語選択 / 物語執筆 / タイトル設定)
    const [currentPhase, setCurrentPhase] = useState<StoryCreationPhase>("selectWords");
    const [isOpen, setIsOpen] = useState(false);

    /* -------------------------------------------
     * 選択データ (Selection / Draft)
     * ------------------------------------------- */
    const [errorText, setErrorText] = useState<string>("");
    const [activeStoryContent, setActiveStoryContent] = useState<JSONContent>({
        type: "doc",
        content: [
            {
                type: "paragraph",
            },
        ],
    });
    const storyTextLength = useMemo(() => {
        if (!activeStoryContent) return 0;
        return countStoryCharacters(activeStoryContent);
      }, [activeStoryContent]);
    // カードから選ばれた、お話に使う4つの単語
    const [selectedWords, setSelectedWords] = useState<WordCard>(null);
    // 画面に提示する3枚の単語カード候補
    const [wordCardOptions, setWordCardOptions] = useState<WordCard[]>(null);
    const { usedWords, allUsed } = useWordCheck(activeStoryContent, selectedWords);

    /* -------------------------------------------
     * 作品データ (Project / Storage)
     * ------------------------------------------- */
    // 作品全体のタイトル
    const [title, setTitle] = useState<string>("");
    // 表紙（サムネイル）の画像ID
    const [thumbnailId, setThumbnailId] = useState<string>("");
    // 書き終えて保存された各話エピソードのリスト
    const [stories, setStories] = useState<Stories>([]);

    /* -------------------------------------------
     * アクション (Actions)
     * ------------------------------------------- */
    
    // 【単語選択画面】カードを1つ選び、執筆フェーズへ進む
    const handleSelectCard = () => {
        if (currentPhase !== "selectWords") return;
        if (!selectedWords) {
            console.warn("単語カードが選択されていません");
            return;
        }
        setCurrentPhase("createStory");
    };

    // 【執筆画面】今の内容を保存して、次の話の単語選択へ進む
    const handleNextEpisode = async () => {
        if (currentPhase !== "createStory" || currentEpisode >= 5) return;
        if (!validateStory(activeStoryContent)) return;
        
        commitCurrentEpisode(activeStoryContent);

        try {
            const response = await postNextChapter(activeStoryContent);
            const nextWords: WordCard[] = response; 
            setWordCardOptions(nextWords);
            setSelectedWords(nextWords[0]);

            // 4. 次の話へ進む準備
            setCurrentEpisode(prev => prev + 1);
            setActiveStoryContent({
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                    },
                ],
            });
            setCurrentPhase("selectWords");
        } catch (error) {
            console.error("単語の取得に失敗しました", error);
        }
    };

    // 【執筆画面】今の内容を保存して、タイトル・サムネイル設定へ進む
    const handleFinishWriting = () => {
        if (currentPhase !== "createStory") return;
        if (!validateStory(activeStoryContent)) return;
        
        commitCurrentEpisode(activeStoryContent);
        setActiveStoryContent({
            type: "doc",
            content: [
                {
                    type: "paragraph",
                },
            ],
        });
        setCurrentPhase("setTitleThumbnail");
    };

    const handleSaveStory = async () => {
        if (currentPhase !== "setTitleThumbnail") return;
        if (title.trim().length === 0) {
            setErrorText("タイトルを入力してください");
            return;
        }
        if (!thumbnailId) {
            setErrorText("表紙画像を選択してください");
            return;
        }

        const response = await postStorySave({
            storyTitle: title,
            thumbnailId: "019a9c35-c8ec-745a-a469-64cfb68111bc",
            chapters: stories.map(story => ({
                chapterNum: story.id,
                chapterJson: story.story,
            })),
        });
        console.log("Story saved successfully:", response);
    }

    return {
        currentEpisode,
        currentPhase,
        activeStoryContent,
        storyTextLength,
        selectedWords,
        wordCardOptions,
        usedWords,
        allUsed,
        title,
        thumbnailId,
        stories,
        isOpen,
        errorText,

        handleSelectCard,
        handleNextEpisode,
        handleFinishWriting,
        handleSaveStory,
        // UI側でタイトルやサムネイルを直接セットするためにSetterも公開
        setActiveStoryContent,
        setSelectedWords,
        setWordCardOptions,
        setTitle,
        setThumbnailId,
        setIsOpen,
        setErrorText,
    };
};