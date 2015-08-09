var UI = {
	getUrlSessionId: function(){
		return window.location.href.split( '/' ).pop();
	},
	goButtonClickHandler: function( evt ){
		app.goToCircuit();
		evt.preventDefault();
	},
	goTo: function( url ){
		window.location.href = url;
	},
	getRaceName: function(){
		return document.querySelector( '#race-name' ).value;
	}
};
var app = {
	sessId: '',
	id: '',
	init: function(){
		this.id = this.generateHash();
		this.sessId = UI.getUrlSessionId();
		this.setSocket();
	},
	goToCircuit: function(){
		//save config (race name) and redirect
		this.createRoom();
	},
	generateHash: function() {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i = 0; i < 5; i++ ) {
	        text += possible.charAt( Math.floor( Math.random() * possible.length) );
	    }
	    return text;
	},
//--socket methods
	socket: io(),
	createRoom: function(){
        this.socket.emit( 'createRoom', { 
        	roomId: this.sessId, 
        	userId: this.id, 
        	raceName: UI.getRaceName()
       	});
    },
    setSocket: function(){
		this.socket.on( 'createRoom', function( roomId ){
	        //app.roomId = roomId;
	        //UI.showRoom();
	        //UI.renderUser( app.id, true );
	        UI.goTo( "../circuit/" + app.sessId + '/' + app.id );
	    });
	}
};
app.init();