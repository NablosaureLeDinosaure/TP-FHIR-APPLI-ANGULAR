import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FhirBundle } from '../models/fhir-bundle.model';
import {
  FhirAppointment,
  FhirAppointmentParticipant,
  PractitionerAppointment,
  appointmentStatusLabel
} from '../models/appointment.model';
import { RPPS_SYSTEM } from './practitioner.mapper';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.fhirBaseUrl;

  private readonly headers = new HttpHeaders({
    Accept: 'application/fhir+json',
    'Content-Type': 'application/fhir+json'
  });

  getAppointmentsByRpps(rpps: string): Observable<PractitionerAppointment[]> {
    const url = `${this.baseUrl}/Appointment?_count=200&_sort=-_lastUpdated`;

    return this.http.get<FhirBundle<FhirAppointment>>(url, { headers: this.headers }).pipe(
      map((bundle) =>
        (bundle.entry ?? [])
          .map((entry) => entry.resource)
          .filter((appointment): appointment is FhirAppointment => !!appointment)
          .filter((appointment) => this.hasPractitionerRpps(appointment, rpps))
          .map((appointment) => this.toPractitionerAppointment(appointment))
      )
    );
  }

  private hasPractitionerRpps(appointment: FhirAppointment, rpps: string): boolean {
    return (appointment.participant ?? []).some((participant) => {
      const actor = participant.actor;

      const isPractitioner =
        actor?.type === 'Practitioner' ||
        actor?.reference?.toLowerCase().startsWith('practitioner/');

      const hasSameRpps =
        actor?.identifier?.system === RPPS_SYSTEM &&
        actor?.identifier?.value === rpps;

      return isPractitioner && hasSameRpps;
    });
  }

  private toPractitionerAppointment(appointment: FhirAppointment): PractitionerAppointment {
    const patient = this.findParticipant(appointment, 'Patient');
    const practitioner = this.findParticipant(appointment, 'Practitioner');
    const location = this.findParticipant(appointment, 'Location');

    return {
      id: appointment.id ?? '',
      date: this.formatDate(appointment.start),
      startTime: this.formatTime(appointment.start),
      endTime: this.formatTime(appointment.end),
      patientName: patient?.actor?.display ?? '-',
      practitionerName: practitioner?.actor?.display ?? '-',
      room: location?.actor?.display ?? '-',
      status: appointmentStatusLabel(appointment.status),
      description: appointment.description ?? '-'
    };
  }

  private findParticipant(
    appointment: FhirAppointment,
    type: 'Patient' | 'Practitioner' | 'Location'
  ): FhirAppointmentParticipant | undefined {
    return (appointment.participant ?? []).find((participant) => {
      const actor = participant.actor;

      return (
        actor?.type === type ||
        actor?.reference?.toLowerCase().startsWith(`${type.toLowerCase()}/`)
      );
    });
  }

  private formatDate(value?: string): string {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleDateString('fr-FR');
  }

  private formatTime(value?: string): string {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}