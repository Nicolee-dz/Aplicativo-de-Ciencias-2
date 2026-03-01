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

    // Árbol Digital
    const digitalModel = new DigitalTreeModel();
    const digitalView = new DigitalTreeView('digitalTreeContainer');
    const digitalController = new DigitalTreeController(digitalModel, digitalView);

    // TRIES
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
        console.log('Mostrando contenedor:', container.id);
        [menuPrincipal, submenuBusquedas, appContainer].forEach(c => {
            if (c) {
                c.style.display = (c === container)
                    ? (c === appContainer ? 'block' : 'flex')
                    : 'none';
            }
        });
    }

    if (btnBusquedas) {
        btnBusquedas.addEventListener('click', () => {
            console.log('Click en Búsquedas');
            showContainer(submenuBusquedas);
        });
    }

    if (btnGrafos) {
        btnGrafos.addEventListener('click', () => {
            alert('Módulo de Grafos: próximamente.');
        });
    }

    if (btnInternas) {
        btnInternas.addEventListener('click', () => {
            console.log('Click en Internas');
            showContainer(appContainer);
            arrayModel.generate('random', 15);
            arrayView.displayArray(arrayModel.getArray());
            arrayView.updateStats(arrayModel.getStats());
            hashController.reset();
            const seqTab = document.querySelector('#sequential-tab');
            if (seqTab) seqTab.click();
        });
    }

    if (btnExternas) {
        btnExternas.addEventListener('click', () => {
            alert('Búsquedas Externas: en desarrollo.');
        });
    }

    if (volverMenuPrincipal) {
        volverMenuPrincipal.addEventListener('click', () => {
            console.log('Volver al menú principal');
            showContainer(menuPrincipal);
        });
    }

    if (volverSubmenu) {
        volverSubmenu.addEventListener('click', () => {
            console.log('Volver al submenú');
            showContainer(submenuBusquedas);
        });
    }

    // Eventos de generación de datos
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

    // Botones de búsqueda
    const searchBtnSeq = document.getElementById('searchBtnSeq');
    const searchBtnBin = document.getElementById('searchBtnBin');
    if (searchBtnSeq) {
        searchBtnSeq.addEventListener('click', () => {
            const val = parseInt(document.getElementById('searchValueSeq').value);
            if (!isNaN(val)) {
                searchController.startSequential(val);
            } else {
                showNotification('Ingresa un valor válido', 'error');
            }
        });
    }
    if (searchBtnBin) {
        searchBtnBin.addEventListener('click', () => {
            const val = parseInt(document.getElementById('searchValueBin').value);
            if (!isNaN(val)) {
                searchController.startBinary(val);
            } else {
                showNotification('Ingresa un valor válido', 'error');
            }
        });
    }

    // Botones de eliminar
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
            if (!arrayModel.addValue(val)) {
                showNotification('No se pudo agregar (duplicado o límite)', 'error');
                return;
            }
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
            if (!arrayModel.removeValue(val)) {
                showNotification('Valor no encontrado', 'error');
                return;
            }
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

    // Ocultar/mostrar secciones según pestaña activa
    const dataConfig = document.getElementById('data-config-section');
    const arrayVisual = document.getElementById('array-visual-section');
    const dataManagement = document.getElementById('data-management-section');

    function toggleDataSections(show) {
        const display = show ? 'block' : 'none';
        if (dataConfig) dataConfig.style.display = display;
        if (arrayVisual) arrayVisual.style.display = display;
        if (dataManagement) dataManagement.style.display = display;
    }

    // Mostrar solo si el tab activo es secuencial o binaria
    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (event) => {
            const targetId = event.target.getAttribute('data-bs-target');
            const show = targetId === '#sequential' || targetId === '#binary';
            toggleDataSections(show);
        });
    });

    // Estado inicial según tab activo
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        const activeTarget = activeTab.getAttribute('data-bs-target');
        toggleDataSections(activeTarget === '#sequential' || activeTarget === '#binary');
    }

    // Eventos para Árbol Digital
    const digitalInsertBtn = document.getElementById('digitalInsertBtn');
    const digitalSearchBtn = document.getElementById('digitalSearchBtn');
    const digitalResetBtn = document.getElementById('digitalResetBtn');

    if (digitalInsertBtn) {
        digitalInsertBtn.addEventListener('click', () => {
            const word = document.getElementById('digitalWord').value;
            digitalController.insertWord(word);
        });
    }
    if (digitalSearchBtn) {
        digitalSearchBtn.addEventListener('click', () => {
            const char = document.getElementById('digitalChar').value;
            digitalController.searchChar(char);
        });
    }
    if (digitalResetBtn) {
        digitalResetBtn.addEventListener('click', () => {
            digitalController.reset();
        });
    }

    // Eventos para TRIES
    const triesInsertBtn = document.getElementById('triesInsertBtn');
    const triesSearchBtn = document.getElementById('triesSearchBtn');
    const triesResetBtn = document.getElementById('triesResetBtn');

    if (triesInsertBtn) {
        triesInsertBtn.addEventListener('click', () => {
            const word = document.getElementById('triesWord').value;
            triesController.insertWord(word);
        });
    }
    if (triesSearchBtn) {
        triesSearchBtn.addEventListener('click', () => {
            const char = document.getElementById('triesChar').value;
            triesController.searchChar(char);
        });
    }
    if (triesResetBtn) {
        triesResetBtn.addEventListener('click', () => {
            triesController.reset();
        });
    }

    // ══════════════════════════════════════════
    // GUARDAR ARREGLO EN PDF
    // ══════════════════════════════════════════
    const saveArrayBtn = document.getElementById('saveArrayBtn');
    if (saveArrayBtn) {
        saveArrayBtn.addEventListener('click', () => {
            const arr = arrayModel.getArray();
            if (arr.length === 0) {
                showNotification('No hay arreglo para guardar', 'error');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Título
            doc.setFontSize(18);
            doc.setTextColor(75, 108, 183);
            doc.text('Ciencias de la Computación 2', 105, 20, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('Arreglo Guardado', 105, 30, { align: 'center' });

            // Fecha
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const fecha = new Date().toLocaleString('es-CO');
            doc.text(`Fecha: ${fecha}`, 105, 38, { align: 'center' });

            // Línea separadora
            doc.setDrawColor(75, 108, 183);
            doc.setLineWidth(0.5);
            doc.line(20, 42, 190, 42);

            // Metadata del arreglo
            const stats = arrayModel.getStats();
            doc.setFontSize(11);
            doc.setTextColor(40, 40, 40);
            doc.text(`Total de elementos: ${stats.length}`, 20, 52);
            doc.text(`Mínimo: ${stats.min}   |   Máximo: ${stats.max}   |   Suma: ${stats.sum}`, 20, 60);

            // Línea
            doc.setDrawColor(200, 200, 200);
            doc.line(20, 64, 190, 64);

            // Etiqueta especial para recuperación (oculta visualmente pero legible)
            doc.setFontSize(8);
            doc.setTextColor(240, 240, 240); // casi blanco, no visible
            doc.text('ARREGLO_DATA:' + JSON.stringify(arr), 20, 68);

            // Tabla del arreglo (visible)
            doc.setFontSize(11);
            doc.setTextColor(40, 40, 40);
            doc.text('Contenido del arreglo:', 20, 76);

            const colsPerRow = 10;
            let y = 84;
            let rowText = '';

            for (let i = 0; i < arr.length; i++) {
                rowText += `[${i + 1}]: ${arr[i]}    `;
                if ((i + 1) % colsPerRow === 0 || i === arr.length - 1) {
                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    doc.text(rowText.trim(), 20, y);
                    y += 8;
                    rowText = '';
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                }
            }

            // Pie de página
            const pageCount = doc.internal.getNumberOfPages();
            for (let p = 1; p <= pageCount; p++) {
                doc.setPage(p);
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text('Aplicativo - Ciencias de la Computación 2', 105, 290, { align: 'center' });
            }

            doc.save(`arreglo_${Date.now()}.pdf`);
            showNotification('Arreglo guardado como PDF ✓', 'success');
        });
    }

    // ══════════════════════════════════════════
    // RECUPERAR ARREGLO DESDE PDF
    // ══════════════════════════════════════════
    const recoverArrayBtn = document.getElementById('recoverArrayBtn');
    const pdfFileInput = document.getElementById('pdfFileInput');

    if (recoverArrayBtn && pdfFileInput) {
        recoverArrayBtn.addEventListener('click', () => {
            pdfFileInput.value = '';
            pdfFileInput.click();
        });

        pdfFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            showNotification('Leyendo PDF...', 'warning');

            try {
                // Configurar worker de PDF.js
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                let fullText = '';
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const content = await page.getTextContent();
                    const pageText = content.items.map(item => item.str).join(' ');
                    fullText += pageText + ' ';
                }

                // Buscar el marcador de datos
                const marker = 'ARREGLO_DATA:';
                const idx = fullText.indexOf(marker);
                if (idx === -1) {
                    showNotification('No se encontraron datos de arreglo en el PDF', 'error');
                    return;
                }

                // Extraer el JSON
                const jsonStart = idx + marker.length;
                const jsonEnd = fullText.indexOf(']', jsonStart) + 1;
                const jsonStr = fullText.substring(jsonStart, jsonEnd).replace(/\s+/g, '');
                const recoveredArr = JSON.parse(jsonStr);

                if (!Array.isArray(recoveredArr) || recoveredArr.length === 0) {
                    showNotification('Datos inválidos en el PDF', 'error');
                    return;
                }

                // Cargar arreglo recuperado
                arrayModel.setArray(recoveredArr);
                arrayView.displayArray(arrayModel.getArray());
                arrayView.updateStats(arrayModel.getStats());
                searchController.reset();

                showNotification(`Arreglo recuperado: ${recoveredArr.length} elementos ✓`, 'success');

            } catch (err) {
                console.error('Error leyendo PDF:', err);
                showNotification('Error al leer el PDF', 'error');
            }
        });
    }

    // ══════════════════════════════════════════
    // IMPRIMIR
    // ══════════════════════════════════════════
    const printArrayBtn = document.getElementById('printArrayBtn');
    if (printArrayBtn) {
        printArrayBtn.addEventListener('click', () => {
            const arr = arrayModel.getArray();
            if (arr.length === 0) {
                showNotification('No hay arreglo para imprimir', 'error');
                return;
            }

            const stats = arrayModel.getStats();
            const fecha = new Date().toLocaleString('es-CO');

            // Crear ventana de impresión con contenido formateado
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Arreglo - Ciencias de la Computación 2</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; padding: 30px; color: #222; }
                        h1 { color: #4b6cb7; text-align: center; margin-bottom: 4px; }
                        h2 { text-align: center; color: #555; font-size: 1rem; font-weight: normal; margin-top: 0; }
                        .fecha { text-align: center; color: #888; font-size: 0.9rem; margin-bottom: 20px; }
                        hr { border: 1px solid #4b6cb7; margin: 16px 0; }
                        .stats { display: flex; justify-content: space-around; margin: 16px 0; }
                        .stat { text-align: center; }
                        .stat-val { font-size: 1.4rem; font-weight: bold; color: #4b6cb7; }
                        .stat-lbl { font-size: 0.85rem; color: #888; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #4b6cb7; color: white; padding: 8px 12px; text-align: center; }
                        td { border: 1px solid #ddd; padding: 7px 12px; text-align: center; }
                        tr:nth-child(even) td { background-color: #f0f4ff; }
                        .footer { text-align: center; margin-top: 30px; font-size: 0.8rem; color: #aaa; }
                        @media print { body { padding: 10px; } }
                    </style>
                </head>
                <body>
                    <h1>Ciencias de la Computación 2</h1>
                    <h2>Visualización del Arreglo</h2>
                    <div class="fecha">Fecha: ${fecha}</div>
                    <hr>
                    <div class="stats">
                        <div class="stat"><div class="stat-val">${stats.length}</div><div class="stat-lbl">Elementos</div></div>
                        <div class="stat"><div class="stat-val">${stats.min}</div><div class="stat-lbl">Mínimo</div></div>
                        <div class="stat"><div class="stat-val">${stats.max}</div><div class="stat-lbl">Máximo</div></div>
                        <div class="stat"><div class="stat-val">${stats.sum}</div><div class="stat-lbl">Suma</div></div>
                    </div>
                    <hr>
                    <table>
                        <thead><tr><th>Posición</th><th>Valor</th></tr></thead>
                        <tbody>
                            ${arr.map((v, i) => `<tr><td>${i + 1}</td><td>${v}</td></tr>`).join('')}
                        </tbody>
                    </table>
                    <div class="footer">Aplicativo - Ciencias de la Computación 2</div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() { window.close(); };
                        };
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }

    // Inicializar hash
    hashController.reset();

    // Mostrar menú principal al inicio
    showContainer(menuPrincipal);
});