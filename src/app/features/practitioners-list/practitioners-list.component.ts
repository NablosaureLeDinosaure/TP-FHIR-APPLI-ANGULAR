import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FhirPractitioner } from '../../core/models/practitioner.model';
import { PractitionerService } from '../../core/services/practitioner.service';
import { getGradeDisplay, getPractitionerName, getRpps } from '../../core/services/practitioner.mapper';
import { calculateAge } from '../../core/utils/age.util';

@Component({
  selector: 'app-practitioners-list',
  imports: [RouterLink],
  templateUrl: './practitioners-list.component.html',
  styleUrl: './practitioners-list.component.css'
})
export class PractitionersListComponent implements OnInit {
  private readonly practitionerService = inject(PractitionerService);

  readonly practitioners = signal<FhirPractitioner[]>([]);
  readonly searchTerm = signal('');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly filteredPractitioners = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.practitioners();
    }

    return this.practitioners().filter((practitioner) => {
      const name = this.nameOf(practitioner);
      const rpps = this.rppsOf(practitioner);

      return `${name.family} ${name.given} ${rpps}`.toLowerCase().includes(term);
    });
  });

  ngOnInit(): void {
    this.loadPractitioners();
  }

  loadPractitioners(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.practitionerService.getAll().subscribe({
      next: (practitioners) => {
        this.practitioners.set(practitioners);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de récupérer les soignants depuis le serveur FHIR.');
        this.isLoading.set(false);
      }
    });
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  deletePractitioner(practitioner: FhirPractitioner): void {
    if (!practitioner.id) {
      return;
    }

    const name = this.nameOf(practitioner);
    const confirmed = confirm(`Supprimer le soignant ${name.given} ${name.family} ?`);

    if (!confirmed) {
      return;
    }

    this.practitionerService.delete(practitioner.id).subscribe({
      next: () => this.loadPractitioners(),
      error: () => this.errorMessage.set('La suppression du soignant a échoué.')
    });
  }

  nameOf(practitioner: FhirPractitioner): { family: string; given: string } {
    return getPractitionerName(practitioner);
  }

  ageOf(practitioner: FhirPractitioner): string {
    return calculateAge(practitioner.birthDate)?.toString() ?? '-';
  }

  rppsOf(practitioner: FhirPractitioner): string {
    return getRpps(practitioner) || '-';
  }

  gradeOf(practitioner: FhirPractitioner): string {
    return getGradeDisplay(practitioner);
  }
}