const { sequelize } = require('../config/database');

const User = require('./User');
const Category = require('./Category');
const Destination = require('./Destination');
const Hotel = require('./Hotel');
const Vehicle = require('./Vehicle');
const TourGuide = require('./TourGuide');
const Tour = require('./Tour');
const TourDestination = require('./TourDestination');
const TourItinerary = require('./TourItinerary');
const TourDeparture = require('./TourDeparture');
const Voucher = require('./Voucher');
const Booking = require('./Booking');
const BookingParticipant = require('./BookingParticipant');
const Payment = require('./Payment');
const Review = require('./Review');

// ==========================================
// 1. QUAN HỆ DANH MỤC & TOUR (1 - N)
// ==========================================
Category.hasMany(Tour, { foreignKey: 'categoryId', as: 'tours' });
Tour.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// ==========================================
// 2. QUAN HỆ TOUR & ĐIỂM ĐẾN (N - M)
// ==========================================
Tour.belongsToMany(Destination, {
  through: TourDestination,
  foreignKey: 'tourId',
  otherKey: 'destinationId',
  as: 'destinations'
});
Destination.belongsToMany(Tour, {
  through: TourDestination,
  foreignKey: 'destinationId',
  otherKey: 'tourId',
  as: 'tours'
});

// ==========================================
// 3. QUAN HỆ TOUR & LỊCH TRÌNH (1 - N)
// ==========================================
Tour.hasMany(TourItinerary, { foreignKey: 'tourId', as: 'itineraries' });
TourItinerary.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });

// ==========================================
// 4. QUAN HỆ TOUR & CHUYẾN KHỞI HÀNH (1 - N)
// ==========================================
Tour.hasMany(TourDeparture, { foreignKey: 'tourId', as: 'departures' });
TourDeparture.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });

// ==========================================
// 5. QUAN HỆ TÀI NGUYÊN (HOTEL, VEHICLE, GUIDE) VỚI DEPARTURE (1 - N)
// ==========================================
Hotel.hasMany(TourDeparture, { foreignKey: 'hotelId', as: 'departures' });
TourDeparture.belongsTo(Hotel, { foreignKey: 'hotelId', as: 'hotel' });

Vehicle.hasMany(TourDeparture, { foreignKey: 'vehicleId', as: 'departures' });
TourDeparture.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

TourGuide.hasMany(TourDeparture, { foreignKey: 'guideId', as: 'departures' });
TourDeparture.belongsTo(TourGuide, { foreignKey: 'guideId', as: 'guide' });

// ==========================================
// 6. QUAN HỆ DEPARTURE & BOOKING (1 - N)
// ==========================================
TourDeparture.hasMany(Booking, { foreignKey: 'departureId', as: 'bookings' });
Booking.belongsTo(TourDeparture, { foreignKey: 'departureId', as: 'departure' });

// ==========================================
// 7. QUAN HỆ USER & BOOKING (1 - N)
// ==========================================
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ==========================================
// 8. QUAN HỆ VOUCHER & BOOKING (1 - N)
// ==========================================
Voucher.hasMany(Booking, { foreignKey: 'voucherId', as: 'bookings' });
Booking.belongsTo(Voucher, { foreignKey: 'voucherId', as: 'voucher' });

// ==========================================
// 9. QUAN HỆ BOOKING & PARTICIPANTS (1 - N)
// ==========================================
Booking.hasMany(BookingParticipant, { foreignKey: 'bookingId', as: 'participants' });
BookingParticipant.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// ==========================================
// 10. QUAN HỆ BOOKING & PAYMENT (1 - N)
// ==========================================
Booking.hasMany(Payment, { foreignKey: 'bookingId', as: 'payments' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// ==========================================
// 11. QUAN HỆ REVIEWS
// ==========================================
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Tour.hasMany(Review, { foreignKey: 'tourId', as: 'reviews' });
Review.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });

Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = {
  sequelize,
  User,
  Category,
  Destination,
  Hotel,
  Vehicle,
  TourGuide,
  Tour,
  TourDestination,
  TourItinerary,
  TourDeparture,
  Voucher,
  Booking,
  BookingParticipant,
  Payment,
  Review
};
