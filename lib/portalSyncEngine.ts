import { Platform, Linking } from 'react-native';
import { DraftFormData } from '@/store/applicationDraftStore';
import { useSchemeStore } from '@/store/schemeStore';
import { schemes as fallbackSchemes } from '@/constants/data';

export interface SyncPayload {
  schemeId: string;
  schemeName: string;
  officialUrl: string;
  formattedText: string;
  formData: Partial<DraftFormData>;
  timestamp: string;
}

export function generateSyncPayload(schemeId: string, draft: DraftFormData): SyncPayload {
  const currentSchemes = useSchemeStore.getState().schemes || fallbackSchemes;
  const scheme = currentSchemes.find((s) => s.id === schemeId);
  const schemeName = scheme?.name || 'Government Scheme';
  const officialUrl = scheme?.officialUrl || (scheme as any)?.source_url || 'https://services.india.gov.in';


  const formattedText = `===========================================
CITIZENAWARE OFFICIAL PORTAL DATA SYNC
Scheme: ${schemeName}
Date: ${new Date().toLocaleDateString('en-IN')}
===========================================
[PERSONAL DETAILS]
Full Name: ${draft.name || 'N/A'}
Date of Birth: ${draft.dob || 'N/A'}
Gender: ${draft.gender || 'N/A'}
Mobile: ${draft.phone || 'N/A'}
Email: ${draft.email || 'N/A'}

[RESIDENTIAL ADDRESS]
Street: ${draft.street || 'N/A'}
City/District: ${draft.city || 'N/A'}
State: ${draft.state || 'N/A'}
Pincode: ${draft.pincode || 'N/A'}

[INCOME & CATEGORY]
Annual Income: ₹${draft.annualIncome || 'N/A'}
Income Category: ${draft.incomeCategory || 'N/A'}
Income Source: ${draft.incomeSource || 'N/A'}
${draft.bplCardNumber ? `BPL Card No: ${draft.bplCardNumber}\n` : ''}${draft.incomeCertNumber ? `Certificate No: ${draft.incomeCertNumber}\n` : ''}
[DIRECT BENEFIT TRANSFER (DBT) BANK INFO]
Bank Name: ${draft.customBankName || draft.bankName || 'N/A'}
Account Number: ${draft.accountNumber || 'N/A'}
IFSC Code: ${draft.ifsc || 'N/A'}
Account Type: ${draft.accountType || 'Savings'}
===========================================`;

  return {
    schemeId,
    schemeName,
    officialUrl,
    formattedText,
    formData: draft,
    timestamp: new Date().toISOString(),
  };
}

export async function syncAndOpenOfficialPortal(
  schemeId: string,
  draft: DraftFormData
): Promise<{ success: boolean; url: string }> {
  const payload = generateSyncPayload(schemeId, draft);

  // 1. Copy formatted application text to Clipboard
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(payload.formattedText);
      window.localStorage.setItem('citizenaware_last_sync_payload', JSON.stringify(payload));
    }
  } catch (e) {
    console.warn('Clipboard write warning:', e);
  }

  // 2. Open Official Government Portal in browser
  try {
    await Linking.openURL(payload.officialUrl);
    return { success: true, url: payload.officialUrl };
  } catch {
    const fallbackUrl = 'https://services.india.gov.in';
    await Linking.openURL(fallbackUrl);
    return { success: true, url: fallbackUrl };
  }
}
