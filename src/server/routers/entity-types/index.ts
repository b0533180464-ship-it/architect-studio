import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  listEntityTypesInput,
  getEntityTypeByIdInput,
  getEntityTypeBySlugInput,
  createEntityTypeInput,
  updateEntityTypeInput,
  deleteEntityTypeInput,
} from './schemas';
import {
  listEntityTypes,
  getEntityTypeById,
  getEntityTypeBySlug,
} from './queries';
import {
  createEntityType,
  updateEntityType,
  deleteEntityType,
} from './mutations';

export const entityTypesRouter = createTRPCRouter({
  // List all entity types
  list: tenantProcedure
    .input(listEntityTypesInput)
    .query(({ ctx, input }) => listEntityTypes(ctx, input)),

  // Get entity type by ID
  getById: tenantProcedure
    .input(getEntityTypeByIdInput)
    .query(({ ctx, input }) => getEntityTypeById(ctx, input)),

  // Get entity type by slug
  getBySlug: tenantProcedure
    .input(getEntityTypeBySlugInput)
    .query(({ ctx, input }) => getEntityTypeBySlug(ctx, input)),

  // Create new entity type
  create: tenantProcedure
    .input(createEntityTypeInput)
    .mutation(({ ctx, input }) => createEntityType(ctx, input)),

  // Update entity type
  update: tenantProcedure
    .input(updateEntityTypeInput)
    .mutation(({ ctx, input }) => updateEntityType(ctx, input)),

  // Delete entity type
  delete: tenantProcedure
    .input(deleteEntityTypeInput)
    .mutation(({ ctx, input }) => deleteEntityType(ctx, input)),
});
