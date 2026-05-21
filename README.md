# RH FHIR Angular

Application Angular full front pour le groupe Ressources Humaines du TP FHIR.

## Fonctionnalités

- Accueil avec tableau des soignants présents en base.
- Recherche par nom, prénom ou RPPS.
- Création d’un nouveau soignant RH.
- Consultation d’une fiche soignant.
- Modification d’un soignant.
- Suppression d’un soignant.
- Onglet de recherche des rendez-vous par RPPS, prêt pour la future intégration du groupe Secrétariat.

## Ressource FHIR utilisée

La ressource principale est `Practitioner`, selon le profil `RHPractitioner`.

Champs pris en compte :

- `identifier[idmed]`
- `identifier[RPPS]`
- `name.family`
- `name.given`
- `telecom`
- `address`
- `gender`
- `birthDate`
- `photo`
- `communication`
- `qualification`

Grades disponibles :

- Chirurgien
- Médecin généraliste
- Interne
- Chef de clinique

## Installation locale

```bash
npm install
npm start
```

Puis ouvrir :

```text
http://localhost:4200
```

## Configuration du serveur FHIR

Le fichier à modifier est :

```text
src/environments/environment.ts
```

Par défaut :

```ts
fhirBaseUrl: 'http://localhost:8080/fhir'
```

Si ton serveur FHIR n’est pas disponible, l’application utilise automatiquement deux soignants de démonstration issus des exemples FSH.

Pour désactiver ce fallback :

```ts
useMockDataWhenApiFails: false
```

## Docker

Construire l’image :

```bash
docker build -t rh-fhir-angular .
```

Lancer le conteneur :

```bash
docker run --rm -p 4200:80 rh-fhir-angular
```

Ou avec Docker Compose :

```bash
docker compose up --build
```

Puis ouvrir :

```text
http://localhost:4200
```

## Endpoints FHIR prévus

Liste des soignants :

```text
GET /Practitioner
```

Détail d’un soignant :

```text
GET /Practitioner/{id}
```

Création :

```text
POST /Practitioner
```

Modification :

```text
PUT /Practitioner/{id}
```

Suppression :

```text
DELETE /Practitioner/{id}
```

Recherche par RPPS :

```text
GET /Practitioner?identifier=RPPS|{rpps}
```

Future recherche des rendez-vous :

```text
GET /Appointment?practitioner.identifier=RPPS|{rpps}
```

Cette dernière partie sera à ajuster selon l’implémentation réelle du groupe Secrétariat.
