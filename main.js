// ✍️ Эффект печатающегося текста
const text = "HTML / CSS-верстальщик";
const typingElement = document.getElementById("typing-text");
let index = 0;

function type() {
  if (index < text.length) {
    typingElement.textContent += text.charAt(index);
    index++;
    setTimeout(type, 100);
  }
}
if (typingElement) {
  window.addEventListener("DOMContentLoaded", type);
}

// 🖼 Предпросмотр проекта при наведении
const previewBox = document.createElement('div');
previewBox.className = 'project-preview';
document.body.appendChild(previewBox);

document.querySelectorAll('.project-link').forEach(link => {
  link.addEventListener('mouseenter', () => {
    const title = link.dataset.title;
    const desc = link.dataset.desc;
    const img = link.dataset.img;

    previewBox.innerHTML = `
      <img src="${img}" alt="${title}">
      <h4>${title}</h4>
      <p>${desc}</p>
    `;
    previewBox.style.display = 'block';
    previewBox.style.opacity = '1';
  });

  link.addEventListener('mousemove', e => {
    previewBox.style.left = e.pageX + 20 + 'px';
    previewBox.style.top = e.pageY + 20 + 'px';
  });

  link.addEventListener('mouseleave', () => {
    previewBox.style.opacity = '0';
    previewBox.style.display = 'none';
  });
});

// 🔼 Кнопка "Наверх"
const scrollBtn = document.querySelector('.scroll-to-top');
window.addEventListener('scroll', () => {
  scrollBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

// 🌀 Появление секций при прокрутке
const sections = document.querySelectorAll('.section');
function showSections() {
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      section.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', showSections);
window.addEventListener('DOMContentLoaded', showSections);
