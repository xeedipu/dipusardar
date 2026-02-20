/* ============================================================================
   CONFIGURATION & INITIALIZATION
   ============================================================================ */

// Register GSAP plugins for smooth scroll animations
gsap.registerPlugin(ScrollTrigger);

/* ============================================================================
   VIEW MANAGEMENT SYSTEM
   ============================================================================
   Manages navigation between different page views (home, photos, about, contact)
   Handles view activation, deactivation, and smooth transitions
   ============================================================================ */

/**
 * Switches between different views on the page
 * @param {string} viewId - The ID of the view to show (home, projects, photos, about, contact)
 */
function showView(viewId) {
    // Hide all existing views and remove active state from navigation
    document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    // Get target view and navigation link elements
    const targetView = document.getElementById('view-' + viewId);
    const targetLink = document.getElementById('link-' + viewId);

    // Execute view change if it exists
    if (targetView) {
        // Activate the new view and corresponding nav link
        targetView.classList.add('active');
        if (targetLink) targetLink.classList.add('active');

        // Update URL hash for browser history
        window.history.replaceState(null, null, `#${viewId}`);

        // Scroll to top of page smoothly
        window.scrollTo(0, 0);

        // Fade in animation for smooth view transition
        gsap.from(targetView, { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" });

        // Run special animations based on the view being displayed
        if (viewId === 'about') animateBadge();

        // Refresh scroll triggers for animations
        ScrollTrigger.refresh();
    }
}

/**
 * Initialize page view on first load based on URL hash
 * Displays home view by default
 */
/**
 * Initialize preloader animation - New Typographic Reveal
 */
function initPreloader() {
    const percentEl = document.querySelector('.loader-progress');
    const brandEl = document.querySelector('.loader-brand');
    const preloader = document.getElementById('preloader');

    if (!percentEl || !preloader) return;

    let count = 0;
    let isLoaded = false;
    document.body.classList.add('loading');

    // Ensure we capture the load event even if it fires early
    if (document.readyState === 'complete') {
        isLoaded = true;
    } else {
        window.addEventListener('load', () => { isLoaded = true; });
    }

    // Counting animation
    const counterInterval = setInterval(() => {
        // Random increment for organic feel
        // Increased increment range for faster counting
        const increment = Math.floor(Math.random() * 8) + 2;
        count += increment;

        if (count >= 100) {
            count = 100;
            clearInterval(counterInterval);

            // Wait for window load
            const checkLoad = setInterval(() => {
                if (isLoaded) {
                    clearInterval(checkLoad);
                    finishLoading();
                }
            }, 50); // Faster check
        }

        percentEl.innerText = count + '%';

        // Dynamic opacity for brand text based on progress
        if (brandEl) {
            brandEl.style.opacity = 0.3 + (count / 200); // 0.3 to 0.8
        }

    }, 20); // Faster interval (was 30)

    function finishLoading() {
        const tl = gsap.timeline();

        // 1. Scale up the number and fade out
        tl.to(percentEl, {
            scale: 1.5,
            opacity: 0,
            duration: 0.5, // Faster (was 0.8)
            ease: "power2.inOut"
        })
            .to(brandEl, {
                opacity: 0,
                y: -50,
                duration: 0.3, // Faster (was 0.5)
                ease: "power2.in"
            }, "<") // Start with previous

            // 2. Slide the entire overlay up
            .to(preloader, {
                yPercent: -100,
                duration: 0.8, // Faster (was 1.2)
                ease: "expo.inOut",
                onStart: () => {
                    // Animate Navbar
                    gsap.to("nav", { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
                }
            })
            .set(preloader, { display: 'none' })
            .call(() => {
                document.body.classList.remove('loading');
                animateHeroEntrance();
            });
    }
}

/**
 * Animate hero section elements on page entrance
 */
function animateHeroEntrance() {
    // Navbar animation moved to finishLoading() for earlier trigger

    // Reveal Hero Content
    const heroWords = document.querySelectorAll('.hero-word');

    // Temporarily disable CSS transitions to avoid conflict with GSAP
    gsap.set(heroWords, { transition: 'none' });

    gsap.to(heroWords, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out",
        onComplete: () => {
            // Restore transitions for hover effects
            gsap.set(heroWords, { clearProps: "transition" });
        }
    });

    gsap.from(".hero-subtitle", {
        y: 20,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power2.out"
    });

    gsap.from(".hero-top-bar, .hero-bottom-bar, .hero-age-circle", {
        opacity: 0,
        duration: 1,
        delay: 0.8,
        stagger: 0.1,
        ease: "power2.out"
    });
}

// Initial call to start the preloader
initPreloader();

window.addEventListener('DOMContentLoaded', () => {
    // Hide nav initially for entrance animation
    gsap.set("nav", { y: -100, opacity: 0 });

    // Get the current URL hash (e.g., #about, #contact)
    const currentHash = window.location.hash.replace('#', '');

    // Show the view from URL if it exists, otherwise show home
    if (currentHash && document.getElementById('view-' + currentHash)) {
        showView(currentHash);
    } else {
        showView('home');
    }
});

/* ============================================================================
   HERO INTERACTION
   ============================================================================ */

/**
 * Handle mouse movement for hero section effects
 * - Text Gradient "Spotlight"
 * - Graphic Parallax
 */
const heroSection = document.getElementById('hero-aesthetic');
const heroText = document.querySelectorAll('.aesthetic-headline');
const heroGraphic = document.querySelector('.hero-bg-graphic');

if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        // Normalize mouse position (-1 to 1)
        const xPos = (clientX / innerWidth - 0.5) * 2;
        const yPos = (clientY / innerHeight - 0.5) * 2;

        // 1. Graphic Parallax (Subtle movement opposite to mouse)
        if (heroGraphic) {
            gsap.to(heroGraphic, {
                x: -xPos * 30, // Move 30px
                y: -yPos * 30,
                duration: 1,
                ease: "power2.out"
            });
        }

        // 2. Text Spotlight Effect (Optional: if we added the gradient)
        // For now, let's add a subtle tilt to the text
        if (heroText) {
            gsap.to(heroText, {
                rotationY: xPos * 5, // Slight 3D tilt
                rotationX: -yPos * 5,
                duration: 1,
                ease: "power2.out"
            });
        }
    });
}

/* ============================================================================
   INTERACTIVE ELEMENT HOVER EFFECTS
   ============================================================================
   Applies unified hover behavior to all interactive elements
   - Cursor state changes
   - Scale animations
   - Magnetic movement on hover
   ============================================================================ */

/**
 * Initialize hover interactions for all interactive elements
 * Handles mouseenter, mouseleave, and mousemove events
 */
function initRefinedInteractions() {
    // Select all elements that should respond to hover
    const interactives = document.querySelectorAll(".hover-target, .nav-item, .btn, .project-card, .photo-item, .char");

    // Apply interaction handlers to each element
    interactives.forEach(el => {
        // MOUSEENTER: Activate hover state
        el.addEventListener("mouseenter", () => {
            // Add hover class to body for cursor styling
            document.body.classList.add("cursor-hover");

            // Scale up the element with elastic bounce effect
            gsap.to(el, {
                scale: 1.1,
                duration: 0.4,
                ease: "back.out(2)",
                zIndex: 50,
                overwrite: true
            });
        });

        // MOUSELEAVE: Reset hover state
        el.addEventListener("mouseleave", () => {
            // Remove hover class from body
            document.body.classList.remove("cursor-hover");

            // Reset element to original position and scale
            gsap.to(el, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "power4.out",
                zIndex: 1,
                overwrite: true
            });
        });

        // MOUSEMOVE: Apply magnetic movement effect
        el.addEventListener("mousemove", (e) => {
            // Get element's position and dimensions
            const rect = el.getBoundingClientRect();

            // Determine if element should have strong magnetic effect
            const isHeaderOrFooter = el.closest('nav') || el.closest('footer');
            const isHeroText = el.closest('.hero') && !el.closest('#heroImage');

            // Only header, footer, and hero text have strong magnetic effect
            const isIntense = isHeaderOrFooter || isHeroText;
            const intensity = isIntense ? 0.4 : 0.001;

            // Calculate relative distance from element center to cursor
            const x = (e.clientX - rect.left - rect.width / 2) * intensity;
            const y = (e.clientY - rect.top - rect.height / 2) * intensity;

            // Apply magnetic animation
            gsap.to(el, {
                x: x,
                y: y,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto"
            });
        });
    });
}

/**
 * Re-initialize interactions when view changes
 * Ensures new elements in view are interactive
 */
const originalShowView = showView;
showView = (viewId) => {
    originalShowView(viewId);
    // Delay to allow DOM to fully render
    setTimeout(initRefinedInteractions, 100);
};

// Initialize interactions on page load
initRefinedInteractions();

/* ============================================================================
   HERO SECTION ANIMATIONS
   ============================================================================
   Animates hero content on page load and creates interactive effects
   - Character stagger entrance
   - Parallax movement on mouse move
   - 3D scroll reveal effect
   ============================================================================ */

/**
 * Hero section Scroll Parallax
 * Parallax effects for the new Minimal Hero
 * Elements move at different speeds and fade out
 */
const heroTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: "#hero-aesthetic",
        start: "top top",
        end: "bottom top", // Animate over the height of the hero
        scrub: true
    }
});

// Apply transformations during scroll
heroTimeline
    .to(".aesthetic-headline", { y: -200, opacity: 0, scale: 0.9, ease: "none" }, 0)
    .to(".hero-bg-graphic", { rotation: 120, scale: 1.5, opacity: 0, ease: "none" }, 0)
    .to(".hero-bottom-bar", { y: -100, opacity: 0, ease: "none" }, 0)
    .to(".hero-top-bar", { y: -100, opacity: 0, ease: "none" }, 0);


/* ============================================================================
   COMPONENT ANIMATIONS
   ============================================================================
   Scroll-triggered animations for main content sections
   - Work section zoom and shadow effects
   - Grid item entrance animations
   - Navbar hide on scroll
   ============================================================================ */

/**
 * Animate work section container on scroll
 * Applies zoom-in and shadow effects as user scrolls to work section
 */
// Work section animations removed for sticky stack effect

/**
 * Hide/show navbar on scroll direction
 * Navbar hides when scrolling down, shows when scrolling up
 */
let lastScrollY = window.scrollY;
const navbar = document.getElementById('navbar');

// Initial navbar entrance removed - handled by animateHeroEntrance()

/**
 * Listen for scroll events to toggle navbar visibility
 */
window.addEventListener('scroll', () => {
    // Scrolling down: hide navbar
    if (window.scrollY > lastScrollY) {
        navbar.style.transform = 'translateY(-100%)';
    }
    // Scrolling up: show navbar
    else {
        navbar.style.transform = 'translateY(0)';
    }
    lastScrollY = window.scrollY;
});


/* ============================================================================
   ABOUT SECTION - BADGE ANIMATION
   ============================================================================
   Creates 3D entrance animation and floating effect for ID badge
   ============================================================================ */

/**
 * Animate badge entrance and floating effect when about section is shown
 * Includes 3D rotation reveal and continuous floating motion
 */
function animateBadge() {
    // Get badge element - use the new .about-badge-container wrapper
    const badgeContainer = document.querySelector(".about-badge-container");
    const badge = document.querySelector(".id-badge");
    if (!badgeContainer || !badge) return;

    // Reset animations to ensure they run fresh each time
    gsap.killTweensOf([badgeContainer, badge]);

    // Initial state: hidden, scaled down, rotated in 3D
    gsap.set(badgeContainer, {
        opacity: 0,
        y: 50,
        scale: 0.8,
        rotationX: -20,
        rotationY: 15,
        transformPerspective: 1000
    });

    // Animate entrance with 3D reveal - enhanced effect
    gsap.to(badgeContainer, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        duration: 1.2,
        ease: "back.out",
        onComplete: () => {
            // Start floating animation after entrance completes
            gsap.to(badgeContainer, {
                y: "-=12",
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    });

    /**
     * Animate badge details items with staggered entrance
     */
    const detailItems = document.querySelectorAll(".badge-details div");
    if (detailItems.length > 0) {
        gsap.from(detailItems, {
            opacity: 0,
            y: 10,
            stagger: 0.1,
            duration: 0.6,
            ease: "back.out",
            delay: 0.8
        });
    }

    /**
     * Animate badge speech bubble with pop effect
     */
    const bubble = document.querySelector("#badgeBubble");
    if (bubble) {
        // Initial bubble state
        gsap.set(bubble, {
            opacity: 0,
            scale: 0,
            rotation: 12,
            x: 20
        });

        // Pop in animation
        gsap.to(bubble, {
            opacity: 1,
            scale: 1,
            x: 0,
            rotation: 12,
            duration: 0.6,
            ease: "back.out",
            delay: 0.5
        });

        // Continuous pulse and float animation
        gsap.to(bubble, {
            scale: 1.08,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1.1
        });

        gsap.to(bubble, {
            y: "-=6",
            x: "+=3",
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: 1.1
        });
    }

    /**
     * Animate badge photo with zoom effect
     */
    const badgePhoto = document.querySelector(".badge-photo-wrap img");
    if (badgePhoto) {
        gsap.from(badgePhoto, {
            scale: 0.9,
            opacity: 0.5,
            duration: 0.7,
            ease: "power2.out",
            delay: 0.2
        });
    }
}

/* ============================================================================
   MOBILE MENU SYSTEM
   ============================================================================
   Handles hamburger menu toggle and mobile navigation
   Creates smooth slide-in/out animation with staggered menu items
   ============================================================================ */

// Reference DOM elements for mobile menu
const menuTrigger = document.getElementById('mobile-menu-trigger');
const navOverlay = document.getElementById('nav-overlay');
const mNavItems = document.querySelectorAll('.m-nav-item');
const menuCloseBtn = document.getElementById('menu-close-btn');

// Track menu open/closed state
let isMenuOpen = false;

/**
 * Create GSAP timeline for smooth menu animations
 * Animation sequence: overlay slide in → menu items fade in → close button appears
 */
const menuTl = gsap.timeline({ paused: true });
menuTl.to(navOverlay, { x: 0, visibility: 'visible', duration: 0.6, ease: "expo.out" })
    .to(mNavItems, { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, ease: "back.out(1.7)" }, "-=0.3")
    .to(menuCloseBtn, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }, "-=0.2");

/* ============================================================================
   MOBILE MENU IMAGE PREVIEW INTERACTION
   ============================================================================ */
const previewContainer = document.querySelector('.nav-preview-container');
const previewImg = document.getElementById('nav-preview-img');

if (previewContainer && previewImg) {
    mNavItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const imgSrc = item.getAttribute('data-img');
            if (imgSrc) {
                previewImg.src = imgSrc;
                previewContainer.classList.add('active');
            }
        });

        item.addEventListener('mouseleave', () => {
            previewContainer.classList.remove('active');
        });
    });
}

/**
 * Toggle mobile menu open/closed state
 * @param {string} targetView - Optional view to show after menu closes
 */
function toggleMobileMenu(targetView) {
    if (!isMenuOpen) {
        // Menu is closed, open it
        menuTl.play();
        menuTrigger.classList.add('active');
        navOverlay.classList.add('active');
    } else {
        // Menu is open, close it
        menuTl.reverse();
        menuTrigger.classList.remove('active');
        navOverlay.classList.remove('active');

        // Navigate to selected view after menu closes
        if (targetView) setTimeout(() => showView(targetView), 500);
    }

    // Toggle menu state
    isMenuOpen = !isMenuOpen;
}

/**
 * Add click handler to hamburger menu trigger
 */
menuTrigger.addEventListener('click', () => toggleMobileMenu());

/* ============================================================================
   EMAIL SERVICE - EMAILJS INTEGRATION
   ============================================================================
   Handles contact form submission using EmailJS service
   Sends emails directly from the client without backend server
   ============================================================================ */

/**
 * Initialize EmailJS with API credentials
 * Must be called before sending any emails
 */
(function () {
    emailjs.init("oTPVHwl5Wz0cIOKA-");
})();

/**
 * Handle contact form submission
 * Sends form data via EmailJS and handles success/error responses
 */
document.getElementById("contact-form").addEventListener("submit", function (e) {
    // Prevent default form submission behavior
    e.preventDefault();

    // Send form data using EmailJS
    emailjs.sendForm("service_6qr1akj", "template_rsqwb7s", this)
        .then(() => {
            // Success: Show modal and clear form
            showMessageModal();
            this.reset();
        }, () => {
            // Error: Show error modal
            showErrorModal();
        });
});

/**
 * Show success message modal
 */
function showMessageModal() {
    const modal = document.getElementById("message-modal");
    modal.classList.add("active");
}

/**
 * Close success message modal
 */
function closeMessageModal() {
    const modal = document.getElementById("message-modal");
    modal.classList.remove("active");
}

/**
 * Show error message modal
 */
function showErrorModal() {
    const modal = document.getElementById("error-modal");
    modal.classList.add("active");
}

/**
 * Close error message modal
 */
function closeErrorModal() {
    const modal = document.getElementById("error-modal");
    modal.classList.remove("active");
}

/* ============================================================================
   LOGO ANIMATIONS
   ============================================================================
   Creates interactive hover effects for the logo


/* ============================================================================
   PROJECTS SLIDER SYSTEM
   ============================================================================
   Handles horizontal sliding for the redesigned My Works section
   - Smooth track movement
   - Button navigation
   - Responsive slide width calculation
   ============================================================================ */

let currentProjectIndex = 0;

function initProjectsSlider() {
    const track = document.getElementById('projects-track');
    const slides = document.querySelectorAll('.project-slide-item');
    const prevBtn = document.getElementById('projects-prev');
    const nextBtn = document.getElementById('projects-next');

    if (!track || !slides.length) return;

    // Remove existing event listeners by cloning nodes (simple way to reset)
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

    const updateSlider = () => {
        const slideWidth = slides[0].offsetWidth;
        const gap = 30; // Matches CSS gap
        const moveDistance = currentProjectIndex * (slideWidth + gap);

        gsap.to(track, {
            x: -moveDistance,
            duration: 1,
            ease: "expo.out"
        });

        // Update active class for visual feedback
        slides.forEach((slide, index) => {
            if (index === currentProjectIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Disable/Enable buttons based on position
        newPrevBtn.style.opacity = currentProjectIndex === 0 ? '0.2' : '1';
        newPrevBtn.style.pointerEvents = currentProjectIndex === 0 ? 'none' : 'auto';
        newNextBtn.style.opacity = currentProjectIndex === slides.length - 1 ? '0.2' : '1';
        newNextBtn.style.pointerEvents = currentProjectIndex === slides.length - 1 ? 'none' : 'auto';
    };

    newNextBtn.addEventListener('click', () => {
        if (currentProjectIndex < slides.length - 1) {
            currentProjectIndex++;
            updateSlider();
        }
    });

    newPrevBtn.addEventListener('click', () => {
        if (currentProjectIndex > 0) {
            currentProjectIndex--;
            updateSlider();
        }
    });

    // Handle touch/drag for mobile (Optional but nice)
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentProjectIndex < slides.length - 1) {
                currentProjectIndex++;
            } else if (diff < 0 && currentProjectIndex > 0) {
                currentProjectIndex--;
            }
            updateSlider();
        }
        isDragging = false;
    });

    // Initial update
    updateSlider();

    // Recalculate on resize
    window.addEventListener('resize', updateSlider);
}

// Initialize on load
window.addEventListener('load', () => {
    initProjectsSlider();
});

// Re-initialize when switching to projects view
const baseShowView = showView;
showView = (viewId) => {
    baseShowView(viewId);
    if (viewId === 'projects') {
        setTimeout(initProjectsSlider, 100);
    }
};





