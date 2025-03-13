import Container from "@/app/_components/container";
import Header from "@/app/_components/header";

export default function OfflinePage() {
  return (
    <main>
      <Container>
        <Header />
        <div className="text-center py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight mb-6">
            You are offline
          </h1>
          <p className="text-lg md:text-xl mb-8">
            It looks like you&apos;re not connected to the internet. Some content may not be available.
          </p>
          <p className="text-md mb-8">
            Don&apos;t worry though! Any blog posts you&apos;ve previously visited should still be accessible.
          </p>
          <a 
            href="/"
            className="bg-black hover:bg-white hover:text-black border border-black text-white font-bold py-3 px-12 lg:px-8 duration-200 transition-colors mb-6 lg:mb-0"
          >
            Go to Homepage
          </a>
        </div>
      </Container>
    </main>
  );
}

export const metadata = {
  title: 'Offline | Blog',
  description: 'You are currently offline',
};
