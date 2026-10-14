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
  avatar?: string
  emailVerifiedAt?: string | null
  phoneVerifiedAt?: string | null
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

export interface ContactConfirmation {
  email: string
  phoneNumber: string
  currentPassword: string
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthState>
  register: (form: RegisterForm) => Promise<AuthState>
  confirmContact: (form: ContactConfirmation) => Promise<AuthState>
  logout: () => void
  refresh: () => Promise<User>
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
  infantPrice: number
  seniorPrice?: number | null
  singleRoomSurcharge: number
  departureCity?: string
  meetingPoint?: string
  meetingTime?: string
  termsOverride?: string
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
  videoUrl?: string
  overview?: string
  includedServices?: string
  excludedServices?: string
  cancellationPolicy?: string
  changePolicy?: string
  depositPercent?: number
  childPolicy?: string
  infantPolicy?: string
  seniorPolicy?: string
  pickupPoints?: string[]
  meetingInstructions?: string
  luggagePolicy?: string
  insuranceDetails?: string
  visaRequirements?: string
  requiredDocuments?: string
  termsAndConditions?: string
  durationDays: number
  durationNights: number
  category?: Category
  destinations?: Destination[]
  departures?: Departure[]
  itineraries?: Itinerary[]
  rating?: { average: number; count: number }
  reviews?: Review[]
}

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
export type PassengerType = 'ADULT' | 'CHILD' | 'INFANT' | 'SENIOR'
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
  paymentMethod: 'VIETQR' | 'BANK_TRANSFER' | 'CASH'
  status: PaymentStatus
  paymentPurpose?: 'DEPOSIT' | 'BALANCE' | 'FULL'
  proofUrl?: string | null
  proofUploadedAt?: string | null
}

export interface Booking {
  id: EntityId
  bookingCode: string
  bookingDate: string
  numAdults: number
  numChildren: number
  numInfants: number
  numSeniors: number
  singleRoomCount: number
  totalAmount: number
  discountAmount: number
  depositAmount: number
  finalAmount: number
  status: BookingStatus
  paymentDueAt?: string | null
  expiredAt?: string | null
  cancellationReason?: string | null
  pricingSnapshot?: Record<string, unknown>
  policySnapshot?: Record<string, unknown>
  checkInCode?: string
  checkedInAt?: string | null
  departure?: Departure
  voucher?: Voucher | null
  participants?: Participant[]
  payments?: Payment[]
  review?: Review | null
  activities?: BookingActivity[]
  changeRequests?: BookingChangeRequest[]
}

export interface Review {
  id: EntityId
  bookingId?: EntityId
  rating: number
  comment?: string
  createdAt?: string
  user?: Pick<User, 'id' | 'fullName' | 'avatar'>
}

export interface BookingActivity {
  id: EntityId
  eventType: string
  fromStatus?: string | null
  toStatus?: string | null
  note?: string | null
  createdAt: string
  actor?: Pick<User, 'id' | 'fullName' | 'email'>
}

export interface BookingChangeRequest {
  id: EntityId
  requestType: 'CANCEL' | 'RESCHEDULE' | 'REFUND'
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNote?: string | null
  requestedDepartureId?: EntityId | null
  requestedDeparture?: Departure | null
  createdAt?: string
}

export interface CheckInTicket {
  bookingCode: string
  checkInCode: string
  checkedInAt?: string | null
  qrCodeDataUrl: string
}

export interface VoucherValidation {
  voucher: Voucher
  discountAmount: number
}

export interface Voucher {
  id: EntityId
  code: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  minBookingAmount: number
  maxUsage?: number
  usedCount?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export interface PaymentCreation {
  payment: Payment
  vietQr?: VietQrDetails
}

export interface VietQrDetails {
  provider: 'VIETQR'
  bankId: string
  bankName: string
  accountNo: string
  accountName: string
  amount: number
  transferContent: string
  qrImageUrl: string
}
