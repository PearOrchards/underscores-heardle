import { useState, useEffect } from "react";
import styles from "./attemptBox.module.scss";

export default function AttemptBox({ parentActive, parentGuess } : { parentActive: boolean, parentGuess: string }) {
	const [active, setActive] = useState<boolean>(parentActive);
	const [guess, setGuess] = useState<string>(parentGuess);
	
	useEffect(() => {
		setActive(parentActive);
		setGuess(parentGuess);
	}, [parentActive, parentGuess]);
	
	return (
		<div className={`${styles.attemptBox} ${ active ? styles.active : '' }`}>
			<p>{parentGuess}</p>
		</div>
	)
}