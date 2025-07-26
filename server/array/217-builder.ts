import fs from 'fs'
import path from 'path'


const func = `
function solution(nums: number[]): boolean {
    debugger;
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] == nums[j]) {
                return true
            }
        }
    }
    return false;
};

`



export function build217(userId: string, nums: number[]) {

    let functionSolution = func + `
solution([${nums.toString()}])

`
    let a = path.resolve(`${process.cwd()}/debuggin/${userId}--217.ts`)

    fs.writeFileSync(`${a}`, functionSolution, { flag: 'w' });

}
