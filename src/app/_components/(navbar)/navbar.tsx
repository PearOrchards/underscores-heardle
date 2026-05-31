import styles from "./navbar.module.scss";

import Help from "./parts/help";
import Stats from "./parts/stats";
import About from "./parts/about";
import Login from "./parts/login";
import Logout from "./parts/logout";

import { useSession } from "next-auth/react";

export default function Navbar({ display }: { display?: string }) {
  const { data: session, status } = useSession();

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <About />
        <Help />
      </div>
      <div className={styles.center}>
        <h1 data-cy="page-title">
          {display ? `${display} heardle` : `heardle`}
        </h1>
      </div>
      <div className={styles.right}>
        <Stats />
        {!session?.user ? <Login /> : <Logout />}
      </div>
    </nav>
  );
}
