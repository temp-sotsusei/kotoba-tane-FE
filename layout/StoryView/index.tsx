"use client";

import Image from "next/image";
import ReadOnlyEditor from "@/components/ReadOnlyEditor";
import { APP_TITLE } from "@/const";
import { JSONContent } from "@tiptap/react";
import { useState, type FC } from "react";
import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

type Chapter = {
  chapterJson: JSONContent;
  keywords: {keyword: string}[];
  feedback: string;
};

type Story = {
  storyTitle: string;
  chapters: Chapter[];
  hasFeedback: boolean;
  thumbnailPath: string;
};

type Props = {
  story: Story;
  shareUrl: string;
};

const StoryView: FC<Props> = ({ story, shareUrl }) => {
  const router = useRouter();
  const { storyTitle, chapters, thumbnailPath, hasFeedback } = story;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  console.log("Rendering StoryView with story:", story);

  return (
    <div className="bg-[url('/images/background.jpg')] w-dvw flex flex-col gap-4">
      <header 
        className="flex flex-col items-center justify-center w-full pt-6 pb-3 gap-4 bg-[#C1ED86] border-b-2 border-[#93C400] shadow-md px-4"
      >
        <h1 className="flex items-center">
          <Image
            src={"/images/icon.png"}
            alt="ロゴ"
            width={96}
            height={16}
            priority
          />
        </h1>
      </header>
      <main className="flex flex-col items-center gap-4">
        <div className="relative border-4 border-[#93C400] overflow-hidden max-w-sm">
          <h2 className="absolute top-8 right-0 left-0 text-stone-800 text-xl font-bold text-center bg-stone-50 py-2">~<span className="px-2">{storyTitle}</span>~</h2>
          <Image 
            src={thumbnailPath}
            alt="サムネイル画像"
            width={1920}
            height={480}
            priority
          />
        </div>

        <section className="bg-stone-50 border-2 border-[#93C400] rounded-md max-w-sm">
          {chapters.map((chapter, index) => (
            <div
              key={index}
              className="flex flex-col gap-3"
            >
              <div className="text-base md:text-lg font-bold bg-[#93C400] text-white text-center">第{index + 1}章</div>

              <div className="p-2 mx-4 border border-stone-200 rounded-lg bg-white">
                <ReadOnlyEditor content={chapter.chapterJson} />
              </div>

              <div className="flex flex-wrap gap-2 p-2 mx-4 border border-stone-200 rounded-lg bg-white">
                {chapter.keywords?.map((word, wordIndex) => (
                  <div
                    key={wordIndex}
                    className="px-3 md:px-4 py-2 border border-stone-200 rounded-md text-sm"
                  >
                    {word.keyword}
                  </div>
                ))}
              </div>

              {chapter.feedback && (
                <div className="border-t border-stone-200 py-2 px-4 bg-white text-sm whitespace-pre-wrap">
                  {chapter.feedback}
                </div>
              )}
            </div>
          ))}
        </section>
      </main>

      <footer className="w-full pt-6 pb-24 bg-[#93C400] flex justify-center">
        {hasFeedback ? (
        <button
          className="h-fit px-2 py-1 bg-[#FF8258] text-white font-bold border-2 border-white text-sm rounded-md"
          onClick={() => router.push('/main')}
        >
          ホームにもどる
        </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              className="h-fit px-2 py-1 bg-[#FF8258] text-white font-bold border-2 border-white text-sm rounded-md"
              onClick={() => router.push('/')}
            >
              『ことばのタネ』をはじめよう！
            </button>
            <Image src="/images/icon.png" alt="ロゴ" width={96} height={16} priority />
          </div>
        )}
      </footer>

      <div className="fixed bottom-6 right-1/2 translate-x-1/2 flex items-center space-x-2 p-2 bg-gray-100 rounded-md w-fit border border-gray-200">
        <span className="text-sm text-gray-700 truncate max-w-xs">
          {shareUrl}
        </span>
        
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="コピーする"
        >
          {copied ? (
            <Check size={18} className="text-green-500" />
          ) : (
            <Copy size={18} className="text-gray-500" />
          )}
        </button>
      </div>
    </div>
    // <div className="flex flex-col items-center w-full px-4 md:px-10 py-8 space-y-8 md:space-y-9">
    //   <h1 className="font-bold text-2xl md:text-4xl">{APP_TITLE}</h1>

    //   <div className="w-full md:w-4/5 border border-gray-300 rounded-md p-3 md:p-4 text-center text-base md:text-lg font-medium">
    //     {storyTitle}
    //   </div>

    //   <div className="w-full md:w-4/5 flex flex-col space-y-8 md:space-y-9">
    //     {chapters.map((chapter, index) => (
    //       <div
    //         key={index}
    //         className="flex flex-col space-y-4 md:space-y-5 border border-gray-300 rounded-md p-4 md:p-5"
    //       >
    //         <div className="text-base md:text-lg font-bold">第{index + 1}章</div>

    //         <div
    //           className="border border-gray-200 rounded-md p-4 md:p-5 bg-white
    //                     h-60 md:h-55 overflow-hidden
    //                     text-sm md:text-base whitespace-pre-wrap"
    //         >
    //           <ReadOnlyEditor content={chapter.chapterJson} />
    //         </div>

    //         <div className="flex flex-wrap gap-2 md:gap-3">
    //           {chapter.words?.map((word, wordIndex) => (
    //             <div
    //               key={wordIndex}
    //               className="px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm md:text-base"
    //             >
    //               {word}
    //             </div>
    //           ))}
    //         </div>

    //         {chapter.feedback && (
    //           <div className="border border-gray-200 rounded-md p-4 md:p-5 bg-white min-h-[100px] md:min-h-[140px] text-sm md:text-base whitespace-pre-wrap">
    //             {chapter.feedback}
    //           </div>
    //         )}
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
};

export default StoryView;
