"use client";
import styles from "./game.module.scss";

import { useState, useEffect } from "react";
import AttemptBox from "./(attemptBox)/attemptBox";
import Player from "@/app/_components/(game)/(player)/player";
import Input from "@/app/_components/(game)/(input)/input";

import songToday from "@/app/_components/songToday";

export default function Game() {
	const [currentAttempt, setCurrentAttempt] = useState<number>(0);
	const [guesses, setGuesses] = useState<string[]>([])
	const [complete, setComplete] = useState<boolean>(false);
	
	useEffect(() => {
		if (typeof window !== "undefined" && window.localStorage) {
			const attempts = window.localStorage.getItem("attempts");
			if (attempts) {
				setCurrentAttempt(parseInt(attempts));
			}
		}
	}, []);
	
	const guess = async (g: string) => {
		const today = (await songToday())[0].answer;
		if (g === today) correct();
		else {
			setGuesses([...guesses, g]);
			setCurrentAttempt(currentAttempt + 1);
		}
	}
	
	const correct = () => {
		setComplete(true);
	}
	
	return (
		<>
			{
				complete ? (
					<section className={styles.complete}>
					
					</section>
				) : (
					<section className={styles.attempts}>
						{[0, 1, 2, 3, 4, 5].map((i) => {
							return <AttemptBox key={i} parentActive={ currentAttempt == i } parentGuess={guesses[i]} />
						})}
					</section>
				)
			}
			<div className={styles.bottom}>
				<Player currentAttempt={ currentAttempt } />
				<Input currentAttempt={ currentAttempt } guess={guess} />
			</div>
		</>
	)
}