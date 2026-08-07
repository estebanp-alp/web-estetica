(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      menuToggle.classList.toggle("is-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.addEventListener("click", (event) => {
      if (!event.target.closest("a")) return;
      navMenu.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  }

  function initReviewCarousel() {
    document.querySelectorAll(".showcase-wrap:not(.services-wrap)").forEach((wrap) => {
      const track = wrap.querySelector(".showcase-grid");
      if (!track || !track.children.length) return;

      const cards = track.children;
      const prevBtn = wrap.querySelector(".showcase-arrow-prev");
      const nextBtn = wrap.querySelector(".showcase-arrow-next");
      const dotsBox = document.querySelector(`.carousel-dots[data-dots-for="${track.id}"]`);
      const dots = [];
      let activeDotIndex = 0;

      if (dotsBox) {
        Array.from(cards).forEach((card, index) => {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.setAttribute("aria-label", `Ir al elemento ${index + 1}`);
          if (index === 0) dot.classList.add("is-active");
          dot.addEventListener("click", () => {
            card.scrollIntoView({
              behavior: prefersReducedMotion ? "auto" : "smooth",
              inline: "start",
              block: "nearest",
            });
          });
          dotsBox.appendChild(dot);
          dots.push(dot);
        });
      }

      const setActiveDot = (index) => {
        if (index === activeDotIndex || !dots.length) return;
        dots[activeDotIndex]?.classList.remove("is-active");
        dots[index]?.classList.add("is-active");
        activeDotIndex = index;
      };

      if (dots.length) {
        const cardObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                setActiveDot(Array.prototype.indexOf.call(cards, entry.target));
                break;
              }
            }
          },
          { root: track, threshold: 0.6 }
        );
        Array.from(cards).forEach((card) => cardObserver.observe(card));
      }

      const updateArrows = () => {
        if (!prevBtn || !nextBtn) return;
        const maxScroll = track.scrollWidth - track.clientWidth - 2;
        prevBtn.disabled = track.scrollLeft <= 2;
        nextBtn.disabled = track.scrollLeft >= maxScroll;
      };

      let scrollScheduled = false;
      track.addEventListener(
        "scroll",
        () => {
          if (scrollScheduled) return;
          scrollScheduled = true;
          requestAnimationFrame(() => {
            updateArrows();
            scrollScheduled = false;
          });
        },
        { passive: true }
      );

      const scrollByCard = (direction) => {
        const step = cards[0].getBoundingClientRect().width + 14;
        track.scrollBy({
          left: step * direction,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      };

      prevBtn?.addEventListener("click", () => scrollByCard(-1));
      nextBtn?.addEventListener("click", () => scrollByCard(1));
      updateArrows();
    });
  }

  function initRevealAnimations() {
    const revealItems = document.querySelectorAll(".reveal-item");
    if (!revealItems.length) return;

    if (prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  function initServiceSearch() {
    const serviceSearch = document.getElementById("serviceSearch");
    const noResultsMsg = document.getElementById("servicesNoResults");
    const serviceCards = document.querySelectorAll("#servicesTrack .showcase-card");
    if (!serviceSearch || !serviceCards.length) return;

    let searchFrame = 0;

    serviceSearch.addEventListener("input", () => {
      cancelAnimationFrame(searchFrame);
      searchFrame = requestAnimationFrame(() => {
        const query = serviceSearch.value.trim().toLowerCase();
        let visibleCount = 0;

        serviceCards.forEach((card) => {
          const label = card.querySelector(".showcase-label");
          const text = label ? label.textContent.toLowerCase() : "";
          const matches = !query || text.includes(query);
          card.classList.toggle("is-filtered-hidden", !matches);
          if (matches) visibleCount += 1;
        });

        if (noResultsMsg) {
          noResultsMsg.hidden = visibleCount === 0;
        }
      });
    });
  }

  function initHeroVideo() {
    const heroVideo = document.querySelector(".hero-video");
    if (!heroVideo || !window.matchMedia("(min-width: 769px)").matches) return;

    const videoObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          heroVideo.preload = "metadata";
          heroVideo.load();
          heroVideo.play().catch(() => {});
          videoObserver.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    videoObserver.observe(heroVideo);
  }

  initNavigation();
  initReviewCarousel();
  initRevealAnimations();
  initServiceSearch();
  initHeroVideo();
})();
