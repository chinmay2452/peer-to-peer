// lib/utils.ts
export function cn(...classes: (string | false | undefined)[]): string {
    return classes.filter(Boolean).join(" ");
  }