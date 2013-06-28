$(function() {
	_.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };

	window.BG = {
		Models: {},
		Collections: {},
		Views: {}
	};		

	window.template = function (id) { return _.template( $('#' + id ).html() ) }

	// MODELS

	BG.Models.Checker = Backbone.Model.extend({
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

	BG.Models.Dice = Backbone.Model.extend({
		defaults: {
			value: [1,1]
		}
	});

	// VIEWS

	BG.Views.Checker = Backbone.View.extend({
		template: template('checker-template'),

		initialize: function () {
			this.render();
		},

		render: function() {
			this.el = $(this.template(this.model.toJSON()));
			return this;
		}
	});

	BG.Views.Dice = Backbone.View.extend({
		template: template('dice-template'),

	    initialize: function () {
	    	this.render();
	    },
	    render: function () {
	    	var diceNumber = this.model.get('value');
	    	var diceTexts = ['one','two','three','four','five','six'];
			var dice1 = diceTexts[diceNumber[0]-1];
			var dice2 = diceTexts[diceNumber[1]-1];
			var dices = { value: [dice1,dice2] }
			this.el = $(this.template(dices));
			$('.dice-holder').html(this.el);
	    	return this;
	    }
	});

	// COLLECTIONS

	BG.Collections.Questions = Backbone.Collection.extend({
		url: '/questions/question.json',
		parse: function(response){
            return response;
        }
	});

	var questions = new BG.Collections.Questions();
	questions.fetch({
		success: function (argument) {
			var checkers = questions.models[0].get('checkers');	
			var cube = questions.models[0].get('cube');	
			var dice = questions.models[0].get('dice');	
			var score = questions.models[0].get('score');	
//			console.log(checkers);
//			console.log(cube);
//			console.log(score);
// 	DONE	console.log(dice);

			var diceModel = new BG.Models.Dice({
				value: dice
			});

			var diceView = new BG.Views.Dice({
				model: diceModel
			});
		}
	})
});