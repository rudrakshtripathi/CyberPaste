import { getPaste } from '@/lib/actions/paste';
import { notFound } from 'next/navigation';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const paste = await getPaste(params.id);

  if (!paste) {
    notFound();
  }

  if (paste.encrypted) {
    return new Response('This paste is encrypted and cannot be viewed in raw mode.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const rawContent = paste.tabs
    .map(
      (tab) =>
        `--- ${tab.name || 'Pasty'} (${tab.lang}) ---\n\n${tab.content}`
    )
    .join('\n\n');

  return new Response(rawContent, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
