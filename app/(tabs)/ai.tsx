import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Mic, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { ChatBubble } from '@/components/ui';
import { useNotificationStore } from '@/store/notificationStore';

interface AIResult {
  text: string;
  suggestions: string[];
}

function generateSmartAIResponse(userQuery: string): AIResult {
  const q = userQuery.toLowerCase().trim();

  // 1. Education / Scholarships / Students
  if (
    q.includes('education') ||
    q.includes('student') ||
    q.includes('scholarship') ||
    q.includes('nsp') ||
    q.includes('school') ||
    q.includes('college') ||
    q.includes('fee')
  ) {
    return {
      text: 'Here are the top Indian Education & Scholarship Schemes for 2026:\n\n1. **National Scholarship Portal (NSP 2026-27)**: Direct financial grants up to ₹50,000/yr for pre-matric, post-matric & higher studies.\n2. **PM Vidyalaxmi Loan Scheme**: Collateral-free higher education loans up to ₹10 Lakhs with interest subsidies.\n3. **Post-Matric Disability Scholarship**: Special tuition & maintenance allowances.\n\nAll benefits are transferred directly to the student\'s Aadhaar-linked bank account.',
      suggestions: ['Check NSP Eligibility', 'View Education Schemes', 'Apply for NSP'],
    };
  }

  // 2. Health / Ayushman / Hospital / Medical
  if (
    q.includes('health') ||
    q.includes('ayushman') ||
    q.includes('medical') ||
    q.includes('hospital') ||
    q.includes('card')
  ) {
    return {
      text: 'Under **Ayushman Bharat PMJAY 2026 Expansion**:\n\n• Free cashless hospital treatment up to ₹5 Lakh per family per year.\n• Empanelled across 29,000+ top government and private hospitals across India.\n• **2026 Update**: Now covers all senior citizens aged 70+ regardless of family income level!\n\nRequired Documents: Aadhaar Card, Ration Card / Domicile Proof.',
      suggestions: ['Check Ayushman Eligibility', 'Apply for Ayushman Card', 'Empanelled Hospitals'],
    };
  }

  // 3. Farmers / Agriculture / PM-Kisan
  if (
    q.includes('kisan') ||
    q.includes('farmer') ||
    q.includes('agriculture') ||
    q.includes('crop') ||
    q.includes('land') ||
    q.includes('rythu')
  ) {
    return {
      text: 'Under **PM-Kisan 23rd Installment (2026)**:\n\n• Eligible landholding farmers receive ₹6,000 per year directly in 3 installments of ₹2,000.\n• Payments are credited directly via e-KYC Aadhaar Direct Benefit Transfer (DBT).\n\nState schemes like **Rythu Bandhu (Telangana)** provide additional ₹10,000/acre per year for agricultural inputs.',
      suggestions: ['Check PM-Kisan Status', 'Apply for PM-Kisan', 'State Farmer Schemes'],
    };
  }

  // 4. Housing / PM Awas
  if (
    q.includes('housing') ||
    q.includes('awas') ||
    q.includes('home') ||
    q.includes('house')
  ) {
    return {
      text: 'Under **PM Awas Yojana-Urban 2.0 (2026)**:\n\n• Interest subsidies & financial grants up to ₹2.5 Lakh for EWS/LIG families buying or constructing their first pucca house.\n• Direct credit to bank account linked via Aadhaar e-KYC.\n\nRequired Documents: Aadhaar Card, Income Certificate, Domicile Proof, Bank Passbook.',
      suggestions: ['Check PM Awas Eligibility', 'Apply for PM Awas', 'Required Documents'],
    };
  }

  // 5. Loans / Business / MUDRA / Vishwakarma
  if (
    q.includes('business') ||
    q.includes('loan') ||
    q.includes('mudra') ||
    q.includes('vishwakarma') ||
    q.includes('artisan') ||
    q.includes('startup')
  ) {
    return {
      text: 'Top Self-Employment & Business Credit Schemes for 2026:\n\n1. **PM Vishwakarma Yojana 2026**: ₹3 Lakh collateral-free loan @ 5% interest + ₹15,000 toolkit incentive for traditional artisans.\n2. **MUDRA Loan 2026**: Collateral-free loans (Shishu up to ₹50k, Kishore up to ₹5L, Tarun up to ₹10L).\n3. **Stand-Up India**: ₹10 Lakh to ₹1 Crore loans for SC/ST & Women entrepreneurs.',
      suggestions: ['Apply PM Vishwakarma', 'Apply MUDRA Loan', 'Check Loan Eligibility'],
    };
  }

  // 6. Women & Girl Child
  if (
    q.includes('women') ||
    q.includes('girl') ||
    q.includes('sukanya') ||
    q.includes('ladki') ||
    q.includes('bahin') ||
    q.includes('amma') ||
    q.includes('lakshmi')
  ) {
    return {
      text: 'Top 2026 Schemes for Women & Girl Child:\n\n1. **Sukanya Samriddhi Yojana**: High 8.2% tax-free interest rate for savings in the name of a girl child under 10 yrs.\n2. **Majhi Ladki Bahin / Gruha Lakshmi**: ₹1,500 - ₹2,000 monthly direct financial support for women heads of family.\n3. **Kanya Sumangala Yojana (UP)**: Up to ₹25,000 financial support for girl education.',
      suggestions: ['Sukanya Samriddhi', 'Majhi Ladki Bahin', 'Apply Women Schemes'],
    };
  }

  // 7. Track Application / Status
  if (
    q.includes('track') ||
    q.includes('status') ||
    q.includes('application') ||
    q.includes('my app')
  ) {
    return {
      text: 'You can track real-time processing status for all your submitted government scheme applications directly from your profile.\n\nAverage processing timelines:\n• Document Verification: 24 - 48 Hours\n• Ministry Approval: 3 - 5 Working Days\n• Direct Benefit Transfer (DBT): Within 7 Days of Approval.',
      suggestions: ['View Applications', 'Check DBT Status', 'Help & Support'],
    };
  }

  // 8. Eligibility Check / Criteria
  if (
    q.includes('eligible') ||
    q.includes('eligibility') ||
    q.includes('criteria') ||
    q.includes('am i') ||
    q.includes('can i')
  ) {
    return {
      text: 'Eligibility for government schemes is evaluated based on 4 key factors:\n\n1. **Age**: 18-60 years (or specific ranges for child/senior schemes).\n2. **Annual Family Income**: Under ₹2.5 Lakh (BPL/EWS) or up to ₹8 Lakh (LIG/MIG).\n3. **Category / Social Status**: SC, ST, OBC, EWS, Women, Disabled, Artisans, Farmers.\n4. **State / Domicile**: Specific state residence requirement for regional schemes.\n\nUse our built-in Eligibility Checker to test your profile against 15+ schemes!',
      suggestions: ['Run Eligibility Evaluator', 'Filter Schemes by State', 'Explore All Schemes'],
    };
  }

  // 9. Follow up / Tell me more / Apply now
  if (q.includes('tell me more') || q.includes('more') || q.includes('detail') || q.includes('explain')) {
    return {
      text: 'Indian Government Schemes in 2026 provide Direct Benefit Transfers (DBT) directly into your Aadhaar-linked bank account.\n\nKey highlights:\n• 100% Digital process with minimal documentation\n• Direct bank credit without middlemen\n• Real-time status notifications & SMS updates\n\nSelect a scheme below or click "Apply Now" to start your 6-step online application!',
      suggestions: ['Check My Eligibility', 'Explore All Schemes', 'View Required Documents'],
    };
  }

  if (q.includes('apply now') || q.includes('apply') || q.includes('how to apply')) {
    return {
      text: 'Applying is simple and takes under 3 minutes!\n\n**6-Step Application Process**:\n1. Personal Information (Name, DOB, Gender, Mobile)\n2. Residential Address & State/District Selection\n3. Annual Income & Category Details\n4. Dynamic Scheme Document Upload\n5. DBT Bank Account & IFSC Code\n6. Review & One-Click Submission',
      suggestions: ['Explore All Schemes', 'Check Eligibility First', 'View My Profile'],
    };
  }

  // 10. Generic fallback response
  return {
    text: `Here is the relevant information for "${userQuery}":\n\nCitizenAware connects Indian citizens with 2026 Central & State Government Welfare Schemes. Benefits range from direct financial assistance, subsidized loans, free healthcare, housing grants, to educational scholarships.\n\nWould you like to check your eligibility or explore schemes for your state?`,
    suggestions: ['Check Scheme Eligibility', 'Find Education Schemes', 'Business Loan Schemes'],
  };
}

import { askAI } from '@/lib/gemini';
import { useAuthStore } from '@/store/authStore';

export default function AIScreen() {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const user = useAuthStore((state) => state.user);
  const { sendMessage, chatMessages: messages, isTyping, addAIResponse, setTyping } = useNotificationStore();

  useEffect(() => {
    if (messages.length === 0) {
      addAIResponse(
        "👋 Welcome! I am **CitizenAware AI** powered by Gemini.\n\nAsk me anything about:\n• Which government schemes am I eligible for?\n• What documents are required for PM Kisan?\n• Why am I not eligible?\n• Which scheme is best for me?\n• What is the status of my application?\n\nType a question below or tap a quick prompt!",
        ['Run AI Eligibility Engine', 'What documents are required for PM Kisan?', 'Which scheme is best for me?', 'Ayushman Bharat Cover']
      );
    }
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const query = input.trim();
    sendMessage(query);
    setInput('');
    setTyping(true);

    try {
      const res = await askAI(query, user);
      addAIResponse(res.answer || res.text, res.suggestions);
    } catch {
      const result = generateSmartAIResponse(query);
      addAIResponse(result.text, result.suggestions);
    }
  };

  const handleSuggestionPress = async (suggestion: string) => {
    if (suggestion === 'Run AI Eligibility Engine' || suggestion === 'Check Scheme Eligibility') {
      router.push('/scheme/ai-recommendations');
      return;
    }
    sendMessage(suggestion);
    setTyping(true);
    try {
      const res = await askAI(suggestion, user);
      addAIResponse(res.answer || res.text, res.suggestions);
    } catch {
      const result = generateSmartAIResponse(suggestion);
      addAIResponse(result.text, result.suggestions);
    }
  };



  const handleVoice = () => {
    router.push('/scheme/ai-recommendations');
  };

  const quickActions = [
    { label: '🤖 AI Eligibility Evaluator', query: 'Run AI Eligibility Engine' },
    { label: '🎓 Education & Scholarships', query: 'Show education schemes for students' },
    { label: '🌾 Farmer & Agriculture', query: 'Show PM-Kisan and farmer schemes' },
    { label: '🏥 Ayushman Health Cover', query: 'Show health and Ayushman Bharat schemes' },
    { label: '💼 Business & MUDRA Loans', query: 'Show business loan and MUDRA schemes' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.primary.blue, Colors.primary.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Sparkles size={24} color={Colors.white} />
            <View style={styles.headerText}>
              <Text style={styles.title}>AI Scheme Assistant</Text>
              <Text style={styles.subtitle}>Ask anything about 2026 government schemes & eligibility</Text>
            </View>
          </View>
        </LinearGradient>
      </View>


      <ScrollView style={styles.quickActions} horizontal showsHorizontalScrollIndicator={false}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickChip}
            onPress={() => handleSuggestionPress(action.query)}
          >
            <Text style={styles.quickText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} onSuggestionPress={handleSuggestionPress} />
          ))}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleVoice} style={styles.voiceButton}>
            <Mic size={22} color={Colors.primary.blue} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about schemes, eligibility, loans..."
              placeholderTextColor={Colors.gray.icon}
              style={styles.input}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <LinearGradient
              colors={[Colors.primary.blue, Colors.primary.green]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendGradient}
            >
              <Send size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    borderRadius: 16,
    margin: 16,
    marginBottom: 0,
    overflow: 'hidden',
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGradient: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.white + 'CC',
    marginTop: 2,
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  quickChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.primary.blue + '30',
  },
  quickText: {
    fontSize: 13,
    color: Colors.primary.blue,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.blue,
    opacity: 0.4,
  },
  typingDot2: {
    marginLeft: 4,
    opacity: 0.6,
  },
  typingDot3: {
    marginLeft: 4,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.gray.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    color: Colors.dark,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
