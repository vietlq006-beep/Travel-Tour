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
  totalPages?: number
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: Pagination
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>

export interface User {
  id: EntityId
  fullName?: string
  email: string
  phoneNumber?: string
  role: 'ADMIN' | 'CUSTOMER'
  avatar?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Customer extends User {
  role: 'CUSTOMER'
  isActive: boolean
  createdAt: string
  bookings?: Booking[]
}

export interface AdminSession {
  token: string
  user: User
}

export interface Category {
  id: EntityId
  name: string
  description?: string
  imageUrl?: string
}

export interface Destination {
  id: EntityId
  name: string
  region?: string
}

export interface Tour {
  id: EntityId
  code: string
  name: string
  categoryId?: EntityId
  category?: Category
  destinations?: Destination[]
  durationDays: number
  durationNights: number
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
  isActive: boolean
}

export interface Itinerary {
  id?: EntityId
  dayNumber: number
  title: string
  description: string
}

export interface Hotel {
  id: EntityId
  name: string
  address?: string
}

export interface Vehicle {
  id: EntityId
  licensePlate: string
  vehicleType: string
  seatCapacity: number
}

export interface TourGuide {
  id: EntityId
  fullName: string
  phoneNumber?: string
  isActive?: boolean
}

export type DepartureStatus = 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED'

export interface Departure {
  id: EntityId
  tourId: EntityId
  tour?: Tour
  startDate: string
  endDate: string
  capacity: number
  bookedSeats: number
  adultPrice: number
  childPrice: number
  infantPrice?: number
  seniorPrice?: number | null
  singleRoomSurcharge?: number
  departureCity?: string
  meetingPoint?: string
  meetingTime?: string
  hotelId?: EntityId
  vehicleId?: EntityId
  guideId?: EntityId
  vehicle?: Vehicle
  guide?: TourGuide
  status: DepartureStatus
}

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'VIETQR'

export interface Booking {
  id: EntityId
  bookingCode: string
  bookingDate: string
  finalAmount: number
  depositAmount?: number
  totalAmount?: number
  discountAmount?: number
  paymentDueAt?: string | null
  cancellationReason?: string | null
  numAdults?: number
  numChildren?: number
  numInfants?: number
  numSeniors?: number
  singleRoomCount?: number
  checkedInAt?: string | null
  checkInCode?: string
  status: BookingStatus
  user?: User
  departure?: Departure
  participants?: Array<{ id: EntityId; fullName: string; gender: string; dateOfBirth: string; passengerType: string }>
  payments?: Payment[]
  activities?: BookingActivity[]
  changeRequests?: BookingChangeRequest[]
}

export interface Payment {
  id: EntityId
  amount: number
  status: PaymentStatus
  paymentMethod: PaymentMethod
  transactionId?: string
  createdAt?: string
  updatedAt?: string
  paymentTime?: string
  paymentPurpose?: 'DEPOSIT' | 'BALANCE' | 'FULL'
  proofUrl?: string | null
  booking?: Booking
  responseData?: {
    rejectionReason?: string
    rejectedAt?: string
    rejectedBy?: { id?: EntityId; fullName?: string; email?: string }
    reason?: string
    [key: string]: unknown
  }
}

export interface BookingActivity {
  id: EntityId
  eventType: string
  fromStatus?: string | null
  toStatus?: string | null
  note?: string | null
  createdAt: string
  actor?: User
}

export interface BookingChangeRequest {
  id: EntityId
  bookingId: EntityId
  requestType: 'CANCEL' | 'RESCHEDULE' | 'REFUND'
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNote?: string | null
  createdAt?: string
  booking?: Booking
  requester?: User
}

export interface DashboardSummary {
  customers: number
  activeTours: number
  openDepartures: number
  revenue: number
  bookingsByStatus: Partial<Record<BookingStatus, number>>
}

export interface MonthlyRevenue {
  month: string
  bookingCount: number
  revenue: number
}

export interface TopTour {
  id: EntityId
  code: string
  name: string
  bookingCount: number
  passengers: number
  revenue: number
}

export interface DashboardAnalytics {
  monthlyRevenue: MonthlyRevenue[]
  topTours: TopTour[]
}
