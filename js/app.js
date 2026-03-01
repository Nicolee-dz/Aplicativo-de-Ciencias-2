document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando app.js');

    const menuPrincipal = document.getElementById('menu-principal');
    const submenuBusquedas = document.getElementById('submenu-busquedas');
    const appContainer = document.getElementById('app-container');

    const btnBusquedas = document.getElementById('btn-busquedas');
    const btnGrafos = document.getElementById('btn-grafos');
    const btnInternas = document.getElementById('btn-internas');
    const btnExternas = document.getElementById('btn-externas');
    const volverMenuPrincipal = document.getElementById('volver-menu-principal');
    const volverSubmenu = document.getElementById('volver-submenu');

    if (!menuPrincipal || !submenuBusquedas || !appContainer) {
        console.error('Faltan contenedores principales');
        return;
    }

    const arrayModel = new ArrayModel();
    const arrayView = new ArrayView();
    const hashModel = new HashModel(10);
    const hashView = new HashView();

    const digitalModel = new DigitalTreeModel();
    const digitalView = new DigitalTreeView('digitalTreeContainer');
    const digitalController = new DigitalTreeController(digitalModel, digitalView);

    const triesModel = new TriesModel();
    const triesView = new TriesView('triesTreeContainer');
    const triesController = new TriesController(triesModel, triesView);

    const searchController = new SearchController(arrayModel, arrayView);
    const hashController = new HashController(hashModel, hashView);

    searchController.init();
    hashController.init();
    digitalController.init();
    triesController.init();

    function showContainer(container) {
        [menuPrincipal, submenuBusquedas, appContainer].forEach(c => {
            if (c) {
                c.style.display = (c === container)
                    ? (c === appContainer ? 'block' : 'flex')
                    : 'none';
            }
        });
    }

    if (btnBusquedas) btnBusquedas.addEventListener('click', () => showContainer(submenuBusquedas));
    if (btnGrafos) btnGrafos.addEventListener('click', () => alert('Módulo de Grafos: próximamente.'));

    if (btnInternas) {
        btnInternas.addEventListener('click', () => {
            showContainer(appContainer);
            arrayModel.generate('random', 15);
            arrayView.displayArray(arrayModel.getArray());
            arrayView.updateStats(arrayModel.getStats());
            hashController.reset();
            const seqTab = document.querySelector('#sequential-tab');
            if (seqTab) seqTab.click();
        });
    }

    if (btnExternas) btnExternas.addEventListener('click', () => alert('Búsquedas Externas: en desarrollo.'));
    if (volverMenuPrincipal) volverMenuPrincipal.addEventListener('click', () => showContainer(menuPrincipal));
    if (volverSubmenu) volverSubmenu.addEventListener('click', () => showContainer(submenuBusquedas));

    // Generar arreglo
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const source = document.getElementById('dataSource').value;
            let sizeOrInput;
            if (source === 'manual') {
                sizeOrInput = document.getElementById('manualArray').value;
            } else {
                sizeOrInput = parseInt(document.getElementById('arraySize').value);
            }
            arrayModel.generate(source, sizeOrInput);
            arrayView.displayArray(arrayModel.getArray());
            arrayView.updateStats(arrayModel.getStats());
            searchController.reset();
            showNotification('Arreglo generado', 'success');
        });
    }

    // Búsqueda secuencial
    const searchBtnSeq = document.getElementById('searchBtnSeq');
    if (searchBtnSeq) {
        searchBtnSeq.addEventListener('click', () => {
            const val = parseInt(document.getElementById('searchValueSeq').value);
            if (!isNaN(val)) searchController.startSequential(val);
            else showNotification('Ingresa un valor válido', 'error');
        });
    }

    // Búsqueda binaria
    const searchBtnBin = document.getElementById('searchBtnBin');
    if (searchBtnBin) {
        searchBtnBin.addEventListener('click', () => {
            const val = parseInt(document.getElementById('searchValueBin').value);
            if (!isNaN(val)) searchController.startBinary(val);
            else showNotification('Ingresa un valor válido', 'error');
        });
    }

    // Eliminar encontrado
    const deleteBtnSeq = document.getElementById('deleteBtnSeq');
    const deleteBtnBin = document.getElementById('deleteBtnBin');
    if (deleteBtnSeq) deleteBtnSeq.addEventListener('click', () => searchController.deleteFound());
    if (deleteBtnBin) deleteBtnBin.addEventListener('click', () => searchController.deleteFound());

    // Reiniciar búsqueda
    const resetSearchBtn = document.getElementById('resetSearchBtn');
    if (resetSearchBtn) resetSearchBtn.addEventListener('click', () => searchController.reset());

    // Panel de edición
    const toggleEditPanel = document.getElementById('toggleEditPanel');
    const editPanel = document.getElementById('editPanel');
    if (toggleEditPanel && editPanel) {
        toggleEditPanel.addEventListener('click', () => {
            editPanel.classList.toggle('active');
            toggleEditPanel.textContent = editPanel.classList.contains('active') ? 'Ocultar Panel' : 'Mostrar Panel';
            if (editPanel.classList.contains('active')) {
                document.getElementById('editArray').value = arrayModel.getArray().join(', ');
            }
        });
    }

    const updateArrayBtn = document.getElementById('updateArrayBtn');
    if (updateArrayBtn) {
        updateArrayBtn.addEventListener('click', () => {
            const input = document.getElementById('editArray').value;
            arrayModel.updateFromString(input);
            if (searchController.searchAlgorithm === 'binary') arrayModel.sort();
            arrayView.displayArray(arrayModel.getArray());
            arrayView.updateStats(arrayModel.getStats());
            searchController.reset();
            showNotification('Arreglo actualizado', 'success');
        });
    }

    const clearArrayBtn = document.getElementById('clearArrayBtn');
    if (clearArrayBtn) {
        clearArrayBtn.addEventListener('click', () => {
            if (arrayModel.getArray().length === 0) { showNotification('Ya vacío', 'warning'); return; }
            if (confirm('¿Limpiar arreglo?')) {
                arrayModel.clear();
                arrayView.displayArray([]);
                arrayView.updateStats(arrayModel.getStats());
                searchController.reset();
                document.getElementById('editArray').value = '';
            }
        });
    }

    const addValueBtn = document.getElementById('addValueBtn');
    if (addValueBtn) {
        addValueBtn.addEventListener('click', () => {
            const val = parseInt(document.getElementById('addValue').value);
            if (isNaN(val)) { showNotification('Valor inválido', 'error'); return; }
            if (!arrayModel.addValue(val)) { showNotification('No se pudo agregar (duplicado o límite)', 'error'); return; }
            if (searchController.searchAlgorithm === 'binary') arrayModel.sort();
            arrayView.displayArray(arrayModel.getArray());
            arrayView.updateStats(arrayModel.getStats());
            searchController.reset();
            document.getElementById('editArray').value = arrayModel.getArray().join(', ');
            showNotification(`Agregado ${val}`, 'success');
            document.getElementById('addValue').value = '';
        });
    }

    const removeValueBtn = document.getElementById('removeValueBtn');
    if (removeValueBtn) {
        removeValueBtn.addEventListener('click', () => {
            const val = parseInt(document.getElementById('removeValue').value);
            if (isNaN(val)) { showNotification('Valor inválido', 'error'); return; }
            if (!arrayModel.removeValue(val)) { showNotification('Valor no encontrado', 'error'); return; }
            arrayView.displayArray(arrayModel.getArray());
            arrayView.updateStats(arrayModel.getStats());
            searchController.reset();
            document.getElementById('editArray').value = arrayModel.getArray().join(', ');
            showNotification(`Eliminado ${val}`, 'success');
            document.getElementById('removeValue').value = '';
        });
    }

    // Slider
    const arraySize = document.getElementById('arraySize');
    if (arraySize) {
        arraySize.addEventListener('input', (e) => {
            document.getElementById('sizeValue').textContent = `${e.target.value} elementos`;
        });
    }

    // Fuente de datos
    const dataSource = document.getElementById('dataSource');
    if (dataSource) {
        dataSource.addEventListener('change', (e) => {
            const manualOpts = document.getElementById('manualOptions');
            const randomOpts = document.getElementById('randomOptions');
            if (e.target.value === 'manual') {
                manualOpts.style.display = 'block';
                randomOpts.style.display = 'none';
            } else {
                manualOpts.style.display = 'none';
                randomOpts.style.display = 'block';
            }
        });
    }

    // Toggle secciones por pestaña
    const dataConfig = document.getElementById('data-config-section');
    const arrayVisual = document.getElementById('array-visual-section');
    const dataManagement = document.getElementById('data-management-section');

    function toggleDataSections(show) {
        const display = show ? 'block' : 'none';
        if (dataConfig) dataConfig.style.display = display;
        if (arrayVisual) arrayVisual.style.display = display;
        if (dataManagement) dataManagement.style.display = display;
    }

    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (event) => {
            const targetId = event.target.getAttribute('data-bs-target');
            toggleDataSections(targetId === '#sequential' || targetId === '#binary');
        });
    });

    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        const activeTarget = activeTab.getAttribute('data-bs-target');
        toggleDataSections(activeTarget === '#sequential' || activeTarget === '#binary');
    }

    // ── Árbol Digital ────────────────────────────────────────
    const digitalInsertBtn = document.getElementById('digitalInsertBtn');
    const digitalSearchBtn = document.getElementById('digitalSearchBtn');
    const digitalResetBtn  = document.getElementById('digitalResetBtn');
    const digitalDeleteBtn = document.getElementById('digitalDeleteBtn');

    if (digitalInsertBtn) digitalInsertBtn.addEventListener('click', () => digitalController.insertWord(document.getElementById('digitalWord').value));
    if (digitalSearchBtn) digitalSearchBtn.addEventListener('click', () => digitalController.searchChar(document.getElementById('digitalChar').value));
    if (digitalResetBtn)  digitalResetBtn.addEventListener('click',  () => digitalController.reset());

    if (digitalDeleteBtn) {
        digitalDeleteBtn.addEventListener('click', () => {
            const char = document.getElementById('digitalDeleteChar').value;
            if (!char || char.trim().length !== 1) { showNotification('Ingresa un único carácter válido', 'error'); return; }
            const success = digitalModel.deleteChar(char);
            if (success) {
                digitalView.render(digitalModel);
                const tbody = document.getElementById('digitalCharTableBody');
                if (tbody) {
                    tbody.innerHTML = '';
                    for (const c of digitalModel.insertedChars) {
                        const row = document.createElement('tr');
                        row.innerHTML = `<td><strong>${c.char}</strong></td><td>${c.pos}</td><td><code>${c.bits.join('')}</code></td>`;
                        tbody.appendChild(row);
                    }
                }
                document.getElementById('digitalDeleteChar').value = '';
                showNotification(`Carácter '${char.toUpperCase()}' eliminado`, 'success');
            } else {
                showNotification(`Carácter '${char.toUpperCase()}' no existe en el árbol`, 'error');
            }
        });
    }

    // ── TRIES ────────────────────────────────────────────────
    const triesInsertBtn = document.getElementById('triesInsertBtn');
    const triesSearchBtn = document.getElementById('triesSearchBtn');
    const triesResetBtn  = document.getElementById('triesResetBtn');
    const triesDeleteBtn = document.getElementById('triesDeleteBtn');

    if (triesInsertBtn) triesInsertBtn.addEventListener('click', () => triesController.insertWord(document.getElementById('triesWord').value));
    if (triesSearchBtn) triesSearchBtn.addEventListener('click', () => triesController.searchChar(document.getElementById('triesChar').value));
    if (triesResetBtn)  triesResetBtn.addEventListener('click',  () => triesController.reset());

    if (triesDeleteBtn) {
        triesDeleteBtn.addEventListener('click', () => {
            const char = document.getElementById('triesDeleteChar').value;
            if (!char || char.trim().length !== 1) { showNotification('Ingresa un único carácter válido', 'error'); return; }
            const success = triesModel.deleteChar(char);
            if (success) {
                triesView.render(triesModel);
                const tbody = document.getElementById('triesCharTableBody');
                if (tbody) {
                    tbody.innerHTML = '';
                    for (const c of triesModel.insertedChars) {
                        const row = document.createElement('tr');
                        row.innerHTML = `<td><strong>${c.char}</strong></td><td>${c.pos}</td><td><code>${c.bits.join('')}</code></td>`;
                        tbody.appendChild(row);
                    }
                }
                document.getElementById('triesDeleteChar').value = '';
                showNotification(`Carácter '${char.toUpperCase()}' eliminado`, 'success');
            } else {
                showNotification(`Carácter '${char.toUpperCase()}' no existe en el TRIE`, 'error');
            }
        });
    }

    // ── GUARDAR PDF ──────────────────────────────────────────
    const saveArrayBtn = document.getElementById('saveArrayBtn');
    if (saveArrayBtn) {
        saveArrayBtn.addEventListener('click', () => {
            const arr = arrayModel.getArray();
            if (arr.length === 0) { showNotification('No hay arreglo para guardar', 'error'); return; }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const stats = arrayModel.getStats();
            const fecha = new Date().toLocaleString('es-CO');

            doc.setFontSize(18); doc.setTextColor(75, 108, 183);
            doc.text('Ciencias de la Computación 2', 105, 20, { align: 'center' });
            doc.setFontSize(14); doc.setTextColor(40, 40, 40);
            doc.text('Arreglo Guardado', 105, 30, { align: 'center' });
            doc.setFontSize(10); doc.setTextColor(100, 100, 100);
            doc.text(`Fecha: ${fecha}`, 105, 38, { align: 'center' });
            doc.setDrawColor(75, 108, 183); doc.setLineWidth(0.5); doc.line(20, 42, 190, 42);
            doc.setFontSize(11); doc.setTextColor(40, 40, 40);
            doc.text(`Total de elementos: ${stats.length}`, 20, 52);
            doc.text(`Mínimo: ${stats.min}   |   Máximo: ${stats.max}   |   Suma: ${stats.sum}`, 20, 60);
            doc.setDrawColor(200, 200, 200); doc.line(20, 64, 190, 64);
            doc.setFontSize(11); doc.setTextColor(40, 40, 40);
            doc.text('Contenido del arreglo:', 20, 72);

            const colsPerRow = 10;
            let y = 80, rowText = '';
            for (let i = 0; i < arr.length; i++) {
                rowText += `[${i + 1}]:${arr[i]}  `;
                if ((i + 1) % colsPerRow === 0 || i === arr.length - 1) {
                    doc.setFontSize(10); doc.setTextColor(60, 60, 60);
                    doc.text(rowText.trim(), 20, y);
                    y += 8; rowText = '';
                    if (y > 260) { doc.addPage(); y = 20; }
                }
            }

            const dataMarker = `##ARREGLO_DATA##${JSON.stringify(arr)}##END##`;
            doc.setFontSize(6); doc.setTextColor(200, 200, 200);
            let dataY = y + 10;
            for (let i = 0; i < dataMarker.length; i += 180) {
                doc.text(dataMarker.substring(i, i + 180), 15, dataY);
                dataY += 5;
                if (dataY > 285) { doc.addPage(); dataY = 15; }
            }

            const pageCount = doc.internal.getNumberOfPages();
            for (let p = 1; p <= pageCount; p++) {
                doc.setPage(p); doc.setFontSize(9); doc.setTextColor(150, 150, 150);
                doc.text('Aplicativo - Ciencias de la Computación 2', 105, 292, { align: 'center' });
            }

            doc.save(`arreglo_${Date.now()}.pdf`);
            showNotification('Arreglo guardado como PDF ✓', 'success');
        });
    }

    // ── RECUPERAR PDF ────────────────────────────────────────
    const recoverArrayBtn = document.getElementById('recoverArrayBtn');
    const pdfFileInput = document.getElementById('pdfFileInput');

    if (recoverArrayBtn && pdfFileInput) {
        recoverArrayBtn.addEventListener('click', () => { pdfFileInput.value = ''; pdfFileInput.click(); });

        pdfFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            showNotification('Leyendo PDF...', 'warning');

            try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                let fullText = '';
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const content = await page.getTextContent();
                    fullText += content.items.map(item => item.str).join('');
                }

                const startMarker = '##ARREGLO_DATA##', endMarker = '##END##';
                const startIdx = fullText.indexOf(startMarker), endIdx = fullText.indexOf(endMarker);

                if (startIdx === -1 || endIdx === -1) {
                    const oldIdx = fullText.indexOf('ARREGLO_DATA:');
                    if (oldIdx !== -1) {
                        const jsonStart = oldIdx + 'ARREGLO_DATA:'.length;
                        const jsonEnd = fullText.indexOf(']', jsonStart) + 1;
                        try {
                            const recovered = JSON.parse(fullText.substring(jsonStart, jsonEnd).replace(/\s+/g, ''));
                            if (Array.isArray(recovered) && recovered.length > 0) {
                                arrayModel.setArray(recovered);
                                arrayView.displayArray(arrayModel.getArray());
                                arrayView.updateStats(arrayModel.getStats());
                                searchController.reset();
                                showNotification(`Arreglo recuperado: ${recovered.length} elementos ✓`, 'success');
                                return;
                            }
                        } catch(e) { /* continúa */ }
                    }
                    showNotification('No se encontraron datos en el PDF', 'error');
                    return;
                }

                const recoveredArr = JSON.parse(fullText.substring(startIdx + startMarker.length, endIdx).replace(/\s+/g, ''));
                if (!Array.isArray(recoveredArr) || recoveredArr.length === 0) { showNotification('Datos inválidos en el PDF', 'error'); return; }

                arrayModel.setArray(recoveredArr);
                arrayView.displayArray(arrayModel.getArray());
                arrayView.updateStats(arrayModel.getStats());
                searchController.reset();
                showNotification(`Arreglo recuperado: ${recoveredArr.length} elementos ✓`, 'success');

            } catch (err) {
                console.error('Error leyendo PDF:', err);
                showNotification(`Error al leer el PDF: ${err.message}`, 'error');
            }
        });
    }

    // ── IMPRIMIR ─────────────────────────────────────────────
    const printArrayBtn = document.getElementById('printArrayBtn');
    if (printArrayBtn) {
        printArrayBtn.addEventListener('click', () => {
            const arr = arrayModel.getArray();
            if (arr.length === 0) { showNotification('No hay arreglo para imprimir', 'error'); return; }
            const stats = arrayModel.getStats();
            const fecha = new Date().toLocaleString('es-CO');
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            printWindow.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Arreglo</title>
                <style>body{font-family:'Segoe UI',sans-serif;padding:30px;color:#222}h1{color:#4b6cb7;text-align:center}
                h2{text-align:center;color:#555;font-size:1rem;font-weight:normal;margin-top:0}
                .fecha{text-align:center;color:#888;font-size:.9rem;margin-bottom:20px}
                hr{border:1px solid #4b6cb7;margin:16px 0}.stats{display:flex;justify-content:space-around;margin:16px 0}
                .stat{text-align:center}.stat-val{font-size:1.4rem;font-weight:bold;color:#4b6cb7}.stat-lbl{font-size:.85rem;color:#888}
                table{width:100%;border-collapse:collapse;margin-top:20px}th{background-color:#4b6cb7;color:white;padding:8px 12px;text-align:center}
                td{border:1px solid #ddd;padding:7px 12px;text-align:center}tr:nth-child(even) td{background-color:#f0f4ff}
                .footer{text-align:center;margin-top:30px;font-size:.8rem;color:#aaa}</style></head><body>
                <h1>Ciencias de la Computación 2</h1><h2>Visualización del Arreglo</h2>
                <div class="fecha">Fecha: ${fecha}</div><hr>
                <div class="stats">
                    <div class="stat"><div class="stat-val">${stats.length}</div><div class="stat-lbl">Elementos</div></div>
                    <div class="stat"><div class="stat-val">${stats.min}</div><div class="stat-lbl">Mínimo</div></div>
                    <div class="stat"><div class="stat-val">${stats.max}</div><div class="stat-lbl">Máximo</div></div>
                    <div class="stat"><div class="stat-val">${stats.sum}</div><div class="stat-lbl">Suma</div></div>
                </div><hr>
                <table><thead><tr><th>Posición</th><th>Valor</th></tr></thead><tbody>
                ${arr.map((v, i) => `<tr><td>${i + 1}</td><td>${v}</td></tr>`).join('')}
                </tbody></table>
                <div class="footer">Aplicativo - Ciencias de la Computación 2</div>
                <script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script>
                </body></html>`);
            printWindow.document.close();
        });
    }

    hashController.reset();
    showContainer(menuPrincipal);
});