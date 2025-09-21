import { createFileRoute } from '@tanstack/react-router';
import { VisualizerTool } from '../../components/test';
import { ProblemPage } from '../../components/problem';

export const Route = createFileRoute('/arrays/217')({
  component: RouteComponent,
});

const title: string = `217. Contains Duplicate`;
const description: string = `
Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.
`;
const constraints: string[] = [
  `1 <= nums.length <= 10^5`,
  `-10^9 <= nums[i] <= 10^9`,
];
const testString: {
  args: [{ name: string; value: string }];
  resultString: string;
  testToAddToCode: string;
}[] = [
  {
    args: [{ name: 'nums', value: '[1,2,3,4,4]' }],
    resultString: 'true',
    testToAddToCode: 'local nums = {1, 2, 3, 4, 4}',
  },
];

function RouteComponent() {

}

      <VisualizerTool
        title={title}
        description={description}
        constraints={constraints}
        testString={testString}
      />
