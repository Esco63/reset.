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
  menuToggle.setAttribute("aria-expanded", "true"); // A11y
});

menuClose.addEventListener("click", () => {
  mobileMenu.classList.add("translate-x-full");
  document.body.classList.remove("overflow-hidden");
  menuToggle.setAttribute("aria-expanded", "false"); // A11y
});

// Click outside schließt Menü
window.addEventListener("touchstart", (e) => {
  if (
    !mobileMenu.classList.contains("translate-x-full") &&
    !mobileMenu.contains(e.target) &&
    !menuToggle.contains(e.target)
  ) {
    mobileMenu.classList.add("translate-x-full");
    document.body.classList.remove("overflow-hidden");
    menuToggle.setAttribute("aria-expanded", "false"); // A11y
  }
});

window.addEventListener("mousedown", (e) => {
  if (
    !mobileMenu.classList.contains("translate-x-full") &&
    !mobileMenu.contains(e.target) &&
    !menuToggle.contains(e.target)
  ) {
    mobileMenu.classList.add("translate-x-full");
    document.body.classList.remove("overflow-hidden");
    menuToggle.setAttribute("aria-expanded", "false"); // A11y
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
    menuToggle.setAttribute("aria-expanded", "false"); // A11y
  }
});

// Fade-in Scroll Animation und VORHER/NACHHER SLIDER INITIALISIERUNG
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

  // --- VORHER/NACHHER SLIDER LOGIK HIER ---
  const sliders = document.querySelectorAll('.comparison-slider');

  sliders.forEach(slider => {
    const imgAfter = slider.querySelector('.slider-image-after');
    const handle = slider.querySelector('.comparison-slider-handle');
    const sliderRect = slider.getBoundingClientRect(); // Cached here for efficiency

    // Initial position, set to 50%
    imgAfter.style.width = '50%';
    handle.style.left = '50%';

    let isDragging = false;

    // Funktion zum Aktualisieren des Sliders
    function updateSlider(e) {
      // Use sliderRect for consistent calculations relative to the slider's initial position
      let x = e.clientX;
      if (e.touches && e.touches.length > 0) { // Für Touch-Events
        x = e.touches[0].clientX;
      }
      
      let position = (x - sliderRect.left) / sliderRect.width;

      // Begrenzen der Position zwischen 0 und 1
      if (position < 0) position = 0;
      if (position > 1) position = 1;

      imgAfter.style.width = `${position * 100}%`;
      handle.style.left = `${position * 100}%`;
    }

    // Event Listener für Maus- und Touch-Events
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Verhindert das Standard-Drag-Verhalten
      isDragging = true;
      handle.style.cursor = 'grabbing';
      slider.classList.add('dragging'); // Fügt eine Klasse für potenzielles Styling hinzu
    });

    handle.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Verhindert Scrollen
        isDragging = true;
        handle.style.cursor = 'grabbing'; // Optional, da nicht sichtbar
        slider.classList.add('dragging');
    }, { passive: false }); // passive: false wichtig für preventDefault auf touchstart

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e);
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSlider(e);
    }, { passive: false });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      handle.style.cursor = 'ew-resize';
      slider.classList.remove('dragging');
    });

    window.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      handle.style.cursor = 'ew-resize'; // Optional
      slider.classList.remove('dragging');
    });

    // WICHTIG: Initialposition des Sliders nach dem Laden setzen
    // Hier wird ein kleines Timeout verwendet, um sicherzustellen, dass Bilder und Container gerendert sind.
    setTimeout(() => {
        // Berechne die Mitte des Sliders und aktualisiere die Position
        const initialX = slider.getBoundingClientRect().left + slider.getBoundingClientRect().width / 2;
        updateSlider({ clientX: initialX });
    }, 100); // Eine kleine Verzögerung kann manchmal Wunder wirken
  });
});
// At the very top of script.js
console.log("script.js loaded successfully!");

// Navbar scroll-verhalten (bleibt unverändert)
// ... (der gesamte bestehende Navbar-Code) ...

// Mobile Menü (bleibt unverändert)
// ... (der gesamte bestehende Mobile Menü Code) ...

// Fade-in Scroll Animation und VORHER/NACHHER SLIDER INITIALISIERUNG
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded event fired."); // Debugging
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

  // --- VORHER/NACHHER SLIDER LOGIK HIER ---
  console.log("Attempting to initialize comparison sliders..."); // Debugging
  const sliders = document.querySelectorAll('.comparison-slider');
  console.log(`Found ${sliders.length} comparison sliders.`); // Debugging: Hier sollte 4 stehen, wenn alle da sind

  sliders.forEach(slider => {
    console.log("Initializing a slider:", slider); // Debugging
    const imgAfter = slider.querySelector('.slider-image-after');
    const handle = slider.querySelector('.comparison-slider-handle');
    const sliderRect = slider.getBoundingClientRect(); // Cached here for efficiency

    if (!imgAfter || !handle) {
        console.error("Error: Slider images or handle not found in slider:", slider); // Debugging
        return; // Skip this slider if elements are missing
    }

    // Initial position, set to 50%
    imgAfter.style.width = '50%';
    handle.style.left = '50%';
    console.log("Initial slider position set to 50% for:", slider); // Debugging

    let isDragging = false;

    // Funktion zum Aktualisieren des Sliders
    function updateSlider(e) {
      let x = e.clientX;
      if (e.touches && e.touches.length > 0) { // Für Touch-Events
        x = e.touches[0].clientX;
      }
      
      let position = (x - sliderRect.left) / sliderRect.width;

      // Begrenzen der Position zwischen 0 und 1
      if (position < 0) position = 0;
      if (position > 1) position = 1;

      imgAfter.style.width = `${position * 100}%`;
      handle.style.left = `${position * 100}%`;
      // console.log(`Slider updated: position=${position.toFixed(2)}, clientX=${x}`); // Zu viele Logs, nur bei Bedarf aktivieren
    }

    // Event Listener für Maus- und Touch-Events
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Verhindert das Standard-Drag-Verhalten
      isDragging = true;
      handle.style.cursor = 'grabbing';
      slider.classList.add('dragging'); // Fügt eine Klasse für potenzielles Styling hinzu
      console.log("Dragging started for slider:", slider); // Debugging
    });

    handle.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Verhindert Scrollen
        isDragging = true;
        handle.style.cursor = 'grabbing'; // Optional, da nicht sichtbar
        slider.classList.add('dragging');
        console.log("Touch dragging started for slider:", slider); // Debugging
    }, { passive: false }); // passive: false wichtig für preventDefault auf touchstart

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e);
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSlider(e);
    }, { passive: false });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      handle.style.cursor = 'ew-resize';
      slider.classList.remove('dragging');
      console.log("Dragging ended for slider:", slider); // Debugging
    });

    window.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      handle.style.cursor = 'ew-resize'; // Optional
      slider.classList.remove('dragging');
      console.log("Touch dragging ended for slider:", slider); // Debugging
    });

    // Initialposition des Sliders setzen (z.B. in der Mitte)
    // Verwenden eines kleinen Timeouts, um sicherzustellen, dass die Bilder im DOM gerendert sind
    setTimeout(() => {
        const initialX = slider.getBoundingClientRect().left + slider.getBoundingClientRect().width / 2;
        updateSlider({ clientX: initialX });
        console.log("Slider initial position set after timeout for:", slider); // Debugging
    }, 200); // 200ms Verzögerung für mehr Sicherheit
  });
});