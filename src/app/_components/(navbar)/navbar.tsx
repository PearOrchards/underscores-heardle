import Help from "./parts/help";
import Stats from "./parts/stats";
import About from "./parts/about";
import Login from "./parts/login";
import Edit from "./parts/edit";

import { BackButton } from "../(other)/back";

export default function Navbar({ display, createdBy, editMode = false }: { display?: string; createdBy?: string | null, editMode?: boolean }) {
  const pageTitle = display ? `${display} heardle` : `oheardle`;

  return (
    <nav className="w-full absolute top-0 left-0 grid grid-cols-[1fr_auto_1fr] items-center py-4 px-8 lg:px-[10vw] border-b border-white bg-background-secondary/50">
      {editMode ? (
        <BackButton />
      ): (
        <div className="flex justify-start gap-4">
          <Help />
          <Stats />
        </div>
      )}
      <div className="text-center flex flex-row items-center gap-4">
        <h1
          data-cy="page-title"
          className="text-3xl sm:text-4xl lg:text-6xl font-bold whitespace-nowrap"
        >
          { editMode && "editing: " }
          { pageTitle }
        </h1>
        {!editMode && createdBy && <Edit display={display} createdBy={createdBy} />}
      </div>
      {!editMode && (
        <div className="flex justify-end gap-4">
          <About />
          <Login />
        </div>
      )}
    </nav>
  );
}
