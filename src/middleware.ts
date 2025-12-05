import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const user = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // 🔹 ไม่ได้ล็อกอิน → redirect ไป signin
  if (!user && pathname !== "/signin") {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // 🔹 ถ้าเป็น user ครั้งแรกและไม่ใช่ role 7 → ให้เปลี่ยนรหัสผ่านก่อน
  if (user && user.role !== 7 && user.is_first_login) {
    const now = new Date();
    const skipUntil = user.skip_password_change ? new Date(String(user.skip_password_change)) : null;

    const mustChange =
      !skipUntil || now.getTime() > skipUntil.getTime() + 7 * 24 * 60 * 60 * 1000;

    if (mustChange && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }
  }

  // 🔹 ป้องกันไม่ให้เข้าหน้า change-password ถ้าเปลี่ยนไปแล้ว
  if (user && !user.is_first_login && pathname === "/change-password") {
    return NextResponse.redirect(new URL("/protected", request.url));
  }

  // 🔹 redirect ตาม role เมื่อเข้า /protected
  if (user && pathname === "/protected") {
    const roleRoutes: Record<number, string> = {
      1: "/admin",
      2: "/board",
      3: "/departments",
      4: "/teacher",
      5: "/supervision",
      // 6: "/company",
      7: "/",
    };
    
    const targetRoute = roleRoutes[user.role as number];
    if (targetRoute) {
      return NextResponse.redirect(new URL(targetRoute, request.url));
    }
  }

  // 🔹 ถ้าอยู่ในหน้า signin แล้วล็อกอินอยู่ → redirect ไปหน้า role
  if (pathname === "/signin" && user) {
    const roleRoutes: Record<number, string> = {
      1: "/admin",
      2: "/board",
      3: "/departments",
      4: "/teacher",
      5: "/supervision",
      // 6: "/company",
      7: "/",
    };
    
    const targetRoute = roleRoutes[user.role as number];
    if (targetRoute) {
      return NextResponse.redirect(new URL(targetRoute, request.url));
    }
  }

  // 🔹 ตรวจสิทธิ์ตาม role (เรียงจากเฉพาะเจาะจงไปทั่วไป)
  const restrictedRoutes = [
    { prefix: "/admin", role: 1 },
    { prefix: "/board", role: 2 },
    { prefix: "/departments", role: 3 },
    { prefix: "/teacher", role: 4 },
    { prefix: "/supervision", role: 5 },
    // { prefix: "/company", role: 6 },
  ];

  // ตรวจสอบ specific routes ก่อน
  for (const route of restrictedRoutes) {
    if (pathname.startsWith(route.prefix) && user?.role !== route.role) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }
  }

  // 🔹 ตรวจสอบ root path "/" - เฉพาะ role 7 เท่านั้นที่เข้าได้
  if (pathname === "/" && user?.role !== 7) {
    return NextResponse.redirect(new URL("/protected", request.url));
  }

  // 🔹 role 7 ห้ามเข้า protected routes
  if (user?.role === 7) {
    const protectedPaths = ["/admin", "/board", "/departments", "/teacher", "/supervision"];
    const isAccessingProtected = protectedPaths.some(path => pathname.startsWith(path));
    
    if (isAccessingProtected) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/board/:path*",
    "/departments/:path*",
    "/teacher/:path*",
    "/supervision/:path*",
    // "/company/:path*",
    "/protected",
    "/change-password",
    "/signin",
  ],
};