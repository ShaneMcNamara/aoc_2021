const ROOM_DEPTH = 4;
const energy = [1,10,100,1000];
const HALL_LEN = 11;
// A = 0, B = 1, C = 2, D = 3
const rooms = [
  [[0,0],[3,1],[3,2],[1,3]],
  [[3,4],[1,5],[2,6],[2,7]],
  [[2,8],[0,9],[1,10],[1,11]],
  [[0,12],[2,13],[0,14],[3,15]] // type, id
];

const main = () => {
  const hallway = new Array(HALL_LEN).fill(-1);
  const locked = new Set([0,1,2,4,5,6,8,9,10,12,13,14]);
  const podpos = [20,21,22,23, 24,25,26,27, 28,29,30,31, 32,33,34,35]; // Rooms start at 20
  const pods = [[1,3],[2,7],[1,11],[3,15],[3,2],[2,6],[1,10],[0,14],[3,1],[1,5],[0,9],[2,13],[0,0],[3,4],[2,8],[0,12]];
  const roomEntrance = new Set([2,4,6,8]);
  const roomMap = [-1,-1,-1,-1];
  const dp = {};
  let superglobalmin = Number.MAX_SAFE_INTEGER;
  
  const roomIsGood = (room, idx) => room.length === ROOM_DEPTH 
    && room[0][0] === idx
    && room.every((pod, i) => i === 0 ? true : pod[0] === room[i-1][0])
    && new Set(room.map(pod => pod[1])).size === ROOM_DEPTH;
  const isSolved = (rooms) => rooms.every(roomIsGood);

  const getRoomFromPos = (i) => {
    const roomNum = parseInt((i - 20) / ROOM_DEPTH);
    const height = (i - 20) - (roomNum * ROOM_DEPTH);
    return { roomNum, height, fullPod: rooms[roomNum][height] };
  }
  const getRoomPosition = (roomNum, roomLength) =>  20 + (roomNum * ROOM_DEPTH) + roomLength;
  const getRoomExit = (roomNum) => 2 + (2 * roomNum);
  const getRoomFromExit = (exit) => parseInt((exit - 2) / 2);

  const canEnterRoom = ({ roomNum, fullPod, rooms, roomMap }) => {
    if(roomNum !== fullPod[0]) return; // Not my room
    const roomL = rooms[roomNum].length;
    if(roomL === ROOM_DEPTH) return false; // Full room
    if(roomMap[roomNum] > 0 && roomMap[roomNum] !== fullPod[0]) return false; // Cant stop in a claimed room
    if(roomL > 0 && rooms[roomNum].some(pod => pod[0] !== fullPod[0])) return false; // Different type in the room 
    const existing = roomMap.findIndex((room) => room === fullPod[0]);
    if(existing > 0 && existing !== roomNum) return false; // This pod type has claimed a different room
    return true;
  }
  const canMoveInHallway = ({ position, fullPod, rooms, roomMap }) => {
    for(let j = position + 1; j < HALL_LEN; j += 1) {
      if(hallway[j] >= 0) break; // Hit another pod
      if(roomEntrance.has(j)) {
        const nextRoomNum = getRoomFromExit(j);
        if(canEnterRoom({ roomNum: nextRoomNum, fullPod, rooms, roomMap })) {
          return true;
        }
      }
    }
    for(let j = position - 1; j >= 0; j -= 1) {
      if(hallway[j] >= 0) break; // Hit another pod
      if(roomEntrance.has(j)) {
        const nextRoomNum = getRoomFromExit(j);
        if(canEnterRoom({ roomNum: nextRoomNum, fullPod, rooms, roomMap })) {
          return true;
        }
      }
    }
    return false;
  }

  const getKey = ({ hallway, locked, podpos, roomMap  }) => (
    `${hallway.join(',')}-${Array.from(locked).join(',')}-${podpos.join(',')}-${roomMap.join(',')}`
  );

  const claimRoom = ({ roomNum, fullPod }) => {
    const [type] = fullPod;
    const roomL = rooms[roomNum].length;
    const cost = energy[type];
    const claimCost = (ROOM_DEPTH - roomL) * cost;
    rooms[roomNum].push(fullPod);
    podpos[fullPod[1]] = getRoomPosition(roomNum, roomL);
    const prevRoomOwner = roomMap[roomNum];
    roomMap[roomNum] = fullPod[0];
    return { claimCost, prevRoomOwner };
  }

  const unclaimRoom = ({ position, podId, prevRoomOwner, roomNum }) => {
    podpos[podId] = position;
    roomMap[roomNum] = prevRoomOwner;
    rooms[roomNum].pop();
  }

  const solve = ({ score = 0 } = {}) => {
    if(score > superglobalmin) return
    if(isSolved(rooms)) {
      if(score < superglobalmin) {
        console.log(`New min: ${score}`)
      }
      superglobalmin = Math.min(superglobalmin,score);
      return score;
    }
    const key = getKey({ hallway, locked, podpos, roomMap });
    if(key in dp && dp[key] < score) return dp[key];
    dp[key] = score;
    pods.forEach((fullPod) => {
      const [type,podId] = fullPod;
      const position = podpos[podId];
      const cost = energy[type];

      let newScore = score;
      const isInRoom = position >= 20;
      let startingIndex = position;
      let roomNum;
      let unlocked;
      if(isInRoom) {
        // In room;
        const {
          roomNum: rn,
          height,
        } = getRoomFromPos(position);
        roomNum = rn;

        if(roomIsGood(rooms[roomNum])) return; // Solved this room already
        if(!(height == rooms[roomNum].length - 1)) return; // Trapped
        if (roomMap[roomNum] !== -1) {
          return; // Pod has its room, handle pod in wrong room?
        }
        rooms[roomNum].pop(); // Leave the room
        const roomLen = rooms[roomNum].length;
        if(roomLen > 0) {
          unlocked = rooms[roomNum][roomLen - 1];
          locked.delete(unlocked[1]);
        }
        startingIndex = getRoomExit(roomNum);
        newScore = score + ((ROOM_DEPTH - roomLen) * cost);
      } else {
        const canMove = canMoveInHallway({ position, fullPod, rooms, roomMap});
        if(!canMove) return;
        hallway[position] = -1;
      }

      // Forward
      for(let i = startingIndex + 1; i < HALL_LEN; i += 1) {
        const d = (i - startingIndex);
        if(hallway[i] >= 0) break; // hit another pod
        if(roomEntrance.has(i)) {
          const nextRoomNum = getRoomFromExit(i);
          if(!canEnterRoom({ roomNum: nextRoomNum, fullPod, rooms, roomMap })) continue;
          // Claim the room :)
          const { claimCost, prevRoomOwner } = claimRoom({ roomNum: nextRoomNum, fullPod });
          solve({
            score: newScore + (d * cost) + claimCost,
          });
          unclaimRoom({ position, podId, prevRoomOwner, roomNum: nextRoomNum });
          continue;
        }
        if(isInRoom) {
          //Just stop in the hallway
          hallway[i] = podId;
          podpos[podId] = i;
          solve({
            score: newScore + (d * cost), //path: newPath, level: level + 1
          });
          hallway[i] = -1;
          podpos[podId] = position;
        }
      }

      // Backwards
      for(let i = startingIndex - 1; i >= 0; i -= 1) {
        const d = startingIndex - i;
        if(hallway[i] >= 0) break; // hit another pod
        if(roomEntrance.has(i)) {
          const nextRoomNum = getRoomFromExit(i);
          if(!canEnterRoom({ roomNum: nextRoomNum, fullPod, rooms, roomMap })) continue;
          // Claim the room :)
          const { claimCost, prevRoomOwner } = claimRoom({ roomNum: nextRoomNum, fullPod });
          solve({
            score: newScore + (d * cost) + claimCost,
          });
          unclaimRoom({ position, podId, prevRoomOwner, roomNum: nextRoomNum });
          continue;
        }
        if(isInRoom) {
          // Just stop in the hallway
          hallway[i] = podId;
          podpos[podId] = i;
          solve({
            score: newScore + (d * cost),
          });
          hallway[i] = -1;
          podpos[podId] = position;
        }
      }
      if(isInRoom) {
        rooms[roomNum].push(fullPod); // Reset state
        if(unlocked) locked.add(unlocked[1]);
      } else {
        hallway[position] = podId;
      }
    });
    return;
  }
  solve();
  return superglobalmin;
};


const start = Math.floor(new Date()); 
console.log(main());
const end = Math.floor(new Date());
console.log(`Runtime: ${end - start} ms`);
