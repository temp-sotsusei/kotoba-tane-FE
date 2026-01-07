import { auth0 } from "@/lib/auth0";

export const isAuthenticatedUser = async () => {
  const executionContext = typeof window === "undefined" ? "server" : "client";

  if (executionContext === "server") {
    // サーバーサイド: getSession はログインしてなければ null を返すだけでエラーにならない
    const session = await auth0.getSession();
    return Boolean(session?.tokenSet?.accessToken);
  } else {
    // クライアントサイド: 同様にセッションの有無を確認
    try {
      // フロントエンド用の auth0 インスタンスから取得
      const session = await fetch('/auth/session').then(res => res.json());
      return Boolean(session?.accessToken);
    } catch {
      return false;
    }
  }
};