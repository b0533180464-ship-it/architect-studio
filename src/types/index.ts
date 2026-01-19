// Base types for the application
// Will be expanded as we build features

export type BusinessType = 'interior_design' | 'architecture' | 'both';

export interface BaseEntity {
  id: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WithTimestamps {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
