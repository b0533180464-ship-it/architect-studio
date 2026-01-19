import { createTRPCRouter } from '../../trpc';
import { listQuery, getByIdQuery, getByTokenQuery, getStatsQuery } from './queries';
import {
  createMutation,
  updateMutation,
  deleteMutation,
  sendMutation,
  approveMutation,
  rejectMutation,
  newVersionMutation,
  duplicateMutation,
} from './mutations';

export const proposalRouter = createTRPCRouter({
  // Queries
  list: listQuery,
  getById: getByIdQuery,
  getByToken: getByTokenQuery,
  getStats: getStatsQuery,

  // Mutations
  create: createMutation,
  update: updateMutation,
  delete: deleteMutation,
  send: sendMutation,
  approve: approveMutation,
  reject: rejectMutation,
  newVersion: newVersionMutation,
  duplicate: duplicateMutation,
});
