import { createFileRoute } from '@tanstack/react-router'
import { useContext } from 'react';
import { ThemeContext } from '../__root';

export const Route = createFileRoute('/arrays/217')({
    component: RouteComponent,
})

function RouteComponent() {

    const { vals: { colors } } = useContext(ThemeContext)
    //const navigate = useNavigate({ from: '/arrays' })
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',

                height: '100%',
            }}
        >

            <div
                style={{
                    width: '50%',
                    padding: 20,
                    rowGap: 40,
                    paddingTop: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRight: `1px solid ${colors.text}`
                }}
            >

                <div
                    style={{
                        fontWeight: 'bold',
                        fontSize: 40,
                    }}
                >
                    217. Contains Duplicate
                </div>
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        rowGap: 20,
                    }}
                >
                    <p>Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.</p>
                    <div

                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            rowGap: 10,
                        }}
                    >


                        <div
                            style={{
                                fontWeight: 'bold'
                            }}
                        >
                            Constraints</div>
                        <ul
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                rowGap: 10,
                                paddingLeft: 40,
                                listStyle: 'disc',
                            }}
                        >
                            <li>${'1 <= nums.length <= 105'}</li>
                            <li>{'-109 <= nums[i] <= 109'}</li>
                        </ul>
                    </div>

                </div>

                <div
                    style={{
                        rowGap: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            fontWeight: 'bold',
                            fontSize: 20
                        }}
                    >Ideas</div>
                    <div
                        style={{
                            backgroundColor: colors.secondary,
                            borderRadius: 5,
                        }}
                    >
                        <ul>
                            <li
                                style={{
                                    width: 50,
                                    backgroundColor: colors.primary,
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                            >
                                1
                            </li>
                        </ul>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            rowGap: 10,
                            flexDirection: 'column'
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 'bold',
                                fontSize: 17,
                            }}
                        >Brute Force</div>
                        <div>
                            We can loop through the arrays 2 and compare each element with each to each other. If we find a match we return false else we return true
                        </div>
                        <div
                            style={{
                                display: 'flex'
                            }}
                        >
                            <div
                                style={{
                                    width: 200
                                }}
                            >
                                Time Complexity
                            </div>
                            <div>O(N^2)</div>
                        </div>

                        <div
                            style={{
                                display: 'flex'
                            }}
                        >
                            <div
                                style={{
                                    width: 200
                                }}
                            >Space Complexity</div>
                            <div>O(1)</div>
                        </div>
                    </div>

                </div>

            </div>

            <div
                style={{
                    width: '50%'
                }}
            >
                {`
                    function containsDuplicate(nums: number[]): boolean {
                        for(let i = 0; i < nums.length; i++){
                            for(let j = i + 1; j < nums.length; j++){
                                if(nums[i]== nums[j]){
                                    return true
                                }
                            }
                        }
                        return false;
                    };`
                }
            </div>

        </div>
    )
}
