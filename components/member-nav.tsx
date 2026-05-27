import Link from "next/link";
import { currentMember, memberLogoutAction } from "@/app/actions";

export async function MemberNav() {
  const member = await currentMember();

  if (!member) {
    return (
      <div className="flex items-center gap-2">
        <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-3 text-sm font-bold text-slate-700" href="/login">
          ログイン
        </Link>
        <Link className="touch-target hidden items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-bold text-white sm:inline-flex" href="/register">
          登録
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link className="touch-target inline-flex items-center justify-center rounded-md border border-line px-3 text-sm font-bold text-slate-700" href="/me">
        マイページ
      </Link>
      <form action={memberLogoutAction}>
        <button className="touch-target hidden items-center justify-center rounded-md border border-line px-3 text-sm font-bold text-slate-600 sm:inline-flex" type="submit">
          ログアウト
        </button>
      </form>
    </div>
  );
}
