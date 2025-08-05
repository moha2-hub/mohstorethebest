import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    userData?: {
      id: number;
      username: string;
      email: string;
      role: string;
      points: number;
      reserved_points: number;
      whatsapp?: string;
    };
  }
}
