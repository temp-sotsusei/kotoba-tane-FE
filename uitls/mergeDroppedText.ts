import { MAX_DROPPABLE_ELEMENTS } from "@/const";
import { DroppedStrState } from "@/layout/WordListSelect";

export const mergeDroppedText = (
  inputText: string,
  droppedTexts: DroppedStrState[]
) => {
  const sortedDroppedTexts = [...droppedTexts].sort((current, next) => {
    return current.userInputDroppedIndex - next.userInputDroppedIndex;
  });

  let resultText = "";
  let currentPointer = 0;
  sortedDroppedTexts.forEach((droppedText, index) => {
    const leftText = inputText.slice(
      currentPointer,
      droppedText.userInputDroppedIndex
    );
    resultText += leftText + droppedText.droppedString;

    if (index + 1 === MAX_DROPPABLE_ELEMENTS) {
      const rightText = inputText.slice(currentPointer);
      resultText += rightText;
    }

    currentPointer = droppedText.userInputDroppedIndex;
  });

  return resultText;
};
