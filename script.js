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
 * @param {string} viewId - The ID of the view to show (home, photos, about, contact)
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
        gsap.from(targetView, {opacity: 0, y: 30, duration: 0.8, ease: "power2.out"});
        
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
window.addEventListener('DOMContentLoaded', () => {
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
   CUSTOM CURSOR SYSTEM
   ============================================================================
   Implements a two-layer custom cursor with smooth tracking
   - Inner cursor: Fast-moving center dot
   - Outer cursor: Elastic follower ring
   ============================================================================ */

// Reference DOM elements for custom cursor
const cursor = document.querySelector("#cursor");
const follower = document.querySelector("#cursor-follower");

// Configure cursor tracking with GSAP quickTo for maximum performance
// Inner cursor (fast, snappy response)
const xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3"});
const yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3"});

// Outer cursor (slower, elastic response)
const fXTo = gsap.quickTo(follower, "x", {duration: 0.4, ease: "elastic.out(1, 0.8)"});
const fYTo = gsap.quickTo(follower, "y", {duration: 0.4, ease: "elastic.out(1, 0.8)"});

/**
 * Update cursor position to follow mouse movement
 * Called on every mouse move for smooth tracking
 */
window.addEventListener("mousemove", e => {
    // Move inner cursor to exact mouse position
    xTo(e.clientX - 3);
    yTo(e.clientY - 3);
    
    // Move outer cursor with slight offset and elastic delay
    fXTo(e.clientX - 12);
    fYTo(e.clientY - 12);
});


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
 * Stagger entrance animation for hero elements
 * Creates a wave-like reveal effect when page loads
 */
gsap.to(["#speechBubble", ".char", ".hero-content p", ".hero-btns"], {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    duration: 1.2,
    stagger: 0.05,
    ease: "expo.out",
    delay: 0.5
});

/**
 * Individual character hover animations
 * Each letter bounces up when hovered
 */
document.querySelectorAll(".char").forEach(char => {
    // Scale up with elastic bounce on hover
    char.addEventListener("mouseenter", () => {
        gsap.to(char, { scale: 1.5, duration: 0.3, ease: "back.out(1.7)", zIndex: 10 });
    });
    
    // Smooth scale down on mouse leave
    char.addEventListener("mouseleave", () => {
        gsap.to(char, { scale: 1, duration: 0.3, ease: "power2.out", zIndex: 1 });
    });
});

/**
 * Parallax effect on hero image
 * Image moves based on mouse position, creating 3D depth effect
 */
window.addEventListener("mousemove", (e) => {
    // Only apply parallax when home view is active
    if(document.getElementById('view-home').classList.contains('active')) {
        // Calculate movement based on normalized cursor position
        const xPos = (e.clientX / window.innerWidth - 0.5) * 30;
        const yPos = (e.clientY / window.innerHeight - 0.5) * 30;
        
        // Apply 3D transform to image
        gsap.to("#heroImage", { 
            duration: 0.8, 
            x: xPos, 
            y: yPos, 
            rotationY: xPos / 2, 
            rotationX: -yPos / 2 
        });
    }
});

/**
 * Hero section 3D scroll reveal animation
 * Scales and rotates hero content as user scrolls
 */
const heroTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
        pin: true,
        // Prevent extra white space after pinned element
        pinSpacing: false 
    }
});

// Apply transformations during scroll
heroTimeline
    .to(".hero-content", { scale: 0.85, rotationX: 10, y: -100, opacity: 0.4, ease: "none" }, 0)
    .to("#heroImage", { y: -150, scale: 0.7, rotationY: -15, opacity: 0.2, filter: "blur(10px)", ease: "none" }, 0);


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
// Main container zoom-in and shadow effect
gsap.from(".work-section-container", {
    scrollTrigger: {
        trigger: ".work-section-container",
        start: "top 95%",
        end: "top 20%",
        scrub: 1.5,
    },
    scale: 0.85,
    borderRadius: "100px",
    boxShadow: "0 0px 0px rgba(0,0,0,0)",
    ease: "power2.out"
});

/**
 * Apply deep shadow effect to work section when fully visible
 */
gsap.to(".work-section-container", {
    scrollTrigger: {
        trigger: ".work-section-container",
        start: "top 50%",
        toggleActions: "play none none reverse",
    },
    boxShadow: "0 50px 100px rgba(92, 29, 51, 0.15)",
    duration: 1.2
});

/**
 * Stagger entrance animation for individual work grid items
 */
gsap.utils.toArray(".work-grid").forEach((grid) => {
    gsap.to(grid, {
        scrollTrigger: {
            trigger: grid,
            start: "top 85%",
            end: "bottom 80%",
            toggleActions: "play none none reverse",
        },
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: "expo.out"
    });
});

/**
 * Hide/show navbar on scroll direction
 * Navbar hides when scrolling down, shows when scrolling up
 */
let lastScrollY = window.scrollY;
const navbar = document.getElementById('navbar');

// Initial navbar entrance
gsap.from("nav", {y: -50, opacity: 0, duration: 1});

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
   Animates individual logo components on mouse interaction
   ============================================================================ */

// Reference logo components
const logo = document.querySelector("#main-logo");
const lSlash = logo.querySelector(".logo-slash");
const lMark = logo.querySelector(".logo-mark");
const lLetter = logo.querySelector(".logo-letter");

/**
 * Logo hover entrance animation
 * Rotates slash, spins and colors mark, lifts letter
 */
logo.addEventListener("mouseenter", () => {
    // Slash: Elastic rotation and scale
    gsap.to(lSlash, {
        rotate: 35,
        scale: 1.4,
        x: 5,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)"
    });
    
    // Mark (asterisk): Spin and color change
    gsap.to(lMark, {
        rotation: 180,
        scale: 1.5,
        color: "#FF0B55",
        duration: 0.6,
        ease: "back.out(2)"
    });

    // Letter: Subtle upward movement
    gsap.to(lLetter, {
        y: -2,
        duration: 0.4,
        ease: "power2.out"
    });
});

/**
 * Logo hover exit animation
 * Returns all components to original state smoothly
 */
logo.addEventListener("mouseleave", () => {
    // Reset all components simultaneously
    gsap.to([lSlash, lMark, lLetter], {
        rotate: (i) => i === 0 ? 15 : 0,
        scale: 1,
        x: 0,
        y: 0,
        rotation: 0,
        color: (i) => i === 1 ? "#454955" : "#FF0B55",
        duration: 0.5,
        ease: "power3.inOut"
    });
});





