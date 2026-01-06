import { JSONContent } from "@tiptap/react";

export type StoryCreationPhase = "selectWords" | "createStory" | "setTitleThumbnail";

export type Story = {
  id: number;
  story: JSONContent;
  words: string[];
};

export type WordCard = string[];

export type Stories= Story[];