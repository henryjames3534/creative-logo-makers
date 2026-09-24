export type DesignerLevel = "top" | "mid" | "entry";

export type DesignerProfile = {
  id: string;
  name: string;
  handle: string;
  specialty: string;
  location: string;
  country: string;
  countryCode: string;
  level: DesignerLevel;
  rating: number;
  reviews: number;
  projects: number;
  skills: string[];
  industries: string[];
  languages: string[];
  rate: string;
  available: boolean;
  online: boolean;
  image: string;
  avatar: string;
  samples: string[];
  sampleAlts?: string[];
  profileId?: string;
  bio: string;
};
