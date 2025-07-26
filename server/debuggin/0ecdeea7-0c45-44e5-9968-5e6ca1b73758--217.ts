
function solution(nums: number[]): boolean {
    debugger;
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


solution([1,2,3,4,3])

