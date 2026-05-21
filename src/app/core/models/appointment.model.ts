export interface PractitionerAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  patientName: string;
  practitionerName: string;
  room: string;
  status: string;
  description: string;
}

export type AppointmentStatus =
  | 'proposed'
  | 'pending'
  | 'booked'
  | 'arrived'
  | 'fulfilled'
  | 'cancelled'
  | 'noshow'
  | 'entered-in-error'
  | 'checked-in'
  | 'waitlist';

export interface FhirAppointmentParticipant {
  actor?: {
    reference?: string;
    type?: string;
    display?: string;
    identifier?: {
      system?: string;
      value?: string;
    };
  };
  status?: string;
  required?: string;
}

export interface FhirAppointment {
  resourceType: 'Appointment';
  id?: string;
  status?: AppointmentStatus | string;
  description?: string;
  start?: string;
  end?: string;
  created?: string;
  appointmentType?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  participant?: FhirAppointmentParticipant[];
}

export function appointmentStatusLabel(status?: string): string {
  switch (status) {
    case 'proposed':
      return 'Proposé';
    case 'pending':
      return 'En attente';
    case 'booked':
      return 'Confirmé';
    case 'arrived':
      return 'Patient arrivé';
    case 'checked-in':
      return 'Présenté';
    case 'fulfilled':
      return 'Réalisé';
    case 'cancelled':
      return 'Annulé';
    case 'noshow':
      return 'Absent';
    case 'waitlist':
      return "Liste d'attente";
    case 'entered-in-error':
      return 'Erreur de saisie';
    default:
      return status ?? '-';
  }
}