// Navbar scroll-verhalten
let lastScrollY = window.scrollY;
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY) {
    navbar.classList.remove("navbar-visible");
    navbar.classList.add("navbar-hidden");
  } else {
    navbar.classList.remove("navbar-hidden");
    navbar.classList.add("navbar-visible");
  }
  lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
});

// Mobile Menü
const menuToggle = document.getElementById("menuToggle");
const menuClose = document.getElementById("menuClose");
const mobileMenu = document.getElementById("mobileMenu");

menuToggle.addEventListener("click", () => {
  mobileMenu.classList.remove("translate-x-full");
  document.body.classList.add("overflow-hidden");
});

menuClose.addEventListener("click", () => {
  mobileMenu.classList.add("translate-x-full");
  document.body.classList.remove("overflow-hidden");
});

// Click outside schließt Menü
window.addEventListener("click", (e) => {
  if (
    !mobileMenu.classList.contains("translate-x-full") &&
    !mobileMenu.contains(e.target) &&
    !menuToggle.contains(e.target)
  ) {
    mobileMenu.classList.add("translate-x-full");
    document.body.classList.remove("overflow-hidden");
  }
});

// Swipe (touch) schließen
let touchStartX = 0;
mobileMenu.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
});
mobileMenu.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  if (touchEndX > touchStartX + 50) {
    mobileMenu.classList.add("translate-x-full");
    document.body.classList.remove("overflow-hidden");
  }
});

// Fade-in Scroll Animation
document.addEventListener("DOMContentLoaded", () => {
  const faders = document.querySelectorAll(".fade-in");
  const options = {
    threshold: 0.1,
    rootMargin: "0px 0px -20px 0px"
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-visible");
        observer.unobserve(entry.target);
      }
    });
  }, options);

  faders.forEach(fader => {
    observer.observe(fader);
  });
});

// Chat-Button Steuerung
const chatButton = document.getElementById("chatButton");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");

chatButton.addEventListener("click", () => {
  chatWindow.classList.remove("hidden");
  chatWindow.classList.add("fade-in-visible");
});

closeChat.addEventListener("click", () => {
  chatWindow.classList.remove("fade-in-visible");
  chatWindow.classList.add("hidden");
});
