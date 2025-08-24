"use client";
import styles from "../navbar.module.scss";
import loginStyles from "./login.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";
import Dialog from "@/app/_components/(dialog)/dialog";
import {signIn} from "next-auth/react";
import Image from "next/image";

export default function Login() {
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const openLoginModal = () => setShowLoginModal(true);
    const closeLoginModal = () => setShowLoginModal(false);

    return (
        <>
            <FontAwesomeIcon icon={faRightToBracket} className={styles.fa} onClick={openLoginModal} />
            <Dialog isOpen={showLoginModal} onClose={closeLoginModal}>
                <h2>login</h2>
                <div>
                    <button className={loginStyles.google} onClick={() => signIn("google")}><Image alt="Google Icon" src="/google_neutral_rd_na.svg" width={36} height={36}/> Sign in with Google</button>
                </div>
            </Dialog>
        </>
    )
}