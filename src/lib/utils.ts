import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value)
}

export function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2)}`
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatVolume(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(1)
}
