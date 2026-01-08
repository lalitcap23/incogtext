 import NextAuth from "next-auth";
import { authOptions } from "./option";

    const handler =NextAuth(authOptions);
    export { handler as GET, handler as POST };
// Compare this snippet from src/app/api/auth/%5B...nextauth%5D/route.ts:
// import NextAuth from "next-auth";
// import { NextAuthOptions } from "next-auth";