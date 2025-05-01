import { NextRequest, NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt'
import { prisma } from "./lib/db";
export async function middleware(request: NextRequest) {
    
    const user = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    })
    const { pathname } = request.nextUrl;

    if(pathname !== "/signin" && !user) {
      return NextResponse.redirect(new URL("/signin",request.url))
    }
    if(!user && pathname.startsWith('/')) {
      return NextResponse.redirect(new URL("/signin",request.url))
    }
    if(user && pathname.startsWith('/protected')) {
     
     
        return NextResponse.redirect(
          new URL(user.role === 1 ? '/admin' : user.role === 2 ? "/departments" : '/', request.url)
        )
        
      
    }
    if (pathname.startsWith('/admin')) {
      if (user?.role !== 1) {
        return NextResponse.redirect(new URL('/protected', request.url)); // ถ้าไม่ใช่ admin ส่งไปหน้า /protected
      }
    } else if(pathname.startsWith('/departments')) {
      if (user?.role !== 2) {
        return NextResponse.redirect(new URL('/protected', request.url)); // ถ้าไม่ใช่ user ส่งไปหน้า /protected
      }
    }else{
        if (user?.role !== 3) {
            return NextResponse.redirect(new URL('/protected', request.url)); // ถ้าไม่ใช่ user ส่งไปหน้า /protected
          }
    }
    
    if (pathname.startsWith('/signin') && user) {
      
      switch (user.role) {
        case 1: // Admin
          return NextResponse.redirect(new URL('/admin', request.url));
        case 2: // Board
          return NextResponse.redirect(new URL('/departments', request.url));
        case 3: // Board
          return NextResponse.redirect(new URL('/', request.url));

      }
    }
    return NextResponse.next()
}
export const config = {
    matcher: [
        '/',
        '/departments/:path*',
        '/admin/:path*',
        '/protected',
    ],
  }