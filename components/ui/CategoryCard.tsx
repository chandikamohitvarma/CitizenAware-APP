import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { Category } from '@/types';
import * as Icons from 'lucide-react-native';

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryCard({ category, onPress, size = 'md' }: CategoryCardProps) {
  const IconComponent = (Icons as any)[category.icon] || Icons.Folder;

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 24;
      case 'lg':
        return 36;
      default:
        return 28;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 11;
      case 'lg':
        return 15;
      default:
        return 13;
    }
  };

  const iconSize = getIconSize();
  const textSize = getTextSize();

  const content = (
    <>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: category.color + '25' },
        ]}
      >
        <IconComponent size={iconSize} color={category.color} />
      </View>
      <Text
        style={[styles.name, { fontSize: textSize }]}
        numberOfLines={2}
      >
        {category.name}
      </Text>
      <Text style={[styles.count, { fontSize: textSize - 2 }]}>
        {category.count} schemes
      </Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.container,
          { backgroundColor: category.color + '15' },
        ]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: category.color + '15' }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    fontWeight: '600',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 4,
  },
  count: {
    color: Colors.gray.text,
    textAlign: 'center',
  },
});
