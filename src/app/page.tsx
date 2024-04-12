import Image from "next/image";
import styles from "./page.module.css";
import Navbar from "@/app/_components/(navbar)/navbar";
import Game from "@/app/_components/(game)/game";

export default function Home() {
  return (
    <main className={styles.main}>
	    <Navbar />
	    <Game />
    </main>
  );
}
