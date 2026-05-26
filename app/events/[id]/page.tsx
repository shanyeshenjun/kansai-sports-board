import Link from "next/link";
import { notFound } from "next/navigation";
import { registerAction } from "@/app/actions";
import { RegistrationPublicFields } from "@/components/registration-public-fields";
import { areaName, contactName, genderName, levelName, skillLevelName, skillLevels, sportName, statusName } from "@/lib/constants";
import { formatDate, formatTime, getEvent, listRegistrations, yen } from "@/lib/store";
import type { Gender, Registration, SkillLevel } from "@/lib/types";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EventDetail({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const event = await getEvent(id);
  if (!event) notFound();
  const registrations = await listRegistrations(event.id);

  const sport = sportName(event.sport_type);
  const area = areaName(event.area);
  const status = statusName(event.status);
  const canRegister = event.status === "open";
  const remaining = Math.max(event.max_participants - event.current_participants, 0);
  const action = registerAction.bind(null, event.id);
  const genderStats = countGenders(registrations);
  const skillStats = countSkillLevels(registrations);
  const publicMembers = registrations.filter((registration) => registration.is_public && registration.display_name);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/">
        一覧へ戻る
      </Link>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <article className={`rounded-lg border border-line bg-white p-4 shadow-sm ${event.status !== "open" ? "opacity-90" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${sport.color}`}>
                {sport.label}
                <span className="ml-1 text-[11px] font-semibold opacity-80">{sport.zh}</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{area.label}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${status.color}`}>{status.label}</span>
            </div>
            <h1 className="mt-3 text-2xl font-black leading-tight text-slate-950">{event.title}</h1>
            <div className={`mt-4 rounded-md border px-3 py-2 text-sm font-black ${status.panel}`}>
              {canRegister ? `現在受付中です。残り${remaining}名まで申し込みできます。` : `この活動は「${status.label}」です。`}
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <Info label="日時" value={`${formatDate(event.start_datetime)} ${formatTime(event.start_datetime)}-${formatTime(event.end_datetime)}`} />
              <Info label="エリア" value={area.label} />
              <Info label="会場" value={event.venue_name} />
              <Info label="住所" value={event.address} />
              <Info label="費用" value={yen(event.fee)} />
              <Info label="人数" value={`${event.current_participants}/${event.max_participants}名`} />
              <Info label="レベル" value={levelName(event.level).label} />
              <Info label="主催者" value={event.organizer_name} />
              <Info label="連絡先" value={`${contactName(event.organizer_contact_type).label}: ${event.organizer_contact_value}`} />
            </dl>
          </article>

          <article className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <h2 className="font-black text-slate-950">活動内容</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{event.description}</p>
            {event.notes ? <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm leading-6 text-slate-700">注意事項: {event.notes}</p> : null}
          </article>

          <article className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <h2 className="font-black text-slate-950">参加予定メンバー</h2>
            <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-700">
              男性 {genderStats.male}人 / 女性 {genderStats.female}人 / 非公開 {genderStats.private}人
            </p>
            <div className="mt-2 grid gap-1 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-700">
              {skillLevels.map((skill) => (
                <p key={skill.value}>
                  {skill.label}: {skillStats[skill.value]}人
                </p>
              ))}
              {skillStats.unset ? <p>未設定: {skillStats.unset}人</p> : null}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">性別人数は匿名の集計です。公開表示を選んでいない参加者のニックネーム、本名、連絡先、備考は表示されません。</p>
            {publicMembers.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {publicMembers.map((member) => (
                  <span className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-bold text-slate-800" key={member.id}>
                    {member.display_name}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{genderName(member.gender)}</span>
                    <span className="ml-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-800">{skillLevelName(member.skill_level)}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm text-slate-600">公開されている参加者はまだいません。</p>
            )}
          </article>
        </div>

        <aside className="rounded-lg border border-line bg-white p-4 shadow-sm lg:self-start">
          <h2 className="text-lg font-black text-slate-950">参加申し込み</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">アカウント登録なしで申し込みできます。連絡に必要な範囲だけ入力してください。</p>
          <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs font-bold leading-5 text-amber-800">住所、勤務先、身分証番号などの敏感な個人情報は入力しないでください。</p>
          <p className="mt-2 rounded-md bg-teal-50 p-2 text-xs font-bold leading-5 text-teal-900">
            ニックネームは公開表示用です。本名や連絡先を書かないでください。連絡先・備考・本名は一般公開されません。性別は「非公開」を選べます。公開表示は任意です。
            レベルは他の参加者が活動の雰囲気を確認するために使われます。公開表示を選んだ場合、ニックネームと一緒に表示されます。
          </p>
          {query.error ? <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{String(query.error)}</p> : null}
          {canRegister ? (
            <form action={action} className="mt-4 grid gap-3">
              <input className="touch-target rounded-md border border-line px-3" name="participant_name" placeholder="名前・連絡用の呼び名" required />
              <input className="touch-target rounded-md border border-line px-3" name="contact" placeholder="連絡先" required />
              <input className="touch-target rounded-md border border-line px-3" name="number_of_people" type="number" min="1" max={remaining} defaultValue="1" required />
              <RegistrationPublicFields />
              <p className="rounded-md bg-slate-50 p-2 text-xs leading-5 text-slate-500">
                「公開する」を選ぶと、活動詳細ページにニックネーム・性別区分・レベルが表示されます。連絡先・備考・本名は公開されません。
              </p>
              <textarea className="min-h-24 rounded-md border border-line px-3 py-2" name="note" placeholder="備考（任意）" />
              <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
                送信する
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-bold text-amber-800">この活動は現在申し込みできません。</p>
          )}
          <p className="mt-3 text-xs leading-5 text-slate-500">申し込み後は、主催者の連絡先で集合場所、持ち物、参加可否を確認してください。</p>
        </aside>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[84px_1fr] gap-3 border-b border-line py-2 last:border-b-0">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function countGenders(registrations: Registration[]) {
  const initial: Record<Gender, number> = { male: 0, female: 0, private: 0 };
  return registrations.reduce((total, registration) => {
    const gender = registration.gender === "male" || registration.gender === "female" ? registration.gender : "private";
    total[gender] += registration.number_of_people;
    return total;
  }, initial);
}

function countSkillLevels(registrations: Registration[]) {
  const initial: Record<SkillLevel, number> & { unset: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, unset: 0 };
  return registrations.reduce((total, registration) => {
    const level = registration.skill_level;
    if (level === 1 || level === 2 || level === 3 || level === 4 || level === 5) {
      total[level] += registration.number_of_people;
    } else {
      total.unset += registration.number_of_people;
    }
    return total;
  }, initial);
}
