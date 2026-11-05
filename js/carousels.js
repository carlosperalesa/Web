(() => {
    const setup = () => {
        const reduced = matchMedia('(prefers-reduced-motion: reduce)');
        const track = document.getElementById('project-track');
        const cards = [...track.querySelectorAll('.project-card')];
        const carousel = document.querySelector('.project-carousel');
        const count = document.getElementById('project-count');
        const progress = document.querySelector('.carousel-progress > span');
        cards.forEach((card,index) => card.dataset.projectOrder=index);
        let frame=0, lastTime=0, cooldownUntil=0, scrollFrame=0, autoCarry=0;
        let dragging=null, touching=false, keyboardFocus=false, suppressClick=false;
        const initialBounds=carousel.getBoundingClientRect();
        let visible=initialBounds.bottom>0 && initialBounds.top<window.innerHeight;
        let gap=parseFloat(getComputedStyle(track).columnGap) || 18;
        const stride=card => card.offsetWidth+gap;
        const syncIndex = () => {
            const left=track.getBoundingClientRect().left;
            let nearest=track.firstElementChild, distance=Infinity;
            cards.forEach(card => {
                const delta=Math.abs(card.getBoundingClientRect().left-left-4);
                if (delta<distance) { distance=delta; nearest=card; }
            });
            const index=Number(nearest.dataset.projectOrder);
            count.textContent=`${String(index+1).padStart(2,'0')} / ${cards.length}`;
            progress.style.width=`${(index+1)/cards.length*100}%`;
        };
        // Reuse the same elements, preserving every real link and its handlers.
        const normalize = () => {
            if (track.scrollWidth<=track.clientWidth+1) return;
            let shifted=0;
            while (shifted++<cards.length && track.scrollLeft>=stride(track.firstElementChild)) {
                const first=track.firstElementChild, step=stride(first), left=track.scrollLeft;
                track.append(first);
                track.scrollLeft=left-step;
            }
        };
        const shift = delta => {
            if (track.scrollWidth<=track.clientWidth+1) return;
            let shifted=0;
            while (delta+track.scrollLeft<0 && shifted++<cards.length) {
                const last=track.lastElementChild, step=stride(last), left=track.scrollLeft;
                track.prepend(last);
                track.scrollLeft=left+step;
            }
            track.scrollLeft+=delta;
            normalize();
            syncIndex();
        };
        const stop = () => { cancelAnimationFrame(frame); frame=0; lastTime=0; };
        const canRun = () => visible && !document.hidden && !reduced.matches && !dragging && !touching && !keyboardFocus;
        const tick = time => {
            frame=0;
            if (!canRun()) { lastTime=0; return; }
            const elapsed=lastTime ? Math.min(64,time-lastTime) : 0;
            lastTime=time;
            if (time>=cooldownUntil && elapsed) {
                // Retain fractional travel on high-refresh displays, including
                // browsers that round scrollLeft assignments to whole pixels.
                autoCarry+=elapsed*.034;
                const pixels=Math.floor(autoCarry);
                if (pixels) { autoCarry-=pixels; shift(pixels); }
            }
            frame=requestAnimationFrame(tick);
        };
        const resume = () => {
            if (!canRun()) { stop(); return; }
            if (!frame) { lastTime=0; frame=requestAnimationFrame(tick); }
        };
        const rest = (duration=1800) => { cooldownUntil=performance.now()+duration; };
        track.addEventListener('scroll',() => {
            if (!scrollFrame) scrollFrame=requestAnimationFrame(() => {
                scrollFrame=0;
                if (!touching && !dragging) normalize();
                syncIndex();
            });
        },{passive:true});
        track.addEventListener('wheel',event => {
            if (event.ctrlKey || track.scrollWidth<=track.clientWidth+1) return;
            const delta=(Math.abs(event.deltaX)>Math.abs(event.deltaY) ? event.deltaX : event.deltaY)
                *(event.deltaMode===1 ? 16 : event.deltaMode===2 ? track.clientWidth : 1);
            if (!delta) return;
            event.preventDefault(); rest(); shift(delta); resume();
        },{passive:false});
        track.addEventListener('keydown',event => {
            if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
            event.preventDefault(); keyboardFocus=true; stop();
            let target;
            if (event.key==='Home') target=cards[0];
            else if (event.key==='End') target=cards.at(-1);
            else {
                const current=cards.findIndex(card=>card===document.activeElement);
                const index=current<0 ? Number(track.firstElementChild.dataset.projectOrder) : current;
                target=cards[(index+(event.key==='ArrowLeft' ? -1 : 1)+cards.length)%cards.length];
            }
            // Rotate the existing DOM order until the chosen link is at the start.
            for (let i=0;i<cards.length && track.firstElementChild!==target;i++) track.append(track.firstElementChild);
            track.scrollLeft=0;
            target.focus({preventScroll:true}); syncIndex();
        });
        track.addEventListener('pointerdown',event => {
            keyboardFocus=false; suppressClick=false; rest(); stop();
            if (event.pointerType!=='mouse') { touching=true; return; }
            if (event.button===0) dragging={x:event.clientX,id:event.pointerId,moved:false};
        });
        track.addEventListener('dragstart',event=>event.preventDefault());
        track.addEventListener('pointermove',event => {
            if (!dragging) return;
            const delta=event.clientX-dragging.x;
            if (!dragging.moved && Math.abs(delta)>7) {
                dragging.moved=true; suppressClick=true;
                track.setPointerCapture(dragging.id); track.classList.add('is-dragging');
            }
            if (dragging.moved) { event.preventDefault(); shift(-delta); dragging.x=event.clientX; }
        });
        const endDrag = () => {
            const finished=dragging; dragging=null; touching=false;
            if (finished && track.hasPointerCapture(finished.id)) track.releasePointerCapture(finished.id);
            track.classList.remove('is-dragging'); normalize(); syncIndex(); rest(); resume();
        };
        track.addEventListener('pointerup',endDrag);
        track.addEventListener('pointercancel',endDrag);
        track.addEventListener('lostpointercapture',() => { if (dragging) endDrag(); });
        track.addEventListener('pointerleave',() => { if (dragging && !dragging.moved) endDrag(); });
        track.addEventListener('click',event => {
            if (!suppressClick) return;
            suppressClick=false;
            if (event.detail===0) return;
            event.preventDefault(); event.stopImmediatePropagation();
        },true);
        carousel.addEventListener('focusin',event => { keyboardFocus=event.target.matches(':focus-visible'); resume(); });
        carousel.addEventListener('focusout',event => {
            keyboardFocus=!!event.relatedTarget && carousel.contains(event.relatedTarget) && event.relatedTarget.matches(':focus-visible');
            rest(); resume();
        });
        document.addEventListener('pointerdown',event => {
            if (!carousel.contains(event.target)) { keyboardFocus=false; resume(); }
        },{passive:true});
        document.addEventListener('visibilitychange',resume);
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => { visible=entries.some(entry=>entry.isIntersecting); resume(); },{threshold:0}).observe(carousel);
        }
        reduced.addEventListener('change',resume);
        new ResizeObserver(() => { gap=parseFloat(getComputedStyle(track).columnGap)||18; normalize(); syncIndex(); resume(); }).observe(track);
        syncIndex(); resume();


        const marquee = document.querySelector('.stack-marquee');
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
