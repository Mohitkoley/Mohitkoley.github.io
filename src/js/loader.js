document.addEventListener("DOMContentLoaded", () => {
    const includeElements = document.querySelectorAll("[data-include]");

    async function loadComponent(el) {
        const file = el.getAttribute("data-include");
        try {
            const response = await fetch(file, { cache: "no-cache" });
            if (!response.ok) {
                throw new Error(response.statusText);
            }

            el.innerHTML = await response.text();

            const yearSpan = el.querySelector("#current-year");
            if (yearSpan) {
                yearSpan.textContent = new Date().getFullYear();
            }

            const nested = el.querySelectorAll("[data-include]");
            for (const node of nested) {
                await loadComponent(node);
            }
        } catch (error) {
            console.error(`Fetch error for ${file}:`, error);
            el.innerHTML = `<div class="p-4 text-red-500">Error loading component: ${file}</div>`;
        }
    }

    function initAnimations() {
        const animated = document.querySelectorAll(".animate-on-scroll, .reveal");
        const sections = document.querySelectorAll("section[id]");
        const navLinks = document.querySelectorAll(".nav-item");

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -50px 0px",
        });

        animated.forEach((el) => revealObserver.observe(el));

        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        }, {
            threshold: 0.25,
            rootMargin: "-30% 0px -55% 0px",
        });

        sections.forEach((section) => navObserver.observe(section));
    }

    function initContactForm() {
        const form = document.querySelector("#contact-form");
        if (!form) return;

        const submitBtn = document.querySelector("#submit-btn");
        const btnText = document.querySelector("#btn-text");
        const btnLoader = document.querySelector("#btn-loader");

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            submitBtn.disabled = true;
            btnText.textContent = "Sending...";
            btnLoader.classList.remove("hidden");

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Form submission failed");
                }

                alert("Thanks for your message! I will get back to you soon.");
                form.reset();
            } catch (error) {
                alert("Oops! There was a problem submitting your form");
            } finally {
                submitBtn.disabled = false;
                btnText.textContent = "Send Message";
                btnLoader.classList.add("hidden");
            }
        });
    }

    function initHeroPhoneTilt() {
        const phone = document.querySelector(".hero-phone");
        if (!phone || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        phone.addEventListener("pointermove", (event) => {
            const rect = phone.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            phone.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
        });

        phone.addEventListener("pointerleave", () => {
            phone.style.transform = "";
        });
    }

    function initTimelineProgress() {
        const timeline = document.querySelector(".timeline-line");
        const track = document.querySelector(".career-track");
        const markers = document.querySelectorAll(".career-marker");
        if (!timeline || !track || markers.length < 2) return;

        let ticking = false;

        const update = () => {
            const first = markers[0].getBoundingClientRect();
            const last = markers[markers.length - 1].getBoundingClientRect();
            const firstCenter = first.top + first.height / 2;
            const lastCenter = last.top + last.height / 2;
            const playhead = window.innerHeight * 0.45;
            const distance = Math.max(1, lastCenter - firstCenter);
            const progress = Math.min(1, Math.max(0, (playhead - firstCenter) / distance));

            markers.forEach((marker) => {
                const rect = marker.getBoundingClientRect();
                const markerCenter = rect.top + rect.height / 2;
                marker.classList.toggle("is-active", markerCenter <= playhead);
            });
            timeline.style.setProperty("--timeline-progress", progress.toFixed(3));
            ticking = false;
        };

        const requestUpdate = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);
    }

    async function init() {
        await Promise.all(Array.from(includeElements).map((el) => loadComponent(el)));
        initAnimations();
        initContactForm();
        initHeroPhoneTilt();
        initTimelineProgress();
    }

    init();
});
