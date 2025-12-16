const path = require('path')
const Dotenv = require('dotenv-webpack')

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development'

    return {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.js',
            library: {
                name: 'MyPlugin',
                type: 'umd'
            }
        },
        
        externals: {
            'substance': 'substance'
        },
        
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/[name][ext]'
                    }
                }
            ]
        },
        
        plugins: [
            new Dotenv({
                safe: false,
                systemvars: true,
                silent: true
            })
        ],
        
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist')
            },
            compress: true,
            port: process.env.PORT || 3000,
            https: {
                key: path.resolve(process.env.HOME, '.localhost-ssl/localhost-key.pem'),
                cert: path.resolve(process.env.HOME, '.localhost-ssl/localhost.pem')
            },
            host: 'local.plugins.writer.infomaker.io',
            hot: true,
            liveReload: true,
            watchFiles: ['src/**/*'],
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
            }
        },
        
        devtool: isDevelopment ? 'eval-source-map' : false,
        
        performance: {
            maxAssetSize: 512000,
            maxEntrypointSize: 512000,
            hints: isDevelopment ? false : 'warning'
        }
    }
}
