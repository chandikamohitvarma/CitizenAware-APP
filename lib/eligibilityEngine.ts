import { Linking } from 'react-native';
import { router } from 'expo-router';

export function evaluateAndProceedScheme(
  scheme: any,
  userProfile: any,
  createApplicationFn?: Function
) {
  if (!scheme) return;

  let isEligible = true;
  const declineReasons: string[] = [];

  const age = userProfile?.age ? Number(userProfile.age) : 25;
  const income = userProfile?.income ? Number(userProfile.income) : 250000;
  const state = userProfile?.state || 'Telangana';

  // 1. State Domicile Check
  if (scheme.state && scheme.state !== 'All India (Central)') {
    if (state.toLowerCase().trim() !== scheme.state.toLowerCase().trim()) {
      isEligible = false;
      declineReasons.push(`State Domicile Mismatch: Scheme requires resident of ${scheme.state} (Your Profile State: ${state}).`);
    }
  }

  // 2. Income Threshold Check
  const maxIncome = scheme.income_limit || scheme.incomeLimit || 500000;
  if (income > maxIncome && scheme.category !== 'Agriculture') {
    isEligible = false;
    declineReasons.push(`Income Limit Exceeded: Annual family income ₹${income.toLocaleString('en-IN')} exceeds threshold limit of ₹${maxIncome.toLocaleString('en-IN')}/year.`);
  }

  // 3. Category / Occupation check (if specified)
  if (scheme.required_category && userProfile?.category) {
    if (scheme.required_category.toLowerCase() !== userProfile.category.toLowerCase()) {
      isEligible = false;
      declineReasons.push(`Category Mismatch: Required category ${scheme.required_category} (Your Category: ${userProfile.category}).`);
    }
  }

  if (isEligible) {
    // User IS ELIGIBLE -> Create tracking entry, open official portal & show tracking
    if (createApplicationFn) {
      createApplicationFn(
        scheme.id,
        userProfile?.id,
        { name: scheme.name, documents: scheme.documents || scheme.documents_required || [] },
        'submitted'
      );
    }

    const portalUrl = scheme.source_url || 'https://services.india.gov.in';
    Linking.openURL(portalUrl).catch(() => Linking.openURL('https://services.india.gov.in'));
    router.push('/application/tracking');
  } else {
    // User IS NOT ELIGIBLE -> Show DECLINED / NOT ELIGIBLE result screen
    router.push({
      pathname: '/scheme/eligibility-result',
      params: {
        schemeId: scheme.id,
        schemeName: scheme.name,
        isEligible: 'false',
        selectedState: state,
        reasons: JSON.stringify(declineReasons),
      },
    });
  }
}
