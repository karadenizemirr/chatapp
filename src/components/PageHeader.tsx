"use client";

import React, { ReactNode } from "react";
import { CalendarIcon } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  badge?: {
    text: string;
    icon?: ReactNode;
  };
  stats?: Array<{
    value: string;
    label: string;
  }>;
  actions?: ReactNode;
  avatarText?: string;
};

export default function PageHeader({
  title,
  description,
  badge,
  stats = [],
  actions,
  avatarText = "A",
}: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary p-8 rounded-3xl group">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
      <div className="absolute h-32 w-full bg-gradient-to-r from-primary/20 via-secondary/30 to-secondary/20 blur-3xl -top-10 opacity-70" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <span className="text-white bg-clip-text">{title}</span>
            {badge && (
              <div className="ml-4 text-xs bg-secondary/20 border border-secondary/30 text-white px-2.5 py-1 rounded-full font-normal flex items-center gap-1.5">
                {badge.icon || <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                {badge.text}
              </div>
            )}
          </h1>
          {description && (
            <div className="text-indigo-200 font-light max-w-2xl flex items-center gap-3">
              <span>{description}</span>

              {stats.length > 0 && stats.map((stat, index) => (
                <React.Fragment key={`stat-${index}`}>
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary/60"></div>
                  <span className="text-indigo-100">{stat.value} {stat.label}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 self-end md:self-auto">
          {actions}
          <div className="px-4 py-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 group-hover:border-secondary/40 transition duration-300">
            <CalendarIcon className="w-4 h-4 text-secondary/80" />
            <span className="text-white text-sm font-medium">{new Date().toLocaleDateString('tr-TR', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
          </div>
          <div className="p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-center hover:bg-white/10 transition cursor-pointer group-hover:border-indigo-500/40">
            <div className="w-5 h-5 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xs font-bold text-white">{avatarText}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
