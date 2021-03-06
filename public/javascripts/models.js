var User = Backbone.Model.extend({
    urlRoot: '/users'
});
var Role = Backbone.Model.extend({
    urlRoot: '/roles'
});
var Product = Backbone.Model.extend({
    urlRoot: '/products'
});
var Order = Backbone.Model.extend({
    urlRoot: '/orders'
});

var Users = Backbone.Collection.extend({
  model: User,
  url: '/users'
});
var users = new Users();

var Roles = Backbone.Collection.extend({
  model: Role,
  url: '/roles'
});
var roles = new Roles();

var Products = Backbone.Collection.extend({
  model: Product,
  url: '/products'
});
var products = new Products();

var Orders = Backbone.Collection.extend({
  model: Order,
  url: '/orders'
});
var orders = new Orders();
