import { FhirPractitioner, PractitionerFormValue, gradeOptions } from '../models/practitioner.model';

export const RPPS_SYSTEM = 'urn:oid:1.2.250.1.71.4.2.1';
export const IDMED_SYSTEM = 'idmed';

export function getIdentifier(resource: FhirPractitioner, system: string): string {
  return resource.identifier?.find((identifier) => identifier.system === system)?.value ?? '';
}

export function getRpps(resource: FhirPractitioner): string {
  return getIdentifier(resource, RPPS_SYSTEM);
}

export function getPractitionerName(resource: FhirPractitioner): { family: string; given: string } {
  const name = resource.name?.[0];

  return {
    family: name?.family ?? '',
    given: name?.given?.join(' ') ?? ''
  };
}

export function getGradeDisplay(resource: FhirPractitioner): string {
  const coding = resource.qualification?.[0]?.code?.coding?.[0];

  return coding?.display ?? resource.qualification?.[0]?.code?.text ?? '-';
}

export function getGradeCode(resource: FhirPractitioner): string {
  return resource.qualification?.[0]?.code?.coding?.[0]?.code ?? 'medecin-generaliste';
}

export function toPractitionerFormValue(resource: FhirPractitioner): PractitionerFormValue {
  const name = getPractitionerName(resource);
  const gradeCode = getGradeCode(resource);
  const gradeDisplay = gradeOptions.find((grade) => grade.code === gradeCode)?.display ?? getGradeDisplay(resource);

  return {
    id: resource.id,
    family: name.family,
    given: name.given,
    birthDate: resource.birthDate ?? '',
    gender: resource.gender ?? 'unknown',
    idmed: getIdentifier(resource, IDMED_SYSTEM),
    rpps: getRpps(resource),
    telecomSystem: resource.telecom?.[0]?.system ?? 'phone',
    telecomValue: resource.telecom?.[0]?.value ?? '',
    addressLine: resource.address?.[0]?.line?.[0] ?? '',
    city: resource.address?.[0]?.city ?? '',
    postalCode: resource.address?.[0]?.postalCode ?? '',
    country: resource.address?.[0]?.country ?? 'FR',
    gradeCode,
    gradeDisplay,
    qualificationId: resource.qualification?.[0]?.identifier?.[0]?.value ?? '',
    qualificationStart: resource.qualification?.[0]?.period?.start ?? '',
    language: resource.communication?.[0]?.language?.text ?? 'Français',
    photoUrl: resource.photo?.[0]?.url ?? ''
  };
}

export function toFhirPractitioner(form: PractitionerFormValue): FhirPractitioner {
  return {
    resourceType: 'Practitioner',
    id: form.id,
    meta: {
      profile: ['StructureDefinition/rh-practitioner']
    },
    active: true,
    identifier: [
      {
        system: IDMED_SYSTEM,
        value: form.idmed
      },
      {
        use: 'official',
        system: RPPS_SYSTEM,
        value: form.rpps
      }
    ],
    name: [
      {
        use: 'official',
        family: form.family,
        given: [form.given]
      }
    ],
    telecom: [
      {
        system: form.telecomSystem,
        value: form.telecomValue,
        use: 'work'
      }
    ],
    address: form.addressLine || form.city || form.postalCode
      ? [
          {
            use: 'work',
            line: form.addressLine ? [form.addressLine] : [],
            city: form.city,
            postalCode: form.postalCode,
            country: form.country || 'FR'
          }
        ]
      : [],
    gender: form.gender,
    birthDate: form.birthDate || undefined,
    photo: form.photoUrl
      ? [
          {
            contentType: 'image/jpeg',
            url: form.photoUrl
          }
        ]
      : [],
    communication: [
      {
        language: {
          coding: [
            {
              system: 'urn:ietf:bcp:47',
              code: 'fr',
              display: 'French'
            }
          ],
          text: form.language || 'Français'
        }
      }
    ],
    qualification: [
      {
        identifier: form.qualificationId ? [{ value: form.qualificationId }] : [],
        code: {
          coding: [
            {
              system: 'CSGrade',
              code: form.gradeCode,
              display: form.gradeDisplay
            }
          ],
          text: form.gradeDisplay
        },
        period: {
          start: form.qualificationStart || undefined
        }
      }
    ]
  };
}