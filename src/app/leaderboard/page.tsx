'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { LeaderboardTable } from '@/components/social/leaderboard-table';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc-client';
import { useSession, signIn } from 'next-auth/react';
import { LogIn, UserPlus, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Period = 'weekly' | 'monthly' | 'allTime';

export default function LeaderboardPage() {
  const { data: session } = useSession();

  if (!session?.user?.id) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <GlassCard className="py-12">
          <LogIn size={48} className="mx-auto text-brand-text/30 mb-4" />
          <h2 className="text-xl font-bold text-brand-text mb-2">Sign in to view leaderboard</h2>
          <p className="text-brand-text/50 mb-6">Compete with friends and track your ranking</p>
          <Button onClick={() => signIn()}>Sign in</Button>
        </GlassCard>
      </main>
    );
  }

  return <LeaderboardContent userId={session.user.id} />;
}

function LeaderboardContent({ userId }: { userId: string }) {
  const [period, setPeriod] = useState<Period>('weekly');
  const [friendId, setFriendId] = useState('');

  const weeklyQuery = trpc.leaderboard.weekly.useQuery(
    {},
    { enabled: period === 'weekly' }
  );
  const monthlyQuery = trpc.leaderboard.monthly.useQuery(undefined, {
    enabled: period === 'monthly',
  });
  const allTimeQuery = trpc.leaderboard.allTime.useQuery(undefined, {
    enabled: period === 'allTime',
  });

  const sendRequest = trpc.friend.sendRequest.useMutation({
    onSuccess: () => setFriendId(''),
  });

  const pendingQuery = trpc.friend.pending.useQuery();

  const entries =
    period === 'weekly'
      ? (weeklyQuery.data?.entries ?? [])
      : period === 'monthly'
        ? (monthlyQuery.data?.entries ?? [])
        : (allTimeQuery.data?.entries ?? []);

  const periods: { key: Period; label: string }[] = [
    { key: 'weekly', label: 'Week' },
    { key: 'monthly', label: 'Month' },
    { key: 'allTime', label: 'All Time' },
  ];

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
          <Trophy size={24} /> Leaderboard
        </h1>

        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm transition-all',
                period === p.key
                  ? 'glass-strong text-brand-text font-medium'
                  : 'text-brand-text/50 hover:text-brand-text'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <LeaderboardTable entries={entries} currentUserId={userId} />

      <GlassCard>
        <p className="text-sm font-medium text-brand-text mb-3 flex items-center gap-2">
          <UserPlus size={16} /> Add Friend
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (friendId.trim()) {
              sendRequest.mutate({ friendId: friendId.trim() });
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Friend's user ID"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            className="flex-1 px-4 py-2 rounded-full glass text-brand-text placeholder:text-brand-text/30 text-sm outline-none focus:ring-2 focus:ring-brand-dark/30"
          />
          <Button
            type="submit"
            size="sm"
            disabled={sendRequest.isPending || !friendId.trim()}
          >
            {sendRequest.isPending ? 'Sending...' : 'Add'}
          </Button>
        </form>
        {sendRequest.error && (
          <p className="text-xs text-red-500 mt-2">{sendRequest.error.message}</p>
        )}
        {sendRequest.isSuccess && (
          <p className="text-xs text-emerald-600 mt-2">Friend request sent!</p>
        )}
      </GlassCard>

      {pendingQuery.data && pendingQuery.data.length > 0 && (
        <PendingRequests requests={pendingQuery.data} />
      )}
    </main>
  );
}

type PendingRequest = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

function PendingRequests({ requests }: { requests: PendingRequest[] }) {
  const utils = trpc.useUtils();
  const respond = trpc.friend.respond.useMutation({
    onSuccess: () => {
      utils.friend.pending.invalidate();
      utils.leaderboard.weekly.invalidate();
    },
  });

  return (
    <GlassCard>
      <p className="text-sm font-medium text-brand-text mb-3">Pending Requests</p>
      <div className="space-y-2">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {req.user.image ? (
                <Image src={req.user.image} alt="" width={24} height={24} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand-dark/20" />
              )}
              <span className="text-sm text-brand-text">
                {req.user.name ?? req.user.email}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => respond.mutate({ requestId: req.id, accept: true })}
                disabled={respond.isPending}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => respond.mutate({ requestId: req.id, accept: false })}
                disabled={respond.isPending}
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
