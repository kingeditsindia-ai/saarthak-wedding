const ceremony = new Date("2027-03-13T17:30:00+05:30");

const countEls = {
  days: document.querySelector("#count-days"),
  hours: document.querySelector("#count-hours"),
  mins: document.querySelector("#count-mins"),
  secs: document.querySelector("#count-secs"),
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function tick() {
  const diff = ceremony.getTime() - Date.now();
  if (diff <= 0) {
    countEls.days.textContent = "0";
    countEls.hours.textContent = "00";
    countEls.mins.textContent = "00";
    countEls.secs.textContent = "00";
    return;
  }
  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  countEls.days.textContent = String(days);
  countEls.hours.textContent = pad(hours);
  countEls.mins.textContent = pad(mins);
  countEls.secs.textContent = pad(secs);
}

tick();
setInterval(tick, 1000);

const themeBtn = document.querySelector("#theme-btn");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.textContent = dark ? "Light" : "Dark";
  themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
  themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  if (themeMeta) {
    themeMeta.setAttribute("content", dark ? "#14110f" : "#f3eee6");
  }
}

applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");

themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  localStorage.setItem("saarthak-theme", next);
  applyTheme(next);
});

const nav = document.querySelector("#nav");
const menu = document.querySelector("#menu");
const menuBtn = document.querySelector("#menu-btn");

function onScroll() {
  nav.classList.toggle("is-solid", window.scrollY > 12);
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

const sections = [...document.querySelectorAll("main section[id]")];
const links = [...menu.querySelectorAll("a[href^='#']")];

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
);

sections.forEach((section) => spy.observe(section));

document.querySelector("#cal-btn").addEventListener("click", () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Saarthak and Ananya//Wedding//EN",
    "BEGIN:VEVENT",
    "UID:saarthak-ananya-ceremony@wedding.test",
    "DTSTAMP:20261002T083000Z",
    "DTSTART:20270313T120000Z",
    "DTEND:20270313T153000Z",
    "SUMMARY:Saarthak & Ananya — Wedding Ceremony",
    "LOCATION:Shah Namkeen\\, C-13 SOM Bazaar Road\\, Indira Park\\, Chander Nagar\\, New Delhi 110051",
    "DESCRIPTION:Wedding ceremony at Shah Namkeen.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const file = new File([ics], "saarthak-ananya-wedding.ics", { type: "text/calendar" });
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
});

const dialog = document.querySelector("#lightbox");
const photo = document.querySelector("#lightbox-photo");
const title = document.querySelector("#lightbox-title");
const note = document.querySelector("#lightbox-note");

document.querySelectorAll(".frame").forEach((frame) => {
  frame.addEventListener("click", () => {
    photo.src = frame.dataset.src;
    photo.alt = frame.dataset.title;
    title.textContent = frame.dataset.title;
    note.textContent = frame.dataset.note;
    dialog.showModal();
  });
});

document.querySelector("#lightbox-close").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelectorAll(".faq details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq details").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const form = document.querySelector("#rsvp-form");
const thanks = document.querySelector("#thanks");
const error = document.querySelector("#form-error");
const countField = document.querySelector("#count-field");
const eventsField = document.querySelector("#events-field");
const mealField = document.querySelector("#meal-field");
const STORAGE_KEY = "saarthak-ananya-rsvp";

function attendingYes() {
  return form.querySelector('input[name="attending"]:checked').value === "yes";
}

function syncAttending() {
  const coming = attendingYes();
  countField.hidden = !coming;
  eventsField.hidden = !coming;
  mealField.hidden = !coming;
}

form.querySelectorAll('input[name="attending"]').forEach((input) => {
  input.addEventListener("change", syncAttending);
});

function showThanks(record) {
  const coming = record.attending === "yes";
  document.querySelector("#thanks-title").textContent = coming
    ? `Thank you, ${record.name.split(" ")[0]}.`
    : `We will miss you, ${record.name.split(" ")[0]}.`;
  document.querySelector("#thanks-body").textContent = coming
    ? `${record.name} is coming with ${record.count} guest${Number(record.count) > 1 ? "s" : ""}, for ${record.events.join(", ") || "the weekend"}. Meal: ${record.meal}. A copy of this reply is saved in this browser.`
    : `${record.name} sent regrets. The families would have understood. This reply is saved in this browser.`;
  form.hidden = true;
  thanks.hidden = false;
}

function showSaved() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    showThanks(JSON.parse(raw));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  error.hidden = true;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  if (!name || !email || !email.includes("@")) {
    error.textContent = "Please add your name and a real email address.";
    error.hidden = false;
    return;
  }
  const coming = attendingYes();
  const record = {
    name,
    email,
    attending: coming ? "yes" : "no",
    count: coming ? form.count.value : "0",
    events: coming
      ? [...form.querySelectorAll('input[name="events"]:checked')].map((input) => input.value)
      : [],
    meal: coming ? form.meal.value : "",
    note: form.note.value.trim(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  showThanks(record);
});

document.querySelector("#edit-rsvp").addEventListener("click", () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  thanks.hidden = true;
  form.hidden = false;
  if (!raw) return;
  const record = JSON.parse(raw);
  form.name.value = record.name;
  form.email.value = record.email;
  form.note.value = record.note || "";
  form.querySelectorAll('input[name="attending"]').forEach((input) => {
    input.checked = input.value === record.attending;
  });
  if (record.count) form.count.value = record.count;
  form.querySelectorAll('input[name="events"]').forEach((input) => {
    input.checked = record.events.includes(input.value);
  });
  if (record.meal) form.meal.value = record.meal;
  syncAttending();
});

syncAttending();
showSaved();

const wishDialog = document.querySelector("#wish-dialog");
const wishForm = document.querySelector("#wish-form");
const wishError = document.querySelector("#wish-error");
const wishNumber = "918447159900";

document.querySelectorAll("[data-wish-open]").forEach((button) => {
  button.addEventListener("click", () => {
    wishError.hidden = true;
    wishDialog.showModal();
  });
});

document.querySelector("#wish-close").addEventListener("click", () => wishDialog.close());

wishDialog.addEventListener("click", (event) => {
  if (event.target === wishDialog) wishDialog.close();
});

wishForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = wishForm.name.value.trim();
  const message = wishForm.message.value.trim();
  if (!name || !message) {
    wishError.textContent = "Please add your name and a message.";
    wishError.hidden = false;
    return;
  }
  const text = `Hello, this is ${name}.\n\n${message}`;
  const url = `https://wa.me/${wishNumber}?text=${encodeURIComponent(text)}`;
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
  wishDialog.close();
});
