const path = require('path');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = merge({
    module: {
        rules: [
            {
                test: /\.js/,
                loaders: ['babel-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.vue$/,
                loaders: ['vue-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.(less|css)$/,
                loader: ExtractTextPlugin.extract('style-loader', 'style-loader!css-loader!less-loader'),
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new ExtractTextPlugin('style.css', {
            allChunks: true,
        }),
    ],
    resolve: {
        extensions: ['.js', '.vue', '.less'],
    },
}, {
    context: __dirname,
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: {
            root: 'VueTags',
            amd: 'vue-tags',
            commonjs: 'vue-tags'
        },
        libraryTarget: 'umd',
    },
    externals: {
        vue: 'vue',
    },
});