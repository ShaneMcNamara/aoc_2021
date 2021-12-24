const fs = require('fs');
const fileData = fs.readFileSync('./input24.txt').toString();
const lines = fileData.split('\n');

const grid = [];
let row = [];
lines.forEach((line, ind) => {
  if(line === '') {
    grid.push(row);
    row = [];
  } else {
    const data = line.split(' ');
    const instruction = {
      type: data[0],
      data: data.slice(1)
    };
    row.push(instruction)
  }
  if(ind === lines.length - 1) grid.push(row)
})

const compute = ({ input, depth = 0, initialVals = { x: 0, y: 0, z: 0, w: 0 } }) => {
  if(depth >= grid.length) return initialVals;
  const vars = {...initialVals};
  for(let k = 0; k < grid[depth].length; k += 1) {
    const { type, data } = grid[depth][k];
    const [i,j] = data;
    const jval = j in vars ? vars[j] : parseInt(j, 10);
    switch(type) {
      case 'inp':
        vars[i] = input;
        break;
      case 'add':
        vars[i] += jval;
        break;
      case 'mul':
        vars[i] *= jval;
        break;
      case 'div':
        if(jval === 0) return { hadBad: true };
        vars[i] = parseInt(vars[i] / jval, 10);
        break;
      case 'mod':
        if(vars[i] < 0 || jval <= 0) return { hadBad: true };
        vars[i] = vars[i] % jval;
        break;
      case 'eql':
        vars[i] = vars[i] === jval ? 1 : 0
        break;
    }
  }
  return { vars, hadBad: false };
};

const getKey = ({ x,y,z,w } = {}) => `${x},${y},${z},${w}`;


const main = (highest) => {
  const N = 3;
  const nodes = new Array(N).fill().map((_,i) => {
    const val = highest ? 9 - N + i + 1 : i + 1;   // This should actually be N - i, but we got lucky and the lowest starts with 3.
    return [0,`${val}`, compute({ input: val }).vars];
  }); // depth, num, data
  const v = new Array(grid.length).fill().map(() => ({ }));
  let maxVal = Number.MIN_SAFE_INTEGER;
  while(nodes.length > 0) {
    const [depth,num, data] = nodes.pop();
    const numInt = parseInt(num, 10);
    if(depth === grid.length - 1) {
      if(data.z === 0) return numInt;
      continue;
    }
    const key = getKey(data);
    if(key in v[depth]) continue;
    v[depth][key] = numInt;
    let newDepth = depth + 1; 
    for(let i = 1; i <= 9; i += 1) {
      const nextVal = highest ? i : 10 - i;
      const {
        vars: nextVars,
        hadBad,
      } = compute({ input: nextVal, initialVals: data, depth: newDepth });
      if(!hadBad) nodes.push([newDepth, `${num}${nextVal}`, nextVars ])
    }
  }
  return maxVal;
}



const start = Math.floor(new Date()); 
console.log(main(true))
console.log(main())
const end = Math.floor(new Date());
console.log(`Runtime: ${end - start} ms`);
