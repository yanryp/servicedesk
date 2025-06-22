// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, UserPlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { RegisterRequest } from '../types';
import { departmentService } from '../services';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterRequest & { confirmPassword: string }>({
    defaultValues: {
      role: 'requester',
    },
  });

  const password = watch('password');
  const selectedRole = watch('role');

  // Load departments on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departments = await departmentService.getAllDepartments();
        setDepartments(departments || []);
      } catch (error) {
        console.error('Failed to load departments:', error);
        toast.error('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  // Redirect if not admin or not authenticated
  if (!isAuthenticated || user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...registerData } = data;
      
      // Convert departmentId to number and handle technician specialization
      const enhancedData = {
        ...registerData,
        departmentId: registerData.departmentId ? parseInt(registerData.departmentId.toString()) : undefined,
        // Add technician specialization if role is technician
        ...(registerData.role === 'technician' && {
          specialization: {
            primarySkill: registerData.primarySkill,
            experienceLevel: registerData.experienceLevel,
            secondarySkills: registerData.secondarySkills
          }
        })
      };

      await registerUser(enhancedData);
      toast.success(`User ${registerData.username} created successfully!`);
      
      // Reset form for creating another user
      reset();
    } catch (error) {
      // Error is handled by AuthContext and displayed via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
              <UserPlusIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="mt-2 text-slate-600">
            Create new user accounts for BSG Helpdesk system
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 shadow-xl rounded-2xl border border-slate-200/50">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores',
                  },
                })}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                placeholder="john.doe@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  id="role"
                  {...register('role', { required: 'Role is required' })}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                >
                  <option value="requester">Requester - Submit and track support tickets</option>
                  <option value="technician">Technician - Resolve and manage tickets</option>
                  <option value="manager">Manager - Approve tickets and oversee team</option>
                  <option value="admin">Admin - Full system access and management</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-slate-700">
                  Department *
                </label>
                <select
                  id="departmentId"
                  {...register('departmentId', { required: 'Department is required' })}
                  disabled={isSubmitting || loadingDepartments}
                  className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
                )}
                {loadingDepartments && (
                  <p className="mt-1 text-xs text-blue-600">Loading departments...</p>
                )}
              </div>
            </div>

            {/* Technician Specialization Fields */}
            {selectedRole === 'technician' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-900 flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                  Technician Specialization
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="primarySkill" className="block text-sm font-medium text-slate-700">
                      Primary Skill Area *
                    </label>
                    <select
                      id="primarySkill"
                      {...register('primarySkill', { 
                        required: selectedRole === 'technician' ? 'Primary skill is required for technicians' : false 
                      })}
                      disabled={isSubmitting}
                      className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                    >
                      <option value="">Select Primary Skill</option>
                      <option value="banking_systems">Banking Systems (Core Banking, OLIBS)</option>
                      <option value="network_infrastructure">Network & Infrastructure</option>
                      <option value="hardware_support">Hardware Support</option>
                      <option value="software_applications">Software Applications</option>
                      <option value="security_compliance">Security & Compliance</option>
                      <option value="database_administration">Database Administration</option>
                    </select>
                    {errors.primarySkill && (
                      <p className="mt-1 text-sm text-red-600">{errors.primarySkill.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-slate-700">
                      Experience Level *
                    </label>
                    <select
                      id="experienceLevel"
                      {...register('experienceLevel', { 
                        required: selectedRole === 'technician' ? 'Experience level is required for technicians' : false 
                      })}
                      disabled={isSubmitting}
                      className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                    >
                      <option value="">Select Experience Level</option>
                      <option value="junior">Junior (0-2 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                      <option value="expert">Expert/Lead (10+ years)</option>
                    </select>
                    {errors.experienceLevel && (
                      <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="secondarySkills" className="block text-sm font-medium text-slate-700">
                    Secondary Skills (Optional)
                  </label>
                  <textarea
                    id="secondarySkills"
                    rows={2}
                    {...register('secondarySkills')}
                    disabled={isSubmitting}
                    className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                    placeholder="Additional skills or certifications (e.g., AWS, Cisco, Microsoft, etc.)"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                    },
                  })}
                  disabled={isSubmitting}
                  className="block w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  'Create BSG Helpdesk Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
