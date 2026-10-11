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

const runSeed = async () => {
  console.log('🌱 [Seeder] Đang kiểm tra kết nối cơ sở dữ liệu...');
  await sequelize.authenticate();
  await ensureAccounts();
  await seedCatalog();
  await seedVoucher();
  console.log(`✅ [Seeder] Đã đồng bộ ${categories.length} danh mục, ${destinations.length} điểm đến, ${hotels.length} khách sạn và ${tours.length} tour.`);
  console.log('✅ [Seeder] Mỗi tour có ảnh, video, lịch trình chi tiết và ít nhất 3 đợt khởi hành sắp tới.');
};

runSeed()
  .then(() => sequelize.close())
  .catch(async (error) => {
    console.error('❌ [Seeder] Đồng bộ dữ liệu thất bại:', error);
    await sequelize.close();
    process.exit(1);
  });
