import Link from "next/link";
import { notFound } from "next/navigation";
import { createReviewAction, currentMember, requestFriendAction } from "@/app/actions";
import { genderName, skillLevelName, skillLevels } from "@/lib/constants";
import { formatDateTimeJST, getFriendshipBetween, getPublicMember, listProfileReviews } from "@/lib/store";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PublicUserPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const [profile, member] = await Promise.all([getPublicMember(id), currentMember()]);
  if (!profile) notFound();

  const isOwner = member?.id === profile.id;
  const friendship = member && !isOwner ? await getFriendshipBetween(member.id, profile.id) : null;
  const reviews = profile.profile_public || isOwner ? await listProfileReviews(profile.id) : [];
  const canReview = friendship?.status === "accepted";

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6">
      <Link className="inline-flex rounded-full bg-white px-3 py-1.5 text-sm font-bold text-teal-700 shadow-sm ring-1 ring-line" href="/">
        活動一覧へ
      </Link>

      {!profile.profile_public && !isOwner ? (
        <section className="mt-5 rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-black text-slate-950">このプロフィールは非公開です。</h1>
          <p className="mt-2 text-sm text-slate-600">ユーザー本人がプロフィール公開をオフにしています。</p>
        </section>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-sky-100 text-2xl font-black text-teal-800">
                {profile.display_name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-teal-700">{profile.title || "Kansai Sports Member"}</p>
                <h1 className="truncate text-2xl font-black text-slate-950">{profile.display_name}</h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{genderName(profile.gender)}</span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{skillLevelName(profile.skill_level)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <h2 className="font-black text-slate-950">自己紹介</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{profile.bio || "自己紹介はまだありません。"}</p>
            </div>

            {query.error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{String(query.error)}</p> : null}
            {query.friend ? <p className="mt-4 rounded-md bg-teal-50 p-3 text-sm font-bold text-teal-800">友達申請を送信しました。</p> : null}
            {query.review ? <p className="mt-4 rounded-md bg-teal-50 p-3 text-sm font-bold text-teal-800">評価を送信しました。</p> : null}
          </section>

          <aside className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:self-start">
            <h2 className="font-black text-slate-950">つながり</h2>
            {!member ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                友達申請や評価にはログインが必要です。{" "}
                <Link className="font-black text-teal-700" href="/login">
                  ログイン
                </Link>
              </p>
            ) : isOwner ? (
              <Link className="touch-target mt-3 flex items-center justify-center rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" href="/me">
                マイページを編集
              </Link>
            ) : friendship?.status === "accepted" ? (
              <p className="mt-3 rounded-md bg-teal-50 p-3 text-sm font-bold text-teal-800">友達です。</p>
            ) : friendship?.status === "pending" ? (
              <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm font-bold text-amber-800">友達申請中です。</p>
            ) : (
              <form action={requestFriendAction} className="mt-3">
                <input name="target_id" type="hidden" value={profile.id} />
                <button className="touch-target w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
                  友達申請を送る
                </button>
              </form>
            )}
          </aside>
        </div>
      )}

      {(profile.profile_public || isOwner) && (
        <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">友達からの評価</h2>
          {reviews.length ? (
            <div className="mt-4 grid gap-3">
              {reviews.map((review) => (
                <div className="rounded-xl border border-line bg-white p-4" key={review.id}>
                  <p className="font-black text-slate-900">{review.reviewer?.display_name ?? "友達"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {review.rating_skill ? skillLevelName(review.rating_skill) : "レベル評価なし"} / {formatDateTimeJST(review.created_at)}
                  </p>
                  {review.comment ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comment}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">公開されている評価はまだありません。</p>
          )}

          {canReview ? (
            <form action={createReviewAction} className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4">
              <input name="target_id" type="hidden" value={profile.id} />
              <h3 className="font-black text-slate-950">評価を書く</h3>
              <select className="touch-target rounded-md border border-line px-3 text-sm font-bold" name="rating_skill" defaultValue="">
                <option value="">レベル評価なし</option>
                {skillLevels.map((skill) => (
                  <option key={skill.value} value={skill.value}>
                    {skill.label}
                  </option>
                ))}
              </select>
              <textarea className="min-h-24 rounded-md border border-line px-3 py-2 text-sm" name="comment" placeholder="一緒にプレーした印象を短く書けます。" />
              <button className="touch-target rounded-md bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">
                評価を送信
              </button>
            </form>
          ) : null}
        </section>
      )}
    </main>
  );
}
