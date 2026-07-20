import { useEffect, useState } from 'react';
import { MapPin, Pencil, Link as LinkIcon, Save, X, Plus, Trash2 } from 'lucide-react';
import type { User, ExperienceEntry, EducationEntry } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ExperienceItem } from '@/components/profile/ExperienceItem';
import { profileService } from '@/services/profileService';

export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editExp, setEditExp] = useState<ExperienceEntry[]>([]);
  const [editEdu, setEditEdu] = useState<EducationEntry[]>([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const u = await profileService.getProfile();
    const exp = await profileService.getExperience();
    const edu = await profileService.getEducation();
    
    setUser(u);
    setExperience(exp);
    setEducation(edu);
  };

  const handleStartEdit = () => {
    if (!user) return;
    setEditName(user.name);
    setEditLocation(user.location);
    setEditBio(user.bio);
    setEditExp([...experience]);
    setEditEdu([...education]);
    setIsEditing(true);
  };

  const handleAddExp = () => {
    setEditExp(prev => [
      ...prev,
      {
        id: `temp-exp-${Date.now()}`,
        role: '',
        company: '',
        period: '',
        description: '',
      }
    ]);
  };

  const handleRemoveExp = (id: string) => {
    setEditExp(prev => prev.filter(e => e.id !== id));
  };

  const handleExpChange = (id: string, field: keyof ExperienceEntry, val: string) => {
    setEditExp(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));
  };

  const handleAddEdu = () => {
    setEditEdu(prev => [
      ...prev,
      {
        id: `temp-edu-${Date.now()}`,
        school: '',
        degree: '',
        period: '',
      }
    ]);
  };

  const handleRemoveEdu = (id: string) => {
    setEditEdu(prev => prev.filter(e => e.id !== id));
  };

  const handleEduChange = (id: string, field: keyof EducationEntry, val: string) => {
    setEditEdu(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await profileService.updateFullProfile(
        { name: editName, location: editLocation, bio: editBio },
        editExp,
        editEdu
      );
      await loadProfileData();
      setIsEditing(false);
    } catch (e) {
      alert('Failed to save profile changes.');
    }
  };

  if (!user) return null;

  return (
    <AppLayout header={{ title: 'Profile' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8 max-w-4xl mx-auto w-full">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-surface-container-low p-6 rounded-card border border-surface-container-high">
          <Avatar src={user.avatarUrl} alt={user.name} size="lg" />
          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <div className="flex flex-col gap-3 max-w-md">
                <div className="flex flex-col gap-1">
                  <label className="font-metadata text-metadata text-on-surface-variant">Name</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-metadata text-metadata text-on-surface-variant">Location</label>
                  <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
                  <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
                    {user.name}
                  </h1>
                  <Button size="sm" variant="outline" onClick={handleStartEdit}>
                    <Pencil size={14} className="mr-1" /> Edit profile
                  </Button>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">{user.title}</p>
                <div className="flex items-center gap-1 justify-center sm:justify-start mt-2 text-on-surface-variant">
                  <MapPin size={14} />
                  <span className="font-metadata text-metadata">{user.location}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* About/Bio Block */}
        <div className="bg-surface-container-low rounded-card p-6 border border-surface-container-high">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-3">
            About
          </h3>
          {isEditing ? (
            <div className="flex flex-col gap-1">
              <label className="font-metadata text-metadata text-on-surface-variant">Bio Summary</label>
              <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={4} />
            </div>
          ) : (
            <>
              <p className="font-body-md text-body-md text-on-surface">{user.bio}</p>
              <div className="flex gap-2 mt-4">
                <Badge>
                  <LinkIcon size={12} className="mr-1" /> Portfolio
                </Badge>
                <Badge>{user.yearsExperience} yrs experience</Badge>
              </div>
            </>
          )}
        </div>

        {/* Experience Block */}
        <div className="bg-surface-container-low rounded-card border border-surface-container-high p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-primary">Experience</h3>
            {isEditing && (
              <Button size="sm" variant="soft" onClick={handleAddExp}>
                <Plus size={14} className="mr-1" /> Add Job
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-6">
              {editExp.map((exp) => (
                <div key={exp.id} className="border border-surface-variant rounded-card p-4 flex flex-col gap-3 relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 text-error hover:bg-error/10"
                    onClick={() => handleRemoveExp(exp.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-metadata text-metadata text-on-surface-variant">Role</label>
                      <Input value={exp.role} onChange={(e) => handleExpChange(exp.id, 'role', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-metadata text-metadata text-on-surface-variant">Company</label>
                      <Input value={exp.company} onChange={(e) => handleExpChange(exp.id, 'company', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-metadata text-metadata text-on-surface-variant">Duration (e.g. 2021 - Present)</label>
                    <Input value={exp.period} onChange={(e) => handleExpChange(exp.id, 'period', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-metadata text-metadata text-on-surface-variant">Description</label>
                    <Textarea value={exp.description} onChange={(e) => handleExpChange(exp.id, 'description', e.target.value)} rows={3} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {experience.map((entry) => (
                <ExperienceItem key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>

        {/* Education Block */}
        <div className="bg-surface-container-low rounded-card border border-surface-container-high p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-primary">Education</h3>
            {isEditing && (
              <Button size="sm" variant="soft" onClick={handleAddEdu}>
                <Plus size={14} className="mr-1" /> Add Education
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-6">
              {editEdu.map((edu) => (
                <div key={edu.id} className="border border-surface-variant rounded-card p-4 flex flex-col gap-3 relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 text-error hover:bg-error/10"
                    onClick={() => handleRemoveEdu(edu.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-metadata text-metadata text-on-surface-variant">School</label>
                      <Input value={edu.school} onChange={(e) => handleEduChange(edu.id, 'school', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-metadata text-metadata text-on-surface-variant">Degree / Field</label>
                      <Input value={edu.degree} onChange={(e) => handleEduChange(edu.id, 'degree', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-metadata text-metadata text-on-surface-variant">Period (e.g. 2014 - 2018)</label>
                    <Input value={edu.period} onChange={(e) => handleEduChange(edu.id, 'period', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {education.map((entry) => (
                <div key={entry.id} className="py-3 border-b border-surface-variant last:border-0">
                  <h4 className="font-body-lg text-body-lg font-semibold text-primary">{entry.school}</h4>
                  <p className="font-metadata text-metadata text-on-surface-variant">
                    {entry.degree} · {entry.period}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls for Editing */}
        {isEditing && (
          <div className="flex gap-4 self-end mt-4">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <X size={16} className="mr-1" /> Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-1" /> Save Profile
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
