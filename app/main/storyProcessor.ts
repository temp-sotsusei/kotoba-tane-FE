import { GroupedStories, RawStoryListResponse, StoryData } from '@/types';
import { parseISO, format } from 'date-fns';

export function groupStoriesByDate(rawStories: RawStoryListResponse): GroupedStories {
    const grouped: GroupedStories = {};
    const DATE_FORMAT_KEY = 'yyyy-MM-dd';

    rawStories.forEach(rawStory => {
        
        const storyDate = parseISO(rawStory.createdAt); 
        
        const story: StoryData = {
            ...rawStory,
            createdAt: storyDate,
        };
        
        const dateKey = format(storyDate, DATE_FORMAT_KEY);
        
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(story);
    });

    const sortedKeys = Object.keys(grouped).sort().reverse();

    const sortedGroupedStories: GroupedStories = {};
    sortedKeys.forEach(key => {
        sortedGroupedStories[key] = grouped[key];
    });

    return sortedGroupedStories;
}