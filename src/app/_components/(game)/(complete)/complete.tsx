import styles from "./complete.module.scss";
import type { SongData } from "@/app/_components/SongToday";
import { HeardleNumber } from "@/app/_components/HeardleNumber";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faShareNodes } from "@fortawesome/free-solid-svg-icons";

import Image from "next/image"; // Try use without caching
import Link from "next/link";
import { useState } from "react";
import Dialog from "@/app/_components/(dialog)/dialog";

const completionMessages = ["how???", "amazing!", "great job!", "nice!", "alright!", "close one!", "unlucky..."]

const coverLink = (artist: string) => {
	const now = new Date();
	const str = now.toISOString().split("T")[0];
	return `/api/cover?t=${str}&artist=${artist}`;
}

export default function Complete({ songData, guesses, artist } : { songData: SongData | null, guesses: string[], artist: string }) {
	const [copiedSuccessfully, setCopiedSuccessfully] = useState<boolean>(false);
	const [manualCopy, setManualCopy] = useState<string>("");
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const openCopyModal = () => setModalOpen(true);
	const closeCopyModal = () => setModalOpen(false);

	const [th, setTH] = useState<number>(0);
	const [uh, setUH] = useState<number>(0);
	const [tm, setTM] = useState<number>(0);
	const [um, setUM] = useState<number>(0);
	const [ts, setTS] = useState<number>(0);
	const [us, setUS] = useState<number>(0);

	const tomorrow = new Date();
	tomorrow.setUTCDate(tomorrow.getDate() + 1);
	tomorrow.setUTCHours(0, 0, 0, 0);

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

	const share = async () => {
		let clipboardData = `${artist} heardle #${await HeardleNumber()}\n\n🔊`;
		for (let i = 0; i < 6; i++) {
			if (guesses[i] === songData?.answer) clipboardData += `🟩`;
			else if (guesses[i]) clipboardData += `🟥`;
			else if (guesses[i] === "") clipboardData += `🟨`;
			else clipboardData += `⬛`;
		}
		clipboardData += `\n\n🔗 ${window.location.href}`;

		try {
			navigator.clipboard.writeText(clipboardData).then(() => { // Success!
				setCopiedSuccessfully(true);
				setTimeout(() => {
					setCopiedSuccessfully(false);
				}, 2000);
			}, () => { // Fallback, rejected
				throw new Error("Rejected"); // Go to catch
			});
		} catch {
			setManualCopy(clipboardData);
			openCopyModal();
		}
	}

	return (
		<section className={styles.complete} data-cy="complete">
			<div className={styles.topBox}>
				<div className={styles.leftBlock}>
					<Image src={coverLink(artist)} width={250} height={250} alt="Album cover" />
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
				{ copiedSuccessfully ? <p className={styles.copied}>copied!</p> : null }
				<Dialog isOpen={modalOpen} onClose={closeCopyModal}>
					<h2>that&apos;s... awkward</h2>
					<p>turns out I don&apos;t have access to your clipboard! so... could you just copy the stuff below? sorry :3</p>
					<pre>{manualCopy}</pre>
				</Dialog>
				<button className="alt undoTransform" onClick={share}>
					<FontAwesomeIcon icon={faShareNodes} />
					share
				</button>
			</div>
			<div className={styles.bottomSection}>
				<h1>next heardle in:</h1>
				<p>{th}{uh}:{tm}{um}:{ts}{us}</p>
			</div>
		</section>
	)
}