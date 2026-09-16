import Link from "next/link";
import Navbar from "@/app/_components/(navbar)/navbar";
import { Button } from "@/app/_components/ui/button";

export default function NewUserCallback() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen gap-6 px-8 text-center">
      <Navbar />
      <h2 className="text-4xl font-bold">you&apos;re in</h2>
      <p className="text-2xl max-w-prose">
        hiiii thanks for providing your account information!!
      </p>
      <p>
        just a note: after logging in, all your game data will be moved to the cloud. <br/>
        this is irreversible. if you don&#39;t like that, please log out now (at the top right).
      </p>
      <Button asChild>
        <Link href="/">play</Link>
      </Button>
    </main>
  );
}
