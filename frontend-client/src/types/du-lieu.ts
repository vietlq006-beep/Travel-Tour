export type EntityId = number | string

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export interface Pagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: Pagination
}

export interface User {
  id: EntityId
  fullName: string
  email: string
  phoneNumber?: string
  role: 'ADMIN' | 'CUSTOMER'
}

export interface AuthState {
  user: User | null
  token: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterForm extends LoginCredentials {
  fullName: string
  phoneNumber?: string
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthState>
  register: (form: RegisterForm) => Promise<AuthState>
  logout: () => void
}

export interface Destination {
  id: EntityId
  name: string
  region?: string
}

export interface Category {
  id: EntityId
  name: string
}

export interface Departure {
  id: EntityId
  startDate: string
  endDate: string
  adultPrice: number
  childPrice: number
  capacity: number
  bookedSeats: number
  remainingSeats: number
  status?: string
  tour?: Pick<Tour, 'id' | 'code' | 'name' | 'thumbnail'>
}

export interface Itinerary {
  id?: EntityId
  dayNumber: number
  title: string
  description: string
}

export interface Tour {
  id: EntityId
  code: string
  name: string
  thumbnail: string
  images?: string[]
  overview?: string
  durationDays: number
  durationNights: number
  category?: Category
  destinations?: Destination[]
  departures?: Departure[]
  itineraries?: Itinerary[]
  rating?: { average: number; count: number }
}

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
export type PassengerType = 'ADULT' | 'CHILD'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface Participant {
  id?: EntityId
  fullName: string
  gender: Gender
  dateOfBirth: string
  passengerType: PassengerType
}

export interface Payment {
  id: EntityId
  amount: number
  paymentMethod: 'VNPAY' | 'BANK_TRANSFER' | 'CASH'
  status: PaymentStatus
}

export interface Booking {
  id: EntityId
  bookingCode: string
  bookingDate: string
  numAdults: number
  numChildren: number
  finalAmount: number
  status: BookingStatus
  departure?: Departure
  participants?: Participant[]
  payments?: Payment[]
}

export interface VoucherValidation {
  discountAmount: number
}

export interface PaymentCreation {
  payment: Payment
  paymentUrl?: string
}
