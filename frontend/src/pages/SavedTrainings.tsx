import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  notes?: string;
}

interface TrainingPlan {
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

interface ScheduledTraining {
  planId: string;
  date: Date;
  completed: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    planId: string;
    completed: boolean;
  };
}

interface LocationState {
  newPlan?: boolean;
  planId?: string;
}

const SavedTrainings: React.FC = () => {
  const location = useLocation();
  const { newPlan, planId } = (location.state as LocationState) || {};
  const [trainings, setTrainings] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [scheduledTrainings, setScheduledTrainings] = useState<ScheduledTraining[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchSavedTrainings();
  }, []);

  useEffect(() => {
    if (newPlan && planId) {
      const plan = trainings.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        setView('list');
      }
    }
  }, [newPlan, planId, trainings]);

  useEffect(() => {
    // Convert scheduled trainings to calendar events
    const events = scheduledTrainings.map((training: ScheduledTraining): CalendarEvent => {
      const plan = trainings.find((p: TrainingPlan) => p.id === training.planId);
      return {
        id: `${training.planId}-${training.date.getTime()}`,
        title: plan?.name || 'Training Session',
        date: training.date.toISOString().split('T')[0],
        backgroundColor: training.completed ? '#10B981' : '#3B82F6',
        borderColor: training.completed ? '#059669' : '#2563EB',
        textColor: '#FFFFFF',
        extendedProps: {
          planId: training.planId,
          completed: training.completed
        }
      };
    });
    setCalendarEvents(events);
  }, [scheduledTrainings, trainings]);

  const fetchSavedTrainings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trainings');
      if (!response.ok) {
        throw new Error('Failed to fetch training plans');
      }
      const data = await response.json();
      setTrainings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this training plan?')) {
      return;
    }

    try {
      const response = await fetch(`/api/trainings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete training plan');
      }

      setTrainings(trainings.filter(plan => plan.id !== id));
      if (selectedPlan?.id === id) {
        setSelectedPlan(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete the plan');
    }
  };

  const scheduleTraining = (planId: string, date: Date) => {
    setScheduledTrainings([
      ...scheduledTrainings,
      { planId, date, completed: false }
    ]);
  };

  const toggleTrainingCompletion = (planId: string, date: Date) => {
    setScheduledTrainings(
      scheduledTrainings.map(training =>
        training.planId === planId && training.date.getTime() === date.getTime()
          ? { ...training, completed: !training.completed }
          : training
      )
    );
  };

  const handleDateClick = (info: DateClickArg) => {
    if (selectedPlan) {
      const confirmed = window.confirm(`Schedule ${selectedPlan.name} for ${info.date.toLocaleDateString()}?`);
      if (confirmed) {
        scheduleTraining(selectedPlan.id, info.date);
      }
    } else {
      alert('Please select a training plan first');
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const { planId } = info.event.extendedProps as { planId: string; completed: boolean };
    const date = info.event.start || new Date();
    toggleTrainingCompletion(planId, date);
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

  if (error) {
    return (
      <div className="content-card">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchSavedTrainings}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-card">
      {newPlan && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">
            Your training plan has been saved successfully! You can now schedule and track your workouts.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="section-title">My Training Plans</h1>
          <p className="section-subtitle">View, schedule, and manage your swimming training plans</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg ${
              view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg ${
              view === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {trainings.length === 0 ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No saved training plans yet.</p>
          <Link 
            to="/training-generator" 
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your First Plan
          </Link>
        </div>
      ) : view === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List - Left Side */}
          <div className="lg:col-span-1 space-y-4">
            {trainings.map((plan) => (
              <div 
                key={plan.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : plan.id === planId && newPlan
                    ? 'border-green-500 bg-green-50'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{plan.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {plan.level}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Details - Right Side */}
          <div className="lg:col-span-2">
            {selectedPlan ? (
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedPlan.name}</h2>
                    <p className="text-gray-600 mt-1">{selectedPlan.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scheduleTraining(selectedPlan.id, new Date())}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => handleDelete(selectedPlan.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Schedule</h3>
                    <p className="text-gray-600">
                      {selectedPlan.daysPerWeek} days per week, {selectedPlan.duration} minutes per session
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Goals</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlan.goals.map((goal, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Workout Structure</h3>
                  <div className="space-y-4">
                    {selectedPlan.exercises.map((exercise, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-lg text-blue-600">{exercise.name}</h4>
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {exercise.sets} sets × {exercise.reps} reps
                          </span>
                        </div>
                        {exercise.notes && (
                          <p className="text-gray-600 text-sm mt-2">{exercise.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p>Select a plan to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="calendar-view space-y-6">
          {/* Calendar Header */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Training Calendar</h3>
                <p className="text-sm text-gray-500">Click a date to schedule the selected plan</p>
              </div>
              {selectedPlan && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-blue-700">Selected Plan:</span>
                  <span className="font-medium text-blue-800">{selectedPlan.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg border p-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
              }}
              height="auto"
              eventContent={(eventInfo: EventContentArg) => (
                <div className="flex items-center gap-2 p-1">
                  <span className={`w-2 h-2 rounded-full ${
                    (eventInfo.event.extendedProps as { completed: boolean }).completed 
                      ? 'bg-green-400' 
                      : 'bg-blue-400'
                  }`} />
                  <span className="text-sm truncate">{eventInfo.event.title}</span>
                </div>
              )}
            />
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
            </div>
          </div>

          {/* Selected Plan Preview */}
          {selectedPlan && (
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-medium mb-2">Quick Preview</h4>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Duration:</span> {selectedPlan.duration} minutes</p>
                <p><span className="font-medium">Level:</span> {selectedPlan.level}</p>
                <p className="mt-1">{selectedPlan.description}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedTrainings; 