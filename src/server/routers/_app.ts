import { createTRPCRouter } from '../trpc';
import { tenantRouter } from './tenant';
import { userRouter } from './user';
import { onboardingRouter } from './onboarding';
import { sessionRouter } from './session';
import { teamRouter } from './team';
import { settingsRouter } from './settings';
import { clientRouter } from './client';
import { projectRouter } from './project';
import { roomRouter } from './room';
import { taskRouter } from './task';
import { documentRouter } from './document';
import { meetingRouter } from './meeting';
import { configRouter } from './config';
import { supplierRouter } from './supplier';
import { professionalRouter } from './professional';
import { twoFactorRouter } from './twoFactor';
import { activityLogRouter } from './activityLog';
import { communicationLogRouter } from './communicationLog';
import { productRouter } from './product';
import { roomProductRouter } from './roomProduct';
import { purchaseOrderRouter } from './purchaseOrder';
import { deliveryTrackingRouter } from './deliveryTracking';
// Financial routers
import { proposalRouter } from './proposal';
import { proposalItemRouter } from './proposalItem';
import { contractRouter } from './contract';
import { retainerRouter } from './retainer';
import { paymentRouter } from './payment';
import { expenseRouter } from './expense';
import { timeEntryRouter } from './timeEntry';
// Generic/Dynamic features
import { customFieldsRouter } from './customFields';
import { viewsRouter } from './views';
import { navigationRouter } from './navigation';
import { entityTypesRouter } from './entity-types';
import { genericEntitiesRouter } from './generic-entities';
import { genericEntityViewsRouter } from './generic-entity-views';
import { genericEntityFieldsRouter } from './generic-entity-fields';
import { relationsRouter } from './relations';

export const appRouter = createTRPCRouter({
  tenant: tenantRouter,
  user: userRouter,
  onboarding: onboardingRouter,
  session: sessionRouter,
  team: teamRouter,
  settings: settingsRouter,
  clients: clientRouter,
  projects: projectRouter,
  rooms: roomRouter,
  tasks: taskRouter,
  documents: documentRouter,
  meetings: meetingRouter,
  config: configRouter,
  suppliers: supplierRouter,
  professionals: professionalRouter,
  twoFactor: twoFactorRouter,
  activityLog: activityLogRouter,
  communicationLog: communicationLogRouter,
  products: productRouter,
  roomProducts: roomProductRouter,
  purchaseOrders: purchaseOrderRouter,
  deliveryTracking: deliveryTrackingRouter,
  // Financial routers
  proposals: proposalRouter,
  proposalItems: proposalItemRouter,
  contracts: contractRouter,
  retainers: retainerRouter,
  payments: paymentRouter,
  expenses: expenseRouter,
  timeEntries: timeEntryRouter,
  // Generic/Dynamic features
  customFields: customFieldsRouter,
  views: viewsRouter,
  navigation: navigationRouter,
  entityTypes: entityTypesRouter,
  genericEntities: genericEntitiesRouter,
  genericEntityViews: genericEntityViewsRouter,
  genericEntityFields: genericEntityFieldsRouter,
  relations: relationsRouter,
});

export type AppRouter = typeof appRouter;
