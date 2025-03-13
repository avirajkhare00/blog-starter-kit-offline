import Link from "next/link";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-20 mt-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight">
        <Link href="/" className="hover:underline">
          Blog
        </Link>
        .
      </h2>
      <div className="mt-4 md:mt-0">
        <Link 
          href="/saved-posts" 
          className="inline-flex items-center text-sm md:text-base font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Saved Posts
        </Link>
      </div>
    </div>
  );
};

export default Header;
