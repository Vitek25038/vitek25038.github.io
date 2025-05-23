function inputValue(val) {
    const screen = document.getElementById("screen");
    if (screen.innerText === "0") {
        screen.innerText = val;
    } else {
        screen.innerText += val;
    }
}

function clearScreen() {
    document.getElementById("screen").innerText = "0";
    document.getElementById("history").innerHTML = ""; // очистка истории
}

function deleteLast() {
    const screen = document.getElementById("screen");
    screen.innerText = screen.innerText.slice(0, -1) || "0";
}

function calculate() {
    const screen = document.getElementById("screen");
    const history = document.getElementById("history");

    let expression = normalize(screen.innerText);

    try {
        const result = eval(expression);
        screen.innerText = result;

        const item = document.createElement("p");
        item.textContent = `${expression} = ${result}`;
        history.prepend(item);
    } catch {
        screen.innerText = "Ошибка";
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark");
}

// 🔹 Доп. функции
function insertPi() {
    inputValue(Math.PI.toFixed(8));
}

function insertSqrt() {
    const screen = document.getElementById("screen");
    try {
        const value = eval(normalize(screen.innerText));
        screen.innerText = Math.sqrt(value).toFixed(8);
    } catch {
        screen.innerText = "Ошибка";
    }
}

function insertPercent() {
    const screen = document.getElementById("screen");
    try {
        const value = eval(normalize(screen.innerText));
        screen.innerText = (value / 100).toFixed(8);
    } catch {
        screen.innerText = "Ошибка";
    }
}

function insertRand() {
    inputValue(Math.random().toFixed(8));
}

// 🔹 Заменяем визуальные символы на валидные операторы
function normalize(expr) {
    return expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');
}

function toggleTheme() {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
}

function applySavedTheme() {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
        document.body.classList.add("light");
    }
}
applySavedTheme();

// Анимация нажатия кнопок
const allButtons = document.querySelectorAll(".btn");
allButtons.forEach(btn => {
    btn.addEventListener("mousedown", () => {
        btn.style.transform = "scale(0.95)";
    });
    btn.addEventListener("mouseup", () => {
        btn.style.transform = "scale(1)";
    });
});
