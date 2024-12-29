import React, { useState, useEffect } from 'react';

interface ProfileData {
  name: string;
  email: string;
  level: string;
  goals: string;
  preferredStrokes: string[];
  achievements: Achievement[];
  weeklyTarget: number;
  profilePicture: string | null;
  personalBests: {
    [key: string]: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
}

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    level: '',
    goals: '',
    preferredStrokes: [],
    achievements: [],
    weeklyTarget: 3,
    profilePicture: null,
    personalBests: {
      '50m Freestyle': 0,
      '100m Freestyle': 0,
      '50m Breaststroke': 0,
      '100m Breaststroke': 0,
    }
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setProfileData(prev => ({
        ...prev,
        profilePicture: data.imageUrl
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="profile-header mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              {profileData.profilePicture ? (
                <img 
                  src={profileData.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profileData.name || 'Your Profile'}</h1>
            <p className="text-gray-500">{profileData.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          
          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              type="text" 
              className="form-input"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Swimming Level</label>
            <select 
              className="form-select"
              value={profileData.level}
              onChange={(e) => setProfileData(prev => ({ ...prev, level: e.target.value }))}
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Weekly Target (sessions)</label>
            <input 
              type="number" 
              className="form-input"
              min="1"
              max="7"
              value={profileData.weeklyTarget}
              onChange={(e) => setProfileData(prev => ({ 
                ...prev, 
                weeklyTarget: Math.min(7, Math.max(1, parseInt(e.target.value) || 1))
              }))}
            />
          </div>
        </div>

        {/* Swimming Details */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Swimming Details</h2>
          
          <div className="form-group">
            <label className="form-label">Preferred Strokes</label>
            <div className="space-y-2">
              {['Freestyle', 'Breaststroke', 'Backstroke', 'Butterfly'].map(stroke => (
                <label key={stroke} className="flex items-center">
                  <input 
                    type="checkbox"
                    className="form-checkbox"
                    checked={profileData.preferredStrokes.includes(stroke)}
                    onChange={(e) => {
                      setProfileData(prev => ({
                        ...prev,
                        preferredStrokes: e.target.checked
                          ? [...prev.preferredStrokes, stroke]
                          : prev.preferredStrokes.filter(s => s !== stroke)
                      }));
                    }}
                  />
                  <span className="ml-2">{stroke}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Training Goals</label>
            <textarea 
              className="form-input"
              rows={4}
              value={profileData.goals}
              onChange={(e) => setProfileData(prev => ({ ...prev, goals: e.target.value }))}
              placeholder="Describe your swimming goals..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Personal Bests</label>
            <div className="space-y-3">
              {Object.entries(profileData.personalBests).map(([event, time]) => (
                <div key={event} className="flex items-center gap-2">
                  <span className="w-32 text-sm text-gray-600">{event}</span>
                  <input 
                    type="number"
                    className="form-input"
                    value={time || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      personalBests: {
                        ...prev.personalBests,
                        [event]: parseFloat(e.target.value) || 0
                      }
                    }))}
                    placeholder="Time in seconds"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.achievements.map((achievement) => (
            <div key={achievement.id} className="p-4 border rounded-lg">
              <h3 className="font-medium">{achievement.title}</h3>
              <p className="text-sm text-gray-500">{achievement.description}</p>
              <p className="text-xs text-gray-400 mt-2">
                Achieved on {new Date(achievement.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="button-primary"
        >
          {saving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
};

export default Profile; 