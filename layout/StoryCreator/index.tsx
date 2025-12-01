"use client";
import React, { FC, useMemo, useState } from "react";
import { Step, Stories } from "./types";
import WordListPicker from "./WordListPicker";
import { FaChevronDown } from "react-icons/fa";
import CreateStory from "./CreateStory";
import { JSONContent } from "@tiptap/react";
import ReadOnlyEditor from "@/components/ReadOnlyEditor";
import { useWordCheck } from "@/hooks/useWordCheck";
import TitleThumbnailSetter from "./TitleThumbnailSetter";

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

type Props = {
  wordsList: string[][];
};

const StoryCreator: FC<Props> = ({ wordsList }) => {
  const [currentStep, setCurrentStep] = useState<Step>("selectWords");
  const [storyStepIndex, setStoryStepIndex] = useState<number>(1);
  const [storySteps, setStorySteps] = useState<Stories>([]);
  const [story, setStory] = useState<JSONContent>({
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  });
  const [title, setTitle] = useState<string>("");
  const [thumbnailId, setThumbnailId] = useState<number>(0);
  const [currentWords, setCurrentWords] = useState<string[] | undefined>();
  const [nestedWordList, setNestedWordList] = useState(wordsList);
  const { usedWords, allUsed } = useWordCheck(story, currentWords);

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
  const storyTextLength = useMemo(() => {
    if (!story) return 0;
    return countStoryCharacters(story);
  }, [story]);

  const [errorText, setErrorText] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const goNextStep = () => {
    setCurrentStep((prev) =>
      prev === "selectWords" ? "createStory" : "selectWords"
    );
  };

  const validateStory = (targetStory) => {
    console.log(targetStory);
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

  const addStoryStep = () => {
    const nextId = storySteps.length + 1;

    setStorySteps((prev) => [
      ...prev,
      {
        id: nextId,
        story,
        words: currentWords,
      },
    ]);
  };

  const handleNext = async () => {
    if (currentStep === "createStory") {
      if (!validateStory(story)) return;
      // ストーリーを追加
      addStoryStep();
      setStoryStepIndex(storyStepIndex + 1);
    }

    setStory({
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    });
    setErrorText("");
    setIsOpen(false);
    goNextStep();
  };

  const handleGoToTitleThumbnail = async () => {
    if (currentStep === "createStory") {
      if (!validateStory(story)) return;
      // ストーリーを追加
      addStoryStep();
      setStoryStepIndex(storyStepIndex + 1);
    }

    setStory({
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    });
    setErrorText("");
    setIsOpen(false);
    setCurrentStep("setTitleThumbnail");
  };

  const handlePreviewStorySummary = () => {
    console.log("===== ストーリー確認 =====");
    console.log("タイトル:", title);
    console.log("サムネイルID:", thumbnailId);
    console.log("ストーリー一覧:");
    storySteps.forEach((step) => {
      console.log(`だい${step.id}わ`);
      console.log("\t内容:", step.story);
      console.log("\t単語:", step.words.join(", "));
    });
    console.log("=======================");
  };

  const canAddMore = !(
    currentStep === "createStory" && storyStepIndex >= MAX_STEPS
  );

  return (
    <div className="bg-[url('/images/background.jpg')] flex flex-col h-[100dvh]">
      <StoryList
        storySteps={storySteps}
        isOpen={isOpen}
        toggleOpen={() => setIsOpen(!isOpen)}
      />

      <div className="flex-1 mt-12 overflow-auto">
        <div className="p-4 flex flex-col items-center">
          <div className="max-w-[400px] w-full bg-white flex flex-col items-center p-4 pt-8 space-y-4 rounded-xl">
            {currentStep === "selectWords" && (
              <WordListPicker
                key="wordlist"
                wordsList={nestedWordList}
                selectWords={(i) => {
                  setCurrentWords(nestedWordList[i]);
                }}
              />
            )}
            {currentStep == "createStory" && (
              <CreateStory
                words={currentWords}
                usedWords={new Set(usedWords.map((w) => w.toLowerCase()))}
                storyIndex={storyStepIndex}
                story={story}
                storyTextLength={storyTextLength}
                errorText={errorText}
                updateStory={(v) => {
                  setErrorText("");
                  setStory(v);
                }}
              />
            )}
            {currentStep === "setTitleThumbnail" && (
              <TitleThumbnailSetter
                title={title}
                setTitle={setTitle}
                thumbnailId={thumbnailId}
                setThumbnailId={setThumbnailId}
              />
            )}
          </div>
        </div>
      </div>

      <footer className="h-[128px] bg-white border-t-4 border-[#93C400] px-2 py-2 space-y-3">
        <p className="h-6 w-full text-red-500 font-bold">{errorText}</p>
        <div className="flex justify-between items-center w-full py-2">
          <button
            className="bg-[#F55555] text-white font-bold w-fit h-fit px-6 py-3 rounded-lg text-center"
            onClick={() => console.log(errorText)}
          >
            やめる
          </button>
          {currentStep !== "selectWords" ? (
            <button
              className="bg-[#93C400] text-white font-bold w-fit h-fit px-8 py-4 rounded-lg text-center"
              onClick={
                currentStep === "setTitleThumbnail"
                  ? handlePreviewStorySummary
                  : handleGoToTitleThumbnail
              }
            >
              {currentStep === "setTitleThumbnail"
                ? "さくせい！"
                : "かんせい！"}
            </button>
          ) : (
            <div className="h-[56px] w-[96px]"></div>
          )}
          {canAddMore && currentStep !== "setTitleThumbnail" ? (
            <button
              onClick={handleNext}
              className="bg-gray-400 text-white font-bold w-fit h-fit px-6 py-3 rounded-lg text-center"
            >
              つぎへ
            </button>
          ) : (
            // ボタンがない時は透明なプレースホルダーを置く
            <div className="w-[96px]"></div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default StoryCreator;
