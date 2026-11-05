// Decorative backgrounds are independent of forms, navigation and application state.
(() => {
    function initializeAtmospheres() {
        const sections = [...document.querySelectorAll('.page-frame > section[id]')];
        if (!sections.length) return;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const pointer = matchMedia('(hover: hover) and (pointer: fine)');
        const pointerStates = [];
        const stopPointers = () => pointerStates.forEach(state => state.reset());
        const setPageVisibility = () => {
            document.body.classList.toggle('ambient-page-hidden', document.hidden);
            if (document.hidden) stopPointers();
        };
        setPageVisibility();
        document.addEventListener('visibilitychange', setPageVisibility);
        document.body.dataset.atmosphere = sections[0].id;
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    entry.target.classList.toggle('ambient-visible', entry.isIntersecting);
                    if (!entry.isIntersecting) pointerStates.find(state => state.section === entry.target)?.reset();
                });
            }, {rootMargin:'120px 0px',threshold:0});
            let atmosphereObserver, resizeFrame = 0;
            const observeReadingBand = () => {
                atmosphereObserver?.disconnect();
                const activeSections = new Set();
                const height = Math.max(1,window.innerHeight);
                // Pixel margins keep the reading band valid on wide, short viewports.
                atmosphereObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) activeSections.add(entry.target);
                        else activeSections.delete(entry.target);
                    });
                    const current = sections.filter(section => activeSections.has(section)).at(-1);
                    if (current) document.body.dataset.atmosphere = current.id;
                }, {rootMargin:`-${Math.round(height*.25)}px 0px -${Math.round(height*.65)}px 0px`,threshold:0});
                sections.forEach(section => atmosphereObserver.observe(section));
            };
            sections.forEach(section => animationObserver.observe(section));
            observeReadingBand();
            window.addEventListener('resize', () => {
                cancelAnimationFrame(resizeFrame);
                resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; observeReadingBand(); });
            }, {passive:true});
        }
        sections.forEach(section => {
            const layer = section.querySelector('.scene-atmosphere');
            if (!layer) return;
            let frame = 0, latest = null;
            const reset = () => {
                cancelAnimationFrame(frame);
                frame = 0;
                latest = null;
                section.classList.remove('ambient-pointer');
            };
            pointerStates.push({section,reset});
            section.addEventListener('pointermove', event => {
                if (reduced.matches || !pointer.matches || document.hidden) return;
                latest = {x:event.clientX,y:event.clientY};
                if (frame) return;
                frame = requestAnimationFrame(() => {
                    frame = 0;
                    if (!latest || reduced.matches || document.hidden) return;
                    const bounds = section.getBoundingClientRect();
                    if (!bounds.width || !bounds.height) return;
                    const x = Math.max(0,Math.min(100,(latest.x-bounds.left)/bounds.width*100));
                    const y = Math.max(0,Math.min(100,(latest.y-bounds.top)/bounds.height*100));
                    layer.style.setProperty('--ambient-x',`${x.toFixed(2)}%`);
                    layer.style.setProperty('--ambient-y',`${y.toFixed(2)}%`);
                    section.classList.add('ambient-pointer');
                });
            }, {passive:true});
            section.addEventListener('pointerleave',reset);
            section.addEventListener('pointercancel',reset);
        });
        reduced.addEventListener('change',stopPointers);
        pointer.addEventListener('change',stopPointers);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',initializeAtmospheres,{once:true});
    else initializeAtmospheres();
})();
