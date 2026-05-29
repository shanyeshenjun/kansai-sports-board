import Link from "next/link";
import { requireAdmin } from "@/app/actions";
import { genderName, skillLevelName, skillLevels } from "@/lib/constants";
import { formatDateTimeJST, getMemberAdminStats, listAdminMembers } from "@/lib/store";
import type { ReactNode } from "react";

export default async function AdminMembersPage() {
  await requireAdmin();
  const [stats, members] = await Promise.all([getMemberAdminStats(), listAdminMembers()]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-black text-sky-700">Admin only</p>
          <h1 className="text-2xl font-black text-slate-950">会員管理</h1>
          <p className="mt-1 text-sm text-slate-600">登録ユーザーの統計、公開状態、評価を確認します。パスワードやセッション情報は表示しません。</p>
        </div>
        <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-4 py-2 text-sm font-bold" href="/admin">
          管理画面へ戻る
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="総登録ユーザー" value={stats.total} />
        <Stat label="今日の新規" value={stats.today} />
        <Stat label="今週の新規" value={stats.week} />
        <Stat label="今月の新規" value={stats.month} />
        <Stat label="公開プロフィール" value={stats.publicProfiles} />
        <Stat label="非公開プロフィール" value={stats.privateProfiles} />
        <Stat label="active" value={stats.active} />
        <Stat label="disabled" value={stats.disabled} />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <Panel title="性別統計">
          <StatLine label="男性" value={stats.genders.male} />
          <StatLine label="女性" value={stats.genders.female} />
          <StatLine label="非公開" value={stats.genders.private} />
        </Panel>
        <Panel title="熟練度分布">
          {skillLevels.map((level) => (
            <StatLine key={level.value} label={level.label} value={stats.skillLevels[level.value]} />
          ))}
        </Panel>
        <Panel title="称号使用排行">
          {stats.topTitles.length ? (
            stats.topTitles.map((item) => <StatLine key={item.title} label={item.title} value={item.count} />)
          ) : (
            <p className="text-sm text-slate-500">まだ称号は使われていません。</p>
          )}
        </Panel>
      </section>

      <section className="mt-5 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black text-slate-500">
              <tr>
                <th className="px-4 py-3">ニックネーム</th>
                <th className="px-4 py-3">ログインID</th>
                <th className="px-4 py-3">性別</th>
                <th className="px-4 py-3">レベル</th>
                <th className="px-4 py-3">称号</th>
                <th className="px-4 py-3">公開</th>
                <th className="px-4 py-3">status</th>
                <th className="px-4 py-3">登録日時</th>
                <th className="px-4 py-3">最終ログイン</th>
                <th className="px-4 py-3">友達</th>
                <th className="px-4 py-3">評価</th>
                <th className="px-4 py-3">詳細</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr className="border-t border-line" key={member.id}>
                  <td className="px-4 py-3 font-black text-slate-900">{member.display_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{member.login_id}</td>
                  <td className="px-4 py-3">{genderName(member.gender)}</td>
                  <td className="px-4 py-3">{skillLevelName(member.skill_level)}</td>
                  <td className="px-4 py-3">{member.title || "-"}</td>
                  <td className="px-4 py-3">{member.profile_public ? "公開" : "非公開"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-black ${member.status === "disabled" ? "bg-slate-200 text-slate-600" : "bg-teal-50 text-teal-800"}`}>
                      {member.status === "disabled" ? "disabled" : "active"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTimeJST(member.created_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{member.last_login_at ? formatDateTimeJST(member.last_login_at) : "-"}</td>
                  <td className="px-4 py-3">{member.friend_count}</td>
                  <td className="px-4 py-3">{member.review_count}</td>
                  <td className="px-4 py-3">
                    <Link className="font-black text-teal-700" href={`/admin/members/${member.id}`}>
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!members.length ? <p className="p-5 text-sm text-slate-600">まだ会員はいません。</p> : null}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <h2 className="font-black text-slate-950">{title}</h2>
      <div className="mt-3 grid gap-2">{children}</div>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
      <span className="truncate font-bold text-slate-700">{label}</span>
      <span className="font-black text-slate-950">{value}</span>
    </div>
  );
}
