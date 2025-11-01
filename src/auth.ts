import NextAuth, { DefaultSession, User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/db";
import Credentials from "next-auth/providers/credentials";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: number;
      is_first_login?: boolean;
      skip_password_change?: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: number;
    is_first_login?: boolean;
    skip_password_change?: Date | null;
  }
}

dayjs.extend(customParseFormat);

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  providers: [
    Credentials({
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "กรุณากรอกชื่อผู้ใช้ของคุณ",
        },
        password: {
          label: "password",
          type: "text",
          placeholder: "กรุณากรอกรหัสผ่านของคุณ",
        },
      },
      authorize: async (
        credentials: Partial<Record<"username" | "password", unknown>>
      ): Promise<User | null> => {
        if (!credentials) return null;
        const password = String(credentials.password);
        const user = await prisma.login.findUnique({
          where: {
            username: String(credentials.username),
          },
          include: {
            user: true,
          },
        });
        if (!user) {
          throw new Error("ชื่อผู้ใช้ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");

        }
        const ValidatePassword = bcrypt.compareSync(password, user.password);
        if (!ValidatePassword) {
          throw new Error("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
        }

        return {
          id: String(user.user.id),
          role: user.user.role,
          is_first_login: user.is_first_login,
          skip_password_change: user.skip_password_change,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // เพิ่มข้อมูลลง token หลัง login สำเร็จ
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.is_first_login = user.is_first_login;
        token.skip_password_change = user.skip_password_change;
      }
        if( trigger === "update" && session) {
          token.skip_password_change = session.user.skip_password_change ?? token.skip_password_change;
          token.is_first_login = session.user.is_first_login ?? token.is_first_login;
          token.role = session.user.role ?? token.role;
          token.id = session.user.id ?? token.id;
        }
      return token;
    },
    async session({ session, token }) {
      // เพิ่มข้อมูลลง session จาก JWT
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = Number(token.role);
        session.user.is_first_login = Boolean(token.is_first_login);
        session.user.skip_password_change = token.skip_password_change
          ? dayjs(token.skip_password_change as string).toDate()
          : null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
