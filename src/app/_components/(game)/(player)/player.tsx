"use client";
import styles from "./player.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStop } from "@fortawesome/free-solid-svg-icons";

import {useState, useRef, useEffect} from "react";

export default function Player({ currentAttempt } : { currentAttempt: number }) {
	const [playing, setPlaying] = useState<boolean>(false);
	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
	const [displayedTime, setDisplayedTime] = useState<number>(0);
	const audioRef = useRef<HTMLAudioElement>(null);
	
	const play = () => {
		if (audioRef.current) {
			audioRef.current.play();
			setPlaying(true);
			
			const timer = setTimeout(() => {
				stop();
			}, Math.pow(2, currentAttempt) * 1000);
			setTimer(timer);
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
	
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.addEventListener('timeupdate', () => {
				setDisplayedTime(Math.floor(audioRef.current?.currentTime || 0));
			});
		}
	}, []);
	
	return (
		<>
			<audio src="" ref={audioRef}></audio>
			<div className={styles.track}>
				<div className={styles.innerTrack}>
					{[0, 1, 2, 3, 4, 5].map((i) => {
						return <div className={`${styles.block} ${currentAttempt >= i ? styles.active : ""}`}
						            key={i}></div>
					})}
				</div>
				<div className={`${styles.progress} ${ playing ? styles.progressPlay : ""}`}></div>
			</div>
			<div className={styles.playerBtn} onClick={ !playing ? play : stop }>
				{
					!playing ? <FontAwesomeIcon icon={faPlay}/> : <FontAwesomeIcon icon={faStop}/>
				}
			</div>
			<div className={styles.playerTime}>
				<p>0:{ String(displayedTime).padStart(2, '0') }</p>
				<p>0:16</p>
			</div>
		</>
	)
}