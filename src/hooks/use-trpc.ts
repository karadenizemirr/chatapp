"use client";

import { trpc } from "@/lib/trpc/client";

/**
 * Bu hook, tRPC işlemlerini daha kolay kullanmak için bir yardımcı fonksiyondur.
 * Client Component'lerde doğrudan import ederek kullanılabilir.
 */
export const useTrpc = () => {
  return trpc;
};