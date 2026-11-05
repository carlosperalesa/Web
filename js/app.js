/**
 * App Global Configuration & Utilities
 * Centralizes logic for the entire portfolio site.
 */

const App = {
    // Check if device is mobile
    isMobile: () => window.innerWidth <= 768,

    // PocketBase Configuration
    pocketbase: {
        getBaseUrl: () => {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const localDefault = 'http://127.0.0.1:8090';
            const prodDefault = 'https://carlosperales.dev';
            return window.PB_BASE_URL || (isLocal ? localDefault : prodDefault);
        },
        collections: {
            messages: 'messages'
        }
    },


    // Initialization logic
    init: () => {
        console.log('🚀 Carlos Perales Portfolio - App Initialized');
        // Expose global helpers if needed
    }
};

function openPocketBaseAdmin() {
    const baseUrl = App.pocketbase.getBaseUrl();
    const adminUrl = `${baseUrl}/_/`;
    window.open(adminUrl, '_blank', 'noopener');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', App.init);

// Expose to window for other scripts
window.App = App;


class SkillsGraph {
    constructor() {
        this.containerId = 'skills-graph';
        this.container = document.getElementById(this.containerId);
        this.simulation = null;
        this.svg = null;
        this.initialized = false;

        // Data
        this.data = {
            nodes: [
                { id: "Carlos", group: 0, size: 30 },

                { id: "Frontend", group: 1, size: 20 },
                { id: "HTML5", group: 1, size: 10 },
                { id: "CSS3", group: 1, size: 10 },
                { id: "JS", group: 1, size: 12 },
                { id: "React", group: 1, size: 8 },
                { id: "Git", group: 1, size: 8 },

                { id: "Backend", group: 2, size: 20 },
                { id: "Python", group: 2, size: 12 },
                { id: "Django", group: 2, size: 10 },
                { id: "SQL", group: 2, size: 8 },
                { id: "Postgres", group: 2, size: 8 },
                { id: "APIs", group: 2, size: 8 },

                { id: "CMS", group: 3, size: 15 },
                { id: "WordPress", group: 3, size: 10 },
                { id: "WooCommerce", group: 3, size: 8 },
                { id: "Elementor", group: 3, size: 8 },

                { id: "DevOps", group: 4, size: 15 },
                { id: "Docker", group: 4, size: 10 },
                { id: "Linux", group: 4, size: 8 },
                { id: "Nginx", group: 4, size: 8 },

                { id: "Soft Skills", group: 5, size: 15 },
                { id: "Comms", group: 5, size: 8 },
                { id: "Analysis", group: 5, size: 8 },
                { id: "Solving", group: 5, size: 8 },
            ],
            links: [
                { source: "Carlos", target: "Frontend" },
                { source: "Carlos", target: "Backend" },
                { source: "Carlos", target: "CMS" },
                { source: "Carlos", target: "DevOps" },
                { source: "Carlos", target: "Soft Skills" },

                { source: "Frontend", target: "HTML5" },
                { source: "Frontend", target: "CSS3" },
                { source: "Frontend", target: "JS" },
                { source: "Frontend", target: "React" },
                { source: "Frontend", target: "Git" },

                { source: "Backend", target: "Python" },
                { source: "Backend", target: "Django" },
                { source: "Backend", target: "SQL" },
                { source: "Backend", target: "Postgres" },
                { source: "Backend", target: "APIs" },

                { source: "CMS", target: "WordPress" },
                { source: "CMS", target: "WooCommerce" },
                { source: "CMS", target: "Elementor" },

                { source: "DevOps", target: "Docker" },
                { source: "DevOps", target: "Linux" },
                { source: "DevOps", target: "Nginx" },

                { source: "Soft Skills", target: "Comms" },
                { source: "Soft Skills", target: "Analysis" },
                { source: "Soft Skills", target: "Solving" },

                { source: "JS", target: "React" },
                { source: "Python", target: "Django" },
                { source: "WordPress", target: "WooCommerce" },
            ]
        };

        // Colors
        this.colors = ["#6c47ff", "#a685ff", "#8b7ab8", "#c6b5ea", "#6da99b", "#b88eb7"];

        this.motion = matchMedia('(prefers-reduced-motion: reduce)');
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.isIntersecting && !document.hidden) {
                    if (!this.initialized) this.init();
                    else if (!this.motion.matches) this.simulation.alpha(.15).restart();
                } else if (this.simulation) this.simulation.stop();
            }
        }, {threshold:.1});
        if (this.container) observer.observe(this.container);
        new ResizeObserver(() => { if (this.initialized) this.resize(); }).observe(this.container);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.simulation) this.simulation.stop();
        });
    }

    init() {
        if (!this.container) this.container = document.getElementById(this.containerId);
        if (!this.container) return;

        // Clear previous
        this.container.innerHTML = '';

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (width === 0 || height === 0) {
            // Retry if not rendered yet
            setTimeout(() => this.init(), 100);
            return;
        }

        this.initialized = true;

        this.svg = d3.select(this.container).append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        this.simulation = d3.forceSimulation(this.data.nodes)
            .force("link", d3.forceLink(this.data.links).id(d => d.id).distance(50))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(d => d.size + 10).iterations(2));

        const graphRoot = this.svg.append("g");
        const link = graphRoot.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(this.data.links)
            .join("line")
            .attr("stroke-width", 1.5);

        const node = graphRoot.append("g")
            .selectAll("g")
            .data(this.data.nodes)
            .join("g")
            .call(this.drag(this.simulation));

        // Node circles
        node.append("circle")
            .attr("r", d => d.size)
            .attr("fill", d => this.colors[d.group])
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("style", "cursor: pointer;");

        // Labels
        node.append("text")
            .attr("x", 0)
            .attr("y", d => d.size + 12)
            .attr("text-anchor", "middle")
            .text(d => d.id)
            .style("font-size", "10px")
            .style("fill", "var(--text, #171719)")
            .style("font-family", "inherit")
            .style("pointer-events", "none")
            .style("text-shadow", "none");

        this.simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        if (this.motion.matches) {
            this.simulation.stop();
            this.simulation.tick(120);
            link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        }
        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                graphRoot.attr("transform", event.transform);
            });

        this.svg.call(zoom);
    }

    resize() {
        if (!this.svg) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.svg.attr("width", width).attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        this.simulation.force("center", d3.forceCenter(width / 2, height / 2));
        if (!this.motion.matches) this.simulation.alpha(0.3).restart();
    }

    drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}

// Initialize
new SkillsGraph();



const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let toastTimer;
function showToast(message, type = 'success') {
    const toast = document.getElementById('welcomeToast');
    toast.textContent = message;
    toast.dataset.state = type;
    toast.style.background = '';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
}
document.addEventListener('DOMContentLoaded', () => {
    const themeButton = document.getElementById('themeToggle');
    function updateThemeButton() {
        const dark = document.body.classList.contains('dark-mode');
        themeButton.setAttribute('aria-pressed', String(dark));
        themeButton.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
        themeButton.innerHTML = `<i class="fas fa-${dark ? 'sun' : 'moon'}" aria-hidden="true"></i>`;
    }
    updateThemeButton();
    themeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        try { localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); } catch {}
        updateThemeButton();
    });
    const systemTheme = matchMedia('(prefers-color-scheme: dark)');
    systemTheme.addEventListener('change', event => {
        try { if (localStorage.getItem('theme')) return; } catch {}
        document.body.classList.toggle('dark-mode', event.matches);
        updateThemeButton();
    });
    const menu = document.querySelector('.menu-button');
    const mobileNav = document.getElementById('mobile-nav');
    function closeMenu() {
        mobileNav.hidden = true;
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', 'Abrir navegación');
    }
    menu.addEventListener('click', () => {
        const open = menu.getAttribute('aria-expanded') !== 'true';
        menu.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
        mobileNav.hidden = !open;
    });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menu.focus(); } });

    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const stage = document.querySelector('.showcase-stage');
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    const wheel = document.createElement('div');
    wheel.className = 'preview-wheel';
    stage.append(wheel);
    panels.forEach(panel => wheel.append(panel));
    let wheelAnimation = null, orbitGeneration = 0, orbitRunning = false, queuedOrbit = null;
    function markOrbitTab(tab) {
        tabs.forEach(item => {
            const active = item === tab;
            item.setAttribute('aria-selected',String(active));
            item.tabIndex = active ? 0 : -1;
        });
        stage.dataset.scene = tab.dataset.tab;
    }
    function finishOrbit(tab = null) {
        const destination = tab || queuedOrbit?.tab || tabs.find(item => item.getAttribute('aria-selected') === 'true');
        queuedOrbit = null;
        orbitGeneration++;
        wheelAnimation?.cancel();
        wheelAnimation = null;
        orbitRunning = false;
        markOrbitTab(destination);
        panels.forEach((panel,index) => {
            const active = tabs[index] === destination;
            panel.hidden = !active;
            panel.inert = !active;
            panel.style.removeProperty('transform');
            panel.style.removeProperty('visibility');
            if (active) panel.removeAttribute('aria-hidden');
            else panel.setAttribute('aria-hidden','true');
        });
        stage.classList.remove('is-orbiting');
    }
    function selectTab(tab, focus = false, travel = 0) {
        if (focus) tab.focus();
        if (orbitRunning) { queuedOrbit = {tab,travel}; return; }
        const previousIndex = tabs.findIndex(item => item.getAttribute('aria-selected') === 'true');
        const nextIndex = tabs.indexOf(tab);
        if (nextIndex === previousIndex) return;
        if (motionPreference.matches || !wheel.animate) { finishOrbit(tab); return; }
        const outgoing = panels[previousIndex];
        const incoming = panels[nextIndex];
        const direction = travel || Math.sign(nextIndex-previousIndex);
        orbitRunning = true;
        stage.classList.add('is-orbiting');
        stage.style.setProperty('--scene-x','0px');
        stage.style.setProperty('--scene-y','0px');
        // Measure both groups in their resting layout, without flashing the next.
        incoming.style.visibility = 'hidden';
        incoming.hidden = false;
        const bounds = stage.getBoundingClientRect();
        const width = Math.max(1,bounds.width);
        const pivot = bounds.height*.5 + width*1.6;
        let halfWidth = width*.5, bottom = bounds.height;
        [outgoing,incoming].forEach(panel => panel.querySelectorAll('.floating-card').forEach(card => {
            const rect = card.getBoundingClientRect();
            halfWidth = Math.max(halfWidth,Math.abs(rect.left-bounds.left-width*.5),Math.abs(rect.right-bounds.left-width*.5));
            bottom = Math.max(bottom,rect.bottom-bounds.top);
        }));
        // Adjacent angular sectors share one wheel. The measured envelopes leave
        // only a card-sized gutter, while keeping the two groups from intersecting.
        const gap = width < 600 ? 24 : 36;
        const nearRadius = Math.max(160,pivot-bottom);
        const step = 2*Math.atan((halfWidth+gap*.5)/nearRadius)*180/Math.PI;
        wheel.style.setProperty('--orbit-pivot',`${pivot}px`);
        outgoing.style.transform = 'rotate(0deg)';
        incoming.style.transform = `rotate(${direction*step}deg)`;
        outgoing.inert = true;
        outgoing.setAttribute('aria-hidden','true');
        incoming.inert = false;
        incoming.removeAttribute('aria-hidden');
        incoming.style.removeProperty('visibility');
        markOrbitTab(tab);
        const generation = ++orbitGeneration;
        wheelAnimation = wheel.animate([
            {transform:'rotate(0deg)'},
            {transform:`rotate(${-direction*step}deg)`}
        ], {duration:1050,easing:'cubic-bezier(.35,0,.25,1)',fill:'both'});
        wheelAnimation.finished.then(() => {
            if (generation !== orbitGeneration) return;
            const queued = queuedOrbit;
            queuedOrbit = null;
            finishOrbit(tab);
            if (queued) selectTab(queued.tab,false,queued.travel);
        }).catch(() => { if (generation === orbitGeneration) finishOrbit(); });
    }
    tabs.forEach((tab,index) => {
        tab.addEventListener('click',() => selectTab(tab));
        tab.addEventListener('keydown',event => {
            let next, travel = 0;
            if (event.key === 'ArrowRight') { next=(index+1)%tabs.length; travel=1; }
            if (event.key === 'ArrowLeft') { next=(index+tabs.length-1)%tabs.length; travel=-1; }
            if (event.key === 'Home') next=0;
            if (event.key === 'End') next=tabs.length-1;
            if (next !== undefined) { event.preventDefault(); selectTab(tabs[next],true,travel); }
        });
    });
    // Horizontal touch gestures move the hero wheel; vertical page scroll stays native.
    let swipe=null,suppressClickUntil=0;
    stage.addEventListener('pointerdown',event=>{
        if(event.pointerType==='mouse'||!event.isPrimary||orbitRunning)return;
        swipe={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,dragging:false};
    });
    stage.addEventListener('pointermove',event=>{
        if(!swipe||event.pointerId!==swipe.id)return;
        const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;
        if(!swipe.dragging&&Math.abs(dy)>18&&Math.abs(dy)>Math.abs(dx)){swipe=null;return;}
        if(!swipe.dragging&&Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.2){swipe.dragging=true;stage.setPointerCapture(event.pointerId);stage.classList.add('is-swiping');}
        if(swipe.dragging){swipe.dx=dx;wheel.style.translate=`${Math.max(-120,Math.min(120,dx))}px 0`;if(event.cancelable)event.preventDefault();}
    },{passive:false});
    const endSwipe=(event,cancelled=false)=>{
        if(!swipe||event.pointerId!==swipe.id)return;
        const gesture=swipe;swipe=null;stage.classList.remove('is-swiping');wheel.style.removeProperty('translate');
        if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
        if(gesture.dragging)suppressClickUntil=performance.now()+500;
        if(!cancelled&&gesture.dragging&&Math.abs(gesture.dx)>45){const current=tabs.findIndex(t=>t.getAttribute('aria-selected')==='true');const direction=gesture.dx<0?1:-1;selectTab(tabs[(current+direction+tabs.length)%tabs.length],false,direction);}
    };
    stage.addEventListener('pointerup',event=>endSwipe(event));stage.addEventListener('pointercancel',event=>endSwipe(event,true));
    stage.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();}},{capture:true});
    motionPreference.addEventListener('change',() => { if (motionPreference.matches) finishOrbit(); });
    window.addEventListener('resize',() => finishOrbit(),{passive:true});
    document.addEventListener('visibilitychange',() => { if (document.hidden) finishOrbit(); });


    if ('IntersectionObserver' in window) {
        if (!motionPreference.matches) document.body.classList.add('motion-ready');
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {threshold: .08, rootMargin: '0px 0px -20px 0px'});
        document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
        const navObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const link = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
                if (link) {
                    if (entry.isIntersecting) link.setAttribute('aria-current', 'location');
                    else link.removeAttribute('aria-current');
                }
            });
        }, {rootMargin:'-15% 0px -55% 0px', threshold:0});
        document.querySelectorAll('main > section[id]').forEach(section => navObserver.observe(section));
    }
    motionPreference.addEventListener('change', () => {
        if (motionPreference.matches) document.body.classList.remove('motion-ready');
    });

    // Fine-pointer motion only; each element keeps one scheduled frame at a time.
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    function trackPointer(element, handler, reset) {
        let frame = 0, latest;
        element.addEventListener('pointermove', event => {
            if (motionPreference.matches || !finePointer.matches) return;
            latest = {x:event.clientX,y:event.clientY};
            if (!frame) frame = requestAnimationFrame(() => {
                frame = 0;
                const rect = element.getBoundingClientRect();
                if (rect.width && rect.height) handler((latest.x-rect.left)/rect.width, (latest.y-rect.top)/rect.height);
            });
        });
        element.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame = 0; reset(); });
    }
    document.querySelectorAll('.interactive-card').forEach(card => {
        trackPointer(card, (x,y) => {
            card.style.setProperty('--px', `${x*100}%`);
            card.style.setProperty('--py', `${y*100}%`);
            card.style.setProperty('--rx', `${(0.5-y)*3}deg`);
            card.style.setProperty('--ry', `${(x-0.5)*4}deg`);
        }, () => { card.style.setProperty('--rx','0deg'); card.style.setProperty('--ry','0deg'); });
    });
    trackPointer(stage, (x,y) => {
        if (stage.classList.contains('is-orbiting')) return;
        stage.style.setProperty('--scene-x', `${(x-.5)*14}px`);
        stage.style.setProperty('--scene-y', `${(y-.5)*10}px`);
    }, () => { stage.style.setProperty('--scene-x','0px'); stage.style.setProperty('--scene-y','0px'); });

    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('contact-feedback');
    let sending = false;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (sending || !form.reportValidity()) return;
        const payload = Object.fromEntries([...new FormData(form)].map(([key,value]) => [key,value.trim()]));
        if (!payload.name || !payload.message) {
            feedback.dataset.state = 'error';
            feedback.textContent = 'Completa tu nombre y mensaje.';
            return;
        }
        const submitButton = form.querySelector('[type="submit"]');
        sending = true;
        form.setAttribute('aria-busy','true');
        form.querySelectorAll('button').forEach(button => button.disabled = true);
        submitButton.textContent = 'Enviando…';
        feedback.textContent = '';
        try {
            const response = await fetch(`${App.pocketbase.getBaseUrl()}/api/collections/${App.pocketbase.collections.messages}/records`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload), signal:AbortSignal.timeout(20000)
            });
            if (!response.ok) throw new Error('send-failed');
            form.reset();
            feedback.dataset.state = 'success';
            feedback.textContent = 'Mensaje enviado. Te contactaré pronto.';
        } catch {
            feedback.dataset.state = 'error';
            feedback.textContent = 'No se pudo enviar. Intenta nuevamente o contáctame por WhatsApp.';
        } finally {
            sending = false;
            form.removeAttribute('aria-busy');
            form.querySelectorAll('button').forEach(button => button.disabled = false);
            submitButton.innerHTML = 'Enviar mensaje <span aria-hidden="true">→</span>';
        }
    });
    form.addEventListener('reset', () => { feedback.textContent = ''; delete feedback.dataset.state; });
});
