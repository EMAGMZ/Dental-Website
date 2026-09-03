(function () {
    "use strict";

    var wizard = document.getElementById("wizardTurnos");
    if (!wizard) return;

    var NUMERO_WHATSAPP = "543872243511";

    var pasos = Array.prototype.slice.call(wizard.querySelectorAll(".wizard-paso"));
    var total = pasos.length;
    var pasoActual = 0;

    var barraProgreso = wizard.querySelector(".wizard-progreso-barra");
    var progresoTexto = wizard.querySelector(".wizard-progreso-texto");
    var btnAtras = wizard.querySelector(".wizard-btn-atras");
    var btnSiguiente = wizard.querySelector(".wizard-btn-siguiente");

    var inputInteres = wizard.querySelector("#wizardInteres");
    var valorInteres = wizard.querySelector("#wizardInteresValor");
    var inputNombre = wizard.querySelector("#wizardNombre");
    var inputTelefono = wizard.querySelector("#wizardTelefono");

    var inputTratamientoOtro = wizard.querySelector("#wizardTratamientoOtro");
    var campoOtro = wizard.querySelector("#wizardOtroCampo");
    var textoOtro = wizard.querySelector("#wizardOtroTexto");

    var respuestas = {
        tratamiento: "",
        historial: "",
        interes: 5,
        urgencia: "",
        presupuesto: "",
        nombre: "",
        telefono: ""
    };

    function actualizarProgreso() {
        var porcentaje = ((pasoActual + 1) / total) * 100;
        barraProgreso.style.width = porcentaje + "%";
        if (progresoTexto) {
            progresoTexto.textContent = "Paso " + (pasoActual + 1) + " de " + total;
        }
    }

    function recolectarRespuestas() {
        var tratamientoInput = wizard.querySelector('input[name="tratamiento"]:checked');
        var historialInput = wizard.querySelector('input[name="historial"]:checked');
        var urgenciaInput = wizard.querySelector('input[name="urgencia"]:checked');
        var presupuestoInput = wizard.querySelector('input[name="presupuesto"]:checked');

        respuestas.tratamiento = tratamientoInput ? tratamientoInput.value : "";
        if (tratamientoInput && tratamientoInput.value === "Otro" && textoOtro) {
            respuestas.tratamiento = "Otro: " + textoOtro.value.trim();
        }
        respuestas.historial = historialInput ? historialInput.value : "";
        respuestas.interes = inputInteres ? Number(inputInteres.value) : 5;
        respuestas.urgencia = urgenciaInput ? urgenciaInput.value : "";
        respuestas.presupuesto = presupuestoInput ? presupuestoInput.value : "";
        respuestas.nombre = inputNombre ? inputNombre.value.trim() : "";
        respuestas.telefono = inputTelefono ? inputTelefono.value.trim() : "";
    }

    function esLeadCaliente() {
        return (
            respuestas.interes >= 7 &&
            respuestas.urgencia === "Lo antes posible" &&
            respuestas.presupuesto === "Sí, puedo ahora"
        );
    }

    function validarPasoActual() {
        var paso = pasos[pasoActual];
        var tipo = paso.getAttribute("data-tipo");
        var valido = false;

        if (tipo === "opciones") {
            valido = !!paso.querySelector('input[type="radio"]:checked');
            if (valido && inputTratamientoOtro && inputTratamientoOtro.checked) {
                valido = !!(textoOtro && textoOtro.value.trim().length > 0);
            }
        } else if (tipo === "slider") {
            valido = true;
        } else if (tipo === "contacto") {
            var nombreOk = inputNombre && inputNombre.value.trim().length > 1;
            var telefonoOk = inputTelefono && inputTelefono.value.trim().length > 5;
            valido = !!(nombreOk && telefonoOk);
        }

        btnSiguiente.disabled = !valido;
    }

    function mostrarPaso(indice) {
        pasos.forEach(function (paso, i) {
            paso.classList.toggle("wizard-paso--activo", i === indice);
        });

        btnAtras.disabled = indice === 0;

        if (indice === total - 1) {
            recolectarRespuestas();
            btnSiguiente.textContent = esLeadCaliente()
                ? "Quiero agendar turno ya"
                : "Quiero más información";
        } else {
            btnSiguiente.textContent = "Siguiente";
        }

        actualizarProgreso();
        validarPasoActual();
    }

    function armarMensajeWhatsApp() {
        var caliente = esLeadCaliente();
        var intro = caliente
            ? "Hola! Quiero agendar turno ya."
            : "Hola! Quiero más información antes de agendar.";

        var lineas = [
            intro,
            "",
            "Nombre: " + respuestas.nombre,
            "Teléfono: " + respuestas.telefono,
            "Tratamiento: " + respuestas.tratamiento,
            "Historial del problema: " + respuestas.historial,
            "Interés (1-10): " + respuestas.interes,
            "Urgencia: " + respuestas.urgencia,
            "Presupuesto: " + respuestas.presupuesto
        ];

        return lineas.join("\n");
    }

    function enviarWizard() {
        recolectarRespuestas();
        var mensaje = armarMensajeWhatsApp();
        var url = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
        window.open(url, "_blank", "noopener");
    }

    wizard.addEventListener("change", function (evento) {
        if (evento.target.matches('input[type="radio"]')) {
            var grupo = evento.target.closest(".wizard-opciones");
            if (grupo) {
                grupo.querySelectorAll(".wizard-opcion").forEach(function (opcion) {
                    opcion.classList.remove("wizard-opcion--activa");
                });
            }
            var opcionActiva = evento.target.closest(".wizard-opcion");
            if (opcionActiva) {
                opcionActiva.classList.add("wizard-opcion--activa");
            }
            if (campoOtro && evento.target.name === "tratamiento") {
                var esOtro = evento.target === inputTratamientoOtro;
                campoOtro.hidden = !esOtro;
                if (esOtro && textoOtro) {
                    textoOtro.focus();
                } else if (textoOtro) {
                    textoOtro.value = "";
                }
            }
            validarPasoActual();
        }
    });

    wizard.addEventListener("input", function (evento) {
        if (evento.target === inputInteres && valorInteres) {
            valorInteres.textContent = inputInteres.value;
        }
        if (evento.target === inputNombre || evento.target === inputTelefono || evento.target === textoOtro) {
            validarPasoActual();
        }
    });

    wizard.addEventListener("submit", function (evento) {
        evento.preventDefault();
    });

    btnAtras.addEventListener("click", function () {
        if (pasoActual > 0) {
            pasoActual--;
            mostrarPaso(pasoActual);
        }
    });

    btnSiguiente.addEventListener("click", function () {
        if (btnSiguiente.disabled) return;

        if (pasoActual < total - 1) {
            pasoActual++;
            mostrarPaso(pasoActual);
        } else {
            enviarWizard();
        }
    });

    mostrarPaso(0);
})();
