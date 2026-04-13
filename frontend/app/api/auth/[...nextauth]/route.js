import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { findUserByEmail } from '@/lib/userStore';

const handler = NextAuth({
  site: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email Address', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = findUserByEmail(credentials.email);

        if (user && user.password === credentials.password) {
          // Return user object if credentials are valid
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            phone: user.phone || '',
            address: user.address || ''
          };
        } else {
          // Return null if credentials are invalid
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.phone = user.phone;
        token.address = user.address;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.phone = session.phone;
        token.address = session.address;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.phone = token.phone;
        session.user.address = token.address;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret',
});
export { handler as GET, handler as POST };
