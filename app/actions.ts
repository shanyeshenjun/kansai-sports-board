"use server";

import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  cancelRegistrationByCode,
  createMember,
  createOrganizer,
  createProfileReview,
  getCancellationPreview,
  getMember,
  getMemberByLoginId,
  getOrganizer,
  getOrganizerByLoginId,
  hideProfileReview,
  hideProfileReviewByAdmin,
  markMemberLogin,
  markOrganizerLogin,
  parseEventForm,
  register,
  requestFriendship,
  respondFriendship,
  resetOrganizerPassword,
  saveEvent,
  setEventStatus,
  setMemberProfilePublicByAdmin,
  setMemberStatusByAdmin,
  setOrganizerStatus,
  setRegistrationStatusByAdmin,
  softDeleteEvent,
  updateMemberProfile,
  verifyPassword
} from "@/lib/store";
import type { EventStatus, FriendshipStatus, Gender, MemberStatus, RegistrationStatus, SkillLevel } from "@/lib/types";

const defaultAdminPassword = "change-me-local-admin";
const lastRegistrationCookie = "ksb_last_registration";
const cancellationRequestCookie = "ksb_cancel_request";
const organizerSessionCookie = "ksb_organizer";
const memberSessionCookie = "ksb_member";

function sessionSecret() {
  return process.env.ADMIN_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY || defaultAdminPassword;
}

function signOrganizerSession(id: string) {
  const signature = createHmac("sha256", sessionSecret()).update(id).digest("hex");
  return `${id}.${signature}`;
}

function signMemberSession(id: string) {
  const signature = createHmac("sha256", sessionSecret()).update(`member:${id}`).digest("hex");
  return `${id}.${signature}`;
}

function verifyOrganizerSession(value?: string) {
  if (!value) return null;
  const [id, signature] = value.split(".");
  if (!id || !signature) return null;
  const expected = createHmac("sha256", sessionSecret()).update(id).digest("hex");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  return timingSafeEqual(actualBuffer, expectedBuffer) ? id : null;
}

function verifyMemberSession(value?: string) {
  if (!value) return null;
  const [id, signature] = value.split(".");
  if (!id || !signature) return null;
  const expected = createHmac("sha256", sessionSecret()).update(`member:${id}`).digest("hex");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  return timingSafeEqual(actualBuffer, expectedBuffer) ? id : null;
}

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

function parseGender(value: FormDataEntryValue | null): Gender {
  const gender = String(value ?? "private");
  return gender === "male" || gender === "female" ? gender : "private";
}

function parseSkillLevel(value: FormDataEntryValue | null): SkillLevel | null {
  const skill = Number(value ?? 0);
  return skill >= 1 && skill <= 5 ? (skill as SkillLevel) : null;
}

function parseProfilePublic(value: FormDataEntryValue | null) {
  return String(value ?? "") === "on" || String(value ?? "") === "true";
}

export async function currentMember() {
  const cookieStore = await cookies();
  const id = verifyMemberSession(cookieStore.get(memberSessionCookie)?.value);
  if (!id) return null;
  try {
    const member = await getMember(id);
    if (!member || (member.status ?? "active") !== "active") return null;
    return member;
  } catch {
    return null;
  }
}

export async function requireMember() {
  const member = await currentMember();
  if (!member) redirect("/login");
  return member;
}

export async function registerMemberAction(formData: FormData) {
  let memberId: string;
  try {
    memberId = await createMember({
      login_id: String(formData.get("login_id") ?? ""),
      password: String(formData.get("password") ?? ""),
      display_name: String(formData.get("display_name") ?? ""),
      gender: parseGender(formData.get("gender")),
      skill_level: parseSkillLevel(formData.get("skill_level")),
      bio: String(formData.get("bio") ?? ""),
      title: String(formData.get("title") ?? ""),
      profile_public: parseProfilePublic(formData.get("profile_public"))
    });
  } catch (error) {
    redirect(`/register?error=${encodeURIComponent(error instanceof Error ? error.message : "登録できませんでした。")}`);
  }

  await markMemberLogin(memberId);
  const cookieStore = await cookies();
  cookieStore.set(memberSessionCookie, signMemberSession(memberId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
  redirect("/me");
}

export async function memberLoginAction(formData: FormData) {
  const loginId = String(formData.get("login_id") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const member = await getMemberByLoginId(loginId);
  if (!member || (member.status ?? "active") !== "active" || !(await verifyPassword(password, member.password_hash))) {
    redirect("/login?error=1");
  }
  await markMemberLogin(member.id);
  const cookieStore = await cookies();
  cookieStore.set(memberSessionCookie, signMemberSession(member.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
  redirect("/me");
}

export async function memberLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(memberSessionCookie);
  redirect("/");
}

export async function updateMyProfileAction(formData: FormData) {
  const member = await requireMember();
  try {
    await updateMemberProfile(member.id, {
      display_name: String(formData.get("display_name") ?? ""),
      gender: parseGender(formData.get("gender")),
      skill_level: parseSkillLevel(formData.get("skill_level")),
      bio: String(formData.get("bio") ?? ""),
      title: String(formData.get("title") ?? ""),
      profile_public: parseProfilePublic(formData.get("profile_public"))
    });
  } catch (error) {
    redirect(`/me?error=${encodeURIComponent(error instanceof Error ? error.message : "更新できませんでした。")}`);
  }
  revalidatePath("/me");
  revalidatePath(`/users/${member.id}`);
  redirect("/me?updated=1");
}

export async function requestFriendAction(formData: FormData) {
  const member = await requireMember();
  const targetId = String(formData.get("target_id") ?? "");
  try {
    await requestFriendship(member.id, targetId);
  } catch (error) {
    redirect(`/users/${targetId}?error=${encodeURIComponent(error instanceof Error ? error.message : "申請できませんでした。")}`);
  }
  revalidatePath(`/users/${targetId}`);
  revalidatePath("/me");
  redirect(`/users/${targetId}?friend=sent`);
}

export async function respondFriendAction(formData: FormData) {
  const member = await requireMember();
  const friendshipId = String(formData.get("friendship_id") ?? "");
  const status = String(formData.get("status") ?? "rejected") === "accepted" ? "accepted" : "rejected";
  await respondFriendship(member.id, friendshipId, status as FriendshipStatus);
  revalidatePath("/me");
  redirect("/me");
}

export async function createReviewAction(formData: FormData) {
  const member = await requireMember();
  const targetId = String(formData.get("target_id") ?? "");
  try {
    await createProfileReview(member.id, targetId, {
      rating_skill: parseSkillLevel(formData.get("rating_skill")),
      comment: String(formData.get("comment") ?? "")
    });
  } catch (error) {
    redirect(`/users/${targetId}?error=${encodeURIComponent(error instanceof Error ? error.message : "評価を送信できませんでした。")}`);
  }
  revalidatePath(`/users/${targetId}`);
  redirect(`/users/${targetId}?review=sent`);
}

export async function hideReviewAction(formData: FormData) {
  const member = await requireMember();
  const reviewId = String(formData.get("review_id") ?? "");
  await hideProfileReview(member.id, reviewId);
  revalidatePath("/me");
  revalidatePath(`/users/${member.id}`);
  redirect("/me");
}

export async function currentOrganizer() {
  const cookieStore = await cookies();
  const id = verifyOrganizerSession(cookieStore.get(organizerSessionCookie)?.value);
  if (!id) return null;
  const organizer = await getOrganizer(id);
  if (!organizer || organizer.status !== "active") return null;
  return organizer;
}

export async function requireOrganizer() {
  const organizer = await currentOrganizer();
  if (!organizer) redirect("/organizer/login");
  return organizer;
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

export async function changeMemberStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("member_id") ?? "");
  const status = String(formData.get("status") ?? "active") === "disabled" ? "disabled" : "active";
  await setMemberStatusByAdmin(id, status as MemberStatus);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
  redirect(`/admin/members/${id}`);
}

export async function hideMemberProfileAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("member_id") ?? "");
  await setMemberProfilePublicByAdmin(id, false);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
  revalidatePath(`/users/${id}`);
  redirect(`/admin/members/${id}`);
}

export async function hideReviewByAdminAction(formData: FormData) {
  await requireAdmin();
  const memberId = String(formData.get("member_id") ?? "");
  const reviewId = String(formData.get("review_id") ?? "");
  await hideProfileReviewByAdmin(reviewId);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath(`/users/${memberId}`);
  redirect(`/admin/members/${memberId}`);
}

export async function createOrganizerAction(formData: FormData) {
  await requireAdmin();
  try {
    await createOrganizer({
      login_id: String(formData.get("login_id") ?? ""),
      display_name: String(formData.get("display_name") ?? ""),
      password: String(formData.get("password") ?? ""),
      admin_note: String(formData.get("admin_note") ?? "")
    });
  } catch (error) {
    redirect(`/admin/organizers?error=${encodeURIComponent(error instanceof Error ? error.message : "作成できませんでした。")}`);
  }
  revalidatePath("/admin/organizers");
  redirect("/admin/organizers");
}

export async function changeOrganizerStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("organizer_id") ?? "");
  const status = String(formData.get("status") ?? "active") === "disabled" ? "disabled" : "active";
  await setOrganizerStatus(id, status);
  revalidatePath("/admin/organizers");
  redirect("/admin/organizers");
}

export async function resetOrganizerPasswordAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("organizer_id") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await resetOrganizerPassword(id, password);
  } catch (error) {
    redirect(`/admin/organizers?error=${encodeURIComponent(error instanceof Error ? error.message : "更新できませんでした。")}`);
  }
  revalidatePath("/admin/organizers");
  redirect("/admin/organizers?reset=1");
}

export async function organizerLoginAction(formData: FormData) {
  const loginId = String(formData.get("login_id") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const organizer = await getOrganizerByLoginId(loginId);
  if (!organizer || organizer.status !== "active" || !(await verifyPassword(password, organizer.password_hash))) {
    redirect("/organizer/login?error=1");
  }
  await markOrganizerLogin(organizer.id);
  const cookieStore = await cookies();
  cookieStore.set(organizerSessionCookie, signOrganizerSession(organizer.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  redirect("/organizer");
}

export async function organizerLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(organizerSessionCookie);
  redirect("/organizer/login");
}

export async function createOrganizerEventAction(formData: FormData) {
  const organizer = await requireOrganizer();
  const id = await saveEvent(parseEventForm(formData), undefined, organizer.id);
  revalidatePath("/");
  revalidatePath("/organizer");
  redirect(`/organizer/events/${id}/edit`);
}

export async function updateOrganizerEventAction(id: string, formData: FormData) {
  const organizer = await requireOrganizer();
  await saveEvent(parseEventForm(formData), id, organizer.id);
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/organizer");
  redirect("/organizer");
}

export async function changeOrganizerEventStatusAction(formData: FormData) {
  const organizer = await requireOrganizer();
  const id = String(formData.get("event_id") ?? "");
  const status = String(formData.get("status") ?? "open") as EventStatus;
  await setEventStatus(id, status, organizer.id);
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/organizer");
  redirect("/organizer");
}

export async function finishOrganizerEventAction(formData: FormData) {
  const organizer = await requireOrganizer();
  const id = String(formData.get("event_id") ?? "");
  await setEventStatus(id, "finished", organizer.id);
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/organizer");
  redirect("/organizer");
}

export async function cancelOrganizerEventAction(formData: FormData) {
  const organizer = await requireOrganizer();
  const id = String(formData.get("event_id") ?? "");
  await setEventStatus(id, "cancelled", organizer.id);
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/organizer");
  redirect("/organizer");
}

export async function deleteOrganizerEventAction(formData: FormData) {
  const organizer = await requireOrganizer();
  const id = String(formData.get("event_id") ?? "");
  await softDeleteEvent(id, organizer.id);
  revalidatePath("/");
  revalidatePath(`/events/${id}`);
  revalidatePath("/organizer");
  redirect("/organizer");
}

export async function registerAction(eventId: string, formData: FormData) {
  const gender = parseGender(formData.get("gender"));
  const skillLevel = parseSkillLevel(formData.get("skill_level"));
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
