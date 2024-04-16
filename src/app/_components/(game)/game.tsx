"use client";
import styles from "./game.module.scss";

import { useState, useEffect } from "react";

import AttemptBox from "./(attemptBox)/attemptBox";
import Player from "@/app/_components/(game)/(player)/player";
import Input from "@/app/_components/(game)/(input)/input";

import songToday from "@/app/_components/songToday";
import Complete from "@/app/_components/(complete)/complete";

import { SongData } from "@/app/_components/SongData";

export default function Game() {
	const [currentAttempt, setCurrentAttempt] = useState<number>(0);
	const [guesses, setGuesses] = useState<string[]>([])
	const [complete, setComplete] = useState<boolean>(false);
	const [songData, setSongData] = useState<SongData | null>(null);
	
	useEffect(() => {
		if (typeof window !== "undefined" && window.localStorage) {
			const attempts = window.localStorage.getItem("attempts");
			if (attempts) {
				setCurrentAttempt(parseInt(attempts));
			}
		}
	}, []);
	
	const guess = async (g: string) => {
		const s= await songToday();
		const today = s[0].answer;
		if (g === today) await correct();
		else {
			setGuesses([...guesses, g]);
			setCurrentAttempt(currentAttempt + 1);
		}
	}
	
	const correct = async () => {
		const s= await songToday();
		const songData: SongData = { answer: s[0].answer, link: s[0].link, source: s[1] };
		setSongData(songData);
		setComplete(true);
	}
	
	return (
		<>
			{
				complete ? (
					<Complete songData={songData} />
				) : (
					<section className={styles.attempts}>
						{[0, 1, 2, 3, 4, 5].map((i) => {
							return <AttemptBox key={i} parentActive={ currentAttempt == i } parentGuess={guesses[i]} />
						})}
					</section>
				)
			}
			<div className={styles.bottom}>
				<Player currentAttempt={currentAttempt} complete={complete} />
				<Input currentAttempt={currentAttempt} complete={complete} guess={guess} />
			</div>
		</>
	)
}