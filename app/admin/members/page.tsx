import Link from "next/link";
import { requireAdmin } from "@/app/actions";
import { T } from "@/components/language-ui";
import { skillLevels } from "@/lib/constants";
import { translatedGenderKey, translatedSkillLevelKey } from "@/lib/i18n";
import { formatDateTimeJST, getMemberAdminStats, listAdminMembers } from "@/lib/store";
import type { ReactNode } from "react";

export default async function AdminMembersPage() {
  await requireAdmin();
  const [stats, members] = await Promise.all([getMemberAdminStats(), listAdminMembers()]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-black text-sky-700">
            <T textKey="adminOnly" />
          </p>
          <h1 className="text-2xl font-black text-slate-950">
            <T textKey="memberManagement" />
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            <T textKey="memberStatsDescription" />
          </p>
        </div>
        <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-4 py-2 text-sm font-bold" href="/admin">
          <T textKey="backToAdmin" />
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={<T textKey="totalUsers" />} value={stats.total} />
        <Stat label={<T textKey="todayNewUsers" />} value={stats.today} />
        <Stat label={<T textKey="weekNewUsers" />} value={stats.week} />
        <Stat label={<T textKey="monthNewUsers" />} value={stats.month} />
        <Stat label={<T textKey="publicProfiles" />} value={stats.publicProfiles} />
        <Stat label={<T textKey="privateProfiles" />} value={stats.privateProfiles} />
        <Stat label="active" value={stats.active} />
        <Stat label="disabled" value={stats.disabled} />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <Panel title={<T textKey="genderStats" />}>
          <StatLine label={<T textKey="male" />} value={stats.genders.male} />
          <StatLine label={<T textKey="female" />} value={stats.genders.female} />
          <StatLine label={<T textKey="private" />} value={stats.genders.private} />
        </Panel>
        <Panel title={<T textKey="levelDistribution" />}>
          {skillLevels.map((level) => (
            <StatLine key={level.value} label={<T textKey={translatedSkillLevelKey(level.value)} />} value={stats.skillLevels[level.value]} />
          ))}
        </Panel>
        <Panel title={<T textKey="titleRanking" />}>
          {stats.topTitles.length ? (
            stats.topTitles.map((item) => <StatLine key={item.title} label={item.title} value={item.count} />)
          ) : (
            <p className="text-sm text-slate-500">
              <T textKey="noTitlesUsed" />
            </p>
          )}
        </Panel>
      </section>

      <section className="mt-5 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black text-slate-500">
              <tr>
                <th className="px-4 py-3"><T textKey="nickname" /></th>
                <th className="px-4 py-3"><T textKey="loginId" /></th>
                <th className="px-4 py-3"><T textKey="gender" /></th>
                <th className="px-4 py-3"><T textKey="skillLevel" /></th>
                <th className="px-4 py-3"><T textKey="title" /></th>
                <th className="px-4 py-3"><T textKey="publicDisplay" /></th>
                <th className="px-4 py-3">status</th>
                <th className="px-4 py-3"><T textKey="createdAt" /></th>
                <th className="px-4 py-3"><T textKey="lastLoginAt" /></th>
                <th className="px-4 py-3"><T textKey="friendCount" /></th>
                <th className="px-4 py-3"><T textKey="reviewCount" /></th>
                <th className="px-4 py-3"><T textKey="detail" /></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr className="border-t border-line" key={member.id}>
                  <td className="px-4 py-3 font-black text-slate-900">{member.display_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{member.login_id}</td>
                  <td className="px-4 py-3"><T textKey={translatedGenderKey(member.gender)} /></td>
                  <td className="px-4 py-3"><T textKey={translatedSkillLevelKey(member.skill_level)} /></td>
                  <td className="px-4 py-3">{member.title || "-"}</td>
                  <td className="px-4 py-3"><T textKey={member.profile_public ? "publicOn" : "publicOff"} /></td>
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
                      <T textKey="detail" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!members.length ? (
          <p className="p-5 text-sm text-slate-600">
            <T textKey="noMembers" />
          </p>
        ) : null}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: ReactNode; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <h2 className="font-black text-slate-950">{title}</h2>
      <div className="mt-3 grid gap-2">{children}</div>
    </div>
  );
}

function StatLine({ label, value }: { label: ReactNode; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
      <span className="truncate font-bold text-slate-700">{label}</span>
      <span className="font-black text-slate-950">{value}</span>
    </div>
  );
}
