// app/actions/signup.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export type SignupState = {
  success: boolean;
  error: string | null;
};

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;

  // 1. 必須入力チェック
  if (!name || !email || !password || !passwordConfirm) {
    return { success: false, error: "すべての項目を入力してください。" };
  }

  // 2. パスワード一致チェック
  if (password !== passwordConfirm) {
    return { success: false, error: "確認用パスワードが一致しません。" };
  }

  // 3. パスワードの長さチェック（セキュリティ向上）
  if (password.length < 1) {
    return { success: false, error: "パスワードは1文字以上で入力してください。" };
  }

  try {
    // 4. メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "このメールアドレスは既に登録されています。" };
    }

    // 5. パスワードのハッシュ化 (ソルト値: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. DBへユーザー登録
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // デフォルトのロールを設定
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);
    return { success: false, error: "登録処理中に予期せぬエラーが発生しました。" };
  }

  // 7. 登録成功時はログインページへリダイレクト
  redirect("/login");
}