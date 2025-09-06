
import { getPaste } from '@/lib/actions/paste';
import { notFound } from 'next/navigation';
import { PasteViewer } from '@/components/paste-viewer';
import type { StoredPaste } from '@/lib/types';

export default async function ViewPastePage({ params }: { params: { id: string } }) {
  const paste = (await getPaste(params.id)) as StoredPaste & { theme?: string };

  if (!paste) {
    notFound();
  }

  // This is a temporary workaround to pass the theme.
  // In a real DB, you would fetch this along with the paste.
  // We are removing this feature, so it's ok.
  const { data } = { data: { theme: 'atom-one-dark' } };
  paste.theme = data?.theme || 'atom-one-dark';


  return <PasteViewer paste={paste} />;
}
