import { createFileRoute } from '@tanstack/react-router';
import tree from '../assets/treegif.gif';
import { useContext } from 'react';
import { ThemeContext } from './__root';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const theme = useContext(ThemeContext);
  return (
    <div className='w-full justify-center items-center gap-y-8 pt-8'>
      <div className='flex  items-center justify-center h-full flex-col'>
        <div className='w-8/10 flex flex-col gap-y-10 items-center'>
          <div className='text-[30px]'>Master Coding Through Visualization</div>
          <div
            className='flex text-wrap rounded-2xl p-8  justify-center items-center'
            style={{
              border: `2px solid ${theme.vals.colors.primary}`,
              backgroundColor: theme.vals.colors.heatmap[0],
            }}
          >
            <div className='flex flex-col gap-y-5'>
              <div className='text-[25px]  flex '>The Challenge We Solve</div>
              <div className='w-8/10 text-[20px]'>
                Many learners struggle to move beyond simply reading code to
                truly understanding how it works step-by-step. Complex
                algorithms and abstract logic often feel overwhelming and hard
                to visualize. Busy Tutor addresses this challenge by turning
                static code into interactive, animated walkthroughs that reveal
                the inner workings of each line. By making code execution
                visible and intuitive, we help learners build stronger
                comprehension and the confidence to tackle even the toughest
                problems.
              </div>
            </div>

            <div className='w-90 h-full shrink-0'>
              <img className='w-full h-full' src={tree} />
            </div>
          </div>

          <div
            className='flex text-wrap rounded-2xl p-8  justify-center items-center'
            style={{
              border: `2px solid ${theme.vals.colors.primary}`,
              backgroundColor: theme.vals.colors.heatmap[0],
            }}
          >
            <div className='flex flex-col gap-y-5'>
              <div className='text-[25px]  flex '>
                See code come alive — understand every step
              </div>
              <div className='w-8/10 text-[20px]'>
                At Busy Tutor, we turn code into clear, step-by-step visuals
                that make complex logic easy to follow. By seeing how each line
                affects the program, you’ll build deeper understanding and
                coding confidence. When code comes alive, learning becomes
                simple and powerful.
              </div>
            </div>

            <div className='w-90 h-full shrink-0'>
              <img className='w-full h-full' src={tree} />
            </div>
          </div>

          <div
            className='flex text-wrap rounded-2xl p-8  justify-center items-center'
            style={{
              border: `2px solid ${theme.vals.colors.primary}`,
              backgroundColor: theme.vals.colors.heatmap[0],
            }}
          >
            <div className='flex flex-col gap-y-5'>
              <div className='text-[25px]  flex '>
                Powerful Built-In Visualizations
              </div>
              <div className='w-8/10 text-[20px]'>
                Busy Tutor’s built-in visualizations make data structures clear
                and easy to understand. Interactive animations show how data
                moves and changes, turning abstract concepts into simple,
                tangible learning moments.
              </div>
            </div>

            <div className='w-90 h-full shrink-0'>
              <img className='w-full h-full' src={tree} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
