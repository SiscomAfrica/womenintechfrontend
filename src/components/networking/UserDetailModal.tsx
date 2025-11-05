import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, Mail, Linkedin, Twitter, Calendar } from 'lucide-react';
import type { Attendee } from '@/services/networking';
import { useState } from 'react';
import { RequestMeetingModal } from './RequestMeetingModal';

interface UserDetailModalProps {
  user: Attendee | null;
  open: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, open, onClose }: UserDetailModalProps) {
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  
  if (!user) return null;

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user.displayName || user.profile?.name || 'Unknown User';
  const jobTitle = user.jobTitle || user.profile?.job_title;
  const company = user.company || user.profile?.company;
  const bio = user.bio || user.profile?.bio;
  const profilePhoto = user.profilePhoto || user.profile?.photo_url;
  const linkedinUrl = user.profile?.linkedin_url;
  const twitterUrl = user.profile?.twitter_handle;
  
  const userInterests = Array.isArray(user.interests) ? user.interests : 
                       Array.isArray(user.profile?.interests) ? user.profile.interests : [];
  const userSkills = Array.isArray(user.skills) ? user.skills : 
                    Array.isArray(user.profile?.skills) ? user.profile.skills : [];

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="sr-only">User Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover bg-bg-tertiary flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-orange flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl font-semibold">
                  {getInitials(displayName)}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-text-primary">
                {displayName}
              </h2>
              
              {jobTitle && (
                <div className="flex items-center gap-2 text-text-secondary mt-2">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{jobTitle}</span>
                </div>
              )}
              
              {company && (
                <div className="flex items-center gap-2 text-text-tertiary mt-1">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{company}</span>
                </div>
              )}
              
              {user.email && (
                <div className="flex items-center gap-2 text-text-tertiary mt-1">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
              )}

              {/* Match Percentage */}
              {user.matchPercentage !== undefined && (
                <div className="inline-flex items-center gap-1.5 bg-orange-50 text-primary-orange px-3 py-1.5 rounded-full text-sm font-medium mt-3">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{user.matchPercentage}% Match</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {bio && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                About
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {bio}
              </p>
            </div>
          )}

          {/* Interests Section */}
          {userInterests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {userInterests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-orange-50 text-primary-orange hover:bg-orange-100 px-3 py-1"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {userSkills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {userSkills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-primary-orange text-primary-orange hover:bg-orange-50 px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(linkedinUrl || twitterUrl) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Connect
              </h3>
              <div className="flex gap-3">
                {linkedinUrl && (
                  <a
                    href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-dark hover:bg-bg-secondary transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-text-secondary">LinkedIn</span>
                  </a>
                )}
                {twitterUrl && (
                  <a
                    href={twitterUrl.startsWith('http') ? twitterUrl : `https://twitter.com/${twitterUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-dark hover:bg-bg-secondary transition-colors"
                  >
                    <Twitter className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-text-secondary">Twitter</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Schedule Meeting Button */}
          <div className="pt-4 border-t border-border-dark">
            <Button
              onClick={() => setShowMeetingModal(true)}
              className="w-full bg-[#60166b] hover:bg-[#4a1154] text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Meeting Request Modal */}
    <RequestMeetingModal
      open={showMeetingModal}
      onOpenChange={setShowMeetingModal}
      receiverId={user.id || user.user_id}
      receiverName={displayName}
    />
  </>
  );
}
