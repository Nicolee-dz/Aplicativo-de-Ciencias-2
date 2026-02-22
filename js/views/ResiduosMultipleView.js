/**
 * Vista placeholder para Residuos Múltiples
 * Por ahora no implementa el render del árbol (pendiente).
 */
class ResiduosMultipleView {
    constructor(containerId = 'residueTreeContainer') {
        this.container = document.getElementById(containerId);
        this.d3container = this.container ? d3.select(`#${containerId}`) : null;
    }

    render(model) {
        if (!this.d3container || !this.d3container.node()) return;
        this.d3container.html('');

        const placeholder = this.d3container.append('div')
            .attr('class', 'residue-placeholder p-4 text-center')
            .style('color', '#666')
            .style('font-style', 'italic')
            .html('<strong>Visualización del árbol pendiente:</strong><br>Implementación del árbol de Residuos Múltiples aún no realizada.');

        // Guardar referencia para futuras animaciones
        this.placeholder = placeholder;
    }

    animatePath(path, callback) {
        // Animación pendiente; solo llamamos el callback inmediatamente
        callback && callback();
    }
}

window.ResiduosMultipleView = ResiduosMultipleView;
