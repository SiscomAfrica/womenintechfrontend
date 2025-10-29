import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FilterSidebar } from './FilterSidebar';
import type { AttendeeFilters } from '@/services/networking';
import { Filter } from 'lucide-react';

interface FilterSheetProps {
  filters: AttendeeFilters;
  onFiltersChange: (filters: AttendeeFilters) => void;
  onClearFilters: () => void;
  children?: React.ReactNode;
}

export function FilterSheet({ filters, onFiltersChange, onClearFilters, children }: FilterSheetProps) {


  const activeFilterCount = [
    filters.company,
    filters.jobTitle,
    ...(filters.skills || []),
    ...(filters.interests || [])
  ].filter(Boolean).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            className="relative px-4 py-2 border-border-medium text-primary-orange font-semibold hover:bg-bg-secondary"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary-orange text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left">Filter Attendees</SheetTitle>
          <SheetDescription className="text-left">
            Find attendees by company, skills, interests, and more.
          </SheetDescription>
        </SheetHeader>
        
        <FilterSidebar
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
      </SheetContent>
    </Sheet>
  );
}