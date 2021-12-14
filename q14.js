const fs = require('fs');

const main = (steps) => {
  const fileData = fs.readFileSync('./input14.txt').toString();
  const lines = fileData.split('\n');
  let template = '';
  const iMap = {};
  lines.forEach((line) => {
    if(line === '') return;
    if(line.includes('->')) {
      const [s,e] = line.split(' -> ');
      iMap[s] = e;
    } else {
      template = line;
    }
  })
  const charCount = {};
  for(let i = 0; i < template.length; i += 1) {
    const c = template.charAt(i);
    const { [c]: old = 0 } = charCount;
    charCount[c] = old + 1;
  }
  const dp = new Array(steps + 1).fill().map(() => ({}));

  const solve = (s, l) => {
    const c0 = s.charAt(0);
    const c1 = s.charAt(1);
    const counts = {};
    if(l == 0) return counts;
    if(s in dp[l]) return dp[l][s];
    if(!(s in iMap)) return counts;
    const m = iMap[s];
    counts[m] = 1;
    const left = c0 + m;
    const right = m + c1;
    const leftCount = solve(left, l - 1);
    const rightCount = solve(right, l - 1);
    Object.keys(leftCount).forEach((c) => {
      const { [c]: old = 0 } = counts;
      counts[c] = old + leftCount[c];
    })
    Object.keys(rightCount).forEach((c) => {
      const { [c]: old = 0 } = counts;
      counts[c] = old + rightCount[c];
    })
    dp[l][s] = counts;
    return counts;
  }
 
  for(let i = 0; i < template.length - 1; i += 1) {
    const s = template.substring(i, i + 2);
    const res = solve(s, steps);
    Object.keys(res).forEach((c) => {
      const { [c]: old = 0 } = charCount;
      charCount[c] = old + res[c];
    });
  }

  const entries = Object.entries(charCount);
  entries.sort((a,b) => a[1] - b[1])
  return entries[entries.length - 1][1] - entries[0][1];
}

console.log(main(10));
console.log(main(40));
