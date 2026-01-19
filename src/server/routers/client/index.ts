import { createTRPCRouter } from '../../trpc';
import {
  listQuery, getByIdQuery, getProjectsQuery, getCitiesQuery, searchQuery, getCommunicationsQuery,
} from './queries';
import { createMutation, updateMutation, deleteMutation } from './mutations';

export const clientRouter = createTRPCRouter({
  // Queries
  list: listQuery,
  getById: getByIdQuery,
  getProjects: getProjectsQuery,
  getCities: getCitiesQuery,
  search: searchQuery,
  getCommunications: getCommunicationsQuery,

  // Mutations
  create: createMutation,
  update: updateMutation,
  delete: deleteMutation,
});
