import { Link } from "react-router";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-4">
          <BrandLogo surface="dark" className="h-12 w-auto max-w-[220px]" />
          <p className="max-w-md text-sm leading-6 text-slate-300">
            CareerPilot AI provides the architecture foundation for AI-assisted
            career success workflows.
          </p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-slate-300">
          <Link className="hover:text-white" to="/">
            Home
          </Link>
          <Link className="hover:text-white" to="/login">
            Login
          </Link>
          <Link className="hover:text-white" to="/dashboard">
            Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}

