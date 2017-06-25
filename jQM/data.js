
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
		image:  "https://nau.vn/wp-content/uploads/2014/12/com-rang-dua-bo.jpg",
		price:	"25000",
	},

	"pho-bo": {
		name:   "Phở bò",
		desc:   "Tái, chín, lăn, gàu...",
		image:  "http://media.phunutoday.vn/files/upload_images/2016/02/16/cach-nau-pho-bo-tai-gau-1-phunutoday_vn.jpg",
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
		image:  "https://www.vietravel.com/Images/NewsPicture/mien-gan.jpg",
		price:	"3500000",
	},
	
	"pho-ngo": {
		name:   "Phở Ngó",
		desc:   "Gọi trà đá ngồi ngó người ta ăn.",
		image:  "http://media.tinmoi.vn/2015/09/04/ngo-sen-va-nhung-tac-dung-tuuyet-voi-it-biet.jpg",
		price:	"5000",
	},
};
