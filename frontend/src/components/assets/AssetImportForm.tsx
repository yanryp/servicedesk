import React, { useState } from 'react';
import { FiX, FiUpload, FiDownload, FiFileText } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AssetImportFormProps {
  onImport: (data: any) => void;
  onClose: () => void;
}

const AssetImportForm: React.FC<AssetImportFormProps> = ({ onImport, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file to import');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/assets/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(uploadInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        await onImport(result);
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      console.error('Error importing assets:', error);
      alert('Import failed. Please check the file format and try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = `Asset Name,Asset Type,Serial Number,Model,Manufacturer,Status,Condition,Location,Purchase Price,Purchase Date,Warranty Expiry
BSG Server 01,Server,SRV-001,Dell R750,Dell Technologies,active,excellent,UTAMA,15000,2023-01-15,2026-01-15
ATM Machine 01,ATM Machine,ATM-001,NCR SelfServ 23,NCR Corporation,active,good,UTAMA,25000,2023-02-01,2026-02-01
Network Switch 01,Network Switch,SW-001,Cisco C9300,Cisco Systems,active,excellent,UTAMA,8000,2023-03-01,2026-03-01`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FiUpload size={16} />
            <span>Import Assets</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FiX size={16} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Import Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload a CSV file with asset information</li>
              <li>• Download the template below to see the required format</li>
              <li>• Make sure all required fields are filled</li>
              <li>• Date format should be YYYY-MM-DD</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FiFileText size={16} />
              <div>
                <h3 className="font-medium">Download Template</h3>
                <p className="text-sm text-gray-600">Get the CSV template with sample data</p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <FiDownload size={16} />
              Download
            </Button>
          </div>

          {/* File Upload */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading}
                required
              />
              {file && (
                <p className="text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!file || isUploading}>
                {isUploading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Import Assets
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Supported Fields */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Supported Fields</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <strong>Required:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Asset Name</li>
                  <li>• Asset Type</li>
                  <li>• Status</li>
                  <li>• Condition</li>
                </ul>
              </div>
              <div>
                <strong>Optional:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Serial Number</li>
                  <li>• Model</li>
                  <li>• Manufacturer</li>
                  <li>• Location</li>
                  <li>• Purchase Price</li>
                  <li>• Purchase Date</li>
                  <li>• Warranty Expiry</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetImportForm;