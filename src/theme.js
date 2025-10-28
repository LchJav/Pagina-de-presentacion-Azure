/**
 * Aplica el tema claro u oscuro basado en la hora del día.
 * Tema claro: 07:00 - 17:59
 * Tema oscuro: 18:00 - 06:59
 */
function applyAutomaticTheme() {
    const currentHour = new Date().getHours();
    const isDayTime = currentHour >= 7 && currentHour < 18;

    if (isDayTime) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
}

// Aplica el tema tan pronto como el script se carga.
applyAutomaticTheme();
