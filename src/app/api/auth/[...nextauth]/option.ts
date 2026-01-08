import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import connectDB from "../../../lib/helping/dbconnection";
import UserModal from "../../../model/user";
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          placeholder: "Enter your username",
          type: "text",
        },
        password: {
          label: "Password",
          placeholder: "Enter your password",
          type: "password", 
        },
      },
      // @ts-expect-error - NextAuth credentials type
      async authorize(credentials: any): Promise<any> {
        // @ts-expect-error - any type needed
        // @ts-expect-error - any type needed
        await connectDB();
        try {
          // Check for test account bypass
          const TEST_EMAIL = process.env.TEST_EMAIL || "lalitrajput232002@gmail.com";
          const TEST_PASSWORD = process.env.TEST_PASSWORD || "11111";
          
          if (credentials.username === TEST_EMAIL && credentials.password === TEST_PASSWORD) {
            let testUser = await UserModal.findOne({ email: TEST_EMAIL });
            
            if (!testUser) {
              const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
              testUser = new UserModal({
                email: TEST_EMAIL,
                username: "testuser",
                password: hashedPassword,
                verified: true,
                verifyCode: "",
                verifyCodeExpires: new Date(),
                isAcceptingMessage: true,
                messages: [],
              });
              await testUser.save();
            } else if (!testUser.verified) {
              testUser.verified = true;
              await testUser.save();
            }
            
            return testUser;
          }

          const user = await UserModal.findOne({
            $or: [
              { username: credentials.username },
              { email: credentials.username },
            ],
          });

          if (!user) {
            throw new Error("User not found");
          }

          if (!user.verified) {
            throw new Error("User not verified");
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
  
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Invalid password");
          }
        // @ts-expect-error - Error handling
        } catch (err: any) {
          // @ts-expect-error - any type needed
          console.error("Error during authentication:", err.message);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/Sign-in',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString()
        token.verified = user.verified;
        token.username = user.username;
        token.isAcceptingMessage = user.isAcceptingMessage;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.verified = token.verified;
        session.user.username = token.username;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
