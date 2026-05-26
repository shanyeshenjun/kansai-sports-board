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

既存の Supabase project に第四段階の「活動の削除 / 非表示」を追加する場合は、デプロイ前に SQL Editor で以下を実行してください。

```text
supabase/20260527_add_event_soft_delete.sql
```

この migration は `events.deleted_at` を追加し、削除済み活動への申し込みを受け付けないよう `register_for_event` を更新します。申し込みデータは削除しません。

参加者の公開表示と性別人数統計を追加する場合は、デプロイ前に SQL Editor で以下を実行してください。

```text
supabase/20260527_add_public_registration_fields.sql
```

この migration は `registrations.display_name`、`registrations.gender`、`registrations.skill_level`、`registrations.is_public` を追加します。既存の申し込みは `is_public = false`、`gender = private`、`skill_level = null` のままなので、過去の参加者名が公開されることはありません。

申込者の自助キャンセル機能を追加する場合は、デプロイ前に SQL Editor で以下を実行してください。

```text
supabase/20260527_add_registration_cancellation.sql
```

この migration は `registrations.cancel_code`、`registrations.status`、`registrations.cancelled_at`、`registrations.cancellation_reason` を追加します。既存の申し込みは `status = active` になり、物理削除はされません。新しい申し込みでは、完了画面に `申込ID` と `キャンセルコード` が表示されます。

自助キャンセルは活動開始日前日の 13:00（JST）までです。期限後、または活動が `キャンセル` / `終了` の場合は、ユーザー自身ではキャンセルできません。管理者は后台で参加者状況を確認し、必要に応じて手動対応してください。

## Supabase 権限整理

現在のアプリは Next.js サーバー側だけが `SUPABASE_SERVICE_ROLE_KEY` を使って Supabase にアクセスします。ブラウザから直接 Supabase を操作しない構成です。

そのため、公開前には SQL Editor で以下を実行して、`anon` / `authenticated` からの直接アクセスを閉じることを推奨します。

```text
supabase/security.sql
```

この SQL は RLS を有効化し、`events` / `registrations` / `admin_users` への直接アクセスを外部クライアントから遮断します。アプリのサーバー処理は service role key を使うため、既存機能は維持されます。

実行後は必ず以下を確認してください。

- トップページで活動一覧が表示される
- 活動詳細ページが開ける
- 申し込みを送信でき、Supabase の `registrations` に保存される
- 管理画面にログインできる
- 活動の作成、編集、キャンセルができる
- 参加者一覧が表示される
- 参加者 CSV をダウンロードできる
- 活動詳細ページで、公開表示を選んだ参加者だけがニックネーム表示される

もし実行後に機能が止まった場合は、SQL Editor で以下を実行して一時的に元の広い権限状態へ戻せます。

```text
supabase/security-rollback.sql
```

rollback 後は、Vercel の `SUPABASE_SERVICE_ROLE_KEY` が正しく設定されているかを確認してください。

注意：将来ブラウザ側から Supabase を直接読む設計に変える場合は、`security.sql` 内の read-only policy を検討してください。

## テスト申し込みデータの整理

正式データを残したままテスト申し込みだけ削除したい場合は、Supabase Table Editor で削除したい `registrations.id` を確認し、SQL Editor で以下を使います。

```text
supabase/cleanup-test-registrations.sql
```

この SQL は、明示した registration id だけを削除し、関連する `events.current_participants` も調整します。誤削除を避けるため、名前や日付だけで一括削除する運用は推奨しません。

使う前に preview 結果を確認し、正式な申し込みが1件でも含まれている場合は delete section を実行しないでください。削除処理は transaction 内で動くため、確認結果が想定外なら `rollback;`、問題なければ `commit;` を実行します。

## データ保存の挙動

Supabase 環境変数が設定されている場合：

- 活動一覧は Supabase の `events` から取得
- 申し込みは Supabase の `registrations` に保存
- 公開参加者表示は `registrations.display_name` / `gender` / `skill_level` / `is_public` を使用
- 管理画面の作成、編集、キャンセルは Supabase の `events` を更新
- 管理画面の削除は `events.deleted_at` を更新するソフト削除
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
