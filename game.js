var express = require('express');
var Race = function(){
	this.name = '';
	this.screens = [];
	this.players = [];
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
	/*uFxrq*/

	/*lobby.use(function(req, res, next) {
		if( req.url == '/' ){
			res.redirect('/home');
		}else{
			next();
		}
	});*/

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
	});

	lobby.events.on( 'socket.disconect', function( data ){
		console.log('ON socket.disconect FROM GAME');
	});

	lobby.events.on( 'socket.createRoom', function( data ){
		var params = data.params;
		var roomAlreadyStored = Boolean( game.rooms[ params.roomId ] );
		//Lobby doesn't preserve rooms among url changes, so going from race-config to circuit UI causes
		//Game creates room and Lobby doesn't know it. So Game's client ask to Lobby for a new room
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
		var race = game.rooms[ params.roomId ];
		if( !race ){
			return;
		}
		//player or screen must be setted on front-end, maybe by user choice or device type: desktop vs mobile
		if( params.isPlayer ){
			race.players.push( { id: params.id, name: params.name } );
		}else{
			//screens should store object like players, not just an id
			race.screens.push( params.id );
		}
	});

	return {

	}
}

module.exports = Game;