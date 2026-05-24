insert into public.events (
  title, sport_type, area, venue_name, address, start_datetime, end_datetime, fee,
  max_participants, current_participants, level, organizer_name, organizer_contact_type,
  organizer_contact_value, description, notes, status
) values
(
  '大阪・梅田 平日夜バドミントン交流', 'badminton', 'osaka', '大阪市立北スポーツセンター',
  '大阪府大阪市北区中津3-4-27', '2026-06-06T19:00:00+09:00', '2026-06-06T21:00:00+09:00',
  800, 18, 9, 'beginner_welcome', 'Kansai Shuttle', 'line', 'kansai-shuttle',
  '初心者と経験者が混ざってダブルス中心に回します。', '室内シューズを持参してください。', 'open'
),
(
  '天王寺エリア 3x3 & 軽めゲーム会', 'basketball', 'osaka', '天王寺スポーツセンター',
  '大阪府大阪市天王寺区真田山町5-109', '2026-06-08T18:30:00+09:00', '2026-06-08T20:30:00+09:00',
  1000, 15, 15, 'anyone', 'Tennoji Hoops', 'wechat', 'tennoji-hoops',
  '社会人中心の気軽なバスケ会です。', '満員の場合はキャンセル待ちになります。', 'full'
),
(
  '難波 卓球フリー練習', 'table_tennis', 'osaka', 'なんば卓球ラウンジ',
  '大阪府大阪市浪速区難波中2-6-12', '2026-06-12T20:00:00+09:00', '2026-06-12T22:00:00+09:00',
  1200, 12, 4, 'beginner', 'Namba Ping', 'instagram', '@namba_ping',
  'ラリー練習、サーブ練習、軽い試合を自由に行う会です。', 'ラケット持参推奨。', 'open'
),
(
  '神戸三宮 男女ミックスバレー', 'volleyball', 'kobe', '中央体育館',
  '兵庫県神戸市中央区楠町4-1-1', '2026-06-15T17:30:00+09:00', '2026-06-15T20:30:00+09:00',
  700, 24, 16, 'intermediate', 'Kobe Mix Volley', 'email', 'kobe-volley@example.com',
  '男女ミックスで6人制ゲームを行います。', 'ネット設営にご協力ください。', 'open'
),
(
  '京都駅近く エンジョイフットサル', 'futsal', 'kyoto', 'フットサルスクエア京都南',
  '京都府京都市南区東九条下殿田町70', '2026-06-18T19:30:00+09:00', '2026-06-18T21:30:00+09:00',
  1500, 20, 11, 'anyone', 'Kyoto Futsal Friends', 'line', 'kyoto-futsal',
  '勝ち負けよりも楽しく蹴ることを大切にしたフットサル会です。', 'フットサルシューズをご用意ください。', 'open'
);
