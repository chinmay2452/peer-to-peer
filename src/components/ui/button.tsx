// components/ui/button.tsx
import React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-md font-medium transition",
          size === "default" && "px-4 py-2",
          size === "sm" && "px-3 py-1 text-sm",
          size === "lg" && "px-6 py-3 text-lg",
          size === "icon" && "p-2 h-10 w-10 flex items-center justify-center",
          variant === "default" && "bg-blue-600 hover:bg-blue-700 text-black",
          variant === "outline" && "border border-blue-600 text-blue-600 hover:bg-blue-50",
          variant === "ghost" && "bg-transparent text-blue-600 hover:underline",
          className
        )}
        {...props}
      />
    );
  }
);