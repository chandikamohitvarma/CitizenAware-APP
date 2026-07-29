export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  aadhaar?: string;
  dateOfBirth?: string;
  gender?: string;
  address: Address;
  bankDetails?: BankDetails;
  income?: Income;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface Income {
  annual: number;
  category: string;
  source: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  ministry: string;
  benefits: string;
  eligibility: string[];
  documents: string[];
  deadline: string;
  status: 'active' | 'inactive' | 'upcoming';
  applied: number;
  featured: boolean;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  created_at?: string;
  createdAt?: string;
  scheme_id?: string;
  schemeId?: string;
}

export interface Application {
  id: string;
  schemeId: string;
  schemeName: string;
  userId: string;
  status: 'draft' | 'pending' | 'in_review' | 'submitted' | 'approved' | 'rejected';
  currentStep: number;
  totalSteps: number;
  submittedAt: string;
  updatedAt: string;
  documents: Document[];
}

export interface Document {
  name: string;
  uploaded: boolean;
  verified: boolean;
  uri?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  message: string;
  sender: 'user' | 'support';
  timestamp: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  suggestions?: string[];
}

export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Language {
  code: string;
  name: string;
  native: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
