import React, { useState, useEffect } from 'react';
import { FiX, FiArrowRight, FiSave } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Asset {
  id: number;
  name: string;
  assetTag: string;
}

interface AssetTransferFormProps {
  asset: Asset;
  onTransfer: (data: any) => void;
  onClose: () => void;
}

const AssetTransferForm: React.FC<AssetTransferFormProps> = ({ asset, onTransfer, onClose }) => {
  const [formData, setFormData] = useState({
    transferType: 'assignment',
    toUserId: '',
    toLocationId: '',
    toDeptId: '',
    transferDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: ''
  });

  const [locations, setLocations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    setIsLoading(true);
    try {
      const [locationsRes, usersRes, depsRes] = await Promise.all([
        fetch('/api/units', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/departments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(locationsData.data);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data);
      }

      if (depsRes.ok) {
        const depsData = await depsRes.json();
        setDepartments(depsData.data);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const transferData = {
        ...formData,
        toUserId: formData.toUserId ? parseInt(formData.toUserId) : null,
        toLocationId: formData.toLocationId ? parseInt(formData.toLocationId) : null,
        toDeptId: formData.toDeptId ? parseInt(formData.toDeptId) : null
      };

      await onTransfer(transferData);
    } catch (error) {
      console.error('Error creating transfer:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const transferTypes = [
    { value: 'assignment', label: 'Assignment Change' },
    { value: 'location', label: 'Location Change' },
    { value: 'department', label: 'Department Transfer' },
    { value: 'permanent', label: 'Permanent Transfer' }
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FiArrowRight size={20} />
            <span>Transfer Asset: {asset.name}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FiX size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transferType">Transfer Type *</Label>
              <Select value={formData.transferType} onValueChange={(value: string) => setFormData(prev => ({ ...prev, transferType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transferTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="toLocationId">To Location</Label>
                <Select value={formData.toLocationId} onValueChange={(value: string) => setFormData(prev => ({ ...prev, toLocationId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toUserId">To User</Label>
                <Select value={formData.toUserId} onValueChange={(value: string) => setFormData(prev => ({ ...prev, toUserId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="toDeptId">To Department</Label>
                <Select value={formData.toDeptId} onValueChange={(value: string) => setFormData(prev => ({ ...prev, toDeptId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferDate">Transfer Date *</Label>
                <Input
                  id="transferDate"
                  type="date"
                  value={formData.transferDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Transfer *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter reason for transfer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Creating Transfer...
                  </>
                ) : (
                  <>
                    <span className="mr-2"><FiSave size={16} /></span>
                    Create Transfer Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetTransferForm;