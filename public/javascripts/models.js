var User = Backbone.Model.extend({});
var Role = Backbone.Model.extend({});
var Product = Backbone.Model.extend({});
var Order = Backbone.Model.extend({});

var Users = Backbone.Collection.extend({
  model: User
});
var users = new Users();

var Roles = Backbone.Collection.extend({
  model: Role
});
var roles = new Roles();

var Products = Backbone.Collection.extend({
  model: Product
});
var products = new Products();

var Orders = Backbone.Collection.extend({
  model: Order
});
var orders = new Orders();
