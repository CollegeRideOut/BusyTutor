import { createFileRoute } from '@tanstack/react-router'
import { useContext, useState } from 'react';
import { ThemeContext } from '../__root';
import { VscDebugStart } from "react-icons/vsc";
import { VscDebugStepOver } from "react-icons/vsc";
import { testInterperter } from '../../utils/interperter'
import parse from 'luaparse'





export const Route = createFileRoute('/arrays/217')({
    component: RouteComponent,
})


function RouteComponent() {

    const { vals: { colors } } = useContext(ThemeContext)
    const [toggleGame, setToggleGame] = useState(true)
    //    const [nums, setNums] = useState<number[] | null>([]);
    //   const [variables, setVariables] = useState<{ name: string, type: 'val' | 'ref', tooltip: string }[]>([]);
    //

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
                    borderRight: `1px solid ${colors.text}`,
                    padding: !toggleGame ? 20 : 0,
                    rowGap: !toggleGame ? 40 : 0,
                    paddingTop: !toggleGame ? 40 : 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >

                <div
                    style={{
                        transform: toggleGame ? 'translateX(-50%)' : 'translateX(0)',
                        transition: ' visibility 0, opacity 0.5s ease-out, transform 0.5s ease-out',
                        visibility: toggleGame ? 'hidden' : 'visible',
                        opacity: toggleGame ? 0 : 1,
                        display: toggleGame ? 'none' : 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
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


                    <div
                        style={{
                            rowGap: 20,
                            width: '100%',
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
                        >
                            Tests
                        </div>

                        <div
                            onClick={() => { }}
                            style={{
                                width: '100%'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    columnGap: 20
                                }}
                            >
                                <VscDebugStart

                                    onClick={() => {
                                        setToggleGame((toggleGame) => !toggleGame)
                                        //setNums([1, 2, 3, 4, 4])
                                    }}

                                    style={{
                                        cursor: 'pointer'
                                    }}
                                />
                                <div>
                                    <b style={{ fontWeight: 'bold' }}>
                                        Nums:
                                    </b> [1, 2, 3, 4, 4] Result: True
                                </div>
                            </div>

                        </div>

                    </div>
                </div>


                <div
                    id={'viewport'}
                    style={{
                        width: '100%',
                        transform: toggleGame ? 'translateX(0)' : 'translateX(50%)',
                        transition: ' opacity 0s ease-in, transform 0.3s ease-in',
                        opacity: toggleGame ? 1 : 0,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        onClick={async () => {
                            testInterperter()
                        }}

                    >
                        <VscDebugStepOver />
                    </div>

                </div>
            </div>

            <div
                style={{
                    width: '50%',
                    display: 'flex',
                    rowGap: 40,
                    paddingLeft: 20,
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >

                <div

                    style={{
                        width: '100%',
                        display: 'flex',
                        paddingTop: 40,
                        rowGap: 20,
                        flexDirection: 'column'
                    }}
                >
                    <div>
                        {` function containsDuplicate(nums: number[]): boolean { `}
                    </div>
                    <div
                        style={{
                            marginLeft: 40,
                        }}
                    >
                        {`for (let i = 0; i < nums.length; i++) { `}
                    </div>
                    <div
                        style={{
                            marginLeft: 80,
                        }}
                    >
                        {` for (let j = i + 1; j < nums.length; j++) {  `}
                    </div>
                    <div

                        style={{
                            marginLeft: 120,
                        }}
                    >
                        {` if (nums[i] == nums[j]){`}
                    </div>
                    <div

                        style={{
                            marginLeft: 160,
                        }}
                    >
                        {`return true;`}
                    </div>

                    <div
                        style={{
                            marginLeft: 120,
                        }}
                    >
                        {`  } `}
                    </div>

                    <div

                        style={{
                            marginLeft: 80,
                        }}
                    >
                        {`  }`}
                    </div>

                    <div

                        style={{
                            marginLeft: 40,
                        }}
                    >
                        {`   } `}
                    </div>
                    <div

                        style={{
                            marginLeft: 120,
                        }}
                    >
                        {`  return false; `}
                    </div>
                    <div>
                        {` }; `}
                    </div>
                </div>



            </div>
        </div>
    )
}






const ref = ({ key, name, colors }: any) => (

    <div
        key={key + name}
    >
        <div

            style={{
                width: 30,
                backgroundColor: colors.secondary,
                borderTop: `2px solid ${colors.primary}`,
                borderLeft: `2px solid ${colors.primary}`,
                borderRight: `2px solid ${colors.primary}`,
                height: 20,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 12,

            }}
        >
            {`=>`}
        </div>
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.secondary,
                width: 30,
                fontSize: 10,
                border: `2px solid ${colors.primary}`,
                height: 30,
            }}
        >
            {name}
        </div>

    </div>
)

const box = ({ key, name, colors }: any) => (
    <div
        key={key + name}
        style={{
            transition: 'position(50px, 50px) 2s, position(0px, 0px) 2s'
        }}
    >
        <div
            style={{
                width: 30,
                backgroundColor: colors.secondary,
                borderTop: `2px solid ${colors.primary}`,
                borderLeft: `2px solid ${colors.primary}`,
                borderRight: `2px solid ${colors.primary}`,
                height: 20,
            }}
        >
        </div>
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.secondary,
                width: 30,
                border: `2px solid ${colors.primary}`,
                height: 30,
            }}
        >
            {name}
        </div>

    </div>
)
