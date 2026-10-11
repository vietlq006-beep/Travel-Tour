const image = (path) => `https://images.unsplash.com/${path}?auto=format&fit=crop&w=1600&q=82`;

const VIDEOS = {
  highlights: 'https://www.youtube.com/watch?v=Lgvc0l1UyaU',
  wonders: 'https://www.youtube.com/watch?v=YHBqLih80uw',
  welcome: 'https://www.youtube.com/watch?v=04Kf_0kppPM',
  hoiAn: 'https://www.youtube.com/watch?v=twb6d3t1SO0'
};

// Ảnh đại diện của từng điểm đến được chụp tại chính địa phương hoặc cùng tiểu
// vùng của tuyến. Tất cả là ảnh thật được phân phối theo Unsplash License.
const MEDIA = {
  haGiang: [
    image('photo-1657445449727-017d2f9f44e7'),
    image('photo-1570366583862-f91883984fde'),
    image('photo-1694152363060-cc26bde73872')
  ],
  caoBang: [
    image('photo-1772165009296-2e86e417d62d'),
    image('photo-1657445449727-017d2f9f44e7'),
    image('photo-1531737212413-667205e1cda7')
  ],
  mocChau: [
    image('photo-1744254525928-170fe34f13c8'),
    image('photo-1570366583862-f91883984fde'),
    image('photo-1732099083114-4fb49a280eec')
  ],
  catBa: [
    image('photo-1722471467241-5327b98a4976'),
    image('photo-1700738258173-e160e1809ac5'),
    image('photo-1643029891412-92f9a81a8c16')
  ],
  quangBinh: [
    image('photo-1758298134993-743b156eb23a'),
    image('photo-1618165220283-e85246c4171c'),
    image('photo-1559592413-7cec4d0cae2b')
  ],
  nhaTrang: [
    image('photo-1533002832-1721d16b4bb9'),
    image('photo-1526139334526-f591a54b477c'),
    image('photo-1746292448726-9e75b5f1067d')
  ],
  daLat: [
    image('photo-1669413487832-a8733f063ca8'),
    image('photo-1570366583862-f91883984fde'),
    image('photo-1531737212413-667205e1cda7')
  ],
  quyNhon: [
    image('photo-1689428962568-fe58ab6cc4cd'),
    image('photo-1563354860-799d15199ac3'),
    image('photo-1603852452378-a4e8d84324a2')
  ],
  muiNe: [
    image('photo-1714271511582-3483dcf0eb71'),
    image('photo-1526139334526-f591a54b477c'),
    image('photo-1693294603830-f44c9511d643')
  ],
  hcmc: [
    image('photo-1583417319070-4a69db38a482'),
    image('photo-1509030450996-dd1a26dda07a'),
    image('photo-1726346234848-a6c0e78efd8c')
  ],
  vungTau: [
    image('photo-1623596711744-c10ed15581d9'),
    image('photo-1693294603830-f44c9511d643'),
    image('photo-1746292448726-9e75b5f1067d')
  ],
  tayNinh: [
    image('photo-1767757430757-acd414f24fa4'),
    image('photo-1531737212413-667205e1cda7'),
    image('photo-1580630873708-e0475b1856c4')
  ],
  benTre: [
    image('photo-1695927521805-d60927fc790d'),
    image('photo-1677552926138-f7dbb71b226f'),
    image('photo-1580630873708-e0475b1856c4')
  ],
  chauDoc: [
    image('photo-1677552926138-f7dbb71b226f'),
    image('photo-1543411789-1a67a2ac05c6'),
    image('photo-1580630873708-e0475b1856c4')
  ],
  conDao: [
    image('photo-1686073769358-57d716df2f3b'),
    image('photo-1526139334526-f591a54b477c'),
    image('photo-1746292448726-9e75b5f1067d')
  ]
};

const destinations = [
  {
    name: 'Hà Giang', region: 'BAC',
    description: 'Miền cao địa đầu Tổ quốc với Cao nguyên đá Đồng Văn, đèo Mã Pì Lèng, sông Nho Quế và các phiên chợ vùng cao.',
    imageUrl: MEDIA.haGiang[0]
  },
  {
    name: 'Cao Bằng', region: 'BAC',
    description: 'Tỉnh biên giới Đông Bắc nổi bật với thác Bản Giốc, động Ngườm Ngao, khu di tích Pác Bó và cảnh quan công viên địa chất.',
    imageUrl: MEDIA.caoBang[0]
  },
  {
    name: 'Mộc Châu', region: 'BAC',
    description: 'Cao nguyên của Sơn La với đồi chè, thung lũng mận, rừng thông và khí hậu mát mẻ theo mùa.',
    imageUrl: MEDIA.mocChau[0]
  },
  {
    name: 'Cát Bà', region: 'BAC',
    description: 'Quần đảo thuộc Hải Phòng, cửa ngõ khám phá vịnh Lan Hạ, làng chài Việt Hải và Vườn quốc gia Cát Bà.',
    imageUrl: MEDIA.catBa[0]
  },
  {
    name: 'Quảng Bình', region: 'TRUNG',
    description: 'Điểm đến hang động và thiên nhiên với Phong Nha - Kẻ Bàng, sông Chày, bãi biển Nhật Lệ và hệ sinh thái núi đá vôi.',
    imageUrl: MEDIA.quangBinh[0]
  },
  {
    name: 'Nha Trang', region: 'TRUNG',
    description: 'Thành phố biển bên vịnh Nha Trang, phù hợp cho hành trình tham quan đảo, lặn ngắm san hô và tìm hiểu văn hóa Chăm.',
    imageUrl: MEDIA.nhaTrang[0]
  },
  {
    name: 'Đà Lạt', region: 'TRUNG',
    description: 'Đô thị cao nguyên Lâm Viên với rừng thông, hồ, thác, vườn hoa và các công trình kiến trúc đặc trưng.',
    imageUrl: MEDIA.daLat[0]
  },
  {
    name: 'Quy Nhơn', region: 'TRUNG',
    description: 'Thành phố biển Nam Trung Bộ với bán đảo Phương Mai, Eo Gió, Kỳ Co và dấu tích văn hóa Chăm.',
    imageUrl: MEDIA.quyNhon[0]
  },
  {
    name: 'Mũi Né', region: 'TRUNG',
    description: 'Khu du lịch ven biển Phan Thiết nổi bật với đồi cát, làng chài, Bàu Trắng và các hoạt động thể thao biển.',
    imageUrl: MEDIA.muiNe[0]
  },
  {
    name: 'TP. Hồ Chí Minh', region: 'NAM',
    description: 'Đô thị lớn nhất Việt Nam với hệ thống bảo tàng, công trình lịch sử, khu phố ẩm thực và nhịp sống hiện đại.',
    imageUrl: MEDIA.hcmc[0]
  },
  {
    name: 'Vũng Tàu', region: 'NAM',
    description: 'Thành phố biển gần TP. Hồ Chí Minh với Bãi Sau, Bãi Trước, Núi Nhỏ, Bạch Dinh và làng nghề ven biển.',
    imageUrl: MEDIA.vungTau[0]
  },
  {
    name: 'Tây Ninh', region: 'NAM',
    description: 'Điểm đến văn hóa - tâm linh với núi Bà Đen, Tòa Thánh Cao Đài và hồ Dầu Tiếng.',
    imageUrl: MEDIA.tayNinh[0]
  },
  {
    name: 'Bến Tre', region: 'NAM',
    description: 'Xứ dừa bên các nhánh sông Mekong, phù hợp với trải nghiệm xuồng nhỏ, vườn cây, làng nghề và homestay cộng đồng.',
    imageUrl: MEDIA.benTre[0]
  },
  {
    name: 'Châu Đốc', region: 'NAM',
    description: 'Thành phố biên giới của An Giang với núi Sam, miếu Bà Chúa Xứ, làng Chăm và rừng tràm Trà Sư.',
    imageUrl: MEDIA.chauDoc[0]
  },
  {
    name: 'Côn Đảo', region: 'NAM',
    description: 'Quần đảo ngoài khơi Nam Bộ có giá trị lịch sử, hệ sinh thái biển, bãi tắm yên tĩnh và Vườn quốc gia Côn Đảo.',
    imageUrl: MEDIA.conDao[0]
  }
];

const tour = ({ code, category, name, days, destinations: places, overview, media, videoUrl = VIDEOS.welcome, adultPrice, childPrice, capacity = 24, itineraries }) => ({
  code,
  category,
  name,
  durationDays: days,
  durationNights: days - 1,
  destinations: places,
  overview,
  thumbnail: media[0],
  images: media,
  videoUrl,
  adultPrice,
  childPrice,
  capacity,
  itineraries: itineraries.map(([title, description], index) => ({ dayNumber: index + 1, title, description }))
});

const tours = [
  tour({
    code: 'HAGIANG-DONGVAN-4N3D', category: 'Tour Khám Phá Tây Bắc',
    name: 'Hà Giang - Đồng Văn - Mã Pì Lèng 4 ngày 3 đêm', days: 4,
    destinations: ['Hà Giang'], media: MEDIA.haGiang, videoUrl: VIDEOS.wonders,
    overview: 'Cung đường vòng Hà Giang dành cho du khách yêu cảnh quan núi cao và văn hóa bản địa, đi qua Quản Bạ, Yên Minh, Cao nguyên đá Đồng Văn, cột cờ Lũng Cú và đèo Mã Pì Lèng.',
    adultPrice: 6890000, childPrice: 4190000, capacity: 20,
    itineraries: [
      ['Hà Nội - Hà Giang - Quản Bạ', 'Khởi hành sớm từ Hà Nội, đến thành phố Hà Giang và tiếp tục qua dốc Bắc Sum, cổng trời Quản Bạ. Nghỉ đêm khu vực Yên Minh.'],
      ['Yên Minh - Lũng Cú - Đồng Văn', 'Đi qua các điểm địa chất tiêu biểu của Cao nguyên đá, tham quan dinh thự họ Vương và cột cờ Lũng Cú trước khi về phố cổ Đồng Văn.'],
      ['Đồng Văn - Mã Pì Lèng - sông Nho Quế', 'Chinh phục đèo Mã Pì Lèng, ngắm hẻm Tu Sản và trải nghiệm thuyền trên sông Nho Quế khi điều kiện vận hành cho phép.'],
      ['Đồng Văn - Hà Giang - Hà Nội', 'Trở lại thành phố Hà Giang theo cung đường Quản Bạ, dừng nghỉ và mua đặc sản địa phương trước khi về Hà Nội.']
    ]
  }),
  tour({
    code: 'CAOBANG-BANGIOC-3N2D', category: 'Tour Nghỉ Dưỡng Sinh Thái',
    name: 'Cao Bằng - Bản Giốc - Pác Bó 3 ngày 2 đêm', days: 3,
    destinations: ['Cao Bằng'], media: MEDIA.caoBang, videoUrl: VIDEOS.wonders,
    overview: 'Hành trình Đông Bắc kết hợp cảnh quan thác Bản Giốc, hang động Ngườm Ngao và không gian lịch sử Pác Bó, phù hợp với nhóm nhỏ yêu thiên nhiên.',
    adultPrice: 5290000, childPrice: 3190000, capacity: 22,
    itineraries: [
      ['Hà Nội - Cao Bằng', 'Khởi hành theo tuyến cao tốc và quốc lộ đến Cao Bằng, nhận phòng và tự do tìm hiểu ẩm thực khu vực trung tâm thành phố.'],
      ['Thác Bản Giốc - động Ngườm Ngao', 'Tham quan thác Bản Giốc ở huyện Trùng Khánh, sau đó khám phá hệ thống nhũ đá tại động Ngườm Ngao theo tuyến mở cửa.'],
      ['Pác Bó - Hà Nội', 'Tham quan khu di tích Pác Bó, suối Lê Nin và núi Các Mác; trở về Hà Nội vào cuối ngày.']
    ]
  }),
  tour({
    code: 'MOCCHAU-2N1D', category: 'Tour Khám Phá Tây Bắc',
    name: 'Mộc Châu mùa hoa và đồi chè 2 ngày 1 đêm', days: 2,
    destinations: ['Mộc Châu'], media: MEDIA.mocChau, videoUrl: VIDEOS.wonders,
    overview: 'Chuyến đi cuối tuần đến cao nguyên Mộc Châu, ghé đồi chè, rừng thông và các vườn hoa hoặc vườn quả theo đúng mùa khai thác.',
    adultPrice: 2890000, childPrice: 1690000, capacity: 28,
    itineraries: [
      ['Hà Nội - cao nguyên Mộc Châu', 'Di chuyển đến Mộc Châu, tham quan đồi chè và một điểm vườn hoa hoặc vườn mận đang vào mùa; nhận phòng và nghỉ đêm.'],
      ['Rừng thông - thác Dải Yếm - Hà Nội', 'Dạo rừng thông Bản Áng, tham quan thác Dải Yếm theo tình hình thời tiết, thưởng thức nông sản địa phương rồi trở về Hà Nội.']
    ]
  }),
  tour({
    code: 'CATBA-LANHA-3N2D', category: 'Tour Biển Đảo',
    name: 'Cát Bà - vịnh Lan Hạ 3 ngày 2 đêm', days: 3,
    destinations: ['Cát Bà'], media: MEDIA.catBa, videoUrl: VIDEOS.highlights,
    overview: 'Hành trình khám phá quần đảo Cát Bà, kết hợp đi tàu trên vịnh Lan Hạ, thăm làng Việt Hải và dành thời gian nghỉ biển.',
    adultPrice: 5790000, childPrice: 3490000, capacity: 22,
    itineraries: [
      ['Hà Nội - Hải Phòng - Cát Bà', 'Di chuyển đến Hải Phòng, qua tuyến phà hoặc cáp treo đang vận hành để sang Cát Bà; nhận phòng và dạo thị trấn.'],
      ['Vịnh Lan Hạ - làng Việt Hải', 'Lên tàu tham quan vịnh Lan Hạ, chèo kayak tại khu vực được cấp phép và ghé làng Việt Hải tùy lịch tàu, thủy triều và thời tiết.'],
      ['Vườn quốc gia Cát Bà - Hà Nội', 'Tham quan một tuyến ngắn trong Vườn quốc gia Cát Bà, trả phòng và trở về Hà Nội.']
    ]
  }),
  tour({
    code: 'HALONG-2N1D', category: 'Tour Biển Đảo',
    name: 'Du thuyền vịnh Hạ Long 2 ngày 1 đêm', days: 2,
    destinations: ['Hạ Long'], media: [image('photo-1643029891412-92f9a81a8c16'), image('photo-1697850084120-4896a446a04d'), MEDIA.catBa[0]], videoUrl: VIDEOS.highlights,
    overview: 'Kỳ nghỉ ngắn trên vịnh Hạ Long với lịch trình du thuyền, hang động và hoạt động chèo kayak hoặc thuyền nan theo tuyến được cấp phép.',
    adultPrice: 5990000, childPrice: 3590000, capacity: 20,
    itineraries: [
      ['Hà Nội - cảng Hạ Long - ngủ đêm trên vịnh', 'Đón khách tại Hà Nội, làm thủ tục lên du thuyền, dùng bữa trưa và tham quan hang động hoặc điểm đảo theo lịch của tàu.'],
      ['Bình minh trên vịnh - Hà Nội', 'Tham gia hoạt động buổi sáng, trả cabin, dùng bữa sớm và rời tàu tại cảng trước khi trở về Hà Nội.']
    ]
  }),
  tour({
    code: 'NINHBINH-2N1D', category: 'Tour Nghỉ Dưỡng Sinh Thái',
    name: 'Ninh Bình - Tràng An - Hang Múa 2 ngày 1 đêm', days: 2,
    destinations: ['Ninh Bình'], media: [image('photo-1531737212413-667205e1cda7'), image('photo-1504457047772-27faf1c00561'), MEDIA.haGiang[0]], videoUrl: VIDEOS.wonders,
    overview: 'Chuyến đi ngắn khám phá di sản Tràng An, Cố đô Hoa Lư và điểm ngắm toàn cảnh Hang Múa, bố trí thời gian vừa phải để hạn chế di chuyển gấp.',
    adultPrice: 2990000, childPrice: 1790000, capacity: 28,
    itineraries: [
      ['Hà Nội - Hoa Lư - Tràng An', 'Đến Ninh Bình, tham quan khu di tích Cố đô Hoa Lư và đi thuyền theo tuyến đang khai thác tại Tràng An.'],
      ['Hang Múa - Tam Cốc - Hà Nội', 'Chinh phục điểm ngắm cảnh Hang Múa theo thể trạng, dạo khu vực Tam Cốc và trở về Hà Nội vào buổi chiều.']
    ]
  }),
  tour({
    code: 'HANOI-HALONG-3N2D', category: 'Tour Văn Hóa - Ẩm Thực',
    name: 'Hà Nội - Hạ Long 3 ngày 2 đêm', days: 3,
    destinations: ['Hà Nội', 'Hạ Long'], media: [image('photo-1509030450996-dd1a26dda07a'), image('photo-1643029891412-92f9a81a8c16'), image('photo-1697850084120-4896a446a04d')], videoUrl: VIDEOS.highlights,
    overview: 'Tuyến cơ bản dành cho khách lần đầu đến miền Bắc, kết hợp khu phố cổ Hà Nội và một ngày du thuyền ngắm cảnh vịnh Hạ Long.',
    adultPrice: 6490000, childPrice: 3890000, capacity: 26,
    itineraries: [
      ['Đến Hà Nội - khu phố cổ', 'Đón khách, nhận phòng và tham quan hồ Hoàn Kiếm, đền Ngọc Sơn cùng các phố nghề trong khu phố cổ.'],
      ['Hà Nội - vịnh Hạ Long', 'Di chuyển đến Hạ Long, lên tàu tham quan vịnh theo tuyến trong ngày, ghé hang động và dùng bữa trên tàu.'],
      ['Hạ Long - Hà Nội - tiễn khách', 'Nghỉ ngơi tại Bãi Cháy, trả phòng và về Hà Nội; kết thúc tại điểm hẹn hoặc sân bay theo lựa chọn dịch vụ.']
    ]
  }),
  tour({
    code: 'QUANGBINH-PHONGNHA-3N2D', category: 'Tour Nghỉ Dưỡng Sinh Thái',
    name: 'Quảng Bình - Phong Nha 3 ngày 2 đêm', days: 3,
    destinations: ['Quảng Bình'], media: MEDIA.quangBinh, videoUrl: VIDEOS.wonders,
    overview: 'Hành trình khám phá Di sản thiên nhiên thế giới Phong Nha - Kẻ Bàng với tuyến động Phong Nha, động Thiên Đường và thời gian nghỉ tại biển Nhật Lệ.',
    adultPrice: 5290000, childPrice: 3190000, capacity: 24,
    itineraries: [
      ['Đồng Hới - biển Nhật Lệ', 'Đón khách tại ga hoặc sân bay Đồng Hới, nhận phòng và nghỉ ngơi; buổi chiều tự do dạo biển Nhật Lệ.'],
      ['Động Phong Nha - sông Son', 'Đi thuyền trên sông Son vào động Phong Nha theo tuyến đang mở, tìm hiểu địa chất và đời sống khu vực Sơn Trạch.'],
      ['Động Thiên Đường - tiễn khách', 'Tham quan tuyến phổ thông tại động Thiên Đường, trở lại Đồng Hới và kết thúc chương trình.']
    ]
  }),
  tour({
    code: 'HUE-QUANGBINH-4N3D', category: 'Tour Di Sản Miền Trung',
    name: 'Huế - Quảng Bình - Phong Nha 4 ngày 3 đêm', days: 4,
    destinations: ['Huế', 'Quảng Bình'], media: [image('photo-1618165220283-e85246c4171c'), ...MEDIA.quangBinh.slice(0, 2)], videoUrl: VIDEOS.wonders,
    overview: 'Tuyến di sản kết nối quần thể di tích Cố đô Huế với Phong Nha - Kẻ Bàng, cân bằng tham quan lịch sử, kiến trúc và thiên nhiên.',
    adultPrice: 7290000, childPrice: 4390000, capacity: 24,
    itineraries: [
      ['Đến Huế - sông Hương', 'Đón khách, nhận phòng và tham quan chùa Thiên Mụ; buổi tối tự do khám phá ẩm thực Huế.'],
      ['Đại Nội - lăng vua Nguyễn', 'Tham quan Đại Nội và một công trình lăng tẩm tiêu biểu đang mở cửa, sau đó nghỉ ngơi bên sông Hương.'],
      ['Huế - Phong Nha - Đồng Hới', 'Khởi hành đi Quảng Bình, đi thuyền tham quan động Phong Nha và nghỉ đêm tại Đồng Hới.'],
      ['Đồng Hới - tiễn khách', 'Dạo biển Nhật Lệ hoặc tham quan một điểm nội thành phù hợp giờ tàu, chuyến bay; kết thúc hành trình.']
    ]
  }),
  tour({
    code: 'DANANG-BANA-HOIAN-3N2D', category: 'Tour Di Sản Miền Trung',
    name: 'Đà Nẵng - Bà Nà - Hội An 3 ngày 2 đêm', days: 3,
    destinations: ['Đà Nẵng', 'Hội An'], media: [image('photo-1559592413-7cec4d0cae2b'), image('photo-1603852452378-a4e8d84324a2'), image('photo-1563354860-799d15199ac3')], videoUrl: VIDEOS.hoiAn,
    overview: 'Chương trình ba ngày kết hợp cảnh quan thành phố Đà Nẵng, khu du lịch Bà Nà và không gian di sản phố cổ Hội An.',
    adultPrice: 6190000, childPrice: 3690000, capacity: 28,
    itineraries: [
      ['Đà Nẵng - Sơn Trà - Mỹ Khê', 'Đón khách, tham quan bán đảo Sơn Trà và chùa Linh Ứng; buổi chiều nghỉ tại biển Mỹ Khê.'],
      ['Khu du lịch Bà Nà', 'Di chuyển đến Bà Nà, sử dụng cáp treo và tham quan các khu vực đang mở; trở lại Đà Nẵng cuối ngày.'],
      ['Ngũ Hành Sơn - Hội An - tiễn khách', 'Tham quan Ngũ Hành Sơn rồi dạo phố cổ Hội An, Chùa Cầu và các hội quán trước khi kết thúc.']
    ]
  }),
  tour({
    code: 'NHATRANG-4N3D', category: 'Tour Biển Đảo',
    name: 'Nha Trang - vịnh đảo 4 ngày 3 đêm', days: 4,
    destinations: ['Nha Trang'], media: MEDIA.nhaTrang, videoUrl: VIDEOS.highlights,
    overview: 'Kỳ nghỉ biển Nha Trang kết hợp chuyến tàu tham quan vịnh, tháp Bà Ponagar, Hòn Chồng và khoảng thời gian thư giãn tự do.',
    adultPrice: 7890000, childPrice: 4690000, capacity: 24,
    itineraries: [
      ['Đến Nha Trang - biển Trần Phú', 'Đón khách, nhận phòng và tự do nghỉ biển tại khu vực trung tâm dọc đường Trần Phú.'],
      ['Du ngoạn vịnh Nha Trang', 'Đi tàu hoặc canô theo tuyến đảo được phép khai thác, tham gia bơi hoặc lặn ngắm san hô tùy thời tiết và thể trạng.'],
      ['Tháp Bà Ponagar - Hòn Chồng', 'Tìm hiểu di sản Chăm tại tháp Bà Ponagar, tham quan Hòn Chồng và trải nghiệm tắm bùn theo gói đã chọn.'],
      ['Nha Trang - tiễn khách', 'Tự do mua đặc sản, trả phòng và di chuyển ra ga hoặc sân bay Cam Ranh.']
    ]
  }),
  tour({
    code: 'DALAT-3N2D', category: 'Tour Nghỉ Dưỡng Sinh Thái',
    name: 'Đà Lạt - rừng thông - thác nước 3 ngày 2 đêm', days: 3,
    destinations: ['Đà Lạt'], media: MEDIA.daLat, videoUrl: VIDEOS.wonders,
    overview: 'Kỳ nghỉ cao nguyên với hồ Xuân Hương, các công trình kiến trúc trung tâm, rừng thông và một tuyến thác phù hợp điều kiện thời tiết.',
    adultPrice: 4890000, childPrice: 2890000, capacity: 26,
    itineraries: [
      ['Đến Đà Lạt - hồ Xuân Hương', 'Đón khách, nhận phòng, dạo hồ Xuân Hương và quảng trường Lâm Viên; buổi tối tự do khám phá chợ Đà Lạt.'],
      ['Ngoại ô Đà Lạt - rừng thông - thác', 'Tham quan một tuyến ngoại ô gồm rừng thông, nông trại và thác nước đang mở cửa, ưu tiên trải nghiệm có kiểm soát an toàn.'],
      ['Kiến trúc Đà Lạt - tiễn khách', 'Thăm ga Đà Lạt hoặc một công trình kiến trúc tiêu biểu, mua nông sản và kết thúc chương trình.']
    ]
  }),
  tour({
    code: 'QUYNHON-3N2D', category: 'Tour Biển Đảo',
    name: 'Quy Nhơn - Kỳ Co - Eo Gió 3 ngày 2 đêm', days: 3,
    destinations: ['Quy Nhơn'], media: MEDIA.quyNhon, videoUrl: VIDEOS.highlights,
    overview: 'Tuyến biển Nam Trung Bộ khám phá bán đảo Phương Mai, Kỳ Co, Eo Gió và các di tích Chăm quanh Quy Nhơn.',
    adultPrice: 5690000, childPrice: 3390000, capacity: 24,
    itineraries: [
      ['Đến Quy Nhơn - Ghềnh Ráng', 'Đón khách, nhận phòng và tham quan khu vực Ghềnh Ráng; buổi tối trải nghiệm ẩm thực hải sản địa phương.'],
      ['Kỳ Co - Eo Gió', 'Di chuyển ra bán đảo Phương Mai, tham quan Eo Gió và đến Kỳ Co bằng phương tiện được phép tùy điều kiện biển.'],
      ['Tháp Chăm - tiễn khách', 'Tham quan một cụm tháp Chăm tiêu biểu gần Quy Nhơn, trả phòng và tiễn khách.']
    ]
  }),
  tour({
    code: 'MUINE-3N2D', category: 'Tour Biển Đảo',
    name: 'Mũi Né - Bàu Trắng - làng chài 3 ngày 2 đêm', days: 3,
    destinations: ['Mũi Né'], media: MEDIA.muiNe, videoUrl: VIDEOS.highlights,
    overview: 'Chuyến nghỉ biển Phan Thiết - Mũi Né với đồi cát, Bàu Trắng, suối Tiên và nhịp sống tại làng chài ven bờ.',
    adultPrice: 4490000, childPrice: 2690000, capacity: 26,
    itineraries: [
      ['TP. Hồ Chí Minh - Mũi Né', 'Khởi hành đến Mũi Né, nhận phòng và tự do nghỉ biển; dạo khu vực Hàm Tiến vào buổi tối.'],
      ['Bàu Trắng - đồi cát - làng chài', 'Khởi hành sớm ngắm bình minh tại đồi cát, tham quan Bàu Trắng và làng chài, trở về resort nghỉ ngơi.'],
      ['Suối Tiên - TP. Hồ Chí Minh', 'Đi bộ tuyến Suối Tiên phù hợp điều kiện dòng chảy, trả phòng và trở về TP. Hồ Chí Minh.']
    ]
  }),
  tour({
    code: 'NHATRANG-DALAT-5N4D', category: 'Tour Nghỉ Dưỡng Sinh Thái',
    name: 'Nha Trang - Đà Lạt 5 ngày 4 đêm', days: 5,
    destinations: ['Nha Trang', 'Đà Lạt'], media: [MEDIA.nhaTrang[0], MEDIA.daLat[0], MEDIA.nhaTrang[1], MEDIA.daLat[1]], videoUrl: VIDEOS.highlights,
    overview: 'Hành trình kết hợp khí hậu biển Nha Trang và cao nguyên Đà Lạt, dành hai ngày cho mỗi điểm để tránh lịch trình di chuyển quá dày.',
    adultPrice: 9790000, childPrice: 5890000, capacity: 24,
    itineraries: [
      ['Đến Nha Trang - nghỉ biển', 'Đón khách tại Cam Ranh, về trung tâm nhận phòng và nghỉ ngơi tại bãi biển Trần Phú.'],
      ['Vịnh Nha Trang', 'Tham gia chương trình tàu hoặc canô tham quan đảo theo điều kiện thời tiết; chiều tự do tại thành phố.'],
      ['Nha Trang - Đà Lạt', 'Tham quan tháp Bà Ponagar trước khi di chuyển theo quốc lộ lên Đà Lạt, nhận phòng và dạo chợ đêm.'],
      ['Đà Lạt ngoại ô', 'Khám phá một cung ngoại ô gồm rừng thông, nông trại, hồ hoặc thác đang mở cửa.'],
      ['Đà Lạt - tiễn khách', 'Dạo hồ Xuân Hương, mua đặc sản và di chuyển ra sân bay Liên Khương.']
    ]
  }),
  tour({
    code: 'HCMC-CITY-3N2D', category: 'Tour Văn Hóa - Ẩm Thực',
    name: 'TP. Hồ Chí Minh văn hóa và ẩm thực 3 ngày 2 đêm', days: 3,
    destinations: ['TP. Hồ Chí Minh'], media: MEDIA.hcmc, videoUrl: VIDEOS.welcome,
    overview: 'Chương trình tìm hiểu lịch sử đô thị Sài Gòn - TP. Hồ Chí Minh qua bảo tàng, công trình kiến trúc trung tâm, Chợ Lớn và ẩm thực địa phương.',
    adultPrice: 4590000, childPrice: 2790000, capacity: 24,
    itineraries: [
      ['Trung tâm Quận 1', 'Đón khách, tham quan các công trình trung tâm theo lịch mở cửa như Bưu điện Thành phố, đường sách và khu vực Nhà hát Thành phố.'],
      ['Bảo tàng - Chợ Lớn', 'Tham quan một bảo tàng lịch sử, sau đó khám phá không gian văn hóa và ẩm thực tại khu vực Chợ Lớn.'],
      ['Chợ Bến Thành - tiễn khách', 'Dạo khu vực chợ Bến Thành, mua đặc sản có nguồn gốc rõ ràng và tiễn khách tại sân bay hoặc điểm hẹn.']
    ]
  }),
  tour({
    code: 'HCMC-CUCHI-BENTRE-4N3D', category: 'Tour Văn Hóa - Ẩm Thực',
    name: 'TP. Hồ Chí Minh - Củ Chi - Bến Tre 4 ngày 3 đêm', days: 4,
    destinations: ['TP. Hồ Chí Minh', 'Bến Tre'], media: [MEDIA.hcmc[0], ...MEDIA.benTre], videoUrl: VIDEOS.welcome,
    overview: 'Tuyến miền Nam dành cho khách lần đầu, kết hợp trung tâm TP. Hồ Chí Minh, địa đạo Củ Chi và trải nghiệm sông nước - làng nghề tại Bến Tre.',
    adultPrice: 6990000, childPrice: 4190000, capacity: 24,
    itineraries: [
      ['Đến TP. Hồ Chí Minh', 'Đón khách, nhận phòng và tham quan các công trình lịch sử ở khu vực trung tâm Quận 1.'],
      ['Địa đạo Củ Chi', 'Di chuyển đến khu di tích địa đạo Củ Chi, nghe thuyết minh lịch sử và trải nghiệm tuyến tham quan phù hợp thể trạng.'],
      ['TP. Hồ Chí Minh - Bến Tre', 'Đi thuyền trên nhánh sông Mekong, ghé cơ sở làm sản phẩm từ dừa và trải nghiệm xuồng nhỏ tại tuyến được phép khai thác.'],
      ['Bến Tre - TP. Hồ Chí Minh - tiễn khách', 'Thăm vườn cây theo mùa, trở về TP. Hồ Chí Minh và kết thúc chương trình.']
    ]
  }),
  tour({
    code: 'VUNGTAU-2N1D', category: 'Tour Biển Đảo',
    name: 'Vũng Tàu nghỉ biển 2 ngày 1 đêm', days: 2,
    destinations: ['Vũng Tàu'], media: MEDIA.vungTau, videoUrl: VIDEOS.highlights,
    overview: 'Kỳ nghỉ cuối tuần tại thành phố biển Vũng Tàu, kết hợp thời gian tắm biển, tham quan Bạch Dinh và các điểm nhìn trên Núi Nhỏ.',
    adultPrice: 2790000, childPrice: 1690000, capacity: 30,
    itineraries: [
      ['TP. Hồ Chí Minh - Vũng Tàu - Bãi Sau', 'Khởi hành buổi sáng, nhận phòng và nghỉ biển tại Bãi Sau; buổi chiều dạo Bãi Trước.'],
      ['Bạch Dinh - Núi Nhỏ - trở về', 'Tham quan Bạch Dinh và một điểm ngắm cảnh tại Núi Nhỏ phù hợp thể trạng, dùng bữa trưa rồi trở về TP. Hồ Chí Minh.']
    ]
  }),
  tour({
    code: 'TAYNINH-BADEN-2N1D', category: 'Tour Văn Hóa - Ẩm Thực',
    name: 'Tây Ninh - núi Bà Đen 2 ngày 1 đêm', days: 2,
    destinations: ['Tây Ninh'], media: MEDIA.tayNinh, videoUrl: VIDEOS.welcome,
    overview: 'Hành trình ngắn tìm hiểu văn hóa Tây Ninh, tham quan Tòa Thánh Cao Đài và chinh phục khu vực núi Bà Đen bằng cáp treo.',
    adultPrice: 2990000, childPrice: 1790000, capacity: 28,
    itineraries: [
      ['TP. Hồ Chí Minh - Tòa Thánh - Tây Ninh', 'Di chuyển đến Tây Ninh, tham quan Tòa Thánh Cao Đài theo quy định tại điểm đến và thưởng thức đặc sản địa phương.'],
      ['Núi Bà Đen - TP. Hồ Chí Minh', 'Sử dụng cáp treo lên khu vực núi Bà Đen, tham quan các công trình mở cửa rồi trở về TP. Hồ Chí Minh.']
    ]
  }),
  tour({
    code: 'BENTRE-2N1D', category: 'Tour Miền Sông Nước',
    name: 'Bến Tre xứ dừa 2 ngày 1 đêm', days: 2,
    destinations: ['Bến Tre'], media: MEDIA.benTre, videoUrl: VIDEOS.welcome,
    overview: 'Chương trình cộng đồng tại Bến Tre với thuyền trên sông, làng nghề dừa, vườn cây và lưu trú quy mô nhỏ.',
    adultPrice: 3190000, childPrice: 1890000, capacity: 20,
    itineraries: [
      ['TP. Hồ Chí Minh - Bến Tre - làng nghề', 'Đến Bến Tre, đi thuyền qua các cù lao, thăm cơ sở chế biến sản phẩm từ dừa và dùng bữa với nguyên liệu địa phương.'],
      ['Vườn cây - xuồng nhỏ - trở về', 'Thăm vườn cây theo mùa, trải nghiệm xuồng chèo trên kênh phù hợp thủy triều rồi trở về TP. Hồ Chí Minh.']
    ]
  }),
  tour({
    code: 'CHAUDOC-3N2D', category: 'Tour Miền Sông Nước',
    name: 'Châu Đốc - Trà Sư - núi Sam 3 ngày 2 đêm', days: 3,
    destinations: ['Châu Đốc'], media: MEDIA.chauDoc, videoUrl: VIDEOS.welcome,
    overview: 'Khám phá vùng biên An Giang qua rừng tràm Trà Sư, núi Sam, các công trình tín ngưỡng và cộng đồng cư dân ven sông.',
    adultPrice: 4490000, childPrice: 2690000, capacity: 24,
    itineraries: [
      ['TP. Hồ Chí Minh - Châu Đốc', 'Di chuyển đến Châu Đốc, nhận phòng và tham quan khu vực núi Sam, miếu Bà Chúa Xứ theo quy định tại điểm.'],
      ['Rừng tràm Trà Sư - làng Chăm', 'Đi xuồng máy và xuồng chèo trên tuyến rừng tràm đang vận hành, sau đó tìm hiểu nghề dệt và đời sống cộng đồng Chăm.'],
      ['Chợ Châu Đốc - TP. Hồ Chí Minh', 'Tham quan chợ địa phương, lựa chọn đặc sản có nhãn mác rồi trở về TP. Hồ Chí Minh.']
    ]
  }),
  tour({
    code: 'CONDAO-3N2D', category: 'Tour Biển Đảo',
    name: 'Côn Đảo lịch sử và sinh thái 3 ngày 2 đêm', days: 3,
    destinations: ['Côn Đảo'], media: MEDIA.conDao, videoUrl: VIDEOS.highlights,
    overview: 'Hành trình tìm hiểu lịch sử Côn Đảo kết hợp bãi biển, cảnh quan vườn quốc gia và trải nghiệm sinh thái có kiểm soát.',
    adultPrice: 8990000, childPrice: 5390000, capacity: 20,
    itineraries: [
      ['Đến Côn Đảo - thị trấn', 'Đón khách tại sân bay Côn Đảo, nhận phòng và tham quan các địa điểm trung tâm thị trấn.'],
      ['Hệ thống di tích - bãi biển', 'Tham quan bảo tàng và một số điểm thuộc hệ thống di tích lịch sử, buổi chiều nghỉ tại bãi Đầm Trầu hoặc bãi biển phù hợp thời tiết.'],
      ['Cảnh quan sinh thái - tiễn sân bay', 'Khám phá một tuyến ngắn do Vườn quốc gia hướng dẫn hoặc tự do nghỉ biển, sau đó tiễn sân bay.']
    ]
  }),
  tour({
    code: 'PHUQUOC-5N4D', category: 'Tour Biển Đảo',
    name: 'Phú Quốc nghỉ dưỡng trọn vẹn 5 ngày 4 đêm', days: 5,
    destinations: ['Phú Quốc'], media: [image('photo-1526139334526-f591a54b477c'), image('photo-1746292448726-9e75b5f1067d'), image('photo-1693294603830-f44c9511d643')], videoUrl: VIDEOS.highlights,
    overview: 'Phiên bản nghỉ dưỡng dài ngày tại Phú Quốc, kết hợp Dương Đông, Nam đảo, làng chài, nghề truyền thống và một ngày hoàn toàn tự do.',
    adultPrice: 12490000, childPrice: 7490000, capacity: 22,
    itineraries: [
      ['Đến Phú Quốc - Dương Đông', 'Đón khách tại sân bay, nhận phòng; chiều tham quan Dinh Cậu và tối tự do tại chợ đêm Dương Đông.'],
      ['Nam đảo - An Thới', 'Tham quan Nam đảo, trải nghiệm cáp treo hoặc tuyến canô tùy gói dịch vụ và điều kiện thời tiết.'],
      ['Hàm Ninh - vườn tiêu - nước mắm', 'Tìm hiểu làng chài Hàm Ninh, vườn tiêu và cơ sở sản xuất nước mắm truyền thống.'],
      ['Ngày nghỉ dưỡng tự do', 'Dành trọn ngày cho nghỉ biển, dịch vụ tại resort hoặc lựa chọn trải nghiệm riêng có bảo hiểm phù hợp.'],
      ['Phú Quốc - tiễn sân bay', 'Trả phòng, mua đặc sản tại cơ sở có nguồn gốc rõ ràng và di chuyển ra sân bay.']
    ]
  }),
  tour({
    code: 'CANTHO-CHAUDOC-3N2D', category: 'Tour Miền Sông Nước',
    name: 'Cần Thơ - Châu Đốc 3 ngày 2 đêm', days: 3,
    destinations: ['Cần Thơ', 'Châu Đốc'], media: [image('photo-1543411789-1a67a2ac05c6'), image('photo-1677552926138-f7dbb71b226f'), image('photo-1580630873708-e0475b1856c4')], videoUrl: VIDEOS.welcome,
    overview: 'Tuyến đồng bằng sông Cửu Long kết nối chợ nổi Cái Răng, nhà cổ Bình Thủy với rừng tràm Trà Sư và không gian văn hóa Châu Đốc.',
    adultPrice: 5490000, childPrice: 3290000, capacity: 24,
    itineraries: [
      ['TP. Hồ Chí Minh - Cần Thơ', 'Di chuyển đến Cần Thơ, tham quan nhà cổ Bình Thủy và dạo bến Ninh Kiều vào buổi tối.'],
      ['Chợ nổi Cái Răng - Châu Đốc', 'Đi thuyền từ sáng sớm quan sát hoạt động chợ nổi, sau đó khởi hành đến Châu Đốc và tham quan núi Sam.'],
      ['Rừng tràm Trà Sư - TP. Hồ Chí Minh', 'Tham quan rừng tràm theo tuyến xuồng đang khai thác, dùng bữa trưa và trở về TP. Hồ Chí Minh.']
    ]
  })
];

module.exports = { destinations, tours };
