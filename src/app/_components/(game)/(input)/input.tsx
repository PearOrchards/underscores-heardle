"use client";
import styles from "./input.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";

export default function Input() {
	const [input, setInput] = useState<string>("");
	
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	}
	
	const clear = () => {
		setInput("");
	}
	
	return (
		<>
			<form className={styles.input}>
				<input type="text" value={input} onChange={handleChange} placeholder="Know it? Search for the title"/>
				<FontAwesomeIcon icon={faSearch}/>
				<FontAwesomeIcon icon={faXmark} onClick={clear}/>
			</form>
			<div className={styles.buttonRow}>
				<button>SKIP (+1s)</button>
				<button>SUBMIT</button>
			</div>
		</>
	)
}