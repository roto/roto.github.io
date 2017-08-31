
// temporary initial object
var initialOrderItems = [{
		itemID: "pho-bo",
		request: "ít bún",
	}, {
		itemID: "com-ga",
		quantity: 2,
	},
];

var orderItems = {};

var menuGroups = [
	{
		id: "hot",
		name: "Hot",
		nofilter: true,
		items: ["pho-ngo"],
	}, {
		id: "recent",
		name: "Recent",
		nofilter: true,
		items: ["pho-ga", "com-rang-dua-bo"],
	}, {
		id: "com",
		name: "Cơm",
		items: ["com-ga", "com-rang-dua-bo"],
	}, {
		id: "pho",
		name: "Phở",
		items: ["pho-bo", "pho-ga", "pho-ngan", "pho-ngo"],
	},
];

var menuItems = {
	"com-ga": {
		name:   "Cơm Gà",
		desc:   "Cơm rang với đùi gà rán.",
		image:  "https://media.foody.vn/res/g1/6682/prof/s480x300/foody-mobile-foody-a-hai-com-ga-x-869-635948407399671556.jpg",
		price:	"35000",
	},
	
	'com-rang-dua-bo': {
		name:	"Cơm Rang Dưa Bò",
		image:  "https://i.ytimg.com/vi/e9h2xmSoyLo/maxresdefault.jpg",
		price:	"25000",
	},

	"pho-bo": {
		name:   "Phở bò",
		desc:   "Tái, chín, lăn, gàu...",
		image:  "http://vaobepnauan.com/wp-content/uploads/2014/08/cach-nau-pho-bo-gia-truyen-2.jpg",
		price:	"30000",
	},
	
	"pho-ga": {
		name:   "Phở Gà",
		desc:   "Đùi, cánh..",
		image:  "http://amthuchanoi.org/wp-content/uploads/2015/04/Diem-danh-nhung-quan-pho-ga-ngon-o-ha-noi6.jpg",
		price:	"30000",
	},
	
	"pho-ngan": {
		name:   "Phở Ngan",
		desc:   "Măng, tiết..",
		image:  "https://media.foody.vn/res/g4/36737/prof/s576x330/foody-mobile-quan-pho-ngan-bac-giang.jpg",
		price:	"3500000",
	},
	
	"pho-ngo": {
		name:   "Phở Ngó",
		desc:   "Gọi trà đá ngồi ngó người ta ăn.",
		image:  "http://media.tinmoi.vn/2015/09/04/ngo-sen-va-nhung-tac-dung-tuuyet-voi-it-biet.jpg",
		price:	"5000",
	},
};

var deliveryData = {
	1: {
		name: "Tầng 1",
		seats: [
			{ name: "1", displayName: "101" },
			{ name: "2", displayName: "102", taken: true },
			{ name: "3", displayName: "103" },
			{ name: "4", displayName: "104" },
			{ name: "5", displayName: "105" },
			{ name: "6", displayName: "106", taken: true },
			{ name: "7", displayName: "107", taken: true },
			{ name: "8", displayName: "108" },
			{ name: "9", displayName: "109" },
			{ name: "10", displayName: "110", taken: true },
			{ name: "11", displayName: "111" },
		],
	},
	2: {
		name: "Tầng 2",
		seats: [
			{ name: "1", displayName: "201", taken: true },
			{ name: "2", displayName: "202", taken: true },
			{ name: "3", displayName: "203", taken: true },
			{ name: "4", displayName: "204" },
			{ name: "5", displayName: "205" },
			{ name: "6", displayName: "206", taken: true },
		],
	},
	3: {
		name: "Tầng 3",
		seats: [
			{ name: "A", displayName: "3A" },
			{ name: "B", displayName: "3B" },
			{ name: "C", displayName: "3C" },
			{ name: "D", displayName: "3D", taken: true },
			{ name: "E", displayName: "3E", taken: true },
			{ name: "F", displayName: "3F", taken: true },
		],
	},
};
