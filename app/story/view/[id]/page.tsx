import StoryView from "@/layout/StoryView";
import { getStoryDetail } from "@/utils/apiClient";
import { isAuthenticatedUser } from "@/utils/auth";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const isAuthenticated = await isAuthenticatedUser();
  const storyData = await getStoryDetail(id, isAuthenticated);

  const headersData = await headers();
  const host = headersData.get("host");

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const currentUrl = `${protocol}://${host}/story/view/${id}`;

  return <StoryView story={storyData} shareUrl={currentUrl} id={id} />;
}
