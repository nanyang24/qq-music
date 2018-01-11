const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: path.join(__dirname, './scripts/app.js'),
    output: {
        path: path.join(__dirname, './dist'),
        filename: '[name].js'
    },
    devServer: {
        contentBase: path.join(__dirname)
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                })
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', 'postcss-loader']
                })
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: ['babel-loader?cacheDirectory=true'],
                include: path.join(__dirname, 'scripts')
            },
            {
                test: /\.(woff|svg|ttf|eot)$/i,
                loader: 'url-loader',
                options: {
                    name: "fonts/[name].[ext]"
                }
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 25000
                    }
                }]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("[name].css"),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'index.html'),
            inject: true
        }),
        new UglifyJSPlugin()
    ]
}