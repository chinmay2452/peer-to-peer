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

type CardHeaderProps = {
  className?: string;
  children: React.ReactNode;
};

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
};

type CardTitleProps = {
  className?: string;
  children: React.ReactNode;
};

export const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return (
    <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
};

type CardDescriptionProps = {
  className?: string;
  children: React.ReactNode;
};

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, children }) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
};

type CardContentProps = {
  className?: string;
  children: React.ReactNode;
};

export const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
};