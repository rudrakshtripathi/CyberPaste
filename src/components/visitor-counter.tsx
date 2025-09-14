
import { getVisitorCount } from '@/lib/actions/visitor';

export async function VisitorCounter() {
  const count = await getVisitorCount();

  return (
    <div className="mt-4">
      <p className="font-bold text-lg neon-text">
        Visitors: {count}
      </p>
    </div>
  );
}
