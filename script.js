'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = 'http://www.w3.org/2000/svg';

const svg = (name, attrs = {}, parent) => {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.appendChild(node);
    return node;
};

const header = $('#header');
addEventListener('scroll', () => header.classList.toggle('solid', scrollY > 40), { passive: true });

const themeBtn = $('#themeBtn');
const formOk = $('#formOk');

const applyTheme = theme => {
    root.dataset.theme = theme;
    themeBtn.setAttribute('aria-checked', theme === 'light');
    formOk.hidden = true;
    try {
        localStorage.setItem('orfeo-theme', theme);
    } catch (e) {}
};

try {
    const saved = localStorage.getItem('orfeo-theme');
    if (saved) applyTheme(saved);
} catch (e) {}

themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || reduce) {
        applyTheme(next);
        return;
    }
    const box = themeBtn.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => applyTheme(next)).ready.then(() => {
        root.animate(
            { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 800, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
    });
});

const ticks = $('#ticks');
for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const angle = (i * 6 * Math.PI) / 180;
    const r1 = 136;
    const r2 = major ? 120 : 129;
    svg('line', {
        x1: 200 + r1 * Math.sin(angle),
        y1: 200 - r1 * Math.cos(angle),
        x2: 200 + r2 * Math.sin(angle),
        y2: 200 - r2 * Math.cos(angle),
        stroke: major ? '#efe6d8' : '#8a7e6e',
        'stroke-width': major ? 3 : 1,
        'stroke-linecap': 'round'
    }, ticks);
}

const gearPath = (teeth, radius) => {
    const step = Math.PI / (2 * teeth);
    const depth = 3;
    const radii = [radius - depth, radius + depth, radius + depth, radius - depth];
    let d = '';
    for (let i = 0; i < teeth * 4; i++) {
        const r = radii[i % 4];
        d += `${i ? 'L' : 'M'}${(r * Math.cos(i * step)).toFixed(1)} ${(r * Math.sin(i * step)).toFixed(1)}`;
    }
    return d + 'Z';
};

const gearDefs = [
    { teeth: 24, x: 150, y: 235, parent: null },
    { teeth: 16, x: 188.6, y: 189, parent: 0 },
    { teeth: 30, x: 256.6, y: 201, parent: 1 },
    { teeth: 12, x: 225, y: 255.6, parent: 2 }
];

const gearLayer = $('#gears');
const baseSpeed = reduce ? 0 : 0.35;

const gears = [];

gearDefs.forEach(def => {
    const radius = def.teeth * 1.5;
    const holder = svg('g', { transform: `translate(${def.x} ${def.y})` }, gearLayer);
    const node = svg('g', {}, holder);
    svg('path', { d: gearPath(def.teeth, radius), class: 'gear-line' }, node);
    svg('circle', { r: radius - 9, class: 'gear-detail' }, node);
    svg('circle', { r: 3, class: 'gear-detail' }, node);
    if (radius > 30) {
        for (let k = 0; k < 5; k++) {
            const a = (k * 2 * Math.PI) / 5;
            svg('line', {
                x1: 3 * Math.cos(a),
                y1: 3 * Math.sin(a),
                x2: (radius - 9) * Math.cos(a),
                y2: (radius - 9) * Math.sin(a),
                class: 'gear-detail'
            }, node);
        }
    }
    const gear = { ...def, radius, node, angle: 0, speed: baseSpeed };
    if (def.parent !== null) {
        const p = gears[def.parent];
        const phi = Math.atan2(def.y - p.y, def.x - p.x);
        const toothCenter = n => 0.75 * Math.PI / n;
        const period = n => (2 * Math.PI) / n;
        const uParent = (phi - p.angle - toothCenter(p.teeth)) / period(p.teeth);
        gear.angle = phi + Math.PI - toothCenter(def.teeth) - period(def.teeth) * (0.5 - uParent);
        gear.speed = (-p.speed * p.teeth) / def.teeth;
    }
    gears.push(gear);
});

const hands = { hour: $('#hHour'), min: $('#hMin'), sec: $('#hSec') };

const updateClock = () => {
    const now = new Date();
    const seconds = now.getSeconds() + (reduce ? 0 : now.getMilliseconds() / 1000);
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;
    hands.sec.setAttribute('transform', `rotate(${seconds * 6})`);
    hands.min.setAttribute('transform', `rotate(${minutes * 6})`);
    hands.hour.setAttribute('transform', `rotate(${hours * 30})`);
};

let last = performance.now();
const loop = now => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (root.dataset.theme === 'dark') {
        gears.forEach(g => {
            g.angle += g.speed * dt;
            g.node.setAttribute('transform', `rotate(${(g.angle * 180) / Math.PI})`);
        });
        updateClock();
    }
    requestAnimationFrame(loop);
};
gears.forEach(g => g.node.setAttribute('transform', `rotate(${(g.angle * 180) / Math.PI})`));
updateClock();
requestAnimationFrame(loop);

const stage = $('#stage');
$$('.sw').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.parentElement;
        $$('.sw', group).forEach(b => b.setAttribute('aria-pressed', b === btn));
        if (btn.dataset.case) stage.dataset.case = btn.dataset.case;
        if (btn.dataset.note) stage.dataset.note = btn.dataset.note;
    });
});

const wish = $('#wish');
const wishCount = $('#wishCount');
$$('.heart').forEach(btn => {
    btn.addEventListener('click', () => {
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', on);
        const total = $$('.heart[aria-pressed=true]').length;
        wishCount.textContent = total;
        wish.classList.remove('bump');
        void wish.offsetWidth;
        wish.classList.add('bump');
    });
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
    });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => observer.observe(el));

const form = $('#form');
const input = $('input', form);
const label = input.closest('label');

const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

input.addEventListener('blur', () => {
    if (input.value) validate();
});

const validate = () => {
    const ok = validEmail(input.value.trim());
    label.classList.toggle('invalid', !ok);
    $('small', label).textContent = ok ? '' : 'Introdu o adresă de email validă, de exemplu nume@domeniu.ro.';
    return ok;
};

form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validate()) {
        input.focus();
        return;
    }
    formOk.textContent = root.dataset.theme === 'dark'
        ? 'Mulțumim. Te contactăm în 24 de ore pentru o programare în atelier.'
        : 'Mulțumim. Setul cu trei mostre pornește spre tine în 24 de ore.';
    formOk.hidden = false;
    form.reset();
});