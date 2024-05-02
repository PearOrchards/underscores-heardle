"use client";
import styles from "./game.module.scss";

import { useState, useEffect } from "react";

import AttemptBox from "./(attemptBox)/attemptBox";
import Player from "@/app/_components/(game)/(player)/player";
import Input from "@/app/_components/(game)/(input)/input";

import songToday from "@/app/_components/songToday";
import Complete from "@/app/_components/(game)/(complete)/complete";

import { SongData } from "@/app/_components/SongData";

const dateToday = () => {
	const today = new Date();
	return today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
}

export default function Game() {
	const [guesses, setGuesses] = useState<string[]>([])
	const [complete, setComplete] = useState<boolean>(false);
	const [songData, setSongData] = useState<SongData | null>(null);
	const [doNotAutoplay, setDoNotAutoplay] = useState<boolean>(false);
	
	useEffect(() => {
		console.log("hello! welcome to the underscores heardle!");
		
		const attempts = window.localStorage.getItem("guesses");
		const date = window.localStorage.getItem("guessesDate");
		
		if (attempts && date) {
			const savedDate = JSON.parse(date);
			
			if (savedDate == dateToday()) {
				setGuesses(JSON.parse(attempts));
				const done = window.localStorage.getItem("done");
				setDoNotAutoplay(true);
				if (done) gameComplete();
			} else {
				window.localStorage.removeItem("guesses");
				window.localStorage.removeItem("done");
			}
		}
		window.localStorage.setItem("guessesDate", JSON.stringify(dateToday()));
	}, []);
	
	const guess = async (g: string) => {
		const s= await songToday();
		const today = s[0].answer;
		
		updateGuesses(g);
		
		if (g === today || guesses.length == 6) await gameComplete();
	}
	
	const skip = async () => {
		updateGuesses("");
		if (guesses.length == 6) await gameComplete();
	}
	
	const updateGuesses = (g: string) => {
		const newGuesses = [...guesses, g];
		setGuesses(newGuesses);
		window.localStorage.setItem("guesses", JSON.stringify(newGuesses));
	}
	
	const gameComplete = async () => {
		const s= await songToday();
		const songData: SongData = { answer: s[0].answer, link: s[0].link, source: s[1] };
		
		window.localStorage.setItem("done", JSON.stringify(true));
		
		const history = window.localStorage.getItem("history");
		const date = dateToday();
		if (history) {
			const parsedHistory = JSON.parse(history);
			if (!parsedHistory[date]) parsedHistory[date] = guesses.length + 1;
			window.localStorage.setItem("history", JSON.stringify(parsedHistory));
		} else {
			const newHistory: any = { };
			newHistory[date] = guesses.length + 1;
			window.localStorage.setItem("history", JSON.stringify(newHistory));
		}
		
		setSongData(songData);
		setComplete(true);
	}
	
	return (
		<>
			{
				complete ? (
					<Complete songData={songData} guesses={guesses} />
				) : (
					<section className={styles.attempts}>
						{[0, 1, 2, 3, 4, 5].map((i) => {
							return <AttemptBox key={i} parentActive={ guesses.length == i } parentGuess={guesses[i]} />
						})}
					</section>
				)
			}
			<div className={styles.bottom}>
				<Player currentAttempt={ guesses.length } complete={complete} doNotAutoplay={doNotAutoplay} />
				<Input currentAttempt={ guesses.length } complete={complete} guess={guess} skip={skip} />
			</div>
		</>
	)
}