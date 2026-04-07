// ===== ТАЙМЕР ОБРАТНОГО ОТСЧЕТА =====
function updateTimer() {
    const weddingDate = new Date(2026, 7, 2, 14, 0);
    const now = new Date();
    const diff = weddingDate - now;
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (!daysEl) return;
    
    if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
}

updateTimer();
setInterval(updateTimer, 1000);

// ===== ФОРМА (отправка в Google Таблицу) =====
const weddingForm = document.getElementById('weddingForm');
if (weddingForm) {
    weddingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const form = this;
        const submitBtn = document.getElementById('submitBtn');
        const formMessage = document.getElementById('formMessage');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        const iframe = document.createElement('iframe');
        iframe.name = 'hidden_iframe_' + Date.now();
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        form.target = iframe.name;
        
        iframe.onload = function() {
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Спасибо! Ваш ответ получен.';
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
            
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
            
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        };
        
        iframe.onerror = function() {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Ошибка отправки. Пожалуйста, попробуйте еще раз.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
            document.body.removeChild(iframe);
        };
        
        form.submit();
    });
}

// ===== АНИМАЦИЯ ПРОГРАММЫ ДНЯ =====
document.addEventListener('DOMContentLoaded', function() {
    const timeline = document.querySelector('.timeline');
    const hearts = document.querySelectorAll('.timeline-heart');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timeline && hearts.length) {
        const observerTimeline = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        timeline.classList.add('animate');
                    }, 200);
                    
                    hearts.forEach((heart, index) => {
                        setTimeout(() => {
                            heart.classList.add('animate');
                        }, 300 + (index * 80));
                    });
                    
                    observerTimeline.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        observerTimeline.observe(timeline);
    }
    
    if (timelineItems.length) {
        const observerItems = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, 100);
                }
            });
        }, { threshold: 0.3 });
        
        timelineItems.forEach(item => {
            observerItems.observe(item);
        });
    }

    const timelinePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    timelinePath.setAttribute('d', 'M64 0 C96 70 96 170 64 240 C32 310 32 410 64 480 C96 550 96 650 64 720 C32 790 32 890 64 960 C96 1030 96 1130 64 1200');
    const timelinePathLength = timelinePath.getTotalLength();
    const timelineViewboxHeight = 1200;

    let targetTimelineProgress = 0;
    let currentTimelineProgress = 0;
    let heartAnimationFrame = null;

    function getTimelineProgress() {
        if (!timeline) return 0;
        const timelineRect = timeline.getBoundingClientRect();
        const viewportAnchor = window.innerHeight * 0.45;
        const rawProgress = (viewportAnchor - timelineRect.top) / Math.max(timelineRect.height, 1);
        return Math.min(Math.max(rawProgress, 0), 1);
    }

    function applyTimelineHeartPosition(progress) {
        if (!timeline) return;

        const timelineRect = timeline.getBoundingClientRect();
        const pathPoint = timelinePath.getPointAtLength(timelinePathLength * progress);
        const scaleY = timelineRect.height / timelineViewboxHeight;
        const relativeTop = pathPoint.y * scaleY;
        const pathCenterX = 64;
        const waveOffset = pathPoint.x - pathCenterX;

        timeline.style.setProperty('--heart-top', `${relativeTop.toFixed(2)}px`);
        timeline.style.setProperty('--heart-offset-x', `${waveOffset.toFixed(2)}px`);
    }

    function animateTimelineHeart() {
        const delta = targetTimelineProgress - currentTimelineProgress;

        if (Math.abs(delta) < 0.001) {
            currentTimelineProgress = targetTimelineProgress;
            applyTimelineHeartPosition(currentTimelineProgress);
            heartAnimationFrame = null;
            return;
        }

        currentTimelineProgress += delta * 0.18;
        applyTimelineHeartPosition(currentTimelineProgress);
        heartAnimationFrame = requestAnimationFrame(animateTimelineHeart);
    }

    function scheduleTimelineHeartUpdate() {
        targetTimelineProgress = getTimelineProgress();
        if (heartAnimationFrame !== null) return;
        heartAnimationFrame = requestAnimationFrame(animateTimelineHeart);
    }
    
    function updateHeartColors() {
        const windowHeight = window.innerHeight;
        
        timelineItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            
            if (itemCenter < viewportCenter) {
                item.classList.add('completed');
                item.classList.remove('active');
            } else if (rect.top < windowHeight - 150 && rect.bottom > 150) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    function handleTimelineScrollFrame() {
        updateHeartColors();
        scheduleTimelineHeartUpdate();
    }

    window.addEventListener('scroll', handleTimelineScrollFrame, { passive: true });
    window.addEventListener('resize', handleTimelineScrollFrame);
    updateHeartColors();
    scheduleTimelineHeartUpdate();
});

// ===== АНИМАЦИЯ БЛОКОВ ОРГАНИЗАЦИОННЫХ МОМЕНТОВ ДЛЯ МОБИЛЬНЫХ =====
function initInfoItemsAnimation() {
    const infoItems = document.querySelectorAll('.info-item');
    
    if (!infoItems.length) return;
    
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        const observerInfo = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible-mobile');
                }
            });
        }, { threshold: 0.3 });
        
        infoItems.forEach(item => {
            observerInfo.observe(item);
        });
    }
}

initInfoItemsAnimation();

window.addEventListener('resize', function() {
    const infoItems = document.querySelectorAll('.info-item');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        infoItems.forEach(item => {
            item.classList.remove('visible-mobile');
        });
        
        const observerInfo = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible-mobile');
                }
            });
        }, { threshold: 0.3 });
        
        infoItems.forEach(item => {
            observerInfo.observe(item);
        });
    } else {
        infoItems.forEach(item => {
            item.classList.remove('visible-mobile');
        });
    }
});

// ===== АНИМАЦИЯ ПОЯВЛЕНИЯ И ИСЧЕЗНОВЕНИЯ БЛОКОВ ПРИ ПРОКРУТКЕ =====
function initScrollAnimation() {
    const blocks = document.querySelectorAll('.story, .timer-section, .calendar-section, .schedule, .location, .dresscode, .info, .rsvp');
    
    if (!blocks.length) return;
    
    const observerBlocks = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible-scroll');
            } else {
                entry.target.classList.remove('visible-scroll');
            }
        });
    }, { threshold: 0.2 });
    
    blocks.forEach(block => {
        observerBlocks.observe(block);
    });
}

// ===== ПРОСТАЯ КАРУСЕЛЬ (100% РАБОТАЕТ) =====
function initSimpleCarousel() {
    function getSlides(track) {
        return Array.from(track.querySelectorAll('.simple-slide'));
    }

    function getDotsContainer(track) {
        return track.closest('.carousel-section')?.querySelector('.simple-dots') || null;
    }

    function getCenteredIndex(track) {
        const slides = getSlides(track);
        if (!slides.length) return 0;

        const trackCenter = track.scrollLeft + (track.clientWidth / 2);
        let closestIndex = 0;
        let closestDistance = Infinity;

        slides.forEach((slide, index) => {
            const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
            const distance = Math.abs(slideCenter - trackCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    function updateDots(track, currentIndex) {
        const dotsContainer = getDotsContainer(track);
        if (!dotsContainer) return;

        const dots = dotsContainer.querySelectorAll('.simple-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function updateActiveSlide(track, currentIndex) {
        const slides = getSlides(track);
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);
        });
    }

    function scrollToSlide(track, index) {
        const slides = getSlides(track);
        if (!slides.length) return 0;

        const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
        const slide = slides[safeIndex];
        const targetLeft = slide.offsetLeft - ((track.clientWidth - slide.offsetWidth) / 2);

        track.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: 'smooth'
        });

        updateDots(track, safeIndex);
        updateActiveSlide(track, safeIndex);
        return safeIndex;
    }

    function setupCarousel(track, prevBtn, nextBtn) {
        const slides = getSlides(track);
        if (!slides.length) return;

        let currentIndex = 0;
        let scrollTicking = false;
        const lastIndex = slides.length - 1;
        const dotsContainer = getDotsContainer(track);

        function goToSlide(index) {
            currentIndex = scrollToSlide(track, index);
        }

        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.classList.add('simple-dot');
                dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
                dot.classList.toggle('active', index === 0);
                dot.addEventListener('click', function() {
                    goToSlide(index);
                });
                dotsContainer.appendChild(dot);
            });
        }

        track.addEventListener('scroll', function() {
            if (scrollTicking) return;

            scrollTicking = true;
            window.requestAnimationFrame(function() {
                const newIndex = getCenteredIndex(track);
                if (newIndex !== currentIndex) {
                    currentIndex = newIndex;
                    updateDots(track, currentIndex);
                    updateActiveSlide(track, currentIndex);
                }
                scrollTicking = false;
            });
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                goToSlide(currentIndex <= 0 ? lastIndex : currentIndex - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                goToSlide(currentIndex >= lastIndex ? 0 : currentIndex + 1);
            });
        }

        window.addEventListener('resize', function() {
            goToSlide(currentIndex);
        });

        window.requestAnimationFrame(function() {
            goToSlide(0);
        });
    }

    const maleTrack = document.querySelector('.simple-track[data-track="male"]');
    const malePrev = document.querySelector('.simple-prev[data-carousel="male"]');
    const maleNext = document.querySelector('.simple-next[data-carousel="male"]');
    if (maleTrack) setupCarousel(maleTrack, malePrev, maleNext);

    const femaleTrack = document.querySelector('.simple-track[data-track="female"]');
    const femalePrev = document.querySelector('.simple-prev[data-carousel="female"]');
    const femaleNext = document.querySelector('.simple-next[data-carousel="female"]');
    if (femaleTrack) setupCarousel(femaleTrack, femalePrev, femaleNext);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimpleCarousel);
} else {
    initSimpleCarousel();
}

document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimation();
});
