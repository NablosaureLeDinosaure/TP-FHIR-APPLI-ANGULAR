export type Gender = 'male' | 'female' | 'other' | 'unknown';
export type ContactSystem = 'phone' | 'email';

export interface PractitionerFormValue {
  id?: string;
  family: string;
  given: string;
  birthDate: string;
  gender: Gender;
  idmed: string;
  rpps: string;
  telecomSystem: ContactSystem;
  telecomValue: string;
  addressLine?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  gradeCode: string;
  gradeDisplay: string;
  qualificationId: string;
  qualificationStart: string;
  language: string;
  photoUrl: string;
}

export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  meta?: {
    profile?: string[];
  };
  active?: boolean;
  identifier?: Array<{
    use?: string;
    system?: string;
    value?: string;
  }>;
  name?: Array<{
    use?: string;
    prefix?: string[];
    family?: string;
    given?: string[];
  }>;
  telecom?: Array<{
    system?: ContactSystem;
    value?: string;
    use?: string;
  }>;
  address?: Array<{
    use?: string;
    line?: string[];
    city?: string;
    postalCode?: string;
    country?: string;
  }>;
  gender?: Gender;
  birthDate?: string;
  photo?: Array<{
    contentType?: string;
    url?: string;
  }>;
  communication?: Array<{
    language?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
      text?: string;
    };
  }>;
  qualification?: Array<{
    identifier?: Array<{
      value?: string;
    }>;
    code?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
      text?: string;
    };
    period?: {
      start?: string;
      end?: string;
    };
    issuer?: {
      display?: string;
    };
  }>;
}

export const gradeOptions = [
  { code: 'chirurgien', display: 'Chirurgien' },
  { code: 'medecin-generaliste', display: 'Médecin généraliste' },
  { code: 'interne', display: 'Interne' },
  { code: 'chef-clinique', display: 'Chef de clinique' }
] as const;