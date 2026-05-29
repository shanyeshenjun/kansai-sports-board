import Link from "next/link";
import { notFound } from "next/navigation";
import { changeMemberStatusAction, hideMemberProfileAction, hideReviewByAdminAction, requireAdmin } from "@/app/actions";
import { genderName, skillLevelName } from "@/lib/constants";
import { formatDateTimeJST, getAdminMemberDetail } from "@/lib/store";
import type { ReactNode } from "react";

type Params = Promise<{ id: string }>;

export default async function AdminMemberDetailPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;
  const detail = await getAdminMemberDetail(id);
  if (!detail) notFound();
  const { member, friends, reviews } = detail;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <Link className="inline-flex rounded-full bg-white px-3 py-1.5 text-sm font-bold text-teal-700 shadow-sm ring-1 ring-line" href="/admin/members">
        会員管理へ戻る
      </Link>

      <section className="mt-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black text-sky-700">Member detail</p>
            <h1 className="text-2xl font-black text-slate-950">{member.display_name}</h1>
            <p className="mt-1 font-mono text-xs text-slate-500">login_id: {member.login_id}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{genderName(member.gender)}</Badge>
              <Badge>{skillLevelName(member.skill_level)}</Badge>
              <Badge>{member.title || "称号なし"}</Badge>
              <Badge>{member.profile_public ? "プロフィール公開" : "プロフィール非公開"}</Badge>
              <Badge>{member.status === "disabled" ? "disabled" : "active"}</Badge>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-[480px]">
            <form action={changeMemberStatusAction}>
              <input name="member_id" type="hidden" value={member.id} />
              <input name="status" type="hidden" value={member.status === "disabled" ? "active" : "disabled"} />
              <button className="touch-target w-full rounded-md border border-line px-4 py-2 text-sm font-black" type="submit">
                {member.status === "disabled" ? "有効にする" : "無効にする"}
              </button>
            </form>
            <form action={hideMemberProfileAction}>
              <input name="member_id" type="hidden" value={member.id} />
              <button className="touch-target w-full rounded-md border border-amber-200 px-4 py-2 text-sm font-black text-amber-700 disabled:bg-slate-100 disabled:text-slate-400" type="submit" disabled={!member.profile_public}>
                プロフィールを非公開
              </button>
            </form>
            <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-4 py-2 text-sm font-black" href={`/users/${member.id}`}>
              公開ページ
            </Link>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="登録日時" value={formatDateTimeJST(member.created_at)} />
          <Info label="最終ログイン" value={member.last_login_at ? formatDateTimeJST(member.last_login_at) : "-"} />
          <Info label="友達数" value={`${member.friend_count}`} />
          <Info label="受け取った評価" value={`${member.review_count}`} />
        </dl>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <h2 className="font-black text-slate-950">自己紹介</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{member.bio || "未入力"}</p>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">友達一覧</h2>
        {friends.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {friends.map((friend) => (
              <Link className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-800 ring-1 ring-teal-100" href={`/admin/members/${friend.id}`} key={friend.id}>
                {friend.display_name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">友達はいません。</p>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">受け取った評価</h2>
        {reviews.length ? (
          <div className="mt-4 grid gap-3">
            {reviews.map((review) => (
              <article className={`rounded-xl border p-4 ${review.is_visible ? "border-line bg-white" : "border-slate-200 bg-slate-50 opacity-70"}`} key={review.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{review.reviewer?.display_name ?? "友達"}</p>
                    <p className="text-xs text-slate-500">
                      {review.rating_skill ? skillLevelName(review.rating_skill) : "レベル評価なし"} / {formatDateTimeJST(review.created_at)}
                    </p>
                  </div>
                  {review.is_visible ? (
                    <form action={hideReviewByAdminAction}>
                      <input name="member_id" type="hidden" value={member.id} />
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
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">評価はありません。</p>
        )}
      </section>
    </main>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{children}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <dt className="text-xs font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 font-black text-slate-900">{value}</dd>
    </div>
  );
}
