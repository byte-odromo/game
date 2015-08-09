module.exports = function( req, res, next ) {
	var viewPath = __dirname + '/../views';
	res.render( viewPath + '/new-race-config.html' );
};