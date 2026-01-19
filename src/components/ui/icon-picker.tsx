/* eslint-disable max-lines-per-function */
'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Home, Building, Building2, Castle, Briefcase, ShoppingBag, Utensils, Bed,
  Sofa, ChefHat, Bath, Baby, Sun, Laptop, DoorOpen, ArrowRight,
  Palette, ShoppingCart, Hammer, FileText, User, Map, FileSignature,
  Image, File, Tag, Star, Heart, Bookmark, Flag, Circle,
  Square, Triangle, Hexagon, Zap, Clock, Calendar, Bell, Mail,
  Phone, MessageSquare, Search, Settings, Check, X, Plus, Minus,
  Edit, Trash, Copy, Save, Download, Upload, Link, ExternalLink,
} from 'lucide-react';

const ICONS = {
  // Buildings
  home: Home, building: Building, building2: Building2, castle: Castle,
  briefcase: Briefcase, 'shopping-bag': ShoppingBag, utensils: Utensils, bed: Bed,
  // Rooms
  sofa: Sofa, 'chef-hat': ChefHat, bath: Bath, baby: Baby,
  sun: Sun, laptop: Laptop, 'door-open': DoorOpen, 'arrow-right': ArrowRight,
  // Categories
  palette: Palette, 'shopping-cart': ShoppingCart, hammer: Hammer, 'file-text': FileText,
  user: User, map: Map, 'file-signature': FileSignature, image: Image, file: File,
  // Status
  tag: Tag, star: Star, heart: Heart, bookmark: Bookmark, flag: Flag,
  // Shapes
  circle: Circle, square: Square, triangle: Triangle, hexagon: Hexagon,
  // Actions
  zap: Zap, clock: Clock, calendar: Calendar, bell: Bell, mail: Mail,
  phone: Phone, 'message-square': MessageSquare, search: Search, settings: Settings,
  check: Check, x: X, plus: Plus, minus: Minus, edit: Edit, trash: Trash,
  copy: Copy, save: Save, download: Download, upload: Upload, link: Link, 'external-link': ExternalLink,
};

type IconName = keyof typeof ICONS;

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const iconEntries = Object.entries(ICONS) as [IconName, typeof Home][];
  const filteredIcons = search
    ? iconEntries.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    : iconEntries;

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
    setSearch('');
  };

  const SelectedIcon = value && ICONS[value as IconName];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn('w-full justify-start gap-2 font-normal', !value && 'text-muted-foreground')}
        >
          {SelectedIcon ? (
            <>
              <SelectedIcon className="h-4 w-4" />
              <span>{value}</span>
            </>
          ) : (
            <span>בחר אייקון...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="חפש אייקון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm"
          />
          <ScrollArea className="h-48">
            <div className="grid grid-cols-6 gap-1">
              {filteredIcons.map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleIconSelect(name)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted',
                    value === name && 'bg-primary text-primary-foreground hover:bg-primary'
                  )}
                  title={name}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">לא נמצאו אייקונים</p>
            )}
          </ScrollArea>
          {value && (
            <Button variant="ghost" size="sm" className="w-full" onClick={handleClear}>
              נקה בחירה
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Export icon lookup for use in other components
export function getIcon(name: string) {
  return ICONS[name as IconName] || null;
}
