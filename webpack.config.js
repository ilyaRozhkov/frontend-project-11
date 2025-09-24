import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin'; // Импортируем HtmlWebpackPlugin
import { fileURLToPath } from 'url';

// настройки без bable
// Без babel: вычисляем __dirname/filename через URL API
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  mode: 'development', // или 'production'
  entry: './src/index.js',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'src'), // Только нужная папка
      watch: {
        ignored: /node_modules/, // Игнорировать node_modules
        usePolling: false,
      },
    },
    port: 8080,
    hot: false, // Включаем HMR
    liveReload: false,
    client: {
      overlay: false, // не экранируем ошибки
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [],
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: 'asset/resource',
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],
  output: {
    clean: true,
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: false, // Отключаем в development
  },
  watchOptions: {
    aggregateTimeout: 300, // Задержка перед пересборкой
    ignored: ['**/node_modules', '**/dist'], // Игнорируемые пути
  },
  watch: false,
};

export default config;
