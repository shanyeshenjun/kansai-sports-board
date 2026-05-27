import Link from "next/link";
import { hideReviewAction, memberLogoutAction, requireMember, respondFriendAction, updateMyProfileAction } from "@/app/actions";
import { genders, skillLevelName, skillLevels } from "@/lib/constants";
import { participantTitleOptions } from "@/lib/i18n";
import { formatDateTimeJST, listFriendRequests, listFriends, listProfileReviews } from "@/lib/store";
import type { ReactNode } from "react";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const titleOptions = [...participantTitleOptions.male, ...participantTitleOptions.female];

export default async function MePage({ searchParams }: { searchParams: SearchParams }) {
  const member = await requireMember();
  const query = await searchParams;
  const [requests, friends, reviews] = await Promise.all([listFriendRequests(member.id), listFriends(member.id), listProfileReviews(member.id, { includeHidden: true })]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-teal-700">My Page</p>
          <h1 className="text-2xl font-black text-slate-950">マイページ</h1>
          <p className="mt-1 text-sm text-slate-600">プロフィール、友達申請、評価を管理できます。</p>
        </div>
        <div className="flex gap-2">
          <Link className="touch-target inline-flex items-center rounded-md border border-line px-4 text-sm font-bold" href={`/users/${member.id}`}>
            公開ページを見る
          </Link>
          <form action={memberLogoutAction}>
            <button className="touch-target rounded-md border border-line px-4 text-sm font-bold text-slate-600" type="submit">
              ログアウト
            </button>
          </form>
        </div>
      </div>

      {query.updated ? <p className="mt-4 rounded-md bg-teal-50 p-3 text-sm font-bold text-teal-800">プロフィールを更新しました。</p> : null}
      {query.error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{String(query.error)}</p> : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">プロフィール編集</h2>
          <form action={updateMyProfileAction} className="mt-4 grid gap-4">
            <Field label="ニックネーム">
              <input className="touch-target rounded-md border border-line px-3" name="display_name" defaultValue={member.display_name} required />
            </Field>
            <Field label="性別">
              <select className="touch-target rounded-md border border-line px-3" name="gender" defaultValue={member.gender ?? "private"}>
                {genders.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="自評レベル">
              <select className="touch-target rounded-md border border-line px-3" name="skill_level" defaultValue={member.skill_level ?? ""} required>
                <option value="">選択してください</option>
                {skillLevels.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="称号">
              <select className="touch-target rounded-md border border-line px-3" name="title" defaultValue={member.title ?? ""}>
                <option value="">未設定</option>
                {titleOptions.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="自己紹介">
              <textarea className="min-h-28 rounded-md border border-line px-3 py-2" name="bio" defaultValue={member.bio ?? ""} />
            </Field>
            <label className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-700">
              <input name="profile_public" type="checkbox" defaultChecked={member.profile_public} />
              プロフィールを公開する
            </label>
            <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
              保存する
            </button>
          </form>
        </section>

        <aside className="grid gap-5">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">友達申請</h2>
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
                        <button className="rounded-md bg-teal-700 px-3 py-2 text-xs font-black text-white" type="submit">
                          承認
                        </button>
                      </form>
                      <form action={respondFriendAction}>
                        <input name="friendship_id" type="hidden" value={request.id} />
                        <input name="status" type="hidden" value="rejected" />
                        <button className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600" type="submit">
                          拒否
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">届いている友達申請はありません。</p>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="font-black text-slate-950">友達一覧</h2>
            {friends.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {friends.map((friend) => (
                  <Link className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-800 ring-1 ring-teal-100" href={`/users/${friend.id}`} key={friend.id}>
                    {friend.display_name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">まだ友達はいません。</p>
            )}
          </section>
        </aside>
      </div>

      <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">あなたへの評価</h2>
        {reviews.length ? (
          <div className="mt-4 grid gap-3">
            {reviews.map((review) => (
              <div className={`rounded-xl border p-4 ${review.is_visible ? "border-line bg-white" : "border-slate-200 bg-slate-50 opacity-70"}`} key={review.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{review.reviewer?.display_name ?? "友達"}</p>
                    <p className="text-xs text-slate-500">
                      {review.rating_skill ? skillLevelName(review.rating_skill) : "レベル評価なし"} / {formatDateTimeJST(review.created_at)}
                    </p>
                  </div>
                  {review.is_visible ? (
                    <form action={hideReviewAction}>
                      <input name="review_id" type="hidden" value={review.id} />
                      <button className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600" type="submit">
                        非表示にする
                      </button>
                    </form>
                  ) : (
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-black text-slate-600">非表示</span>
                  )}
                </div>
                {review.comment ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comment}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">まだ評価はありません。</p>
        )}
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      {children}
    </label>
  );
}
