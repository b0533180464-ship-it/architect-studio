import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  listFieldsSchema,
  createFieldSchema,
  updateFieldSchema,
  deleteFieldSchema,
  reorderFieldsSchema,
} from './schemas';
import { listFields } from './queries';
import { createField, updateField, deleteField, reorderFields } from './mutations';

export const genericEntityFieldsRouter = createTRPCRouter({
  list: tenantProcedure
    .input(listFieldsSchema)
    .query(({ ctx, input }) => listFields(ctx, input)),

  create: tenantProcedure
    .input(createFieldSchema)
    .mutation(({ ctx, input }) => createField(ctx, input)),

  update: tenantProcedure
    .input(updateFieldSchema)
    .mutation(({ ctx, input }) => updateField(ctx, input)),

  delete: tenantProcedure
    .input(deleteFieldSchema)
    .mutation(({ ctx, input }) => deleteField(ctx, input)),

  reorder: tenantProcedure
    .input(reorderFieldsSchema)
    .mutation(({ ctx, input }) => reorderFields(ctx, input)),
});
