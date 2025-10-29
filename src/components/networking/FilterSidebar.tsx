import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import type { AttendeeFilters } from '@/services/networking';

interface FilterSidebarProps {
  filters: AttendeeFilters;
  onFiltersChange: (filters: AttendeeFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

const commonSkills = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++',
  'Product Management', 'UX Design', 'UI Design', 'Data Science', 'Machine Learning',
  'DevOps', 'Cloud Computing', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST APIs'
];

const commonInterests = [
  'Artificial Intelligence', 'Machine Learning', 'Web Development', 'Mobile Development',
  'Product Strategy', 'User Experience', 'Data Analytics', 'Cloud Computing',
  'Cybersecurity', 'Blockchain', 'IoT', 'AR/VR', 'Fintech', 'Healthtech',
  'Sustainability', 'Leadership', 'Entrepreneurship', 'Innovation'
];

export function FilterSidebar({ filters, onFiltersChange, onClearFilters, className }: FilterSidebarProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const updateFilters = (updates: Partial<AttendeeFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const addSkill = (skill: string) => {
    if (skill && !filters.skills?.includes(skill)) {
      updateFilters({
        skills: [...(filters.skills || []), skill]
      });
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    updateFilters({
      skills: filters.skills?.filter(s => s !== skill) || []
    });
  };

  const addInterest = (interest: string) => {
    if (interest && !filters.interests?.includes(interest)) {
      updateFilters({
        interests: [...(filters.interests || []), interest]
      });
    }
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    updateFilters({
      interests: filters.interests?.filter(i => i !== interest) || []
    });
  };

  const hasActiveFilters = filters.company || filters.jobTitle || 
    (filters.skills && filters.skills.length > 0) || 
    (filters.interests && filters.interests.length > 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-text-tertiary hover:text-text-primary"
          >
            Clear all
          </Button>
        )}
      </div>

      {}
      <div className="space-y-2">
        <Label htmlFor="company-filter" className="text-sm font-medium text-text-secondary">
          Company
        </Label>
        <Input
          id="company-filter"
          placeholder="e.g. Google, Microsoft..."
          value={filters.company || ''}
          onChange={(e) => updateFilters({ company: e.target.value || undefined })}
          className="h-9"
        />
      </div>

      {}
      <div className="space-y-2">
        <Label htmlFor="job-title-filter" className="text-sm font-medium text-text-secondary">
          Job Title
        </Label>
        <Input
          id="job-title-filter"
          placeholder="e.g. Product Manager, Developer..."
          value={filters.jobTitle || ''}
          onChange={(e) => updateFilters({ jobTitle: e.target.value || undefined })}
          className="h-9"
        />
      </div>

      {}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-text-secondary">Skills</Label>
        
        {}
        {filters.skills && filters.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.skills.map((skill) => (
              <Badge
                key={skill}
                className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:text-primary-orange/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {}
        <div className="flex gap-2">
          <Input
            placeholder="Add skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(newSkill);
              }
            }}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => addSkill(newSkill)}
            disabled={!newSkill}
            className="h-8 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {}
        <div className="space-y-2">
          <p className="text-xs text-text-tertiary">Popular skills:</p>
          <div className="flex flex-wrap gap-1">
            {commonSkills
              .filter(skill => !filters.skills?.includes(skill))
              .slice(0, 8)
              .map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  className="text-xs px-2 py-1 rounded-md bg-bg-tertiary text-text-secondary hover:bg-border-light transition-colors"
                >
                  {skill}
                </button>
              ))}
          </div>
        </div>
      </div>

      {}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-text-secondary">Interests</Label>
        
        {}
        {filters.interests && filters.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.interests.map((interest) => (
              <Badge
                key={interest}
                className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
              >
                {interest}
                <button
                  onClick={() => removeInterest(interest)}
                  className="ml-1 hover:text-primary-blue/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {}
        <div className="flex gap-2">
          <Input
            placeholder="Add interest..."
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addInterest(newInterest);
              }
            }}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => addInterest(newInterest)}
            disabled={!newInterest}
            className="h-8 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {}
        <div className="space-y-2">
          <p className="text-xs text-text-tertiary">Popular interests:</p>
          <div className="flex flex-wrap gap-1">
            {commonInterests
              .filter(interest => !filters.interests?.includes(interest))
              .slice(0, 8)
              .map((interest) => (
                <button
                  key={interest}
                  onClick={() => addInterest(interest)}
                  className="text-xs px-2 py-1 rounded-md bg-bg-tertiary text-text-secondary hover:bg-border-light transition-colors"
                >
                  {interest}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}