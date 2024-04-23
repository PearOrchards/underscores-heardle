"use client";
import styles from "../navbar.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion, faMusic, faThumbsUp, faVolumeHigh} from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";

import Dialog from "@/app/_components/(dialog)/dialog";

export default function Help() {
	const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
	const openHelpModal = () => setShowHelpModal(true);
	const closeHelpModal = () => setShowHelpModal(false);
	
	return (
		<>
			<FontAwesomeIcon icon={faCircleQuestion} className={styles.fa} onClick={openHelpModal}/>
			<Dialog isOpen={showHelpModal} onClose={closeHelpModal}>
				<h2>how to play</h2>
				<div>
					<p><FontAwesomeIcon icon={faMusic}/> Listen to the intro, then find the correct song in the
						list.</p>
					<p><FontAwesomeIcon icon={faVolumeHigh}/> Skipped or incorrect attempts unlock more of the
						intro.</p>
					<p><FontAwesomeIcon icon={faThumbsUp}/> Answer in as few tries as possible and share your score!
					</p>
				</div>
				<h3><i>good luck!</i></h3>
				
				<button className="alt" onClick={closeHelpModal}>PLAY</button>
			
			</Dialog>
		</>
	)
}