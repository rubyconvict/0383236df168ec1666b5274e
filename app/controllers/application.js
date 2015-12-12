/*jshint unused: true */
/*exported Notify */
import Ember from 'ember';
import Notify from 'ember-notify';

export default Ember.Controller.extend({
  init: function(){
    this.notify.alert('This one\'s got rounded corners.', {
      radius: true
    });
  }
});
