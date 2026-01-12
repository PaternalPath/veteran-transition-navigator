'use client';

import { useState } from 'react';
import { VeteranProfile } from '@/types';

interface IntakeFormProps {
  onComplete: (profile: VeteranProfile) => void;
}

export default function IntakeForm({ onComplete }: IntakeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<Partial<VeteranProfile>>({
    technicalSkills: [],
    certifications: [],
    preferredLocations: [],
  });

  const updateProfile = (field: string, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    onComplete(profile as VeteranProfile);
  };

  const addToArray = (field: keyof VeteranProfile, value: string) => {
    const current = (profile[field] as string[]) || [];
    if (value.trim() && !current.includes(value.trim())) {
      updateProfile(field, [...current, value.trim()]);
    }
  };

  const removeFromArray = (field: keyof VeteranProfile, value: string) => {
    const current = (profile[field] as string[]) || [];
    updateProfile(field, current.filter(item => item !== value));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 mx-1 rounded ${
                step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Step {currentStep} of 5
        </p>
      </div>

      {/* Step 1: Service Background */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Service Background</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch of Service
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.branch || ''}
              onChange={(e) => updateProfile('branch', e.target.value)}
            >
              <option value="">Select branch</option>
              <option value="Army">Army</option>
              <option value="Navy">Navy</option>
              <option value="Air Force">Air Force</option>
              <option value="Marine Corps">Marine Corps</option>
              <option value="Coast Guard">Coast Guard</option>
              <option value="Space Force">Space Force</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Service
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.yearsOfService || ''}
              onChange={(e) => updateProfile('yearsOfService', parseInt(e.target.value))}
              min="0"
              placeholder="e.g., 4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Rank
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.rank || ''}
              onChange={(e) => updateProfile('rank', e.target.value)}
              placeholder="e.g., E-5, O-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MOS / Job Code
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.mos || ''}
              onChange={(e) => updateProfile('mos', e.target.value)}
              placeholder="e.g., 11B, IT, 0311"
            />
          </div>
        </div>
      )}

      {/* Step 2: Skills */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Skills & Experience</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technical Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a skill (e.g., Project Management, Logistics)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addToArray('technicalSkills', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.technicalSkills?.map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => removeFromArray('technicalSkills', skill)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Press Enter to add</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certifications
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a certification (e.g., PMP, CompTIA)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addToArray('certifications', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.certifications?.map((cert) => (
                <span
                  key={cert}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {cert}
                  <button
                    onClick={() => removeFromArray('certifications', cert)}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Press Enter to add</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leadership Experience
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              value={profile.leadershipExperience || ''}
              onChange={(e) => updateProfile('leadershipExperience', e.target.value)}
              placeholder="Describe your leadership roles and team management experience..."
            />
          </div>
        </div>
      )}

      {/* Step 3: Family */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Family Situation</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Status
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.familyStatus || ''}
              onChange={(e) => updateProfile('familyStatus', e.target.value)}
            >
              <option value="">Select status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Married with children">Married with children</option>
              <option value="Single parent">Single parent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Dependents
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.dependents || ''}
              onChange={(e) => updateProfile('dependents', parseInt(e.target.value))}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spouse Employment
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.spouseEmployment || ''}
              onChange={(e) => updateProfile('spouseEmployment', e.target.value)}
            >
              <option value="">Select option</option>
              <option value="Not applicable">Not applicable</option>
              <option value="Currently employed">Currently employed</option>
              <option value="Seeking employment">Seeking employment</option>
              <option value="Stay-at-home parent">Stay-at-home parent</option>
              <option value="Student">Student</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 4: Location */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Location Preferences</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Location
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.currentLocation || ''}
              onChange={(e) => updateProfile('currentLocation', e.target.value)}
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Willing to Relocate?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="relocate"
                  className="mr-2"
                  checked={profile.willingToRelocate === true}
                  onChange={() => updateProfile('willingToRelocate', true)}
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="relocate"
                  className="mr-2"
                  checked={profile.willingToRelocate === false}
                  onChange={() => updateProfile('willingToRelocate', false)}
                />
                No
              </label>
            </div>
          </div>

          {profile.willingToRelocate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Locations
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a location (e.g., Austin, TX)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('preferredLocations', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.preferredLocations?.map((location) => (
                  <span
                    key={location}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {location}
                    <button
                      onClick={() => removeFromArray('preferredLocations', location)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Press Enter to add</p>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Goals */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Career Goals</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Goals
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              value={profile.careerGoals || ''}
              onChange={(e) => updateProfile('careerGoals', e.target.value)}
              placeholder="What kind of career are you looking for? What matters most to you?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Income Expectations
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.incomeExpectations || ''}
              onChange={(e) => updateProfile('incomeExpectations', e.target.value)}
            >
              <option value="">Select range</option>
              <option value="$40k-60k">$40k-60k</option>
              <option value="$60k-80k">$60k-80k</option>
              <option value="$80k-100k">$80k-100k</option>
              <option value="$100k+">$100k+</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest in Further Education
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.educationInterest || ''}
              onChange={(e) => updateProfile('educationInterest', e.target.value)}
            >
              <option value="">Select option</option>
              <option value="Not interested">Not interested</option>
              <option value="Short-term certifications">Short-term certifications (3-6 months)</option>
              <option value="Associate degree">Associate degree</option>
              <option value="Bachelor degree">Bachelor degree</option>
              <option value="Graduate degree">Graduate degree</option>
              <option value="Apprenticeship">Apprenticeship / Trade school</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline to Start Working
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.timeline || ''}
              onChange={(e) => updateProfile('timeline', e.target.value)}
            >
              <option value="">Select timeline</option>
              <option value="Immediate">Immediate (0-1 months)</option>
              <option value="Short-term">Short-term (1-3 months)</option>
              <option value="Medium-term">Medium-term (3-6 months)</option>
              <option value="Long-term">Long-term (6+ months)</option>
            </select>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Generate Career Pathways
          </button>
        )}
      </div>
    </div>
  );
}
