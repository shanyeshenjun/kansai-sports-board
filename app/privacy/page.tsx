export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <article className="rounded-lg border border-line bg-white p-5">
        <h1 className="text-2xl font-black">プライバシーポリシー</h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          本サービスでは、参加申し込みのために名前またはニックネーム、連絡先、参加人数、備考を取得します。
        </p>
        <h2 className="mt-6 font-black">利用目的</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          取得した情報は、主催者による参加確認、活動運営、問い合わせ対応のために利用します。
        </p>
        <h2 className="mt-6 font-black">第三者提供</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          法令に基づく場合を除き、取得した情報を目的外に第三者へ提供しません。
        </p>
        <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          このページはMVP用のテンプレートです。正式公開前に法律専門家による確認が必要です。
        </p>
      </article>
    </main>
  );
}
