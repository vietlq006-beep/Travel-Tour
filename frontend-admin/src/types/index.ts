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
  overview?: string
  isActive: boolean
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
  hotelId?: EntityId
  vehicleId?: EntityId
  guideId?: EntityId
  vehicle?: Vehicle
  guide?: TourGuide
  status: DepartureStatus
}

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'VNPAY'

export interface Booking {
  id: EntityId
  bookingCode: string
  bookingDate: string
  finalAmount: number
  status: BookingStatus
  user?: User
  departure?: Departure
}

export interface Payment {
  id: EntityId
  amount: number
  status: PaymentStatus
  paymentMethod: PaymentMethod
  transactionId?: string
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
