export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <article className="rounded-lg border border-line bg-white p-5">
        <h1 className="text-2xl font-black">利用規約</h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          本サービスは、関西地域のスポーツ活動情報を主催者が手動で掲載し、参加希望者が申し込みできる掲示板型サービスです。
        </p>
        <h2 className="mt-6 font-black">注意事項</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          活動内容、参加条件、費用、開催可否は各主催者が管理します。参加者は申し込み後、主催者の連絡先を通じて最終的な参加方法を確認してください。
        </p>
        <h2 className="mt-6 font-black">禁止事項</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          虚偽情報の投稿、迷惑行為、無断転載、法令または公序良俗に反する利用を禁止します。
        </p>
        <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          このページはMVP用のテンプレートです。正式公開前に法律専門家による確認が必要です。
        </p>
      </article>
    </main>
  );
}
