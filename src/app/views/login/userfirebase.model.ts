export interface UserFirebase {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  password: string;
  jobTitle: string;
  birthDate: string;
  permissions: {
    employee: boolean;
    administrative: boolean;
    driver: boolean;
  };
}
