export interface VerifyCertificateResponse {
  certSignedUrl: string;
}

export interface VolunteerCertificateResponse {
  eventName: string;
  organizationName: string;
  certCode: string;
  certSignedUrl: string;
  issuedAt: string;
}
