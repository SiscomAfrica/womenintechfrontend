import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Building, Briefcase } from 'lucide-react';
import { useSearchAttendees } from '@/hooks/useNetworking';
import type { User as UserType } from '@/services/networking';
import { networkingService } from '@/services/networking';

interface AttendeeCommandPaletteProps {
  onSelectUser: (user: UserType) => void;
  children?: React.ReactNode;
}

export function AttendeeCommandPalette({ onSelectUser, children }: AttendeeCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: searchResults, isLoading } = useSearchAttendees(
    searchQuery,
    undefined
  );

  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelectUser = (user: UserType) => {
    onSelectUser(user);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {children || (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="relative w-full justify-start text-sm text-text-tertiary hover:text-text-primary"
        >
          <Search className="mr-2 h-4 w-4" />
          Search attendees...
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search attendees by name, company, or job title..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-6 w-6 border-2 border-primary-orange/30 border-t-primary-orange rounded-full animate-spin" />
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="py-6 text-center text-sm text-text-tertiary">
                Type at least 2 characters to search
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-text-tertiary">
                No attendees found
              </div>
            )}
          </CommandEmpty>

          {searchResults && searchResults.attendees.length > 0 && (
            <CommandGroup heading="Attendees">
              {searchResults.attendees.map((user) => {
                const displayName = networkingService.getUserDisplayName(user as any);
                const initials = networkingService.getUserInitials(user as any);

                return (
                  <CommandItem
                    key={user.id}
                    value={`${displayName} ${user.company} ${user.jobTitle}`}
                    onSelect={() => handleSelectUser(user as any)}
                    className="flex items-center gap-3 p-3 cursor-pointer"
                  >
                    {}
                    <div className="flex-shrink-0">
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={`${displayName}'s avatar`}
                          className="w-10 h-10 rounded-full object-cover border border-border-light"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-bg-secondary border border-border-light flex items-center justify-center">
                          <span className="text-sm font-semibold text-text-secondary">
                            {initials}
                          </span>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text-primary truncate">
                          {displayName}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-text-tertiary">
                        {user.jobTitle && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{user.jobTitle}</span>
                          </div>
                        )}
                        
                        {user.company && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{user.company}</span>
                          </div>
                        )}
                      </div>

                      {}
                      {(user.interests.length > 0 || user.skills.length > 0) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {[...user.interests.slice(0, 2), ...user.skills.slice(0, 2)].map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-bg-tertiary text-text-tertiary border-border-medium px-1.5 py-0.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {(user.interests.length + user.skills.length) > 4 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-bg-tertiary text-text-tertiary border-border-medium px-1.5 py-0.5"
                            >
                              +{(user.interests.length + user.skills.length) - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <User className="h-4 w-4 text-text-quaternary" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}