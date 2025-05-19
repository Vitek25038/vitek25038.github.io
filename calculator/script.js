let screen = document.getElementById('screen');

function inputValue(value) {
  if (screen.textContent === '0' || screen.textContent === 'Деление на 0!') {
    screen.textContent = value;
  } else {
    screen.textContent += value;
  }
}

function clearScreen() {
  screen.textContent = '0';
}

function deleteLast() {
  let current = screen.textContent;
  screen.textContent = current.length > 1 ? current.slice(0, -1) : '0';
}

function calculate() {
  try {
    let result = eval(screen.textContent);
    if (result === Infinity || result === -Infinity) {
      screen.textContent = 'Деление на 0!';
    } else {
      screen.textContent = +parseFloat(result.toFixed(6));
    }
  } catch {
    screen.textContent = 'Ошибка';
  }
}

function toggleTheme() {
  const body = document.body;
  const btn = document.querySelector('.theme-toggle');
  body.classList.toggle('light');
  btn.textContent = body.classList.contains('light') ? '☀️' : '🌙';
}
