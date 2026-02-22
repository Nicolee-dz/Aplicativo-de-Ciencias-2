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

    // Ocultar/mostrar secciones según pestaña
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
            if (targetId === '#hash' || targetId === '#digital') {
                toggleDataSections(false);
            } else {
                toggleDataSections(true);
            }
        });
    });

    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab && (activeTab.getAttribute('data-bs-target') === '#hash' || activeTab.getAttribute('data-bs-target') === '#digital')) {
        toggleDataSections(false);
    } else {
        toggleDataSections(true);
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

    // Inicializar hash
    hashController.reset();

    // Mostrar menú principal al inicio
    showContainer(menuPrincipal);
});