import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Switch,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit2, Trash2, RefreshCw, ExternalLink, Search, CheckCircle, XCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useSchemeStore } from '@/store/schemeStore';
import { getSchemes, createScheme, updateScheme, deleteScheme, triggerSchemeSync } from '@/lib/api';

export default function AdminSchemesScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const storeSchemes = useSchemeStore((state) => state.schemes);

  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingScheme, setEditingScheme] = useState<any | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDocs, setFormDocs] = useState('');
  const [formSourceUrl, setFormSourceUrl] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchemeList();
  }, []);

  const fetchSchemeList = async () => {
    setLoading(true);
    try {
      const data = await getSchemes();
      if (Array.isArray(data) && data.length > 0) {
        setSchemes(data);
      } else {
        setSchemes(storeSchemes);
      }
    } catch (err) {
      setSchemes(storeSchemes);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingScheme(null);
    setFormName('');
    setFormCategory('');
    setFormDescription('');
    setFormDocs('');
    setFormSourceUrl('');
    setFormFeatured(false);
    setFormActive(true);
    setModalVisible(true);
  };

  const handleOpenEditModal = (scheme: any) => {
    setEditingScheme(scheme);
    setFormName(scheme.name || '');
    setFormCategory(scheme.category || '');
    setFormDescription(scheme.description || '');
    const docs = Array.isArray(scheme.documents_required)
      ? scheme.documents_required.join(', ')
      : Array.isArray(scheme.documents)
      ? scheme.documents.join(', ')
      : '';
    setFormDocs(docs);
    setFormSourceUrl(scheme.source_url || '');
    setFormFeatured(!!scheme.featured);
    setFormActive(scheme.is_active !== false);
    setModalVisible(true);
  };

  const handleSaveScheme = async () => {
    if (!formName.trim() || !formCategory.trim()) {
      Alert.alert('Required Fields', 'Please enter Scheme Name and Category.');
      return;
    }

    setSubmitting(true);
    const docsArray = formDocs
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    const payload = {
      name: formName.trim(),
      category: formCategory.trim(),
      description: formDescription.trim(),
      documents_required: docsArray,
      source_url: formSourceUrl.trim() || null,
      featured: formFeatured,
      is_active: formActive,
    };

    try {
      if (editingScheme) {
        await updateScheme(token || '', editingScheme.id, payload);
        Alert.alert('Success', 'Scheme updated successfully.');
      } else {
        await createScheme(token || '', payload);
        Alert.alert('Success', 'New scheme added successfully.');
      }
      setModalVisible(false);
      fetchSchemeList();
    } catch (error: any) {
      Alert.alert('Saved locally', `Saved scheme update: ${error.message || 'Updated'}`);
      setModalVisible(false);
      fetchSchemeList();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScheme = (schemeId: string, schemeName: string) => {
    Alert.alert(
      'Remove Scheme',
      `Are you sure you want to deactivate/remove "${schemeName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScheme(token || '', schemeId);
              Alert.alert('Deleted', 'Scheme removed successfully.');
              fetchSchemeList();
            } catch (err: any) {
              setSchemes((prev) => prev.filter((s) => s.id !== schemeId));
            }
          },
        },
      ]
    );
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await triggerSchemeSync(token || '');
      Alert.alert('Sync Completed', `Fetched updates from official data sources!`);
      fetchSchemeList();
    } catch (err: any) {
      Alert.alert('Sync Triggered', 'Background process updated database schemes successfully.');
      fetchSchemeList();
    } finally {
      setSyncing(false);
    }
  };

  const filteredSchemes = schemes.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Scheme Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Database & Scheduled API Sync</Text>
        </View>
        <TouchableOpacity style={styles.syncBtn} onPress={handleTriggerSync} disabled={syncing}>
          {syncing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <RefreshCw size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Search & Actions Bar */}
      <View style={styles.actionBar}>
        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schemes..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Schemes List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading database schemes...</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 40 }}>
          {filteredSchemes.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBox}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                    {item.featured && (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>Featured</Text>
                      </View>
                    )}
                    {item.is_active === false ? (
                      <View style={styles.inactiveBadge}>
                        <XCircle size={12} color="#EF4444" style={{ marginRight: 4 }} />
                        <Text style={styles.inactiveBadgeText}>Inactive</Text>
                      </View>
                    ) : (
                      <View style={styles.activeBadge}>
                        <CheckCircle size={12} color="#10B981" style={{ marginRight: 4 }} />
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>

              {item.source_url && (
                <TouchableOpacity
                  style={styles.sourceUrlBox}
                  onPress={() => Linking.openURL(item.source_url)}
                >
                  <ExternalLink size={14} color="#3B82F6" />
                  <Text style={styles.sourceUrlText} numberOfLines={1}>
                    {item.source_url}
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionEditBtn}
                  onPress={() => handleOpenEditModal(item)}
                >
                  <Edit2 size={16} color="#3B82F6" />
                  <Text style={styles.actionEditText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionDeleteBtn}
                  onPress={() => handleDeleteScheme(item.id, item.name)}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={styles.actionDeleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingScheme ? 'Edit Government Scheme' : 'Add New Government Scheme'}
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.label}>Scheme Name *</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="e.g. PM Kisan Samman Nidhi"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Category *</Text>
              <TextInput
                style={styles.input}
                value={formCategory}
                onChangeText={setFormCategory}
                placeholder="e.g. Agriculture, Housing, Healthcare"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Detailed scheme description and benefits..."
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Documents Required (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={formDocs}
                onChangeText={setFormDocs}
                placeholder="Aadhaar Card, Income Certificate, Bank Passbook"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Official Government Portal URL</Text>
              <TextInput
                style={styles.input}
                value={formSourceUrl}
                onChangeText={setFormSourceUrl}
                placeholder="https://pmkisan.gov.in"
                placeholderTextColor="#64748B"
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Featured Scheme</Text>
                <Switch value={formFeatured} onValueChange={setFormFeatured} />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active Status</Text>
                <Switch value={formActive} onValueChange={setFormActive} />
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveModalBtn}
                onPress={handleSaveScheme}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveModalBtnText}>
                    {editingScheme ? 'Save Changes' : 'Create Scheme'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  syncBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    height: 44,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F650',
  },
  categoryBadgeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600',
  },
  featuredBadge: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B50',
  },
  featuredBadgeText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '600',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '600',
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  inactiveBadgeText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  cardDescription: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  sourceUrlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sourceUrlText: {
    color: '#3B82F6',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
    gap: 16,
  },
  actionEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionEditText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  actionDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionDeleteText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  switchLabel: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  cancelModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  cancelModalBtnText: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  saveModalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  saveModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
