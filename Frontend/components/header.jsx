import Link from "next/link";

const Header = () => {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Deepa&apos;s Vision
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#workspace" className="hover:text-blue-600">Workspace</a>
          <a href="#api" className="hover:text-blue-600">API</a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
