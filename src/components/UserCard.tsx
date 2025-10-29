
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, UserPlus, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  id: string;
  name: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  matchPercentage?: number;
  interests?: string[];
  isConnected?: boolean;
  connectionStatus?: 'none' | 'pending' | 'connected';
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  className?: string;
  isConnecting?: boolean;
}

export function UserCard({
  id,
  name,
  title,
  company,
  location,
  bio,
  avatarUrl,
  matchPercentage,
  interests = [],
  isConnected = false,
  connectionStatus = 'none',
  onConnect,
  onMessage,
  onViewProfile,
  className,
  isConnecting = false,
}: UserCardProps) {
  const handleConnect = () => {
    onConnect?.(id);
  };

  const handleMessage = () => {
    onMessage?.(id);
  };

  const handleViewProfile = () => {
    onViewProfile?.(id);
  };

  const getConnectionButtonText = () => {
    switch (connectionStatus) {
      case 'pending':
        return 'Pending';
      case 'connected':
        return 'Connected';
      default:
        return 'Connect';
    }
  };

  const getConnectionButtonVariant = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'outline' as const;
      case 'pending':
        return 'ghost' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-elevated cursor-pointer", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${name}'s avatar`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#007AFF] flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-heading-sm font-semibold text-text-primary truncate">
                {name}
              </h3>
              {matchPercentage !== undefined && (
                <Badge 
                  className={cn(
                    "text-caption font-medium px-2 py-1",
                    matchPercentage >= 80 ? "bg-success-green text-white" :
                    matchPercentage >= 60 ? "bg-primary-orange text-white" :
                    "bg-bg-tertiary text-text-secondary"
                  )}
                >
                  {matchPercentage}% match
                </Badge>
              )}
            </div>

            {title && (
              <p className="text-body-sm text-text-secondary font-medium truncate">
                {title}
              </p>
            )}

            {company && (
              <div className="flex items-center gap-1 mt-1">
                <Briefcase className="h-3 w-3 text-text-tertiary flex-shrink-0" />
                <span className="text-body-xs text-text-tertiary truncate">
                  {company}
                </span>
              </div>
            )}

            {location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-text-tertiary flex-shrink-0" />
                <span className="text-body-xs text-text-tertiary truncate">
                  {location}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {(bio || interests.length > 0) && (
        <CardContent className="pt-0 pb-4">
          {bio && (
            <p className="text-body-sm text-text-secondary line-clamp-2 leading-relaxed mb-3">
              {bio}
            </p>
          )}

          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {interests.slice(0, 3).map((interest, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-caption bg-bg-tertiary text-text-tertiary border-border-medium px-2 py-1"
                >
                  {interest}
                </Badge>
              ))}
              {interests.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-caption bg-bg-tertiary text-text-tertiary border-border-medium px-2 py-1"
                >
                  +{interests.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      )}

      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewProfile}
            className="flex-1 text-body-sm"
          >
            View Profile
          </Button>

          {onConnect && (
            <Button
              variant={getConnectionButtonVariant()}
              size="sm"
              onClick={handleConnect}
              disabled={connectionStatus === 'pending' || isConnecting}
              className="flex-1 text-body-sm"
            >
              {isConnecting ? (
                <div className="h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-1" />
              )}
              {isConnecting ? 'Connecting...' : getConnectionButtonText()}
            </Button>
          )}

          {onMessage && isConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMessage}
              className="px-3"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}