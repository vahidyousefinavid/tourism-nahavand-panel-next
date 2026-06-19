// Types for multilingual text and coordinates
export interface MultilingualText {
  [langCode: string]: string; // { fa: "عنوان فارسی", en: "English Title", ar: "العنوان" }
}

export interface MoneyValue {
  amount: number;
  currency: 'IRT' | 'IRR' | 'USD' | 'EUR' | 'AED' | 'CNY' | 'GBP';
}

export interface LatLng {
  lat: number;
  lng: number;
}

// ------------------- LOCATION -------------------

export interface Location {
  id?: string;
  name: MultilingualText;
  description: MultilingualText;
  category: 'historical' | 'natural' | 'cultural' | 'religious';
  images: string[];
  mainImageIndex?: number;
  latlng?: LatLng;
  facilities?: Record<string, string[]>; // چندزبانه
  openingHours: MultilingualText;
  entryFee?: MoneyValue | null;
  rating: number;
  reviews: number;
}

export interface CreateLocationDto {
  name: MultilingualText;
  description: MultilingualText;
  category: 'historical' | 'natural' | 'cultural' | 'religious';
  images: string[];
  mainImageIndex?: number;
  latlng?: LatLng;
  facilities?: Record<string, string[]>;
  openingHours: MultilingualText;
  entryFee?: MoneyValue;
  rating?: number;
  reviews?: number;
}

export interface UpdateLocationDto extends Partial<CreateLocationDto> {}

// ------------------- CUSTOMER -------------------

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  email: string;
  bankAccountNumber: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  email: string;
  bankAccountNumber: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// ------------------- EVENT -------------------

export interface EventTimeRange {
  id?: string;
  mode: 'continuous' | 'daily' | 'weekly' | 'specificDates' | 'multipleRanges';
  startDate?: string;
  endDate?: string;
  timeStart?: string;
  timeEnd?: string;
  daysOfWeek?: string; // "1,3,5"
  specificDates?: string; // JSON string
  exceptions?: string; // JSON string
  ranges?: string; // JSON string
}

export interface Event {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  location: MultilingualText;
  organizer: MultilingualText;
  image?: string | null;
  latlng?: LatLng | null;
  price?: MoneyValue | null;
  capacity: number;
  registered: number;
  timeRanges?: EventTimeRange[];
}

export interface CreateEventDto {
  title: MultilingualText;
  description: MultilingualText;
  location: MultilingualText;
  organizer: MultilingualText;
  image?: string;
  latlng?: LatLng;
  price?: MoneyValue;
  capacity?: number;
  registered?: number;
  timeRanges?: EventTimeRange[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

// ------------------- INVESTMENT -------------------

export type InvestmentCategory =
  | 'real-estate'
  | 'agriculture'
  | 'tourism'
  | 'handicrafts'
  | 'industry'
  | 'technology';

export type RiskLevel = 'low' | 'medium' | 'high';

export type InvestmentStatus = 'active' | 'pending' | 'completed';

export interface Investment {
  id: string;
  title: MultilingualText;
  shortDescription: MultilingualText;
  fullDescription: MultilingualText;
  images?: string[];
  mainImageIndex?: number;
  category: InvestmentCategory;
  icon?: string | null;
  minInvestment?: MoneyValue | null;
  maxInvestment?: MoneyValue | null;
  expectedReturn?: string | null;
  timeframe?: string | null;
  riskLevel?: RiskLevel | null;
  features?: Record<string, string[]>;
  requirements?: Record<string, string[]>;
  benefits?: Record<string, string[]>;
  contactInfo?: MultilingualText;
  supportPhone?: string | null;
  status: InvestmentStatus;
  latlng?: LatLng | null;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvestmentDto {
  title: MultilingualText;
  shortDescription: MultilingualText;
  fullDescription: MultilingualText;
  images?: string[];
  mainImageIndex?: number;
  category: InvestmentCategory;
  icon?: string;
  minInvestment?: MoneyValue;
  maxInvestment?: MoneyValue;
  expectedReturn?: string;
  timeframe?: string;
  riskLevel?: RiskLevel;
  features?: Record<string, string[]>;
  requirements?: Record<string, string[]>;
  benefits?: Record<string, string[]>;
  contactInfo?: MultilingualText;
  supportPhone?: string;
  status?: InvestmentStatus;
  latlng?: LatLng | null;
}

export interface UpdateInvestmentDto extends Partial<CreateInvestmentDto> {}

// ------------------- CREATIVE CITY INITIATIVE -------------------

export type InitiativeStatus = 'active' | 'ongoing' | 'planned' | 'completed';

export interface CreativeCityInitiative {
  id: string;
  title: string;
  description?: string;
  sector: string;
  status: InitiativeStatus;
  activityLevel: number;
  participantsCount: number;
  startYear?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreativeCityInitiativeDto {
  title: string;
  description?: string;
  sector: string;
  status?: InitiativeStatus;
  activityLevel?: number;
  participantsCount?: number;
  startYear?: string;
  imageUrl?: string;
}

export interface UpdateCreativeCityInitiativeDto extends Partial<CreateCreativeCityInitiativeDto> {}

// ------------------- CREATIVE CITY NEWS -------------------

export type NewsStatus = 'draft' | 'published';

export interface CreativeCityNews {
  id: string;
  title: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  status: NewsStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreativeCityNewsDto {
  title: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  status?: NewsStatus;
}

export interface UpdateCreativeCityNewsDto extends Partial<CreateCreativeCityNewsDto> {}

// ------------------- CREATIVE CITY PARTICIPATION -------------------

export type ParticipationStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface CreativeCityParticipation {
  id: string;
  name: string;
  phone: string;
  ageGroup?: string;
  domain: string;
  ideaTitle: string;
  ideaDesc: string;
  participation?: string[];
  status: ParticipationStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ------------------- INVESTMENT SUGGESTION -------------------

export type SuggestionStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface InvestmentSuggestion {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  nationalCode?: string;
  title: string;
  description: string;
  investmentArea?: string;
  category?: string;
  estimatedAmount?: MoneyValue | null;
  expectedReturn?: string;
  timeframe?: string;
  additionalNotes?: string;
  latlng?: LatLng | null;
  status: SuggestionStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
