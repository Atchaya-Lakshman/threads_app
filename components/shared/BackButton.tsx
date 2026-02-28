"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

export default function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const onBack = () => {
    // Prefer router.back(), fallback to window.history
    try {
      router.back();
    } catch (err) {
      if (typeof window !== "undefined") window.history.back();
    }
  };

  return (
    <button
      onClick={onBack}
      aria-label="Go back"
      className={`flex items-center justify-center p-2 rounded-md hover:opacity-80 ${className}`}
    >
      <Image src="/assets/back.svg" alt="back" width={20} height={20} />
    </button>
  );
}
