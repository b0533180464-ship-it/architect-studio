import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  listNavigationSchema,
  getNavigationByIdSchema,
  createNavigationItemSchema,
  updateNavigationItemSchema,
  deleteNavigationItemSchema,
  reorderNavigationSchema,
  toggleVisibilitySchema,
  toggleCollapseSchema,
} from './schemas';
import { listNavigation, listNavigationTree, getNavigationById } from './queries';
import {
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  reorderNavigation,
  toggleVisibility,
  toggleCollapse,
} from './mutations';

export const navigationRouter = createTRPCRouter({
  // List all navigation items (flat)
  list: tenantProcedure
    .input(listNavigationSchema)
    .query(({ ctx, input }) => listNavigation(ctx, input)),

  // List as tree structure (for sidebar)
  tree: tenantProcedure
    .input(listNavigationSchema)
    .query(({ ctx, input }) => listNavigationTree(ctx, input)),

  // Get single item by ID
  getById: tenantProcedure
    .input(getNavigationByIdSchema)
    .query(({ ctx, input }) => getNavigationById(ctx, input)),

  // Create new item
  create: tenantProcedure
    .input(createNavigationItemSchema)
    .mutation(({ ctx, input }) => createNavigationItem(ctx, input)),

  // Update item
  update: tenantProcedure
    .input(updateNavigationItemSchema)
    .mutation(({ ctx, input }) => updateNavigationItem(ctx, input)),

  // Delete item
  delete: tenantProcedure
    .input(deleteNavigationItemSchema)
    .mutation(({ ctx, input }) => deleteNavigationItem(ctx, input)),

  // Reorder items (batch)
  reorder: tenantProcedure
    .input(reorderNavigationSchema)
    .mutation(({ ctx, input }) => reorderNavigation(ctx, input)),

  // Toggle visibility
  toggleVisibility: tenantProcedure
    .input(toggleVisibilitySchema)
    .mutation(({ ctx, input }) => toggleVisibility(ctx, input)),

  // Toggle collapse
  toggleCollapse: tenantProcedure
    .input(toggleCollapseSchema)
    .mutation(({ ctx, input }) => toggleCollapse(ctx, input)),
});
