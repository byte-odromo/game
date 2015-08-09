var UI = {
    getUrlSessionId: function(){
        var url = window.location.href.split( '/' );
        url.pop();
        return url.pop();
    },
    getUrlUserId: function(){
        var url = window.location.href.split( '/' );
        return url.pop();
    },
    setId: function( id ){
        document.querySelector( '#race-code' ).innerHTML = id;
    },
    setRaceName: function( name ){
        document.querySelector( '#race-name' ).innerHTML = name;
    }
};
var app = {
    sessId: '',
    id: '',
    race: null,
    init: function(){
        this.sessId = UI.getUrlSessionId();
        UI.setId( this.sessId );
        this.setSocket();
        this.joinCircuit();
    },
//--socket methods
    socket: io(),
    joinCircuit: function(){
        //ask lobby to create room because lobby lost room track through url navigation
        this.socket.emit( 'createRoom', { 
            roomId: this.sessId,
            userId: this.id
        });
        //then ask game to retrieve race data
        this.socket.emit( 'getRaceConfig', { roomId: this.sessId } );

    },
    setSocket: function(){
        this.socket.on( 'getRaceConfig', function( data ){
            //apply data to race config, players on circuit and so.
            app.race = data;
            UI.setRaceName( app.race.name );
        });
    }
};
app.init();