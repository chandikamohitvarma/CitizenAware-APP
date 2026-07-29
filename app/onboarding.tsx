import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ColorValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { ChevronRight, Sparkles, FileSearch, CircleCheck as CheckCircle2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const onboardingData: Array<{
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof FileSearch;
  gradient: readonly [ColorValue, ColorValue, ...ColorValue[]];
}> = [
  {
    id: '1',
    title: 'Discover 180+ Government Schemes',
    subtitle: 'Latest 2026 Schemes Available',
    description: 'Find all government schemes and services in one place. From education to healthcare, discover benefits tailored for you.',
    icon: FileSearch,
    gradient: ['#2563EB', '#3B82F6'] as const,
  },
  {
    id: '2',
    title: 'AI-Powered Recommendations',
    subtitle: 'Personalized Just For You',
    description: 'Our smart AI analyzes your profile and suggests the most relevant schemes you are eligible for.',
    icon: Sparkles,
    gradient: ['#7C3AED', '#8B5CF6'] as const,
  },
  {
    id: '3',
    title: 'Easy Application Process',
    subtitle: 'Apply & Track Seamlessly',
    description: 'Apply for schemes with a simple step-by-step process. Track your applications in real-time.',
    icon: CheckCircle2,
    gradient: ['#059669', '#10B981'] as const,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setOnboardingCompleted } = useAuthStore();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    setOnboardingCompleted(true);
    router.replace('/auth/login');
  };

  const renderItem = ({ item, index }: { item: typeof onboardingData[0]; index: number }) => {
    const Icon = item.icon;
    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <View style={styles.iconContainer}>
            <Icon size={80} color={Colors.white} strokeWidth={1.5} />
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.skipContainer}>
        {currentIndex < onboardingData.length - 1 && (
          <TouchableOpacity onPress={handleGetStarted}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={renderItem}
      />

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                { backgroundColor: index === currentIndex ? Colors.primary.blue : Colors.gray.border },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={onboardingData[currentIndex].gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <ChevronRight size={20} color={Colors.white} strokeWidth={2} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 15,
    color: Colors.gray.text,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
  },
  gradientContainer: {
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.blue,
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    color: Colors.gray.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
