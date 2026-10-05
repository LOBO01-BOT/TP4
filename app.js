// app.js - TP N° 4: Conocimiento y Razonamiento
const TP_NUM = "4";

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupModals();
  setupInteractiveToggles();
  setupTruthTableToggles();
  setupSortableExercises();
  setupRadioCardClicks();
  setupListeners();
  restoreProgress();
  updateProgress();
});

// 1. Theme Configuration
function setupTheme() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (!toggleBtn) return;
  
  const isDark = localStorage.getItem("theme") === "dark" || 
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  
  toggleBtn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    if (document.documentElement.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
}

// 2. Modals (Git and Bibliografía)
function setupModals() {
  const btnBiblio = document.getElementById("btn-open-biblio-all");
  const modalBiblio = document.getElementById("modal-biblio");
  const closeBiblio = document.getElementById("close-modal-biblio");
  
  if (btnBiblio && modalBiblio && closeBiblio) {
    btnBiblio.addEventListener("click", () => modalBiblio.classList.remove("hidden"));
    closeBiblio.addEventListener("click", () => modalBiblio.classList.add("hidden"));
    modalBiblio.addEventListener("click", (e) => {
      if (e.target === modalBiblio) modalBiblio.classList.add("hidden");
    });
  }

  const btnGit = document.getElementById("btn-git-guide");
  const modalGit = document.getElementById("modal-git");
  const closeGit = document.getElementById("close-modal-git");

  if (btnGit && modalGit && closeGit) {
    btnGit.addEventListener("click", () => modalGit.classList.remove("hidden"));
    closeGit.addEventListener("click", () => modalGit.classList.add("hidden"));
    modalGit.addEventListener("click", (e) => {
      if (e.target === modalGit) modalGit.classList.add("hidden");
    });
  }
}

// 3. Interactive Segmented Button Groups (Ejercicio 3: Clasificación)
function setupInteractiveToggles() {
  document.querySelectorAll(".toggle-btn-group").forEach(group => {
    const hiddenInput = group.querySelector("input[type='hidden']");
    const buttons = group.querySelectorAll(".btn-toggle");
    
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (hiddenInput) {
          hiddenInput.value = btn.getAttribute("data-val") || "";
          hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });
  });
}

// 4. Interactive Truth Table Toggles (Ejercicio 4: Tabla de Verdad)
function setupTruthTableToggles() {
  document.querySelectorAll(".truth-toggle").forEach(toggle => {
    const parentTd = toggle.closest("td");
    const hiddenInput = parentTd ? parentTd.querySelector("input[type='hidden']") : null;
    const buttons = toggle.querySelectorAll(".truth-btn");
    
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-val");
        buttons.forEach(b => {
          b.classList.remove("active-v", "active-f");
        });
        
        if (val === "V") {
          btn.classList.add("active-v");
        } else if (val === "F") {
          btn.classList.add("active-f");
        }
        
        if (hiddenInput) {
          hiddenInput.value = val;
          hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });
  });
}

// 5. Radio Cards Interactive Support (Ejercicio 5)
function setupRadioCardClicks() {
  // Ensure clicking the card directly checks the radio if not clicking directly on the radio
  document.querySelectorAll(".radio-card").forEach(card => {
    const radio = card.querySelector("input[type='radio']");
    if (!radio) return;
    
    card.addEventListener("click", (e) => {
      if (e.target !== radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });
}

// 6. SortableJS Drag & Drop Setup (Ejercicios 6 y 9)
function setupSortableExercises() {
  if (typeof Sortable === "undefined") {
    console.warn("SortableJS no cargado. Funcionará en modo fallback con selects.");
    return;
  }

  // --- Ejercicio 6: Equivalencias Lógicas ---
  const lawsBank = document.getElementById("drag-laws-bank");
  const lawDropZones = document.querySelectorAll(".drop-zone[data-target]");
  
  if (lawsBank) {
    new Sortable(lawsBank, {
      group: "laws_group",
      animation: 180,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      onAdd: () => syncExercise6State()
    });
  }

  lawDropZones.forEach(zone => {
    new Sortable(zone, {
      group: "laws_group",
      animation: 180,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      max: 1,
      onAdd: (evt) => {
        // If there's already an item in this dropzone, move old item back to bank
        if (zone.children.length > 1) {
          const oldChip = evt.item === zone.children[0] ? zone.children[1] : zone.children[0];
          if (lawsBank && oldChip) lawsBank.appendChild(oldChip);
        }
        syncExercise6State();
      },
      onRemove: () => syncExercise6State()
    });
  });

  // Keep fallback selects in sync with drag and drop
  document.querySelectorAll(".law-select").forEach(sel => {
    sel.addEventListener("change", () => {
      const targetKey = sel.getAttribute("data-key");
      const chosenVal = sel.value;
      const zone = document.querySelector(`.drop-zone[data-target="${targetKey}"]`);
      if (zone && lawsBank) {
        const chip = document.querySelector(`.drag-chip[data-val="${chosenVal}"]`);
        if (chip) {
          // If another zone had this chip, empty it
          zone.innerHTML = "";
          zone.appendChild(chip);
        }
      }
      saveProgress();
      updateProgress();
    });
  });

  // --- Ejercicio 9: Clasificación Forward vs Backward ---
  const chainingBank = document.getElementById("drag-chaining-bank");
  const bucketForward = document.getElementById("bucket-forward");
  const bucketBackward = document.getElementById("bucket-backward");

  const chainingOptions = {
    group: "chaining_group",
    animation: 180,
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    onAdd: () => syncExercise9State(),
    onRemove: () => syncExercise9State()
  };

  if (chainingBank) new Sortable(chainingBank, chainingOptions);
  if (bucketForward) new Sortable(bucketForward, chainingOptions);
  if (bucketBackward) new Sortable(bucketBackward, chainingOptions);
}

function syncExercise6State() {
  document.querySelectorAll(".drop-zone[data-target]").forEach(zone => {
    const targetKey = zone.getAttribute("data-target");
    const select = document.querySelector(`.law-select[data-key="${targetKey}"]`);
    const chip = zone.querySelector(".drag-chip");
    
    if (chip && select) {
      const val = chip.getAttribute("data-val");
      select.value = val;
    } else if (select) {
      select.value = "";
    }
  });
  saveProgress();
  updateProgress();
}

function syncExercise9State() {
  const bucketForward = document.getElementById("bucket-forward");
  const bucketBackward = document.getElementById("bucket-backward");

  // Reset all 4 hidden inputs first
  document.querySelectorAll("input[data-ex='ej9_drag_comparativa']").forEach(input => {
    input.value = "";
  });

  if (bucketForward) {
    bucketForward.querySelectorAll(".drag-chip").forEach(chip => {
      const itemKey = chip.getAttribute("data-item");
      const hiddenInput = document.querySelector(`input[data-ex='ej9_drag_comparativa'][data-key='${itemKey}']`);
      if (hiddenInput) hiddenInput.value = "forward";
    });
  }

  if (bucketBackward) {
    bucketBackward.querySelectorAll(".drag-chip").forEach(chip => {
      const itemKey = chip.getAttribute("data-item");
      const hiddenInput = document.querySelector(`input[data-ex='ej9_drag_comparativa'][data-key='${itemKey}']`);
      if (hiddenInput) hiddenInput.value = "backward";
    });
  }

  saveProgress();
  updateProgress();
}

// 7. General Listeners for Selects, Inputs and Exports
function setupListeners() {
  const inputs = document.querySelectorAll("select[data-ex], input[type='radio'][data-ex], input[type='hidden'][data-ex], input[data-student]");
  inputs.forEach(el => {
    el.addEventListener("change", () => {
      saveProgress();
      updateProgress();
    });
  });

  const studentInputs = document.querySelectorAll("input[data-student]");
  studentInputs.forEach(el => {
    el.addEventListener("input", () => {
      saveProgress();
    });
  });

  const btnExport = document.getElementById("btn-export-json");
  if (btnExport) btnExport.addEventListener("click", exportJSON);
  
  const btnExportFooter = document.getElementById("btn-export-json-footer");
  if (btnExportFooter) btnExportFooter.addEventListener("click", exportJSON);
  
  const btnPreview = document.getElementById("btn-preview-json");
  if (btnPreview) btnPreview.addEventListener("click", togglePreview);
  
  const btnCopy = document.getElementById("btn-copy-json");
  if (btnCopy) btnCopy.addEventListener("click", copyJSON);
}

// 8. Answers Gathering
function getAnswers() {
  const answers = {};
  const elements = document.querySelectorAll("[data-ex]");
  
  elements.forEach(el => {
    const exId = el.getAttribute("data-ex");
    const key = el.getAttribute("data-key");
    if (!exId || !key) return;
    
    if (!answers[exId]) answers[exId] = {};
    
    if (el.tagName === "SELECT") {
      if (el.value) answers[exId][key] = el.value;
    } else if (el.tagName === "INPUT" && el.type === "radio") {
      if (el.checked) answers[exId][key] = el.value;
    } else if (el.tagName === "INPUT" && (el.type === "hidden" || el.type === "text")) {
      if (el.value) answers[exId][key] = el.value;
    }
  });
  
  const studentInfo = {};
  document.querySelectorAll("[data-student]").forEach(el => {
    studentInfo[el.getAttribute("data-student")] = el.value.trim();
  });
  
  return { answers, studentInfo };
}

// 9. LocalStorage Persistence
function saveProgress() {
  const data = getAnswers();
  localStorage.setItem(`tp${TP_NUM}_progress`, JSON.stringify(data));
}

function restoreProgress() {
  const saved = localStorage.getItem(`tp${TP_NUM}_progress`);
  if (!saved) return;
  
  try {
    const data = JSON.parse(saved);
    const answers = data.answers || {};
    
    // 1. Restore selects
    document.querySelectorAll("select[data-ex]").forEach(el => {
      const exId = el.getAttribute("data-ex");
      const key = el.getAttribute("data-key");
      if (answers[exId] && answers[exId][key]) {
        el.value = answers[exId][key];
      }
    });
    
    // 2. Restore radio buttons (Ejercicio 5)
    document.querySelectorAll("input[type='radio'][data-ex]").forEach(el => {
      const exId = el.getAttribute("data-ex");
      const key = el.getAttribute("data-key");
      if (answers[exId] && answers[exId][key] === el.value) {
        el.checked = true;
      }
    });

    // 3. Restore hidden inputs
    document.querySelectorAll("input[type='hidden'][data-ex]").forEach(el => {
      const exId = el.getAttribute("data-ex");
      const key = el.getAttribute("data-key");
      if (answers[exId] && answers[exId][key]) {
        el.value = answers[exId][key];
      }
    });

    // 4. Restore segmented toggles (Ejercicio 3)
    document.querySelectorAll(".toggle-btn-group").forEach(group => {
      const hiddenInput = group.querySelector("input[type='hidden']");
      if (hiddenInput && hiddenInput.value) {
        const matchingBtn = group.querySelector(`.btn-toggle[data-val="${hiddenInput.value}"]`);
        if (matchingBtn) {
          group.querySelectorAll(".btn-toggle").forEach(b => b.classList.remove("active"));
          matchingBtn.classList.add("active");
        }
      }
    });

    // 5. Restore truth table toggles (Ejercicio 4)
    document.querySelectorAll(".truth-toggle").forEach(toggle => {
      const parentTd = toggle.closest("td");
      const hiddenInput = parentTd ? parentTd.querySelector("input[type='hidden']") : null;
      if (hiddenInput && hiddenInput.value) {
        const matchingBtn = toggle.querySelector(`.truth-btn[data-val="${hiddenInput.value}"]`);
        if (matchingBtn) {
          toggle.querySelectorAll(".truth-btn").forEach(b => b.classList.remove("active-v", "active-f"));
          if (hiddenInput.value === "V") matchingBtn.classList.add("active-v");
          if (hiddenInput.value === "F") matchingBtn.classList.add("active-f");
        }
      }
    });

    // 6. Restore Drag & Drop Chips for Ejercicio 6
    if (answers["ej6_drag_equivalencias"]) {
      const lawsBank = document.getElementById("drag-laws-bank");
      Object.entries(answers["ej6_drag_equivalencias"]).forEach(([targetKey, val]) => {
        const zone = document.querySelector(`.drop-zone[data-target="${targetKey}"]`);
        const chip = document.querySelector(`.drag-chip[data-val="${val}"]`);
        if (zone && chip) {
          zone.appendChild(chip);
        }
      });
    }

    // 7. Restore Drag & Drop Chips for Ejercicio 9
    if (answers["ej9_drag_comparativa"]) {
      const bucketForward = document.getElementById("bucket-forward");
      const bucketBackward = document.getElementById("bucket-backward");
      
      Object.entries(answers["ej9_drag_comparativa"]).forEach(([itemKey, direction]) => {
        const chip = document.querySelector(`.drag-chip[data-item="${itemKey}"]`);
        if (!chip) return;
        if (direction === "forward" && bucketForward) {
          bucketForward.appendChild(chip);
        } else if (direction === "backward" && bucketBackward) {
          bucketBackward.appendChild(chip);
        }
      });
    }
    
    // 8. Restore student info
    if (data.studentInfo) {
      document.querySelectorAll("[data-student]").forEach(el => {
        const key = el.getAttribute("data-student");
        if (data.studentInfo[key]) {
          el.value = data.studentInfo[key];
        }
      });
    }
  } catch (e) {
    console.error("Error al restaurar progreso guardado:", e);
  }
}

// 10. Progress Calculation
function updateProgress() {
  const questionKeys = new Set();
  const answeredKeys = new Set();
  
  // Selects
  document.querySelectorAll("select[data-ex]").forEach(el => {
    const exId = el.getAttribute("data-ex");
    const key = el.getAttribute("data-key");
    const uniqueKey = `${exId}:${key}`;
    questionKeys.add(uniqueKey);
    if (el.value && el.value !== "") {
      answeredKeys.add(uniqueKey);
    }
  });

  // Radios (agrupados por exId:key)
  document.querySelectorAll("input[type='radio'][data-ex]").forEach(el => {
    const exId = el.getAttribute("data-ex");
    const key = el.getAttribute("data-key");
    const uniqueKey = `${exId}:${key}`;
    questionKeys.add(uniqueKey);
    if (el.checked) {
      answeredKeys.add(uniqueKey);
    }
  });

  // Hidden inputs (para toggles, truth table y drag & drop)
  document.querySelectorAll("input[type='hidden'][data-ex]").forEach(el => {
    const exId = el.getAttribute("data-ex");
    const key = el.getAttribute("data-key");
    const uniqueKey = `${exId}:${key}`;
    questionKeys.add(uniqueKey);
    if (el.value && el.value !== "") {
      answeredKeys.add(uniqueKey);
    }
  });
  
  const total = questionKeys.size;
  const answered = answeredKeys.size;
  const percentage = total === 0 ? 0 : Math.round((answered / total) * 100);
  
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  
  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressText) progressText.innerText = `${answered} de ${total} completados (${percentage}%)`;
}

// 11. JSON Export & Preview Payload
function getPayload() {
  const data = getAnswers();
  return JSON.stringify({
    tp_id: `LAB1-2026-TP${TP_NUM}`,
    student: data.studentInfo,
    answers: data.answers
  }, null, 2);
}

function exportJSON() {
  const jsonStr = getPayload();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respuestas_tp${TP_NUM}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function togglePreview() {
  const container = document.getElementById("preview-container");
  const code = document.getElementById("preview-code");
  if (!container || !code) return;
  
  if (container.classList.contains("hidden")) {
    code.textContent = getPayload();
    container.classList.remove("hidden");
  } else {
    container.classList.add("hidden");
  }
}

function copyJSON() {
  const jsonStr = getPayload();
  navigator.clipboard.writeText(jsonStr).then(() => {
    alert("JSON copiado al portapapeles con éxito.");
  }).catch(() => {
    alert("No se pudo copiar automáticamente. Por favor copia el texto manualmente.");
  });
}
