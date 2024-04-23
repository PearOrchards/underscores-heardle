"use client";
import styles from "../navbar.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";
import Link from "next/link";

import Dialog from "@/app/_components/(dialog)/dialog";

export default function About() {
	const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
	const openAboutModal = () => setShowAboutModal(true);
	const closeAboutModal = () => setShowAboutModal(false);
	
	return (
		<>
			<FontAwesomeIcon icon={faCircleInfo} className={styles.fa} onClick={openAboutModal} />
			<Dialog isOpen={showAboutModal} onClose={closeAboutModal} >
				<h2>about</h2>
				<p>A recreation of Heardle for underscores, with all songs taken from the tracker (mostly beyond skin purifying treatment).</p>
				<p>Built by <Link href="https://www.orchards.dev">Pear</Link>, for the <Link href="https://www.youtube.com/playlist?list=PLAEc0HKmIWO-oDNPLi1aL1aazsqdxYhPg">daily underscores heardle series</Link>.</p>
				<p>Also please check out the <Link href="https://heardle.apictureof.me/">original underscores heardle</Link> by shelly, it contains only soundcloud releases for those who want a fairer chance</p>
			</Dialog>
		</>
	)
}