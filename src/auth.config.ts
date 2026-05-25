import type { NextAuthConfig } from "next-auth";
import dayjs from "dayjs";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 1,
  },
  providers: [],
  pages: {
    signIn: "/signin",
  },
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "authjs.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "authjs.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role;
        token.is_first_login = (user as any).is_first_login;
        token.skip_password_change = (user as any).skip_password_change;
      }
      if (trigger === "update" && session) {
        token.skip_password_change =
          session.user.skip_password_change ?? token.skip_password_change;
        token.is_first_login =
          session.user.is_first_login ?? token.is_first_login;
        token.role = session.user.role ?? token.role;
        token.id = session.user.id ?? token.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        (session.user as any).role = Number(token.role);
        (session.user as any).is_first_login = Boolean(token.is_first_login);
        (session.user as any).skip_password_change = token.skip_password_change
          ? dayjs(token.skip_password_change as string).toDate()
          : null;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
