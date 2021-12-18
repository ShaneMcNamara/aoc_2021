const fs = require('fs');

const fileData = fs.readFileSync('./input18.txt').toString();
const lines = fileData.split('\n')

const calcScore = (s) => {
  const l = s.length;
  const stripped = s.substring(1,l - 1);
  if(!stripped.includes('[')) {
    if(stripped.includes(',')) {
      const [l,r] = stripped.split(',').map(x => x * 1);
      return (3 * l) + (2 * r);
    }
    return parseInt(stripped, 10);
  }
  let depth = 0;
  const options = [];
  for(let i = 0; i < stripped.length; i += 1) {
    const c = stripped.charAt(i);
    if(c === '[') {
      depth += 1;
    } else if (c === ']') {
      depth -= 1;
    } else if (c === ',') {
      if(depth === 0) {
        options.push(stripped.substring(0, i));
        options.push(stripped.substring(i+1));
        break;
      }
    }
  }
  const left = calcScore(options[0]);
  const right = calcScore(options[1]);
  return (3 * left) + (2 * right);
}

const add = (s1, s2) => `[${s1},${s2}]`;
const shouldSetSplit = ({
  splitIndices = [],
  lastNumber = [],
  s = '',
}) => (
  splitIndices.length === 0
    && lastNumber.length === 2
    && parseInt(s.substring(lastNumber[0], lastNumber[1]), 10) >= 10
);
const parseNumber = ({
  arr = [],
  num,
  s
}) => {
  const int = arr.length === 2 ? parseInt(s.substring(arr[0], arr[1]), 10) : null;
  return int ? parseInt(int, 10) + num : num;
};

const reduce = (s0) => {
  let s = s0;
  while(s.length > 0) {
    let depth = 0;
    const numbers = [];
    let splitIndices = [];
    let didBreak;
    for(let i = 0; i < s.length; i += 1) {
      const c = s.charAt(i);
      if(c === '[') {
        depth += 1;
        if(depth > 4)  {
          // Explode
          let j = i + 1;
          while (j < s.length && s.charAt(j) !== ']') {
            j += 1;
          }
          let firstEnd = j;
          const [l,r] = s.substring(i+1,j).split(',').map(x => x * 1);
          let nextNumber = [];
          j += 1;
          while (j < s.length) {
            const c = s.charAt(j);
            if ((c === ']' || c === ',')) {
              if(nextNumber.length > 0) {
                nextNumber.push(j)
                break;
              }
            } else if(c !== '[' && nextNumber.length === 0) {
              nextNumber.push(j);
            }
            j += 1;
          }
          const lastNumber = numbers[numbers.length - 1] || [];
          const nextL = parseNumber({ arr: lastNumber, num: l, s });
          const nextR = parseNumber({ arr: nextNumber, num: r, s });
          const start = lastNumber.length === 2
            ? `${s.substring(0,lastNumber[0])}${nextL}${s.substring(lastNumber[1], i)}`
            : s.substring(0, i);
          const end = nextNumber.length === 2
          ? `${s.substring(firstEnd + 1, nextNumber[0])}${nextR}${s.substring(nextNumber[1])}`
          : s.substring(firstEnd + 1);
          s = `${start}0${end}`;
          didBreak = true;
          break;
        }
      } else if(c === ']') {
        depth -= 1;
        const lastNumber = numbers[numbers.length - 1];
        if(lastNumber.length === 1) {
          lastNumber.push(i);
        }
        if(shouldSetSplit({ splitIndices, lastNumber, s })) {
          splitIndices = [...lastNumber];
        }
      } else if(c === ',') {
        const lastNumber = numbers[numbers.length - 1];
        if(lastNumber.length === 1) {
          lastNumber.push(i);
        }
        if(shouldSetSplit({ splitIndices, lastNumber, s })) {
          splitIndices = [...lastNumber];
        }
      } else {
        if(numbers.length === 0
          || numbers[numbers.length - 1].length !== 1) {
          numbers.push([i]);
        }
      }
    }
    if(didBreak) continue;
    if(splitIndices.length === 0 && !didBreak) return s;
    const [ss, se] = splitIndices;
    const num = parseInt(s.substring(ss,se+1),10);
    const low = parseInt(Math.floor(num/2), 10);
    const high = parseInt(Math.ceil(num/2), 10);
    s = `${s.substring(0,ss)}[${low},${high}]${s.substring(se)}`;
  }
  return s;
}
const main = () => {
  let s0 = lines[0];
  for(let i = 1; i < lines.length; i += 1) {
    s0 = reduce(add(s0,lines[i]));
  }
  return calcScore(s0);
};

const main2 = () => {
  let maxScore = 0;
  for(let i = 0; i < lines.length - 1; i += 1) {
    for(let j = i + 1; j < lines.length; j += 1) {
      const score1 = calcScore(reduce(add(lines[i], lines[j])));
      const score2 = calcScore(reduce(add(lines[j], lines[i])));
      maxScore = Math.max(maxScore, score1, score2);
    }
  }
  return maxScore;
};

const start = Math.floor(new Date());
console.log(main());
console.log(main2());
const end = Math.floor(new Date());
console.log(`Runtime: ${end - start} ms`);
