(() => {
'use strict';

const getStoredTheme = () => localStorage.getItem('theme');
const setStoredTheme = theme => localStorage.setItem('theme', theme);

const getPreferredTheme = () => {
const storedTheme = getStoredTheme();
if (storedTheme) {
return storedTheme;
}
return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
updateThemeIcon(theme);
};

const setTheme = theme => {
if (theme === 'auto') {
document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
} else {
document.documentElement.setAttribute('data-bs-theme', theme);
}
};

const toggleTheme = () => {
const theme = getStoredTheme() === 'light' ? 'dark' : 'light';
setStoredTheme(theme);
setTheme(theme);
document.body.classList.toggle('dark-mode', theme === 'dark');
};

const updateThemeIcon = (theme) => {
const iconElement = document.getElementById('theme-icon');
if (theme === 'dark') {
iconElement.classList.remove('ri-lightbulb-line');
iconElement.classList.add('ri-lightbulb-fill');
} else {
iconElement.classList.remove('ri-lightbulb-fill');
iconElement.classList.add('ri-lightbulb-line');
}
};

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
if (getStoredTheme() !== 'light' && getStoredTheme() !== 'dark') {
setTheme(getPreferredTheme());
}
});

window.addEventListener('DOMContentLoaded', () => {
const storedTheme = getStoredTheme();
setTheme(storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'auto');
updateThemeIcon(storedTheme === 'dark' ? 'dark' : 'light');
document.getElementById('dark-mode-toggle').addEventListener('change', toggleTheme);
document.body.classList.toggle('dark-mode', storedTheme === 'dark');
});
})();
