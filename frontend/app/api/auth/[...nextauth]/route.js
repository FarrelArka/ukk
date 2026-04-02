import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  site: process.env.NEXTAUTH_URL || "http://localhost:3000",

  providers: [
    // 🔥 GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // 🔥 LOGIN KE BACKEND GO
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch("http://localhost:5050/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();
          console.log("LOGIN RESPONSE:", data);

          if (!res.ok) return null;

          return {
            id: data.id,
            name: data.name,
            email: data.email,
            address: data.address || "",
            accessToken: data.token || "",
          };
        } catch (error) {
          console.error("LOGIN ERROR:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.address = user.address;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id ;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.address = token.address;
        session.accessToken = token.accessToken;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await fetch("http://localhost:8080/api/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              image: user.image,
            }),
          });
        } catch (err) {
          console.error("GOOGLE SYNC ERROR:", err);
        }
      }
      return true;
    },
  },

  pages: {
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET || "secret",
});

export { handler as GET, handler as POST };