// UI Helpers
Object.prototype.show = function() {
    this.style.display = 'block';
};
Object.prototype.hide = function() {
    this.style.display = 'none';
};

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
    },
    showCircuit: function(){
        document.querySelector( '#awaiting-container' ).hide();
        document.querySelector( '#race-container' ).show();
    },
    animateCar: function( $car ){
        $car.className = "car racing";
    },
    getCar: function(){
        return document.querySelector( '#car' );
    },
    showFinish: function(){
        document.querySelector( '#race-container' ).hide();
        document.querySelector( '#race-finished' ).show();
    }
};
var app = {
    sessId: '',
    id: '',
    race: null,
    init: function(){
        this.sessId = UI.getUrlSessionId();
        UI.setId( this.sessId );
        this.setSocketCallbacks();
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
    setSocketCallbacks: function(){
        this.socket.on( 'getRaceConfig', function( data ){
            //apply data to race config, players on circuit and so.
            app.race = data;
            UI.setRaceName( app.race.name );
        });
        this.socket.on( 'roomReady', function( data ){
            var race = app.race;
            race.players = data.players;
            race.players[0].car = UI.getCar();
            UI.showCircuit();
            app.notifyRaceReady();
        });
        this.socket.on( 'playerThrottle', function( data ){
            if( !app.race.timer ){
                app.race.timer = setTimeout( function(){
                    app.finishRace();
                }, 2500 );
            }
            UI.animateCar( app.race.players[0].car );
        });
    },
    notifyRaceReady: function(){
        this.socket.emit( 'gameReady', { roomId: app.sessId } );
    },
    finishRace: function(){
        UI.showFinish();
        this.socket.emit( 'raceFinished', { roomId: app.sessId } );
    }
};
app.init();