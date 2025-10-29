import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Building, 
  Linkedin, 
  Twitter, 
  MessageCircle, 
  UserPlus,
  ExternalLink,
  Briefcase,
  Target,
  Award
} from 'lucide-react';
import { useUserProfile, useConnectionRequest } from '@/hooks/useNetworking';

import { networkingService } from '@/services/networking';
import { toast } from 'sonner';

interface UserProfileDialogProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onMessage?: (userId: string) => void;
}

export function UserProfileDialog({ userId, isOpen, onClose, onMessage }: UserProfileDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: user, isLoading, isError } = useUserProfile(userId || '');
  const connectionMutation = useConnectionRequest();

  const handleConnect = async () => {
    if (!user) return;
    
    try {
      await connectionMutation.mutateAsync({ userId: user.id });
      toast.success(`Connection request sent to ${networkingService.getUserDisplayName(user)}!`);
    } catch (error) {
      toast.error('Failed to send connection request. Please try again.');
      console.error('Connection error:', error);
    }
  };

  const handleMessage = () => {
    if (!user) return;
    onMessage?.(user.id);
    onClose();
  };

  if (!isOpen || !userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {isLoading ? (
          <UserProfileSkeleton />
        ) : isError || !user ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <User className="h-12 w-12 text-text-tertiary" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-text-primary">
                Profile not found
              </h3>
              <p className="text-text-tertiary">
                This user's profile could not be loaded.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={`${networkingService.getUserDisplayName(user)}'s avatar`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-border-light"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-bg-secondary border-2 border-border-light flex items-center justify-center">
                      <span className="text-xl font-semibold text-text-secondary">
                        {networkingService.getUserInitials(user)}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl font-bold text-text-primary mb-1">
                    {networkingService.getUserDisplayName(user)}
                  </DialogTitle>
                  
                  {user.jobTitle && (
                    <div className="flex items-center gap-1 mb-2">
                      <Briefcase className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                      <span className="text-body-md text-text-secondary font-medium">
                        {user.jobTitle}
                      </span>
                    </div>
                  )}

                  {user.company && (
                    <div className="flex items-center gap-1 mb-2">
                      <Building className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                      <span className="text-body-sm text-text-tertiary">
                        {user.company}
                      </span>
                    </div>
                  )}

                  <DialogDescription className="sr-only">
                    Profile for {networkingService.getUserDisplayName(user)}
                  </DialogDescription>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleConnect}
                    disabled={connectionMutation.isPending}
                    className="bg-primary-orange hover:bg-primary-orange/90"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {connectionMutation.isPending ? 'Connecting...' : 'Connect'}
                  </Button>
                  
                  {onMessage && (
                    <Button
                      variant="outline"
                      onClick={handleMessage}
                      className="border-border-medium"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Tabbed Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="interests">Interests</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 mt-0">
                    {/* Bio */}
                    {user.bio && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-text-secondary">About</h4>
                        <p className="text-body-md text-text-primary leading-relaxed">
                          {user.bio}
                        </p>
                      </div>
                    )}

                    {/* Contact Links */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-text-secondary">Contact</h4>
                      <div className="space-y-2">
                        {user.linkedinUrl && (
                          <a
                            href={user.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-body-sm text-primary-blue hover:text-primary-blue/80 transition-colors"
                          >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn Profile
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        
                        {user.twitterUrl && (
                          <a
                            href={user.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-body-sm text-primary-blue hover:text-primary-blue/80 transition-colors"
                          >
                            <Twitter className="h-4 w-4" />
                            Twitter Profile
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-bg-tertiary rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-text-primary">
                          {user.skills.length}
                        </div>
                        <div className="text-xs text-text-tertiary">Skills</div>
                      </div>
                      <div className="bg-bg-tertiary rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-text-primary">
                          {user.interests.length}
                        </div>
                        <div className="text-xs text-text-tertiary">Interests</div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Experience Tab */}
                  <TabsContent value="experience" className="space-y-6 mt-0">
                    {/* Current Role */}
                    {(user.jobTitle || user.company) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-text-secondary">Current Role</h4>
                        <div className="bg-bg-tertiary rounded-lg p-4">
                          {user.jobTitle && (
                            <h5 className="font-semibold text-text-primary mb-1">
                              {user.jobTitle}
                            </h5>
                          )}
                          {user.company && (
                            <p className="text-body-sm text-text-secondary">
                              {user.company}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {user.skills.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-text-tertiary" />
                          <h4 className="text-sm font-semibold text-text-secondary">Skills</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              className="bg-orange-100 text-orange-800 border-orange-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Looking For */}
                    {user.lookingFor.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-text-tertiary" />
                          <h4 className="text-sm font-semibold text-text-secondary">Looking For</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user.lookingFor.map((item, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-success-green/10 text-success-green border-success-green/20"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Interests Tab */}
                  <TabsContent value="interests" className="space-y-6 mt-0">
                    {user.interests.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-text-secondary">
                          Professional Interests
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {user.interests.map((interest, index) => (
                            <Badge
                              key={index}
                              className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-text-tertiary">
                          No interests listed yet.
                        </p>
                      </div>
                    )}

                    {/* Combined Skills and Interests for better overview */}
                    {(user.skills.length > 0 || user.interests.length > 0) && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-text-secondary">
                          All Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill, index) => (
                            <Badge
                              key={`skill-${index}`}
                              className="bg-orange-100 text-orange-800 border-orange-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {user.interests.map((interest, index) => (
                            <Badge
                              key={`interest-${index}`}
                              className="bg-blue-100 text-blue-800 border-blue-200"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Skeleton component for loading state
function UserProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}