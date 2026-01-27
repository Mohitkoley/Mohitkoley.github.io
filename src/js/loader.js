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

    async function initContactForm() {
        const form = document.querySelector('#contact-form');
        if (!form) return;

        const submitBtn = document.querySelector('#submit-btn');
        const btnText = document.querySelector('#btn-text');
        const btnLoader = document.querySelector('#btn-loader');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Set loading state
            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            btnLoader.classList.remove('hidden');

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('Thanks for your message! I will get back to you soon.');
                    form.reset();
                } else {
                    const result = await response.json();
                    alert(result.errors ? result.errors.map(error => error.message).join(", ") : "Oops! There was a problem submitting your form");
                }
            } catch (error) {
                alert("Oops! There was a problem submitting your form");
            } finally {
                // Revert button state
                submitBtn.disabled = false;
                btnText.textContent = 'Send Message';
                btnLoader.classList.add('hidden');
            }
        });
    }

    async function init() {
        const promises = Array.from(includeElements).map(el => loadComponent(el));
        await Promise.all(promises);
        initAnimations();
        initContactForm();
    }

    init();
});
