type CalenderStoryItem = {
  image: string;
  title: string;
};
export type CalenderStoryDataStrict = Record<string, CalenderStoryItem[]>;

export interface RawStoryData {
  storyId: string;
  storyTitle: string;
  thumbnailPath: string;
  createdAt: string;
}

export type RawStoryListResponse = RawStoryData[];

export interface StoryData {
  storyId: string;
  storyTitle: string;
  thumbnailPath: string;
  createdAt: Date;
}

export type GroupedStories = Record<string, StoryData[]>;