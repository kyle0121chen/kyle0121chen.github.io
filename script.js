document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll-spy for sidebar navigation
    const sections = document.querySelectorAll('.section, #selected-papers, #all-publications');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Update active class on nav links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    
                    // Logic to expand submenu: 
                    // Remove expanded styling from all sub-navs first
                    document.querySelectorAll('.sub-nav').forEach(nav => {
                        nav.style.display = 'none';
                        // Reset manual closed state if we navigate entirely away from this menu
                        if (!activeLink.closest('.sub-nav') && nav !== activeLink.parentElement.querySelector('.sub-nav')) {
                            nav.removeAttribute('data-user-closed');
                        }
                    });
                    
                    // If the active link is inside a sub-nav, show that sub-nav and highlight parent
                    const parentSubNav = activeLink.closest('.sub-nav');
                    if (parentSubNav) {
                        if (parentSubNav.getAttribute('data-user-closed') !== 'true') {
                            parentSubNav.style.display = 'block';
                            const parentLi = parentSubNav.parentElement;
                            if (parentLi) {
                                const parentLink = parentLi.querySelector('a');
                                if (parentLink) parentLink.classList.add('active');
                                const toggleBtn = parentLi.querySelector('.sub-nav-toggle');
                                if (toggleBtn) toggleBtn.innerHTML = '&minus;';
                            }
                        }
                    }
                    
                    // If the active link is the parent itself
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
            }
        });
    }, observerOptions);

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
});
