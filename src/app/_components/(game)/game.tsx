"use client";
import styles from "./game.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useState, useEffect } from "react";
import AttemptBox from "@/app/_components/(attemptBox)/attemptBox";

export default function Game() {
	const [currentAttempt, setCurrentAttempt] = useState<number>(0);
	
	useEffect(() => {
		if (typeof window !== "undefined" && window.localStorage) {
			const attempts = window.localStorage.getItem("attempts");
			if (attempts) {
				setCurrentAttempt(parseInt(attempts));
			}
		}
		
		console.log(currentAttempt);
	}, []);
	
	return (
		<>
			<div className={styles.attempts}>
				{[0, 1, 2, 3, 4, 5].map((i) => {
					return <AttemptBox key={i} parentActive={ currentAttempt == i } parentGuess={""} />
				})}
			</div>
		</>
	)
}