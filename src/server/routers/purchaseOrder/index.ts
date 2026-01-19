import { createTRPCRouter } from '../../trpc';
import { listPurchaseOrders, getPurchaseOrderById, getStats } from './queries';
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updateStatus,
  approvePurchaseOrder,
  addItem,
  updateItem,
  deleteItem,
  reorderItems,
} from './mutations';

export const purchaseOrderRouter = createTRPCRouter({
  list: listPurchaseOrders,
  getById: getPurchaseOrderById,
  getStats,
  create: createPurchaseOrder,
  update: updatePurchaseOrder,
  delete: deletePurchaseOrder,
  updateStatus,
  approve: approvePurchaseOrder,
  addItem,
  updateItem,
  deleteItem,
  reorderItems,
});
