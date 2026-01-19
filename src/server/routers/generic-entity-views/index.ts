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
import { listViews, getViewById } from './queries';
import {
  createView,
  updateView,
  deleteView,
  duplicateView,
  setDefaultView,
} from './mutations';

export const genericEntityViewsRouter = createTRPCRouter({
  list: tenantProcedure.input(listViewsSchema).query(({ ctx, input }) => listViews(ctx, input)),

  getById: tenantProcedure.input(getViewByIdSchema).query(({ ctx, input }) => getViewById(ctx, input)),

  create: tenantProcedure.input(createViewSchema).mutation(({ ctx, input }) => createView(ctx, input)),

  update: tenantProcedure.input(updateViewSchema).mutation(({ ctx, input }) => updateView(ctx, input)),

  delete: tenantProcedure.input(deleteViewSchema).mutation(({ ctx, input }) => deleteView(ctx, input)),

  duplicate: tenantProcedure.input(duplicateViewSchema).mutation(({ ctx, input }) => duplicateView(ctx, input)),

  setDefault: tenantProcedure.input(setDefaultViewSchema).mutation(({ ctx, input }) => setDefaultView(ctx, input)),
});
