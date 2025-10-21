let athletes = [];
    const MAX_ATHLETES = 100;
    const athleteForm = document.getElementById('athlete-form');
    const nameInput = document.getElementById('name');
    const timeInput = document.getElementById('time');
    const errorMessage = document.getElementById('error-message');
    const athletesTable = document.getElementById('athletes-table');
    const recordsCount = document.getElementById('records-count');
    const finishTestBtn = document.getElementById('finish-test-btn');
    const formSection = document.getElementById('form-section');
    const recordsSection = document.getElementById('records-section');
    const resultsSection = document.getElementById('results-section');
    const rankingList = document.getElementById('ranking-list');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const restartBtn = document.getElementById('restart-btn');
    const loadingScreen = document.getElementById('loading-screen');

    document.addEventListener('DOMContentLoaded', function() {
      loadAthletesFromStorage();
      updateTable();
      updateRecordsCount();
    });

    athleteForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = nameInput.value.trim();
      const timeStr = timeInput.value.trim();
      if (!/^\d+\.\d{3}$/.test(timeStr)) {
        showError('El tiempo debe tener el formato: segundos.milisegundos (Ej: 25.123)');
        return;
      }
      const time = parseFloat(timeStr);
      if (athletes.length >= MAX_ATHLETES) {
        showError(`Se ha alcanzado el límite máximo de ${MAX_ATHLETES} deportistas.`);
        return;
      }
      addAthlete(name, time);
      athleteForm.reset();
      nameInput.focus();
      hideError();
    });

    finishTestBtn.addEventListener('click', function() {
      showLoading();
      setTimeout(() => {
        athletes.sort((a, b) => a.time - b.time);
        generateRankingList();
        formSection.classList.add('hidden');
        recordsSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        hideLoading();
      }, 1000);
    });

    generateReportBtn.addEventListener('click', function() {
      showLoading();
      setTimeout(() => {
        generatePDF();
        hideLoading();
      }, 1500);
    });

    restartBtn.addEventListener('click', function() {
      showLoading();
      setTimeout(() => {
        athletes = [];
        saveAthletesToStorage();
        updateTable();
        updateRecordsCount();
        formSection.classList.remove('hidden');
        recordsSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        hideLoading();
      }, 1000);
    });

    function addAthlete(name, time) {
      const athlete = { id: Date.now(), name, time };
      athletes.push(athlete);
      saveAthletesToStorage();
      updateTable();
      updateRecordsCount();
    }

    function deleteAthlete(id) {
      athletes = athletes.filter(athlete => athlete.id !== id);
      saveAthletesToStorage();
      updateTable();
      updateRecordsCount();
    }

    function updateTable() {
      athletesTable.innerHTML = '';
      if (athletes.length === 0) {
        athletesTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No hay registros de deportistas.</td></tr>`;
        finishTestBtn.disabled = true;
      } else {
        athletes.forEach((athlete, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${athlete.name}</td>
            <td>${athlete.time.toFixed(3)}</td>
            <td style="text-align:right;">
              <button class="btn btn-danger" onclick="deleteAthlete(${athlete.id})"><i class="fas fa-trash"></i></button>
            </td>`;
          athletesTable.appendChild(row);
        });
        finishTestBtn.disabled = false;
      }
    }

    function updateRecordsCount() {
      recordsCount.textContent = `${athletes.length} de ${MAX_ATHLETES} registros`;
    }

    function generateRankingList() {
      rankingList.innerHTML = '';
      athletes.forEach((athlete, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${athlete.name}</span><span>${athlete.time.toFixed(3)}s</span>`;
        rankingList.appendChild(li);
      });
    }

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // --- ENCABEZADO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 153);
  doc.text('ChequeoApp', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('CHEQUEO DE PRUEBA DE VELOCIDAD INDIVIDUAL', 105, 30, { align: 'center' });

  // --- INFO ---
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const today = new Date().toLocaleDateString('es-ES');
  doc.text(`Fecha: ${today}`, 20, 45);
  doc.text('App desarrollada por: Dubin Roberto Alfonso', 20, 52);

  // --- TABLA ---
  const tableColumn = ['Posición', 'Nombre', 'Tiempo (s)'];
  const tableRows = athletes.map((a, i) => [i + 1, a.name, a.time.toFixed(3)]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 60,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 245, 255] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 100 },
      2: { cellWidth: 40 }
    }
  });

  // --- AHORA SÍ, DESPUÉS DE autoTable ---
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Línea separadora
    doc.setDrawColor(180, 180, 180);
    doc.line(15, 280, 195, 280);

    // Texto del pie
    doc.text("Desarrollado por: Dubin Roberto Alfonso", 15, 286);
    doc.text("Correo: dubinalfonso29@gmail.com", 15, 291);
    doc.text("© 2025 alfonsodev - Todos los derechos reservados", 15, 296);

    // WhatsApp y enlaces
    doc.setTextColor(0, 153, 51);
    doc.textWithLink("WhatsApp: +57 312 689 1937", 150, 286, { url: "https://wa.me/573126891937" });

    doc.setTextColor(36, 92, 178);
    doc.textWithLink("Instagram", 150, 291, { url: "https://www.instagram.com/" });
    doc.textWithLink("Facebook", 150, 296, { url: "https://www.facebook.com/" });
    doc.textWithLink("GitHub", 150, 301, { url: "https://github.com/" });

    doc.setTextColor(100, 100, 100);
    doc.text(`Página ${i} de ${pageCount}`, 195, 308, { align: "right" });
  }

  doc.save('reporte_chequeovelocidad.pdf');
}


    function saveAthletesToStorage() {
      localStorage.setItem('athletes', JSON.stringify(athletes));
    }

    function loadAthletesFromStorage() {
      const stored = localStorage.getItem('athletes');
      if (stored) athletes = JSON.parse(stored);
    }

    function showError(msg) {
      errorMessage.textContent = msg;
      errorMessage.classList.remove('hidden');
    }

    function hideError() {
      errorMessage.classList.add('hidden');
    }

    function showLoading() {
      loadingScreen.classList.remove('hidden');
    }

    function hideLoading() {
      loadingScreen.classList.add('hidden');
    }

    window.deleteAthlete = deleteAthlete;