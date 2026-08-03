import Hero from "@/components/scenes/Hero";
import Manifesto from "@/components/scenes/Manifesto";
import Ambition from "@/components/scenes/Ambition";
import Waitlist from "@/components/scenes/Waitlist";
import Footer from "@/components/Footer";

// La página solo compone las escenas, en el orden de la narrativa.
export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Manifesto />
        <Ambition />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
