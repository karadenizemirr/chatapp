"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LoginFormValues } from "@/schemas/loginSchema";
import { useRouter } from "next/navigation";

/**
 * Kimlik doğrulama hook'u
 */
export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  
  // Giriş yapma
  const login = async ({ email, password, remember }: LoginFormValues) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/panel"
      });
      
      if (result?.error) {
        return { success: false, message: result.error };
      }
      
      if (result?.ok) {
        router.refresh();
        return { success: true };
      }
      
      return { success: false, message: "Bilinmeyen bir hata oluştu" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };
  
  // Çıkış yapma
  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };
  
  // Kayıt olma
  const register = async (data: any) => {
    // Register logic here
    return { success: true };
  };
  
  // Profil güncelleme
  const updateProfile = async (data: any) => {
    // Update profile logic here
    return { success: true };
  };
  
  // Şifre değiştirme
  const changePassword = async (data: any) => {
    // Change password logic here
    return { success: true };
  };
  
  return {
    session,
    isAuthenticated,
    isLoading,
    user: session?.user,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
  };
};