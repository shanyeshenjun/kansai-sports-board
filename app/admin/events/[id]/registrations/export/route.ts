import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { csvEscape, formatDateTimeJST, getAdminEvent, listRegistrations } from "@/lib/store";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  const cookieStore = await cookies();
  if (cookieStore.get("ksb_admin")?.value !== "authenticated") {
    return NextResponse.redirect(new URL("/admin/login", _request.url));
  }

  const { id } = await context.params;
  const event = await getAdminEvent(id);
  if (!event) {
    return new NextResponse("Not found", { status: 404 });
  }

  const rows = [
    [
      "event_title",
      "participant_name",
      "contact",
      "number_of_people",
      "note",
      "created_at_jst",
      "display_name",
      "gender",
      "skill_level",
      "is_public",
      "status",
      "cancelled_at_jst",
      "cancellation_reason",
      "cancel_code"
    ],
    ...(await listRegistrations(id)).map((registration) => [
      event.title,
      registration.participant_name,
      registration.contact,
      registration.number_of_people,
      registration.note,
      formatDateTimeJST(registration.created_at),
      registration.display_name ?? "",
      registration.gender ?? "private",
      registration.skill_level ?? "",
      registration.is_public ? "true" : "false",
      registration.status ?? "active",
      registration.cancelled_at ? formatDateTimeJST(registration.cancelled_at) : "",
      registration.cancellation_reason ?? "",
      registration.cancel_code ?? ""
    ])
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.id}-registrations.csv"`
    }
  });
}
