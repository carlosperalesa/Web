(() => {
 const setup=()=>{
  const exhibit=document.getElementById('museum-exhibit');if(!exhibit)return;
  const versions={
   '1':{chapter:'EL PUNTO DE PARTIDA',title:'Organizar antes de diseñar.',description:'La primera versión reúne contenido profesional, proyectos y certificados. Un punto de partida para trabajar la jerarquía de la información y las primeras interacciones.'},
   '2':{chapter:'EXPLORAR NUEVAS FORMAS',title:'Probar otras formas de contar.',description:'Tarjetas que se transforman, capas y movimiento. Esta versión explora cómo presentar la misma información con una navegación más visual y nuevas interacciones.'},
   '3':{chapter:'LA WEB COMO EXPERIENCIA',title:'Construir una experiencia completa.',description:'El portafolio se convierte en un escritorio: ventanas, accesos y un grafo de habilidades. Una exploración de interfaces que conecta diseño, interacción y desarrollo.'}
  };
  const buttons=[...exhibit.querySelectorAll('[data-version]')];
  const image=document.getElementById('museum-image'),action=document.getElementById('museum-preview-action'),explore=document.getElementById('museum-explore'),stop=document.getElementById('museum-stop'),stage=document.getElementById('museum-stage'),status=document.getElementById('museum-load-status'),mode=document.getElementById('museum-mode'),open=document.getElementById('museum-open');
  const root=exhibit.dataset.root||'.';
  let selected='1',frame=null;
  const closePreview=()=>{if(frame){frame.remove();frame=null;}image.hidden=false;action.hidden=false;status.hidden=true;stop.hidden=true;mode.textContent='VISTA PREVIA';};
  const select=version=>{
   if(!versions[version])return;closePreview();selected=version;const data=versions[version];
   buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.version===version)));
   image.src=`${root}/img/historial/v${version}.webp`;image.alt=`Vista previa de la versión ${version} del portafolio`;
   document.getElementById('museum-address').textContent=`archivo / versión 0${version}`;
   document.getElementById('museum-chapter').textContent=`0${version} / ${data.chapter}`;
   document.getElementById('museum-version-title').textContent=data.title;
   document.getElementById('museum-description').textContent=data.description;
   explore.innerHTML=`Explorar V${version} <span aria-hidden="true">&#8594;</span>`;
   open.href=`${root}/historial/indexV${version}.html`;open.innerHTML=`Abrir V${version} en otra pestaña <span aria-hidden="true">&#8599;</span>`;
  };
  buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.version)));
  explore.addEventListener('click',()=>{
   if(frame)return;frame=document.createElement('iframe');frame.title=`Versión ${selected} interactiva del portafolio`;
   frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
   frame.addEventListener('load',()=>{status.hidden=true;mode.textContent='VERSIÓN INTERACTIVA';},{once:true});
   frame.src=`${root}/historial/indexV${selected}.html`;action.hidden=true;image.hidden=true;status.hidden=false;stop.hidden=false;mode.textContent='CARGANDO';stage.append(frame);stop.focus();
  });
  stop.addEventListener('click',()=>{closePreview();explore.focus();});
  exhibit.addEventListener('keydown',event=>{if(event.key==='Escape'&&frame){closePreview();explore.focus();}});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
