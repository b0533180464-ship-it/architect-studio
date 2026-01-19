import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  listRelationDefsSchema,
  getRelationDefByIdSchema,
  createRelationDefSchema,
  updateRelationDefSchema,
  deleteRelationDefSchema,
  listEntityRelationsSchema,
  addEntityRelationSchema,
  removeEntityRelationSchema,
  reorderEntityRelationsSchema,
} from './schemas';
import { listRelationDefs, getRelationDefById, listEntityRelations } from './queries';
import {
  createRelationDef,
  updateRelationDef,
  deleteRelationDef,
  addEntityRelation,
  removeEntityRelation,
  reorderEntityRelations,
} from './mutations';

export const relationsRouter = createTRPCRouter({
  // Relation Definitions
  listDefs: tenantProcedure
    .input(listRelationDefsSchema)
    .query(({ ctx, input }) => listRelationDefs(ctx, input)),

  getDefById: tenantProcedure
    .input(getRelationDefByIdSchema)
    .query(({ ctx, input }) => getRelationDefById(ctx, input)),

  createDef: tenantProcedure
    .input(createRelationDefSchema)
    .mutation(({ ctx, input }) => createRelationDef(ctx, input)),

  updateDef: tenantProcedure
    .input(updateRelationDefSchema)
    .mutation(({ ctx, input }) => updateRelationDef(ctx, input)),

  deleteDef: tenantProcedure
    .input(deleteRelationDefSchema)
    .mutation(({ ctx, input }) => deleteRelationDef(ctx, input)),

  // Entity Relations
  listRelations: tenantProcedure
    .input(listEntityRelationsSchema)
    .query(({ ctx, input }) => listEntityRelations(ctx, input)),

  addRelation: tenantProcedure
    .input(addEntityRelationSchema)
    .mutation(({ ctx, input }) => addEntityRelation(ctx, input)),

  removeRelation: tenantProcedure
    .input(removeEntityRelationSchema)
    .mutation(({ ctx, input }) => removeEntityRelation(ctx, input)),

  reorderRelations: tenantProcedure
    .input(reorderEntityRelationsSchema)
    .mutation(({ ctx, input }) => reorderEntityRelations(ctx, input)),
});
