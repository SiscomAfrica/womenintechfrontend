import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Star, AlertCircle } from "lucide-react";
import { AttendeeCard } from "@/components/networking/AttendeeCard";
import { UserDetailModal } from "@/components/networking/UserDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useEnhancedAttendees, useMyProfile } from "@/hooks/useNetworking";
import type { AttendeeFilters, Attendee } from "@/services/networking";
import { useNetworkingSync } from "@/hooks/useBackgroundSync";

type FilterType = 'all' | 'matched';

export default function NetworkingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedUser, setSelectedUser] = useState<Attendee | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch current user's profile to compare interests
  const { data: currentUser } = useMyProfile();
  
  // Sync networking data
  useNetworkingSync();

  // Fetch attendees
  const filters: AttendeeFilters = {
    search: searchQuery || undefined,
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEnhancedAttendees(filters);

  const allAttendees = data?.pages?.flatMap(page => page.attendees || []) || [];

  const filteredAttendees = allAttendees.filter(attendee => {
    if (selectedFilter === 'all') {
      return true;
    }
    
    // For matched filter, check if user has common interests
    if (selectedFilter === 'matched' && currentUser) {
      const currentUserInterests = Array.isArray(currentUser.interests) ? currentUser.interests : [];
      const attendeeInterests = Array.isArray(attendee.interests) ? attendee.interests : 
                               Array.isArray(attendee.profile?.interests) ? attendee.profile.interests : [];
      
      const hasCommonInterests = currentUserInterests.some(interest => 
        attendeeInterests.includes(interest)
      );
      
      return hasCommonInterests;
    }
    
    return false;
  });

  const handleUserClick = (attendee: Attendee) => {
    setSelectedUser(attendee);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 w-full">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Networking</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Connect with {allAttendees.length} attendees
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3 sm:mb-4 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search by name, company, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b w-full overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`
                px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0
                ${selectedFilter === 'all' 
                  ? 'bg-[#60166b] text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              All Attendees
              <span className={`
                ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold
                ${selectedFilter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {allAttendees.length}
              </span>
            </button>
            
            <button
              onClick={() => setSelectedFilter('matched')}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0
                ${selectedFilter === 'matched' 
                  ? 'bg-[#60166b] text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill={selectedFilter === 'matched' ? 'currentColor' : 'none'} />
              Matched
              <span className={`
                ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold
                ${selectedFilter === 'matched'
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {filteredAttendees.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4 w-full">
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load attendees
            </h3>
            <p className="text-gray-600">
              {error instanceof Error ? error.message : 'Something went wrong while loading attendees.'}
            </p>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No attendees found
              </h3>
              <p className="text-gray-600">
                {selectedFilter === 'matched' 
                  ? 'No attendees found with matching interests. Try the "All Attendees" filter.'
                  : 'Try adjusting your search to find more attendees.'
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Attendees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAttendees.map((attendee) => (
                <AttendeeCard
                  key={attendee.id}
                  attendee={attendee}
                  onClick={() => handleUserClick(attendee)}
                  showMatchPercentage={selectedFilter === 'matched'}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  variant="outline"
                >
                  {isFetchingNextPage ? (
                    <>
                      <div className="h-4 w-4 border-2 border-purple-500/30 border-t-purple-700 rounded-full animate-spin mr-2" />
                      Loading more...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        open={isDetailModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}