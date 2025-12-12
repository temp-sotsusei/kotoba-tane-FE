import StoryCreator from "@/layout/StoryCreator";
import { getFirstKeywordList } from "@/utils/apiClient";
import { FC } from "react";

const Page: FC = async () => {
  const nestedWordList = await getFirstKeywordList();

  return <StoryCreator wordsList={nestedWordList} />;
};

export default Page;
