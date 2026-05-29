import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrganizer } from "@/app/actions";
import { T } from "@/components/language-ui";
import { registrationStatusName } from "@/lib/constants";
import { translatedGenderKey, translatedSkillLevelKey } from "@/lib/i18n";
import { formatDate, formatDateTimeJST, formatTime, getOrganizerEvent, listRegistrations } from "@/lib/store";

type Params = Promise<{ id: string }>;

export default async function OrganizerRegistrationsPage({ params }: { params: Params }) {
  const organizer = await requireOrganizer();
  const { id } = await params;
  const event = await getOrganizerEvent(id, organizer.id);
  if (!event) notFound();
  const registrations = await listRegistrations(id);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <Link className="text-sm font-bold text-teal-700" href="/organizer">
        <T textKey="backToOrganizer" />
      </Link>
      <section className="mt-4 rounded-xl border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-950">
              <T textKey="participants" />
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {event.title} / {formatDate(event.start_datetime)} {formatTime(event.start_datetime)}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              <T textKey="participantUsageNote" />
            </p>
          </div>
          <a className="touch-target inline-flex items-center justify-center rounded-md border border-line px-4 py-2 text-sm font-bold" href={`/organizer/events/${event.id}/registrations/export`}>
            <T textKey="downloadCsv" />
          </a>
        </div>

        {registrations.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-slate-500">
                <tr>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="name" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="contact" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="people" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="status" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="displayNameShort" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="gender" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="level" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="publicDisplay" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="notes" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="cancelledAt" /></th>
                  <th className="whitespace-nowrap py-2 pr-4"><T textKey="createdAt" /></th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr className={`border-b border-line last:border-b-0 ${(registration.status ?? "active") === "cancelled" ? "bg-slate-50 text-slate-500" : ""}`} key={registration.id}>
                    <td className="whitespace-nowrap py-3 pr-4 font-bold">{registration.participant_name}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.contact}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.number_of_people}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registrationStatusName(registration.status)}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.display_name || "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4"><T textKey={translatedGenderKey(registration.gender)} /></td>
                    <td className="whitespace-nowrap py-3 pr-4"><T textKey={translatedSkillLevelKey(registration.skill_level)} /></td>
                    <td className="whitespace-nowrap py-3 pr-4"><T textKey={registration.is_public ? "publicOn" : "publicOff"} /></td>
                    <td className="min-w-48 py-3 pr-4">{registration.note || "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{registration.cancelled_at ? formatDateTimeJST(registration.cancelled_at) : "-"}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{formatDateTimeJST(registration.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-md bg-slate-100 p-4 text-sm text-slate-600">
            <T textKey="noRegistrations" />
          </p>
        )}
      </section>
    </main>
  );
}
