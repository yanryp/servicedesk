// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, UserPlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { RegisterRequest } from '../types';
import { departmentService, authService } from '../services';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
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
        console.error('Failed to load supporting groups:', error);
        toast.error('Failed to load supporting groups');
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  // Load branches when needed (for branch-assigned roles)
  useEffect(() => {
    const loadBranches = async () => {
      if (selectedRole !== 'requester' && selectedRole !== 'manager' && selectedRole !== 'technician') {
        setBranches([]);
        return;
      }

      setLoadingBranches(true);
      try {
        const branches = await authService.getAllBranches();
        setBranches(branches || []);
      } catch (error) {
        console.error('Failed to load branches:', error);
        toast.error('Failed to load branches');
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, [selectedRole]);

  // Redirect if not admin or not authenticated
  if (!isAuthenticated || user?.role !== 'admin') {
    navigate('/');
    return null;
  }

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...registerData } = data;
      
      // Convert numeric fields
      const enhancedData = {
        ...registerData,
        departmentId: registerData.departmentId ? parseInt(registerData.departmentId.toString()) : undefined,
        unitId: registerData.unitId ? parseInt(registerData.unitId.toString()) : undefined,
        managerId: registerData.managerId ? parseInt(registerData.managerId.toString()) : undefined,
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

  // Determine what assignment fields to show based on role
  const getAssignmentHelperText = (role: string) => {
    switch (role) {
      case 'requester':
        return 'Requesters must be assigned to a specific branch where they work.';
      case 'manager':
        return 'Managers must be assigned to a specific branch they oversee and will automatically get approval authority.';
      case 'technician':
        return 'Technicians can be assigned to a department (serve all branches) or a specific branch.';
      case 'admin':
        return 'Admins are typically assigned to IT Operations department with system-wide access.';
      default:
        return '';
    }
  };

  const shouldShowBranchField = (role: string) => {
    return role === 'requester' || role === 'manager' || role === 'technician';
  };

  const shouldShowDepartmentField = (role: string) => {
    return role === 'technician' || role === 'admin';
  };

  const isBranchRequired = (role: string) => {
    return role === 'requester' || role === 'manager';
  };

  const isDepartmentRequired = (role: string) => {
    return role === 'admin';
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8">
      <div className="max-w-2xl w-full space-y-8">
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

        <div className="bg-white/80 backdrop-blur-sm py-8 px-8 shadow-xl rounded-2xl border border-slate-200/50">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register('name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 3,
                    message: 'Full name must be at least 3 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z\s.]+$/,
                    message: 'Name can only contain letters, spaces, and dots',
                  },
                })}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                placeholder="Ahmad Budi Santoso"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
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
                    value: /^[a-zA-Z0-9_.]+$/,
                    message: 'Username can only contain letters, numbers, dots, and underscores',
                  },
                })}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                placeholder="budi.manager.kotamobagu"
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
                placeholder="budi.manager@bsg.co.id"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Role Selection */}
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
                <option value="manager">Manager - Approve tickets and oversee team</option>
                <option value="technician">Technician - Resolve and manage tickets</option>
                <option value="admin">Admin - Full system access and management</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Assignment Section */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                Assignment
              </h3>
              <p className="text-sm text-blue-700">
                {getAssignmentHelperText(selectedRole)}
              </p>

              <div className="grid grid-cols-1 gap-4">
                {/* Branch Assignment */}
                {shouldShowBranchField(selectedRole) && (
                  <div>
                    <label htmlFor="unitId" className="block text-sm font-medium text-slate-700">
                      Branch {isBranchRequired(selectedRole) ? '*' : '(Optional)'}
                    </label>
                    <select
                      id="unitId"
                      {...register('unitId', { 
                        required: isBranchRequired(selectedRole) ? 'Branch selection is required for this role' : false 
                      })}
                      disabled={isSubmitting || loadingBranches}
                      className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => {
                        // Remove "Kantor" prefix and simplify branch display name
                        let simpleName = branch.displayName || branch.name;
                        // Remove "Kantor Cabang" and "Kantor Cabang Pembantu" prefixes
                        simpleName = simpleName.replace(/^Kantor Cabang Pembantu\s+/, '');
                        simpleName = simpleName.replace(/^Kantor Cabang\s+/, '');
                        return (
                          <option key={branch.id} value={branch.id}>
                            {simpleName}
                          </option>
                        );
                      })}
                    </select>
                    {errors.unitId && (
                      <p className="mt-1 text-sm text-red-600">{errors.unitId.message}</p>
                    )}
                    {loadingBranches && (
                      <p className="mt-1 text-xs text-blue-600">Loading BSG branches...</p>
                    )}
                  </div>
                )}

                {/* Department Assignment */}
                {shouldShowDepartmentField(selectedRole) && (
                  <div>
                    <label htmlFor="departmentId" className="block text-sm font-medium text-slate-700">
                      Supporting Group {isDepartmentRequired(selectedRole) ? '*' : '(Optional)'}
                    </label>
                    <select
                      id="departmentId"
                      {...register('departmentId', { 
                        required: isDepartmentRequired(selectedRole) ? 'Supporting Group selection is required for this role' : false 
                      })}
                      disabled={isSubmitting || loadingDepartments}
                      className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-slate-100 transition-all duration-200"
                    >
                      <option value="">Select Supporting Group</option>
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
                      <p className="mt-1 text-xs text-blue-600">Loading supporting groups...</p>
                    )}
                  </div>
                )}
              </div>

              {/* Auto-Applied Settings Info */}
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Automatically applied settings:</p>
                {selectedRole === 'manager' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Business Reviewer privileges (can approve tickets)</li>
                    <li>Default workload capacity: 20 tickets</li>
                    <li>KASDA access (if assigned to branch)</li>
                  </ul>
                )}
                {selectedRole === 'technician' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Default workload capacity: 10 tickets</li>
                    <li>Skills based on department assignment</li>
                    <li>Intermediate experience level</li>
                    <li>KASDA access (if assigned to branch)</li>
                  </ul>
                )}
                {selectedRole === 'admin' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Full business reviewer privileges</li>
                    <li>System administration skills</li>
                    <li>High workload capacity: 50 tickets</li>
                  </ul>
                )}
                {selectedRole === 'requester' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>KASDA access (based on branch assignment)</li>
                    <li>Ticket submission and tracking privileges</li>
                  </ul>
                )}
              </div>
            </div>

            {/* Password Fields */}
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