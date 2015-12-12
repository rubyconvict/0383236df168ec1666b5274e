import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import ENV from './config/environment';

var App;

// Ember-CLI assigns ENV.EmberENV to window.EmberENV, which Ember reads on application initialization.
if (ENV.environment === 'development') {
  // .......
}

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
