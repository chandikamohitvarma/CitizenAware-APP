import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bookmark, Users, Calendar, ChevronRight, AlertTriangle, Sparkles } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Scheme } from '@/types';
import { isSchemeExpired } from '@/lib/schemeUtils';

interface SchemeCardProps {
  scheme: Scheme;
  onPress?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  compact?: boolean;
}

export function SchemeCard({ scheme, onPress, onSave, isSaved = false, compact = false }: SchemeCardProps) {
  const expired = isSchemeExpired(scheme);

  const content = (
    <>
      {scheme.image && !compact && (
        <Image source={{ uri: scheme.image }} style={styles.image} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{scheme.category}</Text>
            <View style={styles.aiBadge}>
              <Sparkles size={10} color="#047857" />
              <Text style={styles.aiBadgeText}>AI Eligible</Text>
            </View>
            {expired && (
              <View style={styles.expiredBadge}>
                <AlertTriangle size={10} color="#991B1B" />
                <Text style={styles.expiredBadgeText}>EXPIRED</Text>
              </View>
            )}
          </View>

          {onSave && (
            <TouchableOpacity onPress={onSave} style={styles.bookmarkButton}>
              <Bookmark
                size={20}
                color={isSaved ? Colors.primary.blue : Colors.gray.icon}
                fill={isSaved ? Colors.primary.blue : 'transparent'}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {scheme.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {scheme.description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.stat}>
            <Users size={14} color={Colors.gray.text} />
            <Text style={styles.statText}>{scheme.applied.toLocaleString()} applied</Text>
          </View>
          <View style={styles.stat}>
            <Calendar size={14} color={expired ? '#DC2626' : Colors.gray.text} />
            <Text style={[styles.statText, expired && styles.expiredStatText]}>
              {expired ? `Ended ${scheme.deadline}` : scheme.deadline}
            </Text>
          </View>
        </View>
        <View style={styles.benefits}>
          <Text style={styles.benefitsLabel}>Benefits:</Text>
          <Text style={styles.benefitsValue}>{scheme.benefits}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={Colors.gray.icon} style={styles.chevron} />
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.container, compact && styles.compactContainer]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.container, compact && styles.compactContainer]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginVertical: 8,
    overflow: 'hidden',
    ...Colors.shadows?.md || {},
  },
  compactContainer: {
    marginVertical: 4,
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.blue,
    textTransform: 'uppercase',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },

  expiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  expiredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991B1B',
  },
  bookmarkButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.gray.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.gray.text,
  },
  expiredStatText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitsLabel: {
    fontSize: 12,
    color: Colors.gray.text,
    marginRight: 4,
  },
  benefitsValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.green,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});
