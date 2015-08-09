module.exports = function( req, res, next ) {
	var viewPath = __dirname + '/../views';
	res.render( viewPath + '/race-circuit.html' );
};