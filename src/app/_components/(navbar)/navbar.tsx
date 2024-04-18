"use client";
import styles from "./navbar.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faChartSimple, faCircleQuestion, faMusic, faVolumeHigh, faThumbsUp } from "@fortawesome/free-solid-svg-icons";

import { useState, useEffect } from "react";
import Link from "next/link";

import Dialog from "@/app/_components/(dialog)/dialog";

interface Stats {
	played: number;
	won: number;
	currentStreak: number;
	bestStreak: number;
	distribution: number[];
}

export default function Navbar() {
	const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
	const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
	const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
	
	const openAboutModal = () => setShowAboutModal(true);
	const closeAboutModal = () => setShowAboutModal(false);
	
	const openStatsModal = () => setShowStatsModal(true);
	const closeStatsModal = () => setShowStatsModal(false);
	
	const openHelpModal = () => setShowHelpModal(true);
	const closeHelpModal = () => setShowHelpModal(false);
	
	const [stats, setStats] = useState<Stats>();
	
	useEffect(() => {
		const history = window.localStorage.getItem("history");
		if (history) {
			const parsed = JSON.parse(history);
			let played = 0;
			let won = 0;
			let currentStreak = 0;
			let bestStreak = 0;
			const distribution = [0,0,0,0,0,0,0];
			
			Object.entries(parsed).forEach(([date, guess]) => {
				played++;
				if (parseInt(guess as string) < 7) {
					won++; currentStreak++;
					if (currentStreak > bestStreak) bestStreak = currentStreak;
				} else {
					currentStreak = 0;
				}
				distribution[parseInt(guess as string) - 1]++;
			});
			
			setStats({
				played,
				won,
				currentStreak,
				bestStreak,
				distribution
			});
		}
		
	}, []);
	
	return (
		<nav className={styles.nav}>
			<div className={styles.left}>
				<FontAwesomeIcon icon={faCircleInfo} className={styles.fa} onClick={openAboutModal} />
				<Dialog isOpen={showAboutModal} onClose={closeAboutModal} >
					<h2>about</h2>
					<p>A recreation of Heardle for underscores, with all songs taken from the tracker (mostly beyond skin purifying treatment).</p>
					<p>Built by <Link href="https://www.orchards.dev">Pear</Link>, for the <Link href="https://www.youtube.com/playlist?list=PLAEc0HKmIWO-oDNPLi1aL1aazsqdxYhPg">daily underscores heardle series</Link>.</p>
					<p>Also please check out the <Link href="https://heardle.apictureof.me/">original underscores heardle</Link> by shelly, it contains only soundcloud releases for those who want a fairer chance</p>
				</Dialog>
			</div>
			<div className={styles.center}>
				<h1>underscores heardle</h1>
			</div>
			<div className={styles.right}>
				<FontAwesomeIcon icon={faChartSimple} className={styles.fa} onClick={openStatsModal} />
				<Dialog isOpen={showStatsModal} onClose={closeStatsModal}>
					<h2>stats</h2>
					<div className={styles.statsContainer}>
						<div className={styles.charts}>
							{  stats?.distribution ? stats.distribution.map((data: number, itr: number) => {
								return <div className={styles.chartGroup} key={itr}>
									<p>{data}</p>
									<div className={styles.chart} style={{ height: `${data * 100}px` }}></div>
									<p>{itr === 6 ? "x" : itr + 1}</p>
								</div>
							}) : null }
						</div>
						<div className={styles.data}>
							{ stats ? (
								<>
									<p>
										{stats.played}
										<br/>
										<span className={styles.dataDescriptor}>played</span>
									</p>
									<p>
										{stats.won}
										<br/>
										<span className={styles.dataDescriptor}>won</span>
									</p>
									<p>
										{(stats.won / stats.played) * 100}%
										<br/>
										<span className={styles.dataDescriptor}>win rate</span>
									</p>
									<p>
										{stats.currentStreak}
										<br/>
										<span className={styles.dataDescriptor}>current streak</span>
									</p>
									<p>
										{stats.bestStreak}
										<br/>
										<span className={styles.dataDescriptor}>best streak</span>
									</p>
								</>
								) : (<p>nothing!</p>)
							}
						</div>
					</div>
				</Dialog>
				
				<FontAwesomeIcon icon={faCircleQuestion} className={styles.fa} onClick={openHelpModal} />
				<Dialog isOpen={showHelpModal} onClose={closeHelpModal}>
					<h2>how to play</h2>
					<div>
						<p><FontAwesomeIcon icon={faMusic} /> Listen to the intro, then find the correct song in the list.</p>
						<p><FontAwesomeIcon icon={faVolumeHigh} /> Skipped or incorrect attempts unlock more of the intro.</p>
						<p><FontAwesomeIcon icon={faThumbsUp} /> Answer in as few tries as possible and share your score!</p>
					</div>
					<h3><i>good luck!</i></h3>
					
					<button className="alt" onClick={closeHelpModal}>PLAY</button>
					
				</Dialog>
			</div>
		</nav>
	)
}