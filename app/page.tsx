import Link from "next/link";
import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Link href="/auth/login" className="border rounded-2xl px-4">
        ログイン
      </Link>
      <Link href="/auth/logout" className="border rounded-2xl px-4">
        ログアウト
      </Link>
      <p>login flag:{session?.user ? "true" : "false"}</p>
      <p>tokens:{session?.user && JSON.stringify(session.user)}</p>
    </div>
  );
}
