import Link from "next/link";
import { T } from "@/components/language-ui";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-black">
        <T textKey="pageNotFound" />
      </h1>
      <Link className="mt-4 inline-block rounded-md bg-teal-700 px-4 py-3 text-sm font-bold text-white" href="/">
        <T textKey="backToHome" />
      </Link>
    </main>
  );
}
