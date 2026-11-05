/* Only the static UI needs initialization; no WordPress backend is emulated. */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.e-con.e-parent').forEach(section => section.classList.add('e-lazyloaded'));
    const header = document.getElementById('masthead');
    const toggle = header?.querySelector('.hfe-nav-menu__toggle');
    const nav = header?.querySelector('nav');
    if (toggle && nav) {
        nav.id ||= 'tnsp-navigation';
        toggle.setAttribute('aria-controls', nav.id);
        function setOpen(open) {
            header.classList.toggle('tnsp-menu-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        }
        toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
        toggle.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle.click(); }
        });
        nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
        });
        document.addEventListener('click', event => { if (!header.contains(event.target)) setOpen(false); });
        matchMedia('(min-width:1000px)').addEventListener('change', () => setOpen(false));
    }
    // Use the same YouTube IDs already stored in the archived widget settings.
    document.querySelectorAll('[data-widget_type="video.default"]').forEach(widget => {
        if (widget.querySelector('iframe')) return;
        let settings;
        try { settings = JSON.parse(widget.dataset.settings || '{}'); } catch { return; }
        if (!settings.youtube_url) return;
        let url;
        try { url = new URL(settings.youtube_url); } catch { return; }
        const id = url.hostname === 'youtu.be' ? url.pathname.slice(1).split('/')[0] : url.searchParams.get('v');
        if (!/^[\w-]{11}$/.test(id || '')) return;
        const frame = document.createElement('iframe');
        frame.className = 'elementor-video';
        frame.src = `https://www.youtube-nocookie.com/embed/${id}`;
        frame.loading = 'lazy';
        frame.title = widget.getAttribute('aria-label') || 'Video de Las Triple Negativas Siempre Positivas';
        frame.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        const container = widget.querySelector('.elementor-wrapper') || widget.querySelector('.elementor-widget-container') || widget;
        container.append(frame);
        widget.classList.add('tnsp-video-ready');
    });
    const backToTop = document.querySelector('.ct-back-to-top');
    if (backToTop) {
        const update = () => { backToTop.hidden = scrollY < 500; };
        window.addEventListener('scroll', update, {passive:true});
        update();
    }
});
