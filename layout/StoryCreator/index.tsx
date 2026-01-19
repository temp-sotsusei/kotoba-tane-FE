"use client";
import { FC, useEffect, useState } from "react";
import { Stories } from "./types";
import { FaChevronDown } from "react-icons/fa";
import ReadOnlyEditor from "@/components/ReadOnlyEditor";
import { useStoryCreator } from "./hooks/useStoryCreator";
import { getFirstKeywordList, getThumbnailTemplates } from "@/utils/apiClient";
import WordListPicker from "./WordListPicker";
import CreateStory from "./CreateStory";
import TitleThumbnailSetter from "./TitleThumbnailSetter";
import { useRouter } from "next/navigation";

const MAX_STEPS = 5;

// ---------- StoryList Component ----------
type StoryListProps = {
  storySteps: Stories;
  isOpen: boolean;
  toggleOpen: () => void;
};

const StoryList: FC<StoryListProps> = ({ storySteps, isOpen, toggleOpen }) => (
  <div className="absolute top-0 left-0 right-0 z-20 bg-white border-b-4 border-[#93C400] rounded-b-xl transition-all duration-300">
    <div
      className={`h-[calc(100dvh-128px-48px-24px)] m-2 overflow-hidden transition-all duration-300 ${
        isOpen
          ? "max-h-[calc(100dvh-128px-48px-24px)] opacity-100"
          : "max-h-0 opacity-0"
      }`}
    >
      <div className="bg-white border-4 border-[#93C400] h-full pb-4 space-y-6 rounded-b-xl overflow-auto">
        {storySteps.map((step) => (
          <div key={step.id} className="space-y-3">
            <div className="bg-[#93C400] text-white font-bold py-1 flex justify-center items-center w-full">
              だい{step.id}わ
            </div>
            <div className="mx-4 space-y-2">
              <div className="border-2 border-gray-300 p-2 text-lg leading-8 tracking-wider bg-white">
                <ReadOnlyEditor content={step.story} />
              </div>
              <div className="border-2 border-[#93C400] p-2 pb-3 space-y-2 rounded-md">
                <p>だい{step.id}わ たんご</p>
                <div className="flex flex-wrap gap-2">
                  {step.words.map((word, i) => (
                    <span
                      key={i}
                      className="border-2 border-gray-200 px-1.5 py-1 mx-1 rounded-md"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-center h-8 py-1">
      <button
        onClick={toggleOpen}
        className={`transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        <FaChevronDown className="text-[#93C400]" size={24} />
      </button>
    </div>
  </div>
);

const StoryCreator = () => {
  const router = useRouter()
  const {
    currentEpisode,
    currentPhase,
    activeStoryContent,
    storyTextLength,
    selectedWords,
    wordCardOptions,
    usedWords,
    title,
    thumbnailId,
    stories,
    isOpen,
    errorText,
    isSubmitting,

    handleSelectCard,
    handleNextEpisode,
    handleFinishWriting,
    handleSaveStory,

    setActiveStoryContent,
    setSelectedWords,
    setWordCardOptions,
    setTitle,
    setThumbnailId,
    setIsOpen,
    setErrorText,
    setIsSubmitting,
   } = useStoryCreator();

   const [thumbnails, setThumbnails] = useState<Array<{thumbnailId: string; thumbnailPath: string}>>([]);

   // --- ボタンの設定を定義（ここがキモ！） ---
  const footerConfig = {
    selectWords: {
      left: { label: "やめる", action: () => {router.push("/main")}, color: "bg-[#F55555]" },
      center: null,
      right: {
        label: isSubmitting ? "ローディング中..." : "決定",
        action: handleSelectCard,
        color: isSubmitting ? "bg-gray-400 cursor-wait" : "bg-[#93C400]",
      },
    },
    createStory: {
      left: { label: "やめる", action: () => {router.push("/main")}, color: "bg-[#F55555]" },
      center: { label: "これでおしまい！", action: () => handleFinishWriting(), color: "bg-[#93C400]" },
      right: currentEpisode < 5 ? {
        label: isSubmitting ? "さくせいちゅう..." : "つぎへ",
        action: () => handleNextEpisode(),
        color: isSubmitting ? "bg-gray-400 cursor-wait" : "bg-[#93C400]",
      } : null,
    },
    setTitleThumbnail: {
      left: { label: "やめる", action: () => {router.push("/main")}, color: "bg-[#F55555]" },
      center: {
        label: isSubmitting ? "ほぞん中..." : "さくせい！",
        action: () => handleSaveStory().then((id) => {
          if (id) {
            router.push(`/story/view/${id}`);
          }
        }),
        color: isSubmitting ? "bg-gray-400 cursor-wait" : "bg-[#93C400]",
      },
      right: null,
    },
  }[currentPhase];

   useEffect(() => {
      const init = async () => {
          setIsSubmitting(true);
          try {
            const initialWords = await getFirstKeywordList();
            const thumbnails = await getThumbnailTemplates();
            
            setThumbnails(thumbnails);
            if(thumbnails.length > 0) setThumbnailId(thumbnails[0].thumbnailId);
            setWordCardOptions(initialWords);
            if(initialWords.length > 0) setSelectedWords(initialWords[0]);
          } catch (error) {
              console.error("初期データの取得に失敗しました", error);
          } finally {
              setIsSubmitting(false);
          }
      };
      init();
  }, []);


  return (
    <div className="bg-[url('/images/background.jpg')] flex flex-col h-dvh">
      <StoryList
        storySteps={stories}
        isOpen={isOpen}
        toggleOpen={() => setIsOpen(!isOpen)}
      />
      <div className="flex-1 mt-12 overflow-auto">
        <div className="p-4 flex flex-col items-center">
          <div className="max-w-100 w-full bg-white flex flex-col items-center p-4 pt-8 space-y-4 rounded-xl">
            {currentPhase === "selectWords" && wordCardOptions && !isSubmitting && (
              <WordListPicker
                key="wordlist"
                wordsList={wordCardOptions}
                selectWords={(i) => {
                  setSelectedWords(wordCardOptions[i]);
                }}
              />
            )}
            {currentPhase == "createStory" && !isSubmitting && (
              <CreateStory
                words={selectedWords}
                usedWords={new Set(usedWords.map((w) => w.toLowerCase()))}
                storyIndex={currentEpisode}
                story={activeStoryContent}
                storyTextLength={storyTextLength}
                errorText={errorText}
                updateStory={(v) => {
                  setErrorText("");
                  setActiveStoryContent(v);
                }}
              />
            )}
            {currentPhase === "setTitleThumbnail" && !isSubmitting && (
              <TitleThumbnailSetter
                title={title}
                setTitle={setTitle}
                thumbnails={thumbnails}
                thumbnailId={thumbnailId}
                setThumbnailId={setThumbnailId}
              />
            )}
            {isSubmitting && (
              <div className="flex items-center text-[#93C400]">
                <svg
                  className="animate-spin mr-3 h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-lg font-bold">ローディング中...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="h-[128px] bg-white border-t-4 border-[#93C400] px-2 py-2 space-y-3">
        <p className="h-6 w-full text-red-500 font-bold">{errorText}</p>
        <div className="flex justify-between items-center w-full py-2">
          
          {/* 左ボタン */}
          {footerConfig.left ? (
            <button
              disabled={isSubmitting}
              className={`${footerConfig.left.color} text-white font-bold px-6 py-3 rounded-lg`}
              onClick={footerConfig.left.action}
            >
              {footerConfig.left.label}
            </button>
          ) : <div className="w-24" />}

          {/* 中央ボタン */}
          {footerConfig.center ? (
            <button
              disabled={isSubmitting}
              className={`${footerConfig.center.color} text-white font-bold px-2 py-3 rounded-lg`}
              onClick={footerConfig.center.action}
            >
              {footerConfig.center.label}
            </button>
          ) : <div className="h-12 w-24" />}

          {/* 右ボタン */}
          {footerConfig.right ? (
            <button
              disabled={isSubmitting}
              className={`${footerConfig.right.color} text-white font-bold px-6 py-3 rounded-lg`}
              onClick={footerConfig.right.action}
            >
              {footerConfig.right.label}
            </button>
          ) : <div className="w-24" />}

        </div>
      </footer>
    </div>
  );
};

export default StoryCreator;
