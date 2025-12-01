import Main from "@/layout/Main";
import axios from "axios";
import { groupStoriesByDate } from "./storyProcessor";
import { GroupedStories, RawStoryListResponse } from "@/types";

async function getStoriesWithAxios(): Promise<RawStoryListResponse | []> {
  try {
      // 💡 axiosの利点: データは response.data に含まれる
      const response = await axios.get<RawStoryListResponse>("http://localhost:3000/api/story/chapter/stories");

      console.log('✅ Data fetched successfully (axios):', response.data);
      return response.data;

  } catch (error) {
      // 💡 axiosの利点: 4xx/5xxのエラーもここでキャッチされる
      if (axios.isAxiosError(error)) {
          console.error('❌ Axios Error Status:', error.response?.status);
          console.error('❌ Axios Error Data:', error.response?.data);
      } else {
          console.error('❌ Unknown Error:', error);
      }
      return [];
  }
}

const Page = async () => {
  const rawStories = await getStoriesWithAxios();
  const calendarStoryData: GroupedStories = groupStoriesByDate(rawStories);

  return <Main calenderStoryData={calendarStoryData} />;
};

export default Page;
