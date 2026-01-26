/**
 * Component Loader for Static Portfolio
 * Fetches HTML fragments and injects them into the DOM
 */
document.addEventListener("DOMContentLoaded", () => {
    const includeElements = document.querySelectorAll("[data-include]");

    async function loadComponent(el) {
        const file = el.getAttribute("data-include");
        try {
            const response = await fetch(file);
            if (response.ok) {
                const html = await response.text();
                el.innerHTML = html;

                // Handle dynamic year in footer if loaded
                const yearSpan = el.querySelector('#current-year');
                if (yearSpan) {
                    yearSpan.textContent = new Date().getFullYear();
                }

                // Recursive call to load nested components if any
                const nested = el.querySelectorAll("[data-include]");
                for (const n of nested) {
                    await loadComponent(n);
                }
            } else {
                console.error(`Error loading ${file}: ${response.statusText}`);
                el.innerHTML = `<div class="p-4 text-red-500">Error loading component: ${file}</div>`;
            }
        } catch (error) {
            console.error(`Fetch error for ${file}:`, error);
        }
    }

    function initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Optional: stop observing once revealed
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    }

    async function init() {
        const promises = Array.from(includeElements).map(el => loadComponent(el));
        await Promise.all(promises);
        initAnimations();
    }

    init();
});
