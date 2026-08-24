"use client";

import { useEffect } from "react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function ScrollFx() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    let io: IntersectionObserver | undefined;
    if (reduced || revealEls.length === 0) {
      revealEls.forEach((el) => el.classList.add("is-inview"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-inview");
              io?.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px" }
      );
      revealEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add("is-inview");
        } else {
          io?.observe(el);
        }
      });
    }

    const parallaxEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    ).map((el) => ({ el, parent: el.closest(".ks-art") ?? el.parentElement! }));

    const curtain = document.querySelector<HTMLElement>(".ks-curtain");
    const footer = document.querySelector<HTMLElement>(".ks-footer");

    const update = () => {
      if (reduced) return;
      const vh = window.innerHeight;

      for (const { el, parent } of parallaxEls) {
        const r = parent.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const centerDelta = r.top + r.height / 2 - vh / 2;
        el.style.setProperty("--py-img", `${(-centerDelta / vh) * 90}px`);
      }

      if (curtain) {
        const r = curtain.getBoundingClientRect();
        const p = clamp01((vh - r.top) / (vh * 0.85));
        curtain.style.setProperty("--py", `${(1 - p) * 48}px`);
        curtain.style.setProperty("--clip-bottom", `${(1 - p) * 110}px`);
      }

      if (footer) {
        const max = document.documentElement.scrollHeight - vh;
        const p = clamp01((window.scrollY - (max - vh)) / vh);
        footer.style.setProperty("--ks-footer-opacity", p.toFixed(3));
        footer.style.setProperty(
          "--ks-footer-pe",
          p > 0.5 ? "auto" : "none"
        );
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return null;
}
