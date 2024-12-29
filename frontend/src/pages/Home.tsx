import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="content-card">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome to Training App</h1>
        <p className="welcome-subtitle">
          Generate your personalized training plan today! Create a customized swimming training plan tailored to your needs and goals.
        </p>
        
        <div className="action-buttons">
          <Link to="/generate" className="button-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generate Plan
          </Link>
          <Link to="/profile" className="button-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            View Profile
          </Link>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Generate Plan</h3>
            <p className="text-gray-600 mb-4">Create a customized swimming training plan tailored to your needs and goals.</p>
            <Link to="/generate" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center">
              Get Started
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Your Profile</h3>
            <p className="text-gray-600 mb-4">View and manage your profile and training history.</p>
            <Link to="/profile" className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center">
              View Profile
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 