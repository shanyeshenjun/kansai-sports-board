import Link from "next/link";
import { notFound } from "next/navigation";
import { currentMember, registerAction } from "@/app/actions";
import { SkillLevelGuide, T } from "@/components/language-ui";
import { RegistrationPublicFields } from "@/components/registration-public-fields";
import { areaName, contactName, genderName, levelName, skillLevelName, skillLevels, sportName, statusName, venueMapUrl } from "@/lib/constants";
import { translatedStatusKey } from "@/lib/i18n";
import { formatCancelDeadlineJST, formatDate, formatTime, getEvent, listRegistrations, yen } from "@/lib/store";
import type { Gender, Registration, SkillLevel } from "@/lib/types";
import type { ReactNode } from "react";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EventDetail({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const event = await getEvent(id);
  if (!event) notFound();
  const registrations = await listRegistrations(event.id);
  const member = await currentMember();
  const activeRegistrations = registrations.filter((registration) => (registration.status ?? "active") === "active");

  const sport = sportName(event.sport_type);
  const area = areaName(event.area);
  const status = statusName(event.status);
  const canRegister = event.status === "open";
  const remaining = Math.max(event.max_participants - event.current_participants, 0);
  const action = registerAction.bind(null, event.id);
  const genderStats = countGenders(activeRegistrations);
  const skillStats = countSkillLevels(activeRegistrations);
  const publicMembers = activeRegistrations.filter((registration) => registration.is_public && registration.display_name);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <Link className="inline-flex rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold text-teal-700 shadow-sm ring-1 ring-line" href="/">
        <T textKey="backToList" />
      </Link>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <article className={`overflow-hidden rounded-xl border border-line bg-white shadow-sm ${event.status !== "open" ? "opacity-90" : ""}`}>
            <div className="bg-gradient-to-br from-white via-teal-50 to-sky-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ring-black/5 ${sport.color}`}>
                {sport.label}
                <span className="ml-1 text-[11px] font-semibold opacity-80">{sport.zh}</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{area.label}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-black ${status.color}`}>
                <T textKey={translatedStatusKey(event.status)} />
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-black leading-tight text-slate-950">{event.title}</h1>
            <div className={`mt-4 rounded-lg border px-3 py-2 text-sm font-black ${status.panel}`}>
              {canRegister ? <T textKey="remaining" values={{ count: remaining }} /> : <T textKey={translatedStatusKey(event.status)} />}
            </div>
            </div>

            <dl className="grid gap-2 p-4 text-sm sm:grid-cols-2">
              <Info label={<T textKey="time" />} value={`${formatDate(event.start_datetime)} ${formatTime(event.start_datetime)}-${formatTime(event.end_datetime)}`} />
              <Info label={<T textKey="area" />} value={area.label} />
              <Info
                label={<T textKey="venue" />}
                value={
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{event.venue_name}</span>
                    <a
                      className="inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-700 ring-1 ring-teal-100"
                      href={venueMapUrl(event.venue_name, event.address)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <T textKey="map" />
                    </a>
                  </span>
                }
              />
              <Info label={<T textKey="address" />} value={event.address} />
              <Info label={<T textKey="fee" />} value={yen(event.fee)} />
              <Info label={<T textKey="people" />} value={`${event.current_participants}/${event.max_participants}名`} />
              <Info label={<T textKey="eventLevel" />} value={levelName(event.level).label} />
              <Info label={<T textKey="organizer" />} value={event.organizer_name} />
              <Info label={<T textKey="contact" />} value={`${contactName(event.organizer_contact_type).label}: ${event.organizer_contact_value}`} />
            </dl>
          </article>

          <article className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <h2 className="font-black text-slate-950"><T textKey="eventContent" /></h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{event.description}</p>
            {event.notes ? <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm leading-6 text-slate-700"><T textKey="notes" />: {event.notes}</p> : null}
          </article>

          <article className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <h2 className="font-black text-slate-950"><T textKey="participantMembers" /></h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Stat label="男性" value={`${genderStats.male}人`} />
              <Stat label="女性" value={`${genderStats.female}人`} />
              <Stat label="非公開" value={`${genderStats.private}人`} />
            </div>
            <h3 className="mt-4 text-sm font-black text-slate-800"><T textKey="levelDistribution" /></h3>
            <div className="mt-2 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700 sm:grid-cols-2">
              {skillLevels.map((skill) => (
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-line" key={skill.value}>
                  <span>{skill.label}</span>
                  <span className="font-black text-slate-950">{skillStats[skill.value]}人</span>
                </div>
              ))}
              {skillStats.unset ? (
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-line">
                  <span>未設定</span>
                  <span className="font-black text-slate-950">{skillStats.unset}人</span>
                </div>
              ) : null}
            </div>
            <div className="mt-3">
              <SkillLevelGuide compact />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500"><T textKey="anonymousStatsNote" /></p>
            {publicMembers.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {publicMembers.map((member) => (
                  <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-bold text-slate-800" key={member.id}>
                    {member.display_name}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{genderName(member.gender)}</span>
                    <span className="ml-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-800">{skillLevelName(member.skill_level)}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md bg-slate-100 p-3 text-sm text-slate-600"><T textKey="noPublicMembers" /></p>
            )}
          </article>
        </div>

        <aside className="rounded-xl border border-line bg-white p-4 shadow-sm lg:self-start">
          <h2 className="text-lg font-black text-slate-950"><T textKey="registration" /></h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">アカウント登録なしで申し込みできます。連絡に必要な範囲だけ入力してください。</p>
          <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs font-bold leading-5 text-slate-600">
            <T textKey="cancelRule" /> {formatCancelDeadlineJST(event.start_datetime)}
          </p>
          <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs font-bold leading-5 text-amber-800"><T textKey="privacyHint" /></p>
          <p className="mt-2 rounded-md bg-teal-50 p-2 text-xs font-bold leading-5 text-teal-900">
            <T textKey="publicHint" />
          </p>
          {query.error ? <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{String(query.error)}</p> : null}
          {canRegister ? (
            <form action={action} className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                <T textKey="nameField" />
                <input className="touch-target rounded-md border border-line px-3" name="participant_name" required />
              </label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                <T textKey="contactField" />
                <input className="touch-target rounded-md border border-line px-3" name="contact" required />
              </label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                <T textKey="peopleField" />
              <input className="touch-target rounded-md border border-line px-3" name="number_of_people" type="number" min="1" max={remaining} defaultValue="1" required />
              </label>
              <RegistrationPublicFields initialProfile={member ? { display_name: member.display_name, gender: member.gender, skill_level: member.skill_level } : null} />
              <p className="rounded-md bg-slate-50 p-2 text-xs leading-5 text-slate-500">
                <T textKey="publicHint" />
              </p>
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                <T textKey="noteField" />
                <textarea className="min-h-24 rounded-md border border-line px-3 py-2" name="note" />
              </label>
              <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
                <T textKey="submit" />
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-bold text-amber-800">この活動は現在申し込みできません。</p>
          )}
          <p className="mt-3 text-xs leading-5 text-slate-500">申し込み後は、主催者の連絡先で集合場所、持ち物、参加可否を確認してください。</p>
          <Link className="touch-target mt-3 flex items-center justify-center rounded-lg border border-line px-4 py-3 text-sm font-black text-slate-700" href="/cancel">
            <T textKey="cancelRegistration" />
          </Link>
        </aside>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 font-black text-slate-900">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-line">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-black text-slate-950">{value}</div>
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
