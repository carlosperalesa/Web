// Case pages share navigation and theme controls without the home-page widgets.
(() => {
    const themeButton=document.getElementById('themeToggle');
    const updateThemeButton=()=>{
        const dark=document.body.classList.contains('dark-mode');
        themeButton.setAttribute('aria-pressed',String(dark));
        themeButton.setAttribute('aria-label',dark?'Activar modo claro':'Activar modo oscuro');
        themeButton.innerHTML=`<i class="fas fa-${dark?'sun':'moon'}" aria-hidden="true"></i>`;
    };
    updateThemeButton();
    themeButton.addEventListener('click',()=>{
        document.body.classList.toggle('dark-mode');
        try { localStorage.setItem('theme',document.body.classList.contains('dark-mode')?'dark':'light'); } catch {}
        updateThemeButton();
    });
    const systemTheme=matchMedia('(prefers-color-scheme: dark)');
    systemTheme.addEventListener('change',event=>{
        try { if(localStorage.getItem('theme'))return; } catch {}
        document.body.classList.toggle('dark-mode',event.matches);updateThemeButton();
    });
    const menu=document.querySelector('.menu-button');
    const nav=document.getElementById('mobile-nav');
    const closeMenu=()=>{nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir navegación');};
    menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar navegación':'Abrir navegación');nav.hidden=!open;});
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!nav.hidden){closeMenu();menu.focus();}});
})();
