document.addEventListener('DOMContentLoaded', () => {
    const trackerEndpoint = window.VISITOR_TRACKER_URL || '/api/visits';

    const trackVisit = async () => {
        try {
            await fetch(trackerEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pageUrl: window.location.href,
                    pagePath: window.location.pathname,
                    pageTitle: document.title,
                    referrer: document.referrer,
                    language: navigator.language || '',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
                    screen: {
                        width: window.screen.width,
                        height: window.screen.height
                    }
                }),
                keepalive: true
            });
        } catch (error) {
            console.debug('Visitor tracking unavailable.', error);
        }
    };

    trackVisit();
    // 1. Scroll-spy for sidebar navigation
    const sections = document.querySelectorAll('.section, #selected-papers, #all-publications');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0
    };

    const handleScrollAtBottom = () => {
        const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;
        if (isAtBottom) {
            const lastSection = sections[sections.length - 1];
            if (lastSection) {
                const id = lastSection.getAttribute('id');
                updateActiveLink(id);
            }
        }
    };

    const updateActiveLink = (id) => {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            
            // Logic to expand submenu
            document.querySelectorAll('.sub-nav').forEach(nav => {
                const parentNav = activeLink.closest('.sub-nav');
                if (nav !== parentNav && nav !== activeLink.parentElement.querySelector('.sub-nav')) {
                    nav.style.display = 'none';
                }
            });
            
            const parentSubNav = activeLink.closest('.sub-nav');
            if (parentSubNav && parentSubNav.getAttribute('data-user-closed') !== 'true') {
                parentSubNav.style.display = 'block';
                const parentLi = parentSubNav.parentElement;
                if (parentLi) {
                    const parentLink = parentLi.querySelector('a');
                    if (parentLink) parentLink.classList.add('active');
                    const toggleBtn = parentLi.querySelector('.sub-nav-toggle');
                    if (toggleBtn) toggleBtn.innerHTML = '&minus;';
                }
            }
            
            const siblingSubNav = activeLink.parentElement.querySelector('.sub-nav');
            if (siblingSubNav && activeLink.parentElement.tagName.toLowerCase() === 'li') {
                if (siblingSubNav.getAttribute('data-user-closed') !== 'true') {
                    siblingSubNav.style.display = 'block';
                    const toggleBtn = activeLink.parentElement.querySelector('.sub-nav-toggle');
                    if (toggleBtn) toggleBtn.innerHTML = '&minus;';
                }
            }
        }
        
        // Reset any non-active toggle buttons to plus
        document.querySelectorAll('.sub-nav-toggle').forEach(toggle => {
            const subNav = toggle.parentElement.querySelector('.sub-nav');
            if (subNav && subNav.style.display === 'none') {
                toggle.innerHTML = '&plus;';
            }
        });
    };

    const observer = new IntersectionObserver((entries) => {
        // If we are at the bottom, don't let intersection observer override the bottom logic
        const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;
        if (isAtBottom) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateActiveLink(id);
            }
        });
    }, observerOptions);

    window.addEventListener('scroll', handleScrollAtBottom);

    sections.forEach(section => {
        observer.observe(section);
    });

    // 2. Reveal animations on scroll
    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    sections.forEach(section => {
        revealObserver.observe(section);
    });

    // 3. Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Correct scroll position calculation accounting for transforms
                const topOffset = targetElement.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: topOffset - 60, // offset slightly for sticky padding or margins
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Manually toggle sub-navs
    document.querySelectorAll('.sub-nav-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const subNav = this.parentElement.querySelector('.sub-nav');
            if (subNav) {
                if (subNav.style.display === 'none' || subNav.style.display === '') {
                    subNav.style.display = 'block';
                    subNav.removeAttribute('data-user-closed');
                    this.innerHTML = '&minus;';
                } else {
                    subNav.style.display = 'none';
                    subNav.setAttribute('data-user-closed', 'true');
                    this.innerHTML = '&plus;';
                }
            }
        });
    });

    // 5. Hero Carousel Logic
    const carousel = document.querySelector('.hero-carousel');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

        const showSlide = (index) => {
            slides.forEach(s => s.classList.remove('active'));
            slides[index].classList.add('active');
            currentSlide = index;
        };

        const nextSlide = () => {
            let nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        };

        const prevSlide = () => {
            let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prevIndex);
        };

        const startTimer = () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 15000);
        };

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                startTimer(); // Reset timer on manual click
            });

            prevBtn.addEventListener('click', () => {
                prevSlide();
                startTimer(); // Reset timer on manual click
            });
        }

        // Initialize timer
        if (slides.length > 1) {
            startTimer();
        }
    }
});

