export interface FhirBundle<T> {
  resourceType: 'Bundle';
  type?: string;
  total?: number;
  entry?: Array<{
    fullUrl?: string;
    resource?: T;
  }>;
}
