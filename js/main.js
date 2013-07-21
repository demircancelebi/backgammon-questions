$(function() {
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

	BG.Models.Cube = Backbone.Model.extend({
		value: "",
		location:""
	});

	BG.Models.Score = Backbone.Model.extend({
		you:"",
		opp:"",
		game:""
	});

	BG.Models.Checkers = {
		onBoard:{},
		collected: Backbone.Model.extend({
			you:"",
			opp:""
		}),
		hit:{}
	};

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
			this.el = $(this.template(this.model.toJSON()));
			$('.dice-holder').html(this.el);
	    	return this;
	    }
	});

	BG.Views.Cube = Backbone.View.extend({
		template: template('cube-template'),

		initialize: function () {
			this.render();
		},

		render: function () {
			this.el = $(this.template(this.collection.models[0].toJSON()));
			$('.cube-holder').html(this.el)
			return this;	
		}
	});

	BG.Views.Score = Backbone.View.extend({
		template: template('score-template'),
		
		initialize: function() {
			this.render();
		},
		
		render: function () {
			this.el = $(this.template(this.collection.models[0].toJSON()));
			$('.side-panel.left').append(this.el);
			return this;	
		}
	});

	BG.Views.Checkers = {
		onBoard: {},
		collected: Backbone.View.extend({
			template: template('side-checker-holder'),

			initialize: function () {
				this.render();
			},

			render: function () {
				var obj = this.collection.models[0].get('model');
				this.el = $(this.template(obj));
				$('.side-panel.right').append(this.el);
				return this;
			}
		}),
		hit: {}
	};

	// COLLECTIONS
	BG.Collections.Cube = Backbone.Collection.extend({ model: BG.Models.Cube });

	BG.Collections.Score = Backbone.Collection.extend({ model: BG.Models.Score });

	BG.Collections.Checkers = {
		onBoard: {},
		collected: Backbone.Collection.extend({
			model: BG.Models.Checkers.collected
		}),
		hit:{}
	};

	BG.Collections.Questions = Backbone.Collection.extend({
		url: '/questions/question.json',
		parse: function(response){
            return response;
        }
	});

	var questions = new BG.Collections.Questions();
	questions.fetch({
		success: function () {
			var checkers = questions.models[0].get('checkers');	
			var cube = questions.models[0].get('cube');	
			var dice = questions.models[0].get('dice');	
			var score = questions.models[0].get('score');	
			console.log(checkers.hit);
//  DONE	console.log(checkers.collected);
//	DONE	console.log(score);
//	DONE	console.log(cube);
// 	DONE	console.log(dice);

			var diceModel 			= new BG.Models.Dice({ value: dice });
			var diceView 			= new BG.Views.Dice({ model: diceModel });

			var cubeCollection 		= new BG.Collections.Cube({ model: cube });
			var cubeView 			= new BG.Views.Cube({ collection: cubeCollection });

			var scoreCollection   	= new BG.Collections.Score({ model: score });
			var scoreView 		  	= new BG.Views.Score({ collection: scoreCollection });

			var collectedCollection = new BG.Collections.Checkers.collected({ model: checkers.collected });
			var collectedView 		= new BG.Views.Checkers.collected({ collection: collectedCollection });
		}
	})
});