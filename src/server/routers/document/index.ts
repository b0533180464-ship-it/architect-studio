import { createTRPCRouter } from '../../trpc';
import {
  listQuery, getByIdQuery, getVersionsQuery, getStatsQuery,
  getDownloadUrlQuery, getPreviewUrlQuery, getThumbnailQuery,
} from './queries';
import {
  createMutation, updateMutation, deleteMutation,
  uploadVersionMutation, toggleSharingMutation,
  bulkDeleteMutation, createShareLinkMutation,
} from './mutations';

export const documentRouter = createTRPCRouter({
  // Queries
  list: listQuery,
  getById: getByIdQuery,
  getVersions: getVersionsQuery,
  getStats: getStatsQuery,
  getDownloadUrl: getDownloadUrlQuery,
  getPreviewUrl: getPreviewUrlQuery,
  getThumbnail: getThumbnailQuery,

  // Mutations
  create: createMutation,
  update: updateMutation,
  delete: deleteMutation,
  uploadVersion: uploadVersionMutation,
  toggleSharing: toggleSharingMutation,
  bulkDelete: bulkDeleteMutation,
  createShareLink: createShareLinkMutation,
});
