import { router } from '../trpc';
import { timerRouter } from './timer';
import { soundRouter } from './sound';
import { userRouter } from './user';
import { friendRouter } from './friend';
import { leaderboardRouter } from './leaderboard';

export const appRouter = router({
  timer: timerRouter,
  sound: soundRouter,
  user: userRouter,
  friend: friendRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
