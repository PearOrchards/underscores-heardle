import styles from "./complete.module.scss";
import { SongData } from "@/app/_components/SongData";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import Image from "next/image";
import Link from "next/link";

export default function Complete({ songData } : { songData: SongData | null }) {
	return (
		<section className={styles.complete}>
			<div className={styles.topBox}>
				<div className={styles.leftBlock}>
					<Image src={"/api/cover"} alt="" width={200} height={200}/>
					<span>
						<p>underscores</p>
						<p>{songData?.answer}</p>
					</span>
				</div>
				<Link href={songData?.link || ""} target="_blank" rel="noopener noreferrer">go ({songData?.source}) <FontAwesomeIcon icon={faChevronRight}/></Link>
			</div>
			<div className={styles.middleSection}>
			
			</div>
		</section>
	)
}