import Link from "next/link";
import { registerMemberAction } from "@/app/actions";
import { genders, skillLevels } from "@/lib/constants";
import { participantTitleOptions } from "@/lib/i18n";
import type { ReactNode } from "react";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const titleOptions = [...participantTitleOptions.male, ...participantTitleOptions.female];

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <p className="text-xs font-black text-teal-700">Kansai Sports Board</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">アカウント登録</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">メール認証なしの軽量版です。ログインIDとパスワードは忘れないように管理してください。</p>
        {query.error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{String(query.error)}</p> : null}

        <form action={registerMemberAction} className="mt-5 grid gap-4">
          <Field label="ログインID">
            <input className="touch-target rounded-md border border-line px-3" name="login_id" required />
          </Field>
          <Field label="パスワード">
            <input className="touch-target rounded-md border border-line px-3" name="password" type="password" minLength={6} required />
          </Field>
          <Field label="ニックネーム">
            <input className="touch-target rounded-md border border-line px-3" name="display_name" required />
          </Field>
          <Field label="性別">
            <select className="touch-target rounded-md border border-line px-3" name="gender" defaultValue="private">
              {genders.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="自評レベル">
            <select className="touch-target rounded-md border border-line px-3" name="skill_level" required defaultValue="">
              <option value="">選択してください</option>
              {skillLevels.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="称号">
            <select className="touch-target rounded-md border border-line px-3" name="title" defaultValue="">
              <option value="">未設定</option>
              {titleOptions.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="自己紹介">
            <textarea className="min-h-28 rounded-md border border-line px-3 py-2" name="bio" placeholder="よく参加する種目、活動エリア、ひとことなど" />
          </Field>
          <label className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-700">
            <input name="profile_public" type="checkbox" defaultChecked />
            プロフィールを公開する
          </label>
          <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
            登録してマイページへ
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          すでにアカウントがある場合は{" "}
          <Link className="font-black text-teal-700" href="/login">
            ログイン
          </Link>
        </p>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      {children}
    </label>
  );
}
