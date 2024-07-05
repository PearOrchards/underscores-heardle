"use client";
import styles from "./stats.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple } from "@fortawesome/free-solid-svg-icons";

import { useEffect, useState } from "react";

import Dialog from "@/app/_components/(dialog)/dialog";
import History from "./history";

interface Stats {
	played: number;
	won: number;
	currentStreak: number;
	bestStreak: number;
	distribution: number[];
}

export default function Stats() {
	const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
	const [stats, setStats] = useState<Stats>();
	
	const openStatsModal = () => setShowStatsModal(true);
	const closeStatsModal = () => setShowStatsModal(false);
	
	const updateStats = () => {
		const history = window.localStorage.getItem("history");
		if (history) {
			const parsed = JSON.parse(history);
			let played = 0;
			let won = 0;
			let currentStreak = 0;
			let bestStreak = 0;
			const distribution = [0, 0, 0, 0, 0, 0, 0];
			
			Object.entries(parsed).forEach(([date, data]: any) => {
				played++
				if (data.guesses) {
					distribution[data.guesses.length - 1]++;
					if (data.guesses.length >= 7) currentStreak = 0;
					else {
						won++;
						currentStreak++;
						if (currentStreak > bestStreak) bestStreak = currentStreak;
					}
				}
			});
			
			setStats({
				played,
				won,
				currentStreak,
				bestStreak,
				distribution
			});
		}
	}
	
	useEffect(() => {
		updateStats();
		window.addEventListener("gameComplete", updateStats); // custom event handler. fired in game.tsx
	}, []);
	
	return (
		<>
			<FontAwesomeIcon icon={faChartSimple} className={styles.fa} onClick={openStatsModal} />
			<Dialog isOpen={showStatsModal} onClose={closeStatsModal}>
				<h2>stats</h2>
				<div className={styles.statsContainer}>
					<div className={styles.charts}>
						{  stats?.distribution ? stats.distribution.map((data: number, itr: number) => {
							return <div className={styles.chartGroup} key={itr}>
								<p>{data}</p>
								<div className={styles.chart} style={{ height: `${(data * 200) / stats.played}px` }}></div>
								<p>{itr === 6 ? "x" : itr + 1}</p>
							</div>
						}) : null }
					</div>
					<div>
						<div className={styles.data}>
							{stats ? (
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
										{((stats.won / stats.played) * 100).toFixed(2)}%
										<br/>
										<span className={styles.dataDescriptor}>win rate</span>
									</p>
								</>
							) : (<p>nothing!</p>)
							}
						</div>
						<div className={styles.data}>
							{stats ? (
								<>
									
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
							) : null}
						</div>
						<History />
					</div>
				</div>
			</Dialog>
		</>
	)
}