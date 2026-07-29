import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Upload, Check, File, X } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface UploadBoxProps {
  label: string;
  description?: string;
  uploaded?: boolean;
  verified?: boolean;
  fileSize?: string;
  onUpload?: () => void;
  onRemove?: () => void;
  required?: boolean;
}

export function UploadBox({
  label,
  description,
  uploaded = false,
  verified = false,
  fileSize,
  onUpload,
  onRemove,
  required = false,
}: UploadBoxProps) {
  return (
    <View style={[styles.container, uploaded && styles.containerUploaded]}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            uploaded && styles.iconContainerUploaded,
            verified && styles.iconContainerVerified,
          ]}
        >
          {verified ? (
            <Check size={24} color={Colors.white} />
          ) : uploaded ? (
            <File size={24} color={Colors.primary.blue} />
          ) : (
            <Upload size={24} color={Colors.gray.icon} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
          {uploaded && fileSize && (
            <Text style={styles.fileSize}>{fileSize}</Text>
          )}
          {verified && (
            <Text style={styles.verifiedText}>Verified</Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        {uploaded ? (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <X size={20} color={Colors.error} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onUpload} style={styles.uploadButton}>
            <Text style={styles.uploadText}>
              {uploaded ? 'Replace' : 'Upload'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 12,
  },
  containerUploaded: {
    borderColor: Colors.primary.green,
    borderStyle: 'solid',
    backgroundColor: Colors.success + '08',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerUploaded: {
    backgroundColor: Colors.primary.blue + '15',
  },
  iconContainerVerified: {
    backgroundColor: Colors.success,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  required: {
    color: Colors.error,
  },
  description: {
    fontSize: 13,
    color: Colors.gray.text,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.primary.blue,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 4,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
});
