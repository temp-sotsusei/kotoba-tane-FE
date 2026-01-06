import { JSONContent } from "@tiptap/react";

export type StorySavePostBody = {
  storyTitle: string;
  thumbnailId: string;
  chapters: {
    chapterNum: number;
    chapterJson: JSONContent;
  }[];
};
