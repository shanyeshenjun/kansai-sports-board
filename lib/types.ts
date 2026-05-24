export type SportType = "badminton" | "basketball" | "table_tennis" | "volleyball" | "futsal";
export type Area = "osaka" | "kyoto" | "kobe" | "nara" | "hyogo" | "kansai_other";
export type EventStatus = "open" | "full" | "finished" | "cancelled";
export type EventLevel = "beginner_welcome" | "beginner" | "intermediate" | "advanced" | "anyone";
export type ContactType = "wechat" | "line" | "instagram" | "email" | "phone";

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
  created_at: string;
  updated_at: string;
};

export type Registration = {
  id: string;
  event_id: string;
  participant_name: string;
  contact: string;
  number_of_people: number;
  note: string;
  created_at: string;
};
