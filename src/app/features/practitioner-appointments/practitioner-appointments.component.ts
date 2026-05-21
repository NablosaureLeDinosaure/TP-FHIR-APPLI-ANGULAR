import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { PractitionerService } from '../../core/services/practitioner.service';
import { PractitionerAppointment } from '../../core/models/appointment.model';
import { FhirPractitioner } from '../../core/models/practitioner.model';
import { getPractitionerName } from '../../core/services/practitioner.mapper';

@Component({
  selector: 'app-practitioner-appointments',
  imports: [FormsModule],
  templateUrl: './practitioner-appointments.component.html',
  styleUrl: './practitioner-appointments.component.css'
})
export class PractitionerAppointmentsComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly practitionerService = inject(PractitionerService);

  readonly rpps = signal('');
  readonly isLoading = signal(false);
  readonly searched = signal(false);
  readonly errorMessage = signal('');
  readonly practitioner = signal<FhirPractitioner | null>(null);
  readonly appointments = signal<PractitionerAppointment[]>([]);

  searchAppointments(): void {
    const rppsValue = this.rpps().trim();
    if (!rppsValue) {
      this.errorMessage.set('Saisis un numéro RPPS avant de rechercher.');
      return;
    }

    this.isLoading.set(true);
    this.searched.set(true);
    this.errorMessage.set('');
    this.practitioner.set(null);
    this.appointments.set([]);

    this.practitionerService.getByRpps(rppsValue).subscribe({
      next: (practitioner) => {
        this.practitioner.set(practitioner);
        this.loadAppointments(rppsValue);
      },
      error: () => {
        this.errorMessage.set('Impossible de rechercher le soignant par RPPS.');
        this.isLoading.set(false);
      }
    });
  }

  updateRpps(value: string): void {
    this.rpps.set(value);
  }

  practitionerName(): string {
    const practitioner = this.practitioner();
    if (!practitioner) {
      return 'Soignant non trouvé dans la base RH';
    }

    const name = getPractitionerName(practitioner);
    return `${name.given} ${name.family}`.trim();
  }

  private loadAppointments(rppsValue: string): void {
    this.appointmentService.getAppointmentsByRpps(rppsValue).subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de récupérer les rendez-vous.');
        this.isLoading.set(false);
      }
    });
  }
}
