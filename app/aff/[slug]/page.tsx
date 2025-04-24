import { redirect } from 'next/navigation';
import { prisma } from '@/app/api/prisma';

export default async function ShortLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const ai = await prisma.ai.findFirst({
    where: {
      shortLink: slug,
    },
    select: {
      url: true,
    },
  });

  if (!ai) {
    redirect('/404');
  }

  redirect(ai.url);
}