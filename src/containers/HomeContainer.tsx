"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  HeartIcon,

  UserIcon,
  MatchIcon,
  AdminIcon,
  SecurityIcon,
  FloatingHeart, ChatIcon,
} from "@/components/SvgComponents";
import { Form } from "@/components/ui/form/Form";
import { FormField } from "@/components/ui/form/FormField";
import { loginSchema, LoginFormValues } from "@/schemas/loginSchema";
import { EmailIcon, PasswordIcon } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import {toast} from "sonner";

export default function HomeContainer() {
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const formRef = useRef(null);
  const svgContainerRef = useRef(null);
  const statsRef = useRef(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Login operayions
  const { login } = useAuth();

  // Form gönderildiğinde çalışacak fonksiyon
  const handleLogin = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      // Giriş animasyonu
      gsap.to(formRef.current, {
        scale: 0.98,
        duration: 0.1,
        ease: "power2.out",
      });

      const result: any = await login({
        email: data.email,
        password: data.password,
        remember: data.remember,
      });

      if (!result.success) {
        const errorMessage =
          result.error?.message ||
          "Giriş bilgileri hatalı. Lütfen kontrol edin.";
        setError(errorMessage);
        toast.error(errorMessage);

        // Hata animasyonu
        gsap.timeline()
          .to(formRef.current, { x: -10, duration: 0.1 })
          .to(formRef.current, { x: 10, duration: 0.1 })
          .to(formRef.current, { x: -10, duration: 0.1 })
          .to(formRef.current, { x: 10, duration: 0.1 })
          .to(formRef.current, { x: 0, duration: 0.1 });
        return;
      }

      // Başarı animasyonu
      gsap.to(formRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "back.out(1.7)",
      });

      toast.success("Kullanıcı başarıyla eklendi.")

      // Sayfa geçiş animasyonu
      setTimeout(() => {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          ease: "power2.in",
        });
      }, 1000);
    } catch (e: any) {
      const errorMessage =
        e.message || "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
      setError(errorMessage);
      toast.error(errorMessage)

      // Hata animasyonu
      gsap.timeline()
        .to(formRef.current, { x: -10, duration: 0.1 })
        .to(formRef.current, { x: 10, duration: 0.1 })
        .to(formRef.current, { x: -10, duration: 0.1 })
        .to(formRef.current, { x: 10, duration: 0.1 })
        .to(formRef.current, { x: 0, duration: 0.1 });
    } finally {
      setIsLoading(false);
      gsap.to(formRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "back.out(1.7)",
      });
    }
  };

  useEffect(() => {
    // Ana animasyon zaman çizelgesi
    const mainTl = gsap.timeline();

    // Başlangıç durumu - elementleri görünmez yap
    gsap.set([leftRef.current, rightRef.current], { opacity: 0, y: 50 });
    gsap.set((formRef.current as any)?.querySelectorAll(".form-element"), {
      opacity: 0,
      y: 20,
    });
    gsap.set(
      (svgContainerRef.current as any)?.querySelectorAll(".animate-svg"),
      {
        opacity: 0,
        scale: 0.8,
      }
    );
    gsap.set((statsRef.current as any)?.querySelectorAll(".stat-item"), {
      opacity: 0,
      y: 20,
    });

    // Kalpler için özel animasyon
    const hearts = (svgContainerRef.current as any)?.querySelectorAll(
      ".floating-heart"
    );
    if (hearts) {
      hearts.forEach((heart: any) => {
        gsap.set(heart, {
          opacity: 0,
          scale: 0,
          x: gsap.utils.random(-50, 50),
          y: gsap.utils.random(-20, 20),
        });
      });
    }

    // Ana animasyon dizisi
    mainTl
      .to(containerRef.current, {
        duration: 0.5,
        opacity: 1,
        ease: "power2.out",
      })
      .to(leftRef.current, {
        duration: 0.7,
        opacity: 1,
        y: 0,
        ease: "back.out(1.7)",
      })
      .to(
        rightRef.current,
        {
          duration: 0.7,
          opacity: 1,
          y: 0,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      )
      .to(
        (formRef.current as any)?.querySelectorAll(".form-element"),
        {
          duration: 0.5,
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.3"
      )
      .to(
        (svgContainerRef.current as any)?.querySelectorAll(".animate-svg"),
        {
          duration: 0.6,
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          ease: "elastic.out(1, 0.5)",
        },
        "-=0.2"
      )
      .to(
        (statsRef.current as any)?.querySelectorAll(".stat-item"),
        {
          duration: 0.5,
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.3"
      );

    // Kalpler için sürekli animasyon
    if (hearts) {
      hearts.forEach((heart: any, index: number) => {
        const delay = index * 0.3;

        // Kalpleri rastgele aralıklarla görünür yap
        gsap.to(heart, {
          delay: delay,
          duration: 0.6,
          opacity: 0.8,
          scale: gsap.utils.random(0.6, 1),
          ease: "back.out(1.7)",
        });

        // Kalpler için sürekli döngü animasyonu
        gsap.to(heart, {
          delay: delay,
          duration: gsap.utils.random(3, 5),
          y: "-=100",
          repeat: -1,
          yoyo: false,
          ease: "power1.inOut",
          repeatRefresh: true,
        });

        // Kalpleri yavaşça soluklaştır
        gsap.to(heart, {
          delay: delay + 1,
          duration: gsap.utils.random(2, 3),
          opacity: 0,
          repeat: -1,
          repeatDelay: gsap.utils.random(1, 3),
          ease: "power2.inOut",
        });
      });
    }

    // SVG ikonları için gelişmiş animasyon
    const iconTimeline = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    const icons = (svgContainerRef.current as any)?.querySelectorAll(
      ".icon-pulse"
    );

    if (icons) {
      iconTimeline
        .to(icons, {
          duration: 0.6,
          scale: 1.2,
          rotation: 5,
          stagger: 0.15,
          ease: "elastic.out(1, 0.3)",
        })
        .to(icons, {
          duration: 0.6,
          scale: 1,
          rotation: 0,
          stagger: 0.15,
          ease: "elastic.out(1, 0.3)",
        });
    }

    // İstatistik kartları için sürekli animasyon
    const statCards = (statsRef.current as any)?.querySelectorAll(".stat-item");
    if (statCards) {
      statCards.forEach((card: any, index: number) => {
        gsap.to(card, {
          y: -10,
          duration: 2 + index * 0.3,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: index * 0.5,
        });
      });
    }

    // Özellik kartları için hover efekti
    const featureCards = (svgContainerRef.current as any)?.querySelectorAll(
      ".feature-card"
    );
    if (featureCards) {
      featureCards.forEach((card: any) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.05,
            y: -5,
            duration: 0.3,
            ease: "back.out(1.7)",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "back.out(1.7)",
          });
        });
      });
    }

    // Sayılar için sayma animasyonu
    const animateNumbers = () => {
      const numbers = [
        { element: ".stat-number-1", target: 5240 },
        { element: ".stat-number-2", target: 1430 },
        { element: ".stat-number-3", target: 8970 },
      ];

      numbers.forEach(({ element, target }, index) => {
        const el = (statsRef.current as any)?.querySelector(element);
        if (el) {
          gsap.fromTo(
            el,
            { textContent: 0 },
            {
              textContent: target,
              duration: 2,
              delay: 1 + index * 0.3,
              ease: "power2.out",
              snap: { textContent: 1 },
              onUpdate: function () {
                el.textContent =
                  Math.floor(this.targets()[0].textContent).toLocaleString() +
                  "+";
              },
            }
          );
        }
      });
    };

    setTimeout(animateNumbers, 1000);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-white via-primary/5 to-secondary/10"
    >
      <div className="homeContainer grid grid-cols-12 h-screen mx-auto">
        {/* Sol Taraf - Giriş Formu */}
        <div
          ref={leftRef}
          className="left col-span-12 md:col-span-5 bg-white/95 backdrop-blur-sm shadow-2xl border border-white/20 p-10 flex flex-col justify-center relative overflow-hidden"
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/5 to-transparent rounded-full blur-3xl"></div>
          {/* Logo Alanı */}
          <div className="form-element flex justify-center mb-8 relative z-10">
            <div className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <HeartIcon className="w-10 h-10" color="#FF6600" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  ConnectHeart
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          <div
            ref={formRef}
            className="space-y-8 max-w-md mx-auto w-full relative z-10"
          >
            <div className="form-element text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-3">
                Hoş Geldiniz
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Yönetici hesabınıza giriş yaparak platformu güvenle yönetin
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-secondary to-primary mx-auto mt-4 rounded-full"></div>
            </div>
            {error && (
              <div className="form-element bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 p-5 rounded-xl shadow-sm animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
                    <svg
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-red-700 font-medium leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Form<LoginFormValues, typeof loginSchema>
              onSubmit={handleLogin}
              schema={loginSchema}
              defaultValues={{ email: "", password: "", remember: false }}
              className="space-y-6"
              animate={true}
              animationDelay={0.5}
            >
              <div className="form-element">
                <FormField
                  name="email"
                  type="email"
                  label="E-posta"
                  placeholder="E-posta adresinizi girin"
                  icon={<EmailIcon />}
                  required
                  autoComplete="email"
                  inputClassName="focus:ring-2 focus:ring-secondary focus:border-secondary bg-gray-50/50 border-gray-200 rounded-xl h-12 transition-all duration-200"
                />
              </div>

              <div className="form-element">
                <FormField
                  name="password"
                  type="password"
                  label="Şifre"
                  placeholder="Şifrenizi girin"
                  icon={<PasswordIcon />}
                  required
                  autoComplete="current-password"
                  inputClassName="focus:ring-2 focus:ring-secondary focus:border-secondary bg-gray-50/50 border-gray-200 rounded-xl h-12 transition-all duration-200"
                />
              </div>

              <div className="form-element flex justify-between items-center py-2">
                <FormField
                  name="remember"
                  type="checkbox"
                  label="Beni hatırla"
                />

                <a
                  href="#"
                  className="text-sm font-medium text-secondary hover:text-secondary/90 transition-all duration-200 hover:underline underline-offset-2 hover:text-shadow-sm"
                >
                  Şifremi unuttum?
                </a>
              </div>

              <div className="form-element">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 relative overflow-hidden group ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary hover:to-primary hover:scale-[1.02] active:scale-[0.98]"
                  } text-white`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  {isLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  )}
                  <span className="relative z-10">
                    {isLoading ? "Giriş yapılıyor..." : "Güvenli Giriş Yap"}
                  </span>
                  {!isLoading && (
                    <svg
                      className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </Form>

            <div className="form-element text-center space-y-4 relative z-10">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 bg-gray-50/50 py-3 px-4 rounded-lg border border-gray-100">
                <div className="bg-green-100 p-1 rounded-full">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium">
                  256-bit SSL şifreleme ile güvenli
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Yönetici desteği mi gerekiyor?{" "}
                <a
                  href="mailto:admin@connectheart.com"
                  className="font-semibold text-secondary hover:text-secondary/90 transition-all duration-200 hover:underline underline-offset-2 hover:text-shadow-sm"
                >
                  İletişime geç
                </a>
              </p>
            </div>
          </div>

          {/* Alt Bilgi */}
          <div className="mt-10 pt-6 border-t border-gray-100 relative z-10">
            <div className="text-center text-sm text-gray-400 space-y-1">
              <p className="font-medium">ConnectHeart Admin Panel v1.0.2</p>
              <p>© 2024 ConnectHeart. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </div>

        {/* Sağ Taraf - Animasyon ve Bilgiler */}
        <div
          ref={rightRef}
          className="right col-span-12 md:col-span-7 bg-gradient-to-br from-secondary/80 to-primary/20  p-10 flex flex-col justify-center items-center relative overflow-hidden border border-white/20 "
        >
          {/* Enhanced Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-primary/20 to-secondary/10 z-0"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(247,55,79,0.15),transparent_50%)] z-0"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(44,44,44,0.15),transparent_50%)] z-0"></div>

          {/* SVG Animasyonlar */}
          <div
            ref={svgContainerRef}
            className="relative z-10 w-full h-full flex flex-col justify-center items-center"
          >
            {/* Uçuşan Kalpler */}
            <FloatingHeart
              id="heart1"
              className="floating-heart top-20 right-20"
              delay={0.2}
            />
            <FloatingHeart
              id="heart2"
              className="floating-heart top-40 right-40"
              delay={0.5}
            />
            <FloatingHeart
              id="heart3"
              className="floating-heart top-10 left-32"
              delay={0.8}
            />
            <FloatingHeart
              id="heart4"
              className="floating-heart top-60 left-20"
              delay={1.1}
            />
            <FloatingHeart
              id="heart5"
              className="floating-heart top-80 right-60"
              delay={1.4}
            />
            <FloatingHeart
              id="heart6"
              className="floating-heart top-30 right-80"
              delay={1.7}
            />
            <FloatingHeart
              id="heart7"
              className="floating-heart top-70 left-60"
              delay={2.0}
            />

            {/* Ana İçerik */}
            <div className="text-center max-w-2xl mb-12">
              <div className="animate-svg icon-pulse inline-block bg-white/20 backdrop-blur-md p-6 rounded-2xl mb-8 shadow-2xl border border-white/30">
                <HeartIcon className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
              <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                ConnectHeart
                <span className="block text-3xl font-semibold text-white/90 mt-2">
                  Yönetim Paneli
                </span>
              </h2>
              <p className="text-white/95 text-xl leading-relaxed mb-8 drop-shadow-sm">
                Platformunuzu güvenle yönetin, kullanıcı eşleşmelerini takip
                edin ve
                <span className="font-semibold">
                  topluluk deneyimini geliştirin
                </span>
                .
              </p>
            </div>

            {/* İstatistikler - Gelişmiş Animasyonlu */}
            <div
              ref={statsRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-4xl"
            >
              <div className="stat-item bg-white/15 backdrop-blur-md p-8 rounded-2xl text-center shadow-xl border border-white/20 hover:bg-white/25 hover:shadow-2xl transition-all duration-500 group cursor-pointer transform hover:-translate-y-2">
                <div className="animate-svg icon-pulse inline-block mb-4 bg-white/20 p-4 rounded-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:bg-white/30">
                  <UserIcon className="w-10 h-10 text-white mx-auto" />
                </div>
                <div className="stat-number-1 text-white text-4xl font-bold mb-2 drop-shadow-lg group-hover:text-yellow-200 transition-colors duration-300">
                  0+
                </div>
                <p className="text-white/90 font-medium text-lg group-hover:text-white transition-colors duration-300">
                  Aktif Kullanıcı
                </p>
                <div className="w-full h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary/80 to-secondary rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                </div>
              </div>
              <div className="stat-item bg-white/15 backdrop-blur-md p-8 rounded-2xl text-center shadow-xl border border-white/20 hover:bg-white/25 hover:shadow-2xl transition-all duration-500 group cursor-pointer transform hover:-translate-y-2">
                <div className="animate-svg icon-pulse inline-block mb-4 bg-white/20 p-4 rounded-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:bg-white/30">
                  <HeartIcon className="w-10 h-10 text-white mx-auto" />
                </div>
                <div className="stat-number-2 text-white text-4xl font-bold mb-2 drop-shadow-lg group-hover:text-pink-200 transition-colors duration-300">
                  0+
                </div>
                <p className="text-white/90 font-medium text-lg group-hover:text-white transition-colors duration-300">
                  Başarılı Eşleşme
                </p>
                <div className="w-full h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary/80 to-secondary rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 delay-200"></div>
                </div>
              </div>
              <div className="stat-item bg-white/15 backdrop-blur-md p-8 rounded-2xl text-center shadow-xl border border-white/20 hover:bg-white/25 hover:shadow-2xl transition-all duration-500 group cursor-pointer transform hover:-translate-y-2">
                <div className="animate-svg icon-pulse inline-block mb-4 bg-white/20 p-4 rounded-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:bg-white/30">
                  <ChatIcon className="w-10 h-10 text-white mx-auto" />
                </div>
                <div className="stat-number-3 text-white text-4xl font-bold mb-2 drop-shadow-lg group-hover:text-green-200 transition-colors duration-300">
                  0+
                </div>
                <p className="text-white/90 font-medium text-lg group-hover:text-white transition-colors duration-300">
                  Günlük Mesaj
                </p>
                <div className="w-full h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary/60 to-primary/90 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 delay-400"></div>
                </div>
              </div>
            </div>

            {/* Özellikler - İnteraktif Kartlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 w-full max-w-4xl">
              <div className="feature-card animate-svg flex items-center space-x-4 bg-white/15 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 hover:bg-white/25 hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="bg-white/20 p-3 rounded-lg group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 group-hover:bg-blue-400/30 relative z-10">
                  <AdminIcon className="w-8 h-8 text-white flex-shrink-0" />
                </div>
                <div className="relative z-10">
                  <p className="text-white/95 font-semibold text-lg group-hover:text-white transition-colors duration-300">
                    Kullanıcı Yönetimi
                  </p>
                  <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    Profil doğrulama ve moderasyon
                  </p>
                </div>
              </div>
              <div className="feature-card animate-svg flex items-center space-x-4 bg-white/15 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 hover:bg-white/25 hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="bg-white/20 p-3 rounded-lg group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 group-hover:bg-green-400/30 relative z-10">
                  <SecurityIcon className="w-8 h-8 text-white flex-shrink-0" />
                </div>
                <div className="relative z-10">
                  <p className="text-white/95 font-semibold text-lg group-hover:text-white transition-colors duration-300">
                    Güvenlik Sistemi
                  </p>
                  <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    Gelişmiş güvenlik ve içerik kontrolü
                  </p>
                </div>
              </div>
              <div className="feature-card animate-svg flex items-center space-x-4 bg-white/15 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 hover:bg-white/25 hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/15 to-secondary/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="bg-white/20 p-3 rounded-lg group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 group-hover:bg-pink-400/30 relative z-10">
                  <MatchIcon className="w-8 h-8 text-white flex-shrink-0" />
                </div>
                <div className="relative z-10">
                  <p className="text-white/95 font-semibold text-lg group-hover:text-white transition-colors duration-300">
                    Eşleşme Algoritması
                  </p>
                  <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    Akıllı eşleştirme ve optimizasyon
                  </p>
                </div>
              </div>
              <div className="feature-card animate-svg flex items-center space-x-4 bg-white/15 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 hover:bg-white/25 hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="bg-white/20 p-3 rounded-lg group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 group-hover:bg-yellow-400/30 relative z-10">
                  <ChatIcon className="w-8 h-8 text-white flex-shrink-0" />
                </div>
                <div className="relative z-10">
                  <p className="text-white/95 font-semibold text-lg group-hover:text-white transition-colors duration-300">
                    İletişim Merkezi
                  </p>
                  <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                    Mesajlaşma ve bildirim yönetimi
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gelişmiş Dekoratif Elementler */}
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-secondary/30 blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-gradient-to-tr from-secondary/30 to-primary/20 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-gradient-to-bl from-secondary/25 to-primary/15 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/4 right-1/4 w-20 h-20 rounded-full bg-gradient-to-r from-white/10 to-white/5 blur-2xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>

          {/* Yeni Eklenen - Dinamik Parçacık Efektleri */}
          <div
            className="absolute top-20 left-20 w-4 h-4 bg-secondary/40 rounded-full animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-40 right-32 w-3 h-3 bg-primary/50 rounded-full animate-bounce"
            style={{ animationDelay: "1s", animationDuration: "2.5s" }}
          ></div>
          <div
            className="absolute bottom-32 left-40 w-5 h-5 bg-secondary/35 rounded-full animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "3.5s" }}
          ></div>
          <div
            className="absolute bottom-20 right-20 w-2 h-2 bg-primary/60 rounded-full animate-bounce"
            style={{ animationDelay: "0.5s", animationDuration: "2s" }}
          ></div>
          <div
            className="absolute top-60 left-60 w-6 h-6 bg-secondary/30 rounded-full animate-bounce"
            style={{ animationDelay: "1.5s", animationDuration: "4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
