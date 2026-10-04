import Navbar from "@/app/_components/(navbar)/navbar";

import { db } from "@prisma/db";
import { getAuth } from "@/lib/who/auth-server";
import { headers } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";
import { VerifyPanel } from "@/app/_components/(editing)";

export default async function VerifyArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await getAuth().api.getSession({
    headers: await headers(),
  });
  if (!session) unauthorized();

  const artist = await db.orm.artists.where({ slug }).first();
  if (session.user.id !== artist?.createdById) forbidden();

  return (
    <div className="flex flex-col jusitfy-between items-center min-h-screen">
      <Navbar display={artist?.displayName} createdBy={artist?.createdById} editMode={true} />
      <main className="mt-32 grid grid-cols-[1fr_2fr] gap-4">
        <VerifyPanel />
      </main>
    </div>
  )
};
