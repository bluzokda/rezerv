// Проверка реальной сессии через Supabase
document.addEventListener('DOMContentLoaded', async function () {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    window.location.href = 'login.html';
  } else {
    console.log('Авторизован как:', session.user.email);
    loadUserProgress(session.user.id);
  }
});
const supabaseUrl = 'https://tekxmqrbpdzmbcjszksg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3htcXJicGR6bWJjanN6a3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzE4NTAsImV4cCI6MjA2MjkwNzg1MH0.YLJrqLBam99cYu0_ZTi-I57kYw7aCrilHyriTwLVYZ4';
const supabase = createClient(supabaseUrl, supabaseKey);
// Глобальные переменные
let currentDepositTask = {};
let currentAnnuityTask = {};
let currentDiffTask = {};
let currentInvestTask = {};
let currentEgeTask = {};
let score = 0;
let totalTasks = 0;
let answeredDeposit = false;
let answeredAnnuity = false;
let answeredDiff = false;
let answeredInvest = false;
let answeredEge = false;
let currentLevel = 'basic'; // 'basic' или 'advanced'
let egeTasksCompleted = 0;
let egeTotalScore = 0;

// Проверяем реальную сессию через Supabase
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const authData = JSON.parse(localStorage.getItem('auth'));
    const { data: { session }, error } = await supabase.auth.getSession();

    if (authData && authData.isAuthenticated && (!error && session)) {
      // Пользователь авторизован — показываем основной контент
      document.getElementById('auth-container').classList.add('hidden');
      document.getElementById('main-content').classList.remove('hidden');
      loadUserProgress(authData.userId);
    } else {
      // Показываем форму
      document.getElementById('auth-container').classList.remove('hidden');
      document.getElementById('main-content').classList.add('hidden');
    }
  } catch (err) {
    console.error('Ошибка проверки сессии:', err.message);
    document.getElementById('auth-container').classList.remove('hidden');
  }
});
      // Добавляем функционал учителя, если роль соответствует
      if (role === 'teacher') {
        addTeacherFeatures();
      }
    }
  } catch (err) {
    console.error('Ошибка проверки авторизации:', err.message);
    window.location.href = 'login.html';
  }
});
    // Добавляем кнопку просмотра ответов учеников
    const tabsContainer = document.querySelector('.flex.flex-wrap.gap-3.mb-8');
    if (tabsContainer) {
        const teacherTab = document.createElement('button');
        teacherTab.className = 'tab-btn tab-inactive px-5 py-3 rounded-full font-medium flex items-center';
        teacherTab.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Ответы учеников
        `;
        teacherTab.onclick = function() {
            openTeacherView();
        };
        tabsContainer.appendChild(teacherTab);
    }
}

async function openTeacherView() {
    // Загружаем ответы учеников из Supabase
    try {
        const { data, error } = await supabase
            .from('user_responses')
            .select('*')
            .order('response_time', { ascending: false });
        
        if (error) throw error;
        
        // Создаем модальное окно с результатами
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="neon-card neon-border rounded-2xl overflow-hidden w-full max-w-4xl max-h-[80vh] flex flex-col">
                <div class="p-6 border-b border-white/10">
                    <h2 class="text-2xl font-bold">Ответы учеников</h2>
                </div>
                <div class="overflow-y-auto p-6">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-left border-b border-white/10">
                                <th class="pb-2">Email</th>
                                <th class="pb-2">Тип задачи</th>
                                <th class="pb-2">Вопрос</th>
                                <th class="pb-2">Ответ</th>
                                <th class="pb-2">Правильно</th>
                                <th class="pb-2">Дата</th>
                            </tr>
                        </thead>
                        <tbody id="responsesTableBody">
                            <!-- Данные будут добавлены здесь -->
                        </tbody>
                    </table>
                </div>
                <div class="p-4 border-t border-white/10 flex justify-end">
                    <button onclick="this.closest('div[class^=\"fixed\"]').remove()" 
                        class="btn-neon px-4 py-2 rounded-lg">
                        Закрыть
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const tableBody = document.getElementById('responsesTableBody');
        data.forEach(response => {
            const row = document.createElement('tr');
            row.className = 'border-b border-white/10';
            row.innerHTML = `
                <td class="py-3">${response.user_id || 'Гость'}</td>
                <td class="py-3">${response.block}</td>
                <td class="py-3 max-w-xs truncate">${response.question_text}</td>
                <td class="py-3">${response.user_answer}</td>
                <td class="py-3">${response.is_correct ? '✅' : '❌'}</td>
                <td class="py-3">${new Date(response.response_time).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Ошибка загрузки ответов:', error);
        alert('Не удалось загрузить ответы учеников');
    }
}

// Инициализация Supabase клиента
const supabaseUrl = 'https://tekxmqrbpdzmbcjszksg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3htcXJicGR6bWJjanN6a3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzE4NTAsImV4cCI6MjA2MjkwNzg1MH0.YLJrqLBam99cYu0_ZTi-I57kYw7aCrilHyriTwLVYZ4';
const supabase = createClient(supabaseUrl, supabaseKey);

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', async function () {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    // Если нет сессии — перенаправляем на login.html
    window.location.href = 'login.html';
  } else {
    console.log('Пользователь авторизован:', session.user.email);
    loadUserProgress(session.user.id);
  }
});

// ================== ФУНКЦИИ SUPABASE ==================

// Проверка состояния аутентификации
async function checkAuthState() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        console.log('Пользователь авторизован:', user.email);
        loadUserProgress(user.id);
    }
}

async function saveResponseToSupabase(taskType, userAnswer, isCorrect, correctAnswer, questionText) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('Пользователь не авторизован');
      return;
    }

    const userId = user.id;

    const { error } = await supabase.from('user_responses').insert([{
      block: taskType,
      user_answer: userAnswer.toString(),
      is_correct: isCorrect,
      correct_answer: correctAnswer.toString(),
      question_text: questionText,
      level: currentLevel,
      response_time: new Date().toISOString(),
      user_id: userId // <-- Сохраняем ID пользователя
    }]);

    if (error) throw error;

    console.log('Ответ успешно сохранён с user_id:', userId);
  } catch (err) {
    console.error('Ошибка сохранения в Supabase:', err.message);
  }
}

        // Подготавливаем данные для вставки
        const responseData = {
            block: taskType,
            user_answer: userAnswer.toString(),
            is_correct: isCorrect,
            correct_answer: correctAnswer.toString(),
            question_text: questionText,
            level: currentLevel,
            response_time: new Date().toISOString()
        };

        // Добавляем user_id только если пользователь авторизован
        if (user) {
            responseData.user_id = user.id;
        }

        console.log('Отправка данных в Supabase:', responseData); // Для отладки

        // Вставляем данные
        const { data, error } = await supabase
            .from('user_responses')
            .insert([responseData]);

        if (error) {
            console.error('Ошибка сохранения ответа:', error);
            return false;
        }

        console.log('Ответ успешно сохранён:', data);
        return true;
    } catch (error) {
        console.error('Неожиданная ошибка:', error);
        return false;
    }
}

// Получение ID пользователя
async function getUserId() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    } catch (error) {
        console.error('Auth Error:', error);
        return null;
    }
}

async function loadUserProgress(userId) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return;

  document.getElementById('progress-bar').style.width = `${data.progress}%`;
  document.getElementById('total-score').textContent = `${data.progress}%`;
}
    
    // Обновляем прогресс на странице
    document.getElementById('progress-bar').style.width = `${data.progress}%`;
    document.getElementById('total-score').textContent = `${data.progress}%`;
    
    // Можно добавить загрузку других данных, если нужно
}

// Сохранение прогресса пользователя
async function saveUserProgress(progress, correctAnswers, totalAnswers) {
    const userId = await getUserId();
    if (!userId) return;
    
    const { data, error } = await supabase
        .from('user_progress')
        .upsert([
            {
                user_id: userId,
                progress: progress,
                correct_answers: correctAnswers,
                total_answers: totalAnswers,
                last_updated: new Date().toISOString()
            }
        ], { onConflict: 'user_id' });
    
    if (error) {
        console.error('Ошибка сохранения прогресса:', error);
    }
}

// ================== ОСНОВНЫЕ ФУНКЦИИ ==================

// Создание анимированного фона
function createBubbles() {
    const container = document.getElementById('bubbles-container');
    if (!container) return;
    
    container.innerHTML = '';
    const colors = [
        'rgba(0, 242, 255, 0.1)',
        'rgba(180, 0, 255, 0.1)',
        'rgba(255, 0, 195, 0.1)'
    ];
    
    for (let i = 0; i < 20; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('neon-bubble');
        
        const size = Math.random() * 200 + 50;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * -20;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = 500 + Math.random() * 500;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        bubble.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${posX}px;
            top: ${posY}px;
            background: ${color};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            --tx: ${tx}px;
            --ty: ${ty}px;
        `;
        
        container.appendChild(bubble);
    }
}

// Управление табами
function openTab(event, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.add('hidden');
        tabContents[i].classList.remove('active');
    }
    
    const tabButtons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('tab-active');
        tabButtons[i].classList.add('tab-inactive');
    }
    
    document.getElementById(tabName).classList.remove('hidden');
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.remove('tab-inactive');
    event.currentTarget.classList.add('tab-active');
    
    // Генерация задач при переключении вкладок
    if (tabName === 'deposit') generateDepositTask();
    if (tabName === 'annuity') generateAnnuityTask();
    if (tabName === 'diff') generateDiffTask();
    if (tabName === 'invest') generateInvestTask();
    if (tabName === 'ege') generateEgeTask();
}

// Переключение уровня сложности
function changeLevel(level) {
    currentLevel = level;
    
    // Обновляем стили кнопок
    document.getElementById('basic-tab').className = level === 'basic' ? 'level-tab active' : 'level-tab inactive';
    document.getElementById('advanced-tab').className = level === 'advanced' ? 'level-tab active' : 'level-tab inactive';
    
    // Перегенерируем текущую задачу
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const tabId = activeTab.id;
        if (tabId === 'deposit') generateDepositTask();
        if (tabId === 'annuity') generateAnnuityTask();
        if (tabId === 'diff') generateDiffTask();
        if (tabId === 'invest') generateInvestTask();
        if (tabId === 'ege') generateEgeTask();
    }
}

// Установка уровня сложности для задач ЕГЭ
function setEgeLevel(level) {
    currentLevel = level;
    
    // Обновляем стили кнопок
    document.getElementById('ege-basic-btn').className = level === 'basic' ? 'px-4 py-2 rounded-l-lg font-medium bg-red-900/50 text-white border border-red-500' : 'px-4 py-2 rounded-l-lg font-medium bg-gray-800/50 text-white/70 border border-gray-700';
    document.getElementById('ege-advanced-btn').className = level === 'advanced' ? 'px-4 py-2 rounded-r-lg font-medium bg-red-900/50 text-white border border-red-500' : 'px-4 py-2 rounded-r-lg font-medium bg-gray-800/50 text-white/70 border border-gray-700';
    
    // Сброс счетчиков при смене уровня
    egeTasksCompleted = 0;
    egeTotalScore = 0;
    document.getElementById('ege-score').textContent = '0';
    document.getElementById('ege-tasks').textContent = '0/10';
    document.getElementById('ege-new-task-btn').disabled = false;
    
    // Генерируем новую задачу
    generateEgeTask();
}

// Обновление прогресса
function updateProgress() {
    let totalCorrect = 0;
    let totalTasks = 0;
    
    ['deposit', 'annuity', 'diff', 'invest', 'ege'].forEach(type => {
        totalCorrect += parseInt(document.getElementById(`${type}-score`).textContent);
        totalTasks += parseInt(document.getElementById(`${type}-total`).textContent);
    });
    
    const progress = totalTasks > 0 ? Math.round((totalCorrect / totalTasks) * 100) : 0;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('total-score').textContent = `${progress}%`;
    
    // Сохраняем прогресс пользователя
    saveUserProgress(progress, totalCorrect, totalTasks);
}

// ================== ФУНКЦИИ ДЛЯ РАБОТЫ С ВКЛАДАМИ ==================

function generateDepositTask() {
    let principal, rate, years, isCompound;
    
    if (currentLevel === 'basic') {
        principal = Math.floor(Math.random() * 90000) + 10000;
        rate = Math.floor(Math.random() * 11) + 5;
        years = Math.floor(Math.random() * 5) + 1;
        isCompound = Math.random() > 0.5;
    } else {
        principal = Math.floor(Math.random() * 900000) + 100000;
        rate = Math.floor(Math.random() * 15) + 5;
        years = Math.floor(Math.random() * 10) + 1;
        isCompound = true;
        
        if (Math.random() < 0.3) {
            const monthlyRate = rate / 12;
            const months = years * 12;
            
            currentDepositTask = {
                correct: principal * Math.pow(1 + monthlyRate / 100, months),
                question: `Вклад ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с ежемесячной капитализацией. Сколько получит клиент?`
            };
            
            document.getElementById('deposit-question').textContent = currentDepositTask.question;
            document.getElementById('deposit-answer').value = '';
            document.getElementById('deposit-result').classList.add('hidden');
            document.getElementById('deposit-answer').disabled = false;
            document.getElementById('deposit-alert').classList.add('hidden');
            answeredDeposit = false;
            return;
        }
    }
    
    if (isCompound) {
        currentDepositTask = {
            correct: principal * Math.pow(1 + rate / 100, years),
            question: `Вклад ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с капитализацией. Сколько получит клиент?`
        };
    } else {
        currentDepositTask = {
            correct: principal * (1 + rate / 100 * years),
            question: `Вклад ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} без капитализации. Сколько получит клиент?`
        };
    }
    
    document.getElementById('deposit-question').textContent = currentDepositTask.question;
    document.getElementById('deposit-answer').value = '';
    document.getElementById('deposit-result').classList.add('hidden');
    document.getElementById('deposit-answer').disabled = false;
    document.getElementById('deposit-alert').classList.add('hidden');
    answeredDeposit = false;
}

function checkDepositAnswer() {
    const alertDiv = document.getElementById('deposit-alert');
    const answerInput = document.getElementById('deposit-answer');
    const resultDiv = document.getElementById('deposit-result');
    
    if (answeredDeposit) {
        resultDiv.textContent = "Вы уже ответили! Нажмите 'Новая задача'.";
        resultDiv.className = 'bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value;
    const userAnswer = parseFloat(userInput);
    
    if (isNaN(userAnswer)) {
        alertDiv.textContent = 'Пожалуйста, введите корректное число';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredDeposit = true;
    totalTasks++;
    
    const roundedAnswer = Math.round(userAnswer * 100) / 100;
    const isCorrect = Math.abs(roundedAnswer - currentDepositTask.correct) < 0.01;
    
    if (isCorrect) {
        resultDiv.textContent = `✅ Правильно! Ответ: ${currentDepositTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-green-900/20 text-green-400 neon-border';
        score++;
    } else {
        resultDiv.textContent = `❌ Неправильно. Правильный ответ: ${currentDepositTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-red-900/20 text-red-400 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;
    
    const scoreSpan = document.getElementById('deposit-score');
    scoreSpan.textContent = parseInt(scoreSpan.textContent) + (isCorrect ? 1 : 0);
    const totalSpan = document.getElementById('deposit-total');
    totalSpan.textContent = parseInt(totalSpan.textContent) + 1;
    
    // Сохраняем ответ в Supabase
    saveResponseToSupabase(
        'deposit',
        userAnswer,
        isCorrect,
        currentDepositTask.correct,
        currentDepositTask.question
    );
    
    updateProgress();
}

// ================== ФУНКЦИИ ДЛЯ АННУИТЕТНЫХ КРЕДИТОВ ==================

function generateAnnuityTask() {
    let principal, rate, years;
    
    if (currentLevel === 'basic') {
        principal = Math.floor(Math.random() * 900000) + 100000;
        rate = Math.floor(Math.random() * 11) + 10;
        years = Math.floor(Math.random() * 5) + 1;
    } else {
        principal = Math.floor(Math.random() * 5000000) + 1000000;
        rate = Math.floor(Math.random() * 15) + 10;
        years = Math.floor(Math.random() * 10) + 1;
        
        if (Math.random() < 0.3) {
            const commission = Math.floor(Math.random() * 5) + 1;
            const months = years * 12;
            const monthlyRate = rate / 100 / 12;
            const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                           (Math.pow(1 + monthlyRate, months) - 1);
            
            currentAnnuityTask = {
                correct: payment + (principal * commission / 100 / 12),
                question: `Кредит ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с аннуитетными платежами. Банк берёт ${commission}% от суммы кредита в качестве ежемесячной комиссии. Какой будет ежемесячный платёж?`
            };
            
            document.getElementById('annuity-question').textContent = currentAnnuityTask.question;
            document.getElementById('annuity-answer').value = '';
            document.getElementById('annuity-result').classList.add('hidden');
            document.getElementById('annuity-answer').disabled = false;
            document.getElementById('annuity-alert').classList.add('hidden');
            answeredAnnuity = false;
            return;
        }
    }
    
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    
    currentAnnuityTask = {
        correct: principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1),
        question: `Кредит ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с аннуитетными платежами. Какой будет ежемесячный платёж?`
    };
    
    document.getElementById('annuity-question').textContent = currentAnnuityTask.question;
    document.getElementById('annuity-answer').value = '';
    document.getElementById('annuity-result').classList.add('hidden');
    document.getElementById('annuity-answer').disabled = false;
    document.getElementById('annuity-alert').classList.add('hidden');
    answeredAnnuity = false;
}

function checkAnnuityAnswer() {
    const alertDiv = document.getElementById('annuity-alert');
    const answerInput = document.getElementById('annuity-answer');
    const resultDiv = document.getElementById('annuity-result');
    
    if (answeredAnnuity) {
        resultDiv.textContent = "Вы уже ответили! Нажмите 'Новая задача'.";
        resultDiv.className = 'bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value;
    const userAnswer = parseFloat(userInput);
    
    if (isNaN(userAnswer)) {
        alertDiv.textContent = 'Пожалуйста, введите корректное число';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredAnnuity = true;
    totalTasks++;
    
    const roundedAnswer = Math.round(userAnswer * 100) / 100;
    const isCorrect = Math.abs(roundedAnswer - currentAnnuityTask.correct) < 0.01;
    
    if (isCorrect) {
        resultDiv.textContent = `✅ Правильно! Ответ: ${currentAnnuityTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-green-900/20 text-green-400 neon-border';
        score++;
    } else {
        resultDiv.textContent = `❌ Неправильно. Правильный ответ: ${currentAnnuityTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-red-900/20 text-red-400 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;
    
    const scoreSpan = document.getElementById('annuity-score');
    scoreSpan.textContent = parseInt(scoreSpan.textContent) + (isCorrect ? 1 : 0);
    const totalSpan = document.getElementById('annuity-total');
    totalSpan.textContent = parseInt(totalSpan.textContent) + 1;
    
    // Сохраняем ответ в Supabase
    saveResponseToSupabase(
        'annuity',
        userAnswer,
        isCorrect,
        currentAnnuityTask.correct,
        currentAnnuityTask.question
    );
    
    updateProgress();
}

// ================== ФУНКЦИИ ДЛЯ ДИФФЕРЕНЦИРОВАННЫХ КРЕДИТОВ ==================

function generateDiffTask() {
    let principal, rate, years;
    
    if (currentLevel === 'basic') {
        principal = Math.floor(Math.random() * 900000) + 100000;
        rate = Math.floor(Math.random() * 11) + 10;
        years = Math.floor(Math.random() * 5) + 1;
    } else {
        principal = Math.floor(Math.random() * 5000000) + 1000000;
        rate = Math.floor(Math.random() * 15) + 10;
        years = Math.floor(Math.random() * 10) + 1;
        
        if (Math.random() < 0.3) {
            const commission = Math.floor(Math.random() * 5) + 1;
            const months = years * 12;
            const monthlyPrincipal = principal / months;
            const firstPayment = monthlyPrincipal + principal * (rate / 100 / 12) + (principal * commission / 100);
            const lastPayment = monthlyPrincipal + monthlyPrincipal * (rate / 100 / 12) + (monthlyPrincipal * commission / 100);
            
            currentDiffTask = {
                firstPayment: firstPayment,
                lastPayment: lastPayment,
                question: `Кредит ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с дифференцированными платежами. Банк берёт ${commission}% от остатка долга в качестве ежемесячной комиссии. Какой будет первый и последний платежи? (введите через пробел)`
            };
            
            document.getElementById('diff-question').textContent = currentDiffTask.question;
            document.getElementById('diff-answer').value = '';
            document.getElementById('diff-result').classList.add('hidden');
            document.getElementById('diff-answer').disabled = false;
            document.getElementById('diff-alert').classList.add('hidden');
            answeredDiff = false;
            return;
        }
    }
    
    const months = years * 12;
    const monthlyPrincipal = principal / months;
    
    currentDiffTask = {
        firstPayment: monthlyPrincipal + principal * (rate / 100 / 12),
        lastPayment: monthlyPrincipal + monthlyPrincipal * (rate / 100 / 12),
        question: `Кредит ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с дифференцированными платежами. Какой будет первый и последний платежи? (введите через пробел)`
    };
    
    document.getElementById('diff-question').textContent = currentDiffTask.question;
    document.getElementById('diff-answer').value = '';
    document.getElementById('diff-result').classList.add('hidden');
    document.getElementById('diff-answer').disabled = false;
    document.getElementById('diff-alert').classList.add('hidden');
    answeredDiff = false;
}

function checkDiffAnswer() {
    const alertDiv = document.getElementById('diff-alert');
    const answerInput = document.getElementById('diff-answer');
    const resultDiv = document.getElementById('diff-result');
    
    if (answeredDiff) {
        resultDiv.textContent = "Вы уже ответили! Нажмите 'Новая задача'.";
        resultDiv.className = 'bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value;
    const parts = userInput.trim().split(/\s+/);
    
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        alertDiv.textContent = 'Пожалуйста, введите два числа через пробел';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredDiff = true;
    totalTasks++;
    
    const userAnswer1 = parseFloat(parts[0]);
    const userAnswer2 = parseFloat(parts[1]);
    const isCorrect = Math.abs(userAnswer1 - currentDiffTask.firstPayment) < 0.01 && 
                     Math.abs(userAnswer2 - currentDiffTask.lastPayment) < 0.01;
    
    if (isCorrect) {
        resultDiv.textContent = `✅ Правильно! Ответ: ${currentDiffTask.firstPayment.toLocaleString('ru-RU')} руб. и ${currentDiffTask.lastPayment.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-green-900/20 text-green-400 neon-border';
        score++;
    } else {
        resultDiv.textContent = `❌ Неправильно. Правильный ответ: ${currentDiffTask.firstPayment.toLocaleString('ru-RU')} руб. и ${currentDiffTask.lastPayment.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-red-900/20 text-red-400 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;
    
    const scoreSpan = document.getElementById('diff-score');
    scoreSpan.textContent = parseInt(scoreSpan.textContent) + (isCorrect ? 1 : 0);
    const totalSpan = document.getElementById('diff-total');
    totalSpan.textContent = parseInt(totalSpan.textContent) + 1;
    
    // Сохраняем ответ в Supabase
    saveResponseToSupabase(
        'diff',
        `${userAnswer1} ${userAnswer2}`,
        isCorrect,
        `${currentDiffTask.firstPayment} ${currentDiffTask.lastPayment}`,
        currentDiffTask.question
    );
    
    updateProgress();
}

// ================== ФУНКЦИИ ДЛЯ ИНВЕСТИЦИЙ ==================

function generateInvestTask() {
    let target, rate, years;
    
    if (currentLevel === 'basic') {
        target = Math.floor(Math.random() * 9000000) + 1000000;
        rate = Math.floor(Math.random() * 8) + 5;
        years = Math.floor(Math.random() * 15) + 5;
        
        currentInvestTask = {
            correct: target / Math.pow(1 + rate / 100, years),
            question: `Какую сумму вам нужно инвестировать сегодня под ${rate}% годовых, чтобы через ${years} ${getYearWord(years)} получить ${formatNumber(target)} руб.?`
        };
    } else {
        target = Math.floor(Math.random() * 90000000) + 10000000;
        rate = Math.floor(Math.random() * 15) + 5;
        years = Math.floor(Math.random() * 30) + 10;
        
        if (Math.random() < 0.3) {
            const monthlyPayment = Math.floor(Math.random() * 50000) + 10000;
            const monthlyRate = rate / 12 / 100;
            const months = years * 12;
            const futureValue = monthlyPayment * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
            
            currentInvestTask = {
                correct: futureValue,
                question: `Вы планируете ежемесячно вносить ${formatNumber(monthlyPayment)} руб. на инвестиционный счёт под ${rate}% годовых с ежемесячной капитализацией. Какую сумму вы накопите через ${years} ${getYearWord(years)}?`
            };
            
            document.getElementById('invest-question').textContent = currentInvestTask.question;
            document.getElementById('invest-answer').value = '';
            document.getElementById('invest-result').classList.add('hidden');
            document.getElementById('invest-answer').disabled = false;
            document.getElementById('invest-alert').classList.add('hidden');
            answeredInvest = false;
            return;
        }
        
        currentInvestTask = {
            correct: target / Math.pow(1 + rate / 100, years),
            question: `Какую сумму вам нужно инвестировать сегодня под ${rate}% годовых, чтобы через ${years} ${getYearWord(years)} получить ${formatNumber(target)} руб.?`
        };
    }
    
    document.getElementById('invest-question').textContent = currentInvestTask.question;
    document.getElementById('invest-answer').value = '';
    document.getElementById('invest-result').classList.add('hidden');
    document.getElementById('invest-answer').disabled = false;
    document.getElementById('invest-alert').classList.add('hidden');
    answeredInvest = false;
}

function checkInvestAnswer() {
    const alertDiv = document.getElementById('invest-alert');
    const answerInput = document.getElementById('invest-answer');
    const resultDiv = document.getElementById('invest-result');
    
    if (answeredInvest) {
        resultDiv.textContent = "Вы уже ответили! Нажмите 'Новая задача'.";
        resultDiv.className = 'bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value;
    const userAnswer = parseFloat(userInput);
    
    if (isNaN(userAnswer)) {
        alertDiv.textContent = 'Пожалуйста, введите корректное число';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredInvest = true;
    totalTasks++;
    
    const roundedAnswer = Math.round(userAnswer * 100) / 100;
    const isCorrect = Math.abs(roundedAnswer - currentInvestTask.correct) < 0.01;
    
    if (isCorrect) {
        resultDiv.textContent = `✅ Правильно! Ответ: ${currentInvestTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-green-900/20 text-green-400 neon-border';
        score++;
    } else {
        resultDiv.textContent = `❌ Неправильно. Правильный ответ: ${currentInvestTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-red-900/20 text-red-400 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;
    
    const scoreSpan = document.getElementById('invest-score');
    scoreSpan.textContent = parseInt(scoreSpan.textContent) + (isCorrect ? 1 : 0);
    const totalSpan = document.getElementById('invest-total');
    totalSpan.textContent = parseInt(totalSpan.textContent) + 1;
    
    // Сохраняем ответ в Supabase
    saveResponseToSupabase(
        'invest',
        userAnswer,
        isCorrect,
        currentInvestTask.correct,
        currentInvestTask.question
    );
    
    updateProgress();
}

// ================== ФУНКЦИИ ДЛЯ ЗАДАЧ ЕГЭ ==================

function generateEgeTask() {
    if (egeTasksCompleted >= 10) {
        document.getElementById('ege-question').textContent = "Вы уже решили 10 задач. Максимальное количество задач достигнуто.";
        document.getElementById('ege-answer').disabled = true;
        document.getElementById('ege-new-task-btn').disabled = true;
        return;
    }
    
    if (currentLevel === 'basic') {
        generateBasicEgeTask();
    } else {
        generateAdvancedEgeTask();
    }
}

function generateBasicEgeTask() {
    const taskTypes = ['deposit', 'credit', 'discount'];
    const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    
    let question, correct, solution;
    const amount = Math.round((10000 + Math.random() * 90000) / 1000) * 1000;
    const years = 1 + Math.floor(Math.random() * 5);
    const rate = 5 + Math.floor(Math.random() * 16);
    
    switch(type) {
        case 'deposit':
            const capitalization = ['ежегодно', 'ежеквартально', 'ежемесячно'][Math.floor(Math.random() * 3)];
            let periodsPerYear, totalPeriods;
            
            if (capitalization === 'ежегодно') {
                periodsPerYear = 1;
                totalPeriods = years;
            } else if (capitalization === 'ежеквартально') {
                periodsPerYear = 4;
                totalPeriods = years * 4;
            } else {
                periodsPerYear = 12;
                totalPeriods = years * 12;
            }
            
            const periodRate = rate / periodsPerYear / 100;
            const finalAmount = Math.round(amount * Math.pow(1 + periodRate, totalPeriods));
            
            question = `Вкладчик положил в банк ${amount.toLocaleString('ru-RU')} рублей под ${rate}% годовых с капитализацией ${capitalization}. Какая сумма будет на счету через ${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}?`;
            correct = finalAmount.toString();
            solution = `Используем формулу сложных процентов: S = P × (1 + r)^n = ${amount} × (1 + ${periodRate.toFixed(4)})^{${totalPeriods}} ≈ ${finalAmount} руб.`;
            break;
            
        case 'credit':
            const months = years * 12;
            const monthlyRate = rate / 12 / 100;
            const annuityPayment = Math.round(amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1));
            
            question = `Кредит в ${amount.toLocaleString('ru-RU')} рублей выдан под ${rate}% годовых на ${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} с аннуитетными платежами. Найдите ежемесячный платеж.`;
            correct = annuityPayment.toString();
            solution = `Месячная ставка: ${rate}%/12 = ${(rate/12).toFixed(2)}%. Количество месяцев: ${months}. Платёж = (${amount}×${monthlyRate.toFixed(4)}×(1+${monthlyRate.toFixed(4)})^{${months}})/((1+${monthlyRate.toFixed(4)})^{${months}}-1) ≈ ${annuityPayment} руб.`;
            break;
            
        case 'discount':
            const futureAmount = Math.round((amount * (1 + 0.1 * Math.random())) / 1000) * 1000;
            const discountRate = 5 + Math.floor(Math.random() * 11);
            const presentValue = Math.round(futureAmount / Math.pow(1 + discountRate/100, years));
            
            question = `Какую сумму нужно положить в банк под ${discountRate}% годовых с ежегодной капитализацией, чтобы через ${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} получить ${futureAmount.toLocaleString('ru-RU')} рублей?`;
            correct = presentValue.toString();
            solution = `Используем формулу дисконтирования: P = S / (1 + r)^n = ${futureAmount} / (1 + ${discountRate/100})^{${years}} ≈ ${presentValue} руб.`;
            break;
    }
    
    currentEgeTask = {
        correct: correct,
        question: question,
        solution: solution
    };
    
    document.getElementById('ege-question').textContent = currentEgeTask.question;
    document.getElementById('ege-answer').value = '';
    document.getElementById('ege-result').classList.add('hidden');
    document.getElementById('ege-answer').disabled = false;
    document.getElementById('ege-alert').classList.add('hidden');
    answeredEge = false;
}

function generateAdvancedEgeTask() {
    const taskTypes = ['two-payments', 'equal-reduction', 'varying-payments', 'deposit-additions'];
    const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    
    let question, correct, solution;
    const amount = Math.round((1000000 + Math.random() * 9000000) / 100000) * 100000;
    const years = 2 + Math.floor(Math.random() * 4);
    const rate = 10 + Math.floor(Math.random() * 21);
    
    switch(type) {
        case 'two-payments':
            const totalAmount = amount * Math.pow(1 + rate/100, 2);
            const payment = Math.round(totalAmount / (1 + (1 + rate/100)));
            
            question = `31 декабря 2024 года заемщик взял в банке ${(amount/1000000).toLocaleString('ru-RU')} млн рублей в кредит под ${rate}% годовых. Схема выплаты кредита следующая — 31 декабря каждого следующего года банк начисляет проценты на оставшуюся сумму долга, затем заемщик переводит в банк X рублей. Какой должна быть сумма X, чтобы заемщик выплатил долг двумя равными платежами?`;
            correct = payment.toString();
            solution = `После первого года долг составит: ${amount} × 1.${rate} = ${Math.round(amount * (1 + rate/100))}. После выплаты X руб. останется: ${Math.round(amount * (1 + rate/100))} - X. На второй год остаток увеличивается на ${rate}%: (${Math.round(amount * (1 + rate/100))} - X) × 1.${rate}. После второй выплаты X руб. долг должен быть погашен: (${Math.round(amount * (1 + rate/100))} - X) × 1.${rate} - X = 0. Решая уравнение, получаем X = ${payment} руб.`;
            break;
            
        case 'equal-reduction':
            const months = years * 12;
            const totalPayment = Math.round(amount * (1 + 0.3 + 0.1 * Math.random()));
            const r = Math.round((totalPayment/amount - 1) * 10 * 100) / 100;
            
            question = `15 января планируется взять кредит в банке на ${months} месяцев. Условия его возврата таковы: 1-го числа каждого месяца долг возрастает на r% по сравнению с концом предыдущего месяца; со 2-го по 14-е число каждого месяца необходимо выплатить часть долга; 15-го числа каждого месяца долг должен быть на одну и ту же сумму меньше долга на 15-е число предыдущего месяца. Известно, что общая сумма выплат после полного погашения кредита на ${Math.round((totalPayment/amount - 1)*100)}% больше суммы, взятой в кредит. Найдите r.`;
            correct = r.toString();
            solution = `Пусть сумма кредита S. По условию, долг уменьшается равномерно: каждый месяц на S/${months}. Проценты: (S + (S - S/${months}) + (S - 2S/${months}) + ... + S/${months}) × r/100 = S × (1 + ${months-1}/${months} + ${months-2}/${months} + ... + 1/${months}) × r/100 = S × (${months+1}/2) × r/100 = ${(months+1)/200}S × r. Итого выплаты: S + ${(months+1)/200}S × r = ${totalPayment/amount}S ⇒ ${(months+1)/200} × r = ${totalPayment/amount - 1} ⇒ r = ${r}.`;
            break;
            
        case 'varying-payments':
            const annualPayment = Math.round(amount / years);
            const totalInterest = annualPayment * rate/100 * (years + 1) / 2;
            const totalPaymentVar = amount + totalInterest;
            
            question = `В июле планируется взять кредит на сумму ${(amount/1000000).toLocaleString('ru-RU')} млн рублей на ${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}. Условия возврата: каждый январь долг возрастает на ${rate}% по сравнению с концом предыдущего года; с февраля по июнь каждого года необходимо выплатить часть долга; в июле каждого года долг должен быть на одну и ту же сумму меньше долга на июль предыдущего года. Сколько рублей составит общая сумма выплат?`;
            correct = Math.round(totalPaymentVar).toString();
            solution = `Ежегодное уменьшение долга: ${amount} / ${years} = ${annualPayment} руб. Проценты: (${amount} + ${amount - annualPayment} + ${amount - 2*annualPayment} + ... + ${annualPayment}) × ${rate/100} = ${amount} × ${(years + 1)/2} × ${rate/100} = ${totalInterest} руб. Общая сумма выплат: ${amount} + ${totalInterest} = ${Math.round(totalPaymentVar)} руб.`;
            break;
            
        case 'deposit-additions':
            const additions = Math.round((100000 + Math.random() * 400000) / 10000) * 10000;
            const finalAmount = Math.round(amount * Math.pow(1 + rate/100, 5) + additions * (Math.pow(1 + rate/100, 4) + Math.pow(1 + rate/100, 3) + Math.pow(1 + rate/100, 2) + (1 + rate/100)));
            
            question = `В банк помещена сумма ${(amount/1000000).toLocaleString('ru-RU')} млн рублей под ${rate}% годовых. В конце каждого из первых четырех лет хранения после начисления процентов вкладчик дополнительно вносил на счет ${additions.toLocaleString('ru-RU')} рублей. Какая сумма будет на счету к концу пятого года?`;
            correct = finalAmount.toString();
            solution = `Через 5 лет основная сумма составит: ${amount} × 1.${rate}^5 ≈ ${Math.round(amount * Math.pow(1 + rate/100, 5))} руб. Добавки с процентами: ${additions} × (1.${rate}^4 + 1.${rate}^3 + 1.${rate}^2 + 1.${rate}) ≈ ${Math.round(additions * (Math.pow(1 + rate/100, 4) + Math.pow(1 + rate/100, 3) + Math.pow(1 + rate/100, 2) + (1 + rate/100)))} руб. Итого: ${Math.round(amount * Math.pow(1 + rate/100, 5))} + ${Math.round(additions * (Math.pow(1 + rate/100, 4) + Math.pow(1 + rate/100, 3) + Math.pow(1 + rate/100, 2) + (1 + rate/100)))} ≈ ${finalAmount} руб.`;
            break;
    }
    
    currentEgeTask = {
        correct: correct,
        question: question,
        solution: solution
    };
    
    document.getElementById('ege-question').textContent = currentEgeTask.question;
    document.getElementById('ege-answer').value = '';
    document.getElementById('ege-result').classList.add('hidden');
    document.getElementById('ege-answer').disabled = false;
    document.getElementById('ege-alert').classList.add('hidden');
    answeredEge = false;
}

function checkEgeAnswer() {
    const alertDiv = document.getElementById('ege-alert');
    const answerInput = document.getElementById('ege-answer');
    const resultDiv = document.getElementById('ege-result');
    
    if (answeredEge) {
        resultDiv.innerHTML = `
            <div class="flex items-start">
                <div class="mr-2">⚠️</div>
                <div>Вы уже ответили! Нажмите 'Новая задача'.</div>
            </div>
        `;
        resultDiv.className = 'result-container bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value.trim();
    
    if (userInput === '') {
        alertDiv.textContent = 'Пожалуйста, введите ответ';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredEge = true;
    totalTasks++;
    egeTasksCompleted++;
    
    const isCorrect = userInput === currentEgeTask.correct;
    const pointsEarned = currentLevel === 'basic' ? 1 : 2;
    
    if (isCorrect) {
        egeTotalScore += pointsEarned;
        resultDiv.innerHTML = `
            <div class="flex items-start text-sm">
                <div class="mr-2 mt-1">✅</div>
                <div>
                    <p class="font-bold text-green-400">Правильно! +${pointsEarned} балл${pointsEarned > 1 ? 'а' : ''}</p>
                    <p class="mt-1">Ответ: <span class="font-mono">${currentEgeTask.correct}</span></p>
                    <details class="mt-1 text-gray-300">
                        <summary class="cursor-pointer hover:text-white">Показать решение</summary>
                        <div class="mt-1 bg-gray-900/50 p-2 rounded">${currentEgeTask.solution}</div>
                    </details>
                </div>
            </div>
        `;
        resultDiv.className = 'result-container bg-green-900/10 neon-border';
    } else {
        resultDiv.innerHTML = `
            <div class="flex items-start text-sm">
                <div class="mr-2 mt-1">❌</div>
                <div>
                    <p class="font-bold text-red-400">Неправильно</p>
                    <p class="mt-1">Правильный ответ: <span class="font-mono">${currentEgeTask.correct}</span></p>
                    <details class="mt-1 text-gray-300" open>
                        <summary class="cursor-pointer hover:text-white">Решение</summary>
                        <div class="mt-1 bg-gray-900/50 p-2 rounded">${currentEgeTask.solution}</div>
                    </details>
                </div>
            </div>
        `;
        resultDiv.className = 'result-container bg-red-900/10 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;

    // Обновление счетчиков
    document.getElementById('ege-score').textContent = egeTotalScore;
    document.getElementById('ege-tasks').textContent = `${egeTasksCompleted}/10`;
    
    // Сохраняем ответ в Supabase
    saveResponseToSupabase(
        'ege',
        userInput,
        isCorrect,
        currentEgeTask.correct,
        currentEgeTask.question
    );
    
    // Проверка завершения 10 задач
    if (egeTasksCompleted >= 10) {
        const maxPossible = currentLevel === 'basic' ? 10 : 20;
        resultDiv.innerHTML += `<br><br><strong>Тест завершен!</strong> Вы набрали ${egeTotalScore} баллов из ${maxPossible} возможных.`;
        document.getElementById('ege-answer').disabled = true;
        document.getElementById('ege-new-task-btn').disabled = true;
    }
    
    updateProgress();
}

// ================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==================

function formatNumber(num) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
}

function getYearWord(years) {
    const lastDigit = years % 10;
    const lastTwoDigits = years % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'лет';
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
}
<script>
  function openAuth() {
    alert('Переход к авторизации');
    // Здесь можно открыть модальное окно или перейти на страницу входа
  }

  function openStats() {
    alert('Просмотр статистики');
    // Здесь можно показать данные пользователя из Supabase
  }

  function openTop() {
    alert('Таблица лидеров');
    // Здесь можно загрузить и отобразить топ пользователей
  }
</script>
// Функция для сохранения ответа в Supabase
async function saveResponseToSupabase(taskType, userAnswer, isCorrect, correctAnswer, questionText) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.warn('Пользователь не авторизован. Ответ не сохранён.');
      return;
    }

    const userId = user.id;

    // Сохраняем ответ в Supabase
    const { data, error } = await supabase
      .from('user_responses')
      .insert([{
        user_id: userId,
        block: taskType,
        question_text: questionText,
        user_answer: userAnswer.toString(),
        correct_answer: correctAnswer.toString(),
        is_correct: isCorrect,
        response_time: new Date().toISOString()
      }]);

    if (error) {
      console.error('Ошибка при сохранении ответа:', error.message);
    } else {
      console.log('Ответ успешно сохранён');
    }
  } catch (err) {
    console.error('Неожиданная ошибка:', err.message);
  }
}
// сохранение прогресса
async function updateProgress(correctAnswers, totalTasks) {
  const progressPercent = Math.round((correctAnswers / totalTasks) * 100);

  document.getElementById('progress-bar').style.width = `${progressPercent}%`;
  document.getElementById('total-score').textContent = `${progressPercent}%`;

  // Сохраняем в Supabase
  const { error } = await supabase.from('user_progress').upsert({
    user_id: authData.userId,
    progress: progressPercent,
    correct_answers: correctAnswers,
    total_answers: totalTasks,
    last_updated: new Date().toISOString()
  });

  if (error) console.error('Не удалось обновить прогресс:', error.message);
}

const form = document.getElementById('depositForm');
if (form) {
  form.addEventListener('submit', checkDepositAnswer);
}
async function saveResponseToSupabase(taskType, userAnswer, isCorrect, correctAnswer, questionText) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return;

    const userId = user.id;

    const responseData = {
      block: taskType,
      user_answer: userAnswer.toString(),
      is_correct: isCorrect,
      correct_answer: correctAnswer.toString(),
      question_text: questionText,
      level: currentLevel,
      response_time: new Date().toISOString(),
      user_id: userId // Сохраняем ID пользователя
    };

    const { error } = await supabase.from('user_responses').insert([responseData]);

    if (error) throw error;

    console.log('Ответ успешно сохранён с user_id:', userId);
  } catch (err) {
    console.error('Ошибка сохранения в Supabase:', err.message);
  }
}

async function showLeaderboard() {
  const { data, error } = await supabase
    .from('user_progress')
    .select('user_id, progress, created_at')
    .order('progress', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Ошибка загрузки таблицы лидеров:', error.message);
    alert('Не удалось загрузить таблицу лидеров');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="neon-card neon-border rounded-2xl overflow-hidden w-full max-w-4xl">
      <div class="p-6 border-b border-white/10">
        <h2 class="text-2xl font-bold">🏆 Таблица лидеров</h2>
        <button onclick="this.closest('div').remove()" class="absolute top-4 right-4 text-white/70 hover:text-white">
          ✕
        </button>
      </div>
      <div class="p-6">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-white/20">
              <th class="py-3 pr-6">ID</th>
              <th class="py-3 pr-6">Прогресс (%)</th>
              <th class="py-3">Дата обновления</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr class="border-b border-white/10">
                <td class="py-3 pr-6">${item.user_id}</td>
                <td class="py-3 pr-6">${item.progress}%</td>
                <td class="py-3">${new Date(item.last_updated).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}
