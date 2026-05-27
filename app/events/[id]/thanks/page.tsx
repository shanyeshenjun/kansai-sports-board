import Link from "next/link";
import { readLastRegistrationCookie } from "@/app/actions";
import { T } from "@/components/language-ui";
import { formatCancelDeadlineJST, getEvent } from "@/lib/store";

type Params = Promise<{ id: string }>;

export default async function ThanksPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = await getEvent(id);
  const registrationInfo = await readLastRegistrationCookie(id);

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full rounded-lg border border-line bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-black text-slate-950"><T textKey="thanksTitle" /></h1>
        <p className="mt-3 text-sm leading-6 text-slate-600"><T textKey="thanksBody" /></p>

        {registrationInfo ? (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
            <h2 className="text-sm font-black text-amber-950"><T textKey="cancelInfoTitle" /></h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <div>
                <dt className="text-xs font-bold text-amber-800"><T textKey="registrationId" /></dt>
                <dd className="break-all rounded-md bg-white px-3 py-2 font-mono font-bold text-slate-950">{registrationInfo.registration_id}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-amber-800"><T textKey="cancelCode" /></dt>
                <dd className="break-all rounded-md bg-white px-3 py-2 font-mono font-bold text-slate-950">{registrationInfo.cancel_code}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs font-bold leading-5 text-amber-900">
              <T textKey="saveCancelInfo" />
            </p>
          </div>
        ) : null}

        {event ? (
          <p className="mt-4 rounded-md bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-600">
            <T textKey="cancelRule" /> {formatCancelDeadlineJST(event.start_datetime)}
          </p>
        ) : null}

        <div className="mt-5 grid gap-2">
          <Link className="touch-target flex items-center justify-center rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" href="/">
            <T textKey="backToList" />
          </Link>
          <Link className="touch-target flex items-center justify-center rounded-md border border-line px-4 py-3 text-sm font-black text-slate-700" href="/cancel">
            <T textKey="cancelRegistration" />
          </Link>
        </div>
      </div>
    </main>
  );
}
