import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PractitionerFormValue, gradeOptions } from '../../core/models/practitioner.model';
import { PractitionerService } from '../../core/services/practitioner.service';
import { toFhirPractitioner, toPractitionerFormValue } from '../../core/services/practitioner.mapper';

@Component({
  selector: 'app-practitioner-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './practitioner-form.component.html',
  styleUrl: './practitioner-form.component.css'
})
export class PractitionerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly practitionerService = inject(PractitionerService);

  readonly gradeOptions = gradeOptions;
  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  private practitionerId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    family: ['', Validators.required],
    given: ['', Validators.required],
    birthDate: ['', Validators.required],
    gender: ['unknown' as PractitionerFormValue['gender'], Validators.required],
    idmed: ['', Validators.required],
    rpps: ['', Validators.required],
    telecomSystem: ['phone' as PractitionerFormValue['telecomSystem'], Validators.required],
    telecomValue: ['', Validators.required],
    addressLine: [''],
    city: [''],
    postalCode: [''],
    country: ['France'],
    gradeCode: ['medecin-generaliste', Validators.required],
    qualificationId: ['', Validators.required],
    qualificationStart: ['', Validators.required],
    language: ['Français', Validators.required],
    photoUrl: ['photo-soignant.jpg', Validators.required]
  });

  ngOnInit(): void {
    this.practitionerId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(Boolean(this.practitionerId));

    if (this.practitionerId) {
      this.loadPractitioner(this.practitionerId);
    }

    this.form.controls.gradeCode.valueChanges.subscribe((gradeCode) => {
      const selectedGrade = this.gradeOptions.find((grade) => grade.code === gradeCode);
      if (selectedGrade) {
        // La valeur affichée est reconstruite au submit pour garder le formulaire simple.
      }
    });
  }

  loadPractitioner(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.practitionerService.getById(id).subscribe({
      next: (practitioner) => {
        this.form.patchValue(toPractitionerFormValue(practitioner));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger ce soignant.');
        this.isLoading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const selectedGrade = this.gradeOptions.find((grade) => grade.code === this.form.controls.gradeCode.value);
    const value: PractitionerFormValue = {
      ...this.form.getRawValue(),
      id: this.practitionerId ?? undefined,
      gradeDisplay: selectedGrade?.display ?? 'Médecin généraliste'
    };

    const resource = toFhirPractitioner(value);
    this.isLoading.set(true);
    this.errorMessage.set('');

    const request$ = this.isEditMode() && this.practitionerId
      ? this.practitionerService.update(this.practitionerId, resource)
      : this.practitionerService.create(resource);

    request$.subscribe({
      next: (saved) => this.router.navigate(['/practitioners', saved.id]),
      error: () => {
        this.errorMessage.set('Enregistrement impossible. Vérifie le serveur FHIR ou les données saisies.');
        this.isLoading.set(false);
      }
    });
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return Boolean(control?.invalid && (control.dirty || control.touched));
  }
}
