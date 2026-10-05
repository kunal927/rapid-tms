export interface SeedUser {
  id: string;
  email: string;
  phone: string;
  name: string;
  passwordHash: string;
  role: "SUPER_ADMIN" | "OPERATIONS_MANAGER" | "DRIVER";
  driverId?: string;
  avatarUrl?: string;
}

export interface SeedDriver {
  id: string;
  userId: string;
  driverCode: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "ACTIVE" | "ON_TRIP" | "INACTIVE" | "SUSPENDED";
  perOrderRate: number;
  currentTripId?: string;
  assignedVehicleNumber?: string;
  advancesTotal: number;
  earningsTotal: number;
}

export interface SeedVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  capacityTons: number;
  status: "AVAILABLE" | "ON_TRIP" | "MAINTENANCE" | "INACTIVE";
  currentKm: number;
  insuranceExpiry: string;
  fitnessExpiry: string;
}

export interface SeedDpd {
  id: string;
  code: string;
  name: string;
  city: string;
  contactPerson: string;
  contactPhone: string;
  ratePerOrderDefault: number;
}

export interface SeedTrip {
  id: string;
  tripNumber: string;
  tripDate: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  dpdId: string;
  dpdName: string;
  totalOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  pendingOrders: number;
  perOrderRate: number;
  dpdAdvance: number;
  driverAdvance: number;
  driverPayment: number;
  status: "DRAFT" | "ASSIGNED" | "STARTED" | "RUNNING" | "COMPLETED" | "CANCELLED";
  startKm?: number;
  endKm?: number;
}

export interface SeedOrder {
  id: string;
  orderNumber: string;
  tripId: string;
  dpdId?: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  city: string;
  pincode: string;
  codAmount: number;
  paymentType: "PREPAID" | "COD";
  status: "PENDING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED" | "CANCELLED" | "RESCHEDULED";
  failureReason?: string;
  remarks?: string;
}

export interface SeedAuditLog {
  id: string;
  userId?: string;
  userName: string;
  role?: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipAddress?: string;
  details?: string | Record<string, unknown>;
}

// Bcrypt hashes:
// Admin@12345 / Driver@12345
const ADMIN_HASH = "$2b$10$O/WWK0ACjffeMB0Q2lWbjubxq6mufU12EzE.Mr//.z21.blgtfADq";
const OPS_HASH = "$2b$10$wm9vq16L.jKm58GCRCBzxunrhJpNVkG/j9Okasv/rCvWLIipkR/AK";
const DRIVER_HASH = "$2b$10$WKs/PPubFo6bi34TBwYBnOlJdLTgaaT2lkrEuycZe.ziFjDY7kmA6";

export const SEED_USERS: SeedUser[] = [
  {
    id: "usr_admin_01",
    email: "admin@rapone.com",
    phone: "+91 99000 11000",
    name: "Vikramaditya Singhania",
    passwordHash: ADMIN_HASH,
    role: "SUPER_ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_ops_01",
    email: "ops@rapone.com",
    phone: "+91 98111 22334",
    name: "Amitabh Verma (Transport Mgr)",
    passwordHash: OPS_HASH,
    role: "OPERATIONS_MANAGER",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_drv_01",
    email: "driver@rapone.com",
    phone: "+91 98765 43210",
    name: "Rajesh Kumar Sharma",
    passwordHash: DRIVER_HASH,
    role: "DRIVER",
    driverId: "drv_01",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_drv_02",
    email: "driver2@rapone.com",
    phone: "+91 98765 11223",
    name: "Vikram Pal Singh",
    passwordHash: DRIVER_HASH,
    role: "DRIVER",
    driverId: "drv_02",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_drv_03",
    email: "driver3@rapone.com",
    phone: "+91 98101 55667",
    name: "Manoj Kumar Yadav",
    passwordHash: DRIVER_HASH,
    role: "DRIVER",
    driverId: "drv_03",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_drv_04",
    email: "driver4@rapone.com",
    phone: "+91 98912 33445",
    name: "Sonu Khan",
    passwordHash: DRIVER_HASH,
    role: "DRIVER",
    driverId: "drv_04",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_drv_05",
    email: "driver5@rapone.com",
    phone: "+91 97110 88990",
    name: "Deepak Verma",
    passwordHash: DRIVER_HASH,
    role: "DRIVER",
    driverId: "drv_05",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_drv_06",
    email: "driver6@rapone.com",
    phone: "+91 98711 44556",
    name: "Rakesh Gurjar",
    passwordHash: DRIVER_HASH,
    role: "DRIVER",
    driverId: "drv_06",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_drv_07",
    email: "driver7@rapone.com",
    phone: "+91 99100 66778",
    name: "Surender Bhardwaj",
    passwordHash: DRIVER_HASH,
    role: "DRIVER",
    driverId: "drv_07",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "usr_drv_08",
    email: "driver8@rapone.com",
    phone: "+91 98188 22119",
    name: "Anil Rawat",
    passwordHash: DRIVER_HASH,
    role: "DRIVER",
    driverId: "drv_08",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
];

export const SEED_DRIVERS: SeedDriver[] = [
  {
    id: "drv_01",
    userId: "usr_drv_01",
    driverCode: "DRV-101",
    name: "Rajesh Kumar Sharma",
    phone: "+91 98765 43210",
    licenseNumber: "DL-0420180099812",
    licenseExpiry: "2029-05-15",
    status: "ON_TRIP",
    perOrderRate: 45.0,
    currentTripId: "trip_01",
    assignedVehicleNumber: "DL-01-AB-1234",
    advancesTotal: 1500,
    earningsTotal: 12450,
  },
  {
    id: "drv_02",
    userId: "usr_drv_02",
    driverCode: "DRV-102",
    name: "Vikram Pal Singh",
    phone: "+91 98765 11223",
    licenseNumber: "UP-1420190045123",
    licenseExpiry: "2028-11-20",
    status: "ON_TRIP",
    perOrderRate: 50.0,
    currentTripId: "trip_02",
    assignedVehicleNumber: "MH-04-XY-9876",
    advancesTotal: 2000,
    earningsTotal: 15800,
  },
  {
    id: "drv_03",
    userId: "usr_drv_03",
    driverCode: "DRV-103",
    name: "Manoj Kumar Yadav",
    phone: "+91 98101 55667",
    licenseNumber: "HR-2620200088192",
    licenseExpiry: "2030-01-10",
    status: "ON_TRIP",
    perOrderRate: 45.0,
    currentTripId: "trip_03",
    assignedVehicleNumber: "HR-26-CD-4567",
    advancesTotal: 1000,
    earningsTotal: 9600,
  },
  {
    id: "drv_04",
    userId: "usr_drv_04",
    driverCode: "DRV-104",
    name: "Sonu Khan",
    phone: "+91 98912 33445",
    licenseNumber: "DL-0820210012456",
    licenseExpiry: "2031-08-25",
    status: "ACTIVE",
    perOrderRate: 40.0,
    assignedVehicleNumber: "UP-16-EF-7890",
    advancesTotal: 1200,
    earningsTotal: 8400,
  },
  {
    id: "drv_05",
    userId: "usr_drv_05",
    driverCode: "DRV-105",
    name: "Deepak Verma",
    phone: "+91 97110 88990",
    licenseNumber: "UP-1620170067891",
    licenseExpiry: "2027-12-14",
    status: "ON_TRIP",
    perOrderRate: 40.0,
    currentTripId: "trip_04",
    assignedVehicleNumber: "DL-1L-AA-5544",
    advancesTotal: 800,
    earningsTotal: 6720,
  },
  {
    id: "drv_06",
    userId: "usr_drv_06",
    driverCode: "DRV-106",
    name: "Rakesh Gurjar",
    phone: "+91 98711 44556",
    licenseNumber: "HR-5520190034567",
    licenseExpiry: "2029-04-18",
    status: "ACTIVE",
    perOrderRate: 55.0,
    assignedVehicleNumber: "MH-12-PQ-2233",
    advancesTotal: 0,
    earningsTotal: 11200,
  },
  {
    id: "drv_07",
    userId: "usr_drv_07",
    driverCode: "DRV-107",
    name: "Surender Bhardwaj",
    phone: "+91 99100 66778",
    licenseNumber: "DL-0120160078901",
    licenseExpiry: "2027-03-30",
    status: "ACTIVE",
    perOrderRate: 60.0,
    assignedVehicleNumber: "DL-1V-BB-9988",
    advancesTotal: 2500,
    earningsTotal: 18500,
  },
  {
    id: "drv_08",
    userId: "usr_drv_08",
    driverCode: "DRV-108",
    name: "Anil Rawat",
    phone: "+91 98188 22119",
    licenseNumber: "UP-8520210023456",
    licenseExpiry: "2031-10-05",
    status: "ACTIVE",
    perOrderRate: 45.0,
    assignedVehicleNumber: "DL-02-GH-3341",
    advancesTotal: 500,
    earningsTotal: 7800,
  },
];

export const SEED_VEHICLES: SeedVehicle[] = [
  {
    id: "veh_01",
    vehicleNumber: "DL-01-AB-1234",
    vehicleType: "Tata 407 LPT (14ft)",
    make: "Tata Motors",
    model: "407 SFC Turbo",
    year: 2022,
    capacityTons: 2.5,
    status: "ON_TRIP",
    currentKm: 48250,
    insuranceExpiry: "2027-03-31",
    fitnessExpiry: "2026-12-15",
  },
  {
    id: "veh_02",
    vehicleNumber: "MH-04-XY-9876",
    vehicleType: "Eicher Pro 2049",
    make: "Eicher Motors",
    model: "Pro 2049 CNG",
    year: 2023,
    capacityTons: 3.5,
    status: "ON_TRIP",
    currentKm: 32100,
    insuranceExpiry: "2027-08-20",
    fitnessExpiry: "2027-01-10",
  },
  {
    id: "veh_03",
    vehicleNumber: "HR-26-CD-4567",
    vehicleType: "Mahindra Bolero Maxi",
    make: "Mahindra & Mahindra",
    model: "Bolero Maxi Truck Plus",
    year: 2021,
    capacityTons: 1.3,
    status: "ON_TRIP",
    currentKm: 62400,
    insuranceExpiry: "2026-11-30",
    fitnessExpiry: "2026-10-25",
  },
  {
    id: "veh_04",
    vehicleNumber: "UP-16-EF-7890",
    vehicleType: "Tata Ace Gold CNG",
    make: "Tata Motors",
    model: "Ace Gold Plus",
    year: 2023,
    capacityTons: 0.9,
    status: "AVAILABLE",
    currentKm: 41800,
    insuranceExpiry: "2027-04-15",
    fitnessExpiry: "2027-02-28",
  },
  {
    id: "veh_05",
    vehicleNumber: "DL-1L-AA-5544",
    vehicleType: "Mahindra Supro Maxi Truck",
    make: "Mahindra & Mahindra",
    model: "Supro Maxi Diesel",
    year: 2022,
    capacityTons: 1.1,
    status: "AVAILABLE",
    currentKm: 28900,
    insuranceExpiry: "2026-10-18",
    fitnessExpiry: "2026-11-05",
  },
  {
    id: "veh_06",
    vehicleNumber: "MH-12-PQ-2233",
    vehicleType: "Eicher Pro 3015 (19ft)",
    make: "Eicher Motors",
    model: "Pro 3015 L",
    year: 2021,
    capacityTons: 8.5,
    status: "AVAILABLE",
    currentKm: 98400,
    insuranceExpiry: "2026-12-31",
    fitnessExpiry: "2026-10-15",
  },
  {
    id: "veh_07",
    vehicleNumber: "DL-1V-BB-9988",
    vehicleType: "BharatBenz 1015R",
    make: "BharatBenz",
    model: "1015R Plus",
    year: 2020,
    capacityTons: 6.0,
    status: "AVAILABLE",
    currentKm: 114300,
    insuranceExpiry: "2027-02-14",
    fitnessExpiry: "2026-12-05",
  },
  {
    id: "veh_08",
    vehicleNumber: "DL-02-GH-3341",
    vehicleType: "Ashok Leyland Bada Dost",
    make: "Ashok Leyland",
    model: "Bada Dost i4",
    year: 2023,
    capacityTons: 1.8,
    status: "AVAILABLE",
    currentKm: 36700,
    insuranceExpiry: "2027-09-10",
    fitnessExpiry: "2027-08-25",
  },
  {
    id: "veh_09",
    vehicleNumber: "HR-38-MN-9012",
    vehicleType: "Tata Ultra T.7",
    make: "Tata Motors",
    model: "Ultra T.7 Euro VI",
    year: 2022,
    capacityTons: 4.0,
    status: "AVAILABLE",
    currentKm: 74200,
    insuranceExpiry: "2027-01-20",
    fitnessExpiry: "2026-11-20",
  },
  {
    id: "veh_10",
    vehicleNumber: "UP-85-KL-6677",
    vehicleType: "Mahindra Furio 7",
    make: "Mahindra & Mahindra",
    model: "Furio 7 Cargo",
    year: 2022,
    capacityTons: 4.2,
    status: "AVAILABLE",
    currentKm: 53100,
    insuranceExpiry: "2027-05-18",
    fitnessExpiry: "2027-03-12",
  },
];

export const SEED_DPDS: SeedDpd[] = [
  {
    id: "dpd_01",
    code: "DPD-OKH",
    name: "Okhla Industrial Area Hub",
    city: "New Delhi",
    contactPerson: "Satish Chand",
    contactPhone: "+91 98110 44551",
    ratePerOrderDefault: 45.0,
  },
  {
    id: "dpd_02",
    code: "DPD-GGN",
    name: "Gurugram Logistics Center Sec-18",
    city: "Gurugram",
    contactPerson: "Harish Malik",
    contactPhone: "+91 98102 33442",
    ratePerOrderDefault: 50.0,
  },
  {
    id: "dpd_03",
    code: "DPD-NOI",
    name: "Noida Sector 63 Express Hub",
    city: "Noida",
    contactPerson: "Praveen Sharma",
    contactPhone: "+91 98188 77663",
    ratePerOrderDefault: 45.0,
  },
  {
    id: "dpd_04",
    code: "DPD-FBD",
    name: "Faridabad Industrial Hub Sec-24",
    city: "Faridabad",
    contactPerson: "Kavita Singh",
    contactPhone: "+91 97177 55449",
    ratePerOrderDefault: 40.0,
  },
  {
    id: "dpd_05",
    code: "DPD-GZB",
    name: "Ghaziabad Logistics Park",
    city: "Ghaziabad",
    contactPerson: "Vinay Tyagi",
    contactPhone: "+91 98991 22338",
    ratePerOrderDefault: 42.0,
  },
];

export const SEED_TRIPS: SeedTrip[] = [
  {
    id: "trip_01",
    tripNumber: "TRP-20260929-01",
    tripDate: "2026-09-29",
    vehicleId: "veh_01",
    vehicleNumber: "DL-01-AB-1234",
    driverId: "drv_01",
    driverName: "Rajesh Kumar Sharma",
    dpdId: "dpd_01",
    dpdName: "Okhla Industrial Area Hub",
    totalOrders: 28,
    deliveredOrders: 20,
    failedOrders: 1,
    pendingOrders: 7,
    perOrderRate: 45.0,
    dpdAdvance: 5000.0,
    driverAdvance: 1500.0,
    driverPayment: 900.0,
    status: "RUNNING",
    startKm: 48200,
  },
  {
    id: "trip_02",
    tripNumber: "TRP-20260929-02",
    tripDate: "2026-09-29",
    vehicleId: "veh_02",
    vehicleNumber: "MH-04-XY-9876",
    driverId: "drv_02",
    driverName: "Vikram Pal Singh",
    dpdId: "dpd_02",
    dpdName: "Gurugram Logistics Center Sec-18",
    totalOrders: 32,
    deliveredOrders: 24,
    failedOrders: 0,
    pendingOrders: 8,
    perOrderRate: 50.0,
    dpdAdvance: 6000.0,
    driverAdvance: 2000.0,
    driverPayment: 1200.0,
    status: "RUNNING",
    startKm: 32050,
  },
  {
    id: "trip_03",
    tripNumber: "TRP-20260929-03",
    tripDate: "2026-09-29",
    vehicleId: "veh_03",
    vehicleNumber: "HR-26-CD-4567",
    driverId: "drv_03",
    driverName: "Manoj Kumar Yadav",
    dpdId: "dpd_03",
    dpdName: "Noida Sector 63 Express Hub",
    totalOrders: 22,
    deliveredOrders: 16,
    failedOrders: 1,
    pendingOrders: 5,
    perOrderRate: 45.0,
    dpdAdvance: 4000.0,
    driverAdvance: 1000.0,
    driverPayment: 720.0,
    status: "RUNNING",
    startKm: 62350,
  },
  {
    id: "trip_04",
    tripNumber: "TRP-20260929-04",
    tripDate: "2026-09-29",
    vehicleId: "veh_05",
    vehicleNumber: "DL-1L-AA-5544",
    driverId: "drv_05",
    driverName: "Deepak Verma",
    dpdId: "dpd_01",
    dpdName: "Okhla Industrial Area Hub",
    totalOrders: 18,
    deliveredOrders: 18,
    failedOrders: 0,
    pendingOrders: 0,
    perOrderRate: 40.0,
    dpdAdvance: 3000.0,
    driverAdvance: 800.0,
    driverPayment: 720.0,
    status: "COMPLETED",
    startKm: 28850,
    endKm: 28900,
  },
  {
    id: "trip_05",
    tripNumber: "TRP-20260928-01",
    tripDate: "2026-09-28",
    vehicleId: "veh_01",
    vehicleNumber: "DL-01-AB-1234",
    driverId: "drv_01",
    driverName: "Rajesh Kumar Sharma",
    dpdId: "dpd_01",
    dpdName: "Okhla Industrial Area Hub",
    totalOrders: 35,
    deliveredOrders: 33,
    failedOrders: 2,
    pendingOrders: 0,
    perOrderRate: 45.0,
    dpdAdvance: 6000.0,
    driverAdvance: 1500.0,
    driverPayment: 1485.0,
    status: "COMPLETED",
    startKm: 48050,
    endKm: 48200,
  },
  {
    id: "trip_06",
    tripNumber: "TRP-20260928-02",
    tripDate: "2026-09-28",
    vehicleId: "veh_04",
    vehicleNumber: "UP-16-EF-7890",
    driverId: "drv_04",
    driverName: "Sonu Khan",
    dpdId: "dpd_04",
    dpdName: "Faridabad Industrial Hub Sec-24",
    totalOrders: 30,
    deliveredOrders: 29,
    failedOrders: 1,
    pendingOrders: 0,
    perOrderRate: 40.0,
    dpdAdvance: 5000.0,
    driverAdvance: 1200.0,
    driverPayment: 1160.0,
    status: "COMPLETED",
    startKm: 41650,
    endKm: 41800,
  },
  {
    id: "trip_07",
    tripNumber: "TRP-20260927-01",
    tripDate: "2026-09-27",
    vehicleId: "veh_07",
    vehicleNumber: "DL-1V-BB-9988",
    driverId: "drv_07",
    driverName: "Surender Bhardwaj",
    dpdId: "dpd_05",
    dpdName: "Ghaziabad Logistics Park",
    totalOrders: 40,
    deliveredOrders: 38,
    failedOrders: 2,
    pendingOrders: 0,
    perOrderRate: 60.0,
    dpdAdvance: 8000.0,
    driverAdvance: 2500.0,
    driverPayment: 2280.0,
    status: "COMPLETED",
    startKm: 114100,
    endKm: 114300,
  },
];

export const SEED_ORDERS: SeedOrder[] = [
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
    status: "DELIVERED",
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
    status: "DELIVERED",
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
    status: "DELIVERED",
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
    status: "OUT_FOR_DELIVERY",
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
    status: "PENDING",
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
    status: "DELIVERED",
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
    status: "FAILED",
    failureReason: "Shop was locked during evening delivery attempt",
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
    status: "DELIVERED",
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
    status: "DELIVERED",
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
    status: "OUT_FOR_DELIVERY",
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
    status: "DELIVERED",
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
    status: "DELIVERED",
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
    status: "OUT_FOR_DELIVERY",
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
    status: "DELIVERED",
  },
];

export const SEED_AUDIT_LOGS: SeedAuditLog[] = [
  {
    id: "aud_01",
    userId: "usr_admin_01",
    userName: "Vikramaditya Singhania",
    action: "APPROVE_ADVANCE",
    entity: "DriverAdvance",
    entityId: "adv_01",
    timestamp: "2026-09-29T08:30:00Z",
    ipAddress: "192.168.1.100",
  },
  {
    id: "aud_02",
    userId: "usr_ops_01",
    userName: "Amitabh Verma",
    action: "DISPATCH_TRIP",
    entity: "Trip",
    entityId: "trip_01",
    timestamp: "2026-09-29T08:15:00Z",
    ipAddress: "192.168.1.102",
  },
  {
    id: "aud_03",
    userId: "usr_admin_01",
    userName: "Vikramaditya Singhania",
    action: "RECORD_MAINTENANCE",
    entity: "VehicleMaintenance",
    entityId: "maint_01",
    timestamp: "2026-09-18T11:00:00Z",
    ipAddress: "192.168.1.100",
  },
  {
    id: "aud_04",
    userId: "usr_admin_01",
    userName: "Vikramaditya Singhania",
    action: "RECORD_FUEL_PURCHASE",
    entity: "VehicleFuel",
    entityId: "fuel_01",
    timestamp: "2026-09-29T07:45:00Z",
    ipAddress: "192.168.1.100",
  },
];
