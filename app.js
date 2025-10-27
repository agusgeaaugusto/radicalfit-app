// Radical•Fit — app logic
const DAYS_TOTAL = 15;
const storeKey = 'rf_progress_v1';
let planData = [];
let progress = JSON.parse(localStorage.getItem(storeKey) || '{}'); // {1:true,2:false,...}

function $(sel, ctx=document){ return ctx.querySelector(sel); }
function $all(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

async function loadData(){
  const res = await fetch('assets/plan.json');
  planData = await res.json();
}

function renderTabs(){
  $all('.tab').forEach(btn => {
    btn.addEventListener('click', ()=>{
      $all('.tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      $all('.tab-panel').forEach(p => p.classList.remove('active'));
      $('#tab-'+tab).classList.add('active');
      if(tab==='progreso') renderProgressList();
    });
  });
}

function dayCard(d){
  const day = planData.find(x=>x.dia===d);
  const isDone = !!progress[d];
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-header">
      <div><strong>Día ${d}</strong> • <span class="badge ${isDone?'done':''}">${day.fase}</span></div>
      <button class="secondary toggle">${isDone?'✔ Hecho':'Marcar hecho'}</button>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="img"><img alt="Plato" src="assets/img/${day.imagenes[0]}"></div>
        <div class="text">
          <strong>Comidas del día</strong>
          <div class="kit">
            ${day.comidas.slice(0,4).map(c=>`<div class="kit-item"><strong>•</strong> ${c}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="row">
        <div class="img"><img alt="Ejercicio" src="assets/img/${day.img_ej[0]}"></div>
        <div class="text">
          <strong>Entrenamiento</strong>
          <div class="kit">
            ${day.ejercicios.slice(0,3).map(e=>`<div class="kit-item"><strong>•</strong> ${e}</div>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="card-actions">
      <a class="secondary" download href="assets/img/${day.imagenes[0]}">📥 Plato</a>
      <a class="secondary" download href="assets/img/${day.img_ej[0]}">📥 Ejercicio</a>
      <button class="primary toggle">${isDone?'Desmarcar':'Marcar como hecho'}</button>
    </div>
  `;
  card.querySelectorAll('.toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      progress[d] = !progress[d];
      localStorage.setItem(storeKey, JSON.stringify(progress));
      updateProgress();
      card.replaceWith(dayCard(d));
    });
  });
  return card;
}

function renderDays(){
  const container = $('#daysContainer');
  container.innerHTML = '';
  for(let d=1; d<=DAYS_TOTAL; d++){
    container.appendChild(dayCard(d));
  }
}

function updateProgress(){
  const done = Object.values(progress).filter(Boolean).length;
  $('#progressBar').value = done;
  $('#progressPercent').textContent = Math.round(done/DAYS_TOTAL*100) + '%';
  $('#daysDone').textContent = done;
}

function renderProgressList(){
  const ul = $('#progressList');
  ul.innerHTML = '';
  for(let d=1; d<=DAYS_TOTAL; d++){
    const li = document.createElement('li');
    li.innerHTML = `<strong>Día ${d}</strong> — ${progress[d] ? '✔ Completo' : '⚪ Pendiente'}`;
    ul.appendChild(li);
  }
}

function bindReset(){
  $('#resetBtn').addEventListener('click', ()=>{
    if(confirm('¿Reiniciar tu progreso?')){
      progress = {};
      localStorage.setItem(storeKey, JSON.stringify(progress));
      renderDays();
      updateProgress();
    }
  });
}

function bindScrollTop(){
  $('#scrollTop').addEventListener('click', ()=>{
    window.scrollTo({top:0, behavior:'smooth'});
  });
}

// PWA basics
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./service-worker.js');
  });
}

(async function init(){
  renderTabs();
  bindReset();
  bindScrollTop();
  await loadData();
  renderDays();
  updateProgress();
})();
