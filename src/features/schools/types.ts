export interface SchoolRecord {
  id: number;
  name: string;
  country: string;
  gpa: number;
  spots: number;
  diploma: string;
  language: string;
  extracharge: number;
  overview: string;
  administrative: string;
  accomodation: string;
  courses: string;
  cost: string;
  image1?: string;
  image2?: string;
  image3?: string;
  images?: string[];
  erasmus: string;
  semester: string;
  display: string;
  updatedAt: string;
  specializations: string[];
}

export interface SchoolDirectoryData {
  schools?: SchoolRecord[];
}
