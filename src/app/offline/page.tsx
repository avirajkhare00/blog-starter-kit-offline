import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import OfflineContent from "./offline-content";

export const metadata = {
  title: 'Offline | Blog',
  description: 'You are currently offline - Access your saved blog posts',
};

export default function OfflinePage() {
  return (
    <main>
      <Container>
        <Header />
        <OfflineContent />
      </Container>
    </main>
  );
}


