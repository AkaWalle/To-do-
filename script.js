// Modo Noturno
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Mostrar Módulos
function showModule(moduleId) {
    document.querySelectorAll('.module').forEach(module => module.style.display = 'none');
    document.getElementById(moduleId).style.display = 'block';
}

// Alternar Visibilidade do Calendário
function toggleCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.style.display = calendar.style.display === 'none' ? 'block' : 'none';
    if (calendar.style.display === 'block') {
        renderCalendar();
        checkReminders();
    }
}

// Calendário
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDay = null;

function renderCalendar() {
    const monthYear = document.getElementById('month-year');
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = ''; // Limpar a grade

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    monthYear.textContent = `${months[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];

    // Preencher dias vazios antes do início do mês
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day';
        calendarDays.appendChild(emptyDay);
    }

    // Preencher os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';

        // Adicionar o número do dia
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // Verificar se é o dia atual
        if (day === todayDate && currentMonth === todayMonth && currentYear === todayYear) {
            dayElement.classList.add('today');
        }

        // Verificar se há eventos neste dia
        const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayReminders = reminders.filter(reminder => reminder.date === dateStr);
        if (dayReminders.length > 0) {
            const category = dayReminders[0].category; // Usa a categoria do primeiro evento
            dayElement.classList.add(`event-${category}`);

            // Exibir o primeiro evento diretamente no dia
            const eventText = document.createElement('span');
            eventText.className = 'event-text';
            eventText.textContent = dayReminders[0].text;
            dayElement.appendChild(eventText);
        }

        // Adicionar evento de clique para exibir os eventos do dia
        dayElement.addEventListener('click', () => {
            selectedDay = dateStr;
            displayEventsForDay(dateStr);
        });

        calendarDays.appendChild(dayElement);
    }

    // Exibir eventos do dia selecionado (se houver)
    if (selectedDay) {
        displayEventsForDay(selectedDay);
    }
}

function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
    checkReminders();
}

// Exibir Eventos do Dia Selecionado
function displayEventsForDay(dateStr) {
    const eventsList = document.getElementById('selected-day-events');
    eventsList.innerHTML = '';
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    const dayReminders = reminders.filter(reminder => reminder.date === dateStr);

    if (dayReminders.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum evento para este dia.';
        eventsList.appendChild(li);
    } else {
        dayReminders.forEach((reminder, index) => {
            const li = document.createElement('li');
            li.textContent = `${reminder.text} (${reminder.category})`;
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.onclick = () => openEditReminderForm(reminder, index);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Remover';
            deleteButton.onclick = () => deleteReminder(index);
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            eventsList.appendChild(li);
        });
    }
}

// Formulário de Lembrete
function openReminderForm() {
    document.getElementById('reminder-form').style.display = 'flex';
}

function closeReminderForm() {
    document.getElementById('reminder-form').style.display = 'none';
}

// Adicionar Lembrete
function addReminder() {
    const dateInput = document.getElementById('reminder-date').value;
    const textInput = document.getElementById('reminder-text').value.trim();
    const categoryInput = document.getElementById('reminder-category').value;
    if (dateInput && textInput) {
        const reminder = { date: dateInput, text: textInput, category: categoryInput };
        const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        reminders.push(reminder);
        localStorage.setItem('reminders', JSON.stringify(reminders));
        closeReminderForm();
        renderCalendar();
        checkReminders();
    }
}

// Editar Lembrete
let editingIndex = null;

function openEditReminderForm(reminder, index) {
    editingIndex = index;
    document.getElementById('edit-reminder-date').value = reminder.date;
    document.getElementById('edit-reminder-text').value = reminder.text;
    document.getElementById('edit-reminder-category').value = reminder.category;
    document.getElementById('edit-reminder-form').style.display = 'flex';
}

function closeEditReminderForm() {
    document.getElementById('edit-reminder-form').style.display = 'none';
    editingIndex = null;
}

function updateReminder() {
    const dateInput = document.getElementById('edit-reminder-date').value;
    const textInput = document.getElementById('edit-reminder-text').value.trim();
    const categoryInput = document.getElementById('edit-reminder-category').value;
    if (dateInput && textInput && editingIndex !== null) {
        const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        reminders[editingIndex] = { date: dateInput, text: textInput, category: categoryInput };
        localStorage.setItem('reminders', JSON.stringify(reminders));
        closeEditReminderForm();
        renderCalendar();
        checkReminders();
    }
}

// Remover Lembrete
function deleteReminder(index) {
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders.splice(index, 1);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    renderCalendar();
    checkReminders();
}

// Verificar Lembretes e Exibir Notificações Visuais
function checkReminders() {
    const today = new Date().toISOString().split('T')[0];
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    const notifications = document.getElementById('notifications');
    notifications.innerHTML = '';

    reminders.forEach((reminder, index) => {
        if (reminder.date === today) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = `Lembrete de hoje: ${reminder.text} (${reminder.category})`;
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.onclick = () => notification.remove();
            notification.appendChild(closeButton);
            notifications.appendChild(notification);
        }
    });
}

// Timer para Desafios de Programação
let timer;
let timeLeft;

function startTimer(seconds) {
    clearInterval(timer);
    timeLeft = seconds;
    updateTimerDisplay();
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timer);
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = 'Tempo esgotado!';
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.onclick = () => notification.remove();
            notification.appendChild(closeButton);
            document.getElementById('notifications').appendChild(notification);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = 0;
    updateTimerDisplay();
}

// Adicionar Tarefas às Listas de Prioridades
function addTask(listId) {
    const input = document.getElementById(`${listId}-task`);
    const taskText = input.value.trim();
    if (taskText) {
        const li = document.createElement('li');
        li.textContent = taskText;
        document.getElementById(`${listId}-list`).appendChild(li);
        input.value = ''; // Limpar o campo de entrada
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    checkReminders();
});