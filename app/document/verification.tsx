import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Clock, Upload, FileText, RefreshCw } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header, AppButton } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface DocumentItem {
  id: string;
  name: string;
  status: 'verified' | 'pending' | 'rejected' | 'not_uploaded';
  file_url?: string;
  rejection_reason?: string;
  required: boolean;
}

const REQUIRED_DOCS: Omit<DocumentItem, 'id' | 'status'>[] = [
  { name: 'Aadhaar Card', required: true },
  { name: 'PAN Card', required: true },
  { name: 'Income Certificate', required: true },
  { name: 'Address Proof', required: true },
  { name: 'Bank Passbook', required: true },
  { name: 'Education Certificate', required: false },
  { name: 'Caste Certificate', required: false },
  { name: 'Disability Certificate', required: false },
];

export default function DocumentVerificationScreen() {
  const { user } = useAuthStore();
  const params = useLocalSearchParams<{ application_id?: string }>();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [user?.id]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      if (user?.id && params.application_id) {
        const { data } = await supabase
          .from('application_documents')
          .select('*')
          .eq('application_id', params.application_id);

        if (data && data.length > 0) {
          const merged = REQUIRED_DOCS.map((doc, idx) => {
            const existing = data.find(d => d.name === doc.name);
            return {
              id: existing?.id || String(idx + 1),
              name: doc.name,
              required: doc.required,
              status: (existing?.status as DocumentItem['status']) || 'not_uploaded',
              file_url: existing?.file_url,
              rejection_reason: existing?.rejection_reason,
            };
          });
          setDocs(merged);
          return;
        }
      }
      // Demo data
      setDocs(REQUIRED_DOCS.map((doc, idx) => ({
        id: String(idx + 1),
        name: doc.name,
        required: doc.required,
        status: idx === 0 ? 'verified' : idx === 1 ? 'pending' : idx === 2 ? 'rejected' : 'not_uploaded',
        file_url: idx <= 1 ? `${doc.name.toLowerCase().replace(/ /g, '_')}.pdf` : undefined,
        rejection_reason: idx === 2 ? 'Document is blurry. Please upload a clear copy.' : undefined,
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (docName: string) => {
    Alert.alert('Upload Document', `Select a file for "${docName}"`, [
      { text: 'Camera', onPress: () => {} },
      { text: 'Gallery', onPress: () => {} },
      { text: 'Files', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    Alert.alert('Saved', 'Document information has been saved.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const getStatusColor = (status: DocumentItem['status']) => {
    switch (status) {
      case 'verified': return Colors.success;
      case 'rejected': return Colors.error;
      case 'pending': return Colors.warning;
      default: return Colors.gray.text;
    }
  };

  const getStatusIcon = (status: DocumentItem['status'], size = 18) => {
    const color = getStatusColor(status);
    switch (status) {
      case 'verified': return <CheckCircle2 size={size} color={color} />;
      case 'rejected': return <AlertCircle size={size} color={color} />;
      case 'pending': return <Clock size={size} color={color} />;
      default: return <Upload size={size} color={Colors.gray.icon} />;
    }
  };

  const getStatusLabel = (status: DocumentItem['status']) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Under Review';
      default: return 'Not Uploaded';
    }
  };

  const verified = docs.filter(d => d.status === 'verified').length;
  const pending = docs.filter(d => d.status === 'pending').length;
  const rejected = docs.filter(d => d.status === 'rejected').length;
  const notUploaded = docs.filter(d => d.status === 'not_uploaded').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Document Verification" showBack onBackPress={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary.blue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Document Verification" showBack onBackPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Verified', value: verified, color: Colors.success },
            { label: 'Pending', value: pending, color: Colors.warning },
            { label: 'Rejected', value: rejected, color: Colors.error },
            { label: 'Pending Upload', value: notUploaded, color: Colors.gray.text },
          ].map((s, i) => (
            <View key={i} style={[styles.stat, { borderTopColor: s.color }]}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Upload area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload New Document</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={() => handleUpload('Document')}>
            <View style={styles.uploadIcon}>
              <Upload size={32} color={Colors.primary.blue} />
            </View>
            <Text style={styles.uploadMain}>Tap to upload a document</Text>
            <Text style={styles.uploadSub}>PDF, JPG, PNG — Max 5MB per file</Text>
            <View style={styles.selectBtn}>
              <Text style={styles.selectBtnText}>Choose File</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Document List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          {docs.filter(d => d.required).map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onUpload={handleUpload}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getStatusLabel={getStatusLabel}
            />
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Optional Documents</Text>
          {docs.filter(d => !d.required).map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onUpload={handleUpload}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getStatusLabel={getStatusLabel}
            />
          ))}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes / Comments</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes or comments about your documents..."
            placeholderTextColor={Colors.gray.text}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.footer}>
          <AppButton
            title="Save & Continue"
            onPress={handleSave}
            loading={saving}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface DocCardProps {
  doc: DocumentItem;
  onUpload: (name: string) => void;
  getStatusColor: (s: DocumentItem['status']) => string;
  getStatusIcon: (s: DocumentItem['status'], size?: number) => React.ReactNode;
  getStatusLabel: (s: DocumentItem['status']) => string;
}

function DocumentCard({ doc, onUpload, getStatusColor, getStatusIcon, getStatusLabel }: DocCardProps) {
  const color = getStatusColor(doc.status);
  return (
    <View style={styles.docCard}>
      <View style={styles.docHeader}>
        <View style={[styles.docIconBg, { backgroundColor: color + '18' }]}>
          {getStatusIcon(doc.status)}
        </View>
        <View style={styles.docMeta}>
          <View style={styles.docNameRow}>
            <Text style={styles.docName}>{doc.name}</Text>
            {doc.required && <Text style={styles.requiredBadge}>Required</Text>}
          </View>
          <View style={styles.docStatusRow}>
            <Text style={[styles.docStatusText, { color }]}>{getStatusLabel(doc.status)}</Text>
            {doc.file_url && (
              <Text style={styles.fileName} numberOfLines={1}>{doc.file_url}</Text>
            )}
          </View>
        </View>
      </View>

      {doc.rejection_reason && (
        <View style={styles.rejectionBox}>
          <AlertCircle size={14} color={Colors.error} />
          <Text style={styles.rejectionText}>{doc.rejection_reason}</Text>
        </View>
      )}

      {(doc.status === 'not_uploaded' || doc.status === 'rejected') && (
        <TouchableOpacity style={styles.uploadBtn} onPress={() => onUpload(doc.name)}>
          <Upload size={14} color={Colors.primary.blue} />
          <Text style={styles.uploadBtnText}>
            {doc.status === 'rejected' ? 'Re-upload' : 'Upload'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statVal: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 9, color: Colors.gray.text, fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' },

  section: { paddingHorizontal: 14, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 12 },

  uploadBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary.blue + '30',
    borderStyle: 'dashed',
    padding: 28,
    alignItems: 'center',
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.blue + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadMain: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  uploadSub: { fontSize: 12, color: Colors.gray.text, marginBottom: 14 },
  selectBtn: {
    backgroundColor: Colors.primary.blue,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },

  docCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  docHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
  docIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  docMeta: { flex: 1 },
  docNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  docName: { fontSize: 14, fontWeight: '700', color: Colors.dark, flex: 1 },
  requiredBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary.blue,
    backgroundColor: Colors.primary.blue + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  docStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docStatusText: { fontSize: 12, fontWeight: '600' },
  fileName: { fontSize: 11, color: Colors.gray.text, flex: 1 },

  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.error + '10',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  rejectionText: { flex: 1, fontSize: 12, color: Colors.error, lineHeight: 18 },

  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: Colors.primary.blue + '12',
    borderRadius: 8,
    paddingVertical: 8,
  },
  uploadBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary.blue },

  notesInput: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray.border,
    padding: 14,
    fontSize: 14,
    color: Colors.dark,
    minHeight: 100,
  },

  footer: { padding: 16, paddingBottom: 32 },
});
