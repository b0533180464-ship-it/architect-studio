import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  listViewsSchema,
  getViewByIdSchema,
  createViewSchema,
  updateViewSchema,
  deleteViewSchema,
  duplicateViewSchema,
  setDefaultViewSchema,
} from './schemas';
import { listViews, getViewById, getDefaultView } from './queries';
import {
  createView,
  updateView,
  deleteView,
  duplicateView,
  setDefaultView,
  quickSaveView,
} from './mutations';

export const viewsRouter = createTRPCRouter({
  // List views for entity type (user's own + shared)
  list: tenantProcedure
    .input(listViewsSchema)
    .query(({ ctx, input }) => listViews(ctx, input)),

  // Get view by ID
  getById: tenantProcedure
    .input(getViewByIdSchema)
    .query(({ ctx, input }) => getViewById(ctx, input)),

  // Get default view for entity type (or null)
  getDefault: tenantProcedure
    .input(listViewsSchema.pick({ entityType: true }))
    .query(({ ctx, input }) => getDefaultView(ctx, input)),

  // Create view
  create: tenantProcedure
    .input(createViewSchema)
    .mutation(({ ctx, input }) => createView(ctx, input)),

  // Update view
  update: tenantProcedure
    .input(updateViewSchema)
    .mutation(({ ctx, input }) => updateView(ctx, input)),

  // Delete view
  delete: tenantProcedure
    .input(deleteViewSchema)
    .mutation(({ ctx, input }) => deleteView(ctx, input)),

  // Duplicate view
  duplicate: tenantProcedure
    .input(duplicateViewSchema)
    .mutation(({ ctx, input }) => duplicateView(ctx, input)),

  // Set default view for entity type
  setDefault: tenantProcedure
    .input(setDefaultViewSchema)
    .mutation(({ ctx, input }) => setDefaultView(ctx, input)),

  // Quick save - update columns/filters without full form
  quickSave: tenantProcedure
    .input(updateViewSchema.pick({
      id: true,
      columns: true,
      sortBy: true,
      sortOrder: true,
      filters: true,
      groupBy: true,
    }))
    .mutation(({ ctx, input }) => quickSaveView(ctx, input)),
});
