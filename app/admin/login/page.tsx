import Link from "next/link";
import { loginAction } from "@/app/actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLogin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form action={loginAction} className="w-full rounded-lg border border-line bg-white p-5 shadow-sm">
        <h1 className="text-xl font-black text-slate-950">管理者ログイン</h1>
        <p className="mt-1 text-sm text-slate-600">活動を登録・編集するための管理画面です。</p>
        {params.error ? <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">パスワードが正しくありません。</p> : null}
        <input className="touch-target mt-4 w-full rounded-md border border-line px-3" name="password" type="password" placeholder="管理者パスワード" required />
        <button className="touch-target mt-4 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
          ログイン
        </button>
        <Link className="mt-4 block text-center text-sm font-bold text-teal-700" href="/">
          トップへ戻る
        </Link>
      </form>
    </main>
  );
}
