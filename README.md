npm install -g ember-cli

install -g phantomjs

# mac only
brew install watchman
sudo brew link pcre
sudo brew link watchman

sudo chown -R [USERNAME]:staff /Users/[USERNAME]/.config/configstore
ember new app-client
cd app-client/

ember install:npm ember-cli-scaffold
ember install:bower ember-localstorage-adapter
# ember install:npm ember-idx-forms ember-idx-button ember-idx-modal ember-idx-tree ember-idx-charts ember-idx-tabs ember-idx-tour ember-idx-wysiwyg ember-idx-accordion ember-idx-list

ember install:bower bootstrap-sass-official font-awesome
npm install --save-dev ember-cli-compass-compiler # DO NOT USE ember install:addon
npm install --save-dev ember-cli-html-minifier
#npm install --save-dev ember-cli-gzip

# Brocfile.js
app.import('bower_components/ember-localstorage-adapter/localstorage_adapter.js');
# before this
module.exports = app.toTree();

ember generate adapter application

nano -w app/adapters/application.js

import DS from "ember-data";

export default DS.ActiveModelAdapter.extend({
  namespace: "api"
});

nano -w app/adapters/user.js

import DS from "ember-data";

export default DS.LSAdapter.extend({
  // host: "http://localhost:3000",
  namespace: 'api'
});

# How to mock posts

# ember g http-mock posts
# /api/posts

# App-client

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Update

npm install -g npm-check-updates
rm -rf node_modules
npm-check-updates -u
npm install

# Since npm shrinkwrap is intended to lock down your dependencies for production use, devDependencies will not be included unless you explicitly set the --dev flag when you run npm shrinkwrap. If installed devDependencies are excluded, then npm will print a warning. If you want them to be installed with your module by default, please consider adding them to dependencies instead.

rm -f npm-shrinkwrap.json
npm shrinkwrap

npm install -g bower-update
bower-update --non-interactive
bower install

npm uninstall -g ember-cli
npm cache clean
bower cache clean
npm install -g ember-cli
rm -rf node_modules bower_components dist tmp
npm install --save-dev ember-cli
ember init
npm install
bower install
rm -rf dist/ .sass-cache/ tmp/
ember server

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

rm -rf dist/ .sass-cache/ tmp/
ember deploy --environment production
ember deploy:list --environment production
ember deploy:activate --revision ember-deploy:44f2f92 --environment production

Rails should take from active index from redis and serve it.

To try latest index directly from s3: (CORS will complain)
https://s3-eu-west-1.amazonaws.com/BUCKETNAME/index.html

Cannot use index.html from cloudfront domain, it cannot be uncached!

### TODO:
redis - write script to make sha of index.html that could be accepted by backend database (pushed to production db by rake tesk) to prevent compromised redis in production from auto-deploying

on frontend release repo:
sudo port install md5sha1sum
md5sum app/index.html

DIGEST=XXX rake redis_front:add_index_html_file_digest
IndexHtmlFile.create(:digest => ENV['DIGEST']) unless IndexHtmlFile.where(:digest => ENV['DIGEST']).first

DIGEST=XXX rake redis_front:remove_index_html_file_digest
IndexHtmlFile.where(:digest => ENV['DIGEST']).destroy_all

# switch to file
rake redis_front:clear_all_index_html_file_digests
IndexHtmlFile.destroy_all

def serve(file)
  if file.encoding.name == 'UTF-8' && file.valid_encoding?
    if file.bytesize > 1000000
      file = file[0,1000000] # cut to around 1 MB for security
    end
    file.sub!("\xEF\xBB\xBF".force_encoding("UTF-8"), '') # REMOVE BOM
    file.encode!(universal_newline: true) # LINUX NEWLINE
    if file.valid_encoding?
      file
    else
      # fallback to read from file (update manually BEFORE deploy to index file from last tagged release)
      raise 'index.html is not valid'
    end
  else
    # fallback to read from file (update manually BEFORE deploy to index file from last tagged release)
    raise 'index.html is not valid UTF-8'
  end
end

def use_current
  if current from redis
    require 'digest/md5'
    digest = Digest::MD5.hexdigest(file)
    ihf = IndexHtmlFile.where(:digest => digest).first
    if ihf
      if ihf.value.present?
        serve(ihf.value)
      else
        content = serve(file)
        ihf.set(:value => content)
        content
      end
    else
      logger.warn 'fallback'
      # fallback to read from file (update manually BEFORE deploy to index file from last tagged release)
      File.read('app/index.html')
    end
  else
    logger.warn 'fallback, current is empty'
    # fallback to read from file (update manually BEFORE deploy to index file from last tagged release)
    File.read('app/index.html')
  end
end

if param && http basic ok (app based)
  if value from redis
    serve(file)
  else
    raise 'param not found'
  end
else
  use current
end
