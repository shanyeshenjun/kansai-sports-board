import Link from "next/link";
import { changeOrganizerStatusAction, createOrganizerAction, requireAdmin, resetOrganizerPasswordAction } from "@/app/actions";
import { formatDateTimeJST, listOrganizers } from "@/lib/store";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminOrganizersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const query = await searchParams;
  const { organizers, loadError } = await safeListOrganizers();

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/admin">
        管理画面へ戻る
      </Link>

      <section className="mt-4 rounded-xl border border-line bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">主催者管理</h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">ここは管理者専用の主催者管理ページです。公開登録は使わず、管理者が招待制で主催者アカウントを作成します。</p>
        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-teal-50 p-3 text-sm leading-6 text-teal-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bold">主催者本人は、以下の専用ログインページからログインしてください。</p>
          <Link className="touch-target inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-black text-white" href="/organizer/login">
            主催者ログインページを開く
          </Link>
        </div>
        {query.error ? <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{String(query.error)}</p> : null}
        {query.reset ? <p className="mt-3 rounded-md bg-teal-50 p-3 text-sm font-bold text-teal-800">パスワードを更新しました。</p> : null}
        {loadError ? (
          <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">
            主催者一覧を読み込めませんでした。Supabase の migration または権限設定を確認してください。
            <span className="mt-2 block rounded bg-white px-2 py-1 font-mono text-xs text-red-800">Supabase error: {loadError}</span>
          </p>
        ) : null}

        <form action={createOrganizerAction} className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-slate-800">
            ログインID
            <input className="touch-target rounded-md border border-line bg-white px-3" name="login_id" required />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-800">
            表示名
            <input className="touch-target rounded-md border border-line bg-white px-3" name="display_name" required />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-800">
            初期パスワード
            <input className="touch-target rounded-md border border-line bg-white px-3" name="password" type="password" required />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-800">
            管理メモ
            <input className="touch-target rounded-md border border-line bg-white px-3" name="admin_note" />
          </label>
          <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white sm:col-span-2" type="submit">
            主催者を作成
          </button>
        </form>
      </section>

      <section className="mt-4 rounded-xl border border-line bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">主催者一覧</h2>
        {loadError ? (
          <p className="mt-4 rounded-md bg-slate-100 p-4 text-sm text-slate-600">一覧は現在表示できません。</p>
        ) : organizers.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-slate-500">
                <tr>
                  <th className="whitespace-nowrap py-2 pr-4">表示名</th>
                  <th className="whitespace-nowrap py-2 pr-4">ログインID</th>
                  <th className="whitespace-nowrap py-2 pr-4">状態</th>
                  <th className="whitespace-nowrap py-2 pr-4">作成日時</th>
                  <th className="whitespace-nowrap py-2 pr-4">最終ログイン</th>
                  <th className="whitespace-nowrap py-2 pr-4">メモ</th>
                  <th className="whitespace-nowrap py-2 pr-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((organizer) => (
                  <tr className="border-b border-line last:border-b-0" key={organizer.id}>
                    <td className="whitespace-nowrap py-3 pr-4 font-bold">{organizer.display_name}</td>
                    <td className="whitespace-nowrap py-3 pr-4 font-mono">{organizer.login_id}</td>
                    <td className="whitespace-nowrap py-3 pr-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-black ${organizer.status === "active" ? "bg-teal-50 text-teal-800" : "bg-slate-200 text-slate-600"}`}>
                        {organizer.status === "active" ? "有効" : "無効"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4">{safeDateTime(organizer.created_at)}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{safeDateTime(organizer.last_login_at)}</td>
                    <td className="min-w-40 py-3 pr-4">{organizer.admin_note || "-"}</td>
                    <td className="min-w-72 py-3 pr-4">
                      <div className="grid gap-2">
                        <form action={changeOrganizerStatusAction} className="flex gap-2">
                          <input name="organizer_id" type="hidden" value={organizer.id} />
                          <input name="status" type="hidden" value={organizer.status === "active" ? "disabled" : "active"} />
                          <button className="rounded-md border border-line px-3 py-2 text-xs font-bold" type="submit">
                            {organizer.status === "active" ? "無効にする" : "有効にする"}
                          </button>
                        </form>
                        <form action={resetOrganizerPasswordAction} className="flex flex-col gap-2 sm:flex-row">
                          <input name="organizer_id" type="hidden" value={organizer.id} />
                          <input className="touch-target min-w-0 rounded-md border border-line px-3 text-sm" name="password" placeholder="新しいパスワード" type="password" required />
                          <button className="touch-target rounded-md border border-line px-3 text-xs font-bold" type="submit">
                            リセット
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-md bg-slate-100 p-4 text-sm text-slate-600">まだ主催者はいません。</p>
        )}
      </section>
    </main>
  );
}

async function safeListOrganizers() {
  try {
    return { organizers: await listOrganizers(), loadError: null as string | null };
  } catch (error) {
    console.error("Failed to load organizers", error);
    return { organizers: [], loadError: error instanceof Error ? error.message : "unknown error" };
  }
}

function safeDateTime(value?: string | null) {
  if (!value) return "-";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "-";
  return formatDateTimeJST(value);
}
