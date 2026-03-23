// ===== CSS КОНВЕРТ С АНИМАЦИЕЙ =====
document.addEventListener('DOMContentLoaded', function() {
    const envelope = document.getElementById('envelope');
    const coverPage = document.getElementById('coverPage');
    const invitePage = document.getElementById('invitePage');
    
    // Создаем звук при открытии
    const openSound = new Audio('https://www.soundjay.com/misc/sounds/envelope-opening-01.mp3');
    openSound.load();
    
    if (envelope) {
        envelope.addEventListener('click', function() {
            // Воспроизводим звук
            openSound.play().catch(e => console.log('Звук не воспроизвелся:', e));
            
            // Добавляем класс open для анимации конверта
            this.classList.add('open');
            
            // Через 0.6 секунд показываем основной сайт
            setTimeout(() => {
                coverPage.classList.add('hidden');
                invitePage.classList.add('visible');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 600);
        });
    }
});

// ===== ТАЙМЕР ОБРАТНОГО ОТСЧЕТА =====
function updateTimer() {
    const weddingDate = new Date(2026, 7, 2, 14, 0);
    const now = new Date();
    const diff = weddingDate - now;
    
    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
}

updateTimer();
setInterval(updateTimer, 1000);

// ===== ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ =====
const sections = document.querySelectorAll('.invite-page section:not(.hero)');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

sections.forEach(section => {
    section.style.opacity = 0;
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});

// ===== ФОРМА =====
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