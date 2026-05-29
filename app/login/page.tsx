import Link from "next/link";
import { memberLoginAction } from "@/app/actions";
import { T } from "@/components/language-ui";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-10">
      <form action={memberLoginAction} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <p className="text-xs font-black text-teal-700">Kansai Sports Board</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950"><T textKey="login" /></h1>
        <p className="mt-2 text-sm leading-6 text-slate-600"><T textKey="loginDescription" /></p>
        {query.error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700"><T textKey="loginFailed" /></p> : null}
        <input className="touch-target mt-5 w-full rounded-md border border-line px-3" name="login_id" placeholder="Login ID" required />
        <input className="touch-target mt-3 w-full rounded-md border border-line px-3" name="password" placeholder="Password" type="password" required />
        <button className="touch-target mt-4 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
          <T textKey="login" />
        </button>
        <p className="mt-4 text-sm text-slate-600">
          <T textKey="firstTimeUser" />{" "}
          <Link className="font-black text-teal-700" href="/register">
            <T textKey="newUserRegister" />
          </Link>
        </p>
      </form>
    </main>
  );
}
