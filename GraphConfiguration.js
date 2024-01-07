class GraphConfiguration {
    constructor(numNodes, isDirected, layoutType, includePositions, weightStyle) {
        this.numNodes = numNodes;
        this.isDirected = isDirected;
        this.layoutType = layoutType; // 'radial', 'grid', or 'random'
        this.includePositions = includePositions;
        this.weightStyle = weightStyle; // 'distance' or 'jittered_distance', 'random'
    }
}