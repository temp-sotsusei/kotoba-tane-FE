'use server';
import { auth0 } from "@/lib/auth0";
import { StorySavePostBody } from "@/types/apiclient";
import { JSONContent } from "@tiptap/react";

const baseUrl = process.env.API_ENDPOINT;

const apiClient = {
  request: async <T>(url: string, postData?: T, requireAuth = true, contentTypeJson=false) => {
    const postBody: RequestInit = postData
      ? { method: "POST", body: JSON.stringify(postData), cache: "no-store" }
      : { method: "GET", cache: "no-store" };
    if (requireAuth) {
      try {
          const { token } = await auth0.getAccessToken();
          Object.assign(postBody, {
            headers: {
              Authorization: `Bearer ${token}`,
              ...(contentTypeJson ? { 'Content-Type': 'application/json' } : {}),
            },
          });
      } catch (err) {
        throw new Error(`アクセストークンを取得出来ませんでした ${err}`);
      }
    }
    const response = await fetch(`${baseUrl}/${url}`, postBody);
    if (!response.ok) {
      console.error("API Request Failed:", response.statusText);
      throw new Error("リクエストに失敗しました");
    }

    try {
      const responseJson = await response.json();
      return responseJson;
    } catch (e) {
      return null;
    }
  },
};

export const login = async () => {
  return await apiClient.request("api/login", {});
};
export const getStories = async () => {
  return await apiClient.request("api/calendar/stories");
};
export const getFirstKeywordList = async () => {
  return await apiClient.request("api/story/chapter/keywords");
};
export const postNextChapter = async (data: JSONContent) => {
  return await apiClient.request("api/story/chapter/next", { "chapterJson": data }, true, true);
};
export const getThumbnailTemplates = async () => {
  return await apiClient.request("api/thumbnail-templates");
};
export const postStorySave = async (requestBody: StorySavePostBody) => {
  return await apiClient.request("api/story", requestBody, true, true);
};
export const getStoryDetail = async (
  storyId: string,
  isAuthRequired: boolean
) => {
  const targetUrl = `api/story?storyId=${storyId}`;
  if (isAuthRequired) return await apiClient.request(targetUrl, undefined);
  return await apiClient.request(targetUrl, undefined, false);
};
