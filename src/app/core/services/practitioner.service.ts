import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FhirBundle } from '../models/fhir-bundle.model';
import { FhirPractitioner } from '../models/practitioner.model';
import { RPPS_SYSTEM } from './practitioner.mapper';

@Injectable({ providedIn: 'root' })
export class PractitionerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.fhirBaseUrl;

  getAll(): Observable<FhirPractitioner[]> {
    return this.http.get<FhirBundle<FhirPractitioner>>(`${this.baseUrl}/Practitioner`).pipe(
      map((bundle) =>
        bundle.entry
          ?.map((entry) => entry.resource)
          .filter(Boolean) as FhirPractitioner[] ?? []
      ),
      catchError(() => of([]))
    );
  }

  getById(id: string): Observable<FhirPractitioner> {
    return this.http.get<FhirPractitioner>(`${this.baseUrl}/Practitioner/${id}`).pipe(
      catchError(() => throwError(() => new Error('Impossible de récupérer le soignant depuis le serveur FHIR.')))
    );
  }

  getByRpps(rpps: string): Observable<FhirPractitioner | null> {
    const searchUrl = `${this.baseUrl}/Practitioner?identifier=${encodeURIComponent(RPPS_SYSTEM)}|${encodeURIComponent(rpps)}`;

    return this.http.get<FhirBundle<FhirPractitioner>>(searchUrl).pipe(
      map((bundle) => bundle.entry?.[0]?.resource ?? null),
      catchError(() => of(null))
    );
  }

  create(practitioner: FhirPractitioner): Observable<FhirPractitioner> {
    return this.http.post<FhirPractitioner>(`${this.baseUrl}/Practitioner`, practitioner).pipe(
      catchError(() => throwError(() => new Error('Impossible de créer le soignant sur le serveur FHIR.')))
    );
  }

  update(id: string, practitioner: FhirPractitioner): Observable<FhirPractitioner> {
    return this.http.put<FhirPractitioner>(`${this.baseUrl}/Practitioner/${id}`, practitioner).pipe(
      catchError(() => throwError(() => new Error('Impossible de modifier le soignant sur le serveur FHIR.')))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Practitioner/${id}`).pipe(
      catchError(() => throwError(() => new Error('Impossible de supprimer le soignant sur le serveur FHIR.')))
    );
  }
}