'use client';

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  CheckSquare,
  Package,
  Settings,
  Wallet,
  FileText,
  Calendar,
  Truck,
  Clock,
  Receipt,
  FileSignature,
  Coins,
  CreditCard,
  UserCircle,
  Briefcase,
  Link,
  Folder,
  Star,
  Heart,
  Home,
  Mail,
  Phone,
  MapPin,
  Tag,
  Bookmark,
  DollarSign,
  Flag,
  Archive,
  type LucideIcon,
} from 'lucide-react';

// Map of icon names to components
const iconComponents: Record<string, LucideIcon> = {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  CheckSquare,
  Package,
  Settings,
  Wallet,
  FileText,
  Calendar,
  Truck,
  Clock,
  Receipt,
  FileSignature,
  Coins,
  CreditCard,
  UserCircle,
  Briefcase,
  Link,
  Folder,
  Star,
  Heart,
  Home,
  Mail,
  Phone,
  MapPin,
  Tag,
  Bookmark,
  DollarSign,
  Flag,
  Archive,
};

interface NavIconProps {
  name: string | null;
  className?: string;
}

export function NavIcon({ name, className = 'h-5 w-5' }: NavIconProps) {
  if (!name) {
    return <Folder className={className} />;
  }

  const IconComponent = iconComponents[name];

  if (!IconComponent) {
    return <Folder className={className} />;
  }

  return <IconComponent className={className} />;
}

// Export available icons for picker
export const availableIcons = Object.keys(iconComponents);
