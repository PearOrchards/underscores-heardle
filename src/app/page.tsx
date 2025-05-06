import {redirect} from "next/navigation";

export default function Home() {
    // temporary redirect to underscores until we have a proper home
    redirect("/artists/underscores");
};