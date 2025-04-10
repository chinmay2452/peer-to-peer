import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  color?: "blue" | "green" | "red" | "gray";
};

const badgeColors: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-800",
};

const Badge = ({ children, color = "gray" }: BadgeProps) => {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${badgeColors[color]}`}
    >
      {children}
    </span>
  );
};

export default Badge;