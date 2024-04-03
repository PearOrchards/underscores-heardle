import { useState, useEffect, useRef } from 'react';

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import styles from "./dialog.module.scss";

export default function Dialog({ isOpen, onClose, children } : { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
	const [showDialog, setShowDialog] = useState(isOpen);
	const close = () => setShowDialog(false);
	
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	
	useEffect(() => {
		const modal = dialogRef.current;
		
		if (modal) {
			if (showDialog) {
				modal.showModal();
			} else {
				modal.close();
				onClose();
			}
		}
	}, [showDialog]);
	
	useEffect(() => {
		setShowDialog(isOpen);
	}, [isOpen]);
	
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			close();
		}
	}
	
	return (
		<dialog ref={dialogRef} onKeyDown={handleKeyDown} className={styles.modal}>
			<FontAwesomeIcon icon={faXmark} onClick={close} className={styles.close} />
			{children}
		</dialog>
	)
}