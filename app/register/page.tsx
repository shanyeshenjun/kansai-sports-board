import Link from "next/link";
import type { ReactNode } from "react";
import { registerMemberAction } from "@/app/actions";
import { T } from "@/components/language-ui";
import { participantTitleOptions, translatedGenderKey, translatedSkillLevelKey, type TranslationKey } from "@/lib/i18n";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const titleOptions = [...participantTitleOptions.male, ...participantTitleOptions.female];
const genderValues = ["male", "female", "private"] as const;
const skillValues = [1, 2, 3, 4, 5] as const;

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <p className="text-xs font-black text-teal-700">Kansai Sports Board</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950"><T textKey="accountRegister" /></h1>
        <p className="mt-2 text-sm leading-6 text-slate-600"><T textKey="accountRegisterDescription" /></p>
        {query.error ? (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">
            <T textKey="operationFailed" />
          </p>
        ) : null}

        <form action={registerMemberAction} className="mt-5 grid gap-4">
          <Field labelKey="loginId">
            <input className="touch-target rounded-md border border-line px-3" name="login_id" required />
          </Field>
          <Field labelKey="password">
            <input className="touch-target rounded-md border border-line px-3" name="password" type="password" minLength={6} required />
          </Field>
          <Field labelKey="nickname">
            <input className="touch-target rounded-md border border-line px-3" name="display_name" required />
          </Field>
          <Field labelKey="gender">
            <select className="touch-target rounded-md border border-line px-3" name="gender" defaultValue="private">
              {genderValues.map((value) => (
                <option key={value} value={value}>
                  <T textKey={translatedGenderKey(value)} />
                </option>
              ))}
            </select>
          </Field>
          <Field labelKey="skillLevel">
            <select className="touch-target rounded-md border border-line px-3" name="skill_level" required defaultValue="">
              <option value=""><T textKey="selectSkillLevel" /></option>
              {skillValues.map((value) => (
                <option key={value} value={value}>
                  <T textKey={translatedSkillLevelKey(value)} />
                </option>
              ))}
            </select>
          </Field>
          <Field labelKey="title">
            <select className="touch-target rounded-md border border-line px-3" name="title" defaultValue="">
              <option value=""><T textKey="titleUnset" /></option>
              {titleOptions.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </Field>
          <Field labelKey="bio">
            <textarea className="min-h-28 rounded-md border border-line px-3 py-2" name="bio" />
          </Field>
          <label className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm font-bold text-slate-700">
            <input name="profile_public" type="checkbox" defaultChecked />
            <T textKey="profilePublic" />
          </label>
          <button className="touch-target rounded-md bg-teal-700 px-4 py-3 text-sm font-black text-white" type="submit">
            <T textKey="registerAndGoMyPage" />
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          <T textKey="alreadyHaveAccount" />{" "}
          <Link className="font-black text-teal-700" href="/login">
            <T textKey="login" />
          </Link>
        </p>
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
