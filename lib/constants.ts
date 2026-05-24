import type { Area, ContactType, EventLevel, EventStatus, SportType } from "@/lib/types";

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
  { value: "open", label: "受付中", color: "bg-teal-700 text-white", panel: "border-teal-200 bg-teal-50 text-teal-900" },
  { value: "full", label: "満員", color: "bg-amber-600 text-white", panel: "border-amber-200 bg-amber-50 text-amber-900" },
  { value: "finished", label: "終了", color: "bg-zinc-700 text-white", panel: "border-zinc-200 bg-zinc-100 text-zinc-700" },
  { value: "cancelled", label: "キャンセル", color: "bg-red-600 text-white", panel: "border-red-200 bg-red-50 text-red-800" }
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

export const sportName = (value: SportType) => sports.find((item) => item.value === value) ?? sports[0];
export const areaName = (value: Area) => areas.find((item) => item.value === value) ?? areas[0];
export const statusName = (value: EventStatus) => statuses.find((item) => item.value === value) ?? statuses[0];
export const levelName = (value: EventLevel) => levels.find((item) => item.value === value) ?? levels[0];
export const contactName = (value: ContactType) => contactTypes.find((item) => item.value === value) ?? contactTypes[0];
