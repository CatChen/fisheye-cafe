var app = new(Backbone.Router.extend({
    routes: {
        "!/users/:id": "users",
        "!/roles/:id": "roles",
        "!/products/:id": "products",
        "!/orders/:id": "orders"
    },
    users: function(id) {
        console.log('user:' + id);
    },
    roles: function(id) {
        console.log('role:' + id);
    },
    products: function(id) {
        console.log('product:' + id);
    },
    orders: function(id) {
        console.log('order:' + id);
    },
}));

Backbone.emulateHTTP = true;

$().ready(function() {
    Backbone.history.start();
});
