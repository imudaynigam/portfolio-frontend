document.addEventListener("DOMContentLoaded", function () {
  const track = document.querySelector(".carousel-track");
  const dots = document.querySelectorAll(".carousel-dot");
  let currentIndex = 0;
  let isTransitioning = false;
  let startX = 0;
  let isDragging = false;

  function moveToSlide(index, animate = true) {
    if (isTransitioning && animate) return;

    // Calculate slide width based on viewport
    const container = document.querySelector(".carousel-container");
    const cardWidth = container.offsetWidth;

    // Handle index bounds
    if (index > 4) index = 0;
    if (index < 0) index = 4;

    // Apply transform with animation control
    if (animate) {
      isTransitioning = true;
      track.style.transition = "transform 0.5s ease-in-out";
    } else {
      track.style.transition = "none";
    }

    // Move to the selected slide
    const translateX = index * cardWidth;
    track.style.transform = `translateX(-${translateX}px)`;

    // Update active dot
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    currentIndex = index;
  } // Add click handlers to dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => moveToSlide(index));
  });

  // Handle transition end
  track.addEventListener("transitionend", () => {
    isTransitioning = false;
  });

  // Touch and mouse events for dragging
  function handleDragStart(e) {
    startX = e.type === "mousedown" ? e.pageX : e.touches[0].pageX;
    isDragging = true;
    stopAutoAdvance();

    // Add move and end event listeners
    if (e.type === "mousedown") {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    }
  }

  function handleDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const currentX = e.type === "mousemove" ? e.pageX : e.touches[0].pageX;
    const diff = startX - currentX;
    const container = document.querySelector(".carousel-container");
    const slideWidth = container.offsetWidth;

    // Calculate drag distance as percentage of slide width
    const dragPercentage = (diff / slideWidth) * 100;

    // Move track with cursor/finger
    track.style.transition = "none";
    track.style.transform = `translateX(${-(
      currentIndex * 100 +
      dragPercentage
    )}%)`;
  }

  function handleDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;

    const endX = e.type === "mouseup" ? e.pageX : e.changedTouches[0].pageX;
    const diff = startX - endX;
    const container = document.querySelector(".carousel-container");
    const threshold = container.offsetWidth * 0.2; // 20% threshold for slide change

    if (Math.abs(diff) > threshold) {
      moveToSlide(currentIndex + (diff > 0 ? 1 : -1));
    } else {
      moveToSlide(currentIndex); // Snap back to current slide
    }

    startAutoAdvance();

    // Remove move and end event listeners
    if (e.type === "mouseup") {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    }
  }

  // Add touch and mouse event listeners
  track.addEventListener("mousedown", handleDragStart);
  track.addEventListener("touchstart", handleDragStart, { passive: true });
  track.addEventListener("touchmove", handleDragMove, { passive: false });
  track.addEventListener("touchend", handleDragEnd);
  track.addEventListener("touchcancel", handleDragEnd);

  // Prevent context menu on long press
  track.addEventListener("contextmenu", (e) => e.preventDefault());

  // Auto-advance carousel
  let autoAdvanceTimer;
  function startAutoAdvance() {
    stopAutoAdvance();
    autoAdvanceTimer = setInterval(() => {
      if (!isDragging) {
        moveToSlide((currentIndex + 1) % 5);
      }
    }, 5000);
  }

  function stopAutoAdvance() {
    if (autoAdvanceTimer) {
      clearInterval(autoAdvanceTimer);
    }
  }

  // Handle resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      moveToSlide(currentIndex, false); // Don't animate on resize
    }, 250);
  });

  // Initialize carousel
  moveToSlide(0, false);
  startAutoAdvance();

  // Handle mouse hover
  track.addEventListener("mouseenter", stopAutoAdvance);
  track.addEventListener("mouseleave", startAutoAdvance);
});
