import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';

interface SlaPolicy {
  id: number;
  name: string;
  description?: string;
  serviceCatalogId?: number;
  serviceItemId?: number;
  departmentId?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  businessHoursOnly: boolean;
  escalationMatrix?: any;
  notificationRules?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  serviceCatalog?: { name: string };
  serviceItem?: { name: string };
  department?: { name: string };
}

interface Department {
  id: number;
  name: string;
}

interface ServiceCatalog {
  id: number;
  name: string;
}

interface ServiceItem {
  id: number;
  name: string;
  serviceCatalogId: number;
}

const SLAPolicyPage: React.FC = () => {
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [serviceCatalogs, setServiceCatalogs] = useState<ServiceCatalog[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SlaPolicy | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serviceCatalogId: '',
    serviceItemId: '',
    departmentId: '',
    priority: '',
    responseTimeMinutes: 60,
    resolutionTimeMinutes: 480,
    businessHoursOnly: true,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [policiesRes, departmentsRes, catalogsRes, itemsRes] = await Promise.all([
        api.get<SlaPolicy[]>('/sla-policies'),
        api.get<Department[]>('/departments'),
        api.get<ServiceCatalog[]>('/service-catalog'),
        api.get<ServiceItem[]>('/service-items')
      ]);

      setPolicies(policiesRes);
      setDepartments(departmentsRes);
      setServiceCatalogs(catalogsRes);
      setServiceItems(itemsRes);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        serviceCatalogId: formData.serviceCatalogId ? parseInt(formData.serviceCatalogId) : null,
        serviceItemId: formData.serviceItemId ? parseInt(formData.serviceItemId) : null,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        priority: formData.priority || null
      };

      if (editingPolicy) {
        await api.put(`/sla-policies/${editingPolicy.id}`, payload);
      } else {
        await api.post('/sla-policies', payload);
      }

      setShowForm(false);
      setEditingPolicy(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save SLA policy');
    }
  };

  const handleEdit = (policy: SlaPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description || '',
      serviceCatalogId: policy.serviceCatalogId?.toString() || '',
      serviceItemId: policy.serviceItemId?.toString() || '',
      departmentId: policy.departmentId?.toString() || '',
      priority: policy.priority || '',
      responseTimeMinutes: policy.responseTimeMinutes,
      resolutionTimeMinutes: policy.resolutionTimeMinutes,
      businessHoursOnly: policy.businessHoursOnly,
      isActive: policy.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this SLA policy?')) return;
    
    try {
      await api.delete(`/sla-policies/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete SLA policy');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      serviceCatalogId: '',
      serviceItemId: '',
      departmentId: '',
      priority: '',
      responseTimeMinutes: 60,
      resolutionTimeMinutes: 480,
      businessHoursOnly: true,
      isActive: true
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading SLA policies...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SLA Policy Management</h1>
            <p className="text-gray-600">Configure service level agreements and response times</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingPolicy(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add SLA Policy
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPolicy ? 'Edit SLA Policy' : 'Add New SLA Policy'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Supporting Group</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">All Supporting Groups</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Catalog</label>
                  <select
                    value={formData.serviceCatalogId}
                    onChange={(e) => setFormData({ ...formData, serviceCatalogId: e.target.value, serviceItemId: '' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">All Services</option>
                    {serviceCatalogs.map(catalog => (
                      <option key={catalog.id} value={catalog.id}>{catalog.name}</option>
                    ))}
                  </select>
                </div>

                {formData.serviceCatalogId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Item</label>
                    <select
                      value={formData.serviceItemId}
                      onChange={(e) => setFormData({ ...formData, serviceItemId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">All Items</option>
                      {serviceItems
                        .filter(item => item.serviceCatalogId === parseInt(formData.serviceCatalogId))
                        .map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Response Time (minutes)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.responseTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, responseTimeMinutes: parseInt(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resolution Time (minutes)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.resolutionTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, resolutionTimeMinutes: parseInt(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="businessHoursOnly"
                    checked={formData.businessHoursOnly}
                    onChange={(e) => setFormData({ ...formData, businessHoursOnly: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="businessHoursOnly" className="ml-2 text-sm text-gray-700">
                    Calculate SLA during business hours only
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPolicy(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingPolicy ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Policies Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">SLA Policies ({policies.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resolution Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                      {policy.description && (
                        <div className="text-sm text-gray-500">{policy.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {policy.department?.name || 'All Supporting Groups'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {policy.serviceCatalog?.name || 'All Services'}
                      {policy.serviceItem && ` - ${policy.serviceItem.name}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {policy.priority ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(policy.priority)}`}>
                        {policy.priority.charAt(0).toUpperCase() + policy.priority.slice(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">All</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(policy.responseTimeMinutes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(policy.resolutionTimeMinutes)}
                    {policy.businessHoursOnly && (
                      <div className="text-xs text-gray-500">Business hours only</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      policy.isActive 
                        ? 'text-green-800 bg-green-100' 
                        : 'text-gray-800 bg-gray-100'
                    }`}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(policy)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {policies.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No SLA policies</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new SLA policy.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SLAPolicyPage;