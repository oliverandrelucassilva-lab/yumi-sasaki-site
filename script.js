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

// ---- interactive 3D tooth (real WebGL model, drag to rotate) ----
(function () {
  var stage = document.getElementById("tooth3d");
  var canvas = document.getElementById("tooth3dCanvas");
  if (!stage || !canvas || typeof THREE === "undefined") return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, -0.15, 5.4);
  camera.lookAt(0, -0.3, 0);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  scene.add(new THREE.AmbientLight(0xfff3e0, 0.5));

  var keyLight = new THREE.DirectionalLight(0xffd9a0, 0.8);
  keyLight.position.set(-4, 1.8, 4.2);
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0xfff8f0, 0.45);
  fillLight.position.set(3, 1, 2.5);
  scene.add(fillLight);

  var rimLight = new THREE.DirectionalLight(0xf3d9ad, 0.5);
  rimLight.position.set(0, -2, -4);
  scene.add(rimLight);

  var material = new THREE.MeshPhysicalMaterial({
    color: 0xfaf4e6,
    roughness: 0.32,
    metalness: 0.04,
    clearcoat: 0.9,
    clearcoatRoughness: 0.15
  });

  var toothGroup = new THREE.Group();

  var body = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 40), material);
  body.scale.set(1.05, 0.78, 0.88);
  body.position.set(0, -0.05, 0);
  toothGroup.add(body);

  [-0.38, 0.38].forEach(function (x) {
    var cusp = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 28), material);
    cusp.scale.set(0.62, 0.58, 0.58);
    cusp.position.set(x, 0.38, 0.05);
    toothGroup.add(cusp);
  });

  [-0.38, 0.38].forEach(function (x, i) {
    var root = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.05, 1.3, 20, 1), material);
    root.position.set(x, -0.9, 0);
    root.rotation.z = i === 0 ? 0.1 : -0.1;
    toothGroup.add(root);
  });

  toothGroup.rotation.y = -0.35;
  scene.add(toothGroup);

  function resize() {
    var rect = stage.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);
  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(stage);
  }

  var dragging = false;
  var lastX = 0;
  var velocity = 0;
  var idleSpeed = reduceMotion ? 0 : 0.0035;

  stage.addEventListener("pointerdown", function (event) {
    dragging = true;
    lastX = event.clientX;
    velocity = 0;
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", function (event) {
    if (!dragging) return;
    var dx = event.clientX - lastX;
    lastX = event.clientX;
    var delta = dx * 0.012;
    toothGroup.rotation.y += delta;
    velocity = delta;
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(function (evt) {
    stage.addEventListener(evt, function () {
      dragging = false;
    });
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!dragging) {
      if (Math.abs(velocity) > 0.0002) {
        toothGroup.rotation.y += velocity;
        velocity *= 0.94;
      } else {
        toothGroup.rotation.y += idleSpeed;
      }
    }
    renderer.render(scene, camera);
  }
  animate();
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
