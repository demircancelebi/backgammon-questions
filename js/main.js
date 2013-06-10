$(function() {
_.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };

var CheckerModel = Backbone.Model.extend({
	defaults: {
		value:0
	},
	
	validate = function(attrs) {
		if (!attrs.value) {
			return 'I need a value!';
		},
	},

	initialize: function(){
		console.log('CheckerModel has been initialized.');
		this.on('change:value', function(){
			console.log('- The value of CheckerModel have changed.');
		});
	}

});

var CheckerView = Backbone.View.extend({
	tmp: _.template($('#checker-template').html()),

	initialize: function () {
		this.render();
	},

	render: function() {
		this.el = $(this.tmp(this.model.toJSON()));
		this.delegateEvents();
		return this;
	}
});

var checkerModel = new CheckerModel({ value:0 });
var checkerView = new CheckerView({model: checkerModel});

});