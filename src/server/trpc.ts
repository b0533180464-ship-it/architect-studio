import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuth, AuthContext } from '@/lib/auth';

interface CreateContextOptions {
  headers: Headers;
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  const auth = await getAuth();

  return {
    prisma,
    headers: opts.headers,
    auth,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authenticated user
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.auth?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth as AuthContext,
    },
  });
});

// Tenant procedure - requires auth + tenant context
export const tenantProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const userId = ctx.auth.user.id;

  // Get user's tenant
  const user = await ctx.prisma.user.findFirst({
    where: { id: userId, isActive: true },
    select: { tenantId: true, role: true },
  });

  if (!user) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User not found or not active',
    });
  }

  return next({
    ctx: {
      ...ctx,
      tenantId: user.tenantId,
      userRole: user.role,
    },
  });
});
