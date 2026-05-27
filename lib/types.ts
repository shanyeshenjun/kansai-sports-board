export type SportType = "badminton" | "basketball" | "table_tennis" | "volleyball" | "futsal";
export type Area = "osaka" | "kyoto" | "kobe" | "nara" | "hyogo" | "kansai_other";
export type EventStatus = "open" | "full" | "finished" | "cancelled";
export type EventLevel = "beginner_welcome" | "beginner" | "intermediate" | "advanced" | "anyone";
export type ContactType = "wechat" | "line" | "instagram" | "email" | "phone";
export type Gender = "male" | "female" | "private";
export type SkillLevel = 1 | 2 | 3 | 4 | 5;
export type RegistrationStatus = "active" | "cancelled";
export type OrganizerStatus = "active" | "disabled";

export type Event = {
  id: string;
  title: string;
  sport_type: SportType;
  area: Area;
  venue_name: string;
  address: string;
  start_datetime: string;
  end_datetime: string;
  fee: number;
  max_participants: number;
  current_participants: number;
  level: EventLevel;
  organizer_name: string;
  organizer_contact_type: ContactType;
  organizer_contact_value: string;
  description: string;
  notes: string;
  status: EventStatus;
  organizer_id?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type Organizer = {
  id: string;
  login_id: string;
  display_name: string;
  password_hash: string;
  status: OrganizerStatus;
  created_at: string;
  last_login_at?: string | null;
  admin_note?: string | null;
};

export type Registration = {
  id: string;
  event_id: string;
  participant_name: string;
  contact: string;
  number_of_people: number;
  note: string;
  display_name?: string | null;
  gender?: Gender | null;
  skill_level?: SkillLevel | null;
  is_public?: boolean | null;
  cancel_code?: string | null;
  status?: RegistrationStatus | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
};
