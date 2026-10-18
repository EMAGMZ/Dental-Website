(function () {
    "use strict";

    var SELECTOR = ".caso-card, .contacto-card, .imagenLuciano, .formacion-item, .turnos-form, .accordion-item";

    var sinMovimiento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (sinMovimiento || !("IntersectionObserver" in window)) return;

    var elementos = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
    if (!elementos.length) return;

    var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add("reveal--visible");
            observador.unobserve(entrada.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    elementos.forEach(function (el) {
        var hermanos = Array.prototype.filter.call(el.parentNode.children, function (h) {
            return h.matches(SELECTOR);
        });
        el.style.setProperty("--reveal-delay", (hermanos.indexOf(el) % 3) * 120 + "ms");
        el.classList.add("reveal");
        observador.observe(el);
    });
})();
