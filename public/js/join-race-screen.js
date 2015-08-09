var UI = {
    getUrlSessionId: function(){
        var url = window.location.href.split( '/' );
        return url.pop();
    },
    getUserName: function(){
        return document.querySelector( '#player-name' ).value;
    },
    setRaceName: function( name ){
        document.querySelector( '#race-name' ).innerHTML = name;
    },
    readyToGoHandler: function(){
        alert('notify server that user is ready and then: redirect to joystick? or update DOM with joystick?');
    },
    invalidRace: function(){
        alert('race is over! try another code');
        window.location.href = "../home";
    }
};
var app = {
    sessId: '',
    id: '',
    name: '',
    race: null,
    init: function(){
        this.sessId = UI.getUrlSessionId();
        /*UI.setId( this.sessId );*/
        this.setSocket();
        this.joinCircuit();
    },
//--socket methods
    socket: io(),
    joinCircuit: function(){
        this.name = UI.getUserName();
        this.socket.emit( 'joinRoom', { 
            roomId: this.sessId,
            userId: this.id,
            isPlayer: true,
            playerName: this.name
        });
        //then ask game to retrieve race data
        this.socket.emit( 'getRaceConfig', { roomId: this.sessId } );

    },
    setSocket: function(){
        this.socket.on( 'getRaceConfig', function( raceData ){
            //apply data to race config, players on circuit and so.
            //check if race exist
            if( !raceData.name ){
                UI.invalidRace();
            }else{
                app.race = raceData;
                UI.setRaceName( app.race.name );
            }
        });
    }
};
app.init();