import SmoothScroll from "@/components/landing/SmoothScroll";
import ScrollFx from "@/components/landing/ScrollFx";
import GrainCanvas from "@/components/landing/GrainCanvas";
import { Nav, Hero } from "@/components/landing/Hero";
import { ShowcasePreview } from "@/components/landing/ShowcasePreview";
import { PlatformCards } from "@/components/landing/PlatformCards";
import { FeaturePanel } from "@/components/landing/FeaturePanel";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <SmoothScroll>
        <div className="kairos-web">
          <Nav />
          <main className="relative z-[2] mb-[100dvh]">
            <Hero />
            <ShowcasePreview />
            <PlatformCards />
            <FeaturePanel />
          </main>
          <Footer />
          <div className="ks-frame" aria-hidden="true" />
          <ScrollFx />
        </div>
      </SmoothScroll>
      <GrainCanvas />
    </>
  );
}
