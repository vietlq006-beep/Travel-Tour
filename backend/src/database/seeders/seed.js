require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const {
  User,
  Category,
  Destination,
  Hotel,
  Vehicle,
  TourGuide,
  Tour,
  TourItinerary,
  TourDeparture,
  Voucher,
  sequelize
} = require('../../models');
const ROLES = require('../../constants/roles');

const runSeed = async () => {
  try {
    console.log('🌱 [Seeder] Đang kiểm tra kết nối cơ sở dữ liệu...');
    await sequelize.authenticate();
    console.log('🌱 [Seeder] Bắt đầu nạp dữ liệu khởi tạo (Initial Seeding)...');

    // 1. Tạo tài khoản Admin & Khách hàng mẫu
    const existingAdmin = await User.findOne({ where: { email: 'admin@leviet.com' } });
    if (!existingAdmin) {
      await User.create({
        fullName: 'Quản Trị Viên Hệ Thống',
        email: 'admin@leviet.com',
        password: 'Admin@123', // Hook beforeCreate sẽ tự hash bcrypt
        phoneNumber: '0905123456',
        role: ROLES.ADMIN
      });
      console.log('   ✅ Đã tạo tài khoản Admin: admin@leviet.com / Admin@123');
    }

    const existingCustomer = await User.findOne({ where: { email: 'khachhang@gmail.com' } });
    if (!existingCustomer) {
      await User.create({
        fullName: 'Nguyễn Văn Du Khách',
        email: 'khachhang@gmail.com',
        password: 'Customer@123',
        phoneNumber: '0987654321',
        role: ROLES.CUSTOMER
      });
      console.log('   ✅ Đã tạo tài khoản Khách hàng mẫu: khachhang@gmail.com / Customer@123');
    }

    // 2. Tạo Danh mục tour mẫu
    const catCount = await Category.count();
    if (catCount === 0) {
      await Category.bulkCreate([
        { name: 'Tour Biển Đảo', description: 'Khám phá các bãi biển đẹp nhất Việt Nam', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
        { name: 'Tour Di Sản Miền Trung', description: 'Hành trình di sản văn hóa thế giới UNESCO', imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592' },
        { name: 'Tour Khám Phá Tây Bắc', description: 'Chinh phục cung đường đèo hùng vĩ và ruộng bậc thang', imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
        { name: 'Tour Nghỉ Dưỡng Sinh Thái', description: 'Nghỉ ngơi hòa mình với thiên nhiên trong lành', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef' }
      ]);
      console.log('   ✅ Đã tạo 4 Danh mục tour mẫu');
    }

    // 3. Tạo Điểm đến mẫu
    const destCount = await Destination.count();
    if (destCount === 0) {
      await Destination.bulkCreate([
        { name: 'Đà Nẵng', region: 'TRUNG', description: 'Thành phố đáng sống với biển Mỹ Khê và Bà Nà Hills' },
        { name: 'Hội An', region: 'TRUNG', description: 'Đô thị cổ kính rực rỡ đèn hoa đăng bên dòng sông Hoài' },
        { name: 'Phú Quốc', region: 'NAM', description: 'Đảo Ngọc thiên đường nghỉ dưỡng và bãi sao cát trắng' },
        { name: 'Sa Pa', region: 'BAC', description: 'Thị trấn mù sương với đỉnh Fansipan nóc nhà Đông Dương' }
      ]);
      console.log('   ✅ Đã tạo 4 Điểm đến mẫu');
    }

    // 4. Tạo Khách sạn mẫu
    const hotelCount = await Hotel.count();
    if (hotelCount === 0) {
      await Hotel.bulkCreate([
        { name: 'Mường Thanh Luxury Đà Nẵng', starRating: 5, address: '270 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng', contactPhone: '02363956789' },
        { name: 'Vinpearl Resort & Spa Phú Quốc', starRating: 5, address: 'Bãi Dài, Gành Dầu, Phú Quốc, Kiên Giang', contactPhone: '02973550550' }
      ]);
      console.log('   ✅ Đã tạo 2 Khách sạn đối tác mẫu');
    }

    // 5. Tạo Phương tiện mẫu
    const vehicleCount = await Vehicle.count();
    if (vehicleCount === 0) {
      await Vehicle.bulkCreate([
        { vehicleType: 'Hyundai Universe 45 chỗ', licensePlate: '43B-098.76', seatCapacity: 45 },
        { vehicleType: 'Ford Transit 16 chỗ', licensePlate: '43B-012.34', seatCapacity: 16 }
      ]);
      console.log('   ✅ Đã tạo 2 Phương tiện vận chuyển mẫu');
    }

    // 6. Tạo Hướng dẫn viên mẫu
    const guideCount = await TourGuide.count();
    if (guideCount === 0) {
      await TourGuide.bulkCreate([
        { fullName: 'Nguyễn Văn Minh', phoneNumber: '0912345678', email: 'minh.guide@leviet.com', experienceYears: 5, languages: 'Tiếng Việt, Tiếng Anh' },
        { fullName: 'Lê Thị Tuyết Mai', phoneNumber: '0923456789', email: 'mai.guide@leviet.com', experienceYears: 3, languages: 'Tiếng Việt, Tiếng Hàn' }
      ]);
      console.log('   ✅ Đã tạo 2 Hướng dẫn viên du lịch mẫu');
    }

    // 7. Tạo tour, lịch trình và đợt khởi hành mẫu
    const tourCount = await Tour.count();
    if (tourCount === 0) {
      await sequelize.transaction(async (transaction) => {
        const [category, destinations, hotel, vehicle, guide] = await Promise.all([
          Category.findOne({ order: [['id', 'ASC']], transaction }),
          Destination.findAll({ order: [['id', 'ASC']], limit: 2, transaction }),
          Hotel.findOne({ order: [['id', 'ASC']], transaction }),
          Vehicle.findOne({ order: [['id', 'ASC']], transaction }),
          TourGuide.findOne({ order: [['id', 'ASC']], transaction })
        ]);
        const tour = await Tour.create({
        categoryId: category.id,
        code: 'DANANG-HOIAN-3N2D',
        name: 'Đà Nẵng - Hội An 3 ngày 2 đêm',
        durationDays: 3,
        durationNights: 2,
        overview: 'Khám phá biển Đà Nẵng, bán đảo Sơn Trà và phố cổ Hội An.',
        thumbnail: 'https://images.unsplash.com/photo-1528127269322-539801943592',
        images: [],
        isActive: true
        }, { transaction });
        await tour.setDestinations(destinations.map((item) => item.id), { transaction });
        await TourItinerary.bulkCreate([
        { tourId: tour.id, dayNumber: 1, title: 'Đón khách - Sơn Trà', description: 'Đón khách, tham quan bán đảo Sơn Trà và biển Mỹ Khê.' },
        { tourId: tour.id, dayNumber: 2, title: 'Bà Nà Hills', description: 'Tham quan Bà Nà Hills và Cầu Vàng.' },
        { tourId: tour.id, dayNumber: 3, title: 'Hội An - Tiễn khách', description: 'Tham quan phố cổ Hội An và kết thúc hành trình.' }
        ], { transaction });
        const startDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);
        await TourDeparture.create({
        tourId: tour.id,
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10),
        capacity: Math.min(vehicle.seatCapacity, 30),
        adultPrice: 4500000,
        childPrice: 2500000,
        hotelId: hotel.id,
        vehicleId: vehicle.id,
        guideId: guide.id,
        status: 'OPEN'
        }, { transaction });
      });
      console.log('   ✅ Đã tạo tour, lịch trình và đợt khởi hành mẫu');
    }

    // 8. Tạo Voucher mẫu
    const voucherCount = await Voucher.count();
    if (voucherCount === 0) {
      await Voucher.bulkCreate([
        {
          code: 'HELLOSUMMER',
          discountType: 'PERCENT',
          discountValue: 10.00,
          minBookingAmount: 1000000.00,
          maxUsage: 100,
          usedCount: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Hạn 90 ngày
          isActive: true
        }
      ]);
      console.log('   ✅ Đã tạo Voucher giảm giá mẫu: HELLOSUMMER (Giảm 10%)');
    }

    console.log('🎉 [Seeder] Hoàn thành nạp dữ liệu mẫu thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder] Thất bại khi nạp dữ liệu mẫu:', error);
    process.exit(1);
  }
};

runSeed();
