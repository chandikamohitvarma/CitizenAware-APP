import { Scheme } from '@/types';

/**
 * Evaluates whether a scheme application window is expired or closed.
 * Checks status flags ('expired' | 'closed') and compares deadline dates against current date.
 */
export function isSchemeExpired(scheme: Partial<Scheme> | null | undefined): boolean {
  if (!scheme) return false;

  // Explicit status check
  if (scheme.status === 'expired' || scheme.status === 'closed') {
    return true;
  }

  // Deadline date evaluation
  if (scheme.deadline) {
    const deadlineDate = new Date(scheme.deadline);
    if (!isNaN(deadlineDate.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return deadlineDate < today;
    }
  }

  return false;
}

/**
 * Returns a valid official portal URL for a scheme with fallback to India.gov.in.
 */
export function getSafeOfficialUrl(url?: string): string {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return 'https://services.india.gov.in';
  }
  return url;
}
