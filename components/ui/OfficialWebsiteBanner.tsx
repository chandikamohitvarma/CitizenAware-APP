import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { AlertTriangle, ExternalLink, Copy, CheckCircle2, Zap } from 'lucide-react-native';
import { useSchemeStore } from '@/store/schemeStore';
import { schemes as fallbackSchemes } from '@/constants/data';
import { useApplicationDraftStore } from '@/store/applicationDraftStore';
import { useAuthStore } from '@/store/authStore';
import { syncAndOpenOfficialPortal, generateSyncPayload } from '@/lib/portalSyncEngine';

interface OfficialWebsiteBannerProps {
  schemeId: string;
  /** Optional: override official URL (for API-sourced schemes) */
  officialUrl?: string;
}

export function OfficialWebsiteBanner({ schemeId, officialUrl }: OfficialWebsiteBannerProps) {
  const [copied, setCopied] = useState(false);
  const currentSchemes = useSchemeStore((state) => state.schemes) || fallbackSchemes;
  const localScheme = currentSchemes.find((s) => s.id === schemeId);
  const url = officialUrl || localScheme?.officialUrl || (localScheme as any)?.source_url || 'https://services.india.gov.in';


  const user = useAuthStore((state) => state.user);
  const drafts = useApplicationDraftStore((state) => state.drafts);

  const draft = drafts[schemeId] || {
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dob: user?.dateOfBirth || '',
    gender: user?.gender || 'Male',
    street: '',
    state: '',
    city: '',
    pincode: '',
    annualIncome: '',
    incomeSource: 'Salaried',
    incomeCategory: 'APL',
    bplCardNumber: '',
    incomeCertNumber: '',
    documents: {},
    accountNumber: '',
    confirmAccount: '',
    ifsc: '',
    bankName: '',
    accountType: 'Savings',
    customBankName: '',
  };

  const hasFilledData = Boolean(draft.name || draft.phone || draft.street || draft.accountNumber);

  const handleSyncAndOpen = async () => {
    setCopied(true);
    await syncAndOpenOfficialPortal(schemeId, draft);
    setTimeout(() => setCopied(false), 4000);
  };

  const handleCopyOnly = async () => {
    const payload = generateSyncPayload(schemeId, draft);
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(payload.formattedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {}
  };

  return (
    <View style={styles.banner}>
      <View style={styles.headerRow}>
        <AlertTriangle size={16} color="#B45309" />
        <Text style={styles.title}>Apply on Official Website Too</Text>
        {hasFilledData && (
          <View style={styles.syncBadge}>
            <Zap size={11} color="#047857" />
            <Text style={styles.syncBadgeText}>Data Sync Ready</Text>
          </View>
        )}
      </View>

      <Text style={styles.body}>
        CitizenAware saves your application draft, but your final form must also be submitted on the{' '}
        <Text style={styles.bold}>official government portal</Text> to be officially valid.
      </Text>

      {url ? (
        <Text style={styles.url} numberOfLines={1}>
          🌐 {url.replace(/^https?:\/\//, '')}
        </Text>
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.syncBtn} onPress={handleSyncAndOpen} activeOpacity={0.85}>
          {copied ? (
            <>
              <CheckCircle2 size={14} color="#FFFFFF" />
              <Text style={styles.syncBtnText}>Data Synced & Opening Portal...</Text>
            </>
          ) : (
            <>
              <Zap size={14} color="#FFFFFF" />
              <Text style={styles.syncBtnText}>Sync Data & Open Official Portal</Text>
              <ExternalLink size={13} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {hasFilledData && (
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopyOnly} activeOpacity={0.8}>
            <Copy size={13} color="#92400E" />
            <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Form Data'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  body: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
  },
  url: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  syncBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
});
