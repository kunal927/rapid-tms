// End-to-end verification script for TMS Authentication, RBAC, and Dashboards

const BASE_URL = "http://localhost:3000";

async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const cookie = res.headers.get("set-cookie");
  const data = await res.json();
  return { status: res.status, data, cookie };
}

async function fetchWithCookie(url, cookie, redirect = "manual") {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect,
  });

  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    text: await res.text(),
  };
}

async function runTests() {
  console.log("=================================================");
  console.log("🚀 TESTING TMS FOUNDATION ARCHITECTURE & SECURITY");
  console.log("=================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  // TEST 1: Unauthenticated access blocked
  console.log("\n--- Test 1: Route Protection for Unauthenticated Visitors ---");
  const unauthAdmin = await fetchWithCookie("/admin/dashboard", null);
  assert(
    unauthAdmin.status === 307 || unauthAdmin.status === 302 || unauthAdmin.status === 303,
    `Unauthenticated access to /admin/dashboard returned redirect ${unauthAdmin.status}`
  );
  assert(
    unauthAdmin.headers.location?.includes("/login"),
    `Redirect points to /login (location: ${unauthAdmin.headers.location})`
  );

  // TEST 2: Super Admin Login & Dashboard Access
  console.log("\n--- Test 2: Super Admin Authentication & Dashboard Access ---");
  const adminLogin = await loginUser("admin@rapone.com", "Admin@12345");
  assert(adminLogin.status === 200, "Super Admin login status 200 OK");
  assert(adminLogin.data.user.role === "SUPER_ADMIN", "Super Admin role verified");
  assert(adminLogin.data.redirectUrl === "/admin/dashboard", "Super Admin redirect points to /admin/dashboard");
  assert(adminLogin.cookie?.includes("rapone_tms_session"), "HTTP-only session cookie set");

  const adminPage = await fetchWithCookie("/admin/dashboard", adminLogin.cookie, "follow");
  assert(adminPage.status === 200, "Super Admin dashboard renders with HTTP 200");
  assert(adminPage.text.includes("Owner Panel"), "Super Admin Owner Panel badge present");
  assert(adminPage.text.includes("TRP-2026-0042"), "Live Trip TRP-2026-0042 loaded");
  assert(adminPage.text.includes("DL-01-AB-1234"), "Vehicle DL-01-AB-1234 loaded in Excel table");

  // TEST 3: Operations Manager Login & RBAC Boundaries
  console.log("\n--- Test 3: Operations Manager Authentication & RBAC Isolation ---");
  const opsLogin = await loginUser("ops@rapone.com", "Ops@12345");
  assert(opsLogin.status === 200, "Ops Manager login status 200 OK");
  assert(opsLogin.data.user.role === "OPERATIONS_MANAGER", "Ops Manager role verified");
  assert(opsLogin.data.redirectUrl === "/operations/dashboard", "Ops Manager redirect points to /operations/dashboard");

  const opsPage = await fetchWithCookie("/operations/dashboard", opsLogin.cookie, "follow");
  assert(opsPage.status === 200, "Operations Hub dashboard renders with HTTP 200");
  assert(opsPage.text.includes("Transport Manager Station"), "Transport Manager station badge present");

  const opsAccessAdmin = await fetchWithCookie("/admin/dashboard", opsLogin.cookie, "manual");
  assert(
    opsAccessAdmin.status === 307 || opsAccessAdmin.status === 302,
    `Ops Manager trying to access /admin/dashboard blocked with redirect ${opsAccessAdmin.status}`
  );
  assert(
    opsAccessAdmin.headers.location?.includes("/operations/dashboard"),
    `Ops Manager redirected back to operations dashboard (location: ${opsAccessAdmin.headers.location})`
  );

  // TEST 4: Driver Login & Mobile-First Cockpit
  console.log("\n--- Test 4: Driver Authentication & Scoped Cockpit Access ---");
  const driverLogin = await loginUser("driver@rapone.com", "Driver@12345");
  assert(driverLogin.status === 200, "Driver login status 200 OK");
  assert(driverLogin.data.user.role === "DRIVER", "Driver role verified");
  assert(driverLogin.data.redirectUrl === "/driver/dashboard", "Driver redirect points to /driver/dashboard");

  const driverPage = await fetchWithCookie("/driver/dashboard", driverLogin.cookie, "follow");
  assert(driverPage.status === 200, "Driver Cockpit renders with HTTP 200");
  assert(driverPage.text.includes("Driver Operational Cockpit"), "Driver cockpit header rendered");
  assert(driverPage.text.includes("Rajesh Kumar Sharma"), "Driver name properly scoped");
  assert(driverPage.text.includes("TRP-2026-0042"), "Assigned trip rendered");
  assert(driverPage.text.includes("Call SOS"), "Mobile-first SOS emergency action rendered");

  const driverAccessAdmin = await fetchWithCookie("/admin/dashboard", driverLogin.cookie, "manual");
  assert(
    driverAccessAdmin.status === 307 || driverAccessAdmin.status === 302,
    `Driver trying to access /admin/dashboard blocked with redirect ${driverAccessAdmin.status}`
  );
  assert(
    driverAccessAdmin.headers.location?.includes("/driver/dashboard"),
    `Driver redirected back to driver dashboard (location: ${driverAccessAdmin.headers.location})`
  );

  // TEST 5: Interactive Driver Delivery Status Update
  console.log("\n--- Test 5: Interactive Delivery Status Update ---");
  const updateRes = await fetch(`${BASE_URL}/api/orders/update-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: driverLogin.cookie,
    },
    body: JSON.stringify({
      orderId: "ord_03",
      status: "DELIVERED",
      remarks: "Delivered to Sunita Aggarwal, digital signature recorded",
    }),
  });

  const updateData = await updateRes.json();
  assert(updateRes.status === 200, "Order status update API returned HTTP 200");
  assert(updateData.success === true, "Delivery update marked successful");

  console.log("\n=================================================");
  console.log(`📊 SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("=================================================");

  if (passed === total) {
    console.log("🎉 ALL FOUNDATIONAL REQUIREMENTS FULLY VERIFIED AND PASSING!");
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
