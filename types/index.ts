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

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  email?: string;
  bankAccountNumber?: string;
}


export interface Event {
  id: string;

  // فیلدهای چندزبانه
  title: MultilingualText;
  description: MultilingualText;
  location: MultilingualText;
  organizer: MultilingualText;

  image?: string | null;

  // مختصات
  latlng?: LatLng | null;

  price?: number | null;
  capacity: number;
  registered: number;

  // بازه‌های زمانی
  timeRanges?: EventTimeRange[];
}

export interface EventTimeRange {
  id?: string;
  mode: string; // مثلا continuous, daily, weekly و ...
  startDate?: string;
  endDate?: string;
  timeStart?: string;
  timeEnd?: string;
  daysOfWeek?: string;
  specificDates?: string;
  exceptions?: string;
  ranges?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MultilingualText {
  [langCode: string]: string; // مثلا { fa: "عنوان فارسی", en: "English Title", ar: "العنوان" }
}

export interface CreateEventDto {
  title: MultilingualText;       // چندزبانه
  description: MultilingualText; // چندزبانه
  image?: string;
  location: MultilingualText;    // چندزبانه
  latlng?: LatLng;
  price?: number;
  capacity?: number;
  registered?: number;
  organizer: MultilingualText;   // چندزبانه
  timeRanges?: EventTimeRange[];
}

export interface UpdateEventDto {
  title?: MultilingualText;
  description?: MultilingualText;
  image?: string;
  location?: MultilingualText;
  latlng?: LatLng;
  price?: number;
  capacity?: number;
  registered?: number;
  organizer?: MultilingualText;
  timeRanges?: EventTimeRange[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  category: 'historical' | 'natural' | 'cultural' | 'religious';
  images: string[];
  coordinates: [number, number];
  facilities: string[];
  openingHours: string;
  entryFee: string;
  rating: number;
  reviews: number;
}

export interface CreateLocationDto {
  id: string;
  name: string;
  description: string;
  category: 'historical' | 'natural' | 'cultural' | 'religious';
  images: string[];
  coordinates: [number, number];
  facilities: string[];
  openingHours: string;
  entryFee: string;
  rating: number;
  reviews: number;
}

export interface EventTimeRangeDto {
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
