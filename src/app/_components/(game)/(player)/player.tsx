import styles from "./player.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStop, faEllipsis, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

import {useState, useRef, useEffect} from "react";
import Dialog from "@/app/_components/(dialog)/dialog";
import { SongToday } from "@/app/_components/SongToday";

const audioLink = () => {
	const now = new Date();
	const str = now.toISOString().split("T")[0];
	return `/api/audio?t=${str}`;
}

export default function Player({ currentAttempt, complete, doNotAutoplay } : { currentAttempt: number, complete: boolean, doNotAutoplay: boolean }) {
	// Player functionality states
	const [ready, setReady] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [playing, setPlaying] = useState<boolean>(false);
	
	// Player timer states
	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
	const [displayedTime, setDisplayedTime] = useState<number>(0);
	
	// Modal states (for errors)
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const openErrorModal = () => setModalOpen(true);
	const closeErrorModal = () => setModalOpen(false);
	const [song, setSong] = useState<string>(""); // ONLY TO BE SET WHEN AN ERROR OCCURS
	
	const audioRef = useRef<HTMLAudioElement>(null);
	
	const play = () => {
		if (!ready) return;
		
		if (audioRef.current) {
			audioRef.current.play();
			setPlaying(true);
			
			if (!complete) {
				const timer = setTimeout(() => {
					stop();
				}, Math.pow(2, currentAttempt) * 1000);
				setTimer(timer);
			}
		}
	}
	
	const stop = () => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
			setPlaying(false);
			
			if (timer) {
				clearTimeout(timer);
				setTimer(null);
			}
		}
	}
	
	// Audio loading and time display
	useEffect(() => {
		if (audioRef.current) {
			fetch(audioLink())
				.then(r => {
					if (r.ok) return r.arrayBuffer();
					else {
						if (r.status === 408) {
							setError("Hang on! We can't connect to the API. You can either try again later or click this box to get the answer.")
							SongToday().then((s) => setSong(s.answer));
						} else if (r.status === 418) {
							setError("AH!!! You cut us off! Please reload and be patient!")
						} else {
							setError("Something went wrong... Please try again (later) or click this box to get the answer.")
							SongToday().then(s => setSong(s.answer));
						}
						return null;
					}
				})
				.then(buffer => {
					if (audioRef.current && buffer instanceof ArrayBuffer) {
						audioRef.current.src = URL.createObjectURL(new Blob([buffer], {type: "audio/mpeg"}));
						setReady(true);
					}
				});
			// End of fetch
			
			audioRef.current.addEventListener('timeupdate', () => {
				setDisplayedTime(Math.floor(audioRef.current?.currentTime || 0));
			});
		}
	}, []);
	
	useEffect(() => {
		if (complete && audioRef.current && !doNotAutoplay) {
			if (timer) { // Cancel the timer if it's still running
				clearTimeout(timer);
				setTimer(null);
			}
			
			audioRef.current.play();
			setPlaying(true);
		}
	}, [complete]);
	
	return (
		<section>
			<audio ref={audioRef}></audio>
			<div className={styles.track}>
				<div className={styles.innerTrack} data-cy="innerTrack">
					{ !complete ? [0, 1, 2, 3, 4, 5].map((i) => {
						return <div className={`${styles.block} ${currentAttempt >= i ? styles.active : ""}`} key={i}></div>
					}) : null }
				</div>
				<div className={`${styles.progress} ${ playing ? styles.progressPlay : ""}`} style={{ animationDuration: complete ? Math.floor(audioRef.current?.duration || 0) + "s" : "32s" }}></div>
			</div>
			<div className={styles.playerBtn} onClick={ !playing ? play : stop } data-cy="playerBtn">
				{
					ready ?
						!playing ? <FontAwesomeIcon icon={faPlay}/> : <FontAwesomeIcon icon={faStop}/>
						: <FontAwesomeIcon icon={faEllipsis} opacity={0.5} />
				}
			</div>
			<div className={styles.playerTime}>
				<p>
					{
						Math.floor(displayedTime / 60) + ":" + String(Math.floor(displayedTime % 60)).padStart(2, '0')
					}
				</p>
				<p>
					{ !complete // The reason this uses audioRef.current.duration rather than using state is because it doesn't change.
						? "0:32"
						: Math.floor((audioRef.current?.duration || 0) / 60) + ":" + String(Math.floor(audioRef.current?.duration || 0) % 60).padStart(2, '0')
					}
				</p>
			</div>
			{ error
				? <>
					<p className={styles.playerError} onClick={openErrorModal}>
						<FontAwesomeIcon icon={faExclamationCircle} />
						{error}
					</p>
					<Dialog isOpen={modalOpen} onClose={closeErrorModal}>
						<h2>whoops</h2>
						<p>
							Since something has gone wrong, we&apos;ll just give you the answer <br />
							It&apos;s &quot;{song}&quot;
						</p>
					</Dialog>
				</> : null
			}
		</section>
	)
}