"use client";
import styles from "./game.module.scss";

import { useState, useEffect } from "react";

import AttemptBox from "./(attemptBox)/attemptBox";
import Player from "@/app/_components/(game)/(player)/player";
import Input from "@/app/_components/(game)/(input)/input";

import { IsGuessCorrect, SongToday, type SongData } from "@/app/_components/SongToday";
import Complete from "@/app/_components/(game)/(complete)/complete";

export type History = {
	[date: string]: {
		guesses?: string[];
		answer?: string,
	};
}

const dateToday = () => {
	const today = new Date();
	return today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
}

export default function Game({ artist } : { artist: string }) {
	const [guesses, setGuesses] = useState<string[]>([])
	const [complete, setComplete] = useState<boolean>(false);
	const [songData, setSongData] = useState<SongData | null>(null);
	const [doNotAutoplay, setDoNotAutoplay] = useState<boolean>(false);

	useEffect(() => {
		console.log(`hello! now loading up ${artist}'s heardle`);

		let history = window.localStorage.getItem("history");
		if (!history) {
			const newHistory: any = { };
			window.localStorage.setItem("history", JSON.stringify(newHistory));
			history = window.localStorage.getItem("history");
		}

		const parsedHistory = JSON.parse(history!) as History;

		if (!parsedHistory[dateToday()]) {
			parsedHistory[dateToday()] = {};
			window.localStorage.setItem("history", JSON.stringify(parsedHistory));
			setGuesses([]);
		} else {
			const today = parsedHistory[dateToday()];
			setGuesses(today.guesses || []); // Filter out any non-string values (empty arrays from migration)
			if (today.answer && today.answer !== "") {
				setDoNotAutoplay(true); // gameComplete(); isn't needed, guesses useEffect triggers it anyway.
			}
		}
	}, []);

	useEffect(() => {
		IsGuessCorrect(guesses[guesses.length - 1], artist).then(async (result) => {
			if (result || guesses.length > 6) await gameComplete();
			else if (guesses.length == 6) { updateGuesses(""); } // Add a blank guess to signify the end of the game.
		});
	}, [guesses]);

	const guess = async (g: string) => {
		updateGuesses(g);
	}

	const skip = async () => {
		updateGuesses("");
	}

	const updateGuesses = (g: string) => {
		const newGuesses = [...guesses, g];
		setGuesses(newGuesses);

		const history = window.localStorage.getItem("history");
		const parsed = JSON.parse(history!) as History;
		parsed[dateToday()].guesses = newGuesses;

		window.localStorage.setItem("history", JSON.stringify(parsed));
	}

	const gameComplete = async () => {
		const songData= await SongToday(artist);

		const history = window.localStorage.getItem("history");
		const parsed = JSON.parse(history!) as History;
		parsed[dateToday()].answer = songData.answer;
		window.localStorage.setItem("history", JSON.stringify(parsed));

		// firing custom event (received in stats.tsx)
		window.dispatchEvent(new Event("gameComplete"));

		setSongData(songData);
		setComplete(true);
	}

	return (
		<>
			{
				complete ? (
					<Complete songData={songData} guesses={guesses} artist={artist} />
				) : (
					<section className={styles.attempts} id="attemptBoxes">
						{[0, 1, 2, 3, 4, 5].map((i) => {
							return <AttemptBox key={i} parentActive={ guesses.length == i } parentGuess={guesses[i]} />
						})}
					</section>
				)
			}
			<div className={styles.bottom}>
				<Player currentAttempt={ guesses.length } complete={complete} doNotAutoplay={doNotAutoplay} artist={artist} />
				<Input currentAttempt={ guesses.length } complete={complete} guess={guess} skip={skip} artist={artist} />
			</div>
		</>
	)
}