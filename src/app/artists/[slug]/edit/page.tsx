import Navbar from "@/app/_components/(navbar)/navbar";

import { db } from "@prisma/db";
import { getAuth } from "@/lib/who/auth-server";
import { headers } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await db.orm.artists.where({ slug }).first();

  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!session) unauthorized();
  if (session.user.id !== artist?.createdById) forbidden();

  return (
    <main className="flex flex-col jusitfy-between items-center min-h-screen">
      <Navbar display={artist?.displayName} createdBy={artist?.createdById} editMode={true} />
      <p className="mt-24">coming soon...</p>
    </main>
  )
};
