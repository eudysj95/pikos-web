import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    rol: string;
    sucursalId: string | null;
    sucursalNombre: string | null;
  }
  interface Session {
    user: {
      rol: string;
      sucursalId: string | null;
      sucursalNombre: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol: string;
    sucursalId: string | null;
    sucursalNombre: string | null;
  }
}
