document.querySelectorAll('.comparador').forEach((comparador) => {
  const rango = comparador.querySelector('.comparador-rango');
  if (!rango) return;
  rango.addEventListener('input', () => {
    comparador.style.setProperty('--pos', rango.value + '%');
    comparador.style.setProperty('--p', rango.value);
  });
});
