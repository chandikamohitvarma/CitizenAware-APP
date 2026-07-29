/*
  # Seed latest government schemes for 2026

  1. Data
    - Insert 20+ modern government schemes
    - Include categories, eligibility, documents required
    - Mark featured schemes for home screen
*/

INSERT INTO schemes (name, description, category, eligibility, documents_required, featured) VALUES
('Digital India Initiative 2026', 'Universal broadband access and digital literacy for all citizens', 'Digital Infrastructure', jsonb_build_object('requirements', ARRAY['Age 18+', 'Indian resident', 'No internet access']), ARRAY['Aadhaar', 'Domicile proof', 'Income certificate'], true),
('Skill India 4.0', 'Advanced AI and digital skills training for youth employment', 'Skills & Employment', jsonb_build_object('requirements', ARRAY['Age 18-45', '10th pass', 'Unemployed']), ARRAY['Education certificate', 'ID proof', 'Address proof'], true),
('Green Energy Solar Subsidy 2026', 'Rooftop solar installation with 50% government subsidy', 'Environment', jsonb_build_object('requirements', ARRAY['Property owner', 'Residential/Commercial']), ARRAY['Property papers', 'Electricity bill', 'Aadhaar'], true),

('Ayushman Bharat Plus 2026', 'Enhanced health insurance with mental health coverage', 'Healthcare', jsonb_build_object('requirements', ARRAY['Income <₹10 lakh/year', 'Any age']), ARRAY['Aadhaar', 'Income proof', 'Medical records'], true),
('Women Health Advancement Program', 'Free health checkups and maternal care for all women', 'Healthcare', jsonb_build_object('requirements', ARRAY['Female', 'Age 18+']), ARRAY['Aadhaar', 'Address proof'], false),
('Mental Wellness Initiative', 'Free counseling and mental health support services', 'Healthcare', jsonb_build_object('requirements', ARRAY['Age 13+', 'Any income']), ARRAY['ID proof'], true),

('Higher Education Excellence Fund 2026', 'Scholarships for top 1% STEM students', 'Education', jsonb_build_object('requirements', ARRAY['12th pass', 'Top performer', 'Family income <₹25 lakh']), ARRAY['Mark sheet', 'Admission letter', 'Income proof'], true),
('Skill-to-Job Program', 'Free vocational training with guaranteed job placement', 'Skills & Employment', jsonb_build_object('requirements', ARRAY['Age 18-30', 'Any qualification']), ARRAY['10th pass cert', 'Photo ID', 'Address proof'], false),
('Women Education Excellence Scholarship', 'Full scholarship for girls in STEM fields', 'Education', jsonb_build_object('requirements', ARRAY['Female', '12th pass with 80%+']), ARRAY['Mark sheets', 'Income proof', 'Category cert'], true),

('Urban Affordable Housing 2026', 'Subsidized housing for middle-income groups', 'Housing', jsonb_build_object('requirements', ARRAY['Annual income ₹3-10 lakh', 'Age 21+']), ARRAY['Income certificate', 'Employment letter', 'ID proof'], true),
('Rural Housing Upgrade Scheme', 'Grants for renovating rural homes with modern amenities', 'Housing', jsonb_build_object('requirements', ARRAY['Rural resident', 'Own land']), ARRAY['Land papers', 'Panchayat cert', 'Aadhaar'], false),

('Zero-Interest Business Loan 2026', 'Startup loans up to ₹50 lakhs with 0% interest', 'Business & Startup', jsonb_build_object('requirements', ARRAY['Age 21-55', 'Business plan ready']), ARRAY['Business plan', 'Qualification cert', 'ID proof'], true),
('Women Entrepreneur Acceleration Fund', 'Special fund for women-led startups with mentorship', 'Business & Startup', jsonb_build_object('requirements', ARRAY['Female founder', 'Startup registered']), ARRAY['Business registration', 'Plan doc', 'ID proof'], false),
('Youth Entrepreneurship Support', 'Grants and mentoring for young business founders', 'Business & Startup', jsonb_build_object('requirements', ARRAY['Age 18-40', 'Business idea']), ARRAY['Business plan', 'Education cert', 'ID proof'], true),

('Universal Basic Income Pilot 2026', 'Direct cash transfer to vulnerable sections', 'Social Security', jsonb_build_object('requirements', ARRAY['Below poverty line', 'No employment']), ARRAY['BPL certificate', 'Bank account'], true),
('Senior Citizen Pension Plus', 'Enhanced pension with health insurance for elderly', 'Social Security', jsonb_build_object('requirements', ARRAY['Age 60+', 'Any income']), ARRAY['Age proof', 'Aadhaar', 'Bank account'], false),
('Disability Support & Employment', 'Allowance and job placement for persons with disabilities', 'Social Security', jsonb_build_object('requirements', ARRAY['Disability certified', 'Age 18+']), ARRAY['Disability certificate', 'Medical report'], true),

('Organic Farming Transition Grant', 'Support for farmers shifting to organic farming', 'Agriculture', jsonb_build_object('requirements', ARRAY['Active farmer', 'Own farm']), ARRAY['Land papers', 'Farmer ID', 'Training cert'], false),
('Agricultural Infrastructure Fund 2026', 'Loans for farm mechanization and irrigation', 'Agriculture', jsonb_build_object('requirements', ARRAY['Farmer', 'Agriculture income']), ARRAY['Land papers', 'Bank statement', 'ID proof'], true),
('Rural Cooperative Development', 'Support for forming and running agricultural cooperatives', 'Agriculture', jsonb_build_object('requirements', ARRAY['Farmer', 'Group of 10+']), ARRAY['Land proof', 'Member certificates'], false),

('5G Digital Village Program', 'High-speed internet and digital services for villages', 'Digital Infrastructure', jsonb_build_object('requirements', ARRAY['Rural panchayat', 'Population <50k']), ARRAY['Panchayat approval', 'Feasibility report'], true),
('Renewable Energy Installation Grant', 'Biogas, wind, or hydro energy setup grants', 'Environment', jsonb_build_object('requirements', ARRAY['Business/Farm owner']), ARRAY['Business cert', 'Land proof'], false),
('Climate-Smart Agriculture Initiative', 'Training and tools for sustainable farming', 'Agriculture', jsonb_build_object('requirements', ARRAY['Farmer', 'Land 1+ hectare']), ARRAY['Land papers', 'Farmer ID'], true)
ON CONFLICT DO NOTHING;
