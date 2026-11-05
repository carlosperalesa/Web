(() => {
    const setup = () => {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const marquee = document.querySelector('.stack-marquee');
        if (!marquee) return;
        const group = marquee.querySelector('.stack-group');
        const conveyor = marquee.querySelector('.stack-track');
        const originalLogos = [...group.querySelectorAll('.tech-logo')];
        const clone = group.cloneNode(true);
        clone.setAttribute('aria-hidden','true');
        // The duplicate stays out of the accessibility tree, but must receive
        // pointer hover. Nonfocusable visual copies forward clicks to real links.
        clone.querySelectorAll('a').forEach((link,index) => {
            const visual = document.createElement('span');
            visual.className = link.className;
            visual.innerHTML = link.innerHTML;
            visual.addEventListener('click',() => originalLogos[index].click());
            link.replaceWith(visual);
        });
        conveyor.append(clone);
        marquee.classList.add('ticker-ready');
        marquee.addEventListener('wheel',event => {
            if (event.ctrlKey) return;
            const delta = (Math.abs(event.deltaX)>Math.abs(event.deltaY) ? event.deltaX : event.deltaY)
                * (event.deltaMode===1 ? 16 : event.deltaMode===2 ? marquee.clientWidth : 1);
            if (!delta) return;
            const animation = conveyor.getAnimations().find(item => item.animationName==='stackConveyor');
            const cycleWidth = group.getBoundingClientRect().width;
            if (animation && cycleWidth>0) {
                const duration = Number(animation.effect.getTiming().duration);
                if (!duration) return;
                event.preventDefault();
                // The automatic direction is reversed; wheel-down travels left.
                const time = Number(animation.currentTime)||0;
                animation.currentTime = ((time-delta*duration/cycleWidth)%duration+duration)%duration;
            } else if (marquee.scrollWidth>marquee.clientWidth) {
                // Reduced-motion mode keeps a native, manually scrollable strip.
                const max=marquee.scrollWidth-marquee.clientWidth;
                if ((delta<0 && marquee.scrollLeft<=0) || (delta>0 && marquee.scrollLeft>=max)) return;
                event.preventDefault();
                marquee.scrollLeft=Math.max(0,Math.min(max,marquee.scrollLeft+delta));
            }
        },{passive:false});

        const toggle = document.getElementById('stack-motion-toggle');
        let tickerPaused = reduced.matches;
        const updateTicker = () => {
            marquee.classList.toggle('ticker-paused',tickerPaused || reduced.matches);
            toggle.disabled=reduced.matches;
            toggle.setAttribute('aria-pressed',String(!tickerPaused && !reduced.matches));
            toggle.innerHTML=`<i class="fas fa-${tickerPaused ? 'play' : 'pause'}" aria-hidden="true"></i> ${tickerPaused ? 'Animar logos' : 'Pausar logos'}`;
        };
        toggle.addEventListener('click',() => { tickerPaused=!tickerPaused; updateTicker(); });
        reduced.addEventListener('change',() => { if (reduced.matches) tickerPaused=true; updateTicker(); });
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => marquee.classList.toggle('ticker-visible',entries[0].isIntersecting),{threshold:.1}).observe(marquee);
        }
        updateTicker();
    };
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup,{once:true});
    else setup();
})();
