import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  ClockIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { Card, LoadingSpinner, EmptyState, Button } from '../../components/ui';
import SupportingGroupEditor from '../../components/admin/SupportingGroupEditor';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface SupportingGroup {
  id: number;
  name: string;
  description: string;
  departmentType: string;
  isServiceOwner: boolean;
  userCount: number;
  technicianCount: number;
  activeTickets: number;
  avgResolutionTime: number;
  createdAt: string;
  updatedAt: string;
  serviceCatalogs?: Array<{
    id: number;
    name: string;
    itemCount: number;
  }>;
  totalServiceItems?: number;
}

interface SupportingGroupsPageProps {}

const SupportingGroupsPage: React.FC<SupportingGroupsPageProps> = () => {
  const [supportingGroups, setSupportingGroups] = useState<SupportingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<SupportingGroup | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchSupportingGroups();
  }, []);

  const fetchSupportingGroups = async () => {
    try {
      setLoading(true);
      
      // Get basic departments list first
      const departments = await api.get('/departments');
      
      // Fetch detailed information for each department including users and service catalogs
      const groupsWithMetrics = await Promise.all(
        departments.map(async (dept: any) => {
          let detailedDept = dept;
          let serviceCatalogs: Array<{
            id: number;
            name: string;
            itemCount: number;
          }> = [];
          
          try {
            // Fetch detailed department data including users
            detailedDept = await api.get(`/departments/${dept.id}`);
          } catch (error) {
            console.warn(`Failed to fetch detailed data for department ${dept.id}:`, error);
          }
          
          // Calculate user metrics from the detailed department data
          const users = detailedDept.users || [];
          const technicianCount = users.filter((user: any) => user.role === 'technician').length;
          const userCount = users.length;
          
          // Fetch actual service catalogs managed by this department
          try {
            serviceCatalogs = await api.get(`/departments/${dept.id}/service-catalogs`);
          } catch (error) {
            console.warn(`Failed to fetch service catalogs for department ${dept.id}:`, error);
            serviceCatalogs = [];
          }
          
          // Calculate total service items from actual service catalogs
          const totalServiceItems = serviceCatalogs.reduce((total: number, catalog: any) => {
            return total + (catalog.itemCount || 0);
          }, 0);
          
          // Fetch metrics (active tickets, resolution time)
          let metrics = {
            activeTickets: 0,
            avgResolutionTime: 0,
            resolvedTicketsLast30Days: 0
          };
          
          try {
            metrics = await api.get(`/departments/${dept.id}/metrics`);
          } catch (error) {
            console.warn(`Failed to fetch metrics for department ${dept.id}:`, error);
          }
          
          return {
            id: dept.id,
            name: dept.name,
            description: dept.description || '',
            departmentType: dept.departmentType || 'support',
            isServiceOwner: dept.isServiceOwner || false,
            userCount,
            technicianCount,
            activeTickets: metrics.activeTickets,
            avgResolutionTime: metrics.avgResolutionTime,
            createdAt: dept.createdAt || new Date().toISOString(),
            updatedAt: dept.updatedAt || new Date().toISOString(),
            serviceCatalogs,
            totalServiceItems
          };
        })
      );

      setSupportingGroups(groupsWithMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setShowCreateModal(true);
  };

  const handleEditGroup = (group: SupportingGroup) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  const handleSaveGroup = async (groupData: any) => {
    const payload = {
      name: groupData.name,
      description: groupData.description,
      departmentType: groupData.departmentType,
      isServiceOwner: groupData.isServiceOwner
    };

    if (groupData.id) {
      await api.put(`/departments/${groupData.id}`, payload);
    } else {
      await api.post('/departments', payload);
    }

    await fetchSupportingGroups();
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!window.confirm('Are you sure you want to delete this supporting group?')) {
      return;
    }

    try {
      await api.delete(`/departments/${groupId}`);
      await fetchSupportingGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete supporting group');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supporting Groups</h1>
            <p className="text-gray-600">Manage technical support teams and their assignments</p>
          </div>
        </div>

        <Button
          onClick={handleCreateGroup}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Supporting Group</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{supportingGroups.length}</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Technicians</p>
              <p className="text-2xl font-bold text-gray-900">
                {supportingGroups.reduce((sum, group) => sum + group.technicianCount, 0)}
              </p>
            </div>
            <UsersIcon className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {supportingGroups.reduce((sum, group) => sum + group.activeTickets, 0)}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Service Owners</p>
              <p className="text-2xl font-bold text-gray-900">
                {supportingGroups.filter(group => group.isServiceOwner).length}
              </p>
            </div>
            <CogIcon className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Service Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {supportingGroups.reduce((sum, group) => sum + (group.totalServiceItems || 0), 0)}
              </p>
            </div>
            <RectangleStackIcon className="w-8 h-8 text-indigo-500" />
          </div>
        </Card>
      </div>

      {/* Supporting Groups List */}
      {supportingGroups.length === 0 ? (
        <EmptyState
          icon={UserGroupIcon}
          title="No Supporting Groups"
          description="Get started by creating your first supporting group"
          action={{
            label: "Add Supporting Group",
            onClick: handleCreateGroup,
            variant: "primary"
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {supportingGroups.map((group) => (
            <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{group.departmentType}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Group"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Group"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {group.description && (
                <p className="text-sm text-gray-600 mb-4">{group.description}</p>
              )}

              {/* Service Catalogs */}
              {group.serviceCatalogs && group.serviceCatalogs.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Managed Services</h4>
                  <div className="space-y-1">
                    {group.serviceCatalogs.slice(0, 3).map((catalog) => (
                      <div key={catalog.id} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                        <span className="text-gray-700 truncate">{catalog.name}</span>
                        <span className="text-gray-500 ml-2">{catalog.itemCount} items</span>
                      </div>
                    ))}
                    {group.serviceCatalogs.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{group.serviceCatalogs.length - 3} more services
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Show message if no service catalogs */}
              {(!group.serviceCatalogs || group.serviceCatalogs.length === 0) && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Managed Services</h4>
                  <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                    No service catalogs assigned
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{group.technicianCount}</p>
                  <p className="text-xs text-gray-500">Technicians</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{group.activeTickets}</p>
                  <p className="text-xs text-gray-500">Active Tickets</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>Avg: {group.avgResolutionTime}h</span>
                </div>
                {group.isServiceOwner && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Service Owner
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                  <span>Updated {new Date(group.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Supporting Group Modal */}
      <SupportingGroupEditor
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveGroup}
        mode="create"
      />

      {/* Edit Supporting Group Modal */}
      <SupportingGroupEditor
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveGroup}
        group={selectedGroup}
        mode="edit"
      />
    </div>
  );
};

export default SupportingGroupsPage;