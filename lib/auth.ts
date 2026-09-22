// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import GitHub from "next-auth/providers/github";
// import bcrypt from "bcrypt";
// import { prisma } from "@/lib/prisma";

// // 1. 確実に string 型であることを確定させるための環境変数チェック
// const githubId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID;
// const githubSecret = process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET;

// if (!githubId || !githubSecret) {
//   throw new Error("GitHub OAuth 用の環境変数が設定されていません。 .env ファイルを確認してください。");
// }

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   session: { strategy: "jwt" },
//   providers: [
//     // 2. 確定した string 型の変数を渡すことで TypeScript の ts(2322) エラーを解消
//     GitHub({
//       clientId: githubId,
//       clientSecret: githubSecret,
//     }),
    
//     Credentials({
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email as string },
//         });

//         if (!user || !user.password) return null;

//         const isPasswordValid = await bcrypt.compare(
//           credentials.password as string,
//           user.password
//         );

//         if (!isPasswordValid) return null;

//         return {
//           id: user.id,
//           email: user.email,
//           name: user.name,
//           role: user.role,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === "github") {
//         if (!user.email || !user.id) return false;

//         await prisma.user.upsert({
//           where: { email: user.email },
//           update: { name: user.name || "ユーザー" },
//           create: {
//             id: user.id,
//             email: user.email,
//             name: user.name || "ユーザー",
//             password: null,
//             role: "USER",
//           },
//         });
//       }
//       return true;
//     },

//     async jwt({ token, user, account }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role || "USER";
//       }

//       if (account && token.email) {
//         const dbUser = await prisma.user.findUnique({
//           where: { email: token.email },
//         });
//         if (dbUser) {
//           token.id = dbUser.id;
//           token.role = dbUser.role;
//         }
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as string;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
// });
// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. メールアドレスでユーザーを検索
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // ユーザーが存在しない、またはパスワードが設定されていない（OAuth用アカウント等）場合は弾く
        if (!user || !user.password) return null;

        // 2. パスワードの照合
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        // 3. セッションに渡すユーザー情報を返却
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // サインイン直後に user オブジェクトが存在する場合、トークンに情報を詰め込む
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
      }
      return token;
    },

    async session({ session, token }) {
      // トークンに保存した情報をセッションに引き渡す
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});