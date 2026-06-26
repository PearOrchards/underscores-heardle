import Help from "./parts/help";
import Stats from "./parts/stats";
import About from "./parts/about";

export default function Navbar({ display }: { display?: string }) {
  return (
    <nav className="w-full absolute top-0 left-0 grid grid-cols-[1fr_auto_1fr] items-center py-4 px-8 lg:px-[10vw] border-b border-white bg-background-secondary/50">
      <div className="flex justify-start gap-4">
        <About />
      </div>
      <div className="text-center">
        <h1
          data-cy="page-title"
          className="text-3xl sm:text-4xl lg:text-6xl font-bold whitespace-nowrap"
        >
          {display ? `${display} heardle` : `pheardle`}
        </h1>
      </div>
      <div className="flex justify-end gap-4">
        <Stats />
        <Help />
      </div>
    </nav>
  );
}
