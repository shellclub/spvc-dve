import NextAuth, { DefaultSession, User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/db";
import Credentials from "next-auth/providers/credentials";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

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
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
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
});

