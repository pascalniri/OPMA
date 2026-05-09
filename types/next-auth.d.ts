import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeOrgId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    activeOrgId?: string | null;
  }
}
