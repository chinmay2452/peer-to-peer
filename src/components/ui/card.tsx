// components/ui/card.tsx
import React from "react";
import {cn} from "@/lib/utils";

type CardProps = {
  className?: string;
  children: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={cn("bg-white shadow-md rounded-xl p-4", className)}>
      {children}
    </div>
  );
};

type CardContentProps = {
  className?: string;
  children: React.ReactNode;
};

export const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return (
    <div className={cn("mt-2", className)}>
      {children}
    </div>
  );
};