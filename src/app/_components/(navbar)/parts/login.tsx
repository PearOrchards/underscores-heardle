"use client";
import styles from "../navbar.module.scss";
import loginStyles from "./login.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";
import Dialog from "@/app/_components/(dialog)/dialog";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Login() {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  return (
    <>
      <FontAwesomeIcon
        icon={faRightToBracket}
        className={styles.fa}
        onClick={openLoginModal}
      />
      <Dialog isOpen={showLoginModal} onClose={closeLoginModal}>
        <h2>login</h2>
        <p style={{ paddingBottom: "0" }}>
          You can sync your game data and stuff across devices now.
        </p>
        <div>
          <button
            className={loginStyles.google}
            onClick={() => signIn("google")}
          >
            <Image
              alt="Google Icon"
              src="/google_neutral_rd_na.svg"
              width={36}
              height={36}
            />{" "}
            Sign in with Google
          </button>
        </div>
        <p
          style={{
            fontSize: "0.875rem",
            paddingTop: "1rem",
            opacity: "0.75",
          }}
        >
          Side note: Signing in with other services makes you applicable to
          their Terms and Privacy Notices.
        </p>
      </Dialog>
    </>
  );
}
