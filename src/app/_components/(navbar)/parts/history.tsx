import { useEffect, useState } from "react";

import Dialog from '@/app/_components/(dialog)/dialog';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

import styles from "./history.module.scss";

export default function History() {
	const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
	const [history, setHistory] = useState<any>();
	const [selectedTitleElement, setSelectedTitleElement] = useState<string>("");

	const openHistoryModal = () => setShowHistoryModal(true);
	const closeHistoryModal = () => setShowHistoryModal(false);

	const getHistory = () => {
		const history = window.localStorage.getItem("history");
		if (history) {
			setHistory(JSON.parse(history));
		}
	}

	useEffect(() => {
		getHistory();
		window.addEventListener("gameComplete", getHistory); // custom event handler. fired in game.tsx
	}, []);

	return (
		<>
			<button onClick={openHistoryModal}>
				<FontAwesomeIcon icon={faClock} />
				historical data
			</button>
			<Dialog isOpen={showHistoryModal} onClose={closeHistoryModal}>
				<h2>history</h2>
				{
					history ? (
						<section className={styles.table}>
							{
								Object.entries(history).filter(([, data]: any) => data.guesses).map(([date, data]: any) => (
									<div key={date}>
										<div className={styles.title} onClick={() => setSelectedTitleElement(date)}>
											<p className={styles.date}>{date}</p>
											<p className={styles.data}>{data.answer}</p>
										</div>
										<div className={`${styles.guesses} ${selectedTitleElement == date ? "" : styles.hidden}`}>
											{
												data.guesses.map((guess: string, index: number) => (
													<p key={index}>{index + 1}: {guess}</p>
												))
											}
										</div>
									</div>
								))
							}
						</section>
					) : (
						<p>No history yet.</p>
					)
				}
			</Dialog>
		</>
	)
}