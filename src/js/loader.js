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
        const xpSection = document.querySelector("#xp");
        if (!timeline || !xpSection) return;

        const update = () => {
            const rect = xpSection.getBoundingClientRect();
            const viewport = window.innerHeight;
            const progress = Math.min(1, Math.max(0, (viewport * 0.65 - rect.top) / (rect.height - viewport * 0.25)));
            timeline.style.setProperty("--timeline-progress", progress.toFixed(3));
        };

        update();
        window.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
        window.addEventListener("resize", update);
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
