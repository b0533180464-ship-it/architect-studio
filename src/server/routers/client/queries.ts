import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { tenantProcedure } from '../../trpc';
import { listClientsSchema, getClientByIdSchema, getClientProjectsSchema, getClientCommunicationsSchema } from './schemas';

export const listQuery = tenantProcedure.input(listClientsSchema).query(async ({ ctx, input }) => {
  const { page, pageSize, status, type, city, search, sortBy, sortOrder, includeInactive } = input;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ClientWhereInput = { tenantId: ctx.tenantId };
  if (!includeInactive) where.isActive = true;
  if (status) where.status = status;
  if (type) where.type = type;
  if (city) where.city = city;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { mobile: { contains: search } },
      { contactPerson: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [clients, total] = await Promise.all([
    ctx.prisma.client.findMany({ where, skip, take: pageSize, orderBy: { [sortBy]: sortOrder }, include: { _count: { select: { projects: true } } } }),
    ctx.prisma.client.count({ where }),
  ]);

  return {
    items: clients.map((client) => ({ ...client, projectsCount: client._count.projects })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), hasMore: page * pageSize < total },
  };
});

export const getByIdQuery = tenantProcedure.input(getClientByIdSchema).query(async ({ ctx, input }) => {
  const { id, includeProjects } = input;

  const client = await ctx.prisma.client.findFirst({
    where: { id, tenantId: ctx.tenantId },
    include: includeProjects ? {
      projects: { where: { archivedAt: null }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, name: true, code: true, statusId: true, phaseId: true, startDate: true, expectedEndDate: true, budget: true, priority: true, isVIP: true } },
      _count: { select: { projects: true } },
    } : undefined,
  });

  if (!client) throw new TRPCError({ code: 'NOT_FOUND', message: 'לקוח לא נמצא' });

  const [projectStats, totalProjects] = await Promise.all([
    ctx.prisma.project.groupBy({ by: ['archivedAt'], where: { clientId: id, tenantId: ctx.tenantId }, _count: true }),
    ctx.prisma.project.count({ where: { clientId: id, tenantId: ctx.tenantId } }),
  ]);

  const activeProjects = projectStats.filter((s) => s.archivedAt === null).reduce((sum, s) => sum + s._count, 0);
  const completedProjects = projectStats.filter((s) => s.archivedAt !== null).reduce((sum, s) => sum + s._count, 0);

  return { ...client, computed: { totalProjects, activeProjects, completedProjects } };
});

export const getProjectsQuery = tenantProcedure.input(getClientProjectsSchema).query(async ({ ctx, input }) => {
  const { clientId, includeArchived } = input;

  const client = await ctx.prisma.client.findFirst({ where: { id: clientId, tenantId: ctx.tenantId } });
  if (!client) throw new TRPCError({ code: 'NOT_FOUND', message: 'לקוח לא נמצא' });

  const where: Prisma.ProjectWhereInput = { clientId, tenantId: ctx.tenantId };
  if (!includeArchived) where.archivedAt = null;

  return ctx.prisma.project.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { id: true, firstName: true, lastName: true } }, assignedUsers: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
  });
});

export const getCitiesQuery = tenantProcedure.query(async ({ ctx }) => {
  const clients = await ctx.prisma.client.findMany({ where: { tenantId: ctx.tenantId, city: { not: null } }, select: { city: true }, distinct: ['city'] });
  return clients.map((c) => c.city).filter(Boolean) as string[];
});

export const searchQuery = tenantProcedure.input(z.object({ query: z.string().min(1) })).query(async ({ ctx, input }) => {
  return ctx.prisma.client.findMany({
    where: { tenantId: ctx.tenantId, isActive: true, OR: [{ name: { contains: input.query, mode: 'insensitive' } }, { email: { contains: input.query, mode: 'insensitive' } }, { phone: { contains: input.query } }] },
    take: 10,
    select: { id: true, name: true, email: true, phone: true, type: true, status: true },
  });
});

export const getCommunicationsQuery = tenantProcedure.input(getClientCommunicationsSchema).query(async ({ ctx, input }) => {
  const { clientId, type, limit } = input;

  const client = await ctx.prisma.client.findFirst({ where: { id: clientId, tenantId: ctx.tenantId } });
  if (!client) throw new TRPCError({ code: 'NOT_FOUND', message: 'לקוח לא נמצא' });

  const communications = await ctx.prisma.communicationLog.findMany({
    where: { tenantId: ctx.tenantId, clientId, ...(type ? { type } : {}) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const userIds = Array.from(new Set(communications.map((c: { userId: string }) => c.userId)));
  const users = await ctx.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true, avatar: true } });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return communications.map((comm: { userId: string }) => ({ ...comm, user: userMap.get(comm.userId) || null }));
});
