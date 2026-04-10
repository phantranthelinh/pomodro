import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { PrismaClient } from '@prisma/client';

const LEADERBOARD_LIMIT = 50;

type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  totalSec: number;
  sessions: number;
};

type LeaderboardResult = {
  entries: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
};

async function buildLeaderboard(
  prisma: PrismaClient,
  since: Date,
  callerUserId: string,
  userIdFilter?: string[]
): Promise<LeaderboardResult> {
  const rows = await prisma.timerSession.groupBy({
    by: ['userId'],
    where: {
      completedAt: { gte: since },
      ...(userIdFilter ? { userId: { in: userIdFilter } } : {}),
    },
    _sum: { totalFocusSec: true },
    _count: { _all: true },
    orderBy: { _sum: { totalFocusSec: 'desc' } },
  });

  const userIds = rows.map((r) => r.userId);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });

  const userMap = new Map(users.map((u) => [u.id, { name: u.name, image: u.image }]));

  const allEntries: LeaderboardEntry[] = rows.map((row, idx) => ({
    rank: idx + 1,
    userId: row.userId,
    name: userMap.get(row.userId)?.name ?? null,
    image: userMap.get(row.userId)?.image ?? null,
    totalSec: row._sum.totalFocusSec ?? 0,
    sessions: row._count._all,
  }));

  const currentUser = allEntries.find((e) => e.userId === callerUserId) ?? null;
  const entries = allEntries.slice(0, LEADERBOARD_LIMIT);

  return { entries, currentUser };
}

export const leaderboardRouter = router({
  weekly: protectedProcedure
    .input(z.object({ friendsOnly: z.boolean().default(false) }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - since.getDay());
      since.setHours(0, 0, 0, 0);

      if (input.friendsOnly) {
        const friends = await ctx.prisma.friendship.findMany({
          where: {
            status: 'accepted',
            OR: [{ userId: ctx.user.id! }, { friendId: ctx.user.id! }],
          },
          select: { userId: true, friendId: true },
        });
        const friendIds = [
          ctx.user.id!,
          ...friends.map((f) => (f.userId === ctx.user.id! ? f.friendId : f.userId)),
        ];
        return buildLeaderboard(ctx.prisma, since, ctx.user.id!, friendIds);
      }

      return buildLeaderboard(ctx.prisma, since, ctx.user.id!);
    }),

  monthly: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth(), 1);
    return buildLeaderboard(ctx.prisma, since, ctx.user.id!);
  }),

  allTime: protectedProcedure.query(async ({ ctx }) => {
    return buildLeaderboard(ctx.prisma, new Date(0), ctx.user.id!);
  }),
});
