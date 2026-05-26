"use client";

import { useEffect, useState } from "react";
import { genders, skillLevels } from "@/lib/constants";

const storageKey = "ksb_registration_public_profile";

type StoredProfile = {
  display_name?: string;
  gender?: string;
  skill_level?: string;
  is_public?: string;
};

export function RegistrationPublicFields() {
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("private");
  const [skillLevel, setSkillLevel] = useState("");
  const [isPublic, setIsPublic] = useState("false");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
      const profile = JSON.parse(stored) as StoredProfile;
      setDisplayName(profile.display_name ?? "");
      setGender(profile.gender === "male" || profile.gender === "female" ? profile.gender : "private");
      setSkillLevel(["1", "2", "3", "4", "5"].includes(profile.skill_level ?? "") ? profile.skill_level ?? "" : "");
      setIsPublic(profile.is_public === "true" ? "true" : "false");
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ display_name: displayName, gender, skill_level: skillLevel, is_public: isPublic }));
  }, [displayName, gender, skillLevel, isPublic]);

  return (
    <div className="grid gap-3">
      <input
        className="touch-target rounded-md border border-line px-3"
        name="display_name"
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="表示用ニックネーム（公開する場合は必須）"
        value={displayName}
      />
      <select className="touch-target rounded-md border border-line px-3 text-sm font-bold" name="gender" onChange={(event) => setGender(event.target.value)} value={gender}>
        {genders.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <select className="touch-target rounded-md border border-line px-3 text-sm font-bold" name="skill_level" onChange={(event) => setSkillLevel(event.target.value)} required value={skillLevel}>
        <option value="">レベルを選択してください</option>
        {skillLevels.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <select className="touch-target rounded-md border border-line px-3 text-sm font-bold" name="is_public" onChange={(event) => setIsPublic(event.target.value)} value={isPublic}>
        <option value="false">公開しない</option>
        <option value="true">公開する</option>
      </select>
    </div>
  );
}
