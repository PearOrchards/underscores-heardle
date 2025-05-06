import styles from "./navbar.module.scss";

import Help from "./parts/help";
import Stats from "./parts/stats";
import About from "./parts/about";

export default function Navbar({ display }: { display?: string }) {
	return (
		<nav className={styles.nav}>
			<div className={styles.left}>
				<About />
			</div>
			<div className={styles.center}>
				<h1 data-cy='page-title'>{ display ? `${display} heardle` : `heardle`}</h1>
			</div>
			<div className={styles.right}>
				<Stats />
				<Help />
			</div>
		</nav>
	)
}