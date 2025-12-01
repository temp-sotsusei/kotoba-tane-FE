import { Stories } from "@/layout/StoryCreator/types";
import { auth0 } from "@/lib/auth0";
import { StorySavePostBody } from "@/types/apiclient";
import { getAccessToken } from "@auth0/nextjs-auth0";

const baseUrl = process.env.API_ENDPOINT;

const apiClient = {
  request: async <T>(url: string, postData?: T, requireAuth = true) => {
    const postBody = postData
      ? { method: "POST", body: JSON.stringify(postData) }
      : { method: "GET" };
    if (requireAuth) {
      const executionContext =
        typeof window === "undefined" ? "server" : "client";
      try {
        if (executionContext === "server") {
          const { token } = await auth0.getAccessToken();
          Object.assign(postBody, {
            headers: {
              Authorization: token,
            },
          });
        } else {
          const token = await getAccessToken();
          Object.assign(postBody, {
            headers: {
              Authorization: token,
            },
          });
        }
      } catch (e) {
        throw new Error(`アクセストークンを取得出来ませんでした ${e}`);
      }
    }

    const response = await fetch(`${baseUrl}/${url}`, postBody);
    if (!response.ok) {
      throw new Error("リクエストに失敗しました");
    }

    const responseJson = await response.json();
    return responseJson;
  },
};

export const login = async () => {
  return await apiClient.request("api/login", {});
};
export const getStories = async () => {
  return await apiClient.request("api/calenders/stories");
};
export const getFirstKeywordList = async () => {
  return await apiClient.request("api/story/chapter/keywords");
};
export const postNextChapter = async (chapterJson: Stories) => {
  return await apiClient.request("api/story/chapter/next", { chapterJson });
};
export const getThumbnailTemplates = async () => {
  return await apiClient.request("api/thumbnail-templates");
};
export const postStorySave = async (requestBody: StorySavePostBody) => {
  return await apiClient.request("api/story", requestBody);
};
export const getStoryDetail = async (
  storyId: string,
  isAuthRequired: boolean
) => {
  const targetUrl = `api/story?storyId=${storyId}`;
  if (isAuthRequired) return await apiClient.request(targetUrl, undefined);
  return await apiClient.request(targetUrl, undefined, false);
};
