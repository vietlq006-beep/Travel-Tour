require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const {
  User,
  Category,
  Destination,
  Hotel,
  Tour,
  TourItinerary,
  TourDeparture,
  Voucher,
  Booking,
  BookingParticipant,
  Payment,
  sequelize
} = require('../../models');
const ROLES = require('../../constants/roles');
const { categories, destinations, hotels, tours } = require('./travelCatalog');

const upsertRecord = async (Model, where, values, transaction) => {
  let record = await Model.findOne({ where, paranoid: false, transaction });
  if (!record) return Model.create({ ...where, ...values }, { transaction });
  if (record.deletedAt && typeof record.restore === 'function') await record.restore({ transaction });
  await record.update(values, { transaction });
  return record;
};

const isoDate = (date) => date.toISOString().slice(0, 10);

const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const monthlyDeparture = (monthOffset, weekday) => {
  const now = new Date();
  const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1));
  const firstMatchingDay = 1 + ((weekday - firstDay.getUTCDay() + 7) % 7);
  return new Date(Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth(), firstMatchingDay + 7));
};

const ensureAccounts = async () => {
  if (!await User.findOne({ where: { email: 'admin@leviet.com' } })) {
    await User.create({
      fullName: 'Quản trị viên hệ thống',
      email: 'admin@leviet.com',
      password: 'Admin@123',
      phoneNumber: '0905123456',
      role: ROLES.ADMIN
    });
  }

  if (!await User.findOne({ where: { email: 'khachhang@gmail.com' } })) {
    await User.create({
      fullName: 'Tài khoản khách hàng',
      email: 'khachhang@gmail.com',
      password: 'Customer@123',
      phoneNumber: '0987654321',
      role: ROLES.CUSTOMER
    });
  }
};

const seedCatalog = async () => sequelize.transaction(async (transaction) => {
  const categoryByName = new Map();
  for (const item of categories) {
    const { name, ...values } = item;
    categoryByName.set(name, await upsertRecord(Category, { name }, values, transaction));
  }

  const destinationByName = new Map();
  for (const item of destinations) {
    const { name, ...values } = item;
    destinationByName.set(name, await upsertRecord(Destination, { name }, values, transaction));
  }

  const hotelByName = new Map();
  for (const item of hotels) {
    const { name, ...values } = item;
    hotelByName.set(name, await upsertRecord(Hotel, { name }, values, transaction));
  }

  for (const [tourIndex, item] of tours.entries()) {
    const category = categoryByName.get(item.category);
    const destinationRecords = item.destinations.map((name) => destinationByName.get(name));
    const {
      category: _category,
      destinations: _destinations,
      hotel,
      adultPrice,
      childPrice,
      capacity,
      itineraries,
      ...tourValues
    } = item;

    let tour = await Tour.findOne({ where: { code: item.code }, paranoid: false, transaction });
    if (!tour && item.code === 'DANANG-HOIAN-HUE-4N3D') {
      tour = await Tour.findOne({ where: { code: 'DANANG-HOIAN-3N2D' }, paranoid: false, transaction });
    }

    if (!tour) {
      tour = await Tour.create({ ...tourValues, categoryId: category.id, isActive: true }, { transaction });
    } else {
      if (tour.deletedAt) await tour.restore({ transaction });
      await tour.update({ ...tourValues, categoryId: category.id, isActive: true }, { transaction });
    }

    await tour.setDestinations(destinationRecords.map((destination) => destination.id), { transaction });

    // Chuẩn hóa đợt khởi hành do seeder cũ tạo cùng tour Đà Nẵng - Hội An.
    if (item.code === 'DANANG-HOIAN-HUE-4N3D') {
      const legacyDepartures = await TourDeparture.findAll({
        where: {
          tourId: tour.id,
          adultPrice: 4500000,
          childPrice: 2500000,
          bookedSeats: 0,
          status: 'OPEN'
        },
        transaction
      });
      for (const departure of legacyDepartures) {
        const startDate = new Date(`${departure.startDate}T00:00:00Z`);
        await departure.update({
          endDate: isoDate(addDays(startDate, item.durationDays - 1)),
          capacity,
          adultPrice,
          childPrice,
          hotelId: hotelByName.get(hotel)?.id || null,
          vehicleId: null,
          guideId: null
        }, { transaction });
      }
    }

    for (const itinerary of itineraries) {
      await upsertRecord(
        TourItinerary,
        { tourId: tour.id, dayNumber: itinerary.dayNumber },
        { title: itinerary.title, description: itinerary.description },
        transaction
      );
    }

    for (let slot = 1; slot <= 3; slot += 1) {
      const startDate = monthlyDeparture(slot, (5 + tourIndex) % 7);
      const departureWhere = { tourId: tour.id, startDate: isoDate(startDate) };
      const existingDeparture = await TourDeparture.findOne({ where: departureWhere, paranoid: false, transaction });
      if (!existingDeparture) {
        await TourDeparture.create({
          ...departureWhere,
          endDate: isoDate(addDays(startDate, item.durationDays - 1)),
          capacity,
          bookedSeats: 0,
          adultPrice,
          childPrice,
          hotelId: hotelByName.get(hotel)?.id || null,
          vehicleId: null,
          guideId: null,
          status: 'OPEN'
        }, { transaction });
      }
    }
  }
});

const seedVoucher = async () => {
  const startDate = new Date();
  const endDate = addDays(startDate, 180);
  await upsertRecord(Voucher, { code: 'LEVITWELCOME' }, {
    discountType: 'PERCENT',
    discountValue: 8,
    minBookingAmount: 3000000,
    maxUsage: 500,
    startDate,
    endDate,
    isActive: true
  });
};

const demoCustomers = [
  { fullName: 'Nguyễn Minh Anh', email: 'minhanh.demo@leviet.com', phoneNumber: '0905111222' },
  { fullName: 'Trần Hoàng Nam', email: 'hoangnam.demo@leviet.com', phoneNumber: '0905333444' },
  { fullName: 'Lê Thu Trang', email: 'thutrang.demo@leviet.com', phoneNumber: '0905555666' }
];

const demoBookings = [
  { code: 'DEMO-BOOKING-001', tourCode: 'DANANG-HOIAN-HUE-4N3D', customer: 0, monthSlot: 0, adults: 2, children: 1, status: 'COMPLETED', paymentMethod: 'VIETQR', paymentStatus: 'SUCCESS' },
  { code: 'DEMO-BOOKING-002', tourCode: 'HANOI-NINHBINH-HALONG-4N3D', customer: 1, monthSlot: 1, adults: 2, children: 0, status: 'COMPLETED', paymentMethod: 'BANK_TRANSFER', paymentStatus: 'SUCCESS' },
  { code: 'DEMO-BOOKING-003', tourCode: 'PHUQUOC-4N3D', customer: 2, monthSlot: 2, adults: 1, children: 1, status: 'COMPLETED', paymentMethod: 'VIETQR', paymentStatus: 'SUCCESS' },
  { code: 'DEMO-BOOKING-004', tourCode: 'DANANG-HOIAN-HUE-4N3D', customer: 1, monthSlot: 3, adults: 3, children: 0, status: 'CONFIRMED', paymentMethod: 'BANK_TRANSFER', paymentStatus: 'SUCCESS' },
  { code: 'DEMO-BOOKING-005', tourCode: 'SAPA-FANSIPAN-3N2D', customer: 0, monthSlot: 4, adults: 2, children: 2, status: 'CONFIRMED', paymentMethod: 'CASH', paymentStatus: 'SUCCESS' },
  { code: 'DEMO-BOOKING-006', tourCode: 'PHUQUOC-4N3D', customer: 2, monthSlot: 5, adults: 2, children: 1, status: 'CONFIRMED', paymentMethod: 'VIETQR', paymentStatus: 'SUCCESS' },
  { code: 'DEMO-BOOKING-007', tourCode: 'HANOI-NINHBINH-HALONG-4N3D', customer: 0, monthSlot: 6, adults: 1, children: 0, status: 'CANCELLED', paymentMethod: 'BANK_TRANSFER', paymentStatus: 'FAILED' },
  { code: 'DEMO-BOOKING-008', tourCode: 'DANANG-HOIAN-HUE-4N3D', customer: 1, monthSlot: 7, adults: 2, children: 1, status: 'PENDING_PAYMENT', paymentMethod: 'VIETQR', paymentStatus: 'PENDING' },
  { code: 'DEMO-BOOKING-009', tourCode: 'SAPA-FANSIPAN-3N2D', customer: 2, monthSlot: 7, adults: 2, children: 0, status: 'PENDING_PAYMENT', paymentMethod: 'VIETQR', paymentStatus: 'PENDING' },
  { code: 'DEMO-BOOKING-010', tourCode: 'PHUQUOC-4N3D', customer: 0, monthSlot: 7, adults: 1, children: 1, status: 'PENDING_PAYMENT', paymentMethod: null, paymentStatus: null }
];

const demoBookingDate = (slot) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const month = Math.round((currentMonth * slot) / 7);
  const day = Math.min(5 + slot, new Date(now.getFullYear(), month + 1, 0).getDate());
  return new Date(now.getFullYear(), month, day, 9 + (slot % 8), 15, 0);
};

const ensureDemoCustomers = async (transaction) => {
  const customers = [];
  for (const values of demoCustomers) {
    let customer = await User.findOne({ where: { email: values.email }, transaction });
    if (!customer) {
      customer = await User.create({
        ...values,
        password: 'Customer@123',
        role: ROLES.CUSTOMER,
        isActive: true
      }, { transaction });
    } else {
      await customer.update({ fullName: values.fullName, phoneNumber: values.phoneNumber, isActive: true }, { transaction });
    }
    customers.push(customer);
  }
  return customers;
};

const seedBusinessData = async () => sequelize.transaction(async (transaction) => {
  const customers = await ensureDemoCustomers(transaction);
  const tourCodes = [...new Set(demoBookings.map((item) => item.tourCode))];
  const seededTours = await Tour.findAll({ where: { code: tourCodes }, transaction });
  const departuresByTour = new Map();

  for (const tour of seededTours) {
    const departure = await TourDeparture.findOne({
      where: { tourId: tour.id, status: 'OPEN' },
      order: [['startDate', 'ASC']],
      transaction
    });
    if (departure) departuresByTour.set(tour.code, departure);
  }

  for (const [index, item] of demoBookings.entries()) {
    const departure = departuresByTour.get(item.tourCode);
    if (!departure) throw new Error(`Không tìm thấy đợt mở bán cho tour mẫu ${item.tourCode}.`);

    const totalAmount = Number(departure.adultPrice) * item.adults
      + Number(departure.childPrice) * item.children;
    const values = {
      userId: customers[item.customer].id,
      departureId: departure.id,
      voucherId: null,
      numAdults: item.adults,
      numChildren: item.children,
      totalAmount,
      discountAmount: 0,
      finalAmount: totalAmount,
      bookingDate: demoBookingDate(item.monthSlot),
      status: item.status,
      notes: 'Dữ liệu mẫu cho dashboard và quy trình duyệt thanh toán.'
    };

    let booking = await Booking.findOne({ where: { bookingCode: item.code }, transaction });
    if (!booking) {
      booking = await Booking.create({ bookingCode: item.code, ...values }, { transaction });
    } else {
      await booking.update(values, { transaction });
    }

    const participantCount = await BookingParticipant.count({ where: { bookingId: booking.id }, transaction });
    if (!participantCount) {
      const participants = [];
      for (let adult = 0; adult < item.adults; adult += 1) {
        participants.push({
          bookingId: booking.id,
          fullName: adult === 0 ? customers[item.customer].fullName : `Khách người lớn ${adult + 1}`,
          gender: adult % 2 ? 'FEMALE' : 'MALE',
          dateOfBirth: `${1987 + adult}-06-15`,
          passengerType: 'ADULT'
        });
      }
      for (let child = 0; child < item.children; child += 1) {
        participants.push({
          bookingId: booking.id,
          fullName: `Khách trẻ em ${child + 1}`,
          gender: child % 2 ? 'MALE' : 'FEMALE',
          dateOfBirth: `${2016 + child}-09-20`,
          passengerType: 'CHILD'
        });
      }
      await BookingParticipant.bulkCreate(participants, { transaction, validate: true });
    }

    const payment = await Payment.findOne({ where: { bookingId: booking.id }, transaction });
    if (item.paymentMethod) {
      const paymentDate = new Date(values.bookingDate.getTime() + 30 * 60 * 1000);
      const paymentValues = {
        bookingId: booking.id,
        paymentMethod: item.paymentMethod,
        amount: totalAmount,
        transactionId: item.paymentStatus === 'SUCCESS' ? `DEMO-TXN-${String(index + 1).padStart(3, '0')}` : null,
        status: item.paymentStatus,
        paymentTime: item.paymentStatus === 'SUCCESS' ? paymentDate : null,
        responseData: { source: 'seed', description: 'Giao dịch mẫu Lê Việt Travel' }
      };
      if (payment) {
        await payment.update(paymentValues, { transaction });
      } else {
        await Payment.create({ ...paymentValues, createdAt: paymentDate, updatedAt: paymentDate }, { transaction });
      }
    }
  }

  for (const departure of departuresByTour.values()) {
    const seatFilter = {
      where: { departureId: departure.id, status: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] },
      transaction
    };
    const [adultSeats, childSeats] = await Promise.all([
      Booking.sum('numAdults', seatFilter),
      Booking.sum('numChildren', seatFilter)
    ]);
    const reservedSeats = Number(adultSeats || 0) + Number(childSeats || 0);
    await departure.update({ bookedSeats: Math.min(reservedSeats, departure.capacity) }, { transaction });
  }
});

const runSeed = async () => {
  console.log('🌱 [Seeder] Đang kiểm tra kết nối cơ sở dữ liệu...');
  await sequelize.authenticate();
  await ensureAccounts();
  await seedCatalog();
  await seedVoucher();
  await seedBusinessData();
  console.log(`✅ [Seeder] Đã đồng bộ ${categories.length} danh mục, ${destinations.length} điểm đến, ${hotels.length} khách sạn và ${tours.length} tour.`);
  console.log('✅ [Seeder] Mỗi tour có ảnh, video, lịch trình chi tiết và ít nhất 3 đợt khởi hành sắp tới.');
  console.log(`✅ [Seeder] Đã đồng bộ ${demoBookings.length} đơn mẫu cùng dữ liệu doanh thu và chuyển khoản chờ duyệt.`);
};

runSeed()
  .then(() => sequelize.close())
  .catch(async (error) => {
    console.error('❌ [Seeder] Đồng bộ dữ liệu thất bại:', error);
    await sequelize.close();
    process.exit(1);
  });
