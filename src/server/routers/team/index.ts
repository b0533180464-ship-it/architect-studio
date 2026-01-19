import { createTRPCRouter } from '../../trpc';
import { invitationsProcedures } from './invitations';
import { membersProcedures } from './members';

export const teamRouter = createTRPCRouter({
  ...invitationsProcedures,
  ...membersProcedures,
});
