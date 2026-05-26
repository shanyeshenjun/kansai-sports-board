"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cancelRegistrationByCode, getCancellationPreview, parseEventForm, register, saveEvent, setEventStatus, setRegistrationStatusByAdmin, softDeleteEvent } from "@/lib/store";
import type { EventStatus, Gender, RegistrationStatus, SkillLevel } from "@/lib/types";

const defaultAdminPassword = "change-me-local-admin";
const lastRegistrationCookie = "ksb_last_registration";
const cancellationRequestCookie = "ksb_cancel_request";

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

export async function changeRegistrationStatusAction(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("event_id") ?? "");
  const registrationId = String(formData.get("registration_id") ?? "");
  const statusValue = String(formData.get("status") ?? "active");
  const status: RegistrationStatus = statusValue === "cancelled" ? "cancelled" : "active";
  const result = await setRegistrationStatusByAdmin(registrationId, status);
  revalidatePath("/");
  revalidatePath(`/events/${eventId || result.event_id}`);
  revalidatePath(`/admin/events/${eventId || result.event_id}/registrations`);
  revalidatePath("/admin");
  if (!result.ok) {
    redirect(`/admin/events/${eventId || result.event_id}/registrations?error=${encodeURIComponent(result.message ?? "更新できませんでした。")}`);
  }
  redirect(`/admin/events/${eventId || result.event_id}/registrations`);
}

export async function registerAction(eventId: string, formData: FormData) {
  const genderValue = String(formData.get("gender") ?? "private");
  const gender: Gender = genderValue === "male" || genderValue === "female" ? genderValue : "private";
  const skillValue = Number(formData.get("skill_level") ?? 0);
  const skillLevel = skillValue >= 1 && skillValue <= 5 ? (skillValue as SkillLevel) : null;
  const isPublic = String(formData.get("is_public") ?? "false") === "true";
  const result = await register(eventId, {
    participant_name: String(formData.get("participant_name") ?? ""),
    contact: String(formData.get("contact") ?? ""),
    number_of_people: Number(formData.get("number_of_people") ?? 1),
    note: String(formData.get("note") ?? ""),
    display_name: String(formData.get("display_name") ?? ""),
    gender,
    skill_level: skillLevel,
    is_public: isPublic
  });
  if (!result.ok) {
    redirect(`/events/${eventId}?error=${encodeURIComponent(result.message ?? "申し込みできません")}`);
  }
  if (result.registration_id && result.cancel_code) {
    const cookieStore = await cookies();
    cookieStore.set(
      lastRegistrationCookie,
      encodeURIComponent(JSON.stringify({ event_id: eventId, registration_id: result.registration_id, cancel_code: result.cancel_code })),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 30
      }
    );
  }
  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/registrations`);
  redirect(`/events/${eventId}/thanks`);
}

export async function lookupCancellationAction(formData: FormData) {
  const registrationId = String(formData.get("registration_id") ?? "").trim();
  const cancelCode = String(formData.get("cancel_code") ?? "").trim().toUpperCase();
  const reason = String(formData.get("cancellation_reason") ?? "").trim();
  const preview = await getCancellationPreview(registrationId, cancelCode);

  if (!preview.ok) {
    redirect(`/cancel?error=${encodeURIComponent(preview.message)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(cancellationRequestCookie, encodeURIComponent(JSON.stringify({ registration_id: registrationId, cancel_code: cancelCode, reason })), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10
  });
  redirect("/cancel?confirm=1");
}

export async function confirmCancellationAction() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(cancellationRequestCookie)?.value;
  if (!raw) redirect(`/cancel?error=${encodeURIComponent("キャンセル情報の有効期限が切れました。もう一度入力してください。")}`);

  let payload: { registration_id?: string; cancel_code?: string; reason?: string };
  try {
    payload = JSON.parse(decodeURIComponent(raw));
  } catch {
    cookieStore.delete(cancellationRequestCookie);
    redirect(`/cancel?error=${encodeURIComponent("キャンセル情報を確認できません。もう一度入力してください。")}`);
  }

  const result = await cancelRegistrationByCode(payload.registration_id ?? "", payload.cancel_code ?? "", payload.reason ?? "");
  cookieStore.delete(cancellationRequestCookie);
  if (!result.ok) {
    redirect(`/cancel?error=${encodeURIComponent(result.message ?? "キャンセルできませんでした。")}`);
  }

  revalidatePath("/");
  if (result.event_id) {
    revalidatePath(`/events/${result.event_id}`);
    revalidatePath(`/admin/events/${result.event_id}/registrations`);
  }
  revalidatePath("/admin");
  redirect("/cancel?success=1");
}

export async function readLastRegistrationCookie(eventId: string) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(lastRegistrationCookie)?.value;
  if (!raw) return null;
  try {
    const payload = JSON.parse(decodeURIComponent(raw)) as { event_id?: string; registration_id?: string; cancel_code?: string };
    if (payload.event_id !== eventId || !payload.registration_id || !payload.cancel_code) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function readCancellationRequestCookie() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(cancellationRequestCookie)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as { registration_id?: string; cancel_code?: string; reason?: string };
  } catch {
    return null;
  }
}
