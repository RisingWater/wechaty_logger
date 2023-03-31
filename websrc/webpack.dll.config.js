const path    = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        bundle: ['react','react-dom', 'antd', 'jquery' ]
    },
    output: {
        path: path.join(__dirname, '../public/script'),
        filename: '[name].dll.js',
        library: '[name]_library'
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, '../public/script','[name]-manifest.json'),
            name: '[name]_library'
        })
    ]
};