# Kansai Sports Board / 関西スポーツ掲示板 / 关西运动活动板

関西でスポーツ活動を探す、申し込む、管理者が活動を登録するためのモバイル優先 Web App MVP です。第二段階では Supabase PostgreSQL に接続し、活動データと申し込みデータを永続化します。

## このプロジェクトでできること

- 首页で公開中のスポーツ活動を一覧表示
- 種目、エリア、日付、受付中のみで検索
- 活動詳細の確認
- アカウント登録なしで参加申し込み
- 満員、終了、キャンセルの活動は申し込み不可
- 管理画面で活動の作成、編集、キャンセル、ステータス変更
- 参加者一覧の確認
- 参加者一覧の CSV ダウンロード

## 起動方法

PowerShell を開いて、以下を 1 行ずつ入力します。

```powershell
cd "C:\Users\PCUser\Documents\Codex\2026-05-24\mvp-1-next-js-typescript-2"
npm install
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

管理画面：

```text
http://localhost:3000/admin
```

初期管理者パスワード：

```text
change-me-local-admin
```

## 環境変数

`.env.local` または Vercel Environment Variables に設定します。

```text
ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` はサーバー側だけで使います。ブラウザに表示したり、GitHub にコミットしたりしないでください。

`DATABASE_URL` は不要です。Prisma も使いません。

## Supabase セットアップ

1. Supabase で新しい project を作成
2. SQL Editor を開く
3. `supabase/schema.sql` を実行
4. サンプルデータを入れる場合は `supabase/seed.sql` を実行
5. Project Settings > API から URL / anon key / service role key を確認
6. Vercel に環境変数を設定して再デプロイ

作成される主なテーブル：

- `events`
- `registrations`
- `admin_users`（将来 Supabase Auth に拡張するための下準備）

また、申し込み人数を安全に更新するための PostgreSQL 関数 `register_for_event` も作成します。

## データ保存の挙動

Supabase 環境変数が設定されている場合：

- 活動一覧は Supabase の `events` から取得
- 申し込みは Supabase の `registrations` に保存
- 管理画面の作成、編集、キャンセルは Supabase の `events` を更新
- 参加者 CSV は Supabase の `registrations` から出力

Supabase 環境変数がない場合：

- ローカル開発用 fallback として `.data/mock-store.json` を使います
- Vercel で Supabase 未設定の場合は一時的なメモリ fallback になり、データは永続化されません

本番テストでは必ず Supabase 環境変数を設定してください。

## Vercel に公開する場合

1. GitHub にこのプロジェクトを push
2. Vercel で New Project を作成
3. GitHub repository を import
4. Framework Preset は Next.js
5. Environment Variables に以下を設定

```text
ADMIN_PASSWORD
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

6. Deploy を押す

既に Vercel に接続済みの場合は、GitHub に push すると自動で再デプロイされます。

## チェックコマンド

```powershell
npm run lint
npm run build
```

## 第一段階・第二段階でまだ入れていない機能

- オンライン決済
- Google Maps
- LINE ログイン
- 微信ログイン
- Instagram 自動取得
- チャット
- AI 推薦
- ネイティブ App
