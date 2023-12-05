// Vue.config.js
// const CompressionPlugin from "compression-webpack-plugin");
/*
const zlib from "zlib");
const path from "path");
const webpack from "webpack");
const CompressionWebpackPlugin from "compression-webpack-plugin"),
    productionGzipExtensions = [
        "js",
        "css"
    ],
    isProduction = process.env.NODE_ENV === "production";
const NodePolyfillPlugin from "node-polyfill-webpack-plugin");
*/
import zlib from "zlib";
import path from "path";
import webpack from "webpack";
import CompressionWebpackPlugin from "compression-webpack-plugin";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const productionGzipExtensions = [
  "js",
  "css"
],
isProduction = process.env.NODE_ENV === "production",
config = {
    "devServer": {
        "disableHostCheck": true
    },
    "configureWebpack": {
        "performance": {
            "hints": false
        },
        "optimization": {
            "runtimeChunk": "single",
            "splitChunks": {
                "automaticNameDelimiter": ".",
                "chunks": "all",
                "cacheGroups": {
                    "router": {
                        "test": /[\\/]node_modules[\\/]vue-router[\\/]/,
                        "name": "router",
                        "priority": 10
                    },
                    "vendors": {
                        "test": /[\\/]node_modules[\\/]/,
                        "name": "vendor",
                        "priority": 5,
                        "minSize": 64000,
                        "maxSize": 128000
                    }
                }
            }
        },
        "plugins": [new NodePolyfillPlugin()]
    },
    "pluginOptions": {
        "compression": {
            "brotli": {
                "filename": "[file].br[query]",
                "algorithm": "brotliCompress",
                "include": /\.(js|css|html|svg|json)(\?.*)?$/i,
                "compressionOptions": {
                    "params": {
                        [zlib.constants.BROTLI_PARAM_QUALITY]: 11
                    }
                },
                "minRatio": 0.8
            },
            "gzip": {
                "filename": "[file].gz[query]",
                "algorithm": "gzip",
                "include": /\.(js|css|html|svg|json)(\?.*)?$/i,
                "minRatio": 0.8
            }
        }
    }
};

export default config
