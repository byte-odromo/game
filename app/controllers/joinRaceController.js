module.exports = function( req, res, next ) {
	var viewPath = __dirname + '/../views';
	res.render( viewPath + '/join-race.html' );
};