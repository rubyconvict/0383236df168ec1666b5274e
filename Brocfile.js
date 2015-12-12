/* global require, module */
require('with-env')();

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var env = EmberApp.env();
if (process.env.EMBER_ENV !== env) {
  console.log('environment missmatch')
}
var isProductionLikeBuild = ['production'].indexOf(env) > -1;

var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');

var fs = require('fs');
var md5 = require('MD5');
var mkdirp = require('mkdirp');

var sys = require('sys');
var exec = require('child_process').exec;

fs.readFile('app/index.html', function(err, buf) {
  console.log("\n" + md5(buf));
  mkdirp('dist', function(err) {
    if (err) return console.log(err);
  });
  fs.writeFile('app/index.md5', md5(buf), function (err) {
    if (err) return console.log(err);
  });

  console.log('Removing all .DS_Store and Thumbs.db files...');
  exec("find . -name '*.DS_Store' -type f -delete");
  exec("find . -name 'Thumbs.db' -type f -delete");
});

var app = new EmberApp({
  wrapInEval: false,
  minifyCSS: {
    enabled: isProductionLikeBuild,
  },
  minifyJS: {
    enabled: isProductionLikeBuild,
  },
  minifyHTML: {
    enabled: process.env.EMBER_ENV === 'production',
    minifierOptions: {
      collapseWhitespace : true,
      removeComments     : true,
      minifyJS           : true,
      minifyCSS          : true
    }
  },
  // http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html
  // http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ServingCompressedFiles.html
  // ember-cli-gzip replaced by ember-cli-deploy's broccoli-gzip
  //gzip: {
  //  enabled: process.env.EMBER_ENV === 'production',
  //  extensions: ['js', 'css', 'svg'],
  //  keepUncompressed: true,
  //  appendSuffix: true
  //},
  outputPaths: {
    app: {
      html: 'index.html',
      css: {
        'app': '/assets/app-client.css'//,
        //'app/experimental': '/assets/experimental.css'
      },
      js: '/assets/app-client.js'
    },
    vendor: {
      css: '/assets/vendor.css',
      js: '/assets/vendor.js'
    }
  },
  storeConfigInMeta: false,
  fingerprint: {
    // exclude: ['fonts/169929'],
    // WORKS!
    enabled: isProductionLikeBuild,
    prepend: process.env['ASSETS_URL'] ? process.env['ASSETS_URL'] : '' // https://subdomain.cloudfront.net/'
  },
  compassOptions: {
    outputStyle: process.env.EMBER_ENV !== 'production' ? 'expanded' : 'compressed',
    relativeAssets: false,
    sassDir: 'app/styles',
    imagesDir: 'images', // note the relative imagesDir - this way it works on mac and win.
    cssDir: 'stylesheets',
    sourcemap: process.env.EMBER_ENV !== 'production',
    //fontsDir: 'fonts',
    'generated-images-path': "sprites"
  },
  sourcemaps: {
    enabled: !isProductionLikeBuild,
  },
  tests: process.env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
  hinting: process.env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild
});
// Use `app.import` to add additional libraries to the generated
// output files.
//
// I with the exports of each module as its value.

if (app.env === 'development') {
  app.import('bower_components/ember-renderspeed/ember-renderspeed.js');
}

app.import('bower_components/ember-localstorage-adapter/localstorage_adapter.js');

app.import('bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js');

// THIS IS HOW U JOIN SOME FILES FROM A EMBER ADDON IN NODE_MODULES
// app.import('vendor/styles/layout.css');

/*
app.import('bower_components/bootstrap/dist/css/bootstrap.css');
*/

// $ watchman watch-list

var imageTree = pickFiles('images', {
  srcDir: '/',
  files: ['*'],
  destDir: '/images'
});

var spriteTree = pickFiles('sprites', {
  srcDir: '/',
  files: ['*.png'],
  destDir: '/images'
});

// in production env - move denerated sprites from images/sprites to dist/public/images
//var spriteTree = pickFiles('images/sprites', {
//  srcDir: '/',
//  files: ['*.png'],
//  destDir: '/public/images'
//});

var vendorFontTree = pickFiles('stylesheets/vendor', {
  srcDir: '/',
  files: ['example.ttf'],
  destDir: '/fonts'
});

var glyphiconsTree = pickFiles('bower_components/bootstrap-sass-official/assets/fonts/bootstrap', {
  srcDir: '/',
  files: ['glyphicons-halflings-regular.woff','glyphicons-halflings-regular.woff2'],
  destDir: '/fonts/bootstrap'
});

var fontTree = pickFiles('bower_components/fontawesome/fonts', {
  srcDir: '/',
  files: ['fontawesome-webfont.eot','fontawesome-webfont.ttf','fontawesome-webfont.svg','fontawesome-webfont.woff','fontawesome-webfont.woff2'],
  destDir: '/fonts'
});

var indexMd5 = pickFiles('app', {
  srcDir: '/',
  files: ['index.md5'],
  destDir: '/'
});

/* TODO
var modernizrTree = pickFiles('vendor/modernizr/', {
  srcDir: '/',
  files: ['modernizr.js'],
  destDir: '/assets'
});
*/

// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.

// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

//module.exports = app.toTree();

// Providing additional trees to the `toTree` method will result in those
// trees being merged in the final output.
//module.exports = app.toTree(extraAssets);
//module.exports = mergeTrees([app.toTree(), fontTree, modernizrTree]);
module.exports = mergeTrees([app.toTree(), fontTree, glyphiconsTree, vendorFontTree, imageTree, spriteTree, indexMd5]);

// rm -rf dist/ .sass-cache/ tmp/
// bundle exec ember build --environment="production"
// bundle exec ember server --environment="production"
//
// READY FOR PRODUCTION?
// rm -rf dist/ .sass-cache/ tmp/
// bundle exec ember deploy --environment="production"
// bundle exec ember deploy:list --environment="production"
/*

perfect static asset:

HTTP/1.1 200 OK
Date: Mon, 23 Mar 2015 17:49:58 GMT
Content-Type: application/x-javascript
Content-Length: 5040
Connection: keep-alive
Vary: Accept-Encoding
Expires: Tue, 08 Mar 2016 11:55:20 GMT
Cache-Control: max-age=30305122

cloudfront:
should not be set, but there is no way to prevent this:
Last-Modified: Mon, 23 Mar 2015 17:42:42 GMT
ETag: "377ed46f9ccac4dcdc3a4b186443dfde"
*/

// to debug
// node_modules/ember-deploy-s3/lib/s3.js
// insert below L:12
// module.exports = CoreObject.extend({
//  init: function() {
//    console.log(this.getUploadParams());
//    console.log(this.config.assets);
// and above it fix:

// ~FIX:
// var EXPIRE_IN_2030 = new Date('2030');
// var TWO_YEAR_CACHE_PERIOD_IN_SEC = 60 * 60 * 24 * 365 * 2;
// TO:
// var EXPIRE_IN_2030 = new Date(new Date().setYear(new Date().getFullYear() + 1));
// var year = new Date().getFullYear();
// if ( ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0) ) {
//     var seconds = 60 * 60 * 24 * 366;
// } else {
//     var seconds = 60 * 60 * 24 * 365;
// }
// var TWO_YEAR_CACHE_PERIOD_IN_SEC = seconds;

// ~FIX
// gzipExtensions must be set to [] otherwise content encofing is set to gzip

// node_modules/ember-cli-deploy/lib/models/config.js
// dates are also bad, but since we do not use it we skip that fix, and do only:
// ~FIX - config is broken L:40
//    this._defaultPropertyPaths = {
      //'assets.gzip': true,
      //'assets.gzipExtensions': ['js', 'css', 'svg'],
      //~FIX
//      'assets.gzip': false,
//      'assets.gzipExtensions': [],
      //(...)
//    };
