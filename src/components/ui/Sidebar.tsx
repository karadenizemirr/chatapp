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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { gsap } from "gsap";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggle,
  isMobile = false,
  isOpen = false,
  onClose,
}) => {
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

    return (
      <div key={item.id} className="menu-item mb-2">
        <div
          className={`group relative flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
            itemIsActive || parentIsActive
              ? "bg-[#2A3942] text-white shadow-xl"
              : "text-white hover:bg-[#2A3942] hover:shadow-lg"
          } ${level > 0 ? "ml-3 py-2.5 bg-[#1E2A32]" : ""} ${
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
        >
          {/* Active indicator */}
          {(itemIsActive || parentIsActive) && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg"></div>
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
                isCollapsed ? "mx-auto" : "mr-4"
              } relative`}
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  itemIsActive || parentIsActive
                    ? "bg-white/20 shadow-lg"
                    : "group-hover:bg-white/10"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    itemIsActive || parentIsActive
                      ? "text-white drop-shadow-sm"
                      : "text-gray-300 group-hover:text-white group-hover:scale-110"
                  }`}
                />
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold truncate block transition-all duration-300">
                  {item.title}
                </span>
                {level === 0 && (
                  <div
                    className={`h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded-full mt-1 ${
                      itemIsActive || parentIsActive
                        ? "bg-white/50"
                        : "bg-secondary"
                    }`}
                  ></div>
                )}
              </div>
            )}

            {!isCollapsed && item.badge && (
              <span className="ml-3 px-2.5 py-1 text-xs bg-red-500 text-white rounded-full font-medium shadow-lg animate-pulse">
                {item.badge}
              </span>
            )}
          </Link>

          {!isCollapsed && hasChildren && (
            <div className="flex-shrink-0 ml-3 relative z-10">
              <div
                className={`p-1 rounded-lg transition-all duration-300 ${
                  isExpanded
                    ? "rotate-180 bg-white/20"
                    : "group-hover:bg-white/10"
                }`}
              >
                <ChevronDownIcon className="w-4 h-4 transition-transform duration-300" />
              </div>
            </div>
          )}
        </div>

        {/* Alt menüler */}
        {!isCollapsed && hasChildren && (
          <div
            data-submenu={item.id}
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? "mt-2" : "h-0 opacity-0"
            }`}
          >
                      <div className="space-y-1 pl-3 border-l-2 border-gray-700/50 ml-3">
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
        y: 20,
      }
    );

    // Animate sidebar entrance
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
          ease: "back.out(1.7)",
        },
        "-=0.3"
      )
      .to(
        userInfoRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .to(
        menuRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .to(
        footerRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2"
      );

    // Animate menu items
    const menuItems = document.querySelectorAll(".menu-item");
    gsap.fromTo(
      menuItems,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      }
    );
  }, []);

  // Mobile overlay animation
  useEffect(() => {
    if (isMobile && overlayRef.current) {
      if (isOpen) {
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.fromTo(
          sidebarRef.current,
          { x: "-100%" },
          { x: "0%", duration: 0.4, ease: "power3.out" }
        );
      } else {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        });
        gsap.to(sidebarRef.current, {
          x: "-100%",
          duration: 0.3,
          ease: "power3.in",
        });
      }
    }
  }, [isOpen, isMobile]);

  // Collapse animation
  useEffect(() => {
    if (!isMobile && sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isCollapsed ? "4rem" : "20rem",
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [isCollapsed, isMobile]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && (
        <div
          ref={overlayRef}
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden ${
            isOpen ? "block" : "hidden"
          }`}
          onClick={onClose}
        />
      )}

      <div
        ref={sidebarRef}
        className={`${
          isMobile
            ? "fixed left-0 top-0 z-50 w-80 sm:w-72 md:w-80 lg:relative lg:translate-x-0"
            : "relative"
        } bg-[#121B22] backdrop-blur-xl border-r border-gray-800/50 text-white transition-all duration-300 ${
          isCollapsed && !isMobile
            ? "w-16"
            : "w-80 sm:w-72 md:w-80 lg:w-80 xl:w-80"
        } h-screen flex flex-col overflow-hidden max-w-[90vw] sm:max-w-none rounded-tr-xl rounded-br-xl`}
        style={{
          background: "#121B22"
        }}
      >
        {/* Header */}
        <div
          ref={logoRef}
          className="h-16 px-6 py-4 border-b border-gray-700/30 relative flex items-center"
        >
          <div className="absolute inset-0 rounded-b-2xl"></div>
          <div className="flex items-center justify-between relative z-10">
            {!isCollapsed && (
              <div className="flex items-center space-x-4 group">
                <div className="p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <HeartIcon className="w-8 h-8 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    ConnectHeart
                  </h1>
                  <p className="text-xs text-gray-300 font-semibold tracking-wider uppercase">
                    Admin Panel
                  </p>
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className="mx-auto group">
                <div className="bg-gradient-to-br from-secondary/20 to-primary/20 p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <HeartIcon className="w-6 h-6 text-secondary" />
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
            className="p-5 border-b border-gray-700/30 relative overflow-hidden"
          >
            <div className="absolute inset-0"></div>
            <div className="flex items-center space-x-4 relative z-10 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-lg drop-shadow-sm">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate mb-1">
                  {user.name || "Admin"}
                </p>
                <p className="text-xs text-gray-300 truncate font-medium">
                  {user.email}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-green-600 font-semibold">
                    Çevrimiçi
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          ref={menuRef}
          className="flex-1 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
        >
          <div className="space-y-3">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* Footer */}
        <div
          ref={footerRef}
          className="p-5 border-t border-gray-700/30"
        >
          <button
            onClick={logout}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center" : "justify-start"
            } px-4 py-3 text-white hover:bg-[#2A3942] hover:text-white rounded-2xl transition-all duration-300 group transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lg`}
          >
            <div className="p-2 rounded-xl transition-all duration-300">
              <LogOut className="w-5 h-5 text-gray-300 group-hover:text-white transition-all duration-300 group-hover:rotate-12" />
            </div>
            {!isCollapsed && (
              <span className="ml-3 text-sm font-semibold group-hover:translate-x-1 transition-transform duration-300">
                Çıkış Yap
              </span>
            )}
          </button>

          {!isCollapsed && (
            <div className="mt-5 pt-4 border-t border-gray-700/30">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-300 font-medium">
                  ConnectHeart Admin v1.0.2
                </p>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-semibold">
                    Sistem Aktif
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
