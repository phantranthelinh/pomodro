import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function createTRPCContext(_opts: FetchCreateContextFnOptions) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const session = await auth();

  return {
    prisma,
    session,
    user: session?.user,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
