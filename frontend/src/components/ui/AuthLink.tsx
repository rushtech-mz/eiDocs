"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "forward" | "backward";
  className?: string;
}

const AuthLink: React.FC<AuthLinkProps> = ({
  href,
  children,
  variant = "forward",
  className = ""
}) => {
  const Icon = variant === "forward" ? ArrowRight : ArrowLeft;
  
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center space-x-2 text-sm font-medium text-gray-600 
        hover:text-green-600 transition-all duration-300 group
        ${variant === "backward" ? "hover:-translate-x-1" : "hover:translate-x-1"}
        ${className}
      `}
    >
      {variant === "backward" && (
        <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
      )}
      
      <span>{children}</span>
      
      {variant === "forward" && (
        <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
      )}
    </Link>
  );
};

export default AuthLink;
