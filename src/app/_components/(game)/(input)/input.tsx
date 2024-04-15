"use client";
import styles from "./input.module.scss";
import { songs } from "./songs";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useState, useRef } from "react";

export default function Input({ currentAttempt } : { currentAttempt: number }) {
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
	
	return (
		<>
			<form className={styles.input}>
				<div className={`${styles.suggestions} ${showSuggestions ? styles.suggestionsShow : ""}`}>
					{ suggestions.slice(0, 9).map(s => (
						<p onClick={() => autocomplete(s)} key={s}>{s}</p>
					)) }
				</div>
				<input type="text" onFocus={onFocus} onBlur={blur} onChange={onFocus} placeholder="Know it? Search for the title" ref={inputRef}/>
				<FontAwesomeIcon icon={faSearch}/>
				<FontAwesomeIcon icon={faXmark} onClick={clear}/>
			</form>
			<div className={styles.buttonRow}>
				<button>SKIP {
					currentAttempt < 5 ? `(+${Math.pow(2, currentAttempt)}s)` : ""
				}</button>
				<button>SUBMIT</button>
			</div>
		</>
	)
}