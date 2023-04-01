var path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    mode: 'production',
    entry: {
        nahida_bundle: './src/nahida_bundle.js',
        useroperation_bundle: './src/useroperation_bundle.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../public/script')
    },
    module: {
        rules: [
            {
                test: /\.js[x]?$/,
                exclude: /node_modules/,
                use : {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react'],
                        plugins: [['import', {"libraryName": "antd", "libraryDirectory": "es", "style": true}]]
                    }
                }
            },
            {
                test: /\.less$/,
                use: [
                  'style-loader',
                  'css-loader',
                  'less-loader'
                ]
            }
        ]
    },
    
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('../public/script/bundle-manifest.json')
        }),
    ]
};