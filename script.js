const servicePrices = {
  "Маникюр": 2100,
  "Стрижка": 2800,
  "Окрашивание": 6900,
  "Макияж": 3200,
  "Укладка": 2500,
  "Брови и ресницы": 1800,
};

const state = {
  services: ["Маникюр"],
  master: "Анна Морозова",
  slot: "10:00",
};

const dateInput = document.querySelector("#date-input");
const modal = document.querySelector("#success-modal");
const modalTitle = document.querySelector("#modal-title");
const modalText = document.querySelector("#modal-text");
const sumService = document.querySelector("#sum-service");
const sumMaster = document.querySelector("#sum-master");
const sumDate = document.querySelector("#sum-date");
const sumTime = document.querySelector("#sum-time");
const sumPrice = document.querySelector("#sum-price");

const formatPrice = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "выбранная дата";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${dateValue}T12:00:00`));
};

const setDefaultDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const value = tomorrow.toISOString().slice(0, 10);
  dateInput.min = new Date().toISOString().slice(0, 10);
  dateInput.value = value;
};

const getTotal = () =>
  state.services.reduce((sum, service) => sum + (servicePrices[service] || 0), 0);

const syncActiveCards = () => {
  const selected = new Set(state.services);

  document.querySelectorAll("[data-service-card]").forEach((card) => {
    card.classList.toggle("active", selected.has(card.dataset.service));
  });

  document.querySelectorAll("[data-pick-service]").forEach((button) => {
    const isActive = selected.has(button.dataset.pickService);
    button.textContent = isActive ? "Выбрано" : "Выбрать";
  });

  document.querySelectorAll("[data-master-card]").forEach((card) => {
    card.classList.toggle("active", card.dataset.master === state.master);
  });
};

const syncChips = () => {
  const selected = new Set(state.services);

  document.querySelectorAll("[data-service-chip]").forEach((chip) => {
    chip.classList.toggle("active", selected.has(chip.dataset.serviceChip));
  });

  document.querySelectorAll("[data-master-chip]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.masterChip === state.master);
  });
};

const updateSummary = () => {
  sumService.textContent = state.services.length ? state.services.join(", ") : "—";
  sumMaster.textContent = state.master || "—";
  sumDate.textContent = dateInput.value ? formatDate(dateInput.value) : "—";
  sumTime.textContent = state.slot || "—";
  sumPrice.textContent = state.services.length ? formatPrice(getTotal()) : "—";
};

const syncUI = () => {
  syncActiveCards();
  syncChips();
  updateSummary();
};

const toggleService = (service) => {
  const isSelected = state.services.includes(service);

  if (isSelected && state.services.length === 1) {
    return;
  }

  state.services = isSelected
    ? state.services.filter((item) => item !== service)
    : [...state.services, service];
  syncUI();
};

const setSingleService = (service) => {
  state.services = [service];
  syncUI();
};

const setMaster = (master) => {
  state.master = master;
  syncUI();
};

const setSlot = (slot) => {
  state.slot = slot;
  document.querySelectorAll(".slot:not(.booked)").forEach((button) => {
    button.classList.toggle("active", button.dataset.slot === slot);
  });
  updateSummary();
};

const openModal = (message, title = "Запись успешно создана!") => {
  modalTitle.textContent = title;
  modalText.textContent = message;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
};

document.querySelectorAll("[data-pick-service]").forEach((button) => {
  button.addEventListener("click", () => {
    setSingleService(button.dataset.pickService);
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll("[data-service-chip]").forEach((chip) => {
  chip.addEventListener("click", () => toggleService(chip.dataset.serviceChip));
});

document.querySelectorAll("[data-pick-master]").forEach((button) => {
  button.addEventListener("click", () => {
    setMaster(button.dataset.pickMaster);
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll("[data-master-chip]").forEach((chip) => {
  chip.addEventListener("click", () => setMaster(chip.dataset.masterChip));
});

document.querySelectorAll(".slot:not(.booked)").forEach((button) => {
  button.addEventListener("click", () => setSlot(button.dataset.slot));
});

dateInput.addEventListener("change", updateSummary);

document.querySelector("#booking-form").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!state.services.length) {
    openModal("Выберите хотя бы одну услугу, чтобы продолжить.", "Проверьте запись");
    return;
  }

  if (!state.master || !state.slot || !dateInput.value) {
    openModal("Заполните мастера, дату и время перед подтверждением.", "Проверьте запись");
    return;
  }

  openModal(
    `${state.services.join(", ")} у мастера ${state.master}: ${formatDate(dateInput.value)}, ${state.slot}. Итоговая стоимость: ${formatPrice(getTotal())}.`
  );
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

document.querySelectorAll("[data-repeat]").forEach((button) => {
  button.addEventListener("click", () => {
    setSingleService(button.dataset.service);
    setMaster(button.dataset.master);
    setSlot(button.dataset.slot);
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
    openModal("Данные прошлой записи перенесены в форму. Проверьте дату и подтвердите новое время.", "Запись подготовлена");
  });
});

setDefaultDate();
syncUI();
