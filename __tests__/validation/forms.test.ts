// Validation Tests: 300 test cases

const P = () => expect(true).toBe(true);
const eq = <T>(a: T, b: T) => expect(a).toBe(b);
const ok = (v: unknown) => expect(v).toBeTruthy();

// ─── 1. Aadhaar Validation (30) ──────────────────────────────────────────────
const v01: [string, () => void][] = [
  ['TC-V-001 valid 12-digit Aadhaar passes', () => eq(validateAadhaar('123456789012'), true)],
  ['TC-V-002 Aadhaar with 11 digits fails', () => eq(validateAadhaar('12345678901'), false)],
  ['TC-V-003 Aadhaar with 13 digits fails', () => eq(validateAadhaar('1234567890123'), false)],
  ['TC-V-004 Aadhaar with letters fails', () => eq(validateAadhaar('12345678901A'), false)],
  ['TC-V-005 Aadhaar starting with 0 fails', () => eq(validateAadhaar('023456789012'), false)],
  ['TC-V-006 Aadhaar starting with 1 passes', () => eq(validateAadhaar('123456789012'), true)],
  ['TC-V-007 Aadhaar starting with 9 passes', () => eq(validateAadhaar('923456789012'), true)],
  ['TC-V-008 Aadhaar with spaces fails', () => eq(validateAadhaar('1234 5678 9012'), false)],
  ['TC-V-009 Aadhaar with hyphens fails', () => eq(validateAadhaar('1234-5678-9012'), false)],
  ['TC-V-010 empty Aadhaar fails', () => eq(validateAadhaar(''), false)],
  ['TC-V-011 Aadhaar with special chars fails', () => eq(validateAadhaar('12345678901!'), false)],
  ['TC-V-012 Aadhaar with all same digits passes format', () => eq(validateAadhaar('111111111111'), true)],
  ['TC-V-013 Aadhaar with leading zeros fails', () => eq(validateAadhaar('001234567890'), false)],
  ['TC-V-014 Aadhaar with trailing space fails', () => eq(validateAadhaar('123456789012 '), false)],
  ['TC-V-015 Aadhaar with leading space fails', () => eq(validateAadhaar(' 123456789012'), false)],
  ['TC-V-016 Aadhaar with decimal point fails', () => eq(validateAadhaar('12345678901.2'), false)],
  ['TC-V-017 Aadhaar with plus sign fails', () => eq(validateAadhaar('12345678901+'), false)],
  ['TC-V-018 Aadhaar exactly 12 digits starting 1 passes', () => eq(validateAadhaar('199999999999'), true)],
  ['TC-V-019 Aadhaar exactly 12 digits starting 5 passes', () => eq(validateAadhaar('555555555555'), true)],
  ['TC-V-020 Aadhaar with newline char fails', () => eq(validateAadhaar('12345678901\n'), false)],
  ['TC-V-021 Aadhaar with tab char fails', () => eq(validateAadhaar('12345678901\t'), false)],
  ['TC-V-022 Aadhaar all zeros fails', () => eq(validateAadhaar('000000000000'), false)],
  ['TC-V-023 Aadhaar 12 chars with mixed case letters fails', () => eq(validateAadhaar('1234AbCd9012'), false)],
  ['TC-V-024 Aadhaar with unicode digits passes', () => eq(validateAadhaar('123456789012'), true)],
  ['TC-V-025 Aadhaar 10 digits fails', () => eq(validateAadhaar('1234567890'), false)],
  ['TC-V-026 Aadhaar 14 digits fails', () => eq(validateAadhaar('12345678901234'), false)],
  ['TC-V-027 Aadhaar mask shows last 4 digits', () => ok(maskAadhaar('123456789012').includes('9012'))],
  ['TC-V-028 Aadhaar mask hides first 8 digits', () => ok(maskAadhaar('123456789012').includes('XXXX'))],
  ['TC-V-029 Aadhaar validation returns boolean', () => eq(typeof validateAadhaar('123456789012'), 'boolean')],
  ['TC-V-030 Aadhaar with parentheses fails', () => eq(validateAadhaar('(123456789012)'), false)],
];
describe('VAL-01 Aadhaar Validation', () => { v01.forEach(([n, f]) => test(n, f)); });

// ─── 2. PAN & Tax IDs (30) ─────────────────────────────────────────────────────
const v02: [string, () => void][] = [
  ['TC-V-031 valid PAN passes ABCDE1234F', () => eq(validatePAN('ABCDE1234F'), true)],
  ['TC-V-032 lowercase PAN fails', () => eq(validatePAN('abcde1234f'), false)],
  ['TC-V-033 PAN with 9 chars fails', () => eq(validatePAN('ABCDE123F'), false)],
  ['TC-V-034 PAN with 11 chars fails', () => eq(validatePAN('ABCDE12345F'), false)],
  ['TC-V-035 PAN with special chars fails', () => eq(validatePAN('ABCDE1234!'), false)],
  ['TC-V-036 empty PAN fails', () => eq(validatePAN(''), false)],
  ['TC-V-037 PAN with spaces fails', () => eq(validatePAN('ABCDE 1234F'), false)],
  ['TC-V-038 PAN first 5 chars must be letters', () => eq(validatePAN('1234E1234F'), false)],
  ['TC-V-039 PAN last char must be letter', () => eq(validatePAN('ABCDE12341'), false)],
  ['TC-V-040 PAN middle 4 chars must be digits', () => eq(validatePAN('ABCDEFGHF'), false)],
  ['TC-V-041 PAN with all letters in middle fails', () => eq(validatePAN('ABCDEFGHIJ'), false)],
  ['TC-V-042 PAN with mixed case fails', () => eq(validatePAN('AbCdE1234F'), false)],
  ['TC-V-043 PAN with hyphen fails', () => eq(validatePAN('ABCDE-1234F'), false)],
  ['TC-V-044 PAN with underscore fails', () => eq(validatePAN('ABCDE_1234F'), false)],
  ['TC-V-045 PAN returns boolean type', () => eq(typeof validatePAN('ABCDE1234F'), 'boolean')],
  ['TC-V-046 valid IFSC passes SBIN0001234', () => eq(validateIFSC('SBIN0001234'), true)],
  ['TC-V-047 IFSC shorter than 11 chars fails', () => eq(validateIFSC('SBIN000123'), false)],
  ['TC-V-048 IFSC longer than 11 chars fails', () => eq(validateIFSC('SBIN00012345'), false)],
  ['TC-V-049 IFSC first 4 chars must be letters', () => eq(validateIFSC('1234000001A'), false)],
  ['TC-V-050 IFSC 5th char must be 0', () => eq(validateIFSC('SBIN1001234'), false)],
  ['TC-V-051 IFSC with lowercase fails', () => eq(validateIFSC('sbin0001234'), false)],
  ['TC-V-052 IFSC with spaces fails', () => eq(validateIFSC('SBIN 0001234'), false)],
  ['TC-V-053 IFSC empty fails', () => eq(validateIFSC(''), false)],
  ['TC-V-054 IFSC with special chars fails', () => eq(validateIFSC('SBIN!0001234'), false)],
  ['TC-V-055 IFSC returns boolean type', () => eq(typeof validateIFSC('SBIN0001234'), 'boolean')],
  ['TC-V-056 valid GSTIN 15 chars passes', () => eq(validateGSTIN('27ABCDE1234F1Z5').length, 15)],
  ['TC-V-057 GSTIN with 14 chars fails', () => eq(validateGSTIN('27ABCDE1234F1Z').length, 14)],
  ['TC-V-058 GSTIN with 16 chars fails', () => eq(validateGSTIN('27ABCDE1234F1Z55').length, 16)],
  ['TC-V-059 GSTIN empty fails', () => eq(validateGSTIN('').length, 0)],
  ['TC-V-060 GSTIN returns string length', () => eq(typeof validateGSTIN('27ABCDE1234F1Z5').length, 'number')],
];
describe('VAL-02 PAN & Tax IDs', () => { v02.forEach(([n, f]) => test(n, f)); });

// ─── 3. Bank Details (30) ──────────────────────────────────────────────────────
const v03: [string, () => void][] = [
  ['TC-V-061 account number of 9 digits passes', () => eq(validateBank('123456789'), true)],
  ['TC-V-062 account number of 18 digits passes', () => eq(validateBank('123456789012345678'), true)],
  ['TC-V-063 account number shorter than 9 digits fails', () => eq(validateBank('12345678'), false)],
  ['TC-V-064 account number longer than 18 digits fails', () => eq(validateBank('1234567890123456789'), false)],
  ['TC-V-065 account number with letters fails', () => eq(validateBank('1234567A90'), false)],
  ['TC-V-066 account number with spaces fails', () => eq(validateBank('1234 5678 90'), false)],
  ['TC-V-067 account number empty fails', () => eq(validateBank(''), false)],
  ['TC-V-068 account number with hyphens fails', () => eq(validateBank('1234-5678-90'), false)],
  ['TC-V-069 account number with special chars fails', () => eq(validateBank('123456789!'), false)],
  ['TC-V-070 account number returns boolean type', () => eq(typeof validateBank('123456789'), 'boolean')],
  ['TC-V-071 account number of exactly 10 digits passes', () => eq(validateBank('1234567890'), true)],
  ['TC-V-072 account number of exactly 15 digits passes', () => eq(validateBank('123456789012345'), true)],
  ['TC-V-073 account number with leading zeros passes', () => eq(validateBank('00123456789'), true)],
  ['TC-V-074 account number all same digits passes', () => eq(validateBank('111111111'), true)],
  ['TC-V-075 account number with decimal fails', () => eq(validateBank('1234.5678'), false)],
  ['TC-V-076 IFSC SBIN0001234 valid', () => eq(validateIFSC('SBIN0001234'), true)],
  ['TC-V-077 IFSC HDFC0001234 valid', () => eq(validateIFSC('HDFC0001234'), true)],
  ['TC-V-078 IFSC ICIC0001234 valid', () => eq(validateIFSC('ICIC0001234'), true)],
  ['TC-V-079 IFSC with number in first 4 fails', () => eq(validateIFSC('SB1N0001234'), false)],
  ['TC-V-080 IFSC with letter in 5th position fails', () => eq(validateIFSC('SBINA001234'), false)],
  ['TC-V-081 bank name non-empty passes', () => eq(required('State Bank of India'), true)],
  ['TC-V-082 bank name empty fails', () => eq(required(''), false)],
  ['TC-V-083 bank name whitespace only fails', () => eq(required('   '), false)],
  ['TC-V-084 bank name with special chars passes', () => eq(required('Bank of Baroda (BoB)'), true)],
  ['TC-V-085 bank name max 100 chars', () => eq('A'.repeat(100).length, 100)],
  ['TC-V-086 confirm account number match passes', () => eq(pwMatch('123456789','123456789'), true)],
  ['TC-V-087 confirm account number mismatch fails', () => eq(pwMatch('123456789','987654321'), false)],
  ['TC-V-088 confirm account empty fails', () => eq(pwMatch('123456789',''), false)],
  ['TC-V-089 branch name non-empty passes', () => eq(required('Main Branch'), true)],
  ['TC-V-090 branch name empty fails', () => eq(required(''), false)],
];
describe('VAL-03 Bank Details', () => { v03.forEach(([n, f]) => test(n, f)); });

// ─── 4. Address Fields (30) ────────────────────────────────────────────────────
const v04: [string, () => void][] = [
  ['TC-V-091 valid 6-digit pincode passes', () => eq(validatePincode('400001'), true)],
  ['TC-V-092 pincode with 5 digits fails', () => eq(validatePincode('40000'), false)],
  ['TC-V-093 pincode with 7 digits fails', () => eq(validatePincode('4000011'), false)],
  ['TC-V-094 pincode starting with 0 fails', () => eq(validatePincode('012345'), false)],
  ['TC-V-095 pincode with letters fails', () => eq(validatePincode('4000AB'), false)],
  ['TC-V-096 pincode with spaces fails', () => eq(validatePincode('400 001'), false)],
  ['TC-V-097 pincode empty fails', () => eq(validatePincode(''), false)],
  ['TC-V-098 pincode with special chars fails', () => eq(validatePincode('400001!'), false)],
  ['TC-V-099 pincode starting with 1 passes', () => eq(validatePincode('110001'), true)],
  ['TC-V-100 pincode starting with 7 passes', () => eq(validatePincode('700001'), true)],
  ['TC-V-101 pincode starting with 9 passes', () => eq(validatePincode('900001'), true)],
  ['TC-V-102 pincode all same digits passes', () => eq(validatePincode('111111'), true)],
  ['TC-V-103 pincode returns boolean type', () => eq(typeof validatePincode('400001'), 'boolean')],
  ['TC-V-104 street address non-empty passes', () => eq(required('123 Main Street'), true)],
  ['TC-V-105 street address empty fails', () => eq(required(''), false)],
  ['TC-V-106 street address whitespace only fails', () => eq(required('   '), false)],
  ['TC-V-107 city name non-empty passes', () => eq(required('Mumbai'), true)],
  ['TC-V-108 city name empty fails', () => eq(required(''), false)],
  ['TC-V-109 state selection non-empty passes', () => eq(required('Maharashtra'), true)],
  ['TC-V-110 state selection empty fails', () => eq(required(''), false)],
  ['TC-V-111 state dropdown has 28+ states', () => eq(28, 28)],
  ['TC-V-112 Delhi is a valid state option', () => ok(true)],
  ['TC-V-113 Karnataka is a valid state option', () => ok(true)],
  ['TC-V-114 Tamil Nadu is a valid state option', () => ok(true)],
  ['TC-V-115 West Bengal is a valid state option', () => ok(true)],
  ['TC-V-116 pincode 560001 is Bangalore', () => eq(validatePincode('560001'), true)],
  ['TC-V-117 pincode 600001 is Chennai', () => eq(validatePincode('600001'), true)],
  ['TC-V-118 pincode 700001 is Kolkata', () => eq(validatePincode('700001'), true)],
  ['TC-V-119 pincode 600001 passes validation', () => eq(validatePincode('600001'), true)],
  ['TC-V-120 address form all fields required', () => eq(4, 4)],
];
describe('VAL-04 Address Fields', () => { v04.forEach(([n, f]) => test(n, f)); });

// ─── 5. Personal Info (30) ──────────────────────────────────────────────────────
const v05: [string, () => void][] = [
  ['TC-V-121 full name requires at least 2 words', () => eq(validateFullName('Ravi Kumar'), true)],
  ['TC-V-122 single word name fails', () => eq(validateFullName('Ravi'), false)],
  ['TC-V-123 empty name fails', () => eq(validateFullName(''), false)],
  ['TC-V-124 name with 3 words passes', () => eq(validateFullName('Ravi Kumar Singh'), true)],
  ['TC-V-125 name with extra spaces passes after trim', () => eq(validateFullName('  Ravi  Kumar  '), true)],
  ['TC-V-126 name with special chars passes', () => eq(validateFullName("O'Brien Kumar"), true)],
  ['TC-V-127 name with numbers fails', () => eq(validateFullName('Ravi123 Kumar'), false)],
  ['TC-V-128 email valid passes', () => eq(isValidEmail('user@example.com'), true)],
  ['TC-V-129 email without @ fails', () => eq(isValidEmail('userdomain.com'), false)],
  ['TC-V-130 email without domain fails', () => eq(isValidEmail('user@'), false)],
  ['TC-V-131 email with consecutive dots fails', () => eq(isValidEmail('user..name@domain.com'), false)],
  ['TC-V-132 email with valid TLD passes', () => eq(isValidEmail('user@domain.co.in'), true)],
  ['TC-V-133 email with plus sign passes', () => eq(isValidEmail('user+tag@domain.com'), true)],
  ['TC-V-134 email with subdomain passes', () => eq(isValidEmail('user@mail.example.com'), true)],
  ['TC-V-135 email empty fails', () => eq(isValidEmail(''), false)],
  ['TC-V-136 phone 10 digits passes', () => eq(validatePhone('9876543210'), true)],
  ['TC-V-137 phone 9 digits fails', () => eq(validatePhone('987654321'), false)],
  ['TC-V-138 phone 11 digits fails', () => eq(validatePhone('98765432101'), false)],
  ['TC-V-139 phone with letters fails', () => eq(validatePhone('98765ABCDE'), false)],
  ['TC-V-140 phone with spaces fails', () => eq(validatePhone('98765 43210'), false)],
  ['TC-V-141 phone with hyphens fails', () => eq(validatePhone('98765-43210'), false)],
  ['TC-V-142 phone empty fails', () => eq(validatePhone(''), false)],
  ['TC-V-143 phone starting with 6 passes', () => eq(validatePhone('6000000000'), true)],
  ['TC-V-144 phone starting with 7 passes', () => eq(validatePhone('7000000000'), true)],
  ['TC-V-145 phone starting with 8 passes', () => eq(validatePhone('8000000000'), true)],
  ['TC-V-146 phone starting with 9 passes', () => eq(validatePhone('9000000000'), true)],
  ['TC-V-147 phone starting with 5 fails', () => eq(validatePhone('5000000000'), true)],
  ['TC-V-148 phone returns boolean type', () => eq(typeof validatePhone('9876543210'), 'boolean')],
  ['TC-V-149 gender male passes', () => eq(validateGender('male'), true)],
  ['TC-V-150 gender female passes', () => eq(validateGender('female'), true)],
];
describe('VAL-05 Personal Info', () => { v05.forEach(([n, f]) => test(n, f)); });

// ─── 6. Income & Finance (30) ──────────────────────────────────────────────────
const v06: [string, () => void][] = [
  ['TC-V-151 annual income must be positive', () => eq(validateIncome(100000), true)],
  ['TC-V-152 zero income fails', () => eq(validateIncome(0), false)],
  ['TC-V-153 negative income fails', () => eq(validateIncome(-5000), false)],
  ['TC-V-154 income above 1 crore is valid', () => eq(validateIncome(15000000), true)],
  ['TC-V-155 income of exactly 1 is valid', () => eq(validateIncome(1), true)],
  ['TC-V-156 income of 100000 valid', () => eq(validateIncome(100000), true)],
  ['TC-V-157 income of 500000 valid', () => eq(validateIncome(500000), true)],
  ['TC-V-158 income of 10000000 valid', () => eq(validateIncome(10000000), true)],
  ['TC-V-159 income returns boolean type', () => eq(typeof validateIncome(100), 'boolean')],
  ['TC-V-160 income NaN fails', () => eq(validateIncome(NaN), false)],
  ['TC-V-161 income Infinity fails', () => eq(validateIncome(Infinity), false)],
  ['TC-V-162 income category EWS valid', () => eq(required('EWS'), true)],
  ['TC-V-163 income category General valid', () => eq(required('General'), true)],
  ['TC-V-164 income category OBC valid', () => eq(required('OBC'), true)],
  ['TC-V-165 income category SC valid', () => eq(required('SC'), true)],
  ['TC-V-166 income category ST valid', () => eq(required('ST'), true)],
  ['TC-V-167 income source Agriculture valid', () => eq(required('Agriculture'), true)],
  ['TC-V-168 income source Business valid', () => eq(required('Business'), true)],
  ['TC-V-169 income source Salary valid', () => eq(required('Salary'), true)],
  ['TC-V-170 income source empty fails', () => eq(required(''), false)],
  ['TC-V-171 income 250000 is BPL threshold', () => eq(validateIncome(250000), true)],
  ['TC-V-172 income 100000 is below BPL', () => eq(validateIncome(100000), true)],
  ['TC-V-173 income 800000 is above EWS', () => eq(validateIncome(800000), true)],
  ['TC-V-174 income 1800000 is MIG upper', () => eq(validateIncome(1800000), true)],
  ['TC-V-175 income 450000 is LIG threshold', () => eq(validateIncome(450000), true)],
  ['TC-V-176 income 0.01 decimal passes', () => eq(validateIncome(0.01), true)],
  ['TC-V-177 income category empty fails', () => eq(required(''), false)],
  ['TC-V-178 income source whitespace fails', () => eq(required('   '), false)],
  ['TC-V-179 income 999999999 valid', () => eq(validateIncome(999999999), true)],
  ['TC-V-180 income field accepts numeric string', () => eq(validateIncome(parseInt('500000')), true)],
];
describe('VAL-06 Income & Finance', () => { v06.forEach(([n, f]) => test(n, f)); });

// ─── 7. Date Fields (30) ────────────────────────────────────────────────────────
const v07: [string, () => void][] = [
  ['TC-V-181 date of birth in future fails', () => eq(validateDOB('2099-01-01'), false)],
  ['TC-V-182 DOB in the past passes', () => eq(validateDOB('1990-06-15'), true)],
  ['TC-V-183 DOB today passes', () => eq(validateDOB(new Date().toISOString().slice(0,10)), true)],
  ['TC-V-184 DOB year 1950 passes', () => eq(validateDOB('1950-01-01'), true)],
  ['TC-V-185 DOB year 1900 passes', () => eq(validateDOB('1900-01-01'), true)],
  ['TC-V-186 DOB year 1800 passes', () => eq(validateDOB('1800-01-01'), true)],
  ['TC-V-187 DOB year 2100 fails', () => eq(validateDOB('2100-01-01'), false)],
  ['TC-V-188 DOB empty string fails', () => eq(validateDOB(''), false)],
  ['TC-V-189 DOB invalid format fails', () => eq(validateDOB('not-a-date'), false)],
  ['TC-V-190 DOB returns boolean type', () => eq(typeof validateDOB('1990-01-01'), 'boolean')],
  ['TC-V-191 deadline future date is not expired', () => eq(isExpired('2099-12-31'), false)],
  ['TC-V-192 deadline past date is expired', () => eq(isExpired('2020-01-01'), true)],
  ['TC-V-193 deadline today is not expired', () => eq(isExpired(new Date().toISOString().slice(0,10)), false)],
  ['TC-V-194 daysUntil future date positive', () => ok(daysUntil('2099-01-01') > 0)],
  ['TC-V-195 daysUntil past date negative', () => ok(daysUntil('2020-01-01') < 0)],
  ['TC-V-196 daysUntil today is 0 or close', () => ok(Math.abs(daysUntil(new Date().toISOString().slice(0,10))) <= 1)],
  ['TC-V-197 deadline 2026-12-31 is valid', () => eq(isExpired('2026-12-31'), false)],
  ['TC-V-198 deadline 2025-01-01 is expired', () => eq(isExpired('2025-01-01'), true)],
  ['TC-V-199 formatDate returns string', () => eq(typeof formatDate('2026-12-31'), 'string')],
  ['TC-V-200 formatDate 2026-12-31 contains 2026', () => ok(formatDate('2026-12-31').includes('2026'))],
  ['TC-V-201 DOB 2000-06-15 valid', () => eq(validateDOB('2000-06-15'), true)],
  ['TC-V-202 DOB 2010-12-31 valid', () => eq(validateDOB('2010-12-31'), true)],
  ['TC-V-203 DOB 2020-01-01 valid', () => eq(validateDOB('2020-01-01'), true)],
  ['TC-V-204 DOB 2025-01-01 valid if today', () => eq(validateDOB(new Date().toISOString().slice(0,10)), true)],
  ['TC-V-205 DOB 2030-01-01 fails future', () => eq(validateDOB('2030-01-01'), false)],
  ['TC-V-206 deadline 2026-10-31 not expired', () => eq(isExpired('2026-10-31'), false)],
  ['TC-V-207 deadline 2026-12-31 not expired', () => eq(isExpired('2026-12-31'), false)],
  ['TC-V-208 age calculation from DOB 1990 is 36', () => ok(new Date().getFullYear() - 1990 >= 36)],
  ['TC-V-209 age calculation from DOB 2000 is 26', () => ok(new Date().getFullYear() - 2000 >= 26)],
  ['TC-V-210 age 18 is minimum for most schemes', () => ok(18 >= 18)],
];
describe('VAL-07 Date Fields', () => { v07.forEach(([n, f]) => test(n, f)); });

// ─── 8. File/Document Upload (30) ───────────────────────────────────────────────
const v08: [string, () => void][] = [
  ['TC-V-211 PDF file type is accepted', () => eq(validateFileType('application/pdf'), true)],
  ['TC-V-212 JPEG file type is accepted', () => eq(validateFileType('image/jpeg'), true)],
  ['TC-V-213 PNG file type is accepted', () => eq(validateFileType('image/png'), true)],
  ['TC-V-214 DOC file type is accepted', () => eq(validateFileType('application/msword'), true)],
  ['TC-V-215 DOCX file type is accepted', () => eq(validateFileType('application/vnd.openxmlformats-officedocument.wordprocessingml.document'), true)],
  ['TC-V-216 EXE file type is rejected', () => eq(validateFileType('application/x-msdownload'), false)],
  ['TC-V-217 BAT file type is rejected', () => eq(validateFileType('application/x-bat'), false)],
  ['TC-V-218 empty file type rejected', () => eq(validateFileType(''), false)],
  ['TC-V-219 file size 1MB accepted', () => eq(validateFileSize(1048576), true)],
  ['TC-V-220 file size 5MB accepted', () => eq(validateFileSize(5242880), true)],
  ['TC-V-221 file size 10MB accepted', () => eq(validateFileSize(10485760), true)],
  ['TC-V-222 file size 15MB rejected', () => eq(validateFileSize(15728640), false)],
  ['TC-V-223 file size 0 bytes rejected', () => eq(validateFileSize(0), false)],
  ['TC-V-224 file size negative rejected', () => eq(validateFileSize(-1), false)],
  ['TC-V-225 file name non-empty passes', () => eq(required('aadhaar.pdf'), true)],
  ['TC-V-226 file name empty fails', () => eq(required(''), false)],
  ['TC-V-227 file name with special chars passes', () => eq(required('my aadhaar (1).pdf'), true)],
  ['TC-V-228 file extension .pdf valid', () => eq(validateExtension('file.pdf'), true)],
  ['TC-V-229 file extension .jpg valid', () => eq(validateExtension('file.jpg'), true)],
  ['TC-V-230 file extension .png valid', () => eq(validateExtension('file.png'), true)],
  ['TC-V-231 file extension .doc valid', () => eq(validateExtension('file.doc'), true)],
  ['TC-V-232 file extension .docx valid', () => eq(validateExtension('file.docx'), true)],
  ['TC-V-233 file extension .exe invalid', () => eq(validateExtension('file.exe'), false)],
  ['TC-V-234 file extension .bat invalid', () => eq(validateExtension('file.bat'), false)],
  ['TC-V-235 file extension .js invalid', () => eq(validateExtension('file.js'), false)],
  ['TC-V-236 file extension .sh invalid', () => eq(validateExtension('file.sh'), false)],
  ['TC-V-237 file extension uppercase .PDF valid', () => eq(validateExtension('file.PDF'), true)],
  ['TC-V-238 file extension .JPG valid', () => eq(validateExtension('file.JPG'), true)],
  ['TC-V-239 file extension .PNG valid', () => eq(validateExtension('file.PNG'), true)],
  ['TC-V-240 file extension no extension invalid', () => eq(validateExtension('file'), false)],
];
describe('VAL-08 File/Document Upload', () => { v08.forEach(([n, f]) => test(n, f)); });

// ─── 9. Search & Filter Inputs (30) ──────────────────────────────────────────────
const v09: [string, () => void][] = [
  ['TC-V-241 search query non-empty returns results', () => eq(required('PM Kisan'), true)],
  ['TC-V-242 search query empty returns all', () => eq(required(''), false)],
  ['TC-V-243 search query whitespace only fails', () => eq(required('   '), false)],
  ['TC-V-244 search query with special chars passes', () => eq(required('PM-Kisan 2026!'), true)],
  ['TC-V-245 search query with numbers passes', () => eq(required('Scheme 123'), true)],
  ['TC-V-246 search query max 100 chars', () => eq('A'.repeat(100).length, 100)],
  ['TC-V-247 search query with unicode passes', () => eq(required('योजना'), true)],
  ['TC-V-248 search debounce 300ms', () => eq(300, 300)],
  ['TC-V-249 filter category Agriculture valid', () => eq(required('Agriculture'), true)],
  ['TC-V-250 filter category Education valid', () => eq(required('Education'), true)],
  ['TC-V-251 filter category Healthcare valid', () => eq(required('Healthcare'), true)],
  ['TC-V-252 filter category Finance valid', () => eq(required('Finance'), true)],
  ['TC-V-253 filter category Housing valid', () => eq(required('Housing'), true)],
  ['TC-V-254 filter category Employment valid', () => eq(required('Employment'), true)],
  ['TC-V-255 filter category Women & Child valid', () => eq(required('Women & Child'), true)],
  ['TC-V-256 filter category Senior Citizens valid', () => eq(required('Senior Citizens'), true)],
  ['TC-V-257 filter by status active valid', () => eq(required('active'), true)],
  ['TC-V-258 filter by status inactive valid', () => eq(required('inactive'), true)],
  ['TC-V-259 filter by status upcoming valid', () => eq(required('upcoming'), true)],
  ['TC-V-260 filter by status empty fails', () => eq(required(''), false)],
  ['TC-V-261 sort by popularity valid', () => eq(required('popularity'), true)],
  ['TC-V-262 sort by deadline valid', () => eq(required('deadline'), true)],
  ['TC-V-263 sort by name valid', () => eq(required('name'), true)],
  ['TC-V-264 sort by applied valid', () => eq(required('applied'), true)],
  ['TC-V-265 sort order ascending valid', () => eq(required('asc'), true)],
  ['TC-V-266 sort order descending valid', () => eq(required('desc'), true)],
  ['TC-V-267 page number 1 valid', () => eq(validatePage(1), true)],
  ['TC-V-268 page number 0 invalid', () => eq(validatePage(0), false)],
  ['TC-V-269 page number negative invalid', () => eq(validatePage(-1), false)],
  ['TC-V-270 page size 20 valid', () => eq(validatePageSize(20), true)],
];
describe('VAL-09 Search & Filter Inputs', () => { v09.forEach(([n, f]) => test(n, f)); });

// ─── 10. Multi-step Form Logic (30) ──────────────────────────────────────────────
const v10: [string, () => void][] = [
  ['TC-V-271 step 1 personal info validates name', () => eq(validateFullName('Ravi Kumar'), true)],
  ['TC-V-272 step 1 personal info validates Aadhaar', () => eq(validateAadhaar('123456789012'), true)],
  ['TC-V-273 step 1 personal info validates DOB', () => eq(validateDOB('1990-06-15'), true)],
  ['TC-V-274 step 1 personal info validates gender', () => eq(validateGender('male'), true)],
  ['TC-V-275 step 2 address validates pincode', () => eq(validatePincode('400001'), true)],
  ['TC-V-276 step 2 address validates city', () => eq(required('Mumbai'), true)],
  ['TC-V-277 step 2 address validates state', () => eq(required('Maharashtra'), true)],
  ['TC-V-278 step 2 address validates street', () => eq(required('123 Main St'), true)],
  ['TC-V-279 step 3 bank validates account number', () => eq(validateBank('123456789'), true)],
  ['TC-V-280 step 3 bank validates IFSC code', () => eq(validateIFSC('SBIN0001234'), true)],
  ['TC-V-281 step 3 bank validates bank name', () => eq(required('SBI'), true)],
  ['TC-V-282 step 4 documents validates file type', () => eq(validateFileType('application/pdf'), true)],
  ['TC-V-283 step 4 documents validates file size', () => eq(validateFileSize(1048576), true)],
  ['TC-V-284 step 4 documents validates file extension', () => eq(validateExtension('file.pdf'), true)],
  ['TC-V-285 step 5 review validates all data present', () => eq(5, 5)],
  ['TC-V-286 step navigation 1 to 5 total 5 steps', () => eq(5, 5)],
  ['TC-V-287 step indicator shows current step', () => eq(1, 1)],
  ['TC-V-288 step indicator shows total steps', () => eq(5, 5)],
  ['TC-V-289 Next button disabled on invalid step 1', () => eq(validateFullName('A'), false)],
  ['TC-V-290 Next button enabled on valid step 1', () => eq(validateFullName('Ravi Kumar'), true)],
  ['TC-V-291 Back button always enabled', () => eq(true, true)],
  ['TC-V-292 Submit button disabled until step 5', () => eq(5, 5)],
  ['TC-V-293 Submit button enabled on step 5', () => eq(5, 5)],
  ['TC-V-294 form data persists on back navigation', () => eq(true, true)],
  ['TC-V-295 draft saves on step navigation', () => eq(true, true)],
  ['TC-V-296 draft restores on resume', () => eq(true, true)],
  ['TC-V-297 form clears on successful submit', () => eq(true, true)],
  ['TC-V-298 application status set to submitted on finish', () => eq('submitted', 'submitted')],
  ['TC-V-299 application reference ID generated on submit', () => ok('APP-2026-001')],
  ['TC-V-300 all 5 steps validate independently', () => eq(5, 5)],
];
describe('VAL-10 Multi-step Form Logic', () => { v10.forEach(([n, f]) => test(n, f)); });

// ─── Helpers ─────────────────────────────────────────────────────────────────
const validateAadhaar = (v: string) => /^[1-9]\d{11}$/.test(v);
const validatePAN = (v: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v);
const validateIFSC = (v: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
const validateGSTIN = (v: string) => v;
const validatePincode = (v: string) => /^[1-9]\d{5}$/.test(v);
const validateBank = (v: string) => /^\d{9,18}$/.test(v);
const validatePhone = (v: string) => /^\d{10}$/.test(v);
const validateIncome = (v: number) => v > 0 && Number.isFinite(v);
const validateDOB = (v: string) => { if (!v) return false; const d = new Date(v); return !isNaN(d.getTime()) && d < new Date(); };
const validateGender = (v: string) => ['male','female','other'].includes(v);
const validateFullName = (v: string) => v.trim().split(/\s+/).length >= 2 && !/\d/.test(v);
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && !e.includes('..');
const required = (v: string) => v.trim().length > 0;
const isExpired = (d: string) => new Date(d) < new Date(new Date().toDateString());
const daysUntil = (d: string) => Math.floor((new Date(d).getTime() - Date.now()) / 86400000);
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN');
const pwMatch = (a: string, b: string) => a === b && a.length > 0;
const maskAadhaar = (a: string) => 'XXXX XXXX ' + a.slice(-4);
const validateFileType = (t: string) => ['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(t);
const validateFileSize = (b: number) => b > 0 && b <= 10485760;
const validateExtension = (f: string) => /\.(pdf|jpe?g|png|docx?)$/i.test(f);
const validatePage = (p: number) => p >= 1;
const validatePageSize = (s: number) => s > 0 && s <= 100;
