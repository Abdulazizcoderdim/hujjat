type NullableObject = Record<string, any> | null;

export interface StudentResponse {
  success: boolean;
  error: string | null;
  code: number;
  data: StudentData;
}

export interface StudentData {
  first_name: string;
  second_name: string;
  third_name: string;
  full_name: string;
  short_name: string;
  university: string;
  universityOwnership: NullableObject;
  id: number;
  student_id_number: string;
  passport_pin: string;
  image: string;
  birth_date: number;
  email: string;
  group: NullableObject;
  faculty: NullableObject;
  educationLang: NullableObject;
  semester: NullableObject;
  specialty: NullableObject;
  level: NullableObject;
  educationForm: NullableObject;
  educationType: NullableObject;
  paymentForm: NullableObject;
  studentStatus: NullableObject;
  country: NullableObject;
  district: NullableObject;
  province: NullableObject;
  address: string;
  socialCategory: NullableObject;
  povertyLevel: NullableObject;
  accommodation: NullableObject;
  validateUrl: string;
  hash: string;
}
