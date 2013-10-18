$(function() {
	window.BG = {
		Models: {},
		Collections: {},
		Views: {},
		Events:{}
	};		

	window.template = function (id) { return _.template( $('#' + id ).html() ); };

	_.extend(BG.Events, Backbone.Events);

	// MODELS
	BG.Models.Checker = Backbone.Model.extend({
		defaults: {
			value:0
		},
		
		validate: function(attrs) {
			if (!attrs.value) {
				return 'I need a value!';
			}
		},

		initialize: function(){
			console.log('CheckerModel has been initialized.');
			this.on('change:value', function(){
				console.log('- The value of CheckerModel have changed.');
			});
		}
	});

	BG.Models.Dice = Backbone.Model.extend({
		unplayed : [6,1],
		played : []
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
			$('.cube-holder').html(this.el);
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
				this.render();
				this.collection.on('change',this.render,this);
			},

			render:function () {
				var obj = { model: [] },
					dice = this.options.dice,
					you = [],
					opp = [];
				obj.model = this.collection.models[0].get('model');
				$.each(obj.model, function (i,val) {
					if(this.loc !== undefined){
						if(this.loc[0] == 1){
							you.push(i);
						}else if(this.loc[0] == 0){
							opp.push(i);
						}
					}
				});
				this.el = $(this.template(obj.model));
				var lines = this.el.find('.line').find('.checker-holder');

				var opts = {
					model: obj.model,
					lines: lines,
					dice: dice,
					you: you,
					opp: opp
				};

				var possible = this.getAllPossibleOptions(opts);
				this.renderPossibleOptions(possible, opts);
				this.userInteraction(opts);

				$('.all-boards').html(this.el);
				return this;
			},

			renderPossibleOptions: function (possible, opts) {
				var self = this;
				possible = _.union(_.flatten(possible));
				$.each(possible,function (index, item) {
					var val = self.indexToLocation(item);
					$(opts.lines[val]).addClass("available");
				});
			},

			userInteraction: function (opts) {
				var self = this;
				$.each(opts.lines,function (index) {				
					var val = self.indexToLocation(index);
					if(opts.you.indexOf(val) > -1){
						$(this).addClass('movable').on('click',function () {
							self.moveToHolder.call(this,opts,index,self);
						});
					}
				});
			},

			moveToHolder: function (opts,index,self) {
				var unplayed = opts.dice.unplayed,
					played = opts.dice.played;

				self.collection.models[0].get('model')[index].loc.shift();
				var checker = $(this).children('.checker:last-child');
				$(opts.lines[index + unplayed[0]]).append(checker);
			},

			getAllPossibleOptions: function (opts) {
				var self = this;
				var options = _.object(opts.you,opts.you);
				
				$.each(options,function(index,key) {
					var result = self.checkPossibleOptions(opts,key);
					options[index] = result;
				});
				return options;
			},

			checkPossibleOptions: function(opts,loc){
				var self = this,
					result = [],
					unplayed = opts.dice.unplayed,
					played = opts.dice.played;

				// Check to see if there is any unplayed dice
				if(unplayed.length){

					// If the player did not make a move 
					// and the first two dices are the same
					// it is a double dice (like [4,4])
					// we should make it like [4,4,4,4]
					if(unplayed[0] === unplayed[1] && !played.length){
						unplayed[3] = unplayed[2] = unplayed[0];
					}

					// Calculate the possible options for each dice
					var possible = [unplayed[0]];
					for(var i in unplayed) {
						for(var j in possible) {
							var index = unplayed[i] + Number(j);
							possible[index] = index;
						}
					}
					possible = _.union(_.flatten(possible));

					// Find the possible moves and add them to the result array
					for (var i in possible){
						var isMovePossible = self.isMovePossible(opts, loc - possible[i]);
						if(isMovePossible !== false && isMovePossible !== undefined){
							result.push(isMovePossible);
						}
					}
					
					console.log(result);
					return result;
				}else{
				// there is no unplayed dice

				}
			},

			isMovePossible: function (opts,loc) {
				var self = this;
				var result;
				if(loc > -1){
					var model = opts.model[loc];
					result = ((model.loc.length > 1) && (!model.loc[1])) ? false : loc;
				}
				return result;
			},

			indexToLocation: function (index) {
				return (23 - index) % 24;
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
				var obj = this.collection.models[0].get('model'),
					hitCheckersContainer = $('.hit-checkers-container');
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
			var checkers = questions.models[0].get('checkers'),
				cube = questions.models[0].get('cube'),
				dice = questions.models[0].get('dice'),
				score = questions.models[0].get('score'),

				diceModel			= new BG.Models.Dice({ unplayed: dice.unplayed, played: dice.played }),
				diceView			= new BG.Views.Dice({ model: diceModel }),

				cubeCollection		= new BG.Collections.Cube({ model: cube }),
				cubeView			= new BG.Views.Cube({ collection: cubeCollection }),

				scoreCollection		= new BG.Collections.Score({ model: score }),
				scoreView			= new BG.Views.Score({ collection: scoreCollection }),

				collectedCollection = new BG.Collections.Checkers.collected({ model: checkers.collected }),
				collectedView		= new BG.Views.Checkers.collected({ collection: collectedCollection }),

				hitCollection		= new BG.Collections.Checkers.hit({ model: checkers.hit }),
				hitView				= new BG.Views.Checkers.hit({ collection: hitCollection }),

				onBoardCollection	= new BG.Collections.Checkers.onBoard({ model: checkers.onBoard }),
				onBoardView			= new BG.Views.Checkers.onBoard({ collection: onBoardCollection, dice: dice });
		}
	});
});