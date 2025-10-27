const DAYS_TOTAL = 15;
const storeKey = 'rf_fresh_v1';
let planData = [];
let progress = JSON.parse(localStorage.getItem(storeKey) || '{}');

const $ = (s, c=document)=>c.querySelector(s);
const $$ = (s, c=document)=>Array.from(c.querySelectorAll(s));

async function loadData(){ const r = await fetch('assets/plan.json'); planData = await r.json(); }

function renderTabs(){
  $$('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      $$('.tab-panel').forEach(p=>p.classList.remove('active'));
      $('#tab-'+tab).classList.add('active');
      if(tab==='progreso') renderProgressList();
    });
  });
  // bottom bar sync
  $$('.tabbar-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.tabbar-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`.tab[data-tab="${btn.dataset.tab}"]`).click();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
}

function mealCard(m){
  return `<div class="mini-card">
    <img src="assets/img/${m.img}" alt="${m.titulo}">
    <div class="mini-content">
      <div class="mini-top"><span class="chip">${m.titulo}</span><span class="chip time">${m.hora}</span></div>
      <div class="mini-desc">${m.detalle}</div>
    </div>
  </div>`;
}
function moveCard(m){
  return `<div class="mini-card">
    <img src="assets/img/${m.img}" alt="${m.titulo}">
    <div class="mini-content">
      <div class="mini-top"><span class="chip">${m.titulo}</span></div>
      <div class="mini-desc">${m.detalle}</div>
    </div>
  </div>`;
}

function dayCard(d){
  const day = planData.find(x=>x.dia===d);
  const isDone = !!progress[d];
  const el = document.createElement('article'); el.className='card';
  el.innerHTML = `
    <div class="card-header">
      <div><strong>Día ${d}</strong> • <span class="badge ${isDone?'done':''}">${day.fase}</span></div>
      <button class="secondary toggle">${isDone?'✔ Hecho':'Marcar hecho'}</button>
    </div>
    <div class="card-body">
      <h3 class="section-title">🍽️ Comidas</h3>
      <div class="grid mini-grid">${day.comidas.map(mealCard).join('')}</div>
      <h3 class="section-title">🏋️ Entrenamiento</h3>
      <div class="grid mini-grid">${day.ejercicios.map(moveCard).join('')}</div>
    </div>
    <div class="card-actions">
      <button class="primary toggle">${isDone?'Desmarcar':'Marcar como hecho'}</button>
    </div>`;
  el.querySelectorAll('.toggle').forEach(b=>{
    b.addEventListener('click', ()=>{
      progress[d] = !progress[d];
      localStorage.setItem(storeKey, JSON.stringify(progress));
      updateProgress();
      el.replaceWith(dayCard(d));
    });
  });
  return el;
}

function renderDays(){
  const c = $('#daysContainer'); c.innerHTML='';
  for(let d=1; d<=DAYS_TOTAL; d++){ c.appendChild(dayCard(d)); }
}
function updateProgress(){
  const done = Object.values(progress).filter(Boolean).length;
  $('#progressBar').value = done;
  $('#progressPercent').textContent = Math.round(done/DAYS_TOTAL*100)+'%';
  $('#daysDone').textContent = done;
}
function renderProgressList(){
  const ul = $('#progressList'); ul.innerHTML='';
  for(let d=1; d<=DAYS_TOTAL; d++){
    const li = document.createElement('li');
    li.innerHTML = `<strong>Día ${d}</strong> — ${progress[d]?'✔ Completo':'⚪ Pendiente'}`;
    ul.appendChild(li);
  }
}

function bindResetPin(){
  $('#resetPinBtn').addEventListener('click', ()=>{
    const pin = prompt('Ingresá el PIN para reiniciar (123):');
    if(pin==='123'){ localStorage.setItem(storeKey, '{}'); location.reload(); }
    else if(pin!==null){ alert('PIN incorrecto'); }
  });
}

if('serviceWorker' in navigator){ window.addEventListener('load', ()=> navigator.serviceWorker.register('./service-worker.js')); }

(async function init(){
  renderTabs(); bindResetPin();
  await loadData(); renderDays(); updateProgress();
})();