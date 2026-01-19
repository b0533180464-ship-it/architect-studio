import { createTRPCRouter } from '../../trpc';
import {
  listRoomProducts,
  getRoomProductById,
  ffeSchedule,
  getStats,
} from './queries';
import {
  createRoomProduct,
  updateRoomProduct,
  deleteRoomProduct,
  updateApproval,
  bulkUpdateApproval,
  updateProcurement,
  updateDelivery,
  markInstalled,
  reportIssue,
  resolveIssue,
  reorder,
} from './mutations';

export const roomProductRouter = createTRPCRouter({
  list: listRoomProducts,
  getById: getRoomProductById,
  create: createRoomProduct,
  update: updateRoomProduct,
  delete: deleteRoomProduct,
  updateApproval,
  bulkUpdateApproval,
  updateProcurement,
  updateDelivery,
  markInstalled,
  reportIssue,
  resolveIssue,
  reorder,
  ffeSchedule,
  getStats,
});
