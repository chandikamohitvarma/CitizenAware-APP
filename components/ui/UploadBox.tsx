import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { Upload, Check, File, X, RefreshCw, Camera as CameraIcon, Image as ImageIcon, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface UploadBoxProps {
  label: string;
  description?: string;
  uploaded?: boolean;
  verified?: boolean;
  fileSize?: string;
  fileName?: string;
  onUpload?: (file?: { name: string; size: number; uri: string }) => void;
  onRemove?: () => void;
  required?: boolean;
}

export function UploadBox({
  label,
  description,
  uploaded = false,
  verified = false,
  fileSize,
  fileName,
  onUpload,
  onRemove,
  required = false,
}: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localFile, setLocalFile] = useState<{ name: string; size: string } | null>(null);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const isUploaded = uploaded || !!localFile;
  const displayName = fileName || localFile?.name;
  const displaySize = fileSize || localFile?.size;

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePress = () => {
    if (Platform.OS === 'web') {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    } else {
      setPickerModalVisible(true);
    }
  };

  const processFile = (name: string, size: number, uri: string) => {
    const sizeStr = formatBytes(size);
    setLocalFile({ name, size: sizeStr });
    onUpload?.({ name, size, uri });
  };

  const handlePickDocument = async () => {
    setPickerModalVisible(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        processFile(asset.name || 'document.pdf', asset.size || 1024 * 350, asset.uri);
      }
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

  const handlePickCamera = async () => {
    setPickerModalVisible(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        alert('Camera permission is required to capture photos of your documents.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const name = asset.fileName || `${label.replace(/\s+/g, '_')}_photo.jpg`;
        processFile(name, asset.fileSize || 1024 * 500, asset.uri);
      }
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  const handlePickGallery = async () => {
    setPickerModalVisible(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('Gallery access permission is required to select document photos.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsEditing: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const name = asset.fileName || `${label.replace(/\s+/g, '_')}_doc.jpg`;
        processFile(name, asset.fileSize || 1024 * 450, asset.uri);
      }
    } catch (err) {
      console.warn('Gallery picker error:', err);
    }
  };

  const handleWebFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const sizeStr = formatBytes(file.size);
    setLocalFile({ name: file.name, size: sizeStr });

    const reader = new FileReader();
    reader.onload = () => {
      onUpload?.({
        name: file.name,
        size: file.size,
        uri: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setLocalFile(null);
    onRemove?.();
  };

  return (
    <View style={[styles.container, isUploaded && styles.containerUploaded]}>

      {/* Hidden file input for web */}
      {Platform.OS === 'web' && (
        <input
          ref={(el) => {
            fileInputRef.current = el;
            if (el) el.onchange = handleWebFileChange;
          }}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
        />
      )}

      <View style={styles.row}>
        {/* Left icon */}
        <View style={[
          styles.iconBox,
          isUploaded && styles.iconBoxUploaded,
          verified && styles.iconBoxVerified,
        ]}>
          {verified ? (
            <Check size={22} color={Colors.white} />
          ) : isUploaded ? (
            <File size={22} color={Colors.primary.blue} />
          ) : (
            <Upload size={22} color={Colors.gray.icon} />
          )}
        </View>

        {/* Text info */}
        <View style={styles.info}>
          <Text style={styles.docLabel}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {!isUploaded && description && (
            <Text style={styles.description}>{description}</Text>
          )}
          {isUploaded && displayName && (
            <Text style={styles.fileName} numberOfLines={1}>{displayName}</Text>
          )}
          {isUploaded && displaySize && (
            <Text style={styles.fileSize}>{displaySize}</Text>
          )}
          {verified && (
            <Text style={styles.verifiedText}>✓ Verified</Text>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {isUploaded ? (
            <View style={styles.uploadedActions}>
              {/* Replace button */}
              <TouchableOpacity onPress={handlePress} style={styles.replaceBtn}>
                <RefreshCw size={16} color={Colors.primary.blue} />
              </TouchableOpacity>
              {/* Remove button */}
              <TouchableOpacity onPress={handleRemove} style={styles.removeBtn}>
                <X size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handlePress} style={styles.uploadBtn}>
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Uploaded success bar */}
      {isUploaded && !verified && (
        <View style={styles.successBar}>
          <View style={styles.successDot} />
          <Text style={styles.successText}>File selected — ready to submit</Text>
        </View>
      )}

      {/* Native Mobile Document Upload Modal */}
      <Modal
        visible={pickerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerModalVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Upload {label}</Text>
            <Text style={styles.modalSubtitle}>Choose a method to attach your official document</Text>

            <TouchableOpacity style={styles.modalOption} onPress={handlePickDocument}>
              <View style={[styles.modalOptionIcon, { backgroundColor: '#E0F2FE' }]}>
                <FileText size={22} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOptionTitle}>Browse Files / PDF</Text>
                <Text style={styles.modalOptionSub}>Select PDF or document file from your device</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handlePickCamera}>
              <View style={[styles.modalOptionIcon, { backgroundColor: '#FEE2E2' }]}>
                <CameraIcon size={22} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOptionTitle}>Take Photo with Camera</Text>
                <Text style={styles.modalOptionSub}>Capture a live clear photo of your document</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handlePickGallery}>
              <View style={[styles.modalOptionIcon, { backgroundColor: '#FEF3C7' }]}>
                <ImageIcon size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOptionTitle}>Choose from Photo Gallery</Text>
                <Text style={styles.modalOptionSub}>Select an existing photo from gallery</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setPickerModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray.border,
    borderStyle: 'dashed',
    padding: 14,
    marginBottom: 12,
  },
  containerUploaded: {
    borderColor: Colors.primary.blue,
    borderStyle: 'solid',
    backgroundColor: Colors.primary.blue + '06',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBoxUploaded: {
    backgroundColor: Colors.primary.blue + '18',
  },
  iconBoxVerified: {
    backgroundColor: Colors.success,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  docLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  required: { color: Colors.error },
  description: {
    fontSize: 12,
    color: Colors.gray.text,
  },
  fileName: {
    fontSize: 12,
    color: Colors.primary.blue,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 11,
    color: Colors.gray.text,
    marginTop: 1,
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  actions: {
    flexShrink: 0,
  },
  uploadBtn: {
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  uploadedActions: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  replaceBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary.blue + '12',
  },
  removeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.error + '12',
  },
  successBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.primary.blue + '20',
  },
  successDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary.blue,
  },
  successText: {
    fontSize: 11,
    color: Colors.primary.blue,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  modalOptionSub: {
    fontSize: 12,
    color: '#64748B',
  },
  modalCancelBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
