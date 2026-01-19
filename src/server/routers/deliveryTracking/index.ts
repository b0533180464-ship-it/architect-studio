import { createTRPCRouter } from '../../trpc';
import {
  listDeliveryTracking,
  getDeliveryTrackingById,
  getOverdue,
  getExpectedThisWeek,
  getWithIssues,
  getStats,
} from './queries';
import {
  createDeliveryTracking,
  updateDeliveryTracking,
  deleteDeliveryTracking,
  updateStatus,
  reportIssue,
  resolveIssue,
} from './mutations';

export const deliveryTrackingRouter = createTRPCRouter({
  list: listDeliveryTracking,
  getById: getDeliveryTrackingById,
  getOverdue,
  getExpectedThisWeek,
  getWithIssues,
  getStats,
  create: createDeliveryTracking,
  update: updateDeliveryTracking,
  delete: deleteDeliveryTracking,
  updateStatus,
  reportIssue,
  resolveIssue,
});
