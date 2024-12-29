import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="content-card">
      <div className="profile-section">
        <h1 className="section-title">Profile</h1>
        <p className="section-subtitle">View and manage your profile information</p>

        <div className="profile-header">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-800">Your Profile</h2>
            <p className="text-gray-500">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="profile-info">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" placeholder="Enter your name" />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label className="form-label">Swimming Level</label>
            <select className="form-select">
              <option value="">Select your level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Training Goals</label>
            <textarea className="form-input" rows={4} 
                      placeholder="Describe your training goals"></textarea>
          </div>

          <div className="mt-8">
            <button className="button-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 