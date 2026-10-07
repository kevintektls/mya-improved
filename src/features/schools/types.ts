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
  updatedAt: string;
}

export interface SchoolDirectoryData {
  schools?: SchoolRecord[];
}
