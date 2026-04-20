document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando app.js');

    const menuPrincipal = document.getElementById('menu-principal');
    const submenuBusquedas = document.getElementById('submenu-busquedas');
    const submenuGrafos = document.getElementById('submenu-grafos');
    const appContainer = document.getElementById('app-container');
    const appExternas  = document.getElementById('app-externas');
    const appArboles   = document.getElementById('app-arboles');

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

    // Huffman
    const huffmanModel      = new HuffmanModel();
    const huffmanView       = new HuffmanView('huffmanTreeContainer');
    const huffmanController = new HuffmanController(huffmanModel, huffmanView);
    window.huffmanController = huffmanController;

    const searchController = new SearchController(arrayModel, arrayView);
    const hashController = new HashController(hashModel, hashView);

    searchController.init();
    hashController.init();
    digitalController.init();
    triesController.init();
    residuosController.init();
    huffmanController.init();

    // Búsqueda Secuencial Externa
    const extSeqModel      = new ExternalSeqModel();
    const extSeqView       = new ExternalSeqView();
    const extSeqController = new ExternalSeqController(extSeqModel, extSeqView);
    extSeqController.init();

    // Búsqueda Binaria Externa
    const extBinModel      = new ExternalBinModel();
    const extBinView       = new ExternalBinView();
    const extBinController = new ExternalBinController(extBinModel, extBinView);
    extBinController.init();

    // External Hash
    const extHashModel = new ExternalHashModel();
    const extHashView = new ExternalHashView('extHashBlocksContainer');
    const extHashController = new ExternalHashController(extHashModel, extHashView);
    extHashController.init();

    // Eventos para hash externo
    const extHashNumBlocks = document.getElementById('extHashNumBlocks');
    const extHashBlockSize = document.getElementById('extHashBlockSize');
    const extHashFunction = document.getElementById('extHashFunction');
    const extHashCollision = document.getElementById('extHashCollision');
    const extHashApplyConfig = document.getElementById('extHashApplyConfig');
    const extHashInsertBtn = document.getElementById('extHashInsertBtn');
    const extHashSearchBtn = document.getElementById('extHashSearchBtn');
    const extHashRemoveBtn = document.getElementById('extHashRemoveBtn');
    const extHashResetBtn = document.getElementById('extHashResetBtn');
    const extHashSaveBtn = document.getElementById('extHashSaveBtn');
    const extHashPrintBtn = document.getElementById('extHashPrintBtn');
    const extHashKeyVal = document.getElementById('extHashKeyVal');
    const extHashDigits = document.getElementById('extHashDigits');

    if (extHashApplyConfig) {
        extHashApplyConfig.addEventListener('click', () => {
            const numBlocks = parseInt(extHashNumBlocks.value) || 5;
            const blockSize = parseInt(extHashBlockSize.value) || 4;
            extHashController.applyConfig(numBlocks, blockSize);
        });
    }
    if (extHashFunction) {
        extHashFunction.addEventListener('change', () => {
            extHashController.setHashFunction(extHashFunction.value);
        });
    }
    if (extHashCollision) {
        extHashCollision.addEventListener('change', () => {
            extHashController.setCollisionMethod(extHashCollision.value);
        });
    }
    if (extHashInsertBtn && extHashKeyVal && extHashDigits) {
        extHashInsertBtn.addEventListener('click', () => {
            const val = extHashKeyVal.value;
            const digits = parseInt(extHashDigits.value) || 3;
            extHashController.insert(val, digits);
            extHashKeyVal.value = '';
        });
    }
    if (extHashSearchBtn && extHashKeyVal && extHashDigits) {
        extHashSearchBtn.addEventListener('click', () => {
            const val = extHashKeyVal.value;
            const digits = parseInt(extHashDigits.value) || 3;
            extHashController.search(val, digits);
        });
    }
    if (extHashRemoveBtn && extHashKeyVal && extHashDigits) {
        extHashRemoveBtn.addEventListener('click', () => {
            const val = extHashKeyVal.value;
            const digits = parseInt(extHashDigits.value) || 3;
            extHashController.remove(val, digits);
            extHashKeyVal.value = '';
        });
    }
    if (extHashResetBtn) {
        extHashResetBtn.addEventListener('click', () => {
            extHashController.reset();
        });
    }
    if (extHashSaveBtn) {
        extHashSaveBtn.addEventListener('click', () => extHashController.save());
    }
    if (extHashPrintBtn) {
        extHashPrintBtn.addEventListener('click', () => extHashController.print());
    }

    // También añadir la función para tecla Enter en el input de clave hash externa
    if (extHashKeyVal) {
        extHashKeyVal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = extHashKeyVal.value;
                const digits = parseInt(extHashDigits.value) || 3;
                extHashController.insert(val, digits);
                extHashKeyVal.value = '';
            }
        });
    }

    function showContainer(container) {
        console.log('Mostrando contenedor:', container.id);
        [menuPrincipal, submenuBusquedas, submenuGrafos, appContainer, appExternas, appGrafos, appArboles].forEach(c => {
            if (c) {
                if (c !== container) {
                    c.style.display = 'none';
                } else if (c === appExternas || c === appContainer || c === appGrafos || c === appArboles) {
                    c.style.display = 'block';
                } else {
                    c.style.display = 'flex';
                }
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
            showContainer(submenuGrafos);
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
            showContainer(appExternas);
        });
    }

    // Volver al submenú desde Externas
    const volverSubmenuExt = document.getElementById('volver-submenu-ext');
    if (volverSubmenuExt) {
        volverSubmenuExt.addEventListener('click', () => {
            showContainer(submenuBusquedas);
        });
    }

    // ── Eventos Búsqueda Secuencial Externa ───────────────
    const extSeqApplyBlockBtn = document.getElementById('extSeqApplyBlockBtn');
    const extSeqInsertBtn     = document.getElementById('extSeqInsertBtn');
    const extSeqRemoveBtn     = document.getElementById('extSeqRemoveBtn');
    const extSeqSearchBtn     = document.getElementById('extSeqSearchBtn');
    const extSeqResetBtn      = document.getElementById('extSeqResetBtn');
    const extSeqSaveBtn       = document.getElementById('extSeqSaveBtn');
    const extSeqRecoverBtn    = document.getElementById('extSeqRecoverBtn');
    const extSeqPrintBtn      = document.getElementById('extSeqPrintBtn');
    const extSeqPdfInput      = document.getElementById('extSeqPdfInput');

    if (extSeqApplyBlockBtn) {
        extSeqApplyBlockBtn.addEventListener('click', () => {
            const size = document.getElementById('extSeqBlockSize').value;
            extSeqController.applyBlockSize(size);
        });
    }
    if (extSeqInsertBtn) {
        extSeqInsertBtn.addEventListener('click', () => {
            const val    = document.getElementById('extSeqKeyVal').value;
            const range  = parseInt(document.getElementById('extSeqRange').value) || 10;
            const digits = parseInt(document.getElementById('extSeqDigits').value) || 3;
            if (extSeqModel.records.length >= range) {
                showNotification(`Rango máximo alcanzado (${range} claves)`, 'error');
                return;
            }
            if (String(Math.abs(parseInt(val))).length !== digits) {
                showNotification(`La clave debe tener exactamente ${digits} dígito(s)`, 'error');
                return;
            }
            extSeqController.insert(val);
            document.getElementById('extSeqKeyVal').value = '';
        });
    }

    // Enter en el input inserta automáticamente
    const extSeqKeyValInput = document.getElementById('extSeqKeyVal');
    if (extSeqKeyValInput) {
        extSeqKeyValInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val    = extSeqKeyValInput.value;
                const range  = parseInt(document.getElementById('extSeqRange').value) || 10;
                const digits = parseInt(document.getElementById('extSeqDigits').value) || 3;
                if (extSeqModel.records.length >= range) {
                    showNotification(`Rango máximo alcanzado (${range} claves)`, 'error');
                    return;
                }
                if (String(Math.abs(parseInt(val))).length !== digits) {
                    showNotification(`La clave debe tener exactamente ${digits} dígito(s)`, 'error');
                    return;
                }
                extSeqController.insert(val);
                extSeqKeyValInput.value = '';
            }
        });
    }
    if (extSeqRemoveBtn) {
        extSeqRemoveBtn.addEventListener('click', () => {
            const val = document.getElementById('extSeqKeyVal').value;
            extSeqController.remove(val);
            document.getElementById('extSeqKeyVal').value = '';
        });
    }
    if (extSeqSearchBtn) {
        extSeqSearchBtn.addEventListener('click', () => {
            const val = document.getElementById('extSeqKeyVal').value;
            extSeqController.search(val);
        });
    }
    if (extSeqResetBtn) {
        extSeqResetBtn.addEventListener('click', () => {
            extSeqController.reset();
            document.getElementById('extSeqKeyVal').value = '';
        });
    }
    if (extSeqSaveBtn) {
        extSeqSaveBtn.addEventListener('click', () => extSeqController.save());
    }
    if (extSeqRecoverBtn && extSeqPdfInput) {
        extSeqRecoverBtn.addEventListener('click', () => {
            extSeqPdfInput.value = '';
            extSeqPdfInput.click();
        });
        extSeqPdfInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) extSeqController.recover(file);
        });
    }
    if (extSeqPrintBtn) {
        extSeqPrintBtn.addEventListener('click', () => extSeqController.print());
    }

    // ── Eventos Búsqueda Binaria Externa ─────────────────
    const extBinApplyBlockBtn = document.getElementById('extBinApplyBlockBtn');
    const extBinInsertBtn     = document.getElementById('extBinInsertBtn');
    const extBinRemoveBtn     = document.getElementById('extBinRemoveBtn');
    const extBinSearchBtn     = document.getElementById('extBinSearchBtn');
    const extBinResetBtn      = document.getElementById('extBinResetBtn');
    const extBinSaveBtn       = document.getElementById('extBinSaveBtn');
    const extBinRecoverBtn    = document.getElementById('extBinRecoverBtn');
    const extBinPrintBtn      = document.getElementById('extBinPrintBtn');
    const extBinPdfInput      = document.getElementById('extBinPdfInput');

    if (extBinApplyBlockBtn) {
        extBinApplyBlockBtn.addEventListener('click', () => {
            const size = document.getElementById('extBinBlockSize').value;
            extBinController.applyBlockSize(size);
        });
    }
    if (extBinInsertBtn) {
        extBinInsertBtn.addEventListener('click', () => {
            const val    = document.getElementById('extBinKeyVal').value;
            const range  = parseInt(document.getElementById('extBinRange').value) || 10;
            const digits = parseInt(document.getElementById('extBinDigits').value) || 3;
            if (extBinModel.records.length >= range) {
                showNotification(`Rango máximo alcanzado (${range} claves)`, 'error');
                return;
            }
            if (String(Math.abs(parseInt(val))).length !== digits) {
                showNotification(`La clave debe tener exactamente ${digits} dígito(s)`, 'error');
                return;
            }
            extBinController.insert(val);
            document.getElementById('extBinKeyVal').value = '';
        });
    }

    // Enter en el input inserta automáticamente
    const extBinKeyValInput = document.getElementById('extBinKeyVal');
    if (extBinKeyValInput) {
        extBinKeyValInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val    = extBinKeyValInput.value;
                const range  = parseInt(document.getElementById('extBinRange').value) || 10;
                const digits = parseInt(document.getElementById('extBinDigits').value) || 3;
                if (extBinModel.records.length >= range) {
                    showNotification(`Rango máximo alcanzado (${range} claves)`, 'error');
                    return;
                }
                if (String(Math.abs(parseInt(val))).length !== digits) {
                    showNotification(`La clave debe tener exactamente ${digits} dígito(s)`, 'error');
                    return;
                }
                extBinController.insert(val);
                extBinKeyValInput.value = '';
            }
        });
    }

    if (extBinRemoveBtn) {
        extBinRemoveBtn.addEventListener('click', () => {
            const val = document.getElementById('extBinKeyVal').value;
            extBinController.remove(val);
            document.getElementById('extBinKeyVal').value = '';
        });
    }
    if (extBinSearchBtn) {
        extBinSearchBtn.addEventListener('click', () => {
            const val = document.getElementById('extBinKeyVal').value;
            extBinController.search(val);
        });
    }
    if (extBinResetBtn) {
        extBinResetBtn.addEventListener('click', () => {
            extBinController.reset();
            document.getElementById('extBinKeyVal').value = '';
        });
    }
    if (extBinSaveBtn) {
        extBinSaveBtn.addEventListener('click', () => extBinController.save());
    }
    if (extBinRecoverBtn && extBinPdfInput) {
        extBinRecoverBtn.addEventListener('click', () => {
            extBinPdfInput.value = '';
            extBinPdfInput.click();
        });
        extBinPdfInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) extBinController.recover(file);
        });
    }
    if (extBinPrintBtn) {
        extBinPrintBtn.addEventListener('click', () => extBinController.print());
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
    const arrayRangeInput = document.getElementById('arrayRange');
    const arrayDigitsInput = document.getElementById('arrayDigits');
    const addSingleValue = document.getElementById('addSingleValue');
    const addSingleBtn = document.getElementById('addSingleBtn');
    const searchSingleBtn = document.getElementById('searchSingleBtn');

    // Configurar rango máximo del arreglo
    if (arrayRangeInput) {
        const applyRange = () => {
            const range = Math.max(1, Math.min(10000, parseInt(arrayRangeInput.value) || 150));
            arrayRangeInput.value = range;
            arrayModel.maxSize = range;

            // Si el arreglo ya supera el nuevo rango, recortar para mantener consistencia
            if (arrayModel.getArray().length > range) {
                const trimmed = arrayModel.getArray().slice(0, range);
                arrayModel.setArray(trimmed);
                arrayView.displayArray(arrayModel.getArray());
                arrayView.updateStats(arrayModel.getStats());
                searchController.reset();
                showNotification(`Arreglo ajustado al rango ${range}`, 'info');
            }
        };

        applyRange();
        arrayRangeInput.addEventListener('change', applyRange);
    }

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
                showNotification(`No se pudo agregar (duplicado o rango máximo ${arrayModel.maxSize})`, 'error');
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

    // Búsqueda desde la clave principal (usa la pestaña activa)
    if (searchSingleBtn && addSingleValue && arrayDigitsInput) {
        searchSingleBtn.addEventListener('click', () => {
            const val = parseInt(addSingleValue.value);
            const digits = parseInt(arrayDigitsInput.value) || 3;
            if (isNaN(val)) {
                showNotification('Ingresa un valor válido', 'error');
                return;
            }
            if (Math.abs(val).toString().length !== digits) {
                showNotification(`El valor a buscar debe tener exactamente ${digits} dígito(s)`, 'error');
                return;
            }

            const activeTarget = document.querySelector('.nav-link.active')?.getAttribute('data-bs-target');
            if (activeTarget === '#binary') {
                searchController.startBinary(val);
            } else {
                searchController.startSequential(val);
            }
        });
    }

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
    const hashCollision = document.getElementById('hashCollision');
    if (hashCollision) {
        hashCollision.addEventListener('change', () => {
            hashController.changeCollisionMethod(hashCollision.value);
        });
    }
    const hashInsertBtn = document.getElementById('hashInsertBtn');
    const hashSearchBtn = document.getElementById('hashSearchBtn');
    const hashResetBtn = document.getElementById('hashResetBtn');
    const hashKey = document.getElementById('hashKey');
    const hashDigits = document.getElementById('hashDigits');
    // Descripciones de función hash y colisión
    const hashFunctionSelect = document.getElementById('hashFunction');
    const hashCollisionSelect = document.getElementById('hashCollision');
    if (hashCollisionSelect) {
        hashCollisionSelect.addEventListener('change', () => {
            hashController.changeCollisionMethod(hashCollisionSelect.value);
        });
    }
    const hashFunctionDesc = document.getElementById('hashFunctionDesc');
    const hashCollisionDesc = document.getElementById('hashCollisionDesc');

    if (hashFunctionSelect && hashFunctionDesc) {
        const updateHashFunctionDesc = () => {
            const func = hashFunctionSelect.value;
            hashFunctionDesc.innerHTML = `<small><strong>${func.charAt(0).toUpperCase() + func.slice(1)}:</strong> ${hashController.getHashFunctionDescription(func)}</small>`;
        };
        hashFunctionSelect.addEventListener('change', updateHashFunctionDesc);
        updateHashFunctionDesc(); // inicial
    }

    if (hashCollisionSelect && hashCollisionDesc) {
        const updateCollisionDesc = () => {
            const method = hashCollisionSelect.value;
            hashCollisionDesc.innerHTML = `<small><strong>${method.charAt(0).toUpperCase() + method.slice(1)}:</strong> ${hashController.getCollisionMethodDescription(method)}</small>`;
        };
        hashCollisionSelect.addEventListener('change', updateCollisionDesc);
        updateCollisionDesc(); // inicial
    }

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
    bindEnterToButton('hashKey', 'hashInsertBtn');
    bindEnterToButton('digitalWord', 'digitalInsertBtn');
    bindEnterToButton('triesWord', 'triesInsertBtn');
    bindEnterToButton('residueWord', 'residueInsertBtn');
    bindEnterToButton('huffTextInput', 'huffBuildTextBtn');

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
            const char = document.getElementById('digitalWord').value;
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
            const char = document.getElementById('digitalWord').value;
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
                document.getElementById('digitalWord').value = '';
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
            const char = document.getElementById('triesWord').value;
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
            const char = document.getElementById('triesWord').value;
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
                document.getElementById('triesWord').value = '';
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
            const char = document.getElementById('residueWord').value;
            residuosController.deleteChar(char);
            document.getElementById('residueWord').value = '';
        });
    }
    if (residueSearchBtn) {
        residueSearchBtn.addEventListener('click', () => {
            const char = document.getElementById('residueWord').value;
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

    // ══════════════════════════════════════════
    // HUFFMAN
    // ══════════════════════════════════════════
    const huffBuildTextBtn = document.getElementById('huffBuildTextBtn');
    const huffResetBtn     = document.getElementById('huffResetBtn');

    if (huffBuildTextBtn) huffBuildTextBtn.addEventListener('click', () => huffmanController.buildFromText());
    if (huffResetBtn)     huffResetBtn.addEventListener('click',     () => huffmanController.reset());

    // ==================== SECCIÓN GRAFOS ====================
    // Inicializar modelos, vistas y controladores de grafos
    const graphModel = new GraphModel();
    const graphView = new GraphView('graphContainer', 520, 320);
    const graphController = new GraphController(graphModel, graphView);
    graphController.init();

    const graphAuxModel = new GraphModel();
    const graphAuxView = new GraphView('graphAuxContainer', 520, 320);
    const graphAuxController = new GraphController(graphAuxModel, graphAuxView);
    graphAuxController.init();

    const graphResultView = new GraphView('graphResultContainer', 520, 320);

    const updateGraphSetRepresentation = () => {
        const gV = document.getElementById('graphSetS');
        const gE = document.getElementById('graphSetA');
        const hV = document.getElementById('graphAuxSetS');
        const hE = document.getElementById('graphAuxSetA');

        const gVertices = graphController.model.getVertices();
        const gEdges = graphController.model.getEdges();
        const hVertices = graphAuxController.model.getVertices();
        const hEdges = graphAuxController.model.getEdges();

        if (gV) gV.textContent = gVertices.length ? gVertices.join(', ') : '—';
        if (gE) gE.textContent = gEdges.length ? gEdges.map(e => `(${e.from}, ${e.to})`).join(', ') : '—';
        if (hV) hV.textContent = hVertices.length ? hVertices.join(', ') : '—';
        if (hE) hE.textContent = hEdges.length ? hEdges.map(e => `(${e.from}, ${e.to})`).join(', ') : '—';
    };

    const updateGraphResultSetRepresentation = (model, title = 'Resultado de Operación') => {
        const titleEl = document.getElementById('graphResultTitle');
        const sEl = document.getElementById('graphResultSetS');
        const aEl = document.getElementById('graphResultSetA');

        const verts = model.getVertices();
        const edges = model.getEdges();

        if (titleEl) titleEl.textContent = title;
        if (sEl) sEl.textContent = verts.length ? verts.join(', ') : '—';
        if (aEl) aEl.textContent = edges.length ? edges.map(e => `(${e.from}, ${e.to})`).join(', ') : '—';
    };

    const clearGraphResult = () => {
        const empty = new GraphModel();
        graphResultView.render(empty);
        updateGraphResultSetRepresentation(empty, 'Resultado de Operación');
    };

    const renderGraphResult = (model, title) => {
        graphResultView.render(model);
        updateGraphResultSetRepresentation(model, title);
    };

    updateGraphSetRepresentation();
    clearGraphResult();

    // Navegación: submenú grafos y app-grafos
    const appGrafos = document.getElementById('app-grafos');
    const volverMenuPrincipalDesdeGrafos = document.getElementById('volver-menu-principal-desde-grafos');
    const volverSubmenuGrafos = document.getElementById('volver-submenu-grafos');
    const btnGrafosOperaciones = document.getElementById('btn-grafos-operaciones');
    const btnGrafosArboles = document.getElementById('btn-grafos-arboles');
    const btnGrafosAlgoritmos = document.getElementById('btn-grafos-algoritmos');
    const btnGrafosMatrices = document.getElementById('btn-grafos-matrices');

    if (volverMenuPrincipalDesdeGrafos) {
        volverMenuPrincipalDesdeGrafos.addEventListener('click', () => {
            showContainer(menuPrincipal);
        });
    }
    if (volverSubmenuGrafos) {
        volverSubmenuGrafos.addEventListener('click', () => {
            showContainer(submenuGrafos);
        });
    }
    if (btnGrafosOperaciones) {
        btnGrafosOperaciones.addEventListener('click', () => {
            showContainer(appGrafos);
            graphController.view.render(graphController.model);
            graphAuxController.view.render(graphAuxController.model);
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (btnGrafosArboles) {
        btnGrafosArboles.addEventListener('click', () => {
            showContainer(appArboles);
            cbController.init();
            stController.init();
        });
    }
    if (btnGrafosAlgoritmos) {
        btnGrafosAlgoritmos.addEventListener('click', () => {
            showNotification('Módulo Algoritmos: próximamente', 'warning');
        });
    }
    if (btnGrafosMatrices) {
        btnGrafosMatrices.addEventListener('click', () => {
            showNotification('Módulo Matrices: próximamente', 'warning');
        });
    }

    // ══════════════════════════════════════════
    // ÁRBOLES DE EXPANSIÓN
    // ══════════════════════════════════════════
    const stModel    = new SpanningTreeModel();
    const stMainView = new SpanningTreeView('stMainContainer', 760, 250);
    const stMinView  = new SpanningTreeView('stMinContainer',  380, 235);
    const stMaxView  = new SpanningTreeView('stMaxContainer',  380, 235);
    const stController = new SpanningTreeController(stModel, stMainView, stMinView, stMaxView);

    const cbModel = new GraphModel();
    const cbView = new GraphView('cbMainContainer', 760, 240);
    const cbController = new CenterBicentroController(cbModel, cbView);
    cbController.init();

    const tdModel = new TreeDistanceModel();
    const tdViewA = new SpanningTreeView('tdAContainer', 380, 250);
    const tdViewB = new SpanningTreeView('tdBContainer', 380, 250);
    const tdViewC = new SpanningTreeView('tdCContainer', 380, 250);
    const tdViewD = new SpanningTreeView('tdDContainer', 380, 250);
    const tdController = new TreeDistanceController(tdModel, tdViewA, tdViewB, tdViewC, tdViewD);
    tdController.init();

    // Botón volver desde app-arboles
    const volverSubmenuArboles = document.getElementById('volver-submenu-arboles');
    if (volverSubmenuArboles) {
        volverSubmenuArboles.addEventListener('click', () => showContainer(submenuGrafos));
    }

    // Helper para leer y limpiar un input
    const stVal = id => document.getElementById(id)?.value || '';
    const stClear = (...ids) => ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    // ── Vértices ──
    const stAddVertexBtn    = document.getElementById('stAddVertexBtn');
    const stRemoveVertexBtn = document.getElementById('stRemoveVertexBtn');
    const stVertexInput     = document.getElementById('stVertexInput');

    if (stAddVertexBtn) {
        stAddVertexBtn.addEventListener('click', () => {
            stController.addVertex(stVal('stVertexInput'));
            stClear('stVertexInput');
        });
    }
    if (stVertexInput) {
        stVertexInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') { stController.addVertex(stVal('stVertexInput')); stClear('stVertexInput'); }
        });
    }
    if (stRemoveVertexBtn) {
        stRemoveVertexBtn.addEventListener('click', () => {
            stController.removeVertex(stVal('stVertexInput'));
            stClear('stVertexInput');
        });
    }

    // ── Aristas ──
    const stAddEdgeBtn    = document.getElementById('stAddEdgeBtn');
    const stRemoveEdgeBtn = document.getElementById('stRemoveEdgeBtn');
    const stEdgeWeight    = document.getElementById('stEdgeWeight');

    const doAddEdge = () => {
        stController.addEdge(stVal('stEdgeFrom'), stVal('stEdgeTo'), stVal('stEdgeWeight'));
        stClear('stEdgeFrom', 'stEdgeTo', 'stEdgeWeight');
    };
    const doRemoveEdge = () => {
        stController.removeEdge(stVal('stEdgeFrom'), stVal('stEdgeTo'));
        stClear('stEdgeFrom', 'stEdgeTo', 'stEdgeWeight');
    };

    if (stAddEdgeBtn)    stAddEdgeBtn.addEventListener('click', doAddEdge);
    if (stRemoveEdgeBtn) stRemoveEdgeBtn.addEventListener('click', doRemoveEdge);

    // Enter en cualquier campo de arista → agregar
    ['stEdgeFrom', 'stEdgeTo', 'stEdgeWeight'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doAddEdge(); });
    });

    // ── Calcular / Limpiar ──
    const stCalculateBtn = document.getElementById('stCalculateBtn');
    const stResetBtn     = document.getElementById('stResetBtn');
    if (stCalculateBtn) stCalculateBtn.addEventListener('click', () => stController.calculate());
    if (stResetBtn)     stResetBtn.addEventListener('click',     () => stController.reset());

    // ══════════════════════════════════════════
    // CENTRO O BICENTRO
    // ══════════════════════════════════════════
    const cbVal = id => document.getElementById(id)?.value || '';
    const cbClear = (...ids) => ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const cbAddVertexBtn = document.getElementById('cbAddVertexBtn');
    const cbRemoveVertexBtn = document.getElementById('cbRemoveVertexBtn');
    const cbVertexInput = document.getElementById('cbVertexInput');

    if (cbAddVertexBtn) {
        cbAddVertexBtn.addEventListener('click', () => {
            cbController.addVertex(cbVal('cbVertexInput'));
            cbClear('cbVertexInput');
        });
    }
    if (cbVertexInput) {
        cbVertexInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                cbController.addVertex(cbVal('cbVertexInput'));
                cbClear('cbVertexInput');
            }
        });
    }
    if (cbRemoveVertexBtn) {
        cbRemoveVertexBtn.addEventListener('click', () => {
            cbController.removeVertex(cbVal('cbVertexInput'));
            cbClear('cbVertexInput');
        });
    }

    const cbAddEdgeBtn = document.getElementById('cbAddEdgeBtn');
    const cbRemoveEdgeBtn = document.getElementById('cbRemoveEdgeBtn');

    const doCbAddEdge = () => {
        cbController.addEdge(cbVal('cbEdgeFrom'), cbVal('cbEdgeTo'));
        cbClear('cbEdgeFrom', 'cbEdgeTo');
    };

    const doCbRemoveEdge = () => {
        cbController.removeEdge(cbVal('cbEdgeFrom'), cbVal('cbEdgeTo'));
        cbClear('cbEdgeFrom', 'cbEdgeTo');
    };

    if (cbAddEdgeBtn) cbAddEdgeBtn.addEventListener('click', doCbAddEdge);
    if (cbRemoveEdgeBtn) cbRemoveEdgeBtn.addEventListener('click', doCbRemoveEdge);

    ['cbEdgeFrom', 'cbEdgeTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doCbAddEdge(); });
    });

    const cbCalculateBtn = document.getElementById('cbCalculateBtn');
    const cbResetBtn = document.getElementById('cbResetBtn');
    if (cbCalculateBtn) cbCalculateBtn.addEventListener('click', () => cbController.calculate());
    if (cbResetBtn) cbResetBtn.addEventListener('click', () => cbController.reset());

    // ══════════════════════════════════════════
    // DISTANCIA ENTRE ÁRBOLES
    // ══════════════════════════════════════════
    const tdVal = id => document.getElementById(id)?.value || '';
    const tdClear = (...ids) => ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const tdAddVertexBtnA = document.getElementById('tdAddVertexBtnA');
    const tdRemoveVertexBtnA = document.getElementById('tdRemoveVertexBtnA');
    const tdVertexInputA = document.getElementById('tdVertexInputA');

    if (tdAddVertexBtnA) {
        tdAddVertexBtnA.addEventListener('click', () => {
            tdController.addVertex('A', tdVal('tdVertexInputA'));
            tdClear('tdVertexInputA');
        });
    }
    if (tdVertexInputA) {
        tdVertexInputA.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                tdController.addVertex('A', tdVal('tdVertexInputA'));
                tdClear('tdVertexInputA');
            }
        });
    }
    if (tdRemoveVertexBtnA) {
        tdRemoveVertexBtnA.addEventListener('click', () => {
            tdController.removeVertex('A', tdVal('tdVertexInputA'));
            tdClear('tdVertexInputA');
        });
    }

    const tdAddEdgeBtnA = document.getElementById('tdAddEdgeBtnA');
    const tdRemoveEdgeBtnA = document.getElementById('tdRemoveEdgeBtnA');

    const doTdAddEdgeA = () => {
        tdController.addEdge('A', tdVal('tdEdgeFromA'), tdVal('tdEdgeToA'), tdVal('tdEdgeWeightA'));
        tdClear('tdEdgeFromA', 'tdEdgeToA', 'tdEdgeWeightA');
    };

    const doTdRemoveEdgeA = () => {
        tdController.removeEdge('A', tdVal('tdEdgeFromA'), tdVal('tdEdgeToA'));
        tdClear('tdEdgeFromA', 'tdEdgeToA', 'tdEdgeWeightA');
    };

    if (tdAddEdgeBtnA) tdAddEdgeBtnA.addEventListener('click', doTdAddEdgeA);
    if (tdRemoveEdgeBtnA) tdRemoveEdgeBtnA.addEventListener('click', doTdRemoveEdgeA);

    ['tdEdgeFromA', 'tdEdgeToA', 'tdEdgeWeightA'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => {
            if (e.key === 'Enter') doTdAddEdgeA();
        });
    });

    const tdAddVertexBtnB = document.getElementById('tdAddVertexBtnB');
    const tdRemoveVertexBtnB = document.getElementById('tdRemoveVertexBtnB');
    const tdVertexInputB = document.getElementById('tdVertexInputB');

    if (tdAddVertexBtnB) {
        tdAddVertexBtnB.addEventListener('click', () => {
            tdController.addVertex('B', tdVal('tdVertexInputB'));
            tdClear('tdVertexInputB');
        });
    }
    if (tdVertexInputB) {
        tdVertexInputB.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                tdController.addVertex('B', tdVal('tdVertexInputB'));
                tdClear('tdVertexInputB');
            }
        });
    }
    if (tdRemoveVertexBtnB) {
        tdRemoveVertexBtnB.addEventListener('click', () => {
            tdController.removeVertex('B', tdVal('tdVertexInputB'));
            tdClear('tdVertexInputB');
        });
    }

    const tdAddEdgeBtnB = document.getElementById('tdAddEdgeBtnB');
    const tdRemoveEdgeBtnB = document.getElementById('tdRemoveEdgeBtnB');

    const doTdAddEdgeB = () => {
        tdController.addEdge('B', tdVal('tdEdgeFromB'), tdVal('tdEdgeToB'), tdVal('tdEdgeWeightB'));
        tdClear('tdEdgeFromB', 'tdEdgeToB', 'tdEdgeWeightB');
    };

    const doTdRemoveEdgeB = () => {
        tdController.removeEdge('B', tdVal('tdEdgeFromB'), tdVal('tdEdgeToB'));
        tdClear('tdEdgeFromB', 'tdEdgeToB', 'tdEdgeWeightB');
    };

    if (tdAddEdgeBtnB) tdAddEdgeBtnB.addEventListener('click', doTdAddEdgeB);
    if (tdRemoveEdgeBtnB) tdRemoveEdgeBtnB.addEventListener('click', doTdRemoveEdgeB);

    ['tdEdgeFromB', 'tdEdgeToB', 'tdEdgeWeightB'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => {
            if (e.key === 'Enter') doTdAddEdgeB();
        });
    });

    const tdCalculateBtn = document.getElementById('tdCalculateBtn');
    const tdResetBtn = document.getElementById('tdResetBtn');

    if (tdCalculateBtn) tdCalculateBtn.addEventListener('click', () => tdController.calculateDistance());
    if (tdResetBtn) tdResetBtn.addEventListener('click', () => tdController.reset());


    const graphVertexInput = document.getElementById('graphVertexInput');
    const graphAddVertexBtn = document.getElementById('graphAddVertexBtn');
    const graphRemoveVertexBtn = document.getElementById('graphRemoveVertexBtn');
    const graphEdgeFrom = document.getElementById('graphEdgeFrom');
    const graphEdgeTo = document.getElementById('graphEdgeTo');
    const graphAddEdgeBtn = document.getElementById('graphAddEdgeBtn');
    const graphRemoveEdgeBtn = document.getElementById('graphRemoveEdgeBtn');
    const graphClearBtn = document.getElementById('graphClearBtn');
    const graphExampleSelect = document.getElementById('graphExampleSelect');
    const graphLoadExampleBtn = document.getElementById('graphLoadExampleBtn');

    if (graphAddVertexBtn) {
        graphAddVertexBtn.addEventListener('click', () => {
            const list = graphVertexInput.value.split(',').map(s => s.trim()).filter(Boolean);
            list.forEach(v => graphController.addVertex(v));
            graphVertexInput.value = '';
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (graphRemoveVertexBtn) {
        graphRemoveVertexBtn.addEventListener('click', () => {
            const list = graphVertexInput.value.split(',').map(s => s.trim()).filter(Boolean);
            list.forEach(v => graphController.removeVertex(v));
            graphVertexInput.value = '';
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (graphAddEdgeBtn) {
        graphAddEdgeBtn.addEventListener('click', () => {
            const from = graphEdgeFrom.value.trim();
            const to = graphEdgeTo.value.trim();
            if (from && to) graphController.addEdge(from, to);
            graphEdgeFrom.value = '';
            graphEdgeTo.value = '';
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (graphRemoveEdgeBtn) {
        graphRemoveEdgeBtn.addEventListener('click', () => {
            const from = graphEdgeFrom.value.trim();
            const to = graphEdgeTo.value.trim();
            if (from && to) graphController.removeEdge(from, to);
            graphEdgeFrom.value = '';
            graphEdgeTo.value = '';
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (graphClearBtn) {
        graphClearBtn.addEventListener('click', () => {
            graphController.clear();
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (graphLoadExampleBtn) {
        graphLoadExampleBtn.addEventListener('click', () => {
            const example = graphExampleSelect.value;
            graphController.loadExample(example);
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }

    if (graphVertexInput) {
        graphVertexInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const list = graphVertexInput.value.split(',').map(s => s.trim()).filter(Boolean);
                list.forEach(v => graphController.addVertex(v));
                graphVertexInput.value = '';
                updateGraphSetRepresentation();
                clearGraphResult();
            }
        });
    }

    ['graphEdgeFrom', 'graphEdgeTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const from = graphEdgeFrom.value.trim();
                const to = graphEdgeTo.value.trim();
                if (from && to) graphController.addEdge(from, to);
                graphEdgeFrom.value = '';
                graphEdgeTo.value = '';
                updateGraphSetRepresentation();
                clearGraphResult();
            }
        });
    });

    // --- Eventos para el grafo auxiliar ---
    const graphAuxVertexInput = document.getElementById('graphAuxVertexInput');
    const graphAuxAddVertexBtn = document.getElementById('graphAuxAddVertexBtn');
    const graphAuxRemoveVertexBtn = document.getElementById('graphAuxRemoveVertexBtn');
    const graphAuxEdgeFrom = document.getElementById('graphAuxEdgeFrom');
    const graphAuxEdgeTo = document.getElementById('graphAuxEdgeTo');
    const graphAuxAddEdgeBtn = document.getElementById('graphAuxAddEdgeBtn');
    const graphAuxRemoveEdgeBtn = document.getElementById('graphAuxRemoveEdgeBtn');
    const graphClearAuxBtn = document.getElementById('graphClearAuxBtn');

    if (graphAuxAddVertexBtn) {
        graphAuxAddVertexBtn.addEventListener('click', () => {
            const list = graphAuxVertexInput.value.split(',').map(s => s.trim()).filter(Boolean);
            list.forEach(v => graphAuxController.addVertex(v));
            graphAuxVertexInput.value = '';
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (graphAuxRemoveVertexBtn) {
        graphAuxRemoveVertexBtn.addEventListener('click', () => {
            const list = graphAuxVertexInput.value.split(',').map(s => s.trim()).filter(Boolean);
            list.forEach(v => graphAuxController.removeVertex(v));
            graphAuxVertexInput.value = '';
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (graphAuxAddEdgeBtn) {
        graphAuxAddEdgeBtn.addEventListener('click', () => {
            const from = graphAuxEdgeFrom.value.trim();
            const to = graphAuxEdgeTo.value.trim();
            if (from && to) graphAuxController.addEdge(from, to);
            graphAuxEdgeFrom.value = '';
            graphAuxEdgeTo.value = '';
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (graphAuxRemoveEdgeBtn) {
        graphAuxRemoveEdgeBtn.addEventListener('click', () => {
            const from = graphAuxEdgeFrom.value.trim();
            const to = graphAuxEdgeTo.value.trim();
            if (from && to) graphAuxController.removeEdge(from, to);
            graphAuxEdgeFrom.value = '';
            graphAuxEdgeTo.value = '';
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }
    if (graphClearAuxBtn) {
        graphClearAuxBtn.addEventListener('click', () => {
            graphAuxController.clear();
            updateGraphSetRepresentation();
            clearGraphResult();
        });
    }

    if (graphAuxVertexInput) {
        graphAuxVertexInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const list = graphAuxVertexInput.value.split(',').map(s => s.trim()).filter(Boolean);
                list.forEach(v => graphAuxController.addVertex(v));
                graphAuxVertexInput.value = '';
                updateGraphSetRepresentation();
                clearGraphResult();
            }
        });
    }

    ['graphAuxEdgeFrom', 'graphAuxEdgeTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const from = graphAuxEdgeFrom.value.trim();
                const to = graphAuxEdgeTo.value.trim();
                if (from && to) graphAuxController.addEdge(from, to);
                graphAuxEdgeFrom.value = '';
                graphAuxEdgeTo.value = '';
                updateGraphSetRepresentation();
                clearGraphResult();
            }
        });
    });

    // --- Operaciones binarias con el auxiliar ---
    const graphUnionBtn = document.getElementById('graphUnionBtn');
    const graphIntersectionBtn = document.getElementById('graphIntersectionBtn');
    const graphRingSumBtn = document.getElementById('graphRingSumBtn');
    const graphSumBtn = document.getElementById('graphSumBtn');
    const graphCartesianBtn = document.getElementById('graphCartesianBtn');
    const graphTensorBtn = document.getElementById('graphTensorBtn');
    const graphCompositionBtn = document.getElementById('graphCompositionBtn');

    if (graphUnionBtn) {
        graphUnionBtn.addEventListener('click', () => {
            const result = graphController.model.union(graphAuxController.model);
            renderGraphResult(result, 'Resultado: Unión (G ∪ H)');
        });
    }
    if (graphIntersectionBtn) {
        graphIntersectionBtn.addEventListener('click', () => {
            const result = graphController.model.intersection(graphAuxController.model);
            renderGraphResult(result, 'Resultado: Intersección (G ∩ H)');
        });
    }
    if (graphRingSumBtn) {
        graphRingSumBtn.addEventListener('click', () => {
            const result = graphController.model.ringSum(graphAuxController.model);
            renderGraphResult(result, 'Resultado: Suma anillo (G Δ H)');
        });
    }
    if (graphSumBtn) {
        graphSumBtn.addEventListener('click', () => {
            const result = graphController.model.sum(graphAuxController.model);
            renderGraphResult(result, 'Resultado: Suma disjunta');
        });
    }
    if (graphCartesianBtn) {
        graphCartesianBtn.addEventListener('click', () => {
            const result = graphController.model.cartesianProduct(graphAuxController.model);
            renderGraphResult(result, 'Resultado: Producto cartesiano');
        });
    }
    if (graphTensorBtn) {
        graphTensorBtn.addEventListener('click', () => {
            const result = graphController.model.tensorProduct(graphAuxController.model);
            renderGraphResult(result, 'Resultado: Producto tensorial');
        });
    }
    if (graphCompositionBtn) {
        graphCompositionBtn.addEventListener('click', () => {
            const result = graphController.model.composition(graphAuxController.model);
            renderGraphResult(result, 'Resultado: Composición');
        });
    }

    // --- Operaciones unarias y transformaciones ---
    const graphComplementBtn = document.getElementById('graphComplementBtn');
    const graphFusionBtn = document.getElementById('graphFusionBtn');
    const graphFusionU = document.getElementById('graphFusionU');
    const graphFusionV = document.getElementById('graphFusionV');
    const graphContractBtn = document.getElementById('graphContractBtn');
    const graphContractU = document.getElementById('graphContractU');
    const graphContractV = document.getElementById('graphContractV');

    if (graphComplementBtn) {
        graphComplementBtn.addEventListener('click', () => {
            const result = graphController.model.complement();
            renderGraphResult(result, 'Resultado: Complemento de G');
        });
    }
    if (graphFusionBtn) {
        graphFusionBtn.addEventListener('click', () => {
            const u = graphFusionU.value.trim();
            const v = graphFusionV.value.trim();
            if (u && v) {
                const result = graphController.model.vertexFusion(u, v);
                graphFusionU.value = '';
                graphFusionV.value = '';
                renderGraphResult(result, `Resultado: Fusión de vértices (${u}, ${v})`);
            } else {
                showNotification('Ingresa ambos vértices para fusionar', 'error');
            }
        });
    }
    if (graphContractBtn) {
        graphContractBtn.addEventListener('click', () => {
            const u = graphContractU.value.trim();
            const v = graphContractV.value.trim();
            if (u && v) {
                const result = graphController.model.edgeContraction(u, v);
                graphContractU.value = '';
                graphContractV.value = '';
                renderGraphResult(result, `Resultado: Contracción de arista (${u}, ${v})`);
            } else {
                showNotification('Ingresa ambos extremos de la arista', 'error');
            }
        });
    }

    // Mostrar menú principal al inicio
    showContainer(menuPrincipal);
});