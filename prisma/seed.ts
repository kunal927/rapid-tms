import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Common bcrypt hashes
// Password for all seed users: Admin@12345 / Ops@12345 / Driver@12345
const ADMIN_HASH = "$2b$10$O/WWK0ACjffeMB0Q2lWbjubxq6mufU12EzE.Mr//.z21.blgtfADq";
const OPS_HASH = "$2b$10$wm9vq16L.jKm58GCRCBzxunrhJpNVkG/j9Okasv/rCvWLIipkR/AK";
const DRIVER_HASH = "$2b$10$WKs/PPubFo6bi34TBwYBnOlJdLTgaaT2lkrEuycZe.ziFjDY7kmA6";

async function main() {
  console.log("🚛 Starting Complete Realistic Transport Fleet Seeding for MySQL...");

  const today = new Date();
  today.setHours(8, 0, 0, 0);

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayMidnight = new Date(todayMidnight);
  yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoMidnight = new Date(todayMidnight);
  twoDaysAgoMidnight.setDate(twoDaysAgoMidnight.getDate() - 2);

  // 1. SEED USERS
  console.log("1. Seeding Users...");
  const users = [
    {
      id: "usr_admin_01",
      email: "admin@rapone.com",
      phone: "+91 99000 11000",
      name: "Vikramaditya Singhania",
      passwordHash: ADMIN_HASH,
      role: "SUPER_ADMIN" as const,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_ops_01",
      email: "ops@rapone.com",
      phone: "+91 98111 22334",
      name: "Amitabh Verma (Transport Mgr)",
      passwordHash: OPS_HASH,
      role: "OPERATIONS_MANAGER" as const,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_drv_01",
      email: "driver@rapone.com",
      phone: "+91 98765 43210",
      name: "Rajesh Kumar Sharma",
      passwordHash: DRIVER_HASH,
      role: "DRIVER" as const,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_drv_02",
      email: "driver2@rapone.com",
      phone: "+91 98765 11223",
      name: "Vikram Pal Singh",
      passwordHash: DRIVER_HASH,
      role: "DRIVER" as const,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_drv_03",
      email: "driver3@rapone.com",
      phone: "+91 98101 55667",
      name: "Manoj Kumar Yadav",
      passwordHash: DRIVER_HASH,
      role: "DRIVER" as const,
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_drv_04",
      email: "driver4@rapone.com",
      phone: "+91 98912 33445",
      name: "Sonu Khan",
      passwordHash: DRIVER_HASH,
      role: "DRIVER" as const,
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_drv_05",
      email: "driver5@rapone.com",
      phone: "+91 97110 88990",
      name: "Deepak Verma",
      passwordHash: DRIVER_HASH,
      role: "DRIVER" as const,
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_drv_06",
      email: "driver6@rapone.com",
      phone: "+91 98711 44556",
      name: "Rakesh Gurjar",
      passwordHash: DRIVER_HASH,
      role: "DRIVER" as const,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_drv_07",
      email: "driver7@rapone.com",
      phone: "+91 99100 66778",
      name: "Surender Bhardwaj",
      passwordHash: DRIVER_HASH,
      role: "DRIVER" as const,
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "usr_drv_08",
      email: "driver8@rapone.com",
      phone: "+91 98188 22119",
      name: "Anil Rawat",
      passwordHash: DRIVER_HASH,
      role: "DRIVER" as const,
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        phone: u.phone,
        role: u.role,
        avatarUrl: u.avatarUrl,
      },
      create: {
        id: u.id,
        email: u.email,
        phone: u.phone,
        name: u.name,
        passwordHash: u.passwordHash,
        role: u.role,
        avatarUrl: u.avatarUrl,
        isActive: true,
      },
    });
  }

  // 2. SEED DRIVERS
  console.log("2. Seeding Drivers...");
  const drivers = [
    {
      id: "drv_01",
      userId: "usr_drv_01",
      driverCode: "DRV-101",
      licenseNumber: "DL-0420180099812",
      licenseExpiry: new Date("2029-05-15"),
      aadharNumber: "7845 1209 3321",
      panNumber: "ABCPS1234D",
      emergencyContact: "+91 98765 00001",
      currentAddress: "House 45, Govindpuri, Kalkaji, New Delhi 110019",
      status: "ON_TRIP" as const,
      perOrderRate: 45.0,
    },
    {
      id: "drv_02",
      userId: "usr_drv_02",
      driverCode: "DRV-102",
      licenseNumber: "UP-1420190045123",
      licenseExpiry: new Date("2028-11-20"),
      aadharNumber: "6512 8890 4412",
      panNumber: "BXYPS4512E",
      emergencyContact: "+91 98765 00002",
      currentAddress: "C-12, Sector 12, Noida 201301",
      status: "ON_TRIP" as const,
      perOrderRate: 50.0,
    },
    {
      id: "drv_03",
      userId: "usr_drv_03",
      driverCode: "DRV-103",
      licenseNumber: "HR-2620200088192",
      licenseExpiry: new Date("2030-01-10"),
      aadharNumber: "4521 9901 2234",
      panNumber: "CHYPS7812F",
      emergencyContact: "+91 98101 00003",
      currentAddress: "Vill. Sikanderpur, DLF Phase 1, Gurugram 122002",
      status: "ON_TRIP" as const,
      perOrderRate: 45.0,
    },
    {
      id: "drv_04",
      userId: "usr_drv_04",
      driverCode: "DRV-104",
      licenseNumber: "DL-0820210012456",
      licenseExpiry: new Date("2031-08-25"),
      aadharNumber: "3312 4455 6677",
      panNumber: "DKLPS9921G",
      emergencyContact: "+91 98912 00004",
      currentAddress: "Block D, Sangam Vihar, New Delhi 110080",
      status: "ACTIVE" as const,
      perOrderRate: 40.0,
    },
    {
      id: "drv_05",
      userId: "usr_drv_05",
      driverCode: "DRV-105",
      licenseNumber: "UP-1620170067891",
      licenseExpiry: new Date("2027-12-14"),
      aadharNumber: "9912 3344 5566",
      panNumber: "ELMPS3312H",
      emergencyContact: "+91 97110 00005",
      currentAddress: "B-88, Sector 22, Noida 201301",
      status: "ON_TRIP" as const,
      perOrderRate: 40.0,
    },
    {
      id: "drv_06",
      userId: "usr_drv_06",
      driverCode: "DRV-106",
      licenseNumber: "HR-5520190034567",
      licenseExpiry: new Date("2029-04-18"),
      aadharNumber: "7712 5566 8899",
      panNumber: "FNQPS6612J",
      emergencyContact: "+91 98711 00006",
      currentAddress: "Near Bus Stand, Old Faridabad 121002",
      status: "ACTIVE" as const,
      perOrderRate: 55.0,
    },
    {
      id: "drv_07",
      userId: "usr_drv_07",
      driverCode: "DRV-107",
      licenseNumber: "DL-0120160078901",
      licenseExpiry: new Date("2027-03-30"),
      aadharNumber: "8821 7712 9944",
      panNumber: "GPRPS8821K",
      emergencyContact: "+91 99100 00007",
      currentAddress: "House 210, Badarpur, New Delhi 110044",
      status: "ACTIVE" as const,
      perOrderRate: 60.0,
    },
    {
      id: "drv_08",
      userId: "usr_drv_08",
      driverCode: "DRV-108",
      licenseNumber: "UP-8520210023456",
      licenseExpiry: new Date("2031-10-05"),
      aadharNumber: "5512 6633 1122",
      panNumber: "HSTPS1144L",
      emergencyContact: "+91 98188 00008",
      currentAddress: "Rajendra Nagar Sector 3, Sahibabad, Ghaziabad 201005",
      status: "ACTIVE" as const,
      perOrderRate: 45.0,
    },
  ];

  for (const d of drivers) {
    await prisma.driver.upsert({
      where: { driverCode: d.driverCode },
      update: {
        licenseNumber: d.licenseNumber,
        perOrderRate: d.perOrderRate,
        status: d.status,
        licenseExpiry: d.licenseExpiry,
        aadharNumber: d.aadharNumber,
        panNumber: d.panNumber,
        emergencyContact: d.emergencyContact,
        currentAddress: d.currentAddress,
      },
      create: d,
    });
  }

  // 3. SEED VEHICLES
  console.log("3. Seeding Vehicles...");
  const vehicles = [
    {
      id: "veh_01",
      vehicleNumber: "DL-01-AB-1234",
      vehicleType: "Tata 407 LPT (14ft)",
      make: "Tata Motors",
      model: "407 SFC Turbo",
      year: 2022,
      capacityTons: 2.5,
      status: "ON_TRIP" as const,
      currentKm: 48250,
      insuranceExpiry: new Date("2027-03-31"),
      fitnessExpiry: new Date("2026-12-15"),
    },
    {
      id: "veh_02",
      vehicleNumber: "MH-04-XY-9876",
      vehicleType: "Eicher Pro 2049",
      make: "Eicher Motors",
      model: "Pro 2049 CNG",
      year: 2023,
      capacityTons: 3.5,
      status: "ON_TRIP" as const,
      currentKm: 32100,
      insuranceExpiry: new Date("2027-08-20"),
      fitnessExpiry: new Date("2027-01-10"),
    },
    {
      id: "veh_03",
      vehicleNumber: "HR-26-CD-4567",
      vehicleType: "Mahindra Bolero Maxi",
      make: "Mahindra & Mahindra",
      model: "Bolero Maxi Truck Plus",
      year: 2021,
      capacityTons: 1.3,
      status: "ON_TRIP" as const,
      currentKm: 62400,
      insuranceExpiry: new Date("2026-11-30"),
      fitnessExpiry: new Date("2026-10-25"),
    },
    {
      id: "veh_04",
      vehicleNumber: "UP-16-EF-7890",
      vehicleType: "Tata Ace Gold CNG",
      make: "Tata Motors",
      model: "Ace Gold Plus",
      year: 2023,
      capacityTons: 0.9,
      status: "AVAILABLE" as const,
      currentKm: 41800,
      insuranceExpiry: new Date("2027-04-15"),
      fitnessExpiry: new Date("2027-02-28"),
    },
    {
      id: "veh_05",
      vehicleNumber: "DL-1L-AA-5544",
      vehicleType: "Mahindra Supro Maxi Truck",
      make: "Mahindra & Mahindra",
      model: "Supro Maxi Diesel",
      year: 2022,
      capacityTons: 1.1,
      status: "AVAILABLE" as const,
      currentKm: 28900,
      insuranceExpiry: new Date("2026-10-18"),
      fitnessExpiry: new Date("2026-11-05"),
    },
    {
      id: "veh_06",
      vehicleNumber: "MH-12-PQ-2233",
      vehicleType: "Eicher Pro 3015 (19ft)",
      make: "Eicher Motors",
      model: "Pro 3015 L",
      year: 2021,
      capacityTons: 8.5,
      status: "AVAILABLE" as const,
      currentKm: 98400,
      insuranceExpiry: new Date("2026-12-31"),
      fitnessExpiry: new Date("2026-10-15"),
    },
    {
      id: "veh_07",
      vehicleNumber: "DL-1V-BB-9988",
      vehicleType: "BharatBenz 1015R",
      make: "BharatBenz",
      model: "1015R Plus",
      year: 2020,
      capacityTons: 6.0,
      status: "AVAILABLE" as const,
      currentKm: 114300,
      insuranceExpiry: new Date("2027-02-14"),
      fitnessExpiry: new Date("2026-12-05"),
    },
    {
      id: "veh_08",
      vehicleNumber: "DL-02-GH-3341",
      vehicleType: "Ashok Leyland Bada Dost",
      make: "Ashok Leyland",
      model: "Bada Dost i4",
      year: 2023,
      capacityTons: 1.8,
      status: "AVAILABLE" as const,
      currentKm: 36700,
      insuranceExpiry: new Date("2027-09-10"),
      fitnessExpiry: new Date("2027-08-25"),
    },
    {
      id: "veh_09",
      vehicleNumber: "HR-38-MN-9012",
      vehicleType: "Tata Ultra T.7",
      make: "Tata Motors",
      model: "Ultra T.7 Euro VI",
      year: 2022,
      capacityTons: 4.0,
      status: "AVAILABLE" as const,
      currentKm: 74200,
      insuranceExpiry: new Date("2027-01-20"),
      fitnessExpiry: new Date("2026-11-20"),
    },
    {
      id: "veh_10",
      vehicleNumber: "UP-85-KL-6677",
      vehicleType: "Mahindra Furio 7",
      make: "Mahindra & Mahindra",
      model: "Furio 7 Cargo",
      year: 2022,
      capacityTons: 4.2,
      status: "AVAILABLE" as const,
      currentKm: 53100,
      insuranceExpiry: new Date("2027-05-18"),
      fitnessExpiry: new Date("2027-03-12"),
    },
  ];

  for (const v of vehicles) {
    const { id, ...data } = v;
    await prisma.vehicle.upsert({
      where: { id },
      update: data,
      create: v,
    });
  }

  // 4. SEED DPD HUBS
  console.log("4. Seeding DPD Hubs...");
  const dpds = [
    {
      id: "dpd_01",
      code: "DPD-OKH",
      name: "Okhla Industrial Area Hub",
      city: "New Delhi",
      contactPerson: "Satish Chand",
      contactPhone: "+91 98110 44551",
      ratePerOrderDefault: 45.0,
      isActive: true,
    },
    {
      id: "dpd_02",
      code: "DPD-GGN",
      name: "Gurugram Logistics Center Sec-18",
      city: "Gurugram",
      contactPerson: "Harish Malik",
      contactPhone: "+91 98102 33442",
      ratePerOrderDefault: 50.0,
      isActive: true,
    },
    {
      id: "dpd_03",
      code: "DPD-NOI",
      name: "Noida Sector 63 Express Hub",
      city: "Noida",
      contactPerson: "Praveen Sharma",
      contactPhone: "+91 98188 77663",
      ratePerOrderDefault: 45.0,
      isActive: true,
    },
    {
      id: "dpd_04",
      code: "DPD-FBD",
      name: "Faridabad Industrial Hub Sec-24",
      city: "Faridabad",
      contactPerson: "Kavita Singh",
      contactPhone: "+91 97177 55449",
      ratePerOrderDefault: 40.0,
      isActive: true,
    },
    {
      id: "dpd_05",
      code: "DPD-GZB",
      name: "Ghaziabad Logistics Park",
      city: "Ghaziabad",
      contactPerson: "Vinay Tyagi",
      contactPhone: "+91 98991 22338",
      ratePerOrderDefault: 42.0,
      isActive: true,
    },
  ];

  for (const dpd of dpds) {
    const { id, ...data } = dpd;
    await prisma.dpd.upsert({
      where: { id },
      update: data,
      create: dpd,
    });
  }

  // 5. SEED TRIPS
  console.log("5. Seeding Trips...");
  const trips = [
    {
      id: "trip_01",
      tripNumber: "TRP-20260929-01",
      tripDate: today,
      vehicleId: "veh_01",
      driverId: "drv_01",
      dpdId: "dpd_01",
      totalOrders: 28,
      deliveredOrders: 20,
      failedOrders: 1,
      perOrderRate: 45.0,
      dpdAdvance: 5000.0,
      driverAdvance: 1500.0,
      status: "RUNNING" as const,
      startKm: 48200,
    },
    {
      id: "trip_02",
      tripNumber: "TRP-20260929-02",
      tripDate: today,
      vehicleId: "veh_02",
      driverId: "drv_02",
      dpdId: "dpd_02",
      totalOrders: 32,
      deliveredOrders: 24,
      failedOrders: 0,
      perOrderRate: 50.0,
      dpdAdvance: 6000.0,
      driverAdvance: 2000.0,
      status: "RUNNING" as const,
      startKm: 32050,
    },
    {
      id: "trip_03",
      tripNumber: "TRP-20260929-03",
      tripDate: today,
      vehicleId: "veh_03",
      driverId: "drv_03",
      dpdId: "dpd_03",
      totalOrders: 22,
      deliveredOrders: 16,
      failedOrders: 1,
      perOrderRate: 45.0,
      dpdAdvance: 4000.0,
      driverAdvance: 1000.0,
      status: "RUNNING" as const,
      startKm: 62350,
    },
    {
      id: "trip_04",
      tripNumber: "TRP-20260929-04",
      tripDate: today,
      vehicleId: "veh_05",
      driverId: "drv_05",
      dpdId: "dpd_01",
      totalOrders: 18,
      deliveredOrders: 18,
      failedOrders: 0,
      perOrderRate: 40.0,
      dpdAdvance: 3000.0,
      driverAdvance: 800.0,
      status: "COMPLETED" as const,
      startKm: 28850,
      endKm: 28900,
    },
    {
      id: "trip_05",
      tripNumber: "TRP-20260928-01",
      tripDate: yesterday,
      vehicleId: "veh_01",
      driverId: "drv_01",
      dpdId: "dpd_01",
      totalOrders: 35,
      deliveredOrders: 33,
      failedOrders: 2,
      perOrderRate: 45.0,
      dpdAdvance: 6000.0,
      driverAdvance: 1500.0,
      status: "COMPLETED" as const,
      startKm: 48050,
      endKm: 48200,
    },
    {
      id: "trip_06",
      tripNumber: "TRP-20260928-02",
      tripDate: yesterday,
      vehicleId: "veh_04",
      driverId: "drv_04",
      dpdId: "dpd_04",
      totalOrders: 30,
      deliveredOrders: 29,
      failedOrders: 1,
      perOrderRate: 40.0,
      dpdAdvance: 5000.0,
      driverAdvance: 1200.0,
      status: "COMPLETED" as const,
      startKm: 41650,
      endKm: 41800,
    },
    {
      id: "trip_07",
      tripNumber: "TRP-20260927-01",
      tripDate: twoDaysAgo,
      vehicleId: "veh_07",
      driverId: "drv_07",
      dpdId: "dpd_05",
      totalOrders: 40,
      deliveredOrders: 38,
      failedOrders: 2,
      perOrderRate: 60.0,
      dpdAdvance: 8000.0,
      driverAdvance: 2500.0,
      status: "COMPLETED" as const,
      startKm: 114100,
      endKm: 114300,
    },
  ];

  for (const t of trips) {
    const { id, ...data } = t;
    await prisma.trip.upsert({
      where: { id },
      update: data,
      create: t,
    });
  }

  // 6. SEED ORDERS
  console.log("6. Seeding Orders across all active and completed trips...");
  const orderList = [
    // Trip 1 orders (Okhla / South Delhi)
    {
      id: "ord_okh_1001",
      orderNumber: "ORD-OKH-1001",
      tripId: "trip_01",
      dpdId: "dpd_01",
      recipientName: "Amit Saxena",
      recipientPhone: "+91 98112 34567",
      deliveryAddress: "C-14, Ground Floor, Defence Colony",
      city: "New Delhi",
      pincode: "110024",
      codAmount: 1850.0,
      paymentType: "COD",
      status: "DELIVERED" as const,
    },
    {
      id: "ord_okh_1002",
      orderNumber: "ORD-OKH-1002",
      tripId: "trip_01",
      dpdId: "dpd_01",
      recipientName: "Priya Sharma",
      recipientPhone: "+91 98990 12345",
      deliveryAddress: "E-44, Greater Kailash Part 1",
      city: "New Delhi",
      pincode: "110048",
      codAmount: 0.0,
      paymentType: "PREPAID",
      status: "DELIVERED" as const,
    },
    {
      id: "ord_okh_1003",
      orderNumber: "ORD-OKH-1003",
      tripId: "trip_01",
      dpdId: "dpd_01",
      recipientName: "M/s Rahul Enterprises",
      recipientPhone: "+91 97115 67890",
      deliveryAddress: "Shed No. 8, Okhla Phase 2",
      city: "New Delhi",
      pincode: "110020",
      codAmount: 4500.0,
      paymentType: "COD",
      status: "DELIVERED" as const,
    },
    {
      id: "ord_okh_1004",
      orderNumber: "ORD-OKH-1004",
      tripId: "trip_01",
      dpdId: "dpd_01",
      recipientName: "Sanjay Singhal",
      recipientPhone: "+91 98101 99887",
      deliveryAddress: "Flat 402, DDA SFS Flats, Saket",
      city: "New Delhi",
      pincode: "110017",
      codAmount: 0.0,
      paymentType: "PREPAID",
      status: "OUT_FOR_DELIVERY" as const,
    },
    {
      id: "ord_okh_1005",
      orderNumber: "ORD-OKH-1005",
      tripId: "trip_01",
      dpdId: "dpd_01",
      recipientName: "Vandana Mehra",
      recipientPhone: "+91 98711 22334",
      deliveryAddress: "A-9, Hauz Khas Enclave",
      city: "New Delhi",
      pincode: "110016",
      codAmount: 920.0,
      paymentType: "COD",
      status: "PENDING" as const,
    },
    {
      id: "ord_okh_1006",
      orderNumber: "ORD-OKH-1006",
      tripId: "trip_01",
      dpdId: "dpd_01",
      recipientName: "Kunal Bansal",
      recipientPhone: "+91 99551 22334",
      deliveryAddress: "B-210, Chittaranjan Park",
      city: "New Delhi",
      pincode: "110019",
      codAmount: 1200.0,
      paymentType: "COD",
      status: "DELIVERED" as const,
    },
    {
      id: "ord_okh_1007",
      orderNumber: "ORD-OKH-1007",
      tripId: "trip_01",
      dpdId: "dpd_01",
      recipientName: "Rameshwar Dayal",
      recipientPhone: "+91 98110 99881",
      deliveryAddress: "Shop 12, Kalkaji Main Market",
      city: "New Delhi",
      pincode: "110019",
      codAmount: 3400.0,
      paymentType: "COD",
      status: "FAILED" as const,
    },

    // Trip 2 orders (Gurugram)
    {
      id: "ord_ggn_2001",
      orderNumber: "ORD-GGN-2001",
      tripId: "trip_02",
      dpdId: "dpd_02",
      recipientName: "Kavita Malhotra",
      recipientPhone: "+91 98114 55667",
      deliveryAddress: "Tower 4, Apt 801, DLF Phase 5",
      city: "Gurugram",
      pincode: "122009",
      codAmount: 3200.0,
      paymentType: "COD",
      status: "DELIVERED" as const,
    },
    {
      id: "ord_ggn_2002",
      orderNumber: "ORD-GGN-2002",
      tripId: "trip_02",
      dpdId: "dpd_02",
      recipientName: "Naveen Juneja",
      recipientPhone: "+91 98180 88776",
      deliveryAddress: "Plot 45, Udyog Vihar Phase 4",
      city: "Gurugram",
      pincode: "122015",
      codAmount: 0.0,
      paymentType: "PREPAID",
      status: "DELIVERED" as const,
    },
    {
      id: "ord_ggn_2003",
      orderNumber: "ORD-GGN-2003",
      tripId: "trip_02",
      dpdId: "dpd_02",
      recipientName: "Deepak Choudhary",
      recipientPhone: "+91 99102 33441",
      deliveryAddress: "House 122, Sector 14",
      city: "Gurugram",
      pincode: "122001",
      codAmount: 1450.0,
      paymentType: "COD",
      status: "OUT_FOR_DELIVERY" as const,
    },
    {
      id: "ord_ggn_2004",
      orderNumber: "ORD-GGN-2004",
      tripId: "trip_02",
      dpdId: "dpd_02",
      recipientName: "Ashish Tandon",
      recipientPhone: "+91 98103 44556",
      deliveryAddress: "Villa 18, Nirvana Country, Sector 50",
      city: "Gurugram",
      pincode: "122018",
      codAmount: 0.0,
      paymentType: "PREPAID",
      status: "DELIVERED" as const,
    },

    // Trip 3 orders (Noida)
    {
      id: "ord_noi_3001",
      orderNumber: "ORD-NOI-3001",
      tripId: "trip_03",
      dpdId: "dpd_03",
      recipientName: "Sunil Grover",
      recipientPhone: "+91 98105 11229",
      deliveryAddress: "C-22, Sector 62",
      city: "Noida",
      pincode: "201309",
      codAmount: 2100.0,
      paymentType: "COD",
      status: "DELIVERED" as const,
    },
    {
      id: "ord_noi_3002",
      orderNumber: "ORD-NOI-3002",
      tripId: "trip_03",
      dpdId: "dpd_03",
      recipientName: "Ritu Verma",
      recipientPhone: "+91 98733 44552",
      deliveryAddress: "B-501, Supertech Capetown, Sector 74",
      city: "Noida",
      pincode: "201301",
      codAmount: 0.0,
      paymentType: "PREPAID",
      status: "OUT_FOR_DELIVERY" as const,
    },
    {
      id: "ord_noi_3003",
      orderNumber: "ORD-NOI-3003",
      tripId: "trip_03",
      dpdId: "dpd_03",
      recipientName: "Vikas Aggarwal",
      recipientPhone: "+91 99118 77665",
      deliveryAddress: "Plot 88, Sector 63 Logistics Zone",
      city: "Noida",
      pincode: "201307",
      codAmount: 5600.0,
      paymentType: "COD",
      status: "DELIVERED" as const,
    },

    // Trip 4 orders (Okhla Morning Completed)
    {
      id: "ord_okh_4001",
      orderNumber: "ORD-OKH-4001",
      tripId: "trip_04",
      dpdId: "dpd_01",
      recipientName: "Gaurav Kapur",
      recipientPhone: "+91 98110 11445",
      deliveryAddress: "D-80, Lajpat Nagar 4",
      city: "New Delhi",
      pincode: "110024",
      codAmount: 1100.0,
      paymentType: "COD",
      status: "DELIVERED" as const,
    },
    {
      id: "ord_okh_4002",
      orderNumber: "ORD-OKH-4002",
      tripId: "trip_04",
      dpdId: "dpd_01",
      recipientName: "Meenakshi Sethi",
      recipientPhone: "+91 98991 33221",
      deliveryAddress: "Pocket A, Sarita Vihar",
      city: "New Delhi",
      pincode: "110076",
      codAmount: 0.0,
      paymentType: "PREPAID",
      status: "DELIVERED" as const,
    },

    // Trip 6 orders (Faridabad)
    {
      id: "ord_fbd_6001",
      orderNumber: "ORD-FBD-6001",
      tripId: "trip_06",
      dpdId: "dpd_04",
      recipientName: "Subhash Chand",
      recipientPhone: "+91 98108 55441",
      deliveryAddress: "Plot 19, Sector 24 Industrial Area",
      city: "Faridabad",
      pincode: "121005",
      codAmount: 4200.0,
      paymentType: "COD",
      status: "DELIVERED" as const,
    },
    {
      id: "ord_fbd_6002",
      orderNumber: "ORD-FBD-6002",
      tripId: "trip_06",
      dpdId: "dpd_04",
      recipientName: "Manish Mittal",
      recipientPhone: "+91 97180 22119",
      deliveryAddress: "House 344, Sector 15A",
      city: "Faridabad",
      pincode: "121007",
      codAmount: 0.0,
      paymentType: "PREPAID",
      status: "DELIVERED" as const,
    },
  ];

  for (const o of orderList) {
    const { id, ...data } = o;
    await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: data,
      create: o,
    });
  }

  // 7. SEED VEHICLE MAINTENANCE & REPAIRS
  console.log("7. Seeding Real Vehicle Maintenance & Breakdown Logs...");
  const maintenanceRecords = [
    {
      id: "maint_01",
      vehicleId: "veh_01",
      serviceDate: new Date("2026-09-18T10:30:00Z"),
      serviceType: "CLUTCH",
      cost: 8500,
      odometerReading: 47900,
      workshopName: "Sharma Auto Garage, Mahipalpur NH48",
      invoiceNumber: "INV-2026-891",
      description: "Clutch plate burnt and slipped during high-load transport on NH48. Replaced complete Valeo clutch disc, pressure plate, and release bearing.",
    },
    {
      id: "maint_02",
      vehicleId: "veh_01",
      serviceDate: new Date("2026-09-05T14:15:00Z"),
      serviceType: "TYRES",
      cost: 5200,
      odometerReading: 47200,
      workshopName: "MRF Tyres Plaza, Sector 14 Gurugram",
      invoiceNumber: "MRF-9921",
      description: "Front left tyre suffered sidewall puncture and deep cut from metal scrap. Replaced with new MRF Steel Muscle 7.00R16 radial tyre with laser wheel balancing.",
    },
    {
      id: "maint_03",
      vehicleId: "veh_01",
      serviceDate: new Date("2026-08-22T11:00:00Z"),
      serviceType: "BRAKES",
      cost: 3800,
      odometerReading: 45800,
      workshopName: "Delhi Fleet Care, Okhla Ph-1",
      invoiceNumber: "DFC-4412",
      description: "Front brake drum heating issue and worn-out brake shoes causing poor stopping distance. Replaced brake shoe linings and bled hydraulic master cylinder.",
    },
    {
      id: "maint_04",
      vehicleId: "veh_01",
      serviceDate: new Date("2026-08-10T16:45:00Z"),
      serviceType: "ENGINE",
      cost: 4500,
      odometerReading: 44900,
      workshopName: "Tata Authorized Service, Okhla Phase 2",
      invoiceNumber: "TATA-2026-551",
      description: "Engine oil leaking through sump gasket and heavy black smoke. Replaced oil filter, diesel primary filter, Castrol 15W40 engine oil (10 Litres) and sump gasket.",
    },
    {
      id: "maint_05",
      vehicleId: "veh_01",
      serviceDate: new Date("2026-07-28T09:30:00Z"),
      serviceType: "SUSPENSION",
      cost: 6200,
      odometerReading: 43600,
      workshopName: "Rawat Kamani Works, Badarpur Border",
      invoiceNumber: "RKW-1109",
      description: "Rear leaf spring (kamani patta) cracked due to overloading near Badarpur bypass. Replaced 3rd and 4th main leaf springs, bushes, and center pins.",
    },
    {
      id: "maint_06",
      vehicleId: "veh_01",
      serviceDate: new Date("2026-07-12T13:20:00Z"),
      serviceType: "ELECTRICAL",
      cost: 2950,
      odometerReading: 42800,
      workshopName: "Star Auto Electric, Okhla Ph-2",
      invoiceNumber: "SAE-8812",
      description: "Alternator not charging battery, vehicle stalled at toll plaza. Replaced Bosch alternator carbon brushes, regulator IC, and starter motor relay.",
    },
    {
      id: "maint_07",
      vehicleId: "veh_02",
      serviceDate: new Date("2026-09-14T11:00:00Z"),
      serviceType: "ENGINE",
      cost: 7200,
      odometerReading: 31800,
      workshopName: "Eicher Authorized Workshop, Gurugram Sec-37",
      invoiceNumber: "EICHER-2026-102",
      description: "Scheduled 30,000 km general service. Engine synthetic oil replaced, air intake filter changed, coolant flushed, CNG low-pressure filter cleaned.",
    },
    {
      id: "maint_08",
      vehicleId: "veh_02",
      serviceDate: new Date("2026-08-19T15:30:00Z"),
      serviceType: "BATTERY",
      cost: 6800,
      odometerReading: 30100,
      workshopName: "Exide Care, IFFCO Chowk Gurugram",
      invoiceNumber: "EXD-2026-904",
      description: "Battery dead after cold morning start failure. Installed brand new Exide Cargo Heavy Duty 12V 100Ah truck battery with 36-month warranty.",
    },
    {
      id: "maint_09",
      vehicleId: "veh_03",
      serviceDate: new Date("2026-09-20T10:00:00Z"),
      serviceType: "BRAKES",
      cost: 4200,
      odometerReading: 62100,
      workshopName: "Mahindra First Choice, Sector 63 Noida",
      invoiceNumber: "MFC-2026-781",
      description: "Rear brake cylinder leaking fluid, brake pedal sinking. Replaced both rear wheel cylinders, handbrake cable, and brake oil top-up.",
    },
    {
      id: "maint_10",
      vehicleId: "veh_06",
      serviceDate: new Date("2026-09-02T16:00:00Z"),
      serviceType: "CLUTCH",
      cost: 14500,
      odometerReading: 97800,
      workshopName: "National Highway Truck Care, Bhiwandi",
      invoiceNumber: "NHT-9014",
      description: "Heavy 19ft vehicle clutch breakdown. Replaced 380mm clutch assembly, booster cylinder, and flywheel resurfaced.",
    },
    {
      id: "maint_11",
      vehicleId: "veh_07",
      serviceDate: new Date("2026-08-30T12:00:00Z"),
      serviceType: "TYRES",
      cost: 18400,
      odometerReading: 113900,
      workshopName: "Apollo Tyres Hub, Ghaziabad GT Road",
      invoiceNumber: "APL-5521",
      description: "Replaced 2 rear drive axle tyres with Apollo EnduRace 8.25R16 commercial radials for long-haul durability.",
    },
  ];

  for (const m of maintenanceRecords) {
    const { id, ...data } = m;
    await prisma.vehicleMaintenance.upsert({
      where: { id },
      update: data,
      create: m,
    });
  }

  // 8. SEED DRIVER ADVANCES
  console.log("8. Seeding Driver Advances...");
  const advances = [
    {
      id: "adv_01",
      driverId: "drv_01",
      tripId: "trip_01",
      amount: 1500.0,
      requestDate: today,
      approvedDate: today,
      status: "APPROVED" as const,
      paymentMode: "CASH" as const,
      approvedById: "usr_admin_01",
      notes: "Trip route fuel & highway entry toll advance",
    },
    {
      id: "adv_02",
      driverId: "drv_02",
      tripId: "trip_02",
      amount: 2000.0,
      requestDate: today,
      approvedDate: today,
      status: "APPROVED" as const,
      paymentMode: "UPI" as const,
      approvedById: "usr_admin_01",
      notes: "Gurugram trip CNG refill & loading helper charge",
    },
    {
      id: "adv_03",
      driverId: "drv_03",
      tripId: "trip_03",
      amount: 1000.0,
      requestDate: today,
      approvedDate: today,
      status: "APPROVED" as const,
      paymentMode: "UPI" as const,
      approvedById: "usr_admin_01",
      notes: "Noida expressway trip transit allowance",
    },
    {
      id: "adv_04",
      driverId: "drv_07",
      tripId: "trip_07",
      amount: 2500.0,
      requestDate: twoDaysAgo,
      approvedDate: twoDaysAgo,
      status: "APPROVED" as const,
      paymentMode: "CASH" as const,
      approvedById: "usr_admin_01",
      notes: "Ghaziabad heavy truck route diesel allowance",
    },
  ];

  for (const a of advances) {
    const { id, ...data } = a;
    await prisma.driverAdvance.upsert({
      where: { id },
      update: data,
      create: a,
    });
  }

  // 9. SEED DRIVER PAYMENTS
  console.log("9. Seeding Driver Payments...");
  const payments = [
    {
      id: "pay_01",
      driverId: "drv_05",
      tripId: "trip_04",
      periodStart: yesterday,
      periodEnd: today,
      totalOrdersDelivered: 18,
      perOrderRate: 40.0,
      grossEarnings: 720.0,
      totalAdvanceDeducted: 200.0,
      totalExpensesReimbursed: 150.0,
      netPayment: 670.0,
      paymentStatus: "PAID" as const,
      paymentDate: today,
      transactionRef: "UPI-ICICI-99881122",
      notes: "Same-day settlement for completed morning trip",
    },
    {
      id: "pay_02",
      driverId: "drv_04",
      tripId: "trip_06",
      periodStart: twoDaysAgo,
      periodEnd: yesterday,
      totalOrdersDelivered: 29,
      perOrderRate: 40.0,
      grossEarnings: 1160.0,
      totalAdvanceDeducted: 300.0,
      totalExpensesReimbursed: 100.0,
      netPayment: 960.0,
      paymentStatus: "PAID" as const,
      paymentDate: today,
      transactionRef: "UPI-HDFC-44332211",
      notes: "Settled delivery payout",
    },
  ];

  for (const p of payments) {
    const { id, ...data } = p;
    await prisma.driverPayment.upsert({
      where: { id },
      update: data,
      create: p,
    });
  }

  // 10. SEED OPERATIONAL EXPENSES
  console.log("10. Seeding Operational Expenses...");
  const expenses = [
    {
      id: "exp_01",
      expenseNumber: "EXP-20260929-01",
      category: "TOLL_TAX",
      amount: 850.0,
      expenseDate: today,
      paymentMode: "UPI" as const,
      paidTo: "MCD Delhi Commercial Vehicle Entry Toll",
      status: "APPROVED" as const,
      notes: "Commercial green entry tax for Okhla border entry",
    },
    {
      id: "exp_02",
      expenseNumber: "EXP-20260929-02",
      category: "FUEL_DIESEL",
      amount: 3200.0,
      expenseDate: today,
      paymentMode: "UPI" as const,
      paidTo: "Indian Oil Petrol Pump, NH48",
      status: "APPROVED" as const,
      notes: "Bulk diesel refill for fleet vehicle veh_01",
    },
    {
      id: "exp_03",
      expenseNumber: "EXP-20260929-03",
      category: "HUB_SUPPLIES",
      amount: 450.0,
      expenseDate: today,
      paymentMode: "CASH" as const,
      paidTo: "Mahalaxmi Packaging, Sector 18",
      status: "APPROVED" as const,
      notes: "Thermal barcode label rolls and packaging stretch films",
    },
  ];

  for (const e of expenses) {
    const { id, ...data } = e;
    await prisma.expense.upsert({
      where: { id },
      update: data,
      create: e,
    });
  }

  // 11. SEED VEHICLE FUEL & CNG
  console.log("11. Seeding Vehicle Fuel & CNG Refills...");
  const fuels = [
    {
      id: "fuel_01",
      vehicleId: "veh_01",
      tripId: "trip_01",
      driverId: "drv_01",
      fuelDate: today,
      quantityLiters: 45.0,
      ratePerLiter: 89.5,
      totalAmount: 4027.5,
      fuelStation: "Indian Oil Auto Hub, NH48 Mahipalpur",
      odometerReading: 48200,
    },
    {
      id: "fuel_02",
      vehicleId: "veh_02",
      tripId: "trip_02",
      driverId: "drv_02",
      fuelDate: today,
      quantityLiters: 22.0,
      ratePerLiter: 79.0,
      totalAmount: 1738.0,
      fuelStation: "IGL CNG Station, Sector 29 Gurugram",
      odometerReading: 32050,
    },
    {
      id: "fuel_03",
      vehicleId: "veh_03",
      tripId: "trip_03",
      driverId: "drv_03",
      fuelDate: today,
      quantityLiters: 35.0,
      ratePerLiter: 89.5,
      totalAmount: 3132.5,
      fuelStation: "Bharat Petroleum, Noida Expressway Sec 105",
      odometerReading: 62350,
    },
    {
      id: "fuel_04",
      vehicleId: "veh_05",
      tripId: "trip_04",
      driverId: "drv_05",
      fuelDate: yesterday,
      quantityLiters: 25.0,
      ratePerLiter: 89.5,
      totalAmount: 2237.5,
      fuelStation: "HP Fuel Center, Okhla Ph-1",
      odometerReading: 28850,
    },
    {
      id: "fuel_05",
      vehicleId: "veh_04",
      tripId: "trip_06",
      driverId: "drv_04",
      fuelDate: yesterday,
      quantityLiters: 40.0,
      ratePerLiter: 89.5,
      totalAmount: 3580.0,
      fuelStation: "Indian Oil Station, Badarpur Border",
      odometerReading: 41650,
    },
  ];

  for (const f of fuels) {
    const { id, ...data } = f;
    await prisma.vehicleFuel.upsert({
      where: { id },
      update: data,
      create: f,
    });
  }

  // 12. SEED INWARD CLIENT PAYMENTS (CREDITS)
  console.log("12. Seeding Inward Client Payments (Credits)...");
  const creditPayments = [
    {
      id: "pay_in_01",
      paymentNumber: "PAY-IN-20260929-01",
      type: "CREDIT",
      amount: 45000.0,
      paymentDate: today,
      paymentMode: "BANK_TRANSFER" as const,
      referenceId: "NEFT-HDFC-9912048",
      status: "PAID" as const,
      notes: "DPD Okhla Weekly Logistics Billing Settlement",
    },
    {
      id: "pay_in_02",
      paymentNumber: "PAY-IN-20260929-02",
      type: "CREDIT",
      amount: 38500.0,
      paymentDate: today,
      paymentMode: "BANK_TRANSFER" as const,
      referenceId: "RTGS-ICICI-7744109",
      status: "PAID" as const,
      notes: "Gurugram Hub Delivery Inward Invoice Settlement",
    },
    {
      id: "pay_in_03",
      paymentNumber: "PAY-IN-20260928-01",
      type: "CREDIT",
      amount: 28000.0,
      paymentDate: yesterday,
      paymentMode: "UPI" as const,
      referenceId: "UPI-YES-5544123",
      status: "PAID" as const,
      notes: "Noida Sec-63 Courier Service Freight Settlement",
    },
  ];

  for (const cp of creditPayments) {
    const { id, ...data } = cp;
    await prisma.payment.upsert({
      where: { id },
      update: data,
      create: cp,
    });
  }

  // 13. SEED DRIVER DOCUMENTS
  console.log("13. Seeding Driver Official Documents...");
  const driverDocs = [
    {
      id: "doc_drv_01_dl",
      driverId: "drv_01",
      docType: "DRIVING_LICENSE",
      documentNumber: "DL-0420180099812",
      fileUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
      expiryDate: new Date("2029-05-15"),
      isVerified: true,
      notes: "Commercial Heavy Transport Endorsement Valid",
    },
    {
      id: "doc_drv_01_aadhaar",
      driverId: "drv_01",
      docType: "AADHAAR_CARD",
      documentNumber: "7845 1209 3321",
      fileUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
      isVerified: true,
      notes: "UIDAI e-KYC Verified",
    },
    {
      id: "doc_drv_02_dl",
      driverId: "drv_02",
      docType: "DRIVING_LICENSE",
      documentNumber: "UP-1420190045123",
      fileUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
      expiryDate: new Date("2028-11-20"),
      isVerified: true,
      notes: "Commercial Badge No: UP-14-BDG-8812",
    },
    {
      id: "doc_drv_03_dl",
      driverId: "drv_03",
      docType: "DRIVING_LICENSE",
      documentNumber: "HR-2620200088192",
      fileUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
      expiryDate: new Date("2030-01-10"),
      isVerified: true,
      notes: "Verified by Transport Authority",
    },
  ];

  for (const dd of driverDocs) {
    const { id, ...data } = dd;
    await prisma.driverDocument.upsert({
      where: { id },
      update: data,
      create: dd,
    });
  }

  // 14. SEED DRIVER ATTENDANCE
  console.log("14. Seeding Driver Attendance...");
  const attendanceList = [
    // Today (2026-09-29)
    {
      driverId: "drv_01",
      date: new Date("2026-09-29T00:00:00.000Z"),
      checkInTime: new Date("2026-09-29T07:45:00.000Z"),
      status: "PRESENT" as const,
      notes: "Dispatched on morning Okhla route",
    },
    {
      driverId: "drv_02",
      date: new Date("2026-09-29T00:00:00.000Z"),
      checkInTime: new Date("2026-09-29T08:05:00.000Z"),
      status: "PRESENT" as const,
      notes: "Dispatched on Gurugram route",
    },
    {
      driverId: "drv_03",
      date: new Date("2026-09-29T00:00:00.000Z"),
      checkInTime: new Date("2026-09-29T08:12:00.000Z"),
      status: "PRESENT" as const,
      notes: "Dispatched on Noida route",
    },
    {
      driverId: "drv_04",
      date: new Date("2026-09-29T00:00:00.000Z"),
      checkInTime: new Date("2026-09-29T08:30:00.000Z"),
      status: "PRESENT" as const,
      notes: "Standby driver at hub",
    },
    {
      driverId: "drv_05",
      date: new Date("2026-09-29T00:00:00.000Z"),
      checkInTime: new Date("2026-09-29T07:50:00.000Z"),
      checkOutTime: new Date("2026-09-29T14:00:00.000Z"),
      status: "PRESENT" as const,
      notes: "Morning delivery shift completed",
    },
    {
      driverId: "drv_06",
      date: new Date("2026-09-29T00:00:00.000Z"),
      checkInTime: new Date("2026-09-29T08:30:00.000Z"),
      checkOutTime: new Date("2026-09-29T13:00:00.000Z"),
      status: "HALF_DAY" as const,
      notes: "Left early for doctor appointment",
    },
    {
      driverId: "drv_07",
      date: new Date("2026-09-29T00:00:00.000Z"),
      status: "ON_LEAVE" as const,
      notes: "Approved casual leave",
    },
    {
      driverId: "drv_08",
      date: new Date("2026-09-29T00:00:00.000Z"),
      checkInTime: new Date("2026-09-29T08:25:00.000Z"),
      status: "PRESENT" as const,
      notes: "Vehicle maintenance duty",
    },

    // Yesterday (2026-09-28)
    {
      driverId: "drv_01",
      date: new Date("2026-09-28T00:00:00.000Z"),
      checkInTime: new Date("2026-09-28T08:00:00.000Z"),
      checkOutTime: new Date("2026-09-28T18:30:00.000Z"),
      status: "PRESENT" as const,
      notes: "Completed trip TRP-20260928-01",
    },
    {
      driverId: "drv_04",
      date: new Date("2026-09-28T00:00:00.000Z"),
      checkInTime: new Date("2026-09-28T08:10:00.000Z"),
      checkOutTime: new Date("2026-09-28T18:15:00.000Z"),
      status: "PRESENT" as const,
      notes: "Completed trip TRP-20260928-02",
    },
  ];

  for (const att of attendanceList) {
    const existing = await prisma.driverAttendance.findFirst({
      where: { driverId: att.driverId, date: att.date },
    });
    if (existing) {
      await prisma.driverAttendance.update({
        where: { id: existing.id },
        data: att,
      });
    } else {
      await prisma.driverAttendance.create({
        data: att,
      });
    }
  }

  // 15. SEED DRIVER EXPENSES
  console.log("15. Seeding Driver Road Expenses...");
  const driverExpenses = [
    {
      id: "drvexp_01",
      driverId: "drv_01",
      tripId: "trip_01",
      category: "TOLL",
      amount: 250.0,
      status: "APPROVED" as const,
      approvedById: "usr_admin_01",
      date: today,
      notes: "Commercial flyway entry toll paid in cash",
    },
    {
      id: "drvexp_02",
      driverId: "drv_02",
      tripId: "trip_02",
      category: "HELPER",
      amount: 300.0,
      status: "APPROVED" as const,
      approvedById: "usr_admin_01",
      date: today,
      notes: "Unloading labor at DLF corporate premises",
    },
    {
      id: "drvexp_03",
      driverId: "drv_03",
      tripId: "trip_03",
      category: "PUNCTURE",
      amount: 150.0,
      status: "APPROVED" as const,
      approvedById: "usr_admin_01",
      date: today,
      notes: "Rear tubeless tyre puncture repair at Noida Sector 62",
    },
  ];

  for (const de of driverExpenses) {
    const { id, ...data } = de;
    await prisma.driverExpense.upsert({
      where: { id },
      update: data,
      create: de,
    });
  }

  // 16. SEED DRIVER LEDGER ENTRIES
  console.log("16. Seeding Driver Financial Ledger Records...");
  const driverLedgers = [
    {
      id: "dled_01",
      driverId: "drv_01",
      transactionType: "CREDIT",
      amount: 1485.0,
      balanceAfter: 1485.0,
      referenceType: "TRIP_PAYOUT",
      referenceId: "trip_05",
      description: "Delivered 33 orders @ ₹45.00 on trip TRP-20260928-01",
      createdAt: yesterday,
    },
    {
      id: "dled_02",
      driverId: "drv_01",
      transactionType: "DEBIT",
      amount: 1500.0,
      balanceAfter: -15.0,
      referenceType: "TRIP_ADVANCE",
      referenceId: "adv_01",
      description: "Trip Advance issued for trip TRP-20260929-01",
      createdAt: today,
    },
    {
      id: "dled_03",
      driverId: "drv_04",
      transactionType: "CREDIT",
      amount: 1160.0,
      balanceAfter: 1160.0,
      referenceType: "TRIP_PAYOUT",
      referenceId: "trip_06",
      description: "Delivered 29 orders @ ₹40.00 on trip TRP-20260928-02",
      createdAt: yesterday,
    },
    {
      id: "dled_04",
      driverId: "drv_04",
      transactionType: "DEBIT",
      amount: 960.0,
      balanceAfter: 200.0,
      referenceType: "PAYOUT_SETTLEMENT",
      referenceId: "pay_02",
      description: "Net settlement paid via UPI (Ref: UPI-HDFC-44332211)",
      createdAt: today,
    },
    {
      id: "dled_05",
      driverId: "drv_05",
      transactionType: "CREDIT",
      amount: 720.0,
      balanceAfter: 720.0,
      referenceType: "TRIP_PAYOUT",
      referenceId: "trip_04",
      description: "Delivered 18 orders @ ₹40.00 on morning trip TRP-20260929-04",
      createdAt: today,
    },
    {
      id: "dled_06",
      driverId: "drv_05",
      transactionType: "DEBIT",
      amount: 670.0,
      balanceAfter: 50.0,
      referenceType: "PAYOUT_SETTLEMENT",
      referenceId: "pay_01",
      description: "Net payout settled via UPI (Ref: UPI-ICICI-99881122)",
      createdAt: today,
    },
  ];

  for (const dl of driverLedgers) {
    const { id, ...data } = dl;
    await prisma.driverLedger.upsert({
      where: { id },
      update: data,
      create: dl,
    });
  }

  // 17. SEED VEHICLE OFFICIAL DOCUMENTS
  console.log("17. Seeding Vehicle Official Documents...");
  const vehicleDocs = [
    {
      id: "vdoc_01_rc",
      vehicleId: "veh_01",
      docType: "REGISTRATION_CERTIFICATE",
      documentNumber: "DL-01-AB-1234-RC",
      fileUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
      expiryDate: new Date("2037-03-31"),
      isVerified: true,
    },
    {
      id: "vdoc_01_ins",
      vehicleId: "veh_01",
      docType: "INSURANCE",
      documentNumber: "ICICI-LOMBARD-COMM-9912048",
      fileUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
      expiryDate: new Date("2027-03-31"),
      isVerified: true,
    },
    {
      id: "vdoc_01_fit",
      vehicleId: "veh_01",
      docType: "FITNESS_CERTIFICATE",
      documentNumber: "DL-RTO-FIT-2024-5512",
      fileUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
      expiryDate: new Date("2026-12-15"),
      isVerified: true,
    },
    {
      id: "vdoc_02_rc",
      vehicleId: "veh_02",
      docType: "REGISTRATION_CERTIFICATE",
      documentNumber: "MH-04-XY-9876-RC",
      fileUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
      expiryDate: new Date("2038-08-20"),
      isVerified: true,
    },
  ];

  for (const vd of vehicleDocs) {
    const { id, ...data } = vd;
    await prisma.vehicleDocument.upsert({
      where: { id },
      update: data,
      create: vd,
    });
  }

  // 18. SEED VEHICLE EXPENSES (Fastag / Border / GPS)
  console.log("18. Seeding Vehicle Running Expenses...");
  const vehicleExpenses = [
    {
      id: "vehexp_01",
      vehicleId: "veh_01",
      tripId: "trip_01",
      expenseType: "FASTAG_RECHARGE",
      amount: 2000.0,
      expenseDate: today,
      description: "NHAI Commercial Fastag wallet auto-replenishment",
    },
    {
      id: "vehexp_02",
      vehicleId: "veh_02",
      tripId: "trip_02",
      expenseType: "FASTAG_RECHARGE",
      amount: 2500.0,
      expenseDate: today,
      description: "Delhi-Gurugram highway toll recharge",
    },
    {
      id: "vehexp_03",
      vehicleId: "veh_03",
      expenseType: "GPS_SUBSCRIPTION",
      amount: 2400.0,
      expenseDate: yesterday,
      description: "Annual AIS-140 GPS real-time fleet tracker telematics license renewal",
    },
  ];

  for (const ve of vehicleExpenses) {
    const { id, ...data } = ve;
    await prisma.vehicleExpense.upsert({
      where: { id },
      update: data,
      create: ve,
    });
  }

  // 19. SEED TRIP ASSIGNMENTS
  console.log("19. Seeding Trip Assignments...");
  const tripAssignments = [
    {
      id: "tasgn_01",
      tripId: "trip_01",
      driverId: "drv_01",
      vehicleId: "veh_01",
      assignedBy: "Amitabh Verma",
      notes: "Morning parcel distribution run - Okhla & South Delhi",
    },
    {
      id: "tasgn_02",
      tripId: "trip_02",
      driverId: "drv_02",
      vehicleId: "veh_02",
      assignedBy: "Amitabh Verma",
      notes: "Gurugram commercial delivery route",
    },
    {
      id: "tasgn_03",
      tripId: "trip_03",
      driverId: "drv_03",
      vehicleId: "veh_03",
      assignedBy: "Amitabh Verma",
      notes: "Noida Sector 62 & 63 tech park deliveries",
    },
  ];

  for (const ta of tripAssignments) {
    const { id, ...data } = ta;
    await prisma.tripAssignment.upsert({
      where: { id },
      update: data,
      create: ta,
    });
  }

  // 20. SEED TRIP EXPENSES
  console.log("20. Seeding Trip Expenses (Tolls & Cess)...");
  const tripExpenses = [
    {
      id: "texp_01",
      tripId: "trip_01",
      expenseType: "MCD_ENTRY_TOLL",
      amount: 850.0,
      paidBy: "DRIVER",
      isReimbursed: true,
      notes: "Commercial green entry tax at Delhi-Faridabad border",
    },
    {
      id: "texp_02",
      tripId: "trip_02",
      expenseType: "HIGHWAY_TOLL",
      amount: 260.0,
      paidBy: "FASTAG",
      isReimbursed: true,
      notes: "Kherki Daula Fastag toll debit",
    },
  ];

  for (const te of tripExpenses) {
    const { id, ...data } = te;
    await prisma.tripExpense.upsert({
      where: { id },
      update: data,
      create: te,
    });
  }

  // 21. SEED DELIVERIES (Completed PODs with signatures)
  console.log("21. Seeding Confirmed Deliveries & Proofs of Delivery (POD)...");
  const deliveries = [
    {
      id: "del_01",
      orderNumber: "ORD-OKH-1001",
      tripId: "trip_01",
      driverId: "drv_01",
      status: "DELIVERED" as const,
      deliveryTime: today,
      recipientName: "Amit Saxena",
      recipientPhone: "+91 98112 34567",
      signatureUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80",
      otpVerified: true,
      remarks: "Delivered to recipient in person. Cash ₹1850 received.",
    },
    {
      id: "del_02",
      orderNumber: "ORD-OKH-1002",
      tripId: "trip_01",
      driverId: "drv_01",
      status: "DELIVERED" as const,
      deliveryTime: today,
      recipientName: "Priya Sharma",
      recipientPhone: "+91 98990 12345",
      signatureUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80",
      otpVerified: true,
      remarks: "Delivered at doorstep. Prepaid shipment.",
    },
    {
      id: "del_03",
      orderNumber: "ORD-OKH-1003",
      tripId: "trip_01",
      driverId: "drv_01",
      status: "DELIVERED" as const,
      deliveryTime: today,
      recipientName: "Rahul Bansal (Store Mgr)",
      recipientPhone: "+91 97115 67890",
      signatureUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&auto=format&fit=crop&q=80",
      otpVerified: true,
      remarks: "Commercial carton delivered with company stamp. Cash ₹4500 collected.",
    },
    {
      id: "del_04",
      orderNumber: "ORD-GGN-2001",
      tripId: "trip_02",
      driverId: "drv_02",
      status: "DELIVERED" as const,
      deliveryTime: today,
      recipientName: "Kavita Malhotra",
      recipientPhone: "+91 98114 55667",
      otpVerified: true,
      remarks: "Handed over to security desk with resident confirmation. Cash ₹3200 paid.",
    },
    {
      id: "del_05",
      orderNumber: "ORD-NOI-3001",
      tripId: "trip_03",
      driverId: "drv_03",
      status: "DELIVERED" as const,
      deliveryTime: today,
      recipientName: "Sunil Grover",
      recipientPhone: "+91 98105 11229",
      otpVerified: true,
      remarks: "Delivered safely at office reception. Cash ₹2100 received.",
    },
  ];

  for (const del of deliveries) {
    const order = await prisma.order.findUnique({ where: { orderNumber: del.orderNumber } });
    if (!order) continue;
    const { orderNumber, id, ...data } = del;
    await prisma.delivery.upsert({
      where: { orderId: order.id },
      update: { ...data, orderId: order.id },
      create: { ...data, id, orderId: order.id },
    });
  }

  // 22. SEED DELIVERY ATTEMPTS
  console.log("22. Seeding Delivery Attempts...");
  const attempts = [
    {
      id: "att_01",
      orderNumber: "ORD-OKH-1007",
      driverId: "drv_01",
      attemptNumber: 1,
      attemptedAt: today,
      reason: "Shop shutter closed / premises locked",
      remarks: "Driver waited 10 mins. Called customer, requested morning delivery tomorrow.",
    },
  ];

  for (const a of attempts) {
    const order = await prisma.order.findUnique({ where: { orderNumber: a.orderNumber } });
    if (!order) continue;
    const { orderNumber, id, ...data } = a;
    await prisma.deliveryAttempt.upsert({
      where: { id },
      update: { ...data, orderId: order.id },
      create: { ...data, id, orderId: order.id },
    });
  }

  // 23. SEED MASTER ACCOUNTING TRANSACTIONS (DOUBLE-ENTRY COMPANY LEDGER)
  console.log("23. Seeding Master Accounting Transactions...");
  const transactions = [
    {
      id: "txn_001",
      transactionNumber: "TXN-20260929-001",
      type: "CREDIT",
      entityType: "DPD",
      entityId: "dpd_01",
      amount: 45000.0,
      balanceAfter: 45000.0,
      date: today,
      remarks: "DPD Okhla Weekly Logistics Billing Settlement (NEFT Ref: HDFC-9912048)",
    },
    {
      id: "txn_002",
      transactionNumber: "TXN-20260929-002",
      type: "CREDIT",
      entityType: "DPD",
      entityId: "dpd_02",
      amount: 38500.0,
      balanceAfter: 83500.0,
      date: today,
      remarks: "Gurugram Hub Inward Freight Remittance (RTGS Ref: ICICI-7744109)",
    },
    {
      id: "txn_003",
      transactionNumber: "TXN-20260929-003",
      type: "DEBIT",
      entityType: "VEHICLE",
      entityId: "veh_01",
      amount: 8500.0,
      balanceAfter: 75000.0,
      date: today,
      remarks: "Sharma Auto Garage: Replaced complete clutch plate assembly for DL-01-AB-1234",
    },
    {
      id: "txn_004",
      transactionNumber: "TXN-20260929-004",
      type: "DEBIT",
      entityType: "VEHICLE",
      entityId: "veh_01",
      amount: 4027.5,
      balanceAfter: 70972.5,
      date: today,
      remarks: "Indian Oil Pump NH48: 45 Litres Diesel refill for DL-01-AB-1234",
    },
    {
      id: "txn_005",
      transactionNumber: "TXN-20260929-005",
      type: "DEBIT",
      entityType: "DRIVER",
      entityId: "drv_01",
      amount: 1500.0,
      balanceAfter: 69472.5,
      date: today,
      remarks: "Trip Route Advance disbursed to Rajesh Kumar Sharma for TRP-20260929-01",
    },
    {
      id: "txn_006",
      transactionNumber: "TXN-20260929-006",
      type: "DEBIT",
      entityType: "DRIVER",
      entityId: "drv_02",
      amount: 2000.0,
      balanceAfter: 67472.5,
      date: today,
      remarks: "Trip Route Advance disbursed to Vikram Pal Singh for TRP-20260929-02",
    },
    {
      id: "txn_007",
      transactionNumber: "TXN-20260929-007",
      type: "DEBIT",
      entityType: "DRIVER",
      entityId: "drv_05",
      amount: 670.0,
      balanceAfter: 66802.5,
      date: today,
      remarks: "Same-day trip salary payout settled to Deepak Verma (UPI-ICICI-99881122)",
    },
  ];

  for (const tx of transactions) {
    const { id, ...data } = tx;
    await prisma.transaction.upsert({
      where: { transactionNumber: tx.transactionNumber },
      update: data,
      create: tx,
    });
  }

  // 24. SEED NOTIFICATIONS
  console.log("24. Seeding Notifications...");
  const notifications = [
    {
      id: "notif_01",
      userId: "usr_admin_01",
      title: "Clutch Repair Completed",
      message: "Sharma Auto Garage completed clutch plate replacement for DL-01-AB-1234. Invoice amount: ₹8,500.",
      type: "SUCCESS",
      link: "/admin/maintenance",
      isRead: false,
      createdAt: today,
    },
    {
      id: "notif_02",
      userId: "usr_admin_01",
      title: "Fitness Certificate Expiry Alert",
      message: "Vehicle HR-26-CD-4567 fitness certificate is expiring in 26 days (25-Oct-2026). Schedule inspection soon.",
      type: "WARNING",
      link: "/admin/vehicles/veh_03",
      isRead: false,
      createdAt: today,
    },
    {
      id: "notif_03",
      userId: "usr_admin_01",
      title: "Inward NEFT Credit: ₹45,000",
      message: "DPD Okhla Hub remitted weekly freight settlement of ₹45,000 to HDFC Bank account.",
      type: "SUCCESS",
      link: "/admin/ledger",
      isRead: true,
      createdAt: today,
    },
    {
      id: "notif_04",
      userId: "usr_ops_01",
      title: "Trips Dispatched",
      message: "3 active line-haul delivery trips (TRP-01, TRP-02, TRP-03) are currently running on route.",
      type: "INFO",
      link: "/operations/trips",
      isRead: false,
      createdAt: today,
    },
    {
      id: "notif_05",
      userId: "usr_drv_01",
      title: "Trip TRP-20260929-01 Assigned",
      message: "You have been assigned 28 orders for Okhla Industrial Area. Trip Advance ₹1,500 has been approved.",
      type: "INFO",
      link: "/driver/dashboard",
      isRead: true,
      createdAt: today,
    },
  ];

  for (const n of notifications) {
    const { id, ...data } = n;
    await prisma.notification.upsert({
      where: { id },
      update: data,
      create: n,
    });
  }

  // 25. SEED AUDIT LOGS
  console.log("25. Seeding System Audit Logs...");
  const auditLogs = [
    {
      id: "aud_01",
      userId: "usr_admin_01",
      action: "APPROVE_ADVANCE",
      entity: "DriverAdvance",
      entityId: "adv_01",
      oldValue: { status: "REQUESTED", amount: 1500 },
      newValue: { status: "APPROVED", amount: 1500, approvedBy: "Vikramaditya Singhania" },
      ipAddress: "192.168.1.100",
      createdAt: today,
    },
    {
      id: "aud_02",
      userId: "usr_ops_01",
      action: "DISPATCH_TRIP",
      entity: "Trip",
      entityId: "trip_01",
      oldValue: { status: "DRAFT" },
      newValue: { status: "RUNNING", vehicleId: "veh_01", driverId: "drv_01", startKm: 48200 },
      ipAddress: "192.168.1.102",
      createdAt: today,
    },
    {
      id: "aud_03",
      userId: "usr_admin_01",
      action: "LOG_MAINTENANCE",
      entity: "VehicleMaintenance",
      entityId: "maint_01",
      oldValue: {},
      newValue: { vehicleId: "veh_01", cost: 8500, serviceType: "CLUTCH", workshop: "Sharma Auto Garage" },
      ipAddress: "192.168.1.100",
      createdAt: yesterday,
    },
  ];

  for (const al of auditLogs) {
    const { id, ...data } = al;
    await prisma.auditLog.upsert({
      where: { id },
      update: data,
      create: al,
    });
  }

  // 26. SEED SYSTEM SETTINGS
  console.log("26. Seeding System Settings...");
  const settings = [
    { key: "company_name", value: "RapOne Express Logistics Pvt. Ltd.", group: "COMPANY", description: "Registered Company Name" },
    { key: "company_address", value: "Plot 42, Okhla Industrial Area Phase-III, New Delhi 110020", group: "COMPANY", description: "Headquarters Address" },
    { key: "company_phone", value: "+91 99000 11000", group: "COMPANY", description: "Primary Contact Number" },
    { key: "company_email", value: "operations@rapone.com", group: "COMPANY", description: "Primary Operations Email" },
    { key: "company_gst", value: "07AAACR1234F1Z8", group: "COMPANY", description: "Delhi GSTIN" },
    { key: "company_pan", value: "AAACR1234F", group: "COMPANY", description: "Income Tax PAN" },
    { key: "trip_number_prefix", value: "TRP", group: "TRIP", description: "Prefix for generated trip codes" },
    { key: "trip_auto_assign", value: "true", group: "TRIP", description: "Auto-assign vehicle on dispatch" },
    { key: "trip_max_orders", value: "60", group: "TRIP", description: "Max parcel capacity per route" },
    { key: "default_per_order_rate", value: "45", group: "PAYMENT", description: "Default driver delivery rate (₹)" },
    { key: "payment_cycle", value: "DAILY", group: "PAYMENT", description: "Driver payout frequency" },
    { key: "advance_limit_per_driver", value: "5000", group: "PAYMENT", description: "Maximum advance allowed per driver (₹)" },
    { key: "doc_expiry_warning_days", value: "30", group: "NOTIFICATION", description: "Days before document expiry to alert" },
    { key: "license_expiry_warning_days", value: "30", group: "NOTIFICATION", description: "Days before driver license expiry to alert" },
    { key: "notify_trip_completed", value: "true", group: "NOTIFICATION", description: "Push notification on trip completion" },
    { key: "notify_advance_requested", value: "true", group: "NOTIFICATION", description: "Push notification on driver advance request" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group, description: s.description },
      create: s,
    });
  }

  console.log("🎉 SUCCESS! 100% Complete, Realistic TMS Transport Fleet Database Seeded into MySQL!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
