$(function() {
_.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };
  
// A checker model
var CheckerModel = Backbone.Model.extend({
	defaults: {
		value:0
	},
	
	validate: function(attrs) {
		if (!attrs.value) {
			return 'I need a value!';
		}; 
	},

	initialize: function(){
		console.log('CheckerModel has been initialized.');
		this.on('change:value', function(){
			console.log('- The value of CheckerModel have changed.');
		});
	}

});

// A checker view
var CheckerView = Backbone.View.extend({
	template: _.template($('#checker-template').html()),

	initialize: function () {
		this.render();
	},

	render: function() {
		this.el = $(this.template(this.model.toJSON()));
		return this;
	}
});


//var checkerModel = new CheckerModel();
//var checkerView = new CheckerView({model: checkerModel});


var DiceModel = Backbone.Model.extend({
	defaults: {
		value: 0
	}
});

var QuestionParser = Backbone.Model.extend({
	url: "questions/question.json",

	initialize: function(){
	},

	parse : function(response){
		console.log(response);
		return response;  
	}

});

//view
var DiceView = Backbone.View.extend({
    initialize: function () {
		this.model = new QuestionParser();
        this.model.fetch();
        this.render();
    },
    render: function () {
        console.log(this.model.toJSON());
    }
});


var myView = new DiceView();

});