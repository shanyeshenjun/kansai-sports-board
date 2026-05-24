# Kansai Sports Board / 関西スポーツ掲示板 / 关西运动活动板

関西でスポーツ活動を探す、申し込む、管理者が活動を登録するためのモバイル優先 Web App MVP です。第一段階は市場テスト用なので、オンライン決済、地図 API、SNS ログイン、チャット、AI 推薦などは入れていません。

## このプロジェクトでできること

- 首页で公開中のスポーツ活動を一覧表示
- 種目、エリア、日付、受付中のみで検索
- 活動詳細の確認
- アカウント登録なしで参加申し込み
- 満員、終了、キャンセルの活動は申し込み不可
- 管理画面で活動の作成、編集、キャンセル、ステータス変更
- 参加者一覧の確認
- 参加者一覧の CSV ダウンロード

## 対応している種目

- バドミントン / 羽毛球
- バスケットボール / 篮球
- 卓球 / 乒乓球
- バレーボール / 排球
- フットサル / 室内足球

## 対応しているエリア

- 大阪
- 京都
- 神戸
- 奈良
- 兵庫
- 関西その他

## 起動方法

PowerShell を開いて、以下を 1 行ずつ入力します。

```powershell
cd "C:\Users\PCUser\Documents\Codex\2026-05-24\mvp-1-next-js-typescript-2"
npm install
npm run dev
```

表示されたら、ブラウザで以下を開きます。

```text
http://localhost:3000
```

## よく使う URL

首頁：

```text
http://localhost:3000
```

管理画面：

```text
http://localhost:3000/admin
```

## 管理者ログイン

初期パスワード：

```text
change-me-local-admin
```

パスワードを変更したい場合は、プロジェクト直下に `.env.local` を作り、以下を書きます。

```text
ADMIN_PASSWORD=your-password
```

## データについて

現在は本地 mock データ版です。Supabase はまだ正式接続していません。

実行中のデータは以下に保存されます。

```text
.data/mock-store.json
```

このため、今は以下は不要です。

- Supabase の設定
- `DATABASE_URL`
- Prisma

## Supabase に接続する場合

将来 Supabase に接続する場合は、まず Supabase プロジェクトを作り、SQL Editor で以下を実行します。

```text
supabase/schema.sql
```

サンプルデータも入れる場合：

```text
supabase/seed.sql
```

その後 `.env.local` に以下を設定します。

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

現在のコードはまだ本地 mock store を使っています。Supabase に切り替える場合は、`lib/store.ts` の読み書き処理を Supabase クライアントに置き換えます。

## Vercel に公開する場合

1. GitHub にこのプロジェクトを push
2. Vercel で New Project を作成
3. Framework Preset は Next.js を選択
4. 必要なら Environment Variables に `ADMIN_PASSWORD` を設定
5. Deploy を押す

Vercel 上では、正式な Supabase 接続前の一時的な mock store としてメモリ上にデータを保存します。ページ表示、申し込み、管理画面の操作テストはできますが、サーバー再起動や再デプロイ後にデータは初期状態へ戻ることがあります。長期テストや実運用では Supabase 接続に切り替えてください。

本格公開する前に、Supabase 接続、利用規約、プライバシーポリシー、運用ルールを確認してください。

## チェックコマンド

```powershell
npm run lint
npm run build
```

## 第一段階で入れていない機能

- オンライン決済
- Google Maps
- LINE ログイン
- 微信ログイン
- Instagram 自動取得
- チャット
- AI 推薦
- ネイティブ App
