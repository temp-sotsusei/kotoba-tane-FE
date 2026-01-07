import { UniqueIdentifier } from "@dnd-kit/core";
import { Node, mergeAttributes, CommandProps } from "@tiptap/core";

export interface CustomWordOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customWord: {
      insertCustomWord: (
        text: string,
        droppedId: UniqueIdentifier,
        position?: number
      ) => ReturnType;
    };
  }
}

/**
 * 「1つの単語を不可分な塊として扱う」Tiptap カスタムノード
 */
const CustomWord = Node.create<CustomWordOptions>({
  name: "customWord",
  group: "inline",
  inline: true,
  selectable: true,
  atom: true, // ← 中にカーソルを置けなくするポイント

  addAttributes() {
    return {
      text: {
        default: "",
        parseHTML: element => element.innerText || element.getAttribute('data-text'),
      },
      droppedId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.custom-word',
        // getAttrs を使って DOM から JSON の属性へ値を戻す
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return {};
          return {
            text: node.innerText,
            droppedId: node.getAttribute('data-id'),
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "custom-word",
        "data-id": node.attrs.droppedId,
      }),
      node.attrs.text,
    ];
  },

  addCommands() {
    return {
      insertCustomWord:
        (text: string, droppedId: UniqueIdentifier, position?: number) =>
        ({ chain }: CommandProps) => {
          const content = { type: this.name, attrs: { text, droppedId } };

          // position が指定されていればその位置に挿入
          if (typeof position === "number") {
            return chain().focus().insertContentAt(position, content).run();
          }

          // 位置指定なしなら現在のカーソル位置に挿入
          return chain().focus().insertContent(content).run();
        },
    };
  },
});

export default CustomWord;
