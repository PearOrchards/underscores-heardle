import Image from "next/image";
import styles from "./page.module.css";
import Navbar from "@/app/_components/(navbar)/navbar";

export default function Home() {
  return (
    <main className={styles.main}>
	    <Navbar />
    </main>
  );
}
