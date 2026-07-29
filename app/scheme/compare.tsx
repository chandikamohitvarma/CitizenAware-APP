import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, Header } from '@/components/ui';
import { schemes } from '@/constants/data';

export default function CompareSchemesScreen() {
  const compareSchemes = schemes.slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Compare Schemes" showBack onBackPress={() => router.back()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.label}>Scheme Name</Text>
            </View>
            {compareSchemes.map((scheme) => (
              <View key={scheme.id} style={styles.valueCell}>
                <Text style={styles.title}>{scheme.name}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.row, styles.oddRow]}>
            <View style={styles.labelCell}><Text style={styles.label}>Category</Text></View>
            {compareSchemes.map((s) => <View key={s.id} style={styles.valueCell}><Text style={styles.value}>{s.category}</Text></View>)}
          </View>
          <View style={styles.row}>
            <View style={styles.labelCell}><Text style={styles.label}>Benefits</Text></View>
            {compareSchemes.map((s) => <View key={s.id} style={styles.valueCell}><Text style={styles.value}>{s.benefits}</Text></View>)}
          </View>
          <View style={[styles.row, styles.oddRow]}>
            <View style={styles.labelCell}><Text style={styles.label}>Deadline</Text></View>
            {compareSchemes.map((s) => <View key={s.id} style={styles.valueCell}><Text style={styles.value}>{s.deadline}</Text></View>)}
          </View>
          <View style={styles.row}>
            <View style={styles.labelCell}><Text style={styles.label}>Applied</Text></View>
            {compareSchemes.map((s) => <View key={s.id} style={styles.valueCell}><Text style={styles.value}>{s.applied.toLocaleString()}</Text></View>)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  table: { margin: 16 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  oddRow: { backgroundColor: Colors.gray.light },
  labelCell: { width: 100, padding: 12 },
  valueCell: { flex: 1, padding: 12, maxWidth: 180 },
  label: { fontWeight: '600', fontSize: 14, color: Colors.gray.text },
  title: { fontWeight: '600', fontSize: 15, color: Colors.dark },
  value: { fontSize: 14, color: Colors.dark },
});
