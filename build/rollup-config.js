export default {
    input: 'src/index.js',
    external: ['leaflet'],
    output: {
        file: 'dist/leaflet-circularshapes.js',
        format: 'es',
        sourcemap: false,
    },
}