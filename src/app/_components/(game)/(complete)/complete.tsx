import styles from "./complete.module.scss";
import type { SongData } from "@/app/_components/SongToday";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import Image from "next/image"; // Try use without caching
import Link from "next/link";
import { useState } from "react";

const completionMessages = ["how???", "amazing!", "great job!", "nice!", "alright!", "close one!", "unlucky..."]

const coverLink = () => {
	const now = new Date();
	const str = now.toISOString().split("T")[0];
	return `/api/cover?t=${str}`;
}

export default function Complete({ songData, guesses } : { songData: SongData | null, guesses: string[] }) {
	const [th, setTH] = useState<number>(0);
	const [uh, setUH] = useState<number>(0);
	const [tm, setTM] = useState<number>(0);
	const [um, setUM] = useState<number>(0);
	const [ts, setTS] = useState<number>(0);
	const [us, setUS] = useState<number>(0);
	
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	
	const bars = [];
	for (let i = 0; i < 6; i++) {
		let secondaryClass = null;
		
		if (guesses[i] === songData?.answer) secondaryClass = styles.correct;
		else if (guesses[i]) secondaryClass = styles.wrong;
		else if (guesses[i] === "") secondaryClass = styles.skip;
		else secondaryClass = "";
		
		bars.push(<div key={i + 6} className={`${styles.attemptBlock} ${secondaryClass}`}></div>)
	}
	
	setInterval(()=> {
		const now = new Date();
		const diff = tomorrow.getTime() - now.getTime();
		
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);
		
		setTH(Math.floor(hours / 10));
		setUH(hours % 10);
		setTM(Math.floor(minutes / 10));
		setUM(minutes % 10);
		setTS(Math.floor(seconds / 10));
		setUS(seconds % 10);
	}, 1000);
	
	return (
		<section className={styles.complete}>
			<div className={styles.topBox}>
				<div className={styles.leftBlock}>
					<Image src={coverLink()} width={250} height={250} alt="Album cover" />
					<span>
						<p>underscores</p>
						<p>{songData?.answer}</p>
					</span>
				</div>
				<Link href={songData?.link || ""} target="_blank" rel="noopener noreferrer">go ({songData?.source}) <FontAwesomeIcon icon={faChevronRight}/></Link>
			</div>
			<div className={styles.middleSection}>
				<h1>{completionMessages[guesses.length - 1]}</h1>
				<div className={styles.barsHolder}>
					{bars}
				</div>
				<p>
					{
						(guesses.length < 7)
							? `You guessed the song in ${guesses.length} attempt${(guesses.length !== 1) ? "s" : ""}!`
							: `You didn't guess the song this time. Better luck tomorrow!`
					}
				</p>
			</div>
			<div className={styles.bottomSection}>
				<h1>next heardle in:</h1>
				<p>{th}{uh}:{tm}{um}:{ts}{us}</p>
			</div>
		</section>
	)
}