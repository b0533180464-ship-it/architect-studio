import { createTRPCRouter } from '../../trpc';
import { list, getById, getCities, search, getStats, getActivity, getTimeline } from './queries';
import { create, update, deleteProject, archive, restore, assignUsers, updatePermit } from './mutations';

export const projectRouter = createTRPCRouter({
  list,
  getById,
  getCities,
  search,
  getStats,
  getActivity,
  getTimeline,
  create,
  update,
  delete: deleteProject,
  archive,
  restore,
  assignUsers,
  updatePermit,
});
