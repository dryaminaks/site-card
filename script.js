// ===== МУЗЫКА ДЛЯ АТМОСФЕРЫ =====
document.addEventListener('DOMContentLoaded', function() {
    const musicBtn = document.getElementById('musicToggleBtn');
    
    // Если кнопка не найдена — выходим (чтобы не было ошибки)
    if (!musicBtn) return;
    
    // Создаем аудиоэлемент (романтическая фоновая музыка)
    const bgMusic = new Audio('music/music.mp3');
    bgMusic.loop = true; // Зацикливаем
    bgMusic.volume = 0.3; // Громкость 30% (не навязчиво)
    
    let isPlaying = false;
    
    // Обновление UI кнопки
    function updateButtonUI() {
        if (isPlaying) {
            musicBtn.classList.add('playing');
            musicBtn.innerHTML = '<i class="fas fa-pause"></i><span>Выключить музыку</span>';
        } else {
            musicBtn.classList.remove('playing');
            musicBtn.innerHTML = '<i class="fas fa-music"></i><span>Включить музыку</span>';
        }
    }
    
    // Обработчик клика по кнопке
    musicBtn.addEventListener('click', function() {
        if (isPlaying) {
            bgMusic.pause();
            isPlaying = false;
        } else {
            // Пытаемся воспроизвести (браузеры могут блокировать автовоспроизведение)
            bgMusic.play().catch(e => {
                console.log('Автовоспроизведение заблокировано:', e);
                // Показываем подсказку
                musicBtn.innerHTML = '<i class="fas fa-music"></i><span>Нажмите ещё раз</span>';
                setTimeout(() => updateButtonUI(), 1000);
            });
            isPlaying = true;
        }
        updateButtonUI();
    });
    
    // Если музыка играла, а пользователь свернул вкладку — ставим на паузу
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && isPlaying) {
            bgMusic.pause();
        } else if (!document.hidden && isPlaying) {
            bgMusic.play();
        }
    });
});

// ===== КОНВЕРТ С АНИМАЦИЕЙ =====
document.addEventListener('DOMContentLoaded', function() {
    const envelope = document.getElementById('envelope');
    const coverPage = document.getElementById('coverPage');
    const invitePage = document.getElementById('invitePage');
    
    if (!envelope) return;
    
    // Создаем звук при открытии
    const openSound = new Audio('https://www.soundjay.com/misc/sounds/envelope-opening-01.mp3');
    openSound.load();
    
    envelope.addEventListener('click', function() {
        // Воспроизводим звук
        openSound.play().catch(e => console.log('Звук не воспроизвелся:', e));
        
        // Добавляем класс open для анимации конверта
        this.classList.add('open');
        
        // Через 0.6 секунд показываем основной сайт
        setTimeout(() => {
            if (coverPage) coverPage.classList.add('hidden');
            if (invitePage) invitePage.classList.add('visible');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 600);
    });
});

// ===== ТАЙМЕР ОБРАТНОГО ОТСЧЕТА =====
function updateTimer() {
    const weddingDate = new Date(2026, 7, 2, 14, 0); // 2 августа 2026, 14:00
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

// Запускаем таймер
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