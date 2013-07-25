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
		onBoard: Backbone.Model.extend({
			model: [
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },

				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },

				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },

				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] },
				{ "loc" : [] }				
			]
		}),
		collected: Backbone.Model.extend({
			you:"",
			opp:""
		}),
		hit: Backbone.Model.extend({
			you:"",
			opp:""
		})
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
		onBoard: Backbone.View.extend({

			template: template('all-boards'),

			initialize: function () {
				this.render()
			},

			render:function () {
				var obj = { model: [] };
				var dice = this.options.dice;
				obj.model = this.collection.models[0].get('model');
				var you = [],
					opp = [];
				$.each(obj.model, function (i,val) {
					if(this.loc != undefined){
						if(this.loc[0] == 1){
							you.push(i);
						}else{
							opp.push(i);
						}
					}
				});
				this.el = $(this.template(obj.model));
				var lines = this.el.find('.line').find('.checker-holder');
				
				this.renderPossibleOptions(lines,dice,you,opp);

				$('.all-boards').html(this.el);
				return this;
			},

			renderPossibleOptions: function (lines,dice,you,opp) {
				var self = this;
				$.each(lines,function (index) {
					if(dice[0] != dice[1]){
						self.allPossibleOptionsWhenDicesAreNotEqual(lines,dice,you,opp,index);
						$(this).on('mouseover',function () {
							$('.target').hide();
							self.allPossibleOptionsWhenDicesAreNotEqual(lines,dice,you,opp,index);
						});
					}else{
						self.allPossibleOptionsWhenDicesAreEqual(lines,dice,you,opp,index);
						$(this).on('mouseover',function () {
							$('.target').hide();
							self.allPossibleOptionsWhenDicesAreEqual(lines,dice,you,opp,index);
						});
					}
					$(this).on('mouseout',function () {
						$('.checker-holder').off();
						self.renderPossibleOptions(lines,dice,you,opp);
					});
				});
			},

			allPossibleOptionsWhenDicesAreNotEqual: function (lines,dice,you,opp,index) {
				var val = (23 - index) % 24;
				if(you.indexOf(val) > -1){
					var l0, l1, l01;
					$(this).css({cursor:"pointer"});
					l0 = $(lines[index + dice[0]]).children('.checker.opp').length;
					if(opp.indexOf(val - dice[0]) == -1 || l0 == 1){
						$(lines[index + dice[0]]).find('.target').show();
					}
					l1 = $(lines[index + dice[1]]).children('.checker.opp').length;
					if(opp.indexOf(val - dice[1]) == -1 || l1 == 1){
						$(lines[index + dice[1]]).find('.target').show();
					}
					l01 = $(lines[index + dice[0] + dice[1]]).children('.checker.opp').length;
					if(((opp.indexOf(val - dice[0]) == -1 || l0 == 1) || (opp.indexOf(val - dice[1]) == -1 || l1 == 1)) && (opp.indexOf(val - dice[0] - dice[1]) == -1 || l01 == 1)){
						$(lines[index + dice[0] + dice[1]]).find('.target').show();
					}
				}
			},

			allPossibleOptionsWhenDicesAreEqual: function (lines,dice,you,opp,index) {
				var val = (23 - index) % 24;
				if(you.indexOf(val) > -1){
					$(this).css({cursor:"pointer"});
					var dl0, dl1, dl2, dl3;
					dl0 = $(lines[index + dice[0]*1]).children('.checker.opp').length;
					dl1 = $(lines[index + dice[0]*2]).children('.checker.opp').length;
					dl2 = $(lines[index + dice[0]*3]).children('.checker.opp').length;
					dl3 = $(lines[index + dice[0]*4]).children('.checker.opp').length;
					if(opp.indexOf(val - dice[0]*1) == -1 || dl0 == 1){
						$(lines[index + dice[0]*1]).find('.target').show();
						if(opp.indexOf(val - dice[0]*2) == -1 || dl1 == 1){
							$(lines[index + dice[0]*2]).find('.target').show();
							if(opp.indexOf(val - dice[0]*3) == -1 || dl2 == 1){
								$(lines[index + dice[0]*3]).find('.target').show();
								if(opp.indexOf(val - dice[0]*4) == -1 || dl3 == 1){
									$(lines[index + dice[0]*4]).find('.target').show();
								}
							}
						}
					}
				}
			}
		}),
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
		hit: Backbone.View.extend({
			template: template('hit-checker-holder'),

			initialize: function () {
				this.render();
			},

			render: function () {
				var obj = this.collection.models[0].get('model');
				var hitCheckersContainer = $('.hit-checkers-container');
				this.el = $(this.template(obj));
				hitCheckersContainer.append(this.el);
				hitCheckersContainer.css({marginTop: ($('.screen').height() - hitCheckersContainer.height())/2 });
				return this;
			}
		})
	};

	// COLLECTIONS
	BG.Collections.Cube = Backbone.Collection.extend({ model: BG.Models.Cube });

	BG.Collections.Score = Backbone.Collection.extend({ model: BG.Models.Score });

	BG.Collections.Checkers = {
		onBoard: Backbone.Collection.extend({
			model: BG.Models.Checkers.onBoard
		}),
		collected: Backbone.Collection.extend({
			model: BG.Models.Checkers.collected
		}),
		hit: Backbone.Collection.extend({
			model: BG.Models.Checkers.hit
		})
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

			var diceModel 			= new BG.Models.Dice({ value: dice });
			var diceView 			= new BG.Views.Dice({ model: diceModel });

			var cubeCollection 		= new BG.Collections.Cube({ model: cube });
			var cubeView 			= new BG.Views.Cube({ collection: cubeCollection });

			var scoreCollection   	= new BG.Collections.Score({ model: score });
			var scoreView 		  	= new BG.Views.Score({ collection: scoreCollection });

			var collectedCollection = new BG.Collections.Checkers.collected({ model: checkers.collected });
			var collectedView 		= new BG.Views.Checkers.collected({ collection: collectedCollection });

			var hitCollection 		= new BG.Collections.Checkers.hit({ model: checkers.hit });
			var hitView 			= new BG.Views.Checkers.hit({ collection: hitCollection });

			var onBoardCollection 	= new BG.Collections.Checkers.onBoard({ model: checkers.onBoard });
			var onBoardView 		= new BG.Views.Checkers.onBoard({ collection: onBoardCollection, dice: dice });
		}
	})
});