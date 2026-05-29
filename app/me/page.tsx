import Link from "next/link";
import type { ReactNode } from "react";
import { hideReviewAction, memberLogoutAction, requireMember, respondFriendAction, updateMyProfileAction } from "@/app/actions";
import { T } from "@/components/language-ui";
import { participantTitleOptions, translatedGenderKey, translatedSkillLevelKey, type TranslationKey } from "@/lib/i18n";
import { formatDateTimeJST, listFriendRequests, listFriends, listProfileReviews } from "@/lib/store";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const titleOptions = [...participantTitleOptions.male, ...participantTitleOptions.female];
const genderValues = ["male", "female", "private"] as const;
const skillValues = [1, 2, 3, 4, 5] as const;

export default async function MePage({ searchParams }: { searchParams: SearchParams }) {
  const member = await requireMember();
  const query = await searchParams;
  const [requests, friends, reviews] = await Promise.all([listFriendRequests(member.id), listFriends(member.id), listProfileReviews(member.id, { includeHidden: true })]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-teal-700">My Page</p>
          <h1 className="text-2xl font-black text-slate-950"><T textKey="myPage" /></h1>
          <p className="mt-1 text-sm text-slate-600"><T textKey="myPageDescription" /></p>
        </div>
        <div className="flex gap-2">
          <Link className="touch-target inline-flex items-center rounded-md border border-line px-4 text-sm font-bold" href={`/users/${member.id}`}>
            <T textKey="viewPublicPage" />
          </Link>
          <form action={memberLogoutAction}>
            <button className="touch-target rounded-md border border-line px-4 text-sm font-bold text-slate-600" type="submit">
              <T textKey="logout" />
            </button>
          </form>
        </div>
      </div>

      {query.updated ? <p className="mt-4 rounded-md bg-teal-50 p-3 text-sm font-bold text-teal-800"><T textKey="profileUpdated" /></p> : null}
      {query.error ? (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">
          <T textKey="operationFailed" />
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950"><T textKey="profileEdit" /></h2>
          <form action={updateMyProfileAction} className="mt-4 grid gap-4">
            <Field labelKey="nickname">
              <input className="touch-target rounded-md border border-line px-3" name="display_name" defaultValue={member.display_name} required />
            </Field>
            <Field labelKey="gender">
              <select className="touch-target rounded-md border border-line px-3" name="gender" defaultValue={member.gender ?? "private"}>
                {genderValues.map((value) => (
                  <option key={value} value={value}>
                    <T textKey={translatedGenderKey(value)} />
                  </option>
                ))}
              </select>
            </Field>
            <Field labelKey="skillLevel">
              <select className="touch-target rounded-md border border-line px-3" name="skill_level" defaultValue={member.skill_level ?? ""} required>
                <option value=""><T textKey="selectSkillLevel" /></option>
                {skillValues.map((value) => (
                  <option key={value} value={value}>
                    <T textKey={translatedSkillLevelKey(value)} />
                  </option>
                ))}
              </select>
            </Field>
            <Field labelKey="title">
              <select className="touch-target rounded-md border border-line px-3" name="title" defaultValue={member.title ?? ""}>
                <option value=""><T textKey="titleUnset" /></option>
                {titleOptions.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </Field>
            <Field labelKey="bio">
              <textarea className="min-h-28 rounded-md border border-line px-3 py-2" name="bio" defaultValue={member.bio ?? ""} />
            </Field>
            <label className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-700">
              <input name="profile_public" type="checkbox" defaultChecked={member.profile_public} />
              <T textKey="profilePublic" />
            </label>
            <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
              <T textKey="save" />
            </button>
          </form>
        </section>

        <aside className="grid gap-5">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950"><T textKey="friendRequests" /></h2>
            {requests.length ? (
              <div className="mt-3 grid gap-3">
                {requests.map((request) => (
                  <div className="rounded-lg bg-slate-50 p-3" key={request.id}>
                    <p className="font-black text-slate-900">{request.requester?.display_name ?? "Unknown"}</p>
                    <p className="text-xs text-slate-500">{formatDateTimeJST(request.created_at)}</p>
                    <div className="mt-3 flex gap-2">
                      <form action={respondFriendAction}>
                        <input name="friendship_id" type="hidden" value={request.id} />
                        <input name="status" type="hidden" value="accepted" />
                        <button className="rounded-md bg-teal-700 px-3 py-2 text-xs font-black text-white" type="submit"><T textKey="accept" /></button>
                      </form>
                      <form action={respondFriendAction}>
                        <input name="friendship_id" type="hidden" value={request.id} />
                        <input name="status" type="hidden" value="rejected" />
                        <button className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600" type="submit"><T textKey="reject" /></button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600"><T textKey="noFriendRequests" /></p>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950"><T textKey="friends" /></h2>
            {friends.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {friends.map((friend) => (
                  <Link className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-800 ring-1 ring-teal-100" href={`/users/${friend.id}`} key={friend.id}>
                    {friend.display_name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600"><T textKey="noFriends" /></p>
            )}
          </section>
        </aside>
      </div>

      <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950"><T textKey="reviewsForYou" /></h2>
        {reviews.length ? (
          <div className="mt-4 grid gap-3">
            {reviews.map((review) => (
              <div className={`rounded-xl border p-4 ${review.is_visible ? "border-line bg-white" : "border-slate-200 bg-slate-50 opacity-70"}`} key={review.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{review.reviewer?.display_name ?? "Friend"}</p>
                    <p className="text-xs text-slate-500">
                      <T textKey={translatedSkillLevelKey(review.rating_skill)} /> / {formatDateTimeJST(review.created_at)}
                    </p>
                  </div>
                  {review.is_visible ? (
                    <form action={hideReviewAction}>
                      <input name="review_id" type="hidden" value={review.id} />
                      <button className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600" type="submit"><T textKey="hideReview" /></button>
                    </form>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-black text-slate-600"><T textKey="hidden" /></span>
                  )}
                </div>
                {review.comment ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comment}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600"><T textKey="noReviews" /></p>
        )}
      </section>
    </main>
  );
}

function Field({ labelKey, children }: { labelKey: TranslationKey; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      <T textKey={labelKey} />
      {children}
    </label>
  );
}
