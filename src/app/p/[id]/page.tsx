import { getPaste } from '@/lib/actions/paste';
import { notFound } from 'next/navigation';
import { PasteViewer } from '@/components/paste-viewer';

export default async function ViewPastePage({ params }: { params: { id: string } }) {
  const paste = await getPaste(params.id);

  if (!paste) {
    notFound();
  }

  return <PasteViewer paste={paste} />;
}
