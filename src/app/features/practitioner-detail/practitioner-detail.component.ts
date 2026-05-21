import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FhirPractitioner } from '../../core/models/practitioner.model';
import { PractitionerService } from '../../core/services/practitioner.service';
import { getGradeDisplay, getIdentifier, getPractitionerName, getRpps } from '../../core/services/practitioner.mapper';
import { calculateAge } from '../../core/utils/age.util';

@Component({
  selector: 'app-practitioner-detail',
  imports: [RouterLink],
  templateUrl: './practitioner-detail.component.html',
  styleUrl: './practitioner-detail.component.css'
})
export class PractitionerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly practitionerService = inject(PractitionerService);

  readonly practitioner = signal<FhirPractitioner | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('Identifiant du soignant manquant.');
      return;
    }

    this.isLoading.set(true);

    this.practitionerService.getById(id).subscribe({
      next: (practitioner) => {
        this.practitioner.set(practitioner);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Soignant introuvable.');
        this.isLoading.set(false);
      }
    });
  }

  deletePractitioner(): void {
    const practitioner = this.practitioner();

    if (!practitioner?.id) {
      return;
    }

    const name = this.nameOf(practitioner);

    if (!confirm(`Supprimer le soignant ${name.given} ${name.family} ?`)) {
      return;
    }

    this.practitionerService.delete(practitioner.id).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.errorMessage.set('La suppression du soignant a échoué.')
    });
  }

  nameOf(practitioner: FhirPractitioner): { family: string; given: string } {
    return getPractitionerName(practitioner);
  }

  ageOf(practitioner: FhirPractitioner): string {
    const age = calculateAge(practitioner.birthDate);
    return age ? `${age} ans` : '-';
  }

  rppsOf(practitioner: FhirPractitioner): string {
    return getRpps(practitioner) || '-';
  }

  idmedOf(practitioner: FhirPractitioner): string {
    return getIdentifier(practitioner, 'idmed') || '-';
  }

  gradeOf(practitioner: FhirPractitioner): string {
    return getGradeDisplay(practitioner);
  }

  contactOf(practitioner: FhirPractitioner): string {
    const telecom = practitioner.telecom?.[0];
    return telecom ? `${telecom.system} : ${telecom.value}` : '-';
  }

  addressOf(practitioner: FhirPractitioner): string {
    const address = practitioner.address?.[0];

    if (!address) {
      return '-';
    }

    return [address.line?.join(' '), address.postalCode, address.city, address.country]
      .filter(Boolean)
      .join(', ');
  }
}