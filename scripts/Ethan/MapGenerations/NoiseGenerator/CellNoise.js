export function cellularNoise(x, y, cellSize) {
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    const random = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };
    return random(gridX + gridY * 1000); // Hash grid coordinates
}
