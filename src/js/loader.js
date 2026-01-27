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

    function initProjectCards() {
        const modal = document.getElementById('playStoreModal');
        const modalContent = document.getElementById('modalContent');
        const closeModal = document.getElementById('closeModal');
        const laylaCard = document.querySelector('.layla-card');
        const projectImageCards = document.querySelectorAll('.project-image-card');

        // Show image modal for project cards (NO store buttons)
        function showImageModal(imageUrl, projectName) {

            modalContent.innerHTML = `
        <div class="relative">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">${projectName}</h3>
            
            <div class="flex justify-center items-center">
                <img src="${imageUrl}" alt="${projectName}" 
                     class="max-w-full h-auto rounded-lg shadow-lg" 
                     style="max-height: 70vh;">
            </div>

            <div class="mt-6 text-center">
                <button onclick="document.getElementById('playStoreModal').classList.add('hidden')" 
                        class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;
            modal.classList.remove('hidden');
        }


        // Show Layla modal
        function showLaylaModal() {
            modalContent.innerHTML = `
                <div class="text-center">
                    <div class="text-6xl mb-4">🤖</div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Layla AI</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">ChatGPT-clone mobile app integrating OpenAI API, Stripe payments, and real-time Firestore storage.</p>
                    <div class="flex justify-center gap-4 mb-6">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-500">⭐ 4.7</div>
                            <div class="text-sm text-gray-500">Rating</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-500">5K+</div>
                            <div class="text-sm text-gray-500">Downloads</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-500">Productivity</div>
                            <div class="text-sm text-gray-500">Category</div>
                        </div>
                    </div>
                    <div class="flex gap-3 justify-center">
                        <button onclick="document.getElementById('playStoreModal').classList.add('hidden')" 
                                class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
        }

        // Add click listeners to project image cards (except when clicking Play Store button)
        projectImageCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Prevent modal from opening if Play Store button is clicked
                if (e.target.closest('.play-store-icon')) {
                    return;
                }

                const imageUrl = card.dataset.imageUrl;
                const projectName = card.querySelector('h3').textContent;
                const appStoreUrl = card.dataset.appStoreUrl || '';
                showImageModal(imageUrl, projectName, appStoreUrl);
            });
        });

        // Add click listener to Layla card only
        if (laylaCard) {
            laylaCard.addEventListener('click', (e) => {
                e.preventDefault();
                showLaylaModal();
            });
        }

        // Modal close handlers
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });
    }

    async function init() {
        const promises = Array.from(includeElements).map(el => loadComponent(el));
        await Promise.all(promises);
        initAnimations();
        initContactForm();
        initProjectCards();
    }

    init();
});
