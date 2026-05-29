export type SportType = "badminton" | "basketball" | "table_tennis" | "volleyball" | "futsal";
export type Area = "osaka" | "kyoto" | "kobe" | "nara" | "hyogo" | "kansai_other";
export type EventStatus = "open" | "full" | "finished" | "cancelled";
export type EventLevel = "beginner_welcome" | "beginner" | "intermediate" | "advanced" | "anyone";
export type ContactType = "wechat" | "line" | "instagram" | "email" | "phone";
export type Gender = "male" | "female" | "private";
export type SkillLevel = 1 | 2 | 3 | 4 | 5;
export type RegistrationStatus = "active" | "cancelled";
export type OrganizerStatus = "active" | "disabled";
export type FriendshipStatus = "pending" | "accepted" | "rejected";
export type MemberStatus = "active" | "disabled";
export type RelationshipType = "sports_partner" | "best_doubles_partner" | "brothers" | "besties" | "couple";
export type RelationshipStatus = "pending" | "accepted" | "rejected" | "ended";

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
  member_id?: string | null;
  created_at: string;
};

export type MemberProfile = {
  id: string;
  login_id: string;
  password_hash: string;
  display_name: string;
  gender: Gender;
  skill_level: SkillLevel | null;
  bio?: string | null;
  title?: string | null;
  profile_public: boolean;
  status?: MemberStatus | null;
  created_at: string;
  last_login_at?: string | null;
};

export type PublicMemberProfile = Omit<MemberProfile, "login_id" | "password_hash">;

export type Friendship = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
  responded_at?: string | null;
};

export type ProfileReview = {
  id: string;
  reviewer_id: string;
  target_id: string;
  rating_skill?: SkillLevel | null;
  comment?: string | null;
  is_visible: boolean;
  hidden_by_member?: boolean | null;
  hidden_by_admin?: boolean | null;
  created_at: string;
  reviewer?: Pick<PublicMemberProfile, "id" | "display_name" | "title"> | null;
};

export type MemberRelationship = {
  id: string;
  requester_id: string;
  receiver_id: string;
  relationship_type: RelationshipType;
  status: RelationshipStatus;
  requester_public: boolean;
  receiver_public: boolean;
  created_at: string;
  accepted_at?: string | null;
  ended_at?: string | null;
  requester?: Pick<PublicMemberProfile, "id" | "display_name" | "title"> | null;
  receiver?: Pick<PublicMemberProfile, "id" | "display_name" | "title"> | null;
  other?: Pick<PublicMemberProfile, "id" | "display_name" | "title"> | null;
  co_registration_count?: number;
  co_registration_badge?: string;
};
