import React, { useState } from 'react';

const TrainingGenerator: React.FC = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  return (
    <div className="content-card">
      <h1 className="section-title">Swimming Training Generator</h1>
      <p className="section-subtitle">Create your personalized swimming training plan in 3 easy steps</p>

      {/* Progress Steps */}
      <div className="progress-steps">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className={`step ${step >= stepNumber ? 'active' : ''}`}>
            <div className="step-number">{stepNumber}</div>
            <span>Step {stepNumber}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Level Selection */}
      {step === 1 && (
        <div className="form-group">
          <label className="form-label">Select Your Level</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <button
                key={level}
                className="p-4 border rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-800">{level}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {level === 'Beginner' && 'New to swimming or learning basics'}
                  {level === 'Intermediate' && 'Comfortable with basic strokes'}
                  {level === 'Advanced' && 'Experienced swimmer'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Goals */}
      {step === 2 && (
        <div className="form-group">
          <label className="form-label">Select Your Goals</label>
          <div className="space-y-3">
            {[
              'Improve technique',
              'Build endurance',
              'Increase speed',
              'Weight loss',
              'Competition preparation'
            ].map((goal) => (
              <label key={goal} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                <span className="ml-3">{goal}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="form-group">
            <label className="form-label">Training Days per Week</label>
            <select className="form-select">
              {[2, 3, 4, 5, 6].map((days) => (
                <option key={days} value={days}>{days} days per week</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Session Duration</label>
            <select className="form-select">
              {[30, 45, 60, 90].map((minutes) => (
                <option key={minutes} value={minutes}>{minutes} minutes</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="button-secondary"
          >
            Previous
          </button>
        )}
        
        <button
          onClick={() => step < totalSteps ? setStep(step + 1) : null}
          className="button-primary ml-auto"
        >
          {step === totalSteps ? 'Generate Plan' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default TrainingGenerator; 