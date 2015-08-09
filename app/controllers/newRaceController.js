var generateHash = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i = 0; i < 5; i++ ) {
        text += possible.charAt( Math.floor( Math.random() * possible.length) );
    }
    return text;
}

module.exports = function( req, res, next ) {
    res.redirect( 'configrace/' + generateHash() );
};