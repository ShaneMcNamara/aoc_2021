const pos1 = 4;
const pos2 = 5;

const getKey = (p1,p2,score1,score2, isOne) => `${p1}.${p2}.${score1}.${score2},${isOne}`;

const dp = {};
const solve = (p1,p2,s1,s2,isOne) => {
  if(s1 >= 21) return [1,0];
  if(s2 >= 21) return [0,1];
  const key = getKey(p1,p2,s1,s2, isOne);
  if(key in dp) return dp[key];
  const total = [0,0];
  for(let i = 1; i <= 3; i += 1) {
    for(let j = 1; j <= 3; j += 1) {
      for(let k = 1; k <= 3; k += 1) {
        const add = i + j + k;
        const p = isOne ? p1 : p2;
        const t = (p + add) % 10;
        const next = t === 0 ? 10 : t;
        const np1 = isOne ? next : p1;
        const np2 = isOne ? p2 : next;
        const ns1 = isOne ? s1 + next : s1;
        const ns2 = isOne ? s2 : s2 + next;
        const [next1,next2] = solve(np1,np2,ns1,ns2, !isOne);
        total[0] += next1;
        total[1] += next2;
      } 
    } 
  }
  dp[key] = total;
  return total;
}

console.log(solve(pos1,pos2,0,0,true));
