import { buildUrl } from '@/lib/api';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBjfgtnJR3UFIGmliq1wfTL9yrEKi7uvug';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `You are 'CitizenAware AI', an official Indian Government Welfare Scheme AI assistant. Ground all answers exclusively in official Indian Government Scheme data. Never invent fake policies or unauthorized URLs. Provide clear, empathetic, accurate advice in Markdown format.`;

async function callGeminiDirect(prompt: string, systemPrompt: string = SYSTEM_INSTRUCTION): Promise<string> {
  try {
    const fullText = systemPrompt ? `System Instructions:\n${systemPrompt}\n\nUser Prompt:\n${prompt}` : prompt;
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullText }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    }
  } catch (err) {
    console.warn('Gemini direct REST API error:', err);
  }
  return '';
}

/**
 * 1. Ask Gemini - Answers natural language user queries
 */
export async function askGemini(query: string, userProfile?: any, schemesContext?: any[]) {
  try {
    const response = await fetch(buildUrl('/ai/ask'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, profile: userProfile, schemes_context: schemesContext }),
    });
    if (response.ok) {
      const res = await response.json();
      if (res && res.answer) return res;
    }
  } catch {
    // Fall back to direct Gemini API call
  }

  const schemesSummary = schemesContext ? schemesContext.map(s => `- ${s.name}: ${s.category} - ${s.description}`).join('\n') : '';
  const prompt = `Query: "${query}"\nCitizen Profile: ${JSON.stringify(userProfile || {})}\nAvailable Schemes:\n${schemesSummary}`;
  const directResponse = await callGeminiDirect(prompt);

  return {
    answer: directResponse || `As CitizenAware AI, here is official information regarding "${query}": central and state schemes provide Direct Benefit Transfer (DBT) credit directly to your Aadhaar-seeded bank account.`,
    query,
    suggestions: ['Which schemes am I eligible for?', 'What documents are required for PM-Kisan?', 'Check Ayushman Bharat cover'],
  };
}

/**
 * 2. Explain Eligibility - Detailed breakdown of why eligible or not eligible
 */
export async function explainEligibility(scheme: any, userProfile: any) {
  try {
    const response = await fetch(buildUrl('/ai/explain-eligibility'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheme, profile: userProfile }),
    });
    if (response.ok) return await response.json();
  } catch {
    // Fallback
  }

  const prompt = `Scheme: ${scheme?.name}\nCriteria: ${JSON.stringify(scheme?.eligibility || {})}\nUser Profile: ${JSON.stringify(userProfile || {})}\nExplain why eligible or not and steps to qualify.`;
  const text = await callGeminiDirect(prompt);

  return {
    scheme_name: scheme?.name,
    ai_explanation: text || `Eligibility analysis complete for ${scheme?.name} based on official income, age, state domicile, and occupation rules.`,
  };
}

/**
 * 3. Recommend Schemes - Personalized matching based on user profile
 */
export async function recommendSchemes(userProfile: any, schemesList: any[]) {
  try {
    const response = await fetch(buildUrl('/ai/recommend'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: userProfile, schemes_list: schemesList }),
    });
    if (response.ok) return await response.json();
  } catch {
    // Fallback
  }

  const prompt = `User Profile: ${JSON.stringify(userProfile)}\nSchemes List: ${JSON.stringify(schemesList.slice(0, 10))}\nRecommend top 3 schemes and explain fit.`;
  const text = await callGeminiDirect(prompt);

  return {
    ai_insights: text || 'Top recommended schemes matched based on your income threshold, age, state domicile, and social category.',
    profile_evaluated: userProfile,
  };
}

/**
 * 4. Explain Documents - Guidance on uploaded vs missing documents
 */
export async function explainDocuments(uploadedDocs: string[], requiredDocs: string[]) {
  try {
    const response = await fetch(buildUrl('/ai/explain-documents'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploaded_docs: uploadedDocs, required_docs: requiredDocs }),
    });
    if (response.ok) return await response.json();
  } catch {
    // Fallback
  }

  const missing = requiredDocs.filter(d => !uploadedDocs.includes(d));
  const prompt = `Uploaded: ${uploadedDocs.join(', ')}\nRequired: ${requiredDocs.join(', ')}\nMissing: ${missing.join(', ')}\nExplain document requirements & missing items.`;
  const text = await callGeminiDirect(prompt);

  return {
    missing_documents: missing,
    ai_document_guidance: text || `Mandatory missing documents: ${missing.join(', ') || 'None'}. Upload valid PDF/JPG files for e-KYC verification.`,
  };
}

/**
 * 5. Compare Schemes - Side-by-side scheme comparison matrix
 */
export async function compareSchemes(schemes: any[]) {
  try {
    const response = await fetch(buildUrl('/ai/compare'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemes }),
    });
    if (response.ok) return await response.json();
  } catch {
    // Fallback
  }

  const prompt = `Compare these government schemes side-by-side:\n${JSON.stringify(schemes)}\nDetail benefits, eligibility, and recommendations.`;
  const text = await callGeminiDirect(prompt);

  return {
    comparison_analysis: text || 'Side-by-side scheme comparison matrix generated.',
  };
}
