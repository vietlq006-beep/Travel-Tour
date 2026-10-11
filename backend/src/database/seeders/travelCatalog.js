const image = (path) => `https://images.unsplash.com/${path}?auto=format&fit=crop&w=1600&q=82`;
const expandedCatalog = require('./expandedTravelCatalog');

const categories = [
  {
    name: 'Tour Biển Đảo',
    description: 'Kỳ nghỉ biển, khám phá đảo và các trải nghiệm ven bờ tiêu biểu của Việt Nam.',
    imageUrl: image('photo-1526139334526-f591a54b477c')
  },
  {
    name: 'Tour Di Sản Miền Trung',
    description: 'Hành trình kết nối các đô thị và di sản văn hóa đặc sắc tại miền Trung.',
    imageUrl: image('flagged/photo-1549874613-8ea0adee1a82')
  },
  {
    name: 'Tour Khám Phá Tây Bắc',
    description: 'Cảnh quan núi cao, thung lũng ruộng bậc thang và văn hóa cộng đồng vùng Tây Bắc.',
    imageUrl: image('photo-1570366583862-f91883984fde')
  },
  {
    name: 'Tour Nghỉ Dưỡng Sinh Thái',
    description: 'Những hành trình thiên nhiên có nhịp độ thư thả, ưu tiên cảnh quan và trải nghiệm bản địa.',
    imageUrl: image('photo-1531737212413-667205e1cda7')
  },
  {
    name: 'Tour Văn Hóa - Ẩm Thực',
    description: 'Khám phá lịch sử đô thị, đời sống địa phương và các món ăn đặc trưng vùng miền.',
    imageUrl: image('photo-1509030450996-dd1a26dda07a')
  },
  {
    name: 'Tour Miền Sông Nước',
    description: 'Trải nghiệm chợ nổi, vườn cây và nếp sống ven sông của Đồng bằng sông Cửu Long.',
    imageUrl: image('photo-1543411789-1a67a2ac05c6')
  }
];

const destinations = [
  {
    name: 'Hà Nội', region: 'BAC',
    description: 'Thủ đô nghìn năm văn hiến với khu phố cổ, hồ Hoàn Kiếm, Văn Miếu và nền ẩm thực đường phố phong phú.',
    imageUrl: image('photo-1509030450996-dd1a26dda07a')
  },
  {
    name: 'Hạ Long', region: 'BAC',
    description: 'Điểm đến bên vịnh Hạ Long, nổi bật với cảnh quan đảo đá vôi, hang động và hành trình du thuyền.',
    imageUrl: image('photo-1643029891412-92f9a81a8c16')
  },
  {
    name: 'Ninh Bình', region: 'BAC',
    description: 'Vùng đất cố đô với quần thể Tràng An, sông Ngô Đồng và cảnh quan núi đá vôi đặc trưng.',
    imageUrl: image('photo-1531737212413-667205e1cda7')
  },
  {
    name: 'Sa Pa', region: 'BAC',
    description: 'Thị xã vùng cao trong dãy Hoàng Liên Sơn, cửa ngõ đến Fansipan, thung lũng Mường Hoa và các bản làng.',
    imageUrl: image('photo-1570366583862-f91883984fde')
  },
  {
    name: 'Huế', region: 'TRUNG',
    description: 'Cố đô bên sông Hương với hệ thống cung điện, lăng tẩm triều Nguyễn và chùa Thiên Mụ.',
    imageUrl: image('photo-1618165220283-e85246c4171c')
  },
  {
    name: 'Đà Nẵng', region: 'TRUNG',
    description: 'Thành phố biển miền Trung với bán đảo Sơn Trà, bãi biển Mỹ Khê, Ngũ Hành Sơn và sông Hàn.',
    imageUrl: image('photo-1559592413-7cec4d0cae2b')
  },
  {
    name: 'Hội An', region: 'TRUNG',
    description: 'Đô thị cổ bên sông Hoài, nổi bật với kiến trúc nhà cổ, hội quán, làng nghề và ẩm thực Quảng Nam.',
    imageUrl: image('photo-1563354860-799d15199ac3')
  },
  {
    name: 'Cần Thơ', region: 'NAM',
    description: 'Trung tâm của miền Tây Nam Bộ bên sông Hậu, nổi tiếng với chợ nổi Cái Răng, bến Ninh Kiều và vườn cây.',
    imageUrl: image('photo-1543411789-1a67a2ac05c6')
  },
  {
    name: 'Phú Quốc', region: 'NAM',
    description: 'Đảo nghỉ dưỡng ở phía Nam với bãi biển, rừng quốc gia, làng chài, hồ tiêu và nghề làm nước mắm.',
    imageUrl: image('photo-1526139334526-f591a54b477c')
  }
];

const hotels = [
  {
    name: 'Mường Thanh Luxury Đà Nẵng',
    starRating: 5,
    address: '270 Võ Nguyên Giáp, phường Ngũ Hành Sơn, Đà Nẵng',
    contactPhone: '02363956789'
  },
  {
    name: 'Vinpearl Resort & Spa Hạ Long',
    starRating: 5,
    address: 'Đảo Rều, phường Bãi Cháy, Hạ Long, Quảng Ninh',
    contactPhone: '02033857858'
  },
  {
    name: 'Silk Path Grand Sapa Resort & Spa',
    starRating: 5,
    address: 'Đồi Quan 6, Tổ 5, Sa Pa, Lào Cai',
    contactPhone: '02143788555'
  },
  {
    name: 'Salinda Resort Phu Quoc Island',
    starRating: 5,
    address: 'Ấp Cửa Lấp, đặc khu Phú Quốc, An Giang',
    contactPhone: '02973990011'
  }
];

const tours = [
  {
    code: 'DANANG-HOIAN-HUE-4N3D',
    category: 'Tour Di Sản Miền Trung',
    name: 'Đà Nẵng - Huế - Hội An 4 ngày 3 đêm',
    durationDays: 4,
    durationNights: 3,
    destinations: ['Đà Nẵng', 'Huế', 'Hội An'],
    hotel: 'Mường Thanh Luxury Đà Nẵng',
    overview: 'Hành trình kết nối ba trung tâm du lịch tiêu biểu của miền Trung. Du khách khám phá bán đảo Sơn Trà và biển Mỹ Khê, đi qua đèo Hải Vân đến quần thể di tích Cố đô Huế, sau đó trải nghiệm Ngũ Hành Sơn và không gian phố cổ Hội An bên sông Hoài.',
    thumbnail: image('photo-1559592413-7cec4d0cae2b'),
    images: [
      image('photo-1603852452378-a4e8d84324a2'),
      image('photo-1563354860-799d15199ac3'),
      image('flagged/photo-1549874613-8ea0adee1a82'),
      image('photo-1618165220283-e85246c4171c')
    ],
    videoUrl: 'https://www.youtube.com/watch?v=twb6d3t1SO0',
    adultPrice: 7490000,
    childPrice: 4490000,
    capacity: 28,
    itineraries: [
      { dayNumber: 1, title: 'Đà Nẵng - Sơn Trà - Mỹ Khê', description: 'Đón khách tại Đà Nẵng, tham quan bán đảo Sơn Trà và chùa Linh Ứng. Buổi chiều tự do dạo biển Mỹ Khê; buổi tối khám phá khu vực sông Hàn.' },
      { dayNumber: 2, title: 'Đà Nẵng - Hải Vân - Cố đô Huế', description: 'Khởi hành đi Huế qua cung đường Hải Vân. Tham quan Đại Nội, chùa Thiên Mụ và dạo bên sông Hương trước khi trở về Đà Nẵng.' },
      { dayNumber: 3, title: 'Ngũ Hành Sơn - Phố cổ Hội An', description: 'Tham quan danh thắng Ngũ Hành Sơn, di chuyển đến Hội An. Dạo bộ qua Chùa Cầu, các hội quán và những tuyến phố di sản ven sông Hoài.' },
      { dayNumber: 4, title: 'Hội An - Đà Nẵng - Tiễn khách', description: 'Buổi sáng tự do thưởng thức ẩm thực địa phương và mua đặc sản. Trả phòng, trở lại Đà Nẵng và kết thúc hành trình.' }
    ]
  },
  {
    code: 'HANOI-NINHBINH-HALONG-4N3D',
    category: 'Tour Nghỉ Dưỡng Sinh Thái',
    name: 'Hà Nội - Ninh Bình - Hạ Long 4 ngày 3 đêm',
    durationDays: 4,
    durationNights: 3,
    destinations: ['Hà Nội', 'Ninh Bình', 'Hạ Long'],
    hotel: 'Vinpearl Resort & Spa Hạ Long',
    overview: 'Hành trình miền Bắc cân bằng giữa chiều sâu văn hóa Hà Nội và hai vùng cảnh quan karst nổi tiếng. Lịch trình đi thuyền tại Tràng An, tìm hiểu Cố đô Hoa Lư và khám phá vịnh Hạ Long với các đảo đá vôi đặc trưng.',
    thumbnail: image('photo-1643029891412-92f9a81a8c16'),
    images: [
      image('photo-1531737212413-667205e1cda7'),
      image('photo-1504457047772-27faf1c00561'),
      image('photo-1697850084120-4896a446a04d'),
      image('photo-1509030450996-dd1a26dda07a')
    ],
    videoUrl: 'https://www.youtube.com/watch?v=Lgvc0l1UyaU',
    adultPrice: 8990000,
    childPrice: 5390000,
    capacity: 24,
    itineraries: [
      { dayNumber: 1, title: 'Hà Nội - Hồ Hoàn Kiếm - Phố cổ', description: 'Đón khách tại Hà Nội. Tham quan khu vực hồ Hoàn Kiếm, đền Ngọc Sơn và đi bộ qua các tuyến phố nghề trong khu phố cổ.' },
      { dayNumber: 2, title: 'Hà Nội - Hoa Lư - Tràng An', description: 'Di chuyển đến Ninh Bình, tìm hiểu khu di tích Cố đô Hoa Lư và trải nghiệm tuyến thuyền xuyên qua cảnh quan núi đá vôi của Tràng An.' },
      { dayNumber: 3, title: 'Ninh Bình - Vịnh Hạ Long', description: 'Khởi hành đi Hạ Long. Lên tàu tham quan vịnh, ngắm các đảo đá vôi và trải nghiệm điểm hang động theo tuyến khai thác trong ngày.' },
      { dayNumber: 4, title: 'Hạ Long - Hà Nội', description: 'Buổi sáng nghỉ ngơi bên vịnh hoặc khám phá Bãi Cháy. Trả phòng, trở về Hà Nội và kết thúc hành trình.' }
    ]
  },
  {
    code: 'SAPA-FANSIPAN-3N2D',
    category: 'Tour Khám Phá Tây Bắc',
    name: 'Sa Pa - Fansipan - Mường Hoa 3 ngày 2 đêm',
    durationDays: 3,
    durationNights: 2,
    destinations: ['Sa Pa'],
    hotel: 'Silk Path Grand Sapa Resort & Spa',
    overview: 'Chuyến đi tập trung vào cảnh quan Hoàng Liên Sơn và đời sống vùng cao Sa Pa. Du khách có thời gian tham quan bản Cát Cát, chinh phục khu vực đỉnh Fansipan và đi qua thung lũng Mường Hoa - Tả Van.',
    thumbnail: image('photo-1570366583862-f91883984fde'),
    images: [
      image('photo-1732099083114-4fb49a280eec'),
      image('photo-1694152363060-cc26bde73872'),
      image('photo-1570366583862-f91883984fde')
    ],
    videoUrl: 'https://www.youtube.com/watch?v=YHBqLih80uw',
    adultPrice: 4990000,
    childPrice: 2990000,
    capacity: 24,
    itineraries: [
      { dayNumber: 1, title: 'Hà Nội - Sa Pa - Bản Cát Cát', description: 'Khởi hành từ Hà Nội đến Sa Pa. Buổi chiều đi bộ tham quan bản Cát Cát, tìm hiểu nghề thủ công và không gian cư trú truyền thống của người H’Mông.' },
      { dayNumber: 2, title: 'Fansipan - Thị xã Sa Pa', description: 'Tham quan khu vực Fansipan bằng hệ thống cáp treo và tàu hỏa leo núi theo điều kiện thời tiết. Buổi chiều tự do khám phá nhà thờ đá và trung tâm Sa Pa.' },
      { dayNumber: 3, title: 'Mường Hoa - Tả Van - Hà Nội', description: 'Tham quan thung lũng Mường Hoa và khu vực Tả Van, ngắm ruộng bậc thang theo mùa. Trở về Hà Nội vào cuối ngày.' }
    ]
  },
  {
    code: 'PHUQUOC-4N3D',
    category: 'Tour Biển Đảo',
    name: 'Phú Quốc - Nam đảo - Hàm Ninh 4 ngày 3 đêm',
    durationDays: 4,
    durationNights: 3,
    destinations: ['Phú Quốc'],
    hotel: 'Salinda Resort Phu Quoc Island',
    overview: 'Kỳ nghỉ kết hợp bãi biển, trải nghiệm Nam đảo và văn hóa bản địa Phú Quốc. Hành trình đưa du khách đến thị trấn Dương Đông, quần đảo An Thới, làng chài Hàm Ninh, vườn tiêu và các cơ sở nghề làm nước mắm truyền thống.',
    thumbnail: image('photo-1526139334526-f591a54b477c'),
    images: [
      image('photo-1746292448726-9e75b5f1067d'),
      image('photo-1693294603830-f44c9511d643'),
      image('photo-1526139334526-f591a54b477c')
    ],
    videoUrl: 'https://www.youtube.com/watch?v=Lgvc0l1UyaU',
    adultPrice: 9490000,
    childPrice: 5690000,
    capacity: 24,
    itineraries: [
      { dayNumber: 1, title: 'Đến Phú Quốc - Dương Đông', description: 'Đón khách tại sân bay Phú Quốc, nhận phòng. Buổi chiều tham quan Dinh Cậu; buổi tối tự do khám phá chợ đêm Dương Đông.' },
      { dayNumber: 2, title: 'Nam đảo - Quần đảo An Thới', description: 'Khám phá khu vực Nam đảo, đi cáp treo vượt biển đến Hòn Thơm hoặc tham gia tuyến canô tham quan các đảo tùy điều kiện vận hành và thời tiết.' },
      { dayNumber: 3, title: 'Hàm Ninh - Vườn tiêu - Nghề làm nước mắm', description: 'Thăm làng chài Hàm Ninh, vườn tiêu và cơ sở sản xuất nước mắm để tìm hiểu các nghề truyền thống gắn với đời sống trên đảo.' },
      { dayNumber: 4, title: 'Phú Quốc - Tiễn sân bay', description: 'Tự do nghỉ ngơi, tắm biển và mua đặc sản. Trả phòng, di chuyển ra sân bay và kết thúc chuyến đi.' }
    ]
  },
  {
    code: 'CANTHO-CAIRANG-2N1D',
    category: 'Tour Miền Sông Nước',
    name: 'Cần Thơ - Chợ nổi Cái Răng 2 ngày 1 đêm',
    durationDays: 2,
    durationNights: 1,
    destinations: ['Cần Thơ'],
    overview: 'Hành trình ngắn khám phá nhịp sống bên sông Hậu. Du khách tham quan nhà cổ Bình Thủy, bến Ninh Kiều, dậy sớm đi thuyền trên chợ nổi Cái Răng và trải nghiệm vườn cây, làng nghề địa phương.',
    thumbnail: image('photo-1543411789-1a67a2ac05c6'),
    images: [
      image('photo-1677552926138-f7dbb71b226f'),
      image('photo-1580630873708-e0475b1856c4'),
      image('photo-1543411789-1a67a2ac05c6')
    ],
    videoUrl: 'https://www.youtube.com/watch?v=04Kf_0kppPM',
    adultPrice: 2690000,
    childPrice: 1590000,
    capacity: 28,
    itineraries: [
      { dayNumber: 1, title: 'TP. Hồ Chí Minh - Bình Thủy - Ninh Kiều', description: 'Khởi hành đến Cần Thơ. Tham quan nhà cổ Bình Thủy, dạo bến Ninh Kiều và trải nghiệm ẩm thực địa phương bên sông Hậu.' },
      { dayNumber: 2, title: 'Chợ nổi Cái Răng - Vườn cây - Trở về', description: 'Đi thuyền từ sáng sớm để quan sát hoạt động mua bán tại chợ nổi Cái Răng. Ghé làng nghề hoặc vườn cây theo mùa trước khi trở về TP. Hồ Chí Minh.' }
    ]
  },
  {
    code: 'HANOI-VANHOA-AMTHUC-3N2D',
    category: 'Tour Văn Hóa - Ẩm Thực',
    name: 'Hà Nội văn hóa và ẩm thực 3 ngày 2 đêm',
    durationDays: 3,
    durationNights: 2,
    destinations: ['Hà Nội'],
    overview: 'Chương trình khám phá Hà Nội ở nhịp độ vừa phải, kết hợp các địa danh lịch sử, không gian hồ và khu phố cổ. Điểm nhấn là trải nghiệm những món ăn tiêu biểu như phở, bún chả, bánh cuốn và cà phê theo khẩu vị cá nhân.',
    thumbnail: image('photo-1509030450996-dd1a26dda07a'),
    images: [
      image('photo-1726346234848-a6c0e78efd8c'),
      image('photo-1509030450996-dd1a26dda07a'),
      image('photo-1504457047772-27faf1c00561')
    ],
    videoUrl: 'https://www.youtube.com/watch?v=04Kf_0kppPM',
    adultPrice: 4290000,
    childPrice: 2590000,
    capacity: 24,
    itineraries: [
      { dayNumber: 1, title: 'Hồ Hoàn Kiếm - Phố cổ Hà Nội', description: 'Đón khách, tham quan hồ Hoàn Kiếm và đền Ngọc Sơn. Đi bộ qua khu phố cổ, thưởng thức món ăn địa phương tại các cơ sở phù hợp khẩu vị.' },
      { dayNumber: 2, title: 'Ba Đình - Văn Miếu - Múa rối nước', description: 'Tham quan khu vực Quảng trường Ba Đình, Văn Miếu - Quốc Tử Giám và một bảo tàng phù hợp lịch mở cửa. Buổi tối xem biểu diễn múa rối nước.' },
      { dayNumber: 3, title: 'Hồ Tây - Chợ địa phương - Tiễn khách', description: 'Dạo khu vực hồ Tây, ghé chợ hoặc phố ẩm thực để tìm hiểu nguyên liệu và món ăn Hà Nội. Trả phòng và kết thúc chương trình.' }
    ]
  }
];

module.exports = {
  categories,
  destinations: [...destinations, ...expandedCatalog.destinations],
  hotels,
  tours: [...tours, ...expandedCatalog.tours]
};
