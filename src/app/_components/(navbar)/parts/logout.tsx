"use client";
import styles from "../navbar.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import { signOut } from "next-auth/react";

export default function Logout() {

    return (
        <>
            <FontAwesomeIcon icon={faRightFromBracket} className={styles.fa} onClick={() => signOut()} />
        </>
    )
}