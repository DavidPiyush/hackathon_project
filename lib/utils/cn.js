import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, letting later classes win over earlier ones.
 * Lets every component accept a `className` override without specificity fights.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
