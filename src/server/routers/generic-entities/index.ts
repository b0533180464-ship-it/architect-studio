import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  listEntitiesInput,
  getEntityByIdInput,
  createEntityInput,
  updateEntityInput,
  deleteEntityInput,
  bulkUpdateInput,
} from './schemas';
import { listEntities, getEntityById } from './queries';
import {
  createEntity,
  updateEntity,
  deleteEntity,
  bulkUpdate,
} from './mutations';

export const genericEntitiesRouter = createTRPCRouter({
  // List entities by type
  list: tenantProcedure
    .input(listEntitiesInput)
    .query(({ ctx, input }) => listEntities(ctx, input)),

  // Get entity by ID
  getById: tenantProcedure
    .input(getEntityByIdInput)
    .query(({ ctx, input }) => getEntityById(ctx, input)),

  // Create new entity
  create: tenantProcedure
    .input(createEntityInput)
    .mutation(({ ctx, input }) => createEntity(ctx, input)),

  // Update entity
  update: tenantProcedure
    .input(updateEntityInput)
    .mutation(({ ctx, input }) => updateEntity(ctx, input)),

  // Delete entity
  delete: tenantProcedure
    .input(deleteEntityInput)
    .mutation(({ ctx, input }) => deleteEntity(ctx, input)),

  // Bulk update
  bulkUpdate: tenantProcedure
    .input(bulkUpdateInput)
    .mutation(({ ctx, input }) => bulkUpdate(ctx, input)),
});
