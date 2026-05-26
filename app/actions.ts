"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseEventForm, register, saveEvent, setEventStatus, softDeleteEvent } from "@/lib/store";
import type { EventStatus } from "@/lib/types";

const defaultAdminPassword = "change-me-local-admin";

export async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("ksb_admin")?.value === "authenticated";
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password !== (process.env.ADMIN_PASSWORD || defaultAdminPassword)) {
    redirect("/admin/login?error=1");
  }
  const cookieStore = await cookies();
  cookieStore.set("ksb_admin", "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("ksb_admin");
  redirect("/");
}

export async function createEventAction(formData: FormData) {
  await requireAdmin();
  await saveEvent(parseEventForm(formData));
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateEventAction(id: string, formData: FormData) {
  await requireAdmin();
  await saveEvent(parseEventForm(formData), id);
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function cancelEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("event_id") ?? "");
  await setEventStatus(id, "cancelled");
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function finishEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("event_id") ?? "");
  await setEventStatus(id, "finished");
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("event_id") ?? "");
  await softDeleteEvent(id);
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function changeStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("event_id") ?? "");
  const status = String(formData.get("status") ?? "open") as EventStatus;
  await setEventStatus(id, status);
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function registerAction(eventId: string, formData: FormData) {
  const result = await register(eventId, {
    participant_name: String(formData.get("participant_name") ?? ""),
    contact: String(formData.get("contact") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    note: String(formData.get("note") ?? "")
  });
  if (!result.ok) {
    redirect(`/events/${eventId}?error=${encodeURIComponent(result.message ?? "申し込みできません")}`);
  }
  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/registrations`);
  redirect(`/events/${eventId}/thanks`);
}
