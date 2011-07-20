var templates;

$().ready(function() {
    templates = _($('script.template[type="text/mustache"]'))
       .chain()
       .map(function(element) {
           return {
               key: element.id,
               value: element.innerHTML.replace(/\[\[(.*?)\]\]/g, function(whole, command) { return '{{' + command + '}}' })
           };
       })
       .reduce(function(memo, pair) {
           memo[pair.key] = pair.value;
           return memo;
       }, {})
       .value();
});

var UsersView = Backbone.View.extend({
    render: function() {
        $(this.el).html(Mustache.to_html(templates.users, users, templates));
        return this;
    }
});
