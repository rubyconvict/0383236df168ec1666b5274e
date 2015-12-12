/* global require, module */
require('with-env')();

module.exports = {
  production: {
    buildEnv: 'production', // Override the environment passed to the ember asset build. Defaults to 'production'
    store: {
      type: 'redis', // the default store is 'redis'
      host: process.env['REDIS_HOST'], // 'production-redis.example.com',
      port: process.env['REDIS_PORT'], // 6379,
      password: process.env['REDIS_PASSWORD'].replace(/^(\"|\')/g, "").replace(/(\"|\')$/g, "")
    },
    // type: 's3',
    gzip: false,
    gzipExtensions: [],
    assets: {
      // type: 's3', // default asset-adapter is 's3'
      // USE ONLY WHEN USING CUSTOM CLOUDFRONT DOMAIN (NGINX PROXY)
      // TODO: amazon asks to have both versions, brocfile is not changeing filename to .gz
      // when this is done, can use gzip safely, but does cli-deploy supports sending 2 different encoding type files?
      gzip: false, // if undefined or set to true, files are gziped
      gzipExtensions: [], // if undefined, js, css & svg files are gziped
      exclude: ['.DS_Store', '*-test.js', 'Thumbs.db'], // defaults to empty array
      accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
      secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
      bucket: process.env['AWS_BUCKET_NAME'],
      region: process.env['AWS_REGION'],
      sslEnabled: true
      //,
      // DO NOT USE THESE OPTIONS:
      // Unable to sync: Error: Non-file stream objects are not supported with SigV4 in AWS.S3
      //s3BucketEndpoint: true,
      //endpoint: process.env['AWS_ENDPOINT']
      //signatureVersion: 'v4'
    }
  }
};
