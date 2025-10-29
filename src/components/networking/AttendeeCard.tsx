import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import type { Attendee } from '@/services/networking';

interface AttendeeCardProps {
  attendee: Attendee;
  onClick: () => void;
  showMatchPercentage?: boolean;
}

export function AttendeeCard({ attendee, onClick, showMatchPercentage = false }: AttendeeCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = attendee.displayName || attendee.profile?.name || 'Unknown User';
  const jobTitle = attendee.jobTitle || attendee.profile?.job_title;
  const company = attendee.company || attendee.profile?.company;
  const bio = attendee.bio || attendee.profile?.bio;
  const profilePhoto = attendee.profilePhoto || attendee.profile?.photo_url;
  
  // Truncate bio to ~80 characters
  const truncatedBio = bio && bio.length > 80 ? `${bio.substring(0, 80)}...` : bio;

  return (
    <Card
      className="hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={displayName}
                className="w-14 h-14 rounded-full object-cover bg-bg-tertiary"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary-orange flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  {getInitials(displayName)}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text-primary truncate group-hover:text-primary-orange transition-colors">
                  {displayName}
                </h3>
                
                {jobTitle && (
                  <p className="text-sm text-text-secondary truncate mt-0.5">
                    {jobTitle}
                  </p>
                )}
                
                {company && (
                  <p className="text-xs text-text-tertiary truncate mt-0.5">
                    {company}
                  </p>
                )}
              </div>

              {/* Arrow Icon */}
              <ChevronRight className="w-5 h-5 text-text-tertiary flex-shrink-0 group-hover:text-primary-orange transition-colors" />
            </div>

            {/* Bio */}
            {truncatedBio && (
              <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                {truncatedBio}
              </p>
            )}

            {/* Match Badge - Only show on matched filter */}
            {showMatchPercentage && attendee.matchPercentage !== undefined && (
              <div className="inline-flex items-center gap-1.5 bg-orange-50 text-primary-orange px-2.5 py-1 rounded-full text-xs font-medium mt-2">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{attendee.matchPercentage}% Match</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
