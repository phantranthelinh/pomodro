import { router } from '../trpc';
import { timerRouter } from './timer';

export const appRouter = router({
  timer: timerRouter,
});

export type AppRouter = typeof appRouter;
