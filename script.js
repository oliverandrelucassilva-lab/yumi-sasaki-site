(function () {
  var slider = document.getElementById("baSlider");
  if (!slider) return;

  var afterPanel = slider.querySelector(".ba-panel.after");
  var divider = slider.querySelector(".ba-divider");
  var handle = slider.querySelector(".ba-handle");
  var dragging = false;

  function setPosition(percent) {
    var clamped = Math.min(100, Math.max(0, percent));
    afterPanel.style.clipPath = "inset(0 " + (100 - clamped) + "% 0 0)";
    divider.style.left = clamped + "%";
    handle.style.left = clamped + "%";
    handle.setAttribute("aria-valuenow", Math.round(clamped));
  }

  function percentFromClientX(clientX) {
    var rect = slider.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function onPointerMove(event) {
    if (!dragging) return;
    var clientX = event.touches ? event.touches[0].clientX : event.clientX;
    setPosition(percentFromClientX(clientX));
  }

  function stopDragging() {
    dragging = false;
  }

  slider.addEventListener("pointerdown", function (event) {
    dragging = true;
    setPosition(percentFromClientX(event.clientX));
  });
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", stopDragging);

  slider.addEventListener("touchstart", function (event) {
    dragging = true;
    setPosition(percentFromClientX(event.touches[0].clientX));
  }, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("touchend", stopDragging);

  handle.addEventListener("keydown", function (event) {
    var current = parseFloat(handle.style.left) || 50;
    if (event.key === "ArrowLeft") {
      setPosition(current - 5);
      event.preventDefault();
    } else if (event.key === "ArrowRight") {
      setPosition(current + 5);
      event.preventDefault();
    }
  });

  setPosition(50);
})();

// ---- 3D tilt on portrait cards + gentle parallax rings ----
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var tiltCards = document.querySelectorAll(".tilt-card");
  tiltCards.forEach(function (card) {
    var maxTilt = 8;

    function onMove(event) {
      var rect = card.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      var rotY = x * maxTilt * 2;
      var rotX = y * -maxTilt * 2;
      card.style.transform =
        "perspective(1000px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg) scale3d(1.02, 1.02, 1.02)";
    }

    function onLeave() {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
  });

  var rings = document.querySelectorAll(".hero-ring");
  if (rings.length) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        rings.forEach(function (ring, i) {
          var speed = i % 2 === 0 ? 0.06 : -0.09;
          ring.style.transform = "translateY(" + (y * speed).toFixed(1) + "px)";
        });
        ticking = false;
      });
    }, { passive: true });
  }
})();


// ---- scroll-reveal for section headings, cards and photos ----
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  var targets = document.querySelectorAll(
    ".section-head, .specialty-card, .about-body, .clinic-body, .location-card, .results-gallery figure"
  );
  if (!targets.length) return;

  targets.forEach(function (el) {
    el.classList.add("reveal");
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
