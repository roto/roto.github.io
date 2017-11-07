/* Data Models */
OrderState = {
	QUEUEING: 	"queueing",
	PROCESSING:	"processing",
	SERVING:	"serving",
	FINISHED:	"finished",
	REJECTED:	"rejected",
}

var orderItems = {};

var menuGroups = [{
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
		initial:	"CG",
	},
	
	'com-rang-dua-bo': {
		name:	"Cơm Rang Dưa Bò",
		image:  "https://i.ytimg.com/vi/e9h2xmSoyLo/maxresdefault.jpg",
		price:	"25000",
		initial:	"CRDB",
	},

	"pho-bo": {
		name:   "Phở bò",
		desc:   "Tái, chín, lăn, gàu...",
		image:  "http://vaobepnauan.com/wp-content/uploads/2014/08/cach-nau-pho-bo-gia-truyen-2.jpg",
		price:	"30000",
		initial:	"PB",
	},
	
	"pho-ga": {
		name:   "Phở Gà",
		desc:   "Đùi, cánh..",
		image:  "http://amthuchanoi.org/wp-content/uploads/2015/04/Diem-danh-nhung-quan-pho-ga-ngon-o-ha-noi6.jpg",
		price:	"30000",
		initial:	"PG",
	},
	
	"pho-ngan": {
		name:   "Phở Ngan",
		desc:   "Măng, tiết..",
		image:  "https://media.foody.vn/res/g4/36737/prof/s576x330/foody-mobile-quan-pho-ngan-bac-giang.jpg",
		price:	"3500000",
		initial:	"PN",
	},
	
	"pho-ngo": {
		name:   "Phở Ngó",
		desc:   "Gọi trà đá ngồi ngó người ta ăn.",
		image:  "http://media.tinmoi.vn/2015/09/04/ngo-sen-va-nhung-tac-dung-tuuyet-voi-it-biet.jpg",
		price:	"5000",
		initial:	"NGO",
	},
};

var deliveryData = {
	1: {
		name: "Tầng 1",
		seats: {
			1:	{ name: "1", displayName: "101" },
			2: 	{ name: "2", displayName: "102" },
			3:	{ name: "3", displayName: "103" },
			4:	{ name: "4", displayName: "104" },
			5:	{ name: "5", displayName: "105" },
			6:	{ name: "6", displayName: "106" },
			7:	{ name: "7", displayName: "107" },
			8:	{ name: "8", displayName: "108" },
			9:	{ name: "9", displayName: "109" },
			10:	{ name: "10", displayName: "110" },
			11:	{ name: "11", displayName: "111" },
		},
	},
	2: {
		name: "Tầng 2",
		seats: {
			1:	{ name: "1", displayName: "201" },
			2:	{ name: "2", displayName: "202" },
			3:	{ name: "3", displayName: "203" },
			4:	{ name: "4", displayName: "204" },
			5:	{ name: "5", displayName: "205" },
			6:	{ name: "6", displayName: "206" },
		},
	},
	3: {
		name: "Tầng 3",
		seats: {
			A:	{ name: "A", displayName: "3A" },
			B:	{ name: "B", displayName: "3B" },
			C:	{ name: "C", displayName: "3C" },
			D:	{ name: "D", displayName: "3D" },
			E:	{ name: "E", displayName: "3E" },
			F:	{ name: "F", displayName: "3F" },
		},
	},
};

/**
 * Temporary Data
 */

var orderGroups = {
	[generate_quick_guid()] : {
		tables: [ {floor: 1, seats: [3, 4, 5]} ],
		orders: [{
			created: (new Date).getTime() - 1000 * 60 * 10,
			itemID: "pho-ngan",
			request: "nhiều tiết",
			quantity: 4,
		}, {
			created: (new Date).getTime() - 1000 * 60 * 3,
			itemID: "pho-bo",
			quantity: 3,
		}],
	},
	[generate_quick_guid()] : {
		tables: [ {floor: 2, seats: [5, 6]} ],
		orders: [{
			created: (new Date).getTime() - 1000 * 60 * 9,
			itemID: "pho-bo",
			request: "ít bún",
		}, {
			created: (new Date).getTime() - 1000 * 60 * 5,
			itemID: "com-ga",
			quantity: 2,
		}],
	},
	[generate_quick_guid()] : {
		tables: [ {floor: 3, seats: ['B', 'D']} ],
		orders: [{
			created: (new Date).getTime() - 1000 * 60 * 8,
			itemID: "com-rang-dua-bo",
		}],
	},
	[generate_quick_guid()] : {
		tables: [ {floor: 1, seats: [5, 6]} ],
		orders: [{
			created: (new Date).getTime() - 1000 * 60 * 2,
			itemID: "com-ga",
			request: "không sốt",
			quantity: 2,
		}],
	},
	[generate_quick_guid()] : {
		tables: [ {floor: 1, seats: [1, 2, 5]} ],
		orders: [{
			created: (new Date).getTime() - 1000 * 60 * 13,
			itemID: "com-ga",
		}],
	},
};

// construct the full order list from bill list
var allOrderItems = [];
for (var groupGUID in orderGroups) {
	var tableSharedCount = Number.MAX_SAFE_INTEGER;

	var group = orderGroups[groupGUID];
	var tableToDisplay = getGroupDisplayName(group);
	
	for (j in group.orders) {
		var order = group.orders[j];
		order.table = tableToDisplay;
	}

	allOrderItems = allOrderItems.concat(group.orders);
}

function getGroupDisplayName(group) {
	var displayName;

	for (var i in group.tables) {
		var floorID = group.tables[i].floor;
		var floor = deliveryData[floorID];
		if (!floor) {
			throw "Floor not exist: " + floorID;
		}

		for (var j in group.tables[i].seats) {
			var seatID = group.tables[i].seats[j];
			var seat = floor.seats[seatID];
			if (!seat) {
				throw "Seat not exist: " + seatID + " on floor " + floorID;
			}

			if (!seat.groups) {
				seat.groups = [ groupGUID ];
			} else if ($.inArray(groupGUID, seat.groups) < 0) {
				seat.groups.push(groupGUID);
			}

			if (tableSharedCount > seat.groups.length) {
				tableSharedCount = seat.groups.length;
				displayName = seat.displayName;
			}
		}
	}

	return displayName;
}

allOrderItems.sort(function(a, b) {
	return a.created - b.created;
})

// temporary initial object for table 206
// https://stackoverflow.com/questions/4044845/retrieving-a-property-of-a-json-object-by-index/31103463#31103463
var groupOrderItems = orderGroups[Object.keys(orderGroups)[1]].orders;
