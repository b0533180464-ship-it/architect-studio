import { createTRPCRouter } from '../../trpc';
import { listQuery, myTasksQuery, overdueQuery, todayQuery, getByIdQuery, getStatsQuery } from './queries';
import {
  createMutation, updateMutation, deleteMutation, completeMutation,
  reopenMutation, assignMutation, updateChecklistMutation,
  updateStatusMutation, bulkUpdateStatusMutation,
  bulkCreateMutation, bulkDeleteMutation, addReminderMutation, removeReminderMutation,
} from './mutations';

export const taskRouter = createTRPCRouter({
  // Queries
  list: listQuery,
  myTasks: myTasksQuery,
  overdue: overdueQuery,
  today: todayQuery,
  getById: getByIdQuery,
  getStats: getStatsQuery,

  // Mutations
  create: createMutation,
  update: updateMutation,
  delete: deleteMutation,
  complete: completeMutation,
  reopen: reopenMutation,
  assign: assignMutation,
  updateChecklist: updateChecklistMutation,
  updateStatus: updateStatusMutation,
  bulkUpdateStatus: bulkUpdateStatusMutation,
  bulkCreate: bulkCreateMutation,
  bulkDelete: bulkDeleteMutation,
  addReminder: addReminderMutation,
  removeReminder: removeReminderMutation,
});
