"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems, MenuItem } from "@/config/menuItemConfig";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HeartIcon,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

// Tailwind CSS'e eklenecek stillerin açıklaması
// Uygulamanızda aşağıdaki CSS sınıflarını tailwind.config.js'e eklemeniz gerekecek:
// 1. scrollbar-w-1.5 - Scrollbar genişliği için
// 2. from-blue-500/5, to-transparent - Gradient arka planlar için
// 3. border-gradient-blue - Özel kenar stili için (bu bir utiliy sınıf olarak tanımlanabilir)

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

// XS breakpoint için TailwindCSS'in standart sınıflarını extend et
// Not: Bu tipte kullanılacak, gerçek ayarlar tailwind.config.js'de olmalı

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggle,
  isMobile = false,
  isOpen = false,
  onClose,
}) => {
  const [breakpoint, setBreakpoint] = useState<'sm'|'md'|'lg'|'xl'|'2xl'>('lg');
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // Ekran boyutunu dinle ve uygun breakpoint'i ayarla
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    handleResize(); // İlk yükleme
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const userInfoRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newExpanded = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      // Animate submenu expansion
      const submenu = document.querySelector(`[data-submenu="${itemId}"]`);
      if (submenu) {
        if (newExpanded.includes(itemId)) {
          gsap.fromTo(
            submenu,
            { height: 0, opacity: 0 },
            { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
          );
        } else {
          gsap.to(submenu, {
            height: 0,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
          });
        }
      }

      return newExpanded;
    });
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const isParentActive = (item: MenuItem) => {
    if (isActive(item.path)) return true;
    return item.children?.some((child) => isActive(child.path)) || false;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const itemIsActive = isActive(item.path);
    const parentIsActive = isParentActive(item);
    const isHovered = hoveredMenu === item.id;

    // Responsive boyutlara göre CSS sınıfları belirle
    const getResponsivePadding = () => {
      if (level > 0) return 'ml-2 xs:ml-2.5 py-1 xs:py-1.5 text-xs xs:text-sm';
      return '';
    };

    return (
              <div key={item.id} className="menu-item mb-1.5 xs:mb-2">
        <div
          className={`group relative flex items-center justify-between px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-xl transition-all duration-300 cursor-pointer ${
            itemIsActive || parentIsActive
              ? "bg-gradient-to-r from-[#243845] to-[#2A3942] text-white shadow-md border border-white/10"
              : "text-gray-200 hover:bg-[#1e2c36] hover:text-white border border-transparent hover:border-white/5"
          } ${getResponsivePadding()} ${
            isCollapsed ? "justify-center" : ""
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            }
            if (isMobile && !hasChildren && onClose) {
              onClose();
            }
          }}
          onMouseEnter={() => setHoveredMenu(item.id)}
          onMouseLeave={() => setHoveredMenu(null)}
        >
          {/* Active indicator */}
          {(itemIsActive || parentIsActive) && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-7 bg-gradient-to-b from-blue-400 to-blue-500 rounded-r-full shadow-lg"></div>
          )}

          <Link
            href={item.path}
            className="flex items-center flex-1 min-w-0 relative z-10"
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
              }
            }}
          >
            <div
              className={`flex-shrink-0 ${
                isCollapsed ? "mx-auto" : "mr-2.5 xs:mr-3"
              }`}
            >
              <div
                className={`p-1.5 xs:p-2 rounded-lg transition-all duration-300 ${
                  itemIsActive || parentIsActive
                    ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 shadow-sm shadow-blue-500/10"
                    : isHovered
                    ? "bg-white/10 shadow-sm"
                    : "group-hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`w-[17px] h-[17px] xs:w-[18px] xs:h-[18px] transition-all duration-300 ${
                    itemIsActive || parentIsActive
                      ? "text-blue-300"
                      : isHovered
                      ? "text-white"
                      : "text-gray-400 group-hover:text-white"
                  }`}
                />
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0 sidebar-text-elements">
                <span className="text-xs xs:text-sm font-medium truncate block transition-colors duration-300">
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                    {item.subtitle}
                  </span>
                )}
              </div>
            )}

            {!isCollapsed && item.badge && (
              <span className="ml-1.5 xs:ml-2 px-1.5 xs:px-2 py-0.5 text-[9px] xs:text-[10px] bg-gradient-to-r from-red-500/90 to-red-600/90 text-white rounded-md font-medium shadow-sm sidebar-text-elements shrink-0 border border-white/10">
                {item.badge}
              </span>
            )}
          </Link>

          {!isCollapsed && hasChildren && (
            <div className="flex-shrink-0 ml-1.5 xs:ml-2 sidebar-text-elements">
              <div
                className={`p-1 rounded-md transition-all duration-300 ${
                  isExpanded 
                  ? "bg-white/15 shadow-sm" 
                  : isHovered 
                  ? "bg-white/10" 
                  : "text-gray-400"
                }`}
              >
                <ChevronDownIcon 
                  className={`w-3.5 h-3.5 xs:w-4 xs:h-4 transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Alt menüler */}
        {!isCollapsed && hasChildren && (
          <div
            data-submenu={item.id}
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? "mt-1.5" : "h-0 opacity-0"
            }`}
          >
            <div className="space-y-1.5 pl-2 xs:pl-3 ml-2 xs:ml-3 mt-1.5 border-l border-gradient-blue relative">
              {/* Submenu background gradient */}
              <div className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/30 to-blue-500/10"></div>
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // GSAP Animations
  useEffect(() => {
    if (!sidebarRef.current) return;

    const tl = gsap.timeline();

    // Initial setup
    gsap.set(
      [
        logoRef.current,
        userInfoRef.current,
        menuRef.current,
        footerRef.current,
      ],
      {
        opacity: 0,
        y: 15,
      }
    );

    // Animate sidebar entrance - daha zarif ve etkili animasyonlar
    tl.to(sidebarRef.current, {
      x: 0,
      duration: 0.5,
      ease: "power3.out",
    })
      .to(
        logoRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.2)",
        },
        "-=0.3"
      )
      .to(
        userInfoRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.1)",
        },
        "-=0.25"
      )
      .to(
        menuRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.1)",
        },
        "-=0.25"
      )
      .to(
        footerRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.1)",
        },
        "-=0.25"
      );

    // Animate menu items - daha sofistike stagger animasyonu
    const menuItems = document.querySelectorAll(".menu-item");
    gsap.fromTo(
      menuItems,
      { opacity: 0, x: -15, filter: "blur(5px)" },
      {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 0.3,
        stagger: 0.04,
        ease: "power2.out",
        delay: 0.3,
      }
    );
  }, []);

  // Mobile overlay animation - daha yumuşak ve etkileyici geçişler
  useEffect(() => {
    if (isMobile && overlayRef.current && sidebarRef.current) {
      if (isOpen) {
        // Overlay açılma animasyonu
        gsap.fromTo(
          overlayRef.current, 
          { opacity: 0, backdropFilter: "blur(0px)" },
          { 
            opacity: 1, 
            backdropFilter: "blur(8px)",
            duration: 0.4, 
            ease: "power2.out",
          }
        );

        // Sidebar açılma animasyonu
        gsap.fromTo(
          sidebarRef.current,
          { x: "-100%", filter: "blur(5px)" },
          { 
            x: "0%", 
            filter: "blur(0px)",
            duration: 0.4, 
            ease: "power3.out",
            clearProps: "filter" // Performans için
          }
        );

        // İç öğeler animasyonu
        if (logoRef.current && userInfoRef.current && menuRef.current) {
          gsap.fromTo(
            [logoRef.current, userInfoRef.current, menuRef.current],
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, delay: 0.1, ease: "power2.out" }
          );
        }
      } else {
        // Kapanma animasyonları - daha hızlı ve keskin
        gsap.to(overlayRef.current, {
          opacity: 0,
          backdropFilter: "blur(0px)",
          duration: 0.3,
          ease: "power1.in",
        });

        gsap.to(sidebarRef.current, {
          x: "-100%",
          duration: 0.35,
          ease: "power2.in",
        });
      }
    }
  }, [isOpen, isMobile]);

  // Collapse animation - daha akıcı ve zarif küçültme/genişletme
  useEffect(() => {
    if (!isMobile && sidebarRef.current) {
      // Responsive genişlik değerleri - daha modern genişlikler
      const sidebarWidth = {
        collapsed: '5rem', // Biraz daha geniş collapsed sidebar
        sm: '18rem',
        md: '19rem', 
        lg: '20rem',
        xl: '21rem',
        '2xl': '22rem'
      };

      const targetWidth = isCollapsed ? sidebarWidth.collapsed : 
        (breakpoint === 'sm' ? sidebarWidth.sm :
        breakpoint === 'md' ? sidebarWidth.md :
        breakpoint === 'lg' ? sidebarWidth.lg :
        breakpoint === 'xl' ? sidebarWidth.xl :
        sidebarWidth['2xl']);

      // Ana sidebar animasyonu
      gsap.to(sidebarRef.current, {
        width: targetWidth,
        duration: 0.4,
        ease: "power3.out",
        onComplete: () => {
          // Gerekli DOM yeniden boyutlandırmaları için
          window.dispatchEvent(new Event('resize')); 
        }
      });

      // Metin öğelerini animasyonla göster/gizle - daha yumuşak geçişler
      if (isCollapsed) {
        // Önce ikonlar için animasyon
        gsap.to(".menu-item .flex-shrink-0 div", {
          padding: "0.6rem", // Collapsed durumda biraz daha büyük ikonlar
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.02
        });

        // Sonra metinleri gizle
        gsap.to(".sidebar-text-elements", {
          opacity: 0,
          visibility: "hidden",
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            // Collapsed görünümü için ikonları merkeze al
            gsap.to(".menu-item .flex-shrink-0", {
              margin: "0 auto",
              duration: 0.2,
            });
          }
        });
      } else {
        // Önce ikonlar için animasyon
        gsap.to(".menu-item .flex-shrink-0", {
          margin: "0 0.625rem 0 0", // mr-2.5
          duration: 0.2,
          ease: "power1.out",
        });

        gsap.to(".menu-item .flex-shrink-0 div", {
          padding: "0.5rem", // Normal padding'e dönüş
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.02
        });

        // Sonra metinleri göster
        gsap.to(".sidebar-text-elements", {
          opacity: 1,
          visibility: "visible",
          duration: 0.35,
          delay: 0.15,
          ease: "power2.out",
          stagger: 0.03
        });
      }
    }
  }, [isCollapsed, isMobile, breakpoint]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && (
        <div
          ref={overlayRef}
          className={`fixed inset-0 bg-black/70 backdrop-blur-md xs:backdrop-blur-lg z-40 lg:hidden ${
            isOpen ? "block" : "hidden"
          }`}
          onClick={onClose}
          style={{
            backgroundImage: "radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(236, 72, 153, 0.08), transparent 25%)"
          }}
        />
      )}

      <div
        ref={sidebarRef}
        className={`${isMobile
          ? "fixed left-0 top-0 z-50 h-[100dvh] w-[85vw] xs:w-[75vw] sm:w-[320px] md:w-[350px] lg:relative lg:translate-x-0"
          : "relative"
        } bg-gradient-to-b from-[#121B22] to-[#0d161c] shadow-2xl transition-all duration-300 ${isCollapsed && !isMobile
          ? "w-20"
          : "w-72 xs:w-76 sm:w-80 md:w-80 lg:w-80 xl:w-84"
        } h-[100dvh] flex flex-col overflow-hidden rounded-tr-2xl rounded-br-2xl`}
        style={{
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.4)"
        }}
      >
        {/* Background pattern and effects */}
        <div className="absolute inset-0 bg-[url('/assets/sidebar-pattern.png')] bg-repeat opacity-[0.02] mix-blend-soft-light pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none"></div>

        {/* Toggle Button - mobile için */}
        {isMobile && (
          <button 
            onClick={onClose}
            className="absolute right-0 top-4 mr-4 p-2 rounded-lg bg-[#1a2730]/80 text-white/70 hover:text-white hover:bg-[#243440] transition-all duration-300 z-20 lg:hidden border border-white/10 hover:border-white/20 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Toggle Button - desktop için */}
        {!isMobile && (
          <button 
            onClick={onToggle}
            className="absolute -right-3.5 top-24 p-2 rounded-full bg-gradient-to-br from-[#1e2c36] to-[#1a252d] text-white/80 hover:text-white hover:from-[#243845] hover:to-[#1f2c35] transition-all duration-300 border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl z-20 hidden md:flex group"
          >
            <div className="absolute inset-0 rounded-full bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4 relative group-hover:translate-x-0.5 transition-transform duration-300" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 -rotate-90 relative group-hover:translate-x-0.5 transition-transform duration-300" />
            )}
          </button>
        )}

        {/* Header */}
        <div
          ref={logoRef}
          className="h-22 xs:h-24 px-5 xs:px-6 py-5 xs:py-6 relative flex items-center border-b border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2730]/60 to-transparent rounded-b-2xl"></div>
          <div className="absolute inset-0 bg-[url('/assets/pattern-dot.png')] opacity-5 mix-blend-soft-light"></div>
          <div className="flex items-center justify-between relative z-10 w-full">
            {!isCollapsed && (
              <div className="flex items-center space-x-3.5 xs:space-x-4 group w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="p-2.5 xs:p-3 rounded-xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md shadow-lg border border-white/10 group-hover:border-white/20 group-hover:shadow-pink-500/10 transition-all duration-300 overflow-hidden relative">
                    <HeartIcon className="w-7 h-7 xs:w-8 xs:h-8 text-white drop-shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:text-pink-200" />
                  </div>
                </div>
                <div className="sidebar-text-elements overflow-hidden">
                  <h1 className="text-xl xs:text-2xl font-bold text-white tracking-tight truncate">
                    ConnectHeart
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-sm shadow-green-400/30 animate-pulse"></div>
                    <p className="text-xs text-gray-300 font-medium tracking-wider whitespace-nowrap">
                      Admin Panel
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className="mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-xl blur-lg opacity-30 hover:opacity-50 transition-opacity duration-300"></div>
                <div className="p-2.5 xs:p-3 rounded-xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md shadow-lg border border-white/10 hover:border-white/20 hover:shadow-pink-500/10 transition-all duration-300 overflow-hidden relative">
                  <HeartIcon className="w-6 h-6 xs:w-7 xs:h-7 text-white hover:text-pink-200 transition-all duration-300 hover:scale-110" />
                </div>
              </div>
            )}

            {/* Mobile close button */}
            {isMobile && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div
            ref={userInfoRef}
            className="px-4 xs:px-5 py-3 xs:py-4 mb-3 xs:mb-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a2730]/30 to-transparent"></div>
            <div className="relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <div className="bg-gradient-to-br from-[#1e2c36] to-[#1a252d]/80 backdrop-blur-sm rounded-xl p-3 xs:p-3.5 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/5 group-hover:border-white/10 relative">
                <div className="flex items-center space-x-3 xs:space-x-3.5 relative z-10">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                    <div className="w-10 h-10 xs:w-11 xs:h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-indigo-500/30 hover:scale-105 relative border border-white/20">
                      <span className="text-white font-bold text-base xs:text-lg">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-[#121B22] shadow-lg"></div>
                  </div>

                  <div className="flex-1 min-w-0 sidebar-text-elements">
                    <div className="flex items-center justify-between flex-wrap xs:flex-nowrap gap-1.5">
                      <p className="text-sm xs:text-base font-semibold text-white truncate group-hover:text-blue-50 transition-colors duration-300">
                        {user.name || "Admin"}
                      </p>
                      <div className="px-2 py-0.5 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-md shrink-0 border border-green-500/30 shadow-sm">
                        <span className="text-[10px] xs:text-[11px] text-green-400 font-medium whitespace-nowrap">
                          Aktif
                        </span>
                      </div>
                    </div>
                    <p className="text-xs xs:text-sm text-gray-400 truncate mt-1 group-hover:text-gray-300 transition-colors duration-300">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed User Avatar */}
        {isCollapsed && user && (
          <div className="px-2 py-4 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-indigo-500/30 hover:scale-105 relative border border-white/20 group-hover:border-white/30">
                <span className="text-white font-bold text-base">
                  {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-[#121B22] shadow-lg"></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          ref={menuRef}
          className="flex-1 px-4 xs:px-5 py-3 xs:py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500/40 scrollbar-track-transparent hover:scrollbar-thumb-gray-400/50 scrollbar-w-1.5"
        >
          <div className="mb-3">
            <div className={`relative mb-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'sidebar-text-elements'}`}>
              <h6 className="text-xs font-semibold text-gray-300 uppercase tracking-wider px-2 xs:px-3 mb-2 xs:mb-3 flex items-center">
                <span className="inline-block w-1 h-4 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full mr-2 opacity-70"></span>
                Menü
              </h6>
              <div className="absolute left-0 right-6 h-px bg-gradient-to-r from-blue-500/20 to-transparent"></div>
            </div>
            <div className="space-y-1.5 xs:space-y-2.5">
              {menuItems.map((item) => renderMenuItem(item))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div
          ref={footerRef}
          className="px-4 xs:px-5 pt-3 pb-5 xs:pt-4 xs:pb-6 mt-auto border-t border-white/10 relative"
        >
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#121B22]/80 to-transparent pointer-events-none"></div>

          <button
            onClick={logout}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            } px-3.5 py-3 text-white bg-gradient-to-r from-[#1e2c36] to-[#1a252d] hover:from-[#243440] hover:to-[#1f2c35] rounded-xl transition-all duration-300 group shadow-md hover:shadow-lg active:shadow-inner border border-white/5 hover:border-white/10 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center relative">
              <div className="p-2 bg-red-500/10 rounded-lg mr-3 transition-all duration-300 group-hover:bg-red-500/20 group-hover:shadow-sm">
                <LogOut className="w-4.5 h-4.5 text-red-300 transition-all duration-300 group-hover:text-red-200" />
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors duration-300">
                  Çıkış Yap
                </span>
              )}
            </div>

            {!isCollapsed && (
              <div className="bg-red-500/10 p-1 rounded-md group-hover:bg-red-500/20 transition-all duration-300 relative">
                <ChevronRightIcon className="w-4 h-4 text-red-300 group-hover:translate-x-0.5 transition-all duration-300" />
              </div>
            )}
          </button>

          {!isCollapsed && (
            <div className="mt-4 pt-4 border-t border-white/5 relative">
              <div className="absolute left-0 right-10 top-0 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                    v1.0.2
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    © 2025 ConnectHeart
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-[#1a252d] border border-white/5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                  <span className="text-[10px] text-green-400 font-medium">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
