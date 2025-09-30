// script.js

// ------- Selektörler -------
const form = document.getElementById("form");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const clearBtn = document.getElementById("clear");
const doneList = document.getElementById("doneList") || null;
const clearDoneBtn = document.getElementById("clearDone") || null;

//localStorage
const STORAGE_KEY = "tasks";
let tasks = loadTasks();
render();

// Eventler
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(taskInput.value);
});

clearBtn.addEventListener("click", () => {
  if (tasks.length === 0) return;
  if (confirm("Tüm görevler silinsin mi?")) {
    tasks = [];
    saveTasks();
    render();
  }
});

taskList.addEventListener("click", (e) => {
  const li = e.target.closest("li[data-id]");
  if (!li) return;
  const id = li.dataset.id;

  // Sil
  if (e.target.matches(".delete")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
    return;
  }

  // Tamamla
  if (e.target.matches(".complete")) {
    const t = tasks.find((t) => t.id === id);
    if (t) {
      t.done = true;
      saveTasks();
      render();
    }
  }
});

// Metin düzenleme 
taskList.addEventListener("dblclick", (e) => {
  const textEl = e.target.closest(".text");
  if (!textEl) return;

  const li = textEl.closest("li[data-id]");
  const id = li.dataset.id;
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = task.text;
  input.className = "editInput";
  textEl.replaceWith(input);
  input.focus();
  const v = input.value; input.value = ""; input.value = v;

  const commit = () => {
    const newVal = input.value.trim();
    task.text = newVal || task.text;
    saveTasks();
    render();
  };

  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") commit();
    if (ev.key === "Escape") render();
  });
});

// Yaptıklarım kısmındaki olaylar
if (clearDoneBtn) {
  clearDoneBtn.addEventListener("click", () => {
    if (!tasks.some(t => t.done)) return;
    if (confirm("Tüm tamamlanan görevler silinsin mi?")) {
      tasks = tasks.filter(t => !t.done);
      saveTasks();
      render();
    }
  });
}

if (doneList) {
  doneList.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-id]");
    if (!li) return;
    const id = li.dataset.id;
    const t = tasks.find((x) => x.id === id);
    if (!t) return;

    // Sil
    if (e.target.matches(".delete")) {
      tasks = tasks.filter((x) => x.id !== id);
      saveTasks();
      render();
      return;
    }

    // Geri al
    if (e.target.matches(".undo")) {
      t.done = false;
      saveTasks();
      render();
    }
  });
}

// Fonksiyonlar
function addTask(text) {
  const value = String(text ?? "").trim();
  if (!value) {
    taskInput.focus();
    return;
  }
  const task = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    text: value,
    done: false,
  };
  tasks.unshift(task);
  saveTasks();
  render();
  form.reset();
  taskInput.focus();
}

function render() {
  taskList.innerHTML = "";
  if (doneList) doneList.innerHTML = "";

  const pending = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  //Bekleyenler
  if (pending.length === 0) {
    taskList.innerHTML = `<li class="empty">Bekleyen görev yok.</li>`;
  } else {
    const frag = document.createDocumentFragment();
    pending.forEach((t) => frag.appendChild(renderItem(t, false)));
    taskList.appendChild(frag);
  }

  //tamamlananrlr
  if (doneList) {
    if (completed.length === 0) {
      doneList.innerHTML = `<li class="empty">Henüz tamamlanan görev yok.</li>`;
    } else {
      const fragDone = document.createDocumentFragment();
      completed.forEach((t) => fragDone.appendChild(renderItem(t, true)));
      doneList.appendChild(fragDone);
    }
  }
}

function renderItem(t, isDoneList) {
  const li = document.createElement("li");
  li.dataset.id = t.id;
  li.className = t.done ? "task done" : "task";

  const actionsHtml = isDoneList
    ? `<button class="btn undo" aria-label="Geri Al">↩️</button>
       <button class="btn delete" aria-label="Sil">🗑️</button>`
    : `<button class="btn complete" aria-label="Tamamla">✅</button>
       <button class="btn delete" aria-label="Sil">🗑️</button>`;

  li.innerHTML = `
    <span class="text">${escapeHtml(t.text)}</span>
    <div class="actions">${actionsHtml}</div>
  `;
  return li;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
