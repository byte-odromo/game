module.exports = function(app,io) {
	// Socket
    app.roomList = {};
    io.on('connection', function(socket) {
        app.events.emit( 'socket.connection', socket );
        console.log('----connection-----');
        
        socket.on('disconnect', function( socket ) {
            console.log('----user disconnected----');
        });

        socket.on( 'createRoom', function( id ){
            var roomId = Math.random();
            socket.join( roomId );
            app.roomList[ roomId ] = [];
            app.roomList[ roomId ].push( id );

            socket.emit( 'onCreateRoom',  roomId );
            io.sockets.emit( 'onCreateNewRoom', roomId );
        });

        socket.on('getMembers', function( roomId ){
            socket.emit( 'onGetMembers', app.roomList[ roomId ] );
        });

        socket.on('getRooms', function(){
            var rooms = [];
            for( var el in app.roomList ){
                rooms.push( el );
            }
            socket.emit( 'onGetRooms', rooms );
        });

        socket.on('joinRoom', function( guess ) {
            socket.join( guess.roomId );
            app.roomList[ guess.roomId ].push( guess.id );

            socket.emit( 'onJoinRoom',  guess.roomId );
            // emit to all, inlude the client
            // io.sockets.to(socket.room).emit('game', 'Nuevo player conectado');
            // emit to all, exlude the client
            socket.broadcast.to( guess.roomId ).emit('onNewJoinRoom', { id: guess.id });
        });

        socket.on( 'leaveRoom', function( data ){
            socket.leave( data.roomId );
            //loop on members of given room
            for( var i = 0; i < app.roomList[data.roomId].length; i++ ){
                //found position of member id
                if( app.roomList[data.roomId][i] == data.userId ){
                    //remove member from room list
                    app.roomList[data.roomId].splice( i, 1 );
                    //remove room if its empty
                    if( app.roomList[data.roomId].length == 0 ){
                        delete app.roomList[data.roomId];
                    }
                    break;
                }
            }

            if( !app.roomList[data.roomId] ){
                //update removed room
                io.sockets.emit( 'onCloseRoom', data.userId );
            }
            socket.emit( 'onLeaveRoom',  data.userId );
            socket.broadcast.to( data.roomId ).emit('onNewLeaveRoom', data.userId );
        })
    });
};