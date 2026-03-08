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

    // Residuos Múltiples
    const residuosModel = new ResiduosMultipleModel();
    const residuosView  = new ResiduosMultipleView('residueTreeContainer');
    const residuosController = new ResiduosMultipleController(residuosModel, residuosView);

    const searchController = new SearchController(arrayModel, arrayView);
    const hashController = new HashController(hashModel, hashView);

    searchController.init();
    hashController.init();
    digitalController.init();
    triesController.init();
    residuosController.init();

    function showContainer(container) {
        console.log('Mostrando contenedor:', container.id);
        [menuPrincipal, submenuBusquedas, appContainer].forEach(c => {
            if (c) {
                c.style.display = (c === container)
                    ? 'flex'
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
            // Iniciar con arreglo vacío
            arrayModel.clear();
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

    // Elementos del arreglo
    const arrayDigitsInput = document.getElementById('arrayDigits');
    const addSingleValue = document.getElementById('addSingleValue');
    const addSingleBtn = document.getElementById('addSingleBtn');

    // Inserción manual con validación de dígitos
    if (addSingleBtn && addSingleValue && arrayDigitsInput) {
        addSingleBtn.addEventListener('click', () => {
            const val = parseInt(addSingleValue.value);
            const digits = parseInt(arrayDigitsInput.value) || 3;
            if (isNaN(val)) {
                showNotification('Ingresa un valor numérico válido', 'error');
                return;
            }
            if (Math.abs(val).toString().length !== digits) {
                showNotification(`El valor debe tener exactamente ${digits} dígito(s)`, 'error');
                return;
            }
            if (!arrayModel.addValue(val)) {
                showNotification('No se pudo agregar (duplicado o límite de 100)', 'error');
                return;
            }
            if (searchController.searchAlgorithm === 'binary') arrayModel.sort();
            arrayView.displayArray(arrayModel.getArray());
            arrayView.updateStats(arrayModel.getStats());
            searchController.reset();
            addSingleValue.value = '';
            showNotification(`Valor ${val} agregado`, 'success');
        });
    }

    // Búsqueda secuencial con validación de dígitos
    const searchBtnSeq = document.getElementById('searchBtnSeq');
    const searchValueSeq = document.getElementById('searchValueSeq');
    if (searchBtnSeq && searchValueSeq && arrayDigitsInput) {
        searchBtnSeq.addEventListener('click', () => {
            const val = parseInt(searchValueSeq.value);
            const digits = parseInt(arrayDigitsInput.value) || 3;
            if (isNaN(val)) {
                showNotification('Ingresa un valor válido', 'error');
                return;
            }
            if (Math.abs(val).toString().length !== digits) {
                showNotification(`El valor a buscar debe tener exactamente ${digits} dígito(s)`, 'error');
                return;
            }
            searchController.startSequential(val);
        });
    }

    // Búsqueda binaria con validación de dígitos
    const searchBtnBin = document.getElementById('searchBtnBin');
    const searchValueBin = document.getElementById('searchValueBin');
    if (searchBtnBin && searchValueBin && arrayDigitsInput) {
        searchBtnBin.addEventListener('click', () => {
            const val = parseInt(searchValueBin.value);
            const digits = parseInt(arrayDigitsInput.value) || 3;
            if (isNaN(val)) {
                showNotification('Ingresa un valor válido', 'error');
                return;
            }
            if (Math.abs(val).toString().length !== digits) {
                showNotification(`El valor a buscar debe tener exactamente ${digits} dígito(s)`, 'error');
                return;
            }
            searchController.startBinary(val);
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

    // Ocultar/mostrar secciones según pestaña activa
    const dataConfig = document.getElementById('data-config-section');
    const arrayVisual = document.getElementById('array-visual-section');
    const arrayWorkspace = document.getElementById('array-workspace');

    function toggleDataSections(show) {
        const display = show ? 'block' : 'none';
        if (arrayWorkspace) arrayWorkspace.style.display = show ? 'flex' : 'none';
        if (dataConfig) dataConfig.style.display = display;
        if (arrayVisual) arrayVisual.style.display = display;
    }

    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (event) => {
            const targetId = event.target.getAttribute('data-bs-target');
            const show = targetId === '#sequential' || targetId === '#binary';
            toggleDataSections(show);
        });
    });

    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab) {
        const activeTarget = activeTab.getAttribute('data-bs-target');
        toggleDataSections(activeTarget === '#sequential' || activeTarget === '#binary');
    }

    // Eventos para Hash
    const hashSize = document.getElementById('hashSize');
    const hashFunction = document.getElementById('hashFunction');
    const hashInsertBtn = document.getElementById('hashInsertBtn');
    const hashSearchBtn = document.getElementById('hashSearchBtn');
    const hashResetBtn = document.getElementById('hashResetBtn');
    const hashKey = document.getElementById('hashKey');
    const hashDigits = document.getElementById('hashDigits');

    if (hashSize) {
        hashSize.addEventListener('change', () => {
            const newSize = parseInt(hashSize.value) || 10;
            hashController.changeSize(newSize);
        });
    }

    if (hashFunction) {
        hashFunction.addEventListener('change', () => {
            hashController.changeFunction();
        });
    }

    function validateKeyDigits(key, digits) {
        const keyStr = Math.abs(key).toString();
        return keyStr.length === digits;
    }

    if (hashInsertBtn && hashKey && hashDigits) {
        hashInsertBtn.addEventListener('click', () => {
            const key = parseInt(hashKey.value);
            const digits = parseInt(hashDigits.value) || 3;
            if (isNaN(key)) {
                showNotification('Ingresa una clave válida', 'error');
                return;
            }
            if (!validateKeyDigits(key, digits)) {
                showNotification(`La clave debe tener exactamente ${digits} dígito(s)`, 'error');
                return;
            }
            hashController.insert(key);
            hashKey.value = '';
        });
    }

    if (hashSearchBtn && hashKey && hashDigits) {
        hashSearchBtn.addEventListener('click', () => {
            const key = parseInt(hashKey.value);
            const digits = parseInt(hashDigits.value) || 3;
            if (isNaN(key)) {
                showNotification('Ingresa una clave válida', 'error');
                return;
            }
            if (!validateKeyDigits(key, digits)) {
                showNotification(`La clave debe tener exactamente ${digits} dígito(s)`, 'error');
                return;
            }
            hashController.search(key);
        });
    }

    if (hashResetBtn) {
        hashResetBtn.addEventListener('click', () => {
            hashController.reset();
        });
    }

    function bindEnterToButton(inputId, buttonId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        if (!input || !button) return;

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                button.click();
            }
        });
    }

    // Atajos con Enter para ejecutar acciones desde los inputs
    bindEnterToButton('addSingleValue', 'addSingleBtn');
    bindEnterToButton('searchValueSeq', 'searchBtnSeq');
    bindEnterToButton('searchValueBin', 'searchBtnBin');
    bindEnterToButton('hashKey', 'hashInsertBtn');
    bindEnterToButton('digitalWord', 'digitalInsertBtn');
    bindEnterToButton('digitalDeleteChar', 'digitalDeleteBtn');
    bindEnterToButton('digitalChar', 'digitalSearchBtn');
    bindEnterToButton('triesWord', 'triesInsertBtn');
    bindEnterToButton('triesDeleteChar', 'triesDeleteBtn');
    bindEnterToButton('triesChar', 'triesSearchBtn');
    bindEnterToButton('residueWord', 'residueInsertBtn');
    bindEnterToButton('residueDeleteChar', 'residueDeleteBtn');
    bindEnterToButton('residueSearchChar', 'residueSearchBtn');

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

    // Eliminar carácter árbol digital
    const digitalDeleteBtn = document.getElementById('digitalDeleteBtn');
    if (digitalDeleteBtn) {
        digitalDeleteBtn.addEventListener('click', () => {
            const char = document.getElementById('digitalDeleteChar').value;
            if (!char || char.trim().length !== 1) {
                showNotification('Ingresa un único carácter válido', 'error');
                return;
            }
            const success = digitalModel.deleteChar(char);
            if (success) {
                digitalView.render(digitalModel);
                const tbody = document.getElementById('digitalCharTableBody');
                if (tbody) {
                    tbody.innerHTML = '';
                    for (const charInfo of digitalModel.insertedChars) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><strong>${charInfo.char}</strong></td>
                            <td>${charInfo.pos}</td>
                            <td><code>${charInfo.bits.join('')}</code></td>
                        `;
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

    // Eliminar carácter TRIES
    const triesDeleteBtn = document.getElementById('triesDeleteBtn');
    if (triesDeleteBtn) {
        triesDeleteBtn.addEventListener('click', () => {
            const char = document.getElementById('triesDeleteChar').value;
            if (!char || char.trim().length !== 1) {
                showNotification('Ingresa un único carácter válido', 'error');
                return;
            }
            const success = triesModel.deleteChar(char);
            if (success) {
                triesView.render(triesModel);
                const tbody = document.getElementById('triesCharTableBody');
                if (tbody) {
                    tbody.innerHTML = '';
                    for (const charInfo of triesModel.insertedChars) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><strong>${charInfo.char}</strong></td>
                            <td>${charInfo.pos}</td>
                            <td><code>${charInfo.bits.join('')}</code></td>
                        `;
                        tbody.appendChild(row);
                    }
                }
                document.getElementById('triesDeleteChar').value = '';
                showNotification(`Carácter '${char.toUpperCase()}' eliminado`, 'success');
            } else {
                showNotification(`Carácter '${char.toUpperCase()}' no existe en el árbol`, 'error');
            }
        });
    }

    // RESIDUOS MÚLTIPLES
    const residueChangeNBtn = document.getElementById('residueChangeNBtn');
    const residueInsertBtn  = document.getElementById('residueInsertBtn');
    const residueDeleteBtn  = document.getElementById('residueDeleteBtn');
    const residueSearchBtn  = document.getElementById('residueSearchBtn');
    const residueResetBtn   = document.getElementById('residueResetBtn');

    if (residuosController._updateNInfo) {
        residuosController._updateNInfo(2);
    }

    if (residueChangeNBtn) {
        residueChangeNBtn.addEventListener('click', () => {
            const n = document.getElementById('residueN').value;
            residuosController.changeN(n);
        });
    }
    if (residueInsertBtn) {
        residueInsertBtn.addEventListener('click', () => {
            const word = document.getElementById('residueWord').value;
            residuosController.insertWord(word);
            document.getElementById('residueWord').value = '';
        });
    }
    if (residueDeleteBtn) {
        residueDeleteBtn.addEventListener('click', () => {
            const char = document.getElementById('residueDeleteChar').value;
            residuosController.deleteChar(char);
            document.getElementById('residueDeleteChar').value = '';
        });
    }
    if (residueSearchBtn) {
        residueSearchBtn.addEventListener('click', () => {
            const char = document.getElementById('residueSearchChar').value;
            residuosController.searchChar(char);
        });
    }
    if (residueResetBtn) {
        residueResetBtn.addEventListener('click', () => {
            residuosController.reset();
        });
    }

    // GUARDAR ARREGLO EN PDF
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
            const stats = arrayModel.getStats();
            const fecha = new Date().toLocaleString('es-CO');

            doc.setFontSize(18);
            doc.setTextColor(75, 108, 183);
            doc.text('Ciencias de la Computación 2', 105, 20, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('Arreglo Guardado', 105, 30, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Fecha: ${fecha}`, 105, 38, { align: 'center' });

            doc.setDrawColor(75, 108, 183);
            doc.setLineWidth(0.5);
            doc.line(20, 42, 190, 42);

            doc.setFontSize(11);
            doc.setTextColor(40, 40, 40);
            doc.text(`Total de elementos: ${stats.length}`, 20, 52);
            doc.text(`Mínimo: ${stats.min}   |   Máximo: ${stats.max}   |   Suma: ${stats.sum}`, 20, 60);

            doc.setDrawColor(200, 200, 200);
            doc.line(20, 64, 190, 64);

            doc.setFontSize(11);
            doc.setTextColor(40, 40, 40);
            doc.text('Contenido del arreglo:', 20, 72);

            const colsPerRow = 10;
            let y = 80;
            let rowText = '';
            for (let i = 0; i < arr.length; i++) {
                rowText += `[${i + 1}]:${arr[i]}  `;
                if ((i + 1) % colsPerRow === 0 || i === arr.length - 1) {
                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    doc.text(rowText.trim(), 20, y);
                    y += 8;
                    rowText = '';
                    if (y > 260) { doc.addPage(); y = 20; }
                }
            }

            const dataMarker = `##ARREGLO_DATA##${JSON.stringify(arr)}##END##`;
            doc.setFontSize(6);
            doc.setTextColor(200, 200, 200);

            const chunkSize = 180;
            let dataY = y + 10;
            for (let i = 0; i < dataMarker.length; i += chunkSize) {
                const chunk = dataMarker.substring(i, i + chunkSize);
                doc.text(chunk, 15, dataY);
                dataY += 5;
                if (dataY > 285) { doc.addPage(); dataY = 15; }
            }

            const pageCount = doc.internal.getNumberOfPages();
            for (let p = 1; p <= pageCount; p++) {
                doc.setPage(p);
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text('Aplicativo - Ciencias de la Computación 2', 105, 292, { align: 'center' });
            }

            doc.save(`arreglo_${Date.now()}.pdf`);
            showNotification('Arreglo guardado como PDF ✓', 'success');
        });
    }

    // RECUPERAR ARREGLO DESDE PDF
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
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                let fullText = '';
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page    = await pdf.getPage(pageNum);
                    const content = await page.getTextContent();
                    const pageText = content.items.map(item => item.str).join('');
                    fullText += pageText;
                }

                const startMarker = '##ARREGLO_DATA##';
                const endMarker   = '##END##';
                const startIdx    = fullText.indexOf(startMarker);
                const endIdx      = fullText.indexOf(endMarker);

                if (startIdx === -1 || endIdx === -1) {
                    const oldMarker  = 'ARREGLO_DATA:';
                    const oldIdx     = fullText.indexOf(oldMarker);
                    if (oldIdx !== -1) {
                        const jsonStart = oldIdx + oldMarker.length;
                        const jsonEnd   = fullText.indexOf(']', jsonStart) + 1;
                        const jsonStr   = fullText.substring(jsonStart, jsonEnd).replace(/\s+/g, '');
                        try {
                            const recovered = JSON.parse(jsonStr);
                            if (Array.isArray(recovered) && recovered.length > 0) {
                                arrayModel.setArray(recovered);
                                arrayView.displayArray(arrayModel.getArray());
                                arrayView.updateStats(arrayModel.getStats());
                                searchController.reset();
                                showNotification(`Arreglo recuperado: ${recovered.length} elementos ✓`, 'success');
                                return;
                            }
                        } catch(e) { /* sigue */ }
                    }
                    showNotification('No se encontraron datos en el PDF. ¿Es un PDF guardado con esta app?', 'error');
                    return;
                }

                const jsonStr = fullText
                    .substring(startIdx + startMarker.length, endIdx)
                    .replace(/\s+/g, '');

                const recoveredArr = JSON.parse(jsonStr);

                if (!Array.isArray(recoveredArr) || recoveredArr.length === 0) {
                    showNotification('Datos inválidos en el PDF', 'error');
                    return;
                }

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

    // IMPRIMIR
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