class GraphController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    init() {
        console.log('GraphController iniciado');
        this.view.render(this.model);
    }

    // Operaciones básicas (ya existentes)
    addVertex(v) { if (this.model.addVertex(v)) this.view.render(this.model); }
    removeVertex(v) { if (this.model.removeVertex(v)) this.view.render(this.model); }
    addEdge(u, v) { this.model.addEdge(u, v); this.view.render(this.model); }
    removeEdge(u, v) { this.model.removeEdge(u, v); this.view.render(this.model); }
    clear() { this.model.clear(); this.view.render(this.model); }

    // Operaciones binarias
    union(other) { this.model = this.model.union(other); this.view.render(this.model); }
    intersection(other) { this.model = this.model.intersection(other); this.view.render(this.model); }
    ringSum(other) { this.model = this.model.ringSum(other); this.view.render(this.model); }
    sum(other) { this.model = this.model.sum(other); this.view.render(this.model); }
    cartesianProduct(other) { this.model = this.model.cartesianProduct(other); this.view.render(this.model); }
    tensorProduct(other) { this.model = this.model.tensorProduct(other); this.view.render(this.model); }
    composition(other) { this.model = this.model.composition(other); this.view.render(this.model); }

    // Operaciones unarias
    complement() { this.model = this.model.complement(); this.view.render(this.model); }
    vertexFusion(u, v) { this.model = this.model.vertexFusion(u, v); this.view.render(this.model); }
    edgeContraction(u, v) { this.model = this.model.edgeContraction(u, v); this.view.render(this.model); }

    loadExample(example) {
        let newModel;
        switch(example) {
            case 'empty': newModel = GraphModel.empty(); break;
            case 'complete3': newModel = GraphModel.complete(3); break;
            case 'complete5': newModel = GraphModel.complete(5); break;
            case 'cycle4': newModel = GraphModel.cycle(4); break;
            case 'cycle6': newModel = GraphModel.cycle(6); break;
            default: return;
        }
        this.model = newModel;
        this.view.render(this.model);
    }
}