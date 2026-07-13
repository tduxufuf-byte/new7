const steps = [
  {
    question: "С какой сложностью вы столкнулись?",
    answers: [
      ["gauge", "Плохая кредитная история"],
      ["calendar", "Есть просрочки или долги"],
      ["bank", "Банки уже отказывали"],
      ["coins", "Нужна крупная сумма"],
      ["refresh", "Хочу рефинансирование"]
    ]
  },
  {
    question: "На какую сумму вы рассчитываете?",
    answers: [
      ["coins", "До 300 000 ₽"],
      ["coins", "300 000–800 000 ₽"],
      ["wallet", "800 000–1,5 млн ₽"],
      ["briefcase", "Свыше 1,5 млн ₽"]
    ]
  },
  {
    question: "Есть ли у вас текущие задолженности?",
    answers: [
      ["calendar", "Да, есть просрочки"],
      ["check", "Да, но без просрочек"],
      ["document", "Нет задолженностей"],
      ["question", "Сложно ответить"]
    ]
  },
  {
    question: "Какой у вас источник дохода?",
    answers: [
      ["briefcase", "Официальная работа"],
      ["person", "Самозанятость / ИП"],
      ["wallet", "Неофициальный доход"],
      ["document", "Пенсия"],
      ["question", "Другое"]
    ]
  },
  {
    question: "Как удобно получить консультацию?",
    answers: [
      ["phone", "Телефонный звонок"],
      ["telegram", "Telegram"],
      ["whatsapp", "WhatsApp"],
      ["max", "MAX"]
    ]
  }
];

const state = {
  step: 0,
  answers: []
};

const stepLabel = document.querySelector("#step-label");
const question = document.querySelector("#quiz-question");
const progress = document.querySelector("#progress");
const answers = document.querySelector("#answers");
const backButton = document.querySelector("#back-button");
const quizView = document.querySelector("#quiz-view");
const leadFormView = document.querySelector("#lead-form-view");
const successView = document.querySelector("#success-view");
const leadForm = document.querySelector("#lead-form");
const restartButton = document.querySelector("#restart-button");
const quizStage = document.querySelector("#quiz-stage");
const quizSelection = document.querySelector("#quiz-selection");
const contactLabel = document.querySelector("#contact-label");
const contactInput = document.querySelector("#contact-input");
const telegramHelp = document.querySelector("#telegram-help");
const telegramHelpToggle = document.querySelector("#telegram-help-toggle");
const telegramHelpContent = document.querySelector("#telegram-help-content");
const menuButton = document.querySelector("#menu-button");
const nav = document.querySelector("#site-nav");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function iconSrc(icon) {
  return icon === "max" ? "assets/max.svg" : `assets/${icon}.webp`;
}

function preloadQuizIcons() {
  const icons = [...new Set(steps.flatMap(step => step.answers.map(([icon]) => icon)))];
  icons.forEach(icon => {
    const image = new Image();
    image.decoding = "async";
    image.src = iconSrc(icon);
  });
}

function configureContactField(method) {
  telegramHelp.hidden = method !== "Telegram";
  telegramHelpContent.hidden = true;
  telegramHelpToggle.setAttribute("aria-expanded", "false");

  if (method === "Telegram") {
    contactLabel.textContent = "Telegram username";
    contactInput.placeholder = "@username";
    contactInput.autocomplete = "off";
    contactInput.inputMode = "text";
    contactInput.pattern = "@?[A-Za-z0-9_]{5,32}";
    contactInput.title = "Укажите username Telegram, например @username";
  } else if (method === "WhatsApp") {
    contactLabel.textContent = "Номер WhatsApp";
    contactInput.placeholder = "+7 900 000-00-00";
    contactInput.autocomplete = "tel";
    contactInput.inputMode = "tel";
    contactInput.removeAttribute("pattern");
    contactInput.removeAttribute("title");
  } else if (method === "MAX") {
    contactLabel.textContent = "Номер телефона в MAX";
    contactInput.placeholder = "+7 900 000-00-00";
    contactInput.autocomplete = "tel";
    contactInput.inputMode = "tel";
    contactInput.removeAttribute("pattern");
    contactInput.removeAttribute("title");
  } else {
    contactLabel.textContent = "Телефон";
    contactInput.placeholder = "+7 900 000-00-00";
    contactInput.autocomplete = "tel";
    contactInput.inputMode = "tel";
    contactInput.removeAttribute("pattern");
    contactInput.removeAttribute("title");
  }
}

function animateStage(direction = "forward") {
  if (prefersReducedMotion) {
    return Promise.resolve();
  }

  const outClass = direction === "back" ? "is-leaving-back" : "is-leaving";
  const inClass = direction === "back" ? "is-entering-back" : "is-entering";

  quizStage.classList.remove("is-leaving", "is-leaving-back", "is-entering", "is-entering-back");
  quizStage.classList.add(outClass);

  return new Promise(resolve => {
    window.setTimeout(() => {
      quizStage.classList.remove(outClass);
      quizStage.classList.add(inClass);

      window.setTimeout(() => {
        quizStage.classList.remove(inClass);
        resolve();
      }, 220);
    }, 180);
  });
}

function showSelection(label) {
  quizSelection.textContent = `Выбрано: ${label}`;
  quizSelection.classList.remove("is-visible");
  requestAnimationFrame(() => {
    quizSelection.classList.add("is-visible");
  });
}

function renderStep() {
  const current = steps[state.step];

  quizSelection.classList.remove("is-visible");
  quizSelection.textContent = "";

  stepLabel.textContent = `Шаг ${state.step + 1} из ${steps.length}`;
  question.textContent = current.question;
  backButton.hidden = state.step === 0;

  progress.innerHTML = steps
    .map((_, index) => `<span class="${index <= state.step ? "is-active" : ""}"></span>`)
    .join("");

  answers.innerHTML = "";

  current.answers.forEach(([icon, label]) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.innerHTML = `
      <img src="${iconSrc(icon)}" width="96" height="96" alt="">
      <span class="answer__label">${label}</span>
      <span class="answer__arrow" aria-hidden="true">›</span>
    `;

    button.addEventListener("click", async () => {
      if (button.disabled) return;

      answers.querySelectorAll(".answer").forEach(item => {
        item.disabled = true;
        item.classList.toggle("is-selected", item === button);
      });

      state.answers[state.step] = label;
      showSelection(label);

      await new Promise(resolve => window.setTimeout(resolve, prefersReducedMotion ? 0 : 240));

      if (state.step < steps.length - 1) {
        await animateStage("forward");
        state.step += 1;
        renderStep();
      } else {
        configureContactField(label);
        if (!prefersReducedMotion) {
          quizView.classList.add("is-fading-out");
        }

        window.setTimeout(() => {
          quizView.hidden = true;
          quizView.classList.remove("is-fading-out");
          leadFormView.hidden = false;
          if (!prefersReducedMotion) {
            leadFormView.classList.add("is-fading-in");
            requestAnimationFrame(() => {
              requestAnimationFrame(() => leadFormView.classList.remove("is-fading-in"));
            });
          }
          leadFormView.querySelector("input").focus({ preventScroll: true });
        }, prefersReducedMotion ? 0 : 220);
      }
    });

    answers.appendChild(button);
  });
}

function showSuccess() {
  leadFormView.hidden = true;
  successView.hidden = false;
  if (!prefersReducedMotion) {
    successView.classList.add("is-fading-in");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => successView.classList.remove("is-fading-in"));
    });
  }
}

function setupRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add("is-visible"));
    document.querySelectorAll(".process-item").forEach(item => item.style.setProperty("--delay", "0ms"));
    return;
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(element => revealObserver.observe(element));
  document.querySelectorAll(".process-item").forEach((item, index) => {
    item.style.setProperty("--delay", `${index * 90}ms`);
  });
}

backButton.addEventListener("click", async () => {
  if (state.step > 0) {
    await animateStage("back");
    state.step -= 1;
    renderStep();
  }
});

leadForm.addEventListener("submit", event => {
  event.preventDefault();

  const formData = new FormData(leadForm);
  const payload = {
    name: formData.get("name"),
    contact: formData.get("contact"),
    contactMethod: state.answers[4] || "",
    answers: state.answers,
    createdAt: new Date().toISOString()
  };

  try {
    localStorage.setItem("redibrokerLead", JSON.stringify(payload));
  } catch (error) {
    console.warn("Не удалось сохранить данные в localStorage:", error);
  }

  showSuccess();
});

restartButton.addEventListener("click", () => {
  state.step = 0;
  state.answers = [];
  leadForm.reset();
  telegramHelp.hidden = true;
  telegramHelpContent.hidden = true;
  telegramHelpToggle.setAttribute("aria-expanded", "false");
  successView.hidden = true;
  leadFormView.hidden = true;
  quizView.hidden = false;
  renderStep();
});

telegramHelpToggle.addEventListener("click", () => {
  const expanded = telegramHelpToggle.getAttribute("aria-expanded") === "true";
  telegramHelpToggle.setAttribute("aria-expanded", String(!expanded));
  telegramHelpContent.hidden = expanded;
});

document.querySelectorAll("[data-scroll-quiz]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector("#quiz").scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center"
    });
  });
});

menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(open));
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

preloadQuizIcons();
setupRevealAnimations();
renderStep();
