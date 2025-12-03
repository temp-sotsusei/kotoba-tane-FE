import StoryView from "@/layout/StoryView";
import { getStoryDetail } from "@/utils/apiClient";
import { isAuthenticatedUser } from "@/utils/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  // const storyData = {
  //   title: `物語 ${id}`,
  //   chapters: [
  //     {
  //       story: `ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ`,
  //       words: ["単語A", "単語B", "単語C", "単語D"],
  //       feedback: "第1章のフィードバックをここに記述します。",
  //     },
  //     {
  //       story: `これはストーリー ${id} の第2章です。`,
  //       words: ["単語E", "単語F", "単語G", "単語H"],
  //       feedback: "第2章のフィードバックをここに記述します。",
  //     },
  //     {
  //       story: `これはストーリー ${id} の第3章です。\n複数行も保持します。`,
  //       words: ["単語I", "単語J", "単語K", "単語L"],
  //       feedback: "第3章のフィードバックをここに記述します。",
  //     },
  //     {
  //       story: `これはストーリー ${id} の第4章です。`,
  //       words: ["単語M", "単語N", "単語O", "単語P"],
  //       feedback: "第4章のフィードバックをここに記述します。",
  //     },
  //   ],
  // };
  const isAuthenticated = await isAuthenticatedUser();
  const storyData = await getStoryDetail(id, isAuthenticated);

  return <StoryView story={storyData} />;
}
