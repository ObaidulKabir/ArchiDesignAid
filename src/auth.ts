import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/modules/auth/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials);

          await connectDB();
          const user = await User.findOne({ email }).select("+password");

          if (!user) {
            throw new Error("User not found.");
          }
          
          if (!user.password) {
             throw new Error("Invalid login method.");
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            throw new Error("Invalid password.");
          }

          return {
             id: user._id.toString(),
             name: user.name,
             email: user.email,
             role: user.role
          };
        } catch (error) {
            console.error("Auth error:", error);
            return null;
        }
      },
    }),
  ],
  callbacks: {
      async jwt({ token, user }) {
          if (user) {
              token.role = (user as any).role;
              token.id = user.id;
          }
          return token;
      },
      async session({ session, token }) {
          if (token && session.user) {
              (session.user as any).role = token.role;
              (session.user as any).id = token.id;
          }
          return session;
      }
  },
  pages: {
      signIn: '/login',
  }
});
