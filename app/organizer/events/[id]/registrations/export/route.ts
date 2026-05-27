import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { csvEscape, formatDateTimeJST, getOrganizer, getOrganizerEvent, listRegistrations } from "@/lib/store";

type Context = {
  params: Promise<{ id: string }>;
};

function sessionSecret() {
  return process.env.ADMIN_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY || "change-me-local-admin";
}

async function currentOrganizerId() {
  const { createHmac, timingSafeEqual } = await import("crypto");
  const cookieStore = await cookies();
  const value = cookieStore.get("ksb_organizer")?.value;
  if (!value) return null;
  const [id, signature] = value.split(".");
  if (!id || !signature) return null;
  const expected = createHmac("sha256", sessionSecret()).update(id).digest("hex");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  const organizer = await getOrganizer(id);
  return organizer?.status === "active" ? organizer.id : null;
}

export async function GET(_request: Request, context: Context) {
  const organizerId = await currentOrganizerId();
  if (!organizerId) {
    return NextResponse.redirect(new URL("/organizer/login", _request.url));
  }

  const { id } = await context.params;
  const event = await getOrganizerEvent(id, organizerId);
  if (!event) {
    return new NextResponse("Forbidden", { status: 403 });
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
      "cancellation_reason"
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
      registration.cancellation_reason ?? ""
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
