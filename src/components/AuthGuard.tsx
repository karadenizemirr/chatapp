"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
};

export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = "/auth/login",
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Yükleme durumunda hiçbir şey yapma
    if (isLoading) return;

    // Kimlik doğrulama gerekliyse ve kullanıcı giriş yapmamışsa yönlendir
    if (requireAuth && !isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Admin yetkisi gerekiyorsa ve kullanıcı admin değilse yönlendir
    if (requireAdmin && (!isAuthenticated || !user?.isAdmin)) {
      router.push("/unauthorized");
      return;
    }

    // Kullanıcı giriş yapmışsa ve auth sayfalarına erişmeye çalışıyorsa dashboard'a yönlendir
    if (isAuthenticated && pathname.startsWith("/auth/")) {
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, isLoading, requireAuth, requireAdmin, user, router, pathname, redirectTo]);

  // Yükleme durumunda veya koşullar sağlanmadıysa içeriği gösterme
  if (isLoading || (requireAuth && !isAuthenticated) || (requireAdmin && (!isAuthenticated || !user?.isAdmin))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return <>{children}</>;
}