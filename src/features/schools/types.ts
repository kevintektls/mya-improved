interface SchoolMetadata {
  id: number;
  name: string;
  country: string;
  gpa: number;
  spots: number;
  diploma: string;
  language: string;
  extracharge: number;
  erasmus: string;
  semester: string;
  display: string;
  specializations: string[];
}

export interface SchoolRecord extends SchoolMetadata {
  coverImage: string | null;
}

export interface SchoolDetailRecord extends SchoolMetadata {
  overview: string;
  administrative: string;
  accomodation: string;
  courses: string;
  cost: string;
  image1?: string;
  image2?: string;
  image3?: string;
  images: string[];
  sourceImages: string[];
  updatedAt: string;
}

export interface SchoolDirectoryData {
  schools?: SchoolRecord[];
}

export type FavoritePriority = 'low' | 'medium' | 'high';

export interface FavoriteDetails {
  priority: FavoritePriority;
  note: string;
}

export interface PlanningPreferences {
  studentGpa: number | null;
  maxExtraCharge: number | null;
  specializations: string[];
  semesters: string[];
  languages: string[];
}

export interface ChecklistTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface StudentWorkspace {
  version: 1;
  savedSchoolIds: number[];
  comparedSchoolIds: number[];
  favoriteDetails: Record<number, FavoriteDetails>;
  preferences: PlanningPreferences;
  checklists: Record<number, ChecklistTask[]>;
}
