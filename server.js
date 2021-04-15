const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });

app.use(express.static('public'));

const testIIF = (function() {
  let zmienna = {};

  function updateData(data) {
      zmienna = { ...data };
  }

  function getData() {
      return zmienna;
  }

  return {
    updateData,
    getData
  }
})();

const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

const connected = (socket) => {
  console.log('A new client has connected');
  socket.on('newPlayer', data => {
    console.log(`socket ID - ${socket.id} - data ${data.x} -- ${data.y}`);
  })
  socket.emit('ServerClientHello', 'Server says hello to client');
  socket.on('update', data => {
    testIIF.updateData(data);
  });

  setInterval(() => {
    socket.emit('playerKeys', testIIF.getData());
    
  }, 5000)
}

io.on('connection', connected);


