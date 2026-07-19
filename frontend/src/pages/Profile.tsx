import { useEffect, useState } from 'react';
import { MapPin, Pencil, Link as LinkIcon } from 'lucide-react';
import type { User, ExperienceEntry, EducationEntry } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExperienceItem } from '@/components/profile/ExperienceItem';
import { profileService } from '@/services/profileService';

export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);

  useEffect(() => {
    profileService.getProfile().then(setUser);
    profileService.getExperience().then(setExperience);
    profileService.getEducation().then(setEducation);
  }, []);

  if (!user) return null;

  return (
    <AppLayout header={{ title: 'Profile' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-section-margin max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar src={user.avatarUrl} alt={user.name} size="lg" />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
                {user.name}
              </h1>
              <Button size="sm" variant="outline">
                <Pencil size={14} /> Edit profile
              </Button>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">{user.title}</p>
            <div className="flex items-center gap-1 justify-center sm:justify-start mt-2 text-on-surface-variant">
              <MapPin size={14} />
              <span className="font-metadata text-metadata">{user.location}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-card p-6">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-3">
            About
          </h3>
          <p className="font-body-md text-body-md text-on-surface">{user.bio}</p>
          <div className="flex gap-2 mt-4">
            <Badge>
              <LinkIcon size={12} className="mr-1" /> Portfolio
            </Badge>
            <Badge>{user.yearsExperience} yrs experience</Badge>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6">
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Experience</h3>
          <div>
            {experience.map((entry) => (
              <ExperienceItem key={entry.id} entry={entry} />
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6">
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Education</h3>
          {education.map((entry) => (
            <div key={entry.id} className="py-3">
              <h4 className="font-body-lg text-body-lg font-semibold">{entry.school}</h4>
              <p className="font-metadata text-metadata text-on-surface-variant">
                {entry.degree} · {entry.period}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
