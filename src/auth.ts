import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";

export type UserRole = "coordenacao" | "facilitador" | "articulador";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
  interface User {
    role?: UserRole;
  }
}

type AppToken = {
  id?: string;
  role?: UserRole;
  [key: string]: unknown;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Necessário para self-hosting fora da Vercel (VPS, Docker) — confia no
  // host informado pelo proxy reverso. Ver AUTH_TRUST_HOST no .env.example.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase().trim()))
          .limit(1);

        if (!user || !user.ativo) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      const t = token as AppToken;
      if (user) {
        t.id = user.id;
        t.role = user.role as UserRole;
      }
      return t;
    },
    session({ session, token }) {
      const t = token as AppToken;
      if (session.user) {
        session.user.id = t.id as string;
        session.user.role = t.role as UserRole;
      }
      return session;
    },
  },
});
