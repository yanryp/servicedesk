import React, { useState } from 'react';
import { FiX, FiTool, FiSave } from 'react-icons/fi';
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

interface AssetMaintenanceFormProps {
  asset: Asset;
  onSave: (data: any) => void;
  onClose: () => void;
}

const AssetMaintenanceForm: React.FC<AssetMaintenanceFormProps> = ({ asset, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    maintenanceType: 'preventive',
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    cost: '',
    performedBy: '',
    notes: '',
    nextScheduledDate: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const maintenanceData = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        nextScheduledDate: formData.nextScheduledDate || null
      };

      await onSave(maintenanceData);
    } catch (error) {
      console.error('Error creating maintenance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const maintenanceTypes = [
    { value: 'preventive', label: 'Preventive Maintenance' },
    { value: 'corrective', label: 'Corrective Maintenance' },
    { value: 'predictive', label: 'Predictive Maintenance' },
    { value: 'emergency', label: 'Emergency Repair' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'calibration', label: 'Calibration' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FiTool size={20} />
            <span>Schedule Maintenance: {asset.name}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FiX size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maintenanceType">Maintenance Type *</Label>
                <Select value={formData.maintenanceType} onValueChange={(value: string) => setFormData(prev => ({ ...prev, maintenanceType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenanceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter maintenance title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the maintenance work to be performed"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="performedBy">Performed By</Label>
                <Input
                  id="performedBy"
                  value={formData.performedBy}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, performedBy: e.target.value }))}
                  placeholder="Technician or company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextScheduledDate">Next Scheduled Date</Label>
              <Input
                id="nextScheduledDate"
                type="date"
                value={formData.nextScheduledDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, nextScheduledDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter any additional notes or special instructions"
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
                    Scheduling...
                  </>
                ) : (
                  <>
                    <span className="mr-2"><FiSave size={16} /></span>
                    Schedule Maintenance
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

export default AssetMaintenanceForm;