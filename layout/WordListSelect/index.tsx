"use client";

import { FC, useCallback, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import WordList from "@/components/WordList";
import SlidePrevButton from "@/components/SlidePrevButton";
import SlideNextButton from "@/components/SlideNextButton";
import type { Swiper as SwiperType } from "swiper";
import { EditorContent, NodeType, TextType, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Draggable from "@/components/Draggable";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Droppable from "@/components/Droppable";
import { postChapter } from "@/apiClient";
import CustomWord from "@/components/CustomWord";
import { stripHtml } from "string-strip-html";
import { MAX_CHAPTER_CHARS, MAX_DROPPABLE_ELEMENTS } from "@/const";
import DroppableBox from "@/components/DroppableBox";
import { mergeDroppedText } from "@/utils/mergeDroppedText";

type RenderChapterItem = {
  text: string;
  isInputText: boolean;
};
type ChaptersPayload = {
  chapterNum: number;
  renderChapterItem: RenderChapterItem[];
  submissionChapterText: string;
  keywords: {
    keyword: string;
    position: number;
  }[];
};
// TODO: 共有する型をlayoutから剥がす
export type DroppedStrState = {
  id: UniqueIdentifier;
  droppedString: string;
  // MEMO: ユーザ入力値の何番目かを保持する
  userInputDroppedIndex: number;
  // MEMO: Nodeが含まれた入力値の何番目か保持している.editor.getText()の都合上使えなさそうなので消去予定
  stringBuildDroppedIndex: number;
  currentChapterDisplayDroppedIndex: number;
};
type CharItem = {
  char: string;
  isDroppable: boolean;
  isEmpty: boolean;
  isNewLine: boolean;
};
type Props = {
  nestedWordList: string[][];
};

const WordListSelect: FC<Props> = ({ nestedWordList }) => {
  const [isSelectedWordList, setIsSelectedWordList] = useState<boolean>(false);
  const handleSelectWordList = useCallback(() => {
    setIsSelectedWordList((prev) => !prev);
  }, []);
  const [candidateWordList, setCandidateWordList] =
    useState<string[][]>(nestedWordList);
  const handleCandidateWordList = useCallback((wordList: string[][]) => {
    setCandidateWordList(wordList);
  }, []);
  const [selectedWordList, setSelectedWordList] = useState<string[]>();
  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      setSelectedWordList(candidateWordList[swiper.realIndex]);
    },
    [candidateWordList]
  );
  const [isTextEditorActive, setIsTextEditorActive] = useState(false);
  const deactivateTextEditor = useCallback(() => {
    setIsTextEditorActive(false);
  }, []);
  const [droppedStrState, setDroppedStrState] = useState<DroppedStrState[]>([]);
  const removeDroppedStr = useCallback((droppedId: UniqueIdentifier) => {
    setDroppedStrState((prev) =>
      prev.filter((droppedStr) => droppedStr.id !== droppedId)
    );
  }, []);
  const [isOverChapterText, setIsOverChapterText] = useState(false);
  const [contentLength, setContentLength] = useState(0);
  const editor = useEditor({
    extensions: [StarterKit, CustomWord],
    content: "",
    immediatelyRender: false,
    onBlur: () => {
      deactivateTextEditor();
    },
    onUpdate: ({ editor }) => {
      const currentChapterText = stripHtml(editor.getHTML()).result;
      setContentLength(currentChapterText.length);
      setIsOverChapterText(currentChapterText.length > MAX_CHAPTER_CHARS);
      if (currentChapterText.length > MAX_CHAPTER_CHARS) {
        // TODO:文字数の出力する？
        // console.log("エディタ入力値が200文字を超えている");
      } else {
        // console.log("エディタ入力値が200文字以内です!");
      }
    },
    onDelete: (deleteEvent) => {
      if (deleteEvent.type === "node" && deleteEvent.node.attrs.droppedId) {
        const droppedId = deleteEvent.node.attrs.droppedId;
        removeDroppedStr(droppedId);
      }
    },
  });
  const activateTextEditor = useCallback(() => {
    setIsTextEditorActive(true);
    editor.commands.focus();
  }, [editor]);
  const sensors = useSensors(useSensor(TouchSensor));
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active } = event;

      // MEMO: 範囲外ドロップ時に発火する
      if (over.id === "droppable-box") {
        setDroppedStrState((prev) => {
          const filteredState = prev.filter((item) => item.id !== active.id);
          const chapterText = editor.getText({ blockSeparator: "\n" });
          // MEMO: index1ずれてるかも
          const totalLength = filteredState.reduce(
            (sum, item) => sum + item.droppedString.length,
            0
          );
          return [
            ...filteredState,
            {
              id: active.id,
              droppedString: active.data.current.draggedText,
              userInputDroppedIndex: chapterText.length,
              stringBuildDroppedIndex: chapterText.length + totalLength,
              currentChapterDisplayDroppedIndex:
                editor.state.doc.content.size - 1,
            },
          ];
        });

        editor
          .chain()
          .focus()
          .insertCustomWord(
            active.data.current.draggedText,
            active.id,
            editor.state.doc.content.size - 1
          )
          .run();
      } else if (over) {
        // MEMO: positionがdropされた時、以下のようにover.data.current.positionの値がズレる
        // MEMO: 表示時に要素のindex番目で振っているからなのでgetTiptapHTMLで新しくpositionを採番することで解決するが、div側表示がズレる可能性がある
        // drop文字列 0個目 -> -1
        // drop文字列 1個目 -> 0
        // drop文字列 2個目 -> +1
        // drop文字列 3個目 -> +2
        // HACK: 対処療法としてズレを吸収しておくが、根本的な解決になっていない

        // MEMO:入力文字ドロップ時に発火する
        setDroppedStrState((prev) => {
          const filteredState = prev.filter((item) => item.id !== active.id);
          return [
            ...filteredState,
            {
              id: active.id,
              droppedString: active.data.current.draggedText,
              userInputDroppedIndex:
                over.data.current.position + 1 - droppedStrState.length,
              stringBuildDroppedIndex: over.data.current.position + 2,
              currentChapterDisplayDroppedIndex: over.data.current.position + 2,
            },
          ];
        });

        editor
          .chain()
          .focus()
          .insertCustomWord(
            active.data.current.draggedText,
            active.id,
            over.data.current.position + 2
          )
          .run();
      } else {
        console.log("drop範囲は入力文字内である必要があります");
      }
    },
    [droppedStrState, editor]
  );
  const postChapterRequest = useCallback(
    async (chapterText: string) => {
      const response = await postChapter(chapterText);
      handleSelectWordList();
      handleCandidateWordList(response);
      handleSetChaptersPayload();
      setDroppedStrState([]);
      editor.commands.clearContent();
    },
    [editor, droppedStrState]
  );
  const getTiptapHTML = useCallback(() => {
    const editorContent = editor.getJSON();

    const contentsArray = editorContent.content.map(
      (content) => content.content
    );
    const result: CharItem[] = [];
    let currentParagraphIndex = 0;
    contentsArray.forEach((contents, index) => {
      // paragraphが変わったタイミングが改行
      if (currentParagraphIndex !== index) {
        currentParagraphIndex = index;
        result.push({
          char: "",
          isDroppable: false,
          isEmpty: false,
          isNewLine: true,
        });
      }
      if (!contents) {
        return result.push({
          char: "",
          isDroppable: false,
          isEmpty: true,
          isNewLine: false,
        });
      }
      contents.forEach((content) => {
        if (content.type === "text") {
          const textObject = content as TextType;
          textObject.text.split("").forEach((char) => {
            result.push({
              char,
              isDroppable: true,
              isEmpty: false,
              isNewLine: false,
            });
          });
        } else if (content.type === "customWord") {
          const customWordObject = content as NodeType;
          customWordObject.attrs.text.split(".").forEach((char) => {
            result.push({
              char,
              isDroppable: false,
              isEmpty: false,
              isNewLine: false,
            });
          });
        }
      });
    });

    return result;
  }, [editor]);
  const [chaptersPayload, setChaptersPayload] = useState<ChaptersPayload[]>([]);
  const handleSetChaptersPayload = useCallback(() => {
    const chapterNum = chaptersPayload.length + 1;

    const chapterText = editor.getText({ blockSeparator: "\n" });
    const chapterKeywords = droppedStrState
      .map((droppedStrState) => ({
        keyword: droppedStrState.droppedString,
        position: droppedStrState.userInputDroppedIndex,
      }))
      .sort((current, next) => current.position - next.position);

    // MEMO:考慮パターン:
    // Text -> Node
    // Node -> Node
    // 無 -> Node
    let renderChapterItem: RenderChapterItem[] = [];
    let currentNodePostion = 0;

    chapterKeywords.forEach(({ keyword, position }, index) => {
      const leftText = chapterText.slice(currentNodePostion, position);
      if (leftText) {
        renderChapterItem.push({
          text: leftText,
          isInputText: true,
        });
      }
      renderChapterItem.push({
        text: keyword,
        isInputText: false,
      });

      const rightText = chapterText.slice(position);
      if (index + 1 === MAX_DROPPABLE_ELEMENTS && rightText) {
        renderChapterItem.push({
          text: rightText,
          isInputText: true,
        });
      }

      currentNodePostion = position;
    });

    setChaptersPayload([
      ...chaptersPayload,
      {
        chapterNum,
        renderChapterItem,
        submissionChapterText: chapterText,
        keywords: chapterKeywords,
      },
    ]);
  }, [chaptersPayload, editor, droppedStrState]);
  const [isPosting, setIsPosting] = useState(false);
  // TODO:これはさすがに追いづらいかも
  const handleClickNextChapter = async () => {
    if (isPosting) return;
    setIsPosting(true);

    const chapterText = editor.getText({ blockSeparator: "\n" });
    const mergedText = mergeDroppedText(chapterText, droppedStrState);
    try {
      await postChapterRequest(mergedText);
    } catch (error) {
      console.error("章の投稿に失敗しました", error);
    } finally {
      setIsPosting(false);
    }
  };
  const canCreateNextChapter =
    droppedStrState.length === 4 && chaptersPayload.length <= 3;
  return (
    <>
      {isSelectedWordList ? (
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragStart={editor.commands.blur}
        >
          <div className="h-screen">
            <div className="h-[calc(66.67%-16px)] mx-4 mb-4 border overflow-y-auto">
              {chaptersPayload.map((chapter, index) => (
                <div key={index}>
                  <div className="border flex items-center justify-center py-2 m-4">
                    第{chapter.chapterNum}章
                  </div>
                  <div className="mx-8">第{chapter.chapterNum}章の単語</div>
                  <div className="my-2 mx-8 flex items-center justify-start gap-x-2 gap-y-2 flex-wrap">
                    {chapter.keywords.map((keyword, index) => (
                      <div className="border px-4 py-2 rounded-2xl" key={index}>
                        {keyword.keyword}
                      </div>
                    ))}
                  </div>
                  {/* // TODO:久乗にJSX側に変更があったことを伝える */}
                  <div className="border mx-8 h-64 break-words whitespace-pre-wrap">
                    {chapter.renderChapterItem.map((chapterItem, index) =>
                      chapterItem.isInputText ? (
                        <span key={index}>{chapterItem.text}</span>
                      ) : (
                        <div
                          key={index}
                          className="px-2 py-1 border rounded-2xl inline"
                        >
                          {chapterItem.text}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
              <div>
                <div className="border flex items-center justify-center py-2 m-4">
                  第{chaptersPayload.length + 1}章
                </div>
                <div className="mx-8">
                  第{chaptersPayload.length + 1}章の単語
                </div>
                <div className="my-2 mx-8 flex items-center justify-start gap-x-2 gap-y-2 flex-wrap">
                  {selectedWordList.map((word, index) => (
                    <div className="border px-4 py-2 rounded-2xl" key={index}>
                      {word}
                    </div>
                  ))}
                </div>
                <div className="mx-8">
                  {isTextEditorActive ? (
                    <EditorContent
                      editor={editor}
                      className={
                        "border h-64 [&>div]:h-full [&>div]:overflow-y-auto" +
                        (isOverChapterText ? " border-red-500" : "")
                      }
                    ></EditorContent>
                  ) : (
                    <DroppableBox
                      className={
                        "border h-64 break-words relative overflow-y-auto" +
                        (isOverChapterText ? " border-red-500" : "")
                      }
                      onClick={activateTextEditor}
                    >
                      {getTiptapHTML().map((char, index) =>
                        char.isNewLine ? (
                          <div key={index} />
                        ) : char.isEmpty ? (
                          <div key={index}>&nbsp;</div>
                        ) : char.isDroppable ? (
                          <Droppable key={index} id={index}>
                            {char.char}
                          </Droppable>
                        ) : (
                          <div key={index} className="border inline px-2 py-1">
                            {char.char}
                          </div>
                        )
                      )}
                    </DroppableBox>
                  )}
                  <div
                    className={
                      "bg-black text-white text-end px-2" +
                      (isOverChapterText ? " bg-red-500" : "")
                    }
                  >
                    {/* // TODO:メモ化したい */}
                    {`${contentLength} / ${MAX_CHAPTER_CHARS}`}
                  </div>
                </div>
              </div>
            </div>
            <div className="h-1/3 border-t flex flex-col items-between">
              <div className="mt-8 mx-4 flex flex-wrap items-start gap-4 h-[calc(66.67%-32px)]">
                {selectedWordList.map((word, index) => (
                  <Draggable
                    key={index}
                    id={index}
                    draggedText={word}
                    isDisabled={droppedStrState.some(
                      (droppedStrState) =>
                        droppedStrState.id === `draggable-${index}`
                    )}
                  >
                    <div
                      className={`border px-4 py-2 rounded-2xl ${
                        droppedStrState.some(
                          (item) => item.id === `draggable-${index}`
                        ) && "border-gray-400 text-gray-400"
                      }`}
                    >
                      {word}
                    </div>
                  </Draggable>
                ))}
                <DragOverlay />
              </div>
              <div className="flex items-center justify-between mx-4 h-1/3">
                <div className="flex-1" />
                <div className="px-16 py-4 border">完成</div>
                <div className="flex-1 flex justify-end">
                  {/* <button
                    className={`text-center border p-2 ${
                      canCreateNextChapter
                        ? "border-black"
                        : "border-gray-400 text-gray-400"
                    }`}
                    disabled={!canCreateNextChapter}
                    onClick={() => postChapterRequest("abcdef123")}
                  >
                    <p className="text-sm">次の章を作成</p>
                    <p className="text-sm">{droppedStrState.length}/4</p>
                  </button> */}
                  <button
                    className={`text-center border p-2 ${
                      canCreateNextChapter && !isPosting && !isOverChapterText
                        ? "border-black"
                        : "border-gray-400 text-gray-400"
                    }`}
                    disabled={
                      !canCreateNextChapter || isPosting || isOverChapterText
                    }
                    onClick={handleClickNextChapter}
                  >
                    <p className="text-sm">
                      {isPosting
                        ? "送信中..."
                        : isOverChapterText
                        ? "文字数が200文字を超えています"
                        : "次の章を作成"}
                    </p>
                    <p className="text-sm">{droppedStrState.length}/4</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DndContext>
      ) : (
        <div className="fixed bottom-0 border-t w-full h-2/3">
          <Swiper
            spaceBetween={0}
            loop={true}
            onSlideChange={handleSlideChange}
          >
            {candidateWordList.map((wordList, index) => (
              <SwiperSlide key={index}>
                <WordList wordList={wordList} />
              </SwiperSlide>
            ))}
            <div className="flex justify-between px-8 mt-30">
              <SlidePrevButton />
              <SlideNextButton />
            </div>
          </Swiper>
          {/* // TODO:absoluteの位置をfooterの位置にしたい */}
          <div className="absolute">
            <div className="relative right-5 -top-60  border h-40 w-40 -z-10" />
            <div className="relative left-70 -top-100 border h-40 w-40 -z-10" />
          </div>
          <div className="flex items-center justify-center mt-20">
            <button
              className="border py-4 px-16"
              onClick={handleSelectWordList}
            >
              決定
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WordListSelect;
