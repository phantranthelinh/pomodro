import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const userSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

export const friendRouter = router({
  sendRequest: protectedProcedure
    .input(z.object({ friendId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;

      if (userId === input.friendId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot send friend request to yourself',
        });
      }

      const target = await ctx.prisma.user.findUnique({
        where: { id: input.friendId },
        select: { id: true },
      });

      if (!target) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      const existing = await ctx.prisma.friendship.findUnique({
        where: { userId_friendId: { userId, friendId: input.friendId } },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Friend request already sent or friendship exists',
        });
      }

      const reverse = await ctx.prisma.friendship.findUnique({
        where: { userId_friendId: { userId: input.friendId, friendId: userId } },
      });

      if (reverse) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A friend request from this user already exists',
        });
      }

      return ctx.prisma.friendship.create({
        data: { userId, friendId: input.friendId, status: 'pending' },
      });
    }),

  respond: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        accept: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id!;

      const request = await ctx.prisma.friendship.findUnique({
        where: { id: input.requestId },
        select: { id: true, userId: true, friendId: true, status: true },
      });

      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Friend request not found' });
      }

      if (request.friendId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      if (request.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Request already responded to',
        });
      }

      if (!input.accept) {
        await ctx.prisma.friendship.delete({ where: { id: input.requestId } });
        return { accepted: false };
      }

      await ctx.prisma.$transaction([
        ctx.prisma.friendship.update({
          where: { id: input.requestId },
          data: { status: 'accepted' },
        }),
        ctx.prisma.friendship.upsert({
          where: {
            userId_friendId: { userId: request.friendId, friendId: request.userId },
          },
          update: { status: 'accepted' },
          create: {
            userId: request.friendId,
            friendId: request.userId,
            status: 'accepted',
          },
        }),
      ]);

      return { accepted: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id!;

    const friendships = await ctx.prisma.friendship.findMany({
      where: { userId, status: 'accepted' },
      include: { friend: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    });

    return friendships.map((f) => f.friend);
  }),

  pending: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id!;

    return ctx.prisma.friendship.findMany({
      where: { friendId: userId, status: 'pending' },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
    });
  }),
});
