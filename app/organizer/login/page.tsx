import Link from "next/link";
import { organizerLoginAction } from "@/app/actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OrganizerLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form action={organizerLoginAction} className="w-full rounded-xl border border-line bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-wide text-teal-700">Organizer Console</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">主催者ログイン</h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">管理者から発行されたログインIDとパスワードを入力してください。</p>
        {query.error ? <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">ログインIDまたはパスワードが正しくありません。</p> : null}
        <input className="touch-target mt-4 w-full rounded-md border border-line px-3" name="login_id" placeholder="ログインID" required />
        <input className="touch-target mt-3 w-full rounded-md border border-line px-3" name="password" type="password" placeholder="パスワード" required />
        <button className="touch-target mt-4 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
          ログイン
        </button>
        <Link className="mt-4 block text-center text-sm font-bold text-teal-700" href="/">
          トップページへ戻る
        </Link>
      </form>
    </main>
  );
}
