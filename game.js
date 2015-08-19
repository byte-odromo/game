var express = require('express');
var Race = function(){
	this.name = '';
	this.screens = [];
	this.players = [];
	this.status = 'new';
};

var Game = function( lobby, router ){
	var game = {
		rooms: {}
	};
	router.get( '/home', require( './app/controllers/homeController' ) );
	router.get( '/newrace', require( './app/controllers/newRaceController' ) );
	router.get( '/configrace/:sessid', require( './app/controllers/configRaceController' ) );
	router.get( '/circuit/:sessid/:userid', require( './app/controllers/circuitController' ) );
	router.get( '/joinrace/:sessid', require( './app/controllers/joinRaceController' ) );

	try{
        var joystick = require('byte-odromo-joystick')( lobby, router );
    }catch( e ){
        console.log('Joystick not found.');
        console.log(e);
    };

	lobby.use(function(req, res, next) {
		if( req.url == '/' ){
			res.redirect('/home');
		}else{
			next();
		}
	});

	lobby.use( '/byte-odromo', express.static( __dirname + '/public' ) );

	/*
	* Lobby socket events(1) must be handler via lobby events.
	* Others socket events related to Game can be adedd directly to socket recieved as parameter on 'socket.connection' event
	* (1) socket.connection - socket.disconect - socket.createRoom
	*/
	lobby.events.on( 'socket.connection', function( data ){
		var socket = data.socket;
		console.log('ON socket.connection FROM GAME');

		socket.on( 'getRaceConfig', function( params ){
			var race = game.rooms[ params.roomId ];
			socket.emit( 'getRaceConfig', race );
		});

		socket.on( 'getRaceData', function( params ){
			var roomId = params.roomId;
			var race = game.rooms[ roomId ] || null;
			socket.emit( 'getRaceData',  race );
		});

		socket.on( 'gameReady', function( params ){
			var race = game.rooms[ params.roomId ];
			race.status = 'set';
			socket.broadcast.to( params.roomId ).emit( 'gameReady', race );
		});

		socket.on( 'joystick', function( params ){
			//convert joystick signals into game actions: joystick.button1 => player1.throttle
			var race = game.rooms[ params.roomId ];
			race.status = 'go';
			socket.broadcast.to( params.roomId ).emit( 'playerThrottle', { id: params.userId } );
		});

		socket.on( 'raceFinished', function( params ){
			var race = game.rooms[ params.roomId ];
			race.status = 'end';
			socket.broadcast.to( params.roomId ).emit( 'raceFinished', race );
		});
	});

	lobby.events.on( 'socket.disconect', function( data ){
		console.log('ON socket.disconect FROM GAME');
	});

	lobby.events.on( 'socket.createRoom', function( data ){
		var params = data.params;
		var roomAlreadyStored = Boolean( game.rooms[ params.roomId ] );
		//Lobby doesn't preserve rooms among url changes, so going from race-config to circuit UI
		//make Game creates room and Lobby doesn't know it. So Game's client ask to Lobby for a new room
		//while Game must use the stored one
		if( !roomAlreadyStored ){
			//set race config received from client
			var race = new Race();
			race.name = params.raceName;
			race.screens.push( params.userId );
			game.rooms[ params.roomId ] = race;
		}
	});

	lobby.events.on( 'socket.joinRoom', function( data ){
		var params = data.params;
		var socket = data.socket;
		var race = game.rooms[ params.roomId ];
		var minimumPlayersRequired = 1;
		if( !race ){
			return;
		}
		//player or screen must be setted on front-end, maybe by user choice or device type: desktop vs mobile
		if( params.isPlayer ){
			race.players.push( { id: params.userId, name: params.playerName } );
			if( race.players.length == minimumPlayersRequired ){
				// emit to all, exclude the client
				race.status = 'ready';
				socket.broadcast.to( params.roomId ).emit( 'roomReady', race );
			}
		}else{
			//screens should store object like players, not just an id
			race.screens.push( params.id );
		}
	});

	return {

	}
}

module.exports = Game;