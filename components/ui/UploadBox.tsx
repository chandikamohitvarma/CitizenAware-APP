import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Upload, Check, File, X, RefreshCw } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

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
      // Trigger the hidden HTML file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    } else {
      onUpload?.();
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
});
