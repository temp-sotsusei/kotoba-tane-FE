import Main from "@/layout/Main";
import { groupStoriesByDate } from "./storyProcessor";
import { GroupedStories } from "@/types";
import { getStories, login } from "@/utils/apiClient";

const Page = async () => {
  // TODO:mainからログイン叩いてる、promise.allかそもそもここで叩かないか考えた方が良い
  await login();
  const rawStories = await getStories();
  const calendarStoryData: GroupedStories = groupStoriesByDate(rawStories);

  return <Main calenderStoryData={calendarStoryData} />;
};

export default Page;
