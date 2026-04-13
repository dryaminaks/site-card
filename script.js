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

// ===== EnvelopeIntro =====
class EnvelopeIntro {
    constructor({
        root,
        onOpenComplete = () => {},
        storageKey = 'wedding-envelope-intro-opened'
    }) {
        this.root = root;
        this.onOpenComplete = onOpenComplete;
        this.storageKey = storageKey;
        this.trigger = root?.querySelector('#envelopeTrigger');
        this.button = root?.querySelector('#envelopeOpenButton');
        this.isOpened = false;
        this.isAnimating = false;
        this.openTimeout = null;
        this.animationDuration = this.getAnimationDuration();

        if (!this.root || !this.trigger || !this.button) return;

        if (sessionStorage.getItem(this.storageKey) === '1') {
            this.finishImmediately();
            return;
        }

        document.body.classList.add('intro-active');
        this.bindEvents();
    }

    getAnimationDuration() {
        const duration = getComputedStyle(this.root)
            .getPropertyValue('--intro-open-duration')
            .trim();
        const fallbackMs = 1450;

        if (!duration) return fallbackMs;
        if (duration.endsWith('ms')) return parseFloat(duration);
        if (duration.endsWith('s')) return parseFloat(duration) * 1000;
        return fallbackMs;
    }

    bindEvents() {
        this.handleOpen = this.handleOpen.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);

        this.trigger.addEventListener('click', this.handleOpen);
        this.button.addEventListener('click', this.handleOpen);
        this.trigger.addEventListener('keydown', this.handleKeydown);
    }

    handleKeydown(event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.handleOpen();
    }

    handleOpen() {
        if (this.isOpened || this.isAnimating) return;

        this.isAnimating = true;
        this.root.classList.add('is-animating', 'is-opening');
        this.button.disabled = true;
        this.trigger.setAttribute('aria-disabled', 'true');

        this.openTimeout = window.setTimeout(() => {
            this.completeOpen();
        }, this.animationDuration + 280);
    }

    completeOpen() {
        if (this.isOpened) return;

        this.isOpened = true;
        this.isAnimating = false;
        sessionStorage.setItem(this.storageKey, '1');
        document.body.classList.remove('intro-active');

        this.root.setAttribute('aria-hidden', 'true');
        this.root.classList.add('is-hidden');

        window.setTimeout(() => {
            this.root.hidden = true;
            this.onOpenComplete();
        }, 700);
    }

    finishImmediately() {
        this.isOpened = true;
        this.root.hidden = true;
        this.root.classList.add('is-hidden');
        this.root.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('intro-active');
        this.onOpenComplete();
    }
}

function initEnvelopeIntro() {
    const introRoot = document.getElementById('envelopeIntro');
    if (!introRoot) return null;

    // Reset intro state on full page leave/reload so the envelope
    // appears again after a manual refresh.
    window.addEventListener('pagehide', () => {
        sessionStorage.removeItem('wedding-envelope-intro-opened');
    });

    return new EnvelopeIntro({
        root: introRoot,
        onOpenComplete: () => {
            document.body.classList.remove('intro-active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initEnvelopeIntro();
});

// ===== ФОРМА (отправка в Google Таблицу) =====
const weddingForm = document.getElementById('weddingForm');
if (weddingForm) {
    const attendanceInput = document.getElementById('attendance');
    const guestsInput = document.getElementById('guests');
    const companionsGroup = document.getElementById('companionsGroup');
    const companionsLabel = document.getElementById('companionsLabel');
    const companionsInput = document.getElementById('companions');
    const drinksSection = document.getElementById('drinksSection');
    const dietGroup = document.getElementById('dietGroup');
    const dietInput = document.getElementById('diet');
    const wishesGroup = document.getElementById('wishesGroup');
    const wishesInput = document.getElementById('wishes');
    const drinksHiddenInput = document.getElementById('drinks');
    const drinksCheckboxes = weddingForm.querySelectorAll('#drinksGroup input[type="checkbox"]');

    function updateCompanionsField() {
        const guestsCount = Number(guestsInput.value) || 1;
        const hasCompanions = guestsCount > 1;
        const attendanceValue = attendanceInput.value;
        const isDeclined = attendanceValue === 'no';

        companionsGroup.classList.toggle('is-hidden', !hasCompanions);
        companionsInput.required = hasCompanions;
        companionsLabel.textContent = isDeclined
            ? 'Имя и фамилия тех, кто не сможет прийти *'
            : 'Имя и фамилия остальных гостей *';

        if (!hasCompanions) {
            companionsInput.value = '';
        }
    }

    function updateDrinksField() {
        const selectedDrinks = Array.from(drinksCheckboxes)
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);

        drinksHiddenInput.value = selectedDrinks.join(', ');
    }

    function updateAttendanceDependentFields() {
        const attendanceValue = attendanceInput.value;
        const hidePreferenceFields = attendanceValue === 'no' || attendanceValue === 'maybe';
        const hideWishesField = attendanceValue === 'maybe';

        drinksSection.classList.toggle('is-hidden', hidePreferenceFields);
        dietGroup.classList.toggle('is-hidden', hidePreferenceFields);
        wishesGroup.classList.toggle('is-hidden', hideWishesField);

        if (hidePreferenceFields) {
            drinksCheckboxes.forEach((checkbox) => {
                checkbox.checked = false;
            });
            dietInput.value = '';
            updateDrinksField();
        }

        if (hideWishesField) {
            wishesInput.value = '';
        }

        updateCompanionsField();
    }

    guestsInput.addEventListener('input', updateCompanionsField);
    attendanceInput.addEventListener('change', updateAttendanceDependentFields);
    drinksCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', updateDrinksField);
    });

    updateAttendanceDependentFields();
    updateDrinksField();

    weddingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const form = this;
        const submitBtn = document.getElementById('submitBtn');
        const formMessage = document.getElementById('formMessage');
        const formSuccessNote = document.getElementById('formSuccessNote');

        formMessage.style.display = 'none';
        formSuccessNote.classList.add('is-hidden');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        const iframe = document.createElement('iframe');
        iframe.name = 'hidden_iframe_' + Date.now();
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        form.target = iframe.name;
        
        iframe.onload = function() {
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Данные отправлены.';
            formMessage.style.display = 'block';
            formSuccessNote.classList.remove('is-hidden');
            form.reset();
            updateAttendanceDependentFields();
            updateDrinksField();
            form.classList.add('is-hidden');
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
            formMessage.style.display = 'block';
            formSuccessNote.classList.add('is-hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
            document.body.removeChild(iframe);
        };
        
        form.submit();
    });

    const resetFormBtn = document.getElementById('resetFormBtn');
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', function() {
            weddingForm.reset();
            updateAttendanceDependentFields();
            updateDrinksField();
            weddingForm.classList.remove('is-hidden');
            document.getElementById('formSuccessNote').classList.add('is-hidden');
            document.getElementById('formMessage').style.display = 'none';
        });
    }
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
    timelinePath.setAttribute('d', 'M64 0 C108 78 108 162 64 240 C20 318 20 402 64 480 C108 558 108 642 64 720 C20 798 20 882 64 960 C108 1038 108 1122 64 1200');
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
    const blocks = document.querySelectorAll('.story, .timer-section, .calendar-section, .schedule, .location, .dresscode, .info, .pet-dressup, .rsvp');
    
    if (!blocks.length) return;

    function updateBlockVisibility() {
        const viewportHeight = window.innerHeight;
        const showLine = viewportHeight * 0.82;
        const hideLine = viewportHeight * 0.08;

        blocks.forEach(block => {
            const rect = block.getBoundingClientRect();
            const shouldShow = rect.top <= showLine && rect.bottom >= hideLine;

            if (shouldShow) {
                block.classList.add('visible-scroll');
                return;
            }

            const isAboveViewport = rect.bottom < hideLine;
            const isBelowViewport = rect.top > showLine;

            if (isAboveViewport || isBelowViewport) {
                block.classList.remove('visible-scroll');
            }
        });
    }

    window.addEventListener('scroll', updateBlockVisibility, { passive: true });
    window.addEventListener('resize', updateBlockVisibility);
    updateBlockVisibility();
}

function initPetDressup() {
    const board = document.getElementById('petDressup');
    if (!board) return;

    const itemButtons = board.querySelectorAll('.pet-item');
    const accessoryRotation = {
        bow: 14,
        bag: -10,
        envelope: -14
    };
    const stage = board.querySelector('.pet-stage');
    const calibrationToggle = document.getElementById('petCalibrationToggle');
    const calibrationHint = document.getElementById('petCalibrationHint');
    const calibrationOutput = document.getElementById('petCalibrationOutput');
    const calibrationMarkers = document.getElementById('petCalibrationMarkers');
    const calibrationSteps = [
        { key: 'bow', label: 'Бантик' },
        { key: 'bag', label: 'Сумочка' },
        { key: 'envelope', label: 'Деньги' }
    ];
    let isCalibrating = false;
    let calibrationIndex = 0;
    let calibrationPoints = [];

    function getAccessoryTransform(itemName, options = {}) {
        const {
            x = 0,
            y = 0,
            scale = 1,
            spin = 0
        } = options;

        const baseRotation = accessoryRotation[itemName] || 0;
        return `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale}) rotate(${baseRotation + spin}deg)`;
    }

    function animateAccessory(button, accessory, shouldShow) {
        const itemName = accessory.dataset.accessory;
        const buttonRect = button.getBoundingClientRect();
        const accessoryRect = accessory.getBoundingClientRect();

        const buttonCenterX = buttonRect.left + (buttonRect.width / 2);
        const buttonCenterY = buttonRect.top + (buttonRect.height / 2);
        const accessoryCenterX = accessoryRect.left + (accessoryRect.width / 2);
        const accessoryCenterY = accessoryRect.top + (accessoryRect.height / 2);
        const deltaX = buttonCenterX - accessoryCenterX;
        const deltaY = buttonCenterY - accessoryCenterY;

        if (accessory._animation) {
            accessory._animation.cancel();
            accessory._animation = null;
        }

        if (shouldShow) {
            accessory.classList.add('is-visible');
            accessory.style.transform = getAccessoryTransform(itemName, {
                x: deltaX,
                y: deltaY,
                scale: 0.22,
                spin: -360
            });

            requestAnimationFrame(() => {
                accessory._animation = accessory.animate([
                    {
                        opacity: 0,
                        transform: getAccessoryTransform(itemName, {
                            x: deltaX,
                            y: deltaY,
                            scale: 0.22,
                            spin: -360
                        })
                    },
                    {
                        opacity: 1,
                        transform: getAccessoryTransform(itemName)
                    }
                ], {
                    duration: 900,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    fill: 'forwards'
                });
            });

            return;
        }

        accessory._animation = accessory.animate([
            {
                opacity: 1,
                transform: getAccessoryTransform(itemName)
            },
            {
                opacity: 0,
                transform: getAccessoryTransform(itemName, {
                    x: deltaX,
                    y: deltaY,
                    scale: 0.22,
                    spin: 360
                })
            }
        ], {
            duration: 700,
            easing: 'cubic-bezier(0.4, 0, 1, 1)',
            fill: 'forwards'
        });

        accessory._animation.onfinish = function() {
            accessory.classList.remove('is-visible');
            accessory.style.transform = getAccessoryTransform(itemName);
            accessory._animation = null;
        };
    }

    board.querySelectorAll('.pet-accessory').forEach((accessory) => {
        accessory.style.transform = getAccessoryTransform(accessory.dataset.accessory);
    });

    itemButtons.forEach((button) => {
        button.addEventListener('click', function() {
            const itemName = button.dataset.item;
            const accessory = board.querySelector(`.pet-accessory[data-accessory="${itemName}"]`);
            if (!accessory) return;

            const shouldShow = !accessory.classList.contains('is-visible');
            animateAccessory(button, accessory, shouldShow);
            button.classList.toggle('is-placed', shouldShow);
            button.setAttribute('aria-pressed', shouldShow ? 'true' : 'false');
        });
    });

    if (!stage || !calibrationToggle || !calibrationHint || !calibrationOutput || !calibrationMarkers) {
        return;
    }

    function renderCalibrationMarkers() {
        calibrationMarkers.innerHTML = calibrationPoints.map((point, index) => `
            <span
                class="pet-calibration-marker"
                data-index="${index + 1}"
                style="left:${point.xPercent}%; top:${point.yPercent}%;">
            </span>
        `).join('');
    }

    function updateCalibrationHint() {
        if (!isCalibrating) {
            calibrationHint.textContent = 'Нажми кнопку, затем кликни по собаке: 1. бантик, 2. сумочка, 3. деньги.';
            return;
        }

        const currentStep = calibrationSteps[calibrationIndex];
        calibrationHint.textContent = `Шаг ${calibrationIndex + 1} из 3: кликни место для "${currentStep.label.toLowerCase()}".`;
    }

    function stopCalibration() {
        isCalibrating = false;
        calibrationIndex = 0;
        stage.classList.remove('is-calibrating');
        calibrationToggle.classList.remove('is-active');
        calibrationToggle.textContent = 'Выбрать 3 точки';
        updateCalibrationHint();
    }

    calibrationToggle.addEventListener('click', function() {
        if (isCalibrating) {
            calibrationPoints = [];
            renderCalibrationMarkers();
            calibrationOutput.textContent = '';
            stopCalibration();
            return;
        }

        calibrationPoints = [];
        calibrationIndex = 0;
        renderCalibrationMarkers();
        calibrationOutput.textContent = '';
        isCalibrating = true;
        stage.classList.add('is-calibrating');
        calibrationToggle.classList.add('is-active');
        calibrationToggle.textContent = 'Сбросить точки';
        updateCalibrationHint();
    });

    stage.addEventListener('click', function(event) {
        if (!isCalibrating) return;

        if (event.target.closest('.pet-item')) return;

        const rect = stage.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const xPercent = Number(((x / rect.width) * 100).toFixed(2));
        const yPercent = Number(((y / rect.height) * 100).toFixed(2));
        const currentStep = calibrationSteps[calibrationIndex];

        calibrationPoints.push({
            key: currentStep.key,
            label: currentStep.label,
            xPercent,
            yPercent
        });

        renderCalibrationMarkers();
        calibrationIndex += 1;

        if (calibrationIndex >= calibrationSteps.length) {
            const resultText = calibrationPoints
                .map((point) => `${point.label}: x ${point.xPercent}% y ${point.yPercent}%`)
                .join(' | ');

            calibrationOutput.textContent = resultText;
            stopCalibration();
            return;
        }

        updateCalibrationHint();
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

    function scrollToSlide(track, index, smooth = true) {
        const slides = getSlides(track);
        if (!slides.length) return 0;

        const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
        const slide = slides[safeIndex];
        const targetLeft = slide.offsetLeft - ((track.clientWidth - slide.offsetWidth) / 2);

        track.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: smooth ? 'smooth' : 'auto'
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

        function goToSlide(index, smooth = true) {
            currentIndex = scrollToSlide(track, index, smooth);
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
            goToSlide(currentIndex, false);
        });

        window.requestAnimationFrame(function() {
            goToSlide(0, false);
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
    initPetDressup();
});
