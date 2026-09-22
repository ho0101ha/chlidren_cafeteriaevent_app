// app/actions/login.ts
"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export type LoginState = {
  success: boolean;
  error: string | null;
};

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. 必須バリデーション
  if (!email || !password) {
    return { success: false, error: "メールアドレスとパスワードを入力してください。" };
  }

  try {
    // 2. NextAuthのsignInを実行
    // redirect: false にすることで、この関数内でエラーハンドリングを行えるようにします
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // NextAuthの認証エラーの種類に応じてメッセージを分岐
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "メールアドレスまたはパスワードが間違っています。" };
        default:
          return { success: false, error: "ログインに失敗しました。入力内容をご確認ください。" };
      }
    }
    
    console.error("Login Error:", error);
    return { success: false, error: "予期せぬエラーが発生しました。" };
  }

  // 3. ログイン成功時はトップページへリダイレクト
  redirect("/");
}