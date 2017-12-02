/* Temporary Data */
var _SERVICES = {
	'bun' : {
		name: 'Bún ngan',
		desc: 'Chân cầu vượt Kim Mã',
		image: 'http://maishouston.com/img/home-photo-3.jpg',
		alias: 'Ngã Tư Kim Mã',
		initial: 'NTKM',

		product : {
			items : {
				'com-ga': {
					name:   'Cơm Gà',
					desc:   'Cơm rang với đùi gà rán.',
					image:  'https://media.foody.vn/res/g1/6682/prof/s480x300/foody-mobile-foody-a-hai-com-ga-x-869-635948407399671556.jpg',
					price:	'35000',
					initial:	'CG',
				},
				
				'com-rang-dua-bo': {
					name:	'Cơm Rang Dưa Bò',
					image:  'https://i.ytimg.com/vi/e9h2xmSoyLo/maxresdefault.jpg',
					price:	'25000',
					initial:	'CRDB',
				},
			
				'pho-bo': {
					name:   'Phở bò',
					desc:   'Tái, chín, lăn, gàu...',
					image:  'http://vaobepnauan.com/wp-content/uploads/2014/08/cach-nau-pho-bo-gia-truyen-2.jpg',
					price:	'30000',
					initial:	'PB',
				},
				
				'pho-ga': {
					name:   'Phở Gà',
					desc:   'Đùi, cánh..',
					image:  'http://amthuchanoi.org/wp-content/uploads/2015/04/Diem-danh-nhung-quan-pho-ga-ngon-o-ha-noi6.jpg',
					price:	'30000',
					initial:	'PG',
				},
				
				'pho-ngan': {
					name:   'Phở Ngan',
					desc:   'Măng, tiết..',
					image:  'https://media.foody.vn/res/g4/36737/prof/s576x330/foody-mobile-quan-pho-ngan-bac-giang.jpg',
					price:	'3500000',
					initial:	'PN',
				},
				
				'pho-ngo': {
					name:   'Phở Ngó',
					desc:   'Gọi trà đá ngồi ngó người ta ăn.',
					image:  'http://media.tinmoi.vn/2015/09/04/ngo-sen-va-nhung-tac-dung-tuuyet-voi-it-biet.jpg',
					price:	'5000',
					initial:	'NGO',
				},
			},

			categories : [{
				id: 'hot',
				name: 'Hot',
				nofilter: true,
				items: ['pho-ngo'],
			}, {
				id: 'recent',
				name: 'Recent',
				nofilter: true,
				items: ['pho-ga', 'com-rang-dua-bo'],
			}, {
				id: 'com',
				name: 'Cơm',
				items: ['com-ga', 'com-rang-dua-bo'],
			}, {
				id: 'pho',
				name: 'Phở',
				items: ['pho-bo', 'pho-ga', 'pho-ngan', 'pho-ngo'],
			}],
		},

		delivery : {
			1: {
				name: 'Tầng 1',
				seats: {
					1:	{ name: '1', displayName: '101' },
					2: 	{ name: '2', displayName: '102' },
					3:	{ name: '3', displayName: '103' },
					4:	{ name: '4', displayName: '104' },
					5:	{ name: '5', displayName: '105' },
					6:	{ name: '6', displayName: '106' },
					7:	{ name: '7', displayName: '107' },
					8:	{ name: '8', displayName: '108' },
					9:	{ name: '9', displayName: '109' },
					10:	{ name: '10', displayName: '110' },
					11:	{ name: '11', displayName: '111' },
				},
			},
			2: {
				name: 'Tầng 2',
				seats: {
					1:	{ name: '1', displayName: '201' },
					2:	{ name: '2', displayName: '202' },
					3:	{ name: '3', displayName: '203' },
					4:	{ name: '4', displayName: '204' },
					5:	{ name: '5', displayName: '205' },
					6:	{ name: '6', displayName: '206' },
				},
			},
			3: {
				name: 'Tầng 3',
				seats: {
					A:	{ name: 'A', displayName: '3A' },
					B:	{ name: 'B', displayName: '3B' },
					C:	{ name: 'C', displayName: '3C' },
					D:	{ name: 'D', displayName: '3D' },
					E:	{ name: 'E', displayName: '3E' },
					F:	{ name: 'F', displayName: '3F' },
				},
			},
		},
	},

	'pizza' : {
		name: 'PizzaTent',
		desc: 'Núi Trúc',
		image: 'http://retaildesignblog.net/wp-content/uploads/2014/04/Peppes-Pizza-restaurant-by-RISS-INTERIORARKITEKTER-Oslo-Norway.jpg',
		alias: 'Pizza Núi Trúc',
		initial: 'PNT',

		product : {
			items : {
				'pizza-hai-san': {
					name:   'Pizza Hải Sản',
					desc:   'Tôm, mực và ớt xanh',
					image:  'http://www.miasdailydish.com/wp-content/uploads/2015/10/cauliflower-seafood-pizza-4.jpg',
					price:	'80000',
					initial:	'HS',
				},
				'pizza-bo-dua': {
					name:   'Pizza Bò Dứa',
					desc:   'Thịt bò hầm với dứa (thơm)',
					image:  'http://www.antoniospizza.net/images/food_specpizzas/papasgoldenbbgv2.jpg',
					price:	'65000',
					initial:	'BD',
				},
				'pizza-vegan': {
					name:   'Pizza Vegan',
					desc:   'Pizza nấm rau quả cho người ăn chay.',
					image:  'http://mywholefoodskitchen.com/wp-content/uploads/2013/04/pizza2.jpg',
					price:	'70000',
					initial:	'PV',
				},
				'spaghetti-bo-ham': {
					name:   'Spaghetti Bò Hầm',
					desc:   'Thịt bò hầm với sốt cà chua.',
					image:  'http://vaobepnauan.com/wp-content/uploads/2014/07/cach-lam-my-y-ngon-5.jpg',
					price:	'55000',
					initial:	'SBH',
				},
				'spaghetti-bolognese': {
					name:   'Spaghetti Bolognese',
					desc:   'Bolognese.',
					image:  'https://scm-assets.constant.co/scm/unilever/a6798e909fa57bfd19c3e7f00737e5d6/d6ed4451-2c6b-4782-b19e-da7c6c558cc3.jpg',
					price:	'60000',
					initial:	'SB',
				},
			},

			categories : [{
				id: 'pizza',
				name: 'Pizza',
				items: ['pizza-hai-san', 'pizza-bo-dua', 'pizza-vegan'],
			},{
				id: 'spaghetti',
				name: 'Spaghetti',
				items: ['spaghetti-bo-ham', 'spaghetti-bolognese'],
			}],
		},

		delivery : {
			1: {
				name: 'Tầng 1',
				seats: {
					1:	{ name: '1', displayName: '101' },
					2: 	{ name: '2', displayName: '102' },
					3:	{ name: '3', displayName: '103' },
					4:	{ name: '4', displayName: '104' },
					5:	{ name: '5', displayName: '105' },
					6:	{ name: '6', displayName: '106' },
				},
			},
			2: {
				name: 'Tầng 2',
				seats: {
					1:	{ name: '1', displayName: '201' },
					2:	{ name: '2', displayName: '202' },
					3:	{ name: '3', displayName: '203' },
					4:	{ name: '4', displayName: '204' },
					5:	{ name: '5', displayName: '205' },
					6:	{ name: '6', displayName: '206' },
					4:	{ name: '7', displayName: '207' },
					5:	{ name: '8', displayName: '208' },
					6:	{ name: '9', displayName: '209' },
				},
			},
			3: {
				name: 'Tầng 3',
				seats: {
					A:	{ name: 'A', displayName: '3A' },
					B:	{ name: 'B', displayName: '3B' },
					C:	{ name: 'C', displayName: '3C' },
					D:	{ name: 'D', displayName: '3D' },
				},
			},
		},
	},
};

var _CUSTOMERS = {
	'bun' : {
		groups : {
			[generate_quick_guid()] : {
				tables: [
					{floor: 1, seat: 3},
					{floor: 1, seat: 4},
					{floor: 1, seat: 5},
				],
				orders: {
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 10,
						itemID: 'pho-ngan',
						request: 'nhiều tiết',
						quantity: 4,
					},
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 3,
						itemID: 'pho-bo',
						quantity: 3,
					},
				},
			},
			[generate_quick_guid()] : {
				tables: [
					{floor: 2, seat: 5},
					{floor: 2, seat: 6},
				],
				orders: {
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 9,
						itemID: 'pho-bo',
						request: 'ít bún',
					},
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 5,
						itemID: 'com-ga',
						quantity: 2,
					}
				},
			},
			[generate_quick_guid()] : {
				tables: [
					{floor: 3, seat: 'B'},
					{floor: 3, seat: 'D'},
				],
				orders: {
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 8,
						itemID: 'com-rang-dua-bo',
					}
				},
			},
			[generate_quick_guid()] : {
				tables: [
					{floor: 1, seat: 5},
					{floor: 1, seat: 6},
				],
				orders: {
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 2,
						itemID: 'com-ga',
						request: 'không sốt',
						quantity: 2,
					}
				},
			},
			[generate_quick_guid()] : {
				tables: [
					{floor: 1, seat: 1},
					{floor: 1, seat: 2},
					{floor: 1, seat: 5},
				],
				orders: {
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 13,
						itemID: 'com-ga',
					}
				},
			},
		},
		pendingMessages : [],
	},

	'pizza' : {
		groups : {
			[generate_quick_guid()] : {
				tables: [
					{floor: 1, seat: 3},
					{floor: 1, seat: 4},
					{floor: 1, seat: 5},
				],
				orders: {
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 10,
						itemID: 'pizza-bo-dua',
					},
				},
			},
			[generate_quick_guid()] : {
				tables: [
					{floor: 2, seat: 5},
					{floor: 2, seat: 6},
				],
				orders: {
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 9,
						itemID: 'pizza-hai-san',
						request: 'đế mỏng',
					},
					[generate_quick_guid()] : {
						created: (new Date).getTime() - 1000 * 60 * 3,
						itemID: 'spaghetti-bo-ham',
						request: 'nhiều ớt',
						quantity: 2,
					},
				},
			},
		},
		pendingMessages : [],
	},
};

var _ServiceID;
