import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const GRADIENTS = [
  ["#FF6B6B", "#FFD93D"], // Red to Yellow
  ["#4D96FF", "#6BCB77"], // Blue to Green
  ["#F473B9", "#FF9292"], // Pink to Peach
  ["#9772FB", "#F2789F"], // Purple to Pink
  ["#6E85B7", "#B2C8DF"], // Steel to Light Blue
  ["#FF8C32", "#FFD369"], // Orange to Gold
  ["#00D2FF", "#3A7BD5"], // Cyan to Blue
  ["#833AB4", "#FD1D1D"], // Purple to Red
];

export function getGradientFromName(name: string) {
  if (!name) return "linear-gradient(135deg, #1B1B1A, #252523)";
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % GRADIENTS.length;
  const [color1, color2] = GRADIENTS[index];
  
  return `linear-gradient(135deg, ${color1}, ${color2})`;
}

