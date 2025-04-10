// components/ui/button.tsx
import React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export const Button: React.FC<ButtonProps> = ({ className, variant = "default", ...props }) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md text-white font-medium transition",
        variant === "default" && "bg-blue-600 hover:bg-blue-700",
        variant === "outline" && "border border-blue-600 text-blue-600 hover:bg-blue-50",
        variant === "ghost" && "bg-transparent text-blue-600 hover:underline",
        className
      )}
      {...props}
    />
  );
};