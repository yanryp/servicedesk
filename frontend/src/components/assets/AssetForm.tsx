import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiPackage, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  description?: string;
  assetTypeId: number;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  status: string;
  condition: string;
  locationId?: number;
  assignedToUserId?: number;
  assignedToDeptId?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  depreciationRate?: number;
  vendorId?: number;
  purchaseOrderNum?: string;
  deploymentDate?: string;
  notes?: string;
  assetAttributes?: any[];
}

interface AssetType {
  id: number;
  name: string;
  category: string;
  assetAttributes?: any[];
}

interface AssetFormProps {
  asset?: Asset | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ asset, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assetTypeId: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    status: 'received',
    condition: 'new',
    locationId: '',
    assignedToUserId: '',
    assignedToDeptId: '',
    purchasePrice: '',
    purchaseDate: '',
    warrantyExpiry: '',
    depreciationRate: '',
    vendorId: '',
    purchaseOrderNum: '',
    deploymentDate: '',
    notes: '',
    assetAttributes: [] as any[]
  });

  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        description: asset.description || '',
        assetTypeId: asset.assetTypeId?.toString() || '',
        serialNumber: asset.serialNumber || '',
        model: asset.model || '',
        manufacturer: asset.manufacturer || '',
        status: asset.status || 'received',
        condition: asset.condition || 'new',
        locationId: asset.locationId?.toString() || '',
        assignedToUserId: asset.assignedToUserId?.toString() || '',
        assignedToDeptId: asset.assignedToDeptId?.toString() || '',
        purchasePrice: asset.purchasePrice?.toString() || '',
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
        warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : '',
        depreciationRate: asset.depreciationRate?.toString() || '',
        vendorId: asset.vendorId?.toString() || '',
        purchaseOrderNum: asset.purchaseOrderNum || '',
        deploymentDate: asset.deploymentDate ? asset.deploymentDate.split('T')[0] : '',
        notes: asset.notes || '',
        assetAttributes: asset.assetAttributes || []
      });
    }
  }, [asset]);

  const fetchFormData = async () => {
    setIsLoading(true);
    try {
      const [typesRes, locationsRes, usersRes, depsRes, vendorsRes] = await Promise.all([
        fetch('/api/assets/types', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/units', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/departments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/vendors', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setAssetTypes(typesData.data);
      }

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

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData.data);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssetTypeChange = (value: string) => {
    const assetType = assetTypes.find(t => t.id === parseInt(value));
    setSelectedAssetType(assetType || null);
    setFormData(prev => ({
      ...prev,
      assetTypeId: value,
      assetAttributes: assetType?.assetAttributes?.map(attr => ({
        attributeId: attr.id,
        value: ''
      })) || []
    }));
  };

  const handleAttributeChange = (attributeId: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      assetAttributes: prev.assetAttributes.map(attr =>
        attr.attributeId === attributeId ? { ...attr, value } : attr
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const dataToSave = {
        ...formData,
        assetTypeId: parseInt(formData.assetTypeId),
        locationId: formData.locationId ? parseInt(formData.locationId) : null,
        assignedToUserId: formData.assignedToUserId ? parseInt(formData.assignedToUserId) : null,
        assignedToDeptId: formData.assignedToDeptId ? parseInt(formData.assignedToDeptId) : null,
        vendorId: formData.vendorId ? parseInt(formData.vendorId) : null,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        depreciationRate: formData.depreciationRate ? parseFloat(formData.depreciationRate) : null,
        assetAttributes: formData.assetAttributes.filter(attr => attr.value.trim() !== '')
      };

      await onSave(dataToSave);
    } catch (error) {
      console.error('Error saving asset:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const statusOptions = [
    { value: 'received', label: 'Received' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' },
    { value: 'disposed', label: 'Disposed' }
  ];

  const conditionOptions = [
    { value: 'new', label: 'New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'non_functional', label: 'Non-functional' }
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FiPackage size={16} />
            <span>{asset ? 'Edit Asset' : 'Add New Asset'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FiX size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assetTypeId">Asset Type *</Label>
                <Select value={formData.assetTypeId} onValueChange={handleAssetTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor</Label>
                <Select value={formData.vendorId} onValueChange={(value: string) => setFormData(prev => ({ ...prev, vendorId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value: string) => setFormData(prev => ({ ...prev, condition: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location and Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locationId">Location</Label>
                <Select value={formData.locationId} onValueChange={(value: string) => setFormData(prev => ({ ...prev, locationId: value }))}>
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
                <Label htmlFor="assignedToUserId">Assigned To</Label>
                <Select value={formData.assignedToUserId} onValueChange={(value: string) => setFormData(prev => ({ ...prev, assignedToUserId: value }))}>
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

              <div className="space-y-2">
                <Label htmlFor="assignedToDeptId">Department</Label>
                <Select value={formData.assignedToDeptId} onValueChange={(value: string) => setFormData(prev => ({ ...prev, assignedToDeptId: value }))}>
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
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depreciationRate">Depreciation Rate (%)</Label>
                <Input
                  id="depreciationRate"
                  type="number"
                  step="0.1"
                  value={formData.depreciationRate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, depreciationRate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, warrantyExpiry: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseOrderNum">Purchase Order Number</Label>
                <Input
                  id="purchaseOrderNum"
                  value={formData.purchaseOrderNum}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, purchaseOrderNum: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deploymentDate">Deployment Date</Label>
                <Input
                  id="deploymentDate"
                  type="date"
                  value={formData.deploymentDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, deploymentDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Asset Type Attributes */}
            {selectedAssetType && selectedAssetType.assetAttributes && selectedAssetType.assetAttributes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAssetType.assetAttributes.map((attr) => (
                    <div key={attr.id} className="space-y-2">
                      <Label htmlFor={`attr_${attr.id}`}>
                        {attr.label} {attr.isRequired && '*'}
                      </Label>
                      {attr.fieldType === 'dropdown' && attr.options ? (
                        <Select 
                          value={formData.assetAttributes.find(a => a.attributeId === attr.id)?.value || ''}
                          onValueChange={(value: string) => handleAttributeChange(attr.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${attr.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {attr.options.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : attr.fieldType === 'textarea' ? (
                        <Textarea
                          id={`attr_${attr.id}`}
                          value={formData.assetAttributes.find(a => a.attributeId === attr.id)?.value || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAttributeChange(attr.id, e.target.value)}
                          required={attr.isRequired}
                        />
                      ) : (
                        <Input
                          id={`attr_${attr.id}`}
                          type={attr.fieldType === 'number' ? 'number' : attr.fieldType === 'date' ? 'date' : 'text'}
                          value={formData.assetAttributes.find(a => a.attributeId === attr.id)?.value || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAttributeChange(attr.id, e.target.value)}
                          required={attr.isRequired}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description and Notes */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    Save Asset
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

export default AssetForm;