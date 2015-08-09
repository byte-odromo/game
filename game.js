var express = require('express');

var Game = function( lobby, router ){
	var game = {};
	router.get('/home', require('./app/controllers/myGameController'));
	lobby.use(function(req, res, next) {
		if( req.url == '/' ){
			res.redirect('/home');
		}else{
			next();
		}
	});
	lobby.use( '/byte-odromo', express.static( __dirname + '/public' ) );

	lobby.events.on('socket.connection', function( socket ){
		console.log('ON socket.connection FROM GAME');
	})

	return {

	}
}

module.exports = Game;