export interface ServiceCatalog {
  id: number;
  name: string;
  description: string | null;
  serviceType?: string;
  categoryLevel?: number;
  parentId?: number | null;
  departmentId: number;
  department?: {
    id: number;
    name: string;
  } | null;
  isActive: boolean;
  requiresApproval?: boolean;
  estimatedTime?: number | null;
  businessImpact?: string;
  statistics: {
    serviceItemCount: number;
    templateCount: number;
    visibleTemplateCount: number;
  };
  createdAt: string;
  updatedAt: string;
}