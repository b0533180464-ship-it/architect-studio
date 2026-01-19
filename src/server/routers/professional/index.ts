import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { createTRPCRouter, tenantProcedure } from '../../trpc';
import {
  createProfessionalSchema,
  updateProfessionalSchema,
  listProfessionalsSchema,
  getProfessionalByIdSchema,
  deleteProfessionalSchema,
} from './schemas';

export const professionalRouter = createTRPCRouter({
  // List professionals with pagination and filters
  list: tenantProcedure.input(listProfessionalsSchema).query(async ({ ctx, input }) => {
    const { page, pageSize, tradeId, search, sortBy, sortOrder, includeInactive } = input;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProfessionalWhereInput = { tenantId: ctx.tenantId };

    if (!includeInactive) where.isActive = true;
    if (tradeId) where.tradeId = tradeId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const trades = await ctx.prisma.configurableEntity.findMany({
      where: { tenantId: ctx.tenantId, entityType: 'trade' },
    });
    const tradeMap = new Map(trades.map((t) => [t.id, t]));

    const [professionals, total] = await Promise.all([
      ctx.prisma.professional.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { projects: true } } },
      }),
      ctx.prisma.professional.count({ where }),
    ]);

    return {
      items: professionals.map((p) => ({
        ...p,
        trade: tradeMap.get(p.tradeId) || null,
        projectsCount: p._count.projects,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total,
      },
    };
  }),

  // Get professional by ID
  getById: tenantProcedure.input(getProfessionalByIdSchema).query(async ({ ctx, input }) => {
    const { id } = input;

    const [professional, trades] = await Promise.all([
      ctx.prisma.professional.findFirst({
        where: { id, tenantId: ctx.tenantId },
        include: {
          projects: { take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, code: true } },
          _count: { select: { projects: true } },
        },
      }),
      ctx.prisma.configurableEntity.findMany({
        where: { tenantId: ctx.tenantId, entityType: 'trade' },
      }),
    ]);

    if (!professional) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'בעל מקצוע לא נמצא' });
    }

    const tradeMap = new Map(trades.map((t) => [t.id, t]));

    return {
      ...professional,
      trade: tradeMap.get(professional.tradeId) || null,
      totalProjects: professional._count.projects,
    };
  }),

  // Create new professional
  create: tenantProcedure.input(createProfessionalSchema).mutation(async ({ ctx, input }) => {
    const data = {
      ...input,
      email: input.email === '' ? null : input.email,
      insuranceExpiry: input.insuranceExpiry ? new Date(input.insuranceExpiry) : null,
      specialties: input.specialties || [],
    };

    // Validate tradeId
    const trade = await ctx.prisma.configurableEntity.findFirst({
      where: { id: input.tradeId, tenantId: ctx.tenantId, entityType: 'trade' },
    });
    if (!trade) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'מקצוע לא נמצא' });
    }

    return ctx.prisma.professional.create({
      data: { ...data, tenantId: ctx.tenantId },
    });
  }),

  // Update professional
  update: tenantProcedure.input(updateProfessionalSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    const existing = await ctx.prisma.professional.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'בעל מקצוע לא נמצא' });
    }

    const updateData = {
      ...data,
      email: data.email === '' ? null : data.email,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
    };

    if (data.tradeId) {
      const trade = await ctx.prisma.configurableEntity.findFirst({
        where: { id: data.tradeId, tenantId: ctx.tenantId, entityType: 'trade' },
      });
      if (!trade) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'מקצוע לא נמצא' });
      }
    }

    return ctx.prisma.professional.update({ where: { id }, data: updateData });
  }),

  // Soft delete professional
  delete: tenantProcedure.input(deleteProfessionalSchema).mutation(async ({ ctx, input }) => {
    const { id } = input;

    const existing = await ctx.prisma.professional.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'בעל מקצוע לא נמצא' });
    }

    return ctx.prisma.professional.update({
      where: { id },
      data: { isActive: false },
    });
  }),

  // Quick search (for autocomplete)
  search: tenantProcedure.input(z.object({ query: z.string().min(1) })).query(async ({ ctx, input }) => {
    const [professionals, trades] = await Promise.all([
      ctx.prisma.professional.findMany({
        where: {
          tenantId: ctx.tenantId,
          isActive: true,
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { companyName: { contains: input.query, mode: 'insensitive' } },
            { phone: { contains: input.query } },
          ],
        },
        take: 10,
        select: { id: true, name: true, companyName: true, phone: true, tradeId: true, rating: true },
      }),
      ctx.prisma.configurableEntity.findMany({
        where: { tenantId: ctx.tenantId, entityType: 'trade' },
      }),
    ]);

    const tradeMap = new Map(trades.map((t) => [t.id, t]));

    return professionals.map((p) => ({ ...p, trade: tradeMap.get(p.tradeId) || null }));
  }),
});
