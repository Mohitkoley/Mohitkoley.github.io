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

        // Image hydration cache system
        const imageCache = new Map();
        const cachePrefix = 'portfolio_image_cache_';

        // Function to cache an image
        async function cacheImage(url, imageUrl) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const cacheName = `${cachePrefix}${imageUrl.split('/').pop()}`;

                // Store in localStorage as base64 (for small images)
                if (blob.size < 1024 * 1024) { // 1MB limit
                    const reader = new FileReader();
                    reader.onload = () => {
                        localStorage.setItem(cacheName, reader.result);
                    };
                    reader.readAsDataURL(blob);
                }

                // Create object URL for immediate use
                const objectUrl = URL.createObjectURL(blob);
                imageCache.set(imageUrl, objectUrl);
                return objectUrl;
            } catch (error) {
                console.warn('Failed to cache image:', url, error);
                return imageUrl; // Fallback to original URL
            }
        }

        // Function to get cached image
        function getCachedImage(imageUrl) {
            const cacheName = `${cachePrefix}${imageUrl.split('/').pop()}`;

            // Check memory cache first
            if (imageCache.has(imageUrl)) {
                return imageCache.get(imageUrl);
            }

            // Check localStorage cache
            const cachedData = localStorage.getItem(cacheName);
            if (cachedData) {
                const objectUrl = URL.createObjectURL(dataURLtoBlob(cachedData));
                imageCache.set(imageUrl, objectUrl);
                return objectUrl;
            }

            return null;
        }

        // Convert data URL to Blob
        function dataURLtoBlob(dataURL) {
            const arr = dataURL.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        // Preload and cache all project images
        async function preloadProjectImages() {
            const cards = document.querySelectorAll('.project-image-card');

            for (const card of cards) {
                const imageUrl = card.dataset.imageUrl;
                if (imageUrl) {
                    // Check if already cached
                    const cachedUrl = getCachedImage(imageUrl);
                    if (cachedUrl) {
                        // Use cached image immediately
                        const imageContainer = card.querySelector('.relative.h-48');
                        if (imageContainer) {
                            imageContainer.style.backgroundImage = `url(${cachedUrl})`;
                        }
                    } else {
                        // Cache and use
                        const cachedUrl = await cacheImage(imageUrl, imageUrl);
                        const imageContainer = card.querySelector('.relative.h-48');
                        if (imageContainer) {
                            imageContainer.style.backgroundImage = `url(${cachedUrl})`;
                        }
                    }
                }
            }
        }

        // Show image modal for project cards (NO store buttons)
        function showImageModal(imageUrl, projectName) {
            // Try to get cached version for modal
            const cachedUrl = getCachedImage(imageUrl) || imageUrl;

            modalContent.innerHTML = `
        <div class="relative">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">${projectName}</h3>
            
            <div class="flex justify-center items-center">
                <img src="${cachedUrl}" alt="${projectName}" 
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

        // Show image modal with App Store button if available
        function showImageModal(imageUrl, projectName, appStoreUrl) {
            // Try to get cached version for modal
            const cachedUrl = getCachedImage(imageUrl) || imageUrl;



            modalContent.innerHTML = `
        <div class="relative">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">${projectName}</h3>
            
            <div class="flex justify-center items-center">
                <img src="${cachedUrl}" alt="${projectName}" 
                     class="max-w-full h-auto rounded-lg shadow-lg" 
                     style="max-height: 70vh;">
            </div>

            
        </div>
    `;

            //  const appStoreButton = appStoreUrl ? `
            //             <a href="${appStoreUrl}" target="_blank"
            //                class="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors">
            //                 <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            //                     <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.19-.75-3.31-1.15-.69-.25-1.87-.62-3.31-.5-1.34.11-2.22.58-2.58.73-.45.19-.83.37-1.09.49-.24.11-.44.17-.44.17s-.2-.06-.44-.17c-.26-.12-.64-.3-1.09-.49-.36-.15-1.24-.62-2.58-.73-1.44-.12-2.62.24-3.31.5-1.12.4-2.22.69-3.31 1.15-1.03.45-2.1.6-3.08-.35-.98-.95-1.47-2.32-1.08-4.22.26-1.25.96-2.45 1.59-3.58.05-.09.11-.17.16-.26l.85-1.31c.49-.76 1.25-1.15 2.01-1.15h.78c.76 0 1.52.39 2.01 1.15l.85 1.31c.05.09.11.17.16.26.63 1.13 1.33 2.33 1.59 3.58.39 1.9-.1 3.27-.1 4.22zm-3.37-3.52c.54 0 .98-.44.98-.98s-.44-.98-.98-.98-.98.44-.98.98.44.98.98.98zm0-4.16c.54 0 .98-.44.98-.98s-.44-.98-.98-.98-.98.44-.98.98.44.98.98.98z"/>
            //                 </svg>
            //                 Download on App Store
            //             </a>
            //         ` : '';

            // <div class="mt-6 text-center">
            //             <div class="flex gap-3 justify-center">
            //                 ${appStoreButton}
            //                 <button onclick="document.getElementById('playStoreModal').classList.add('hidden')" 
            //                         class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors">
            //                     Close
            //                 </button>
            //             </div>
            //         </div>
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

        // Preload images after setup
        preloadProjectImages();

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
