import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig } from "next-auth";
import NextAuth, { User } from "next-auth";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import { db } from "../db";

declare module "next-auth" {
  interface Session extends User {
    user: {
      id: string;
    } & Session;
  }
}

export const config = {
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "team@inbox.solomon-ai.app",
      // sendVerificationRequest, -> TODO: send custom email
    }),
    GitHub, // optional GitHub provider
  ],
  callbacks: {
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
  },
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(config);
