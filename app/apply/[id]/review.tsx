import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Check, Edit3, ShieldCheck } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header, ProgressStepper, OfficialWebsiteBanner } from '@/components/ui';
import { schemes } from '@/constants/data';
import { useAuthStore } from '@/store/authStore';
import { useSchemeStore } from '@/store/schemeStore';
import { useApplicationDraftStore } from '@/store/applicationDraftStore';
import { syncAndOpenOfficialPortal } from '@/lib/portalSyncEngine';
import { getScheme, submitApplication } from '@/lib/api';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams();
  const schemeId = String(id);
  // Try to find the scheme locally first (numeric IDs); fall back to schemes[0] for display
  const localScheme = schemes.find((s) => s.id === schemeId);
  const [scheme, setScheme] = useState(localScheme || schemes[0]);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the scheme isn't in local data (e.g., it's a UUID from the API), fetch it
  useEffect(() => {
    if (!localScheme) {
      getScheme(schemeId)
        .then((data) => {
          if (data) {
            // Map API scheme shape to what this screen needs
            setScheme({
              ...schemes[0], // base defaults
              id: data.id,
              name: data.name ?? data.scheme_name ?? schemes[0].name,
              documents: data.documents_required ?? data.documents ?? schemes[0].documents,
            });
          }
        })
        .catch(() => {
          // Keep the fallback scheme already set
        });
    }
  }, [schemeId]);

  const { getDraft, clearDraft } = useApplicationDraftStore();
  const user = useAuthStore((state) => state.user);
  const draft = getDraft(schemeId, {
    name: user?.name,
    phone: user?.phone,
    email: user?.email,
  });

  const sections = [
    {
      title: '1. Personal Details',
      route: `/apply/${schemeId}/personal`,
      items: [
        `Full Name: ${draft.name || 'Not provided'}`,
        `Date of Birth: ${draft.dob || 'Not provided'}`,
        `Gender: ${draft.gender || 'Male'}`,
        `Mobile Number: ${draft.phone || 'Not provided'}`,
        `Email Address: ${draft.email || 'Not provided'}`,
      ],
    },
    {
      title: '2. Address & State',
      route: `/apply/${schemeId}/address`,
      items: [
        `Street Address: ${draft.street || 'Not provided'}`,
        `City/District: ${draft.city || 'Not provided'}`,
        `State / UT: ${draft.state || 'Not provided'}`,
        `Pincode: ${draft.pincode || 'Not provided'}`,
      ],
    },
    {
      title: '3. Income & Category',
      route: `/apply/${schemeId}/income`,
      items: [
        `Annual Family Income: ${
          draft.annualIncome
            ? `₹ ${parseInt(draft.annualIncome).toLocaleString('en-IN')}`
            : '₹ 2,50,000'
        }`,
        `Primary Source: ${draft.incomeSource || 'Salaried'}`,
        `Category: ${draft.incomeCategory || 'APL'}`,
        `Income Certificate: ${draft.incomeCertNumber || 'Not provided'}`,
      ],
    },
    {
      title: '4. Uploaded Documents',
      route: `/apply/${schemeId}/documents`,
      items: [
        ...scheme.documents.map((doc: string) => {
          const uploaded = draft.documents?.[doc];
          return `${doc}: ${uploaded ? 'Uploaded' : 'Not uploaded'}`;
        }),
      ],
    },
    {
      title: '5. Bank Account Details',
      route: `/apply/${schemeId}/bank`,
      items: [
        `Account Number: ${
          draft.accountNumber
            ? `XXXXXX${draft.accountNumber.slice(-4)}`
            : 'XXXXXX1234'
        }`,
        `Bank Name: ${
          draft.bankName === 'Other / Local Co-operative Bank'
            ? draft.customBankName || 'Co-operative Bank'
            : draft.bankName || 'State Bank of India'
        }`,
        `IFSC Code: ${draft.ifsc || 'SBIN0001234'}`,
        `Account Type: ${draft.accountType || 'Savings'}`,
      ],
    },
  ];

  const handleSubmit = async () => {
    if (!agreed) {
      Alert.alert(
        'Declaration Required',
        'Please check the declaration box to submit your application.'
      );
      return;
    }

    // Strict Document Checklist Verification Gate
    const missingDocs = (scheme.documents || []).filter(
      (docName: string) => !draft.documents?.[docName]
    );

    if (missingDocs.length > 0) {
      Alert.alert(
        'Missing Mandatory Documents',
        `Please upload the following required documents before submitting:\n\n• ${missingDocs.join('\n• ')}`,
        [
          {
            text: 'Upload Documents',
            onPress: () => router.push(`/apply/${schemeId}/documents` as any),
          },
        ]
      );
      return;
    }

    setIsSubmitting(true);
    const token = useAuthStore.getState().token;
    const currentUser = useAuthStore.getState().user;

    const payload = {
      schemeId,
      schemeName: scheme.name,
      personalData: {
        name: draft.name,
        dob: draft.dob,
        gender: draft.gender,
        phone: draft.phone,
        email: draft.email,
      },
      addressData: {
        street: draft.street,
        city: draft.city,
        state: draft.state,
        pincode: draft.pincode,
      },
      bankData: {
        accountNumber: draft.accountNumber,
        bankName: draft.bankName,
        ifsc: draft.ifsc,
        accountType: draft.accountType,
      },
      incomeData: {
        annualIncome: draft.annualIncome,
        incomeSource: draft.incomeSource,
        incomeCategory: draft.incomeCategory,
      },
      documents: scheme.documents,
    };

    // 1. Submit application payload to backend database API
    const apiRes = await submitApplication(token, payload);
    const refNum = apiRes?.reference_number || apiRes?.referenceNumber;

    // 2. Persist application in local store with official database reference number
    useSchemeStore.getState().createApplication(
      schemeId,
      currentUser?.id,
      { name: scheme.name, documents: scheme.documents },
      'submitted',
      refNum,
      true
    );

    // 3. Clear transient draft state & sync with official portal engine
    clearDraft(schemeId);
    await syncAndOpenOfficialPortal(schemeId, draft);

    setIsSubmitting(false);
    router.replace(`/apply/${schemeId}/success` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Preview & Submit"
        showBack
        onBackPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)'))}
      />
      <ProgressStepper currentStep={6} />

      <ScrollView style={styles.content}>
        <OfficialWebsiteBanner schemeId={schemeId} />
        <View style={styles.headerCard}>
          <Text style={styles.title}>Review Your Application</Text>
          <Text style={styles.subtitle}>
            Please preview and verify all your details before final submission for {scheme.name}.
          </Text>
        </View>

        {sections.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push(section.route as any)}
              >
                <Edit3 size={14} color={Colors.primary.blue} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            {section.items.map((item, itemIdx) => (
              <Text key={itemIdx} style={styles.itemText}>
                {item}
              </Text>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={styles.declarationBox}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Check size={14} color={Colors.white} />}
          </View>
          <Text style={styles.declarationText}>
            I hereby declare that all information provided above is true and correct to the best of
            my knowledge and belief.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.stepsInfo}>
          <ShieldCheck size={18} color={Colors.success} />
          <Text style={styles.stepLabel}>Encrypted 256-Bit SSL Submission</Text>
        </View>
        <AppButton title="Submit Application" onPress={handleSubmit} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  headerCard: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.gray.text, lineHeight: 18 },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  itemText: { fontSize: 13, color: Colors.gray.text, marginBottom: 4, lineHeight: 18 },
  declarationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.gray.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: Colors.white,
  },
  checkboxActive: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  declarationText: { flex: 1, fontSize: 12, color: Colors.gray.text, lineHeight: 16 },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
  },
  stepsInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  stepLabel: { fontSize: 12, color: Colors.success, fontWeight: '600' },
});
