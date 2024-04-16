import styles from "./input.module.scss";
import { songs } from "./songs";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useState, useRef } from "react";

export default function Input({ currentAttempt, complete, guess } : { currentAttempt: number, complete: boolean, guess: (g: string) => void }) {
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	
	const clear = () => {
		if (inputRef.current) inputRef.current.value = "";
	}
	const autocomplete = (suggestion: string) => {
		if (inputRef.current) inputRef.current.value = suggestion;
	}
	
	const onFocus = async () => {
		const stringToCheck = inputRef.current?.value;
		if (stringToCheck) {
			const suggestions = await songs(inputRef.current?.value || "");
			setSuggestions(suggestions);
			setShowSuggestions(true);
		}
		else blur();
	}
	const blur = () => {
		setTimeout(() => { // delay to allow click event to fire :(
			setShowSuggestions(false);
		}, 100);
	}
	
	const submitGuess = async () => {
		if (!inputRef.current) return;
		const value = inputRef.current.value;
		const allSongs = await songs("");
		
		if (allSongs.includes(value)) {
			guess(value);
			clear();
		}
	}
	
	return !complete ? (
		<section>
			<form className={styles.input} onSubmit={async (ev) => { ev.preventDefault(); await submitGuess() }}>
				<div className={`${styles.suggestions} ${showSuggestions ? styles.suggestionsShow : ""}`}>
					{ suggestions.slice(0, 9).map(s => (
						<p onClick={() => autocomplete(s)} key={s}>{s}</p>
					)) }
				</div>
				<input type="text" onFocus={onFocus} onBlur={blur} onChange={onFocus} placeholder="Know it? Search for the title" ref={inputRef}/>
				<FontAwesomeIcon icon={faSearch} />
				<FontAwesomeIcon icon={faXmark} onClick={clear}/>
			</form>
			<div className={styles.buttonRow}>
				<button>SKIP {
					currentAttempt < 5 ? `(+${Math.pow(2, currentAttempt)}s)` : ""
				}</button>
				<button onClick={submitGuess} >SUBMIT</button>
			</div>
		</section>
	): null;
}