import { Routes } from '@angular/router';
import { PractitionersListComponent } from './features/practitioners-list/practitioners-list.component';
import { PractitionerFormComponent } from './features/practitioner-form/practitioner-form.component';
import { PractitionerDetailComponent } from './features/practitioner-detail/practitioner-detail.component';
import { PractitionerAppointmentsComponent } from './features/practitioner-appointments/practitioner-appointments.component';

export const routes: Routes = [
  { path: '', component: PractitionersListComponent, title: 'Accueil - Soignants' },
  { path: 'practitioners/new', component: PractitionerFormComponent, title: 'Nouveau soignant' },
  { path: 'practitioners/:id', component: PractitionerDetailComponent, title: 'Détail soignant' },
  { path: 'practitioners/:id/edit', component: PractitionerFormComponent, title: 'Modifier soignant' },
  { path: 'appointments', component: PractitionerAppointmentsComponent, title: 'RDV par RPPS' },
  { path: '**', redirectTo: '' }
];
