"use client";
import styles from "./navbar.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faChartSimple, faCircleQuestion, faMusic, faVolumeHigh, faThumbsUp } from "@fortawesome/free-solid-svg-icons";


import { useState } from "react";
import Link from "next/link";

import Dialog from "@/app/_components/(dialog)/dialog";

export default function Navbar() {
	const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
	const [showChartModal, setShowChartModal] = useState<boolean>(false);
	const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
	const openAboutModal = () => setShowAboutModal(true);
	const closeAboutModal = () => setShowAboutModal(false);
	
	const openHelpModal = () => setShowHelpModal(true);
	const closeHelpModal = () => setShowHelpModal(false);
	
	return (
		<nav className={styles.nav}>
			<div className={styles.left}>
				<FontAwesomeIcon icon={faCircleInfo} className={styles.fa} onClick={openAboutModal} />
				<Dialog isOpen={showAboutModal} onClose={closeAboutModal} >
					<h2>about</h2>
					<p>A recreation of Heardle for underscores, with all songs taken from the tracker (mostly beyond skin purifying treatment).</p>
					<p>Built by <Link href="https://www.orchards.dev">Pear</Link>, for the <Link href="https://www.youtube.com/playlist?list=PLAEc0HKmIWO-oDNPLi1aL1aazsqdxYhPg">daily underscores heardle series</Link>.</p>
					<p>Also please check out the <Link href="https://heardle.apictureof.me/">original underscores heardle</Link> by shelly, it contains only soundcloud releases for those who want a fairer chance</p>
				</Dialog>
			</div>
			<div className={styles.center}>
				<h1>underscores heardle</h1>
			</div>
			<div className={styles.right}>
				<FontAwesomeIcon icon={faChartSimple} className={styles.fa} />
				
				
				<FontAwesomeIcon icon={faCircleQuestion} className={styles.fa} onClick={openHelpModal} />
				<Dialog isOpen={showHelpModal} onClose={closeHelpModal}>
					<h2>how to play</h2>
					<div>
						<p><FontAwesomeIcon icon={faMusic} /> Listen to the intro, then find the correct song in the list.</p>
						<p><FontAwesomeIcon icon={faVolumeHigh} /> Skipped or incorrect attempts unlock more of the intro.</p>
						<p><FontAwesomeIcon icon={faThumbsUp} /> Answer in as few tries as possible and share your score!</p>
					</div>
					<h3><i>good luck!</i></h3>
					
					<button className="alt" onClick={closeHelpModal}>PLAY</button>
					
				</Dialog>
			</div>
		</nav>
	)
}