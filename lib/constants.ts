import type { Area, ContactType, EventLevel, EventStatus, Gender, RegistrationStatus, SkillLevel, SportType } from "@/lib/types";

export const sports: Array<{ value: SportType; label: string; zh: string; color: string; border: string }> = [
  { value: "badminton", label: "バドミントン", zh: "羽毛球", color: "bg-emerald-100 text-emerald-800", border: "border-l-emerald-500" },
  { value: "basketball", label: "バスケットボール", zh: "篮球", color: "bg-orange-100 text-orange-800", border: "border-l-orange-500" },
  { value: "table_tennis", label: "卓球", zh: "乒乓球", color: "bg-sky-100 text-sky-800", border: "border-l-sky-500" },
  { value: "volleyball", label: "バレーボール", zh: "排球", color: "bg-rose-100 text-rose-800", border: "border-l-rose-500" },
  { value: "futsal", label: "フットサル", zh: "室内足球", color: "bg-lime-100 text-lime-800", border: "border-l-lime-500" }
];

export const areas: Array<{ value: Area; label: string; zh: string }> = [
  { value: "osaka", label: "大阪", zh: "大阪" },
  { value: "kyoto", label: "京都", zh: "京都" },
  { value: "kobe", label: "神戸", zh: "神户" },
  { value: "nara", label: "奈良", zh: "奈良" },
  { value: "hyogo", label: "兵庫", zh: "兵库" },
  { value: "kansai_other", label: "関西その他", zh: "关西其他地区" }
];

export const statuses: Array<{ value: EventStatus; label: string; color: string; panel: string }> = [
  { value: "open", label: "受付中", color: "bg-teal-100 text-teal-800 ring-1 ring-teal-200", panel: "border-teal-200 bg-teal-50 text-teal-900" },
  { value: "full", label: "満員", color: "bg-amber-100 text-amber-800 ring-1 ring-amber-200", panel: "border-amber-200 bg-amber-50 text-amber-900" },
  { value: "finished", label: "終了", color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200", panel: "border-slate-200 bg-slate-50 text-slate-600" },
  { value: "cancelled", label: "キャンセル", color: "bg-red-100 text-red-700 ring-1 ring-red-200", panel: "border-red-200 bg-red-50 text-red-800" }
];

export const levels: Array<{ value: EventLevel; label: string }> = [
  { value: "beginner_welcome", label: "初心者歓迎" },
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "上級" },
  { value: "anyone", label: "誰でもOK" }
];

export const contactTypes: Array<{ value: ContactType; label: string }> = [
  { value: "wechat", label: "微信" },
  { value: "line", label: "LINE" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "メール" },
  { value: "phone", label: "電話" }
];

export const genders: Array<{ value: Gender; label: string }> = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "private", label: "非公開" }
];

export const skillLevels: Array<{ value: SkillLevel; label: string }> = [
  { value: 1, label: "Lv.1 初心者" },
  { value: 2, label: "Lv.2 初級" },
  { value: 3, label: "Lv.3 中級" },
  { value: 4, label: "Lv.4 中上級" },
  { value: 5, label: "Lv.5 上級" }
];

export const registrationStatuses: Array<{ value: RegistrationStatus; label: string }> = [
  { value: "active", label: "有効" },
  { value: "cancelled", label: "キャンセル済み" }
];

export const venueOptions = [
  "西SC（阿波座）スポーツセンター",
  "城東スポーツセンター",
  "西成スポーツセンター",
  "港区スポーツセンター",
  "天王寺スポーツセンター",
  "扇町スポーツセンター",
  "阿倍野SCスポーツセンター",
  "東成スポーツセンター",
  "浪速スポーツセンター",
  "東淀川スポーツセンター"
] as const;

export const venueShortNames: Record<string, string> = {
  "西SC（阿波座）スポーツセンター": "西SC",
  "城東スポーツセンター": "城東",
  "西成スポーツセンター": "西成",
  "港区スポーツセンター": "港区",
  "天王寺スポーツセンター": "天王寺",
  "扇町スポーツセンター": "扇町",
  "阿倍野SCスポーツセンター": "阿倍野",
  "東成スポーツセンター": "東成",
  "浪速スポーツセンター": "浪速",
  "東淀川スポーツセンター": "東淀川"
};

export const venueMapQueries: Record<string, string> = {
  "西SC（阿波座）スポーツセンター": "西スポーツセンター 阿波座 大阪",
  "城東スポーツセンター": "城東スポーツセンター 大阪",
  "西成スポーツセンター": "西成スポーツセンター 大阪",
  "港区スポーツセンター": "港区スポーツセンター 大阪",
  "天王寺スポーツセンター": "天王寺スポーツセンター 大阪",
  "扇町スポーツセンター": "扇町スポーツセンター 大阪",
  "阿倍野SCスポーツセンター": "阿倍野スポーツセンター 大阪",
  "東成スポーツセンター": "東成スポーツセンター 大阪",
  "浪速スポーツセンター": "浪速スポーツセンター 大阪",
  "東淀川スポーツセンター": "東淀川スポーツセンター 大阪"
};

export const timeSlotOptions = [
  { value: "09:00-12:00", label: "09:00 - 12:00", start: "09:00", end: "12:00" },
  { value: "12:00-15:00", label: "12:00 - 15:00", start: "12:00", end: "15:00" },
  { value: "15:00-18:00", label: "15:00 - 18:00", start: "15:00", end: "18:00" },
  { value: "18:00-21:00", label: "18:00 - 21:00", start: "18:00", end: "21:00" }
] as const;

export const sportName = (value: SportType) => sports.find((item) => item.value === value) ?? sports[0];
export const areaName = (value: Area) => areas.find((item) => item.value === value) ?? areas[0];
export const statusName = (value: EventStatus) => statuses.find((item) => item.value === value) ?? statuses[0];
export const levelName = (value: EventLevel) => levels.find((item) => item.value === value) ?? levels[0];
export const contactName = (value: ContactType) => contactTypes.find((item) => item.value === value) ?? contactTypes[0];
export const genderName = (value?: string | null) => genders.find((item) => item.value === value)?.label ?? "非公開";
export const skillLevelName = (value?: number | null) => skillLevels.find((item) => item.value === value)?.label ?? "未設定";
export const registrationStatusName = (value?: string | null) => registrationStatuses.find((item) => item.value === value)?.label ?? "有効";
export const venueShortName = (value: string) => {
  if (venueShortNames[value]) return venueShortNames[value];
  const fallback = value.replace(/スポーツセンター/g, "").slice(0, 4);
  return fallback || "その他";
};
export const venueMapUrl = (venueName: string, address?: string) => {
  const query = venueMapQueries[venueName] ?? [venueName, address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || venueName)}`;
};
