import { createTRPCRouter } from '../../trpc';
import { listQuery, calendarQuery, todayQuery, upcomingQuery, getByIdQuery, getStatsQuery } from './queries';
import {
  createMutation, updateMutation, deleteMutation,
  confirmMutation, cancelMutation, completeMutation, rescheduleMutation,
  addFollowUpTaskMutation, sendInviteMutation,
} from './mutations';
import {
  createRecurringMutation, updateRecurrenceMutation,
  deleteRecurrenceMutation, deleteFutureOccurrencesMutation,
} from './recurrence';

export const meetingRouter = createTRPCRouter({
  // Queries
  list: listQuery,
  calendar: calendarQuery,
  today: todayQuery,
  upcoming: upcomingQuery,
  getById: getByIdQuery,
  getStats: getStatsQuery,

  // Basic mutations
  create: createMutation,
  update: updateMutation,
  delete: deleteMutation,
  confirm: confirmMutation,
  cancel: cancelMutation,
  complete: completeMutation,
  reschedule: rescheduleMutation,

  // Recurrence mutations
  createRecurring: createRecurringMutation,
  updateRecurrence: updateRecurrenceMutation,
  deleteRecurrence: deleteRecurrenceMutation,
  deleteFutureOccurrences: deleteFutureOccurrencesMutation,

  // Follow-up and invites
  addFollowUpTask: addFollowUpTaskMutation,
  sendInvite: sendInviteMutation,
});
