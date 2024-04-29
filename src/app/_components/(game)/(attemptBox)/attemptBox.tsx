import { useState, useEffect } from "react";
import styles from "./attemptBox.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faForward } from "@fortawesome/free-solid-svg-icons";

export default function AttemptBox({ parentActive, parentGuess } : { parentActive: boolean, parentGuess: string }) {
	const [active, setActive] = useState<boolean>(parentActive);
	
	useEffect(() => {
		setActive(parentActive);
	}, [parentActive]);
	
	return (
		<div className={`${styles.attemptBox} ${ active ? styles.active : '' }`}>
			<p>
				{ parentGuess === "" ?
					<>
						<FontAwesomeIcon icon={faForward} /> <span>SKIPPED</span>
					</> :
					parentGuess !== undefined ?
						<>
							<FontAwesomeIcon icon={faTimes} /> <span>{parentGuess}</span>
						</>
						: null
				}
			</p>
		</div>
	)
}