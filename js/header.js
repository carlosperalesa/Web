// Scroll only controls the progressive blur; the header always stays light.
(() => {
    const setup = () => {
        const header=document.querySelector('.site-header');
        if (!header) return;
        const updateScroll = () => { header.dataset.scrolled=String(window.scrollY>8); };
        updateScroll();
        window.addEventListener('scroll',updateScroll,{passive:true});
    };
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup,{once:true});
    else setup();
})();
