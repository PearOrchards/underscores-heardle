import styles from "./input.module.scss";
import { SongSuggestions } from "./SongSuggestions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useState, useRef } from "react";

export default function Input({ currentAttempt, complete, guess, skip, artist } : { currentAttempt: number, complete: boolean, guess: (g: string) => void, skip: () => void, artist: string }) {
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	const clear = () => {
		if (inputRef.current) inputRef.current.value = "";
	}
	const autocomplete = (suggestion: string) => {
		if (inputRef.current) inputRef.current.value = suggestion;
	}

	const onFocus = async () => {
		const stringToCheck = inputRef.current?.value;
		if (stringToCheck) {
			const suggestions = await SongSuggestions(artist, inputRef.current?.value || "");
			setSuggestions(suggestions);
			setShowSuggestions(true);
		}
		else blur();
	}
	const blur = () => {
		setTimeout(() => { // delay to allow click event to fire :(
			setShowSuggestions(false);
			suggestionsRef.current?.querySelector(`.${styles.selected}`)?.classList.remove(styles.selected);
		}, 100);
	}

	const submitGuess = async () => {
		if (!inputRef.current) return;
		const value = inputRef.current.value;
		const allSongs = await SongSuggestions(artist,"");

		if (allSongs.includes(value)) {
			guess(value);
			clear();
		}
	}

	const keyPress = (ev: React.KeyboardEvent<HTMLInputElement>) => {
		if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
			ev.preventDefault();
			const suggestions = suggestionsRef.current?.querySelectorAll("p");
			if (suggestions) {
				const oldSelected = suggestionsRef.current?.querySelector(`.${styles.selected}`);
				let newSelected;
				if (ev.key == "ArrowUp") {
					const index = oldSelected ? Array.from(suggestions).indexOf(oldSelected as HTMLParagraphElement) : suggestions.length;
					newSelected = suggestions[index - 1];
				} else { // ArrowDown
					const index = oldSelected ? Array.from(suggestions).indexOf(oldSelected as HTMLParagraphElement) : -1;
					newSelected = suggestions[index + 1];
				}
				if (newSelected) {
					oldSelected?.classList.remove(styles.selected);
					newSelected.classList.add(styles.selected);
				}
			}
		}
		if (ev.key === "Enter") {
			ev.preventDefault();
			const selected = suggestionsRef.current?.querySelector(`.${styles.selected}`);
			if (selected) { // Autocomplete
				autocomplete(selected.textContent || "");
				inputRef.current?.focus();
				blur();
			} else { // Submit, basically un-preventing default
				submitGuess();
			}
		}
		if (ev.key === "Escape") {
			blur();
		}
	}

	const hover = (ev: React.MouseEvent<HTMLParagraphElement>) => {
		const suggestions = suggestionsRef.current?.querySelectorAll("p");
		if (suggestions) {
			suggestions.forEach(s => s.classList.remove(styles.selected));
			ev.currentTarget.classList.add(styles.selected);
		}
	}

	return !complete ? (
		<section>
			<form className={styles.input} onSubmit={async (ev) => { ev.preventDefault(); await submitGuess() }}>
				<div className={`${styles.suggestions} ${showSuggestions ? styles.suggestionsShow : ""}`} ref={suggestionsRef}>
					{ suggestions.slice(0, 9).map(s => (
						<p onMouseEnter={hover} onMouseDown={() => autocomplete(s)} key={s}>{s}</p>
					)) }
				</div>
				<input type="text" onFocus={onFocus} onBlur={blur} onChange={onFocus} onKeyDown={keyPress} placeholder="Know it? Search for the title" ref={inputRef} data-cy="textInput" />
				<FontAwesomeIcon icon={faSearch} />
				<FontAwesomeIcon icon={faXmark} onClick={clear}/>
			</form>
			<div className={styles.buttonRow}>
				<button onClick={skip} data-cy="skipBtn">SKIP {
					currentAttempt < 5 ? `(+${Math.pow(2, currentAttempt)}s)` : ""
				}</button>
				<button onClick={submitGuess} data-cy="submitBtn">SUBMIT</button>
			</div>
		</section>
	): null;
}