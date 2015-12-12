import DS from "ember-data";

// export default DS.RESTAdapter.extend({
export default DS.LSAdapter.extend({
  // host: 'http://localhost:8090',
  namespace: 'api'//,
  //headers: {
  //  "Accept":"application/json"
  //}
});
