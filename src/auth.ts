import NextAuth, { DefaultSession, User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/db";
import Credentials from "next-auth/providers/credentials";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: number;
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
          placeholder: "กรุณากรอกชื่อผู้ใช้",
        },
        password: {
          label: "password",
          type: "text",
          placeholder: "กรุณากรอก วัน/เดือน/ปี เกิดของคุณ",
        },
      },
      authorize: async (
        credentials: Partial<Record<"username" | "password", unknown>>
      ): Promise<User | null> => {
        if (!credentials) return null;
        const birthday = String(credentials.password);
        let normalized = birthday.replace(/\//g, "-");

        const parts = normalized.split("-");
        if (parts.length === 3) {
          const year = parseInt(parts[2]);
          if (year > 543) {
            // เช็คว่าเป็นปี พ.ศ.
            parts[2] = (year - 543).toString(); // ลบ 543 ออกจากปี
            normalized = parts.join("-");
          }
        }
        const date = dayjs(normalized, "DD-MM-YYYY", true);

        if (!date.isValid()) {
          throw new Error(`รูปแบบวันที่ผิด birthday:`);
        }

        const start = date.startOf("day").toDate();
        const end = date.endOf("day").toDate();

        const user = await prisma.user.findFirst({
          where: {
            username: String(credentials.username),
            birthday: {
              gte: start,
              lte: end,
            },
          },
        });
        if (!user) {
          return null;
        }
        return {
          id: String(user.id),
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // เพิ่มข้อมูลลง token หลัง login สำเร็จ
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // เพิ่มข้อมูลลง session จาก JWT
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = Number(token.role);
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
