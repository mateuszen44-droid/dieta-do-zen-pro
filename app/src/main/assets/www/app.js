const STORAGE_MEALS = "dzpro_meals";
const STORAGE_GOAL = "dzpro_goal";

let meals = JSON.parse(localStorage.getItem(STORAGE_MEALS) || "[]");
let goal = parseInt(localStorage.getItem(STORAGE_GOAL) || "2000", 10);

function $(id){ return document.getElementById(id); }

function saveState(){
  localStorage.setItem(STORAGE_MEALS, JSON.stringify(meals));
  localStorage.setItem(STORAGE_GOAL, String(goal));
}

function populateFoods(){
  const select = $("presetFood");
  if(!select) return;
  select.innerHTML = '<option value="">Selecione um alimento</option>';
  foods.forEach(food => {
    const option = document.createElement("option");
    option.value = JSON.stringify(food);
    option.textContent = `${food.name} - ${food.calories} kcal`;
    select.appendChild(option);
  });
  select.addEventListener("change", () => {
    if(!select.value) return;
    const item = JSON.parse(select.value);
    $("foodName").value = item.name;
    $("foodCalories").value = item.calories;
  });
}

function renderMeals(){
  const list = $("mealList");
  list.innerHTML = "";
  let total = 0;
  let max = 0;

  meals.forEach(meal => {
    total += meal.calories;
    if(meal.calories > max) max = meal.calories;
    const li = document.createElement("li");
    li.innerHTML = `<span>${meal.name}</span><strong>${meal.calories} kcal</strong>`;
    list.appendChild(li);
  });

  const remaining = Math.max(goal - total, 0);
  const progress = goal > 0 ? Math.min((total/goal) * 100, 100) : 0;

  $("totalCalories").textContent = total;
  $("goalCalories").textContent = goal + " kcal";
  $("remainingCalories").textContent = remaining + " kcal";
  $("ringValue").textContent = Math.round(progress) + "%";
  $("progressBar").style.width = progress + "%";

  $("mealCount").textContent = meals.length;
  $("avgCalories").textContent = meals.length ? Math.round(total / meals.length) + " kcal" : "0 kcal";
  $("maxCalories").textContent = max + " kcal";
  $("statsTotal").textContent = total + " kcal";
  $("statsGoal").textContent = goal + " kcal";
  $("goalInput").value = goal;
  $("emptyMeals").style.display = meals.length ? "none" : "block";

  drawChart();
}

function addMeal(){
  const name = $("foodName").value.trim();
  const calories = parseInt($("foodCalories").value, 10);
  if(!name || Number.isNaN(calories) || calories <= 0){
    alert("Preencha nome e calorias corretamente.");
    return;
  }
  meals.push({name, calories});
  saveState();
  $("foodName").value = "";
  $("foodCalories").value = "";
  $("presetFood").value = "";
  renderMeals();
  showHome();
}

function saveGoal(){
  const value = parseInt($("goalInput").value, 10);
  if(Number.isNaN(value) || value <= 0){
    alert("Digite uma meta válida.");
    return;
  }
  goal = value;
  saveState();
  renderMeals();
  showHome();
}

function clearDay(){
  meals = [];
  saveState();
  renderMeals();
  showHome();
}

function hideTabs(){
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
}

function showHome(){
  hideTabs();
  $("tab-home").classList.add("active");
  document.querySelector('[data-home="1"]').classList.add("active");
}

function openTab(name){
  hideTabs();
  const el = $("tab-" + name);
  if(el) el.classList.add("active");
  const nav = document.querySelector(`.nav-btn[data-tab="${name}"]`);
  if(nav) nav.classList.add("active");
}

function drawChart(){
  const canvas = $("statsCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = "#132119";
  ctx.fillRect(0,0,w,h);

  const values = meals.length ? meals.map(m => m.calories) : [0];
  const maxVal = Math.max(...values, goal, 100);

  const padding = 24;
  const usableW = w - padding * 2;
  const usableH = h - padding * 2;
  const barW = usableW / values.length * 0.6;
  const gap = usableW / values.length * 0.4;

  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.beginPath();
  ctx.moveTo(padding, h-padding);
  ctx.lineTo(w-padding, h-padding);
  ctx.stroke();

  values.forEach((v, i) => {
    const x = padding + i * (barW + gap) + gap/2;
    const barH = (v / maxVal) * usableH;
    const y = h - padding - barH;
    ctx.fillStyle = "#35c46d";
    ctx.fillRect(x, y, barW, barH);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateFoods();
  renderMeals();

  document.querySelectorAll(".action-card").forEach(btn => {
    btn.addEventListener("click", () => openTab(btn.dataset.tab));
  });

  document.querySelectorAll(".nav-btn").forEach(btn => {
    if(btn.dataset.home){
      btn.addEventListener("click", showHome);
    } else {
      btn.addEventListener("click", () => openTab(btn.dataset.tab));
    }
  });

  $("saveFood").addEventListener("click", addMeal);
  $("saveGoal").addEventListener("click", saveGoal);
  $("clearDay").addEventListener("click", clearDay);
  showHome();
});
