import Navbar from "@/app/_components/(navbar)/navbar";
import Game from "@/app/_components/(game)/game";
import { db } from "@prisma/db";

export default async function GameHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await db.orm.artists.where({ slug }).first();

  if (!artist) {
    throw new Error(`No artist found from "${slug}"`);
  }

  // const artistData = artist.toObject();
  // artistData._id = artistData._id.toString();

  return (
    <main className="flex flex-col justify-between itmes-center min-h-screen">
      <Navbar display={artist.displayName} />
      <Game artist={artist.slug} />
    </main>
  );
}
