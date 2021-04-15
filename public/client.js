const keysArray = ['W', 'A', 'S', 'D', 'E'];


const setUpKeys = (keysArray) => {
    const parsedControls = ['UP', 'LEFT', 'DOWN', 'RIGHT', 'FIRE'];
    const keys = {};
    keysArray.forEach((ele, index) => {
        Object.defineProperty(keys, ele.charCodeAt(0), {
            value: parsedControls[index],
            enumerable: true
        })
    })
    return keys;
}   

const createKeysStatusObject = (keys) => {
    const keysStatus = {};
    Object.values(keys).forEach((value, index) => {
        keysStatus[value] = false;
    })
    return keysStatus;
}

const keyStatus = (keys) => {
    const key = keys;
    let status = createKeysStatusObject(keys);

    return {
        keyPressed(e) {
            status[keys[e.keyCode]] = true;
        },

        keyReleased(e) {
            status[keys[e.keyCode]] = false;
        },
        status
    }
}

const moveUpdate = (vehicle, controls) => {
    if (controls.UP) {
        vehicle.position = vehicle.position.add(vehicle.frontVector.multiplyByFloats(vehicle.speed, vehicle.speed, vehicle.speed))
    }

    if (controls.DOWN) {
        vehicle.position = vehicle.position.add(vehicle.frontVector.multiplyByFloats(-1 * vehicle.speed, -1 * vehicle.speed, -1 * vehicle.speed))
    }

    if (controls.LEFT && controls.UP) {
            vehicle.rotation.y -= 0.05;
            vehicle.frontVector = new BABYLON.Vector3(Math.sin(vehicle.rotation.y), 0, Math.cos(vehicle.rotation.y))
    }

    if (controls.RIGHT && controls.UP) {
        vehicle.rotation.y += 0.05;
        vehicle.frontVector = new BABYLON.Vector3(Math.sin(vehicle.rotation.y), 0, Math.cos(vehicle.rotation.y))
}
}

const createFollowCamera = (target, scene) => {
    const camera = new BABYLON.FollowCamera('followCamera', target.position, scene, target);
    camera.radius = 150; //how far the object to follow
    camera.heightOffset = 50; //how hight above the object to place camera
    camera.rotationOffset = 180; //the viewing angle
    camera.cameraAcceleration = 0.05; //how fast to move camera
    camera.maxCameraSpeed = 100;
    return camera;
}

const createScene = (engine, canvas) => {
    const scene = new BABYLON.Scene(engine);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    
    const ground = new BABYLON.MeshBuilder.CreateGround('ground', {
        width: 1000,
        height: 1000
    });
    
    const box = BABYLON.MeshBuilder.CreateBox('player', {}, scene);
    const boxMaterial = new BABYLON.StandardMaterial('boxMaterial', scene);
    boxMaterial.diffuseColor = new BABYLON.Color3.Red();
    box.material = boxMaterial;
    box.frontVector = new BABYLON.Vector3(0, 0, 1);
    box.speed = 5;
    const camera = createFollowCamera(box, scene);
    return scene;
}

const socket = io('http://localhost:3000');

const sendPlayerData = (socket, data) => {
    socket.emit('update', data);
}

const init = (socket) => {

    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);
    const scene = createScene(engine, canvas);

    const newKeys = setUpKeys(keysArray);
    console.log(newKeys);
    const keysStatus = keyStatus(newKeys);
    const player = scene.getMeshByName('player');

    socket.emit('newPlayer', {  x: player.position.x, y: player.position.y, z: player.position.z });

    engine.runRenderLoop(() => {
        moveUpdate(player, keysStatus.status);
        sendPlayerData(socket, keysStatus.status);
        // sendPlayerData(player);
        scene.render();
    });



    document.addEventListener('keydown', keysStatus.keyPressed);

    document.addEventListener('keyup', keysStatus.keyReleased);

}


const helloBtn = document.getElementById('helloBtn');

helloBtn.addEventListener('click', () => {
    socket.emit('clientToClient', 'Hello to the fellow client!');
})

init(socket);

console.log(socket);
// 
socket.on('serverToClient', (data) => {
    // console.log(data);
});
// 
socket.emit('clientToServer', 'Hello, server!');