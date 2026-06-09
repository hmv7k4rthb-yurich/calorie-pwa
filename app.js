let currentDate = new Date().toISOString().slice(0, 10);

let data = JSON.parse(localStorage.getItem("calorieData") || "{}");
let settings = JSON.parse(localStorage.getItem("settings") || JSON.stringify({
  goal: 2500,
  proteinGoal: 180,
  waterGoal: 2.5
}));

function save() {
  localStorage.setItem("calorieData", JSON.stringify(data));
  localStorage.setItem("settings", JSON.stringify(settings));
}

function day() {
  if (!data[currentDate]) {
    data[currentDate] = { foods: [], water: 0 };
  }
  return data[currentDate];
}

function $(id) {
  return document.getElementById(id);
}

function renderApp() {
  document.body.innerHTML = `
    <h1>🍗 Калории Юрича 3.1</h1>

    <div class="card">
      <h2>📅 День</h2>
      <div class="row3">
        <button class="gray" onclick="changeDate(-1)">← Вчера</button>
        <button onclick="goToday()">Сегодня</button>
        <button class="gray" onclick="changeDate(1)">Завтра →</button>
      </div>
      <p class="big">${currentDate}</p>
    </div>

    <div class="card">
      <h2>🎯 Цель</h2>
      <div class="row">
        <input id="goal" type="number" value="${settings.goal}" placeholder="Ккал">
        <input id="proteinGoal" type="number" value="${settings.proteinGoal}" placeholder="Белок г">
      </div>
      <input id="waterGoal" type="number" value="${settings.waterGoal}" placeholder="Вода л">
      <button onclick="saveSettings()">Сохранить</button>
    </div>

    <div class="card">
      <h2>🔎 Поиск продукта</h2>
      <input id="search" placeholder="Например: курица, рис, творог..." oninput="searchFood()">
      <select id="category" onchange="searchFood()">
        <option value="">Все категории</option>
        ${[...new Set(FOODS.map(f => f[5]))].map(c => `<option>${c}</option>`).join("")}
      </select>
      <div id="results"></div>
    </div>

    <div class="card">
      <h2>➕ Добавить еду</h2>
      <input id="foodName" placeholder="Продукт">
      <div class="row">
        <input id="grams" type="number" placeholder="Граммы">
        <select id="meal">
          <option>Завтрак</option>
          <option>Обед</option>
          <option>Ужин</option>
          <option>Перекус</option>
        </select>
      </div>

      <div>
        <span class="pill" onclick="setGrams(50)">50г</span>
        <span class="pill" onclick="setGrams(100)">100г</span>
        <span class="pill" onclick="setGrams(150)">150г</span>
        <span class="pill" onclick="setGrams(200)">200г</span>
        <span class="pill" onclick="setGrams(300)">300г</span>
      </div>

      <div class="row">
        <input id="cal100" type="number" placeholder="Ккал/100г">
        <input id="p100" type="number" placeholder="Белки/100г">
      </div>
      <div class="row">
        <input id="f100" type="number" placeholder="Жиры/100г">
        <input id="c100" type="number" placeholder="Угли/100г">
      </div>

      <button onclick="addFood()">Добавить</button>
    </div>

    <div class="card">
      <h2>📊 Сегодня</h2>
      <div class="stats">
        <div class="stat"><div class="small">Калории</div><div class="big" id="totalCal">0</div></div>
        <div class="stat"><div class="small">Осталось</div><div class="big" id="leftCal">0</div></div>
        <div class="stat"><div class="small">Белки</div><div class="big" id="totalProtein">0г</div></div>
        <div class="stat"><div class="small">Вода</div><div class="big" id="water">0л</div></div>
      </div>
      <br>
      <div class="progress"><div id="bar" class="bar"></div></div>
      <p id="coach" class="small"></p>
      <button onclick="addWater()">+250 мл воды</button>
    </div>
<div class="card">
<h2>🏆 Рекорды</h2>

<input id="exercise" placeholder="Жим лёжа">
<input id="recordValue" type="number" placeholder="Вес или повторения">

<button onclick="saveRecordUI()">Сохранить рекорд</button>

<div id="recordsBox"></div>
</div>
    <div class="card">
      <h2>🍽️ Еда</h2>
      <div id="foodList"></div>
      <button class="red" onclick="clearDay()">Очистить день</button>
    </div>
  `;

  updateTotals();
  searchFood();
}

function saveSettings() {
  settings.goal = Number($("goal").value) || 2500;
  settings.proteinGoal = Number($("proteinGoal").value) || 180;
  settings.waterGoal = Number($("waterGoal").value) || 2.5;
  save();
  renderApp();
}

function searchFood() {
  const q = ($("search")?.value || "").toLowerCase();
  const cat = $("category")?.value || "";

  const found = FOODS
    .filter(f => f[0].toLowerCase().includes(q))
    .filter(f => !cat || f[5] === cat)
    .slice(0, 40);

  $("results").innerHTML = found.map(f => `
    <div class="result" onclick='selectFood(${JSON.stringify(f)})'>
      <b>${f[0]}</b><br>
      <span class="small">${f[5]} • ${f[1]} ккал • Б ${f[2]} / Ж ${f[3]} / У ${f[4]}</span>
    </div>
  `).join("");
}

function selectFood(f) {
  $("foodName").value = f[0];
  $("cal100").value = f[1];
  $("p100").value = f[2];
  $("f100").value = f[3];
  $("c100").value = f[4];
  $("search").value = f[0];
  $("results").innerHTML = "";
}

function setGrams(g) {
  $("grams").value = g;
}

function addFood() {
  const name = $("foodName").value.trim();
  const grams = Number($("grams").value);
  const cal100 = Number($("cal100").value);
  const p100 = Number($("p100").value);
  const f100 = Number($("f100").value);
  const c100 = Number($("c100").value);
  const meal = $("meal").value;

  if (!name || !grams || !cal100) {
    alert("Выбери продукт и введи граммы");
    return;
  }

  const item = {
    name,
    grams,
    meal,
    cal: Math.round(cal100 * grams / 100),
    p: Math.round(p100 * grams / 100),
    f: Math.round(f100 * grams / 100),
    c: Math.round(c100 * grams / 100)
  };

  day().foods.push(item);
  save();
  renderApp();
}

function deleteFood(index) {
  day().foods.splice(index, 1);
  save();
  renderApp();
}

function addWater() {
  day().water += 0.25;
  save();
  renderApp();
}

function clearDay() {
  if (!confirm("Снести весь день?")) return;
  data[currentDate] = { foods: [], water: 0 };
  save();
  renderApp();
}

function updateTotals() {
  const foods = day().foods;

  const totalCal = foods.reduce((s, f) => s + f.cal, 0);
  const totalP = foods.reduce((s, f) => s + f.p, 0);
  const totalF = foods.reduce((s, f) => s + f.f, 0);
  const totalC = foods.reduce((s, f) => s + f.c, 0);

  $("totalCal").innerText = totalCal;
  $("leftCal").innerText = settings.goal - totalCal;
  $("totalProtein").innerText = totalP + "г";
  $("water").innerText = day().water.toFixed(2) + "л";

  $("bar").style.width = Math.min(100, totalCal / settings.goal * 100) + "%";

  let advice = [];

  if (totalCal < settings.goal * 0.6) advice.push("Калорий пока мало, не строй из себя святого на воде.");
  if (totalCal > settings.goal) advice.push("Калории перелетели цель. Завтра аккуратнее, без пищевого цирка.");
  if (totalP < settings.proteinGoal * 0.7) advice.push("Белка маловато. Добавь мясо, творог, яйца или рыбу.");
  if (day().water < settings.waterGoal * 0.5) advice.push("Воды мало. Организм не токарный станок, на сухую плохо работает.");

  if (!advice.length) advice.push("День идёт нормально. Держи курс.");

  $("coach").innerHTML = advice.map(a => "🧠 " + a).join("<br>");

  const meals = ["Завтрак", "Обед", "Ужин", "Перекус"];

  $("foodList").innerHTML = meals.map(meal => {
    const mealFoods = foods
      .map((f, i) => ({...f, index: i}))
      .filter(f => f.meal === meal);

    return `
      <h3>${meal}</h3>
      ${mealFoods.length ? mealFoods.map(f => `
        <div class="food">
          <b>${f.name}</b><br>
          ${f.grams}г • ${f.cal} ккал<br>
          Б ${f.p} / Ж ${f.f} / У ${f.c}
          <button class="gray" onclick="deleteFood(${f.index})">Удалить</button>
        </div>
      `).join("") : `<p class="small">Пусто</p>`}
    `;
  }).join("");
}

function changeDate(days) {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + days);
  currentDate = d.toISOString().slice(0, 10);
  renderApp();
}

function goToday() {
  currentDate = new Date().toISOString().slice(0, 10);
  renderApp();
}

renderApp();
let records = JSON.parse(localStorage.getItem("records") || "[]");

function saveRecords(){
  localStorage.setItem("records", JSON.stringify(records));
}

function addRecord(exercise, value){
  records.push({
    date:new Date().toISOString().slice(0,10),
    exercise,
    value:Number(value)
  });

  saveRecords();
}

function getBestRecord(exercise){
  let arr = records.filter(x=>x.exercise===exercise);

  if(!arr.length) return 0;

  return Math.max(...arr.map(x=>x.value));
}
function saveRecordUI(){

  let ex = $("exercise").value.trim();
  let val = Number($("recordValue").value);

  if(!ex || !val){
    alert("Заполни упражнение и результат");
    return;
  }

  addRecord(ex,val);

  renderApp();
}
