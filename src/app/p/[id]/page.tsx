import { getPaste } from '@/lib/actions/paste';
import { notFound } from 'next/navigation';
import { PasteViewer } from '@/components/paste-viewer';

export default async function ViewPastePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const paste = await getPaste(id);

  if (!paste) {
    notFound();
  }

  return <PasteViewer paste={paste} />;
}
