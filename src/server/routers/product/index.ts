import { createTRPCRouter } from '../../trpc';
import {
  listProducts,
  getProductById,
  searchProducts,
  getCategories,
  getStats,
} from './queries';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  addProductToRoom,
} from './mutations';

export const productRouter = createTRPCRouter({
  list: listProducts,
  getById: getProductById,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
  duplicate: duplicateProduct,
  addToRoom: addProductToRoom,
  getCategories,
  search: searchProducts,
  getStats,
});
