import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  notes?: string;
}

interface GeneratedPlan {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  level: string;
  goals: string[];
  daysPerWeek: number;
  duration: number;
  createdAt: string;
}

interface FormData {
  level: string;
  goals: string[];
  daysPerWeek: number;
  duration: number;
}

const TrainingGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [formData, setFormData] = useState<FormData>({
    level: '',
    goals: [],
    daysPerWeek: 3,
    duration: 45
  });


  const handleLevelSelect = (level: string) => {
    setFormData(prev => ({ ...prev, level }));
    setStep(2);
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || 'Unknown server error';
        } catch (e) {
          errorMessage = errorText || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      if (!text) {
        throw new Error('Server returned empty response');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text);
        throw new Error('Server returned invalid JSON response');
      }

      setGeneratedPlan(data);
      setStep(4); // Move to plan review step
    } catch (err) {
      console.error('Error generating plan:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/trainings/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedPlan),
      });

      if (!response.ok) {
        throw new Error('Failed to save training plan');
      }

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
      successMessage.textContent = 'Training plan saved successfully!';
      document.body.appendChild(successMessage);
      
      // Remove message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);

      // Navigate to saved plans
      navigate('/saved-trainings', { 
        state: { 
          newPlan: true,
          planId: generatedPlan?.id 
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-card">
      <h1 className="section-title">Swimming Training Generator</h1>
      <p className="section-subtitle">Create your personalized swimming training plan in 4 easy steps</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="progress-steps">
        {[1, 2, 3, 4].map((stepNumber) => (
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
                onClick={() => handleLevelSelect(level)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.level === level 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-blue-500 hover:bg-blue-50'
                }`}
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
          <label className="form-label">Select Your Goals (Choose at least one)</label>
          <div className="space-y-3">
            {[
              'Improve technique',
              'Build endurance',
              'Increase speed',
              'Weight loss',
              'Competition preparation'
            ].map((goal) => (
              <label 
                key={goal} 
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.goals.includes(goal) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={() => handleGoalToggle(goal)}
                  className="form-checkbox h-4 w-4 text-blue-600" 
                />
                <span className="ml-3">{goal}</span>
              </label>
            ))}
          </div>
          {formData.goals.length === 0 && step === 2 && (
            <p className="text-red-500 text-sm mt-2">Please select at least one goal</p>
          )}
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="form-group">
            <label className="form-label">Training Days per Week</label>
            <select 
              className="form-select"
              value={formData.daysPerWeek}
              onChange={(e) => setFormData(prev => ({ ...prev, daysPerWeek: Number(e.target.value) }))}
            >
              {[2, 3, 4, 5, 6].map((days) => (
                <option key={days} value={days}>{days} days per week</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Session Duration</label>
            <select 
              className="form-select"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
            >
              {[30, 45, 60, 90].map((minutes) => (
                <option key={minutes} value={minutes}>{minutes} minutes</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Add new step 4: Plan Review */}
      {step === 4 && generatedPlan && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            {/* Plan Header */}
            <div className="border-b pb-4 mb-6">
              <h2 className="text-2xl font-semibold mb-2">{generatedPlan.name}</h2>
              <p className="text-gray-600">{generatedPlan.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {generatedPlan.level}
                </span>
                {generatedPlan.goals.map((goal, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {goal}
                  </span>
                ))}
              </div>
            </div>

            {/* Schedule Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Schedule</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Frequency:</span> {generatedPlan.daysPerWeek} days per week
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Duration:</span> {generatedPlan.duration} minutes per session
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Training Focus</h3>
                <p className="text-gray-600">
                  This plan is designed for {generatedPlan.level.toLowerCase()} swimmers, 
                  focusing on {generatedPlan.goals.join(' and ')}.
                </p>
              </div>
            </div>

            {/* Workout Structure */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Workout Structure</h3>
              <div className="space-y-6">
                {generatedPlan.exercises.map((exercise, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-lg text-blue-600">{exercise.name}</h4>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {exercise.sets} sets × {exercise.reps} reps
                      </span>
                    </div>
                    {exercise.notes && (
                      <div className="mt-2">
                        <p className="text-gray-600 text-sm leading-relaxed">{exercise.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips and Recommendations */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Tips & Recommendations</h3>
              <ul className="list-disc list-inside space-y-2 text-blue-700">
                <li>Always start with a proper warm-up to prevent injury</li>
                <li>Focus on maintaining proper form throughout the exercises</li>
                <li>Stay hydrated during your training sessions</li>
                <li>Listen to your body and adjust intensity as needed</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={handleSavePlan}
                disabled={loading}
                className="button-primary flex-1 py-3 flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save to My Training Plans
                  </>
                )}
              </button>
              <button
                onClick={() => setStep(1)}
                className="button-secondary flex-1 py-3 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons - Update the condition */}
      {step < 4 && (
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="button-secondary"
              disabled={loading}
            >
              Previous
            </button>
          )}
          
          <button
            onClick={() => {
              if (step === 2 && formData.goals.length === 0) {
                return;
              }
              if (step < 3) {
                setStep(step + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={loading || (step === 2 && formData.goals.length === 0)}
            className="button-primary ml-auto"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              step === 3 ? 'Generate Plan' : 'Next'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TrainingGenerator; 