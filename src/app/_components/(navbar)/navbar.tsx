"use client";
import styles from "./navbar.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faChartSimple, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";
import Link from "next/link";

import Dialog from "@/app/_components/(dialog)/dialog";

export default function Navbar() {
	const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
	const openAboutModal = () => {
		setShowAboutModal(true);
	}
	const closeAboutModal = () => {
		setShowAboutModal(false);
	}
	
	return (
		<nav className={styles.nav}>
			<div className={styles.left}>
				<FontAwesomeIcon icon={faCircleInfo} className={styles.fa} onClick={openAboutModal} />
				<Dialog isOpen={showAboutModal} onClose={closeAboutModal} >
					<h2>about</h2>
					<p>A recreation of Heardle for underscores, with all songs taken from the tracker (beyond skin purifying treatment).</p>
					<p>Built by <Link href="https://www.orchards.dev">Pear</Link>, for the <Link href="https://www.youtube.com/playlist?list=PLAEc0HKmIWO-oDNPLi1aL1aazsqdxYhPg">daily underscores heardle series</Link>.</p>
				</Dialog>
			</div>
			<div className={styles.center}>
				<h1>underscores heardle</h1>
			</div>
			<div className={styles.right}>
				<FontAwesomeIcon icon={faChartSimple} className={styles.fa} />
				<FontAwesomeIcon icon={faCircleQuestion} className={styles.fa} />
			</div>
		</nav>
	)
}