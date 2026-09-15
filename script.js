(function () {
  var slider = document.getElementById("baSlider");
  if (!slider) return;

  var afterPanel = slider.querySelector(".ba-panel.after");
  var divider = slider.querySelector(".ba-divider");
  var handle = slider.querySelector(".ba-handle");
  var dragging = false;

  function setPosition(percent) {
    var clamped = Math.min(100, Math.max(0, percent));
    afterPanel.style.clipPath = "inset(0 0 0 " + clamped + "%)";
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
