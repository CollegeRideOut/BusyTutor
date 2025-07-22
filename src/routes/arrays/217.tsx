import { createFileRoute } from '@tanstack/react-router'
import { useContext, useEffect, useRef, useState } from 'react';
import { ThemeContext } from '../__root';
import { VscDebugStart } from "react-icons/vsc";
import tutor from '../../assets/tutor_idle_0.png'

export const Route = createFileRoute('/arrays/217')({
    component: RouteComponent,
})



const ANIMATION_STATE = {
    IDLE: 'idle',
} as const;


type animationState = keyof typeof ANIMATION_STATE;


class Vector2d {
    public x: number
    public y: number
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    public static subtract(a: Vector2d, b: Vector2d): Vector2d {
        return new Vector2d(a.x - b.x, a.y - b.y);
    }
    public static magnituted(a: Vector2d): number {
        return Math.floor(Math.hypot(a.x, a.y));
    }
    public static normalize(a: Vector2d) {
        const length = Vector2d.magnituted(a);
        if (length === 0) { return new Vector2d(0, 0); }
        return new Vector2d((a.x / length), (a.y / length))

    }
}

const tutorInit: {
    currAnimationState: animationState;
    postion: Vector2d;
    walkingSpeed: number;
    targetPosition: Vector2d;
    updatePosition: () => void
} = {
    currAnimationState: 'IDLE',
    postion: new Vector2d(0, 0),
    walkingSpeed: 10,
    targetPosition: new Vector2d(200, 200),
    updatePosition: function() {
        // modifies the position 
        let direction = Vector2d.subtract(this.targetPosition, this.postion);

        direction = Vector2d.normalize(direction);

        this.postion.x += direction.x;
        this.postion.y += direction.y;

        console.log(this.postion)
    }
}


function RouteComponent() {

    const { vals: { colors } } = useContext(ThemeContext)
    const [toggleGame, setToggleGame] = useState(true)
    const intervalRef = useRef<number | null>(null);
    const [nums, setNums] = useState<number[] | null>([1, 2, 3, 4, 4]);
    const [tutorEntity, setTutorEntity] = useState(tutorInit)

    function updateTutorPosition(prev: typeof tutorEntity): typeof tutorEntity {
        let direction = Vector2d.subtract(prev.targetPosition, prev.postion);
        direction = Vector2d.normalize(direction);
        let copyPosition = new Vector2d(prev.postion.x, prev.postion.y)
        copyPosition.x += direction.x
        copyPosition.y += direction.y
        return { ...tutorEntity, postion: copyPosition }


    }

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTutorEntity(prev => updateTutorPosition(prev))
        }, 1000 / 2)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

    }, []);

    //useEffect(() => {
    //    if (toggleGame && tutorEntity) {
    //        console.log('i entered')
    //        console.log(tutorEntity)
    //
    //        requestAnimationFrame(loop)
    //    }
    //}, [toggleGame])



    //const navigate = useNavigate({ from: '/arrays' })
    //
    //
    //function* nextAction() { }
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
                                        setNums([1, 2, 3, 4, 4])
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
                        id={'world'}
                    >
                        <img

                            style={{
                                transform: `translate(${tutorEntity!.postion.x}px, ${tutorEntity?.postion.y}px)`,
                                position: 'absolute',
                            }}
                            width={50} src={tutor} />

                        <div
                            style={{
                                display: 'flex'
                            }}
                        >
                            nums: {nums && nums.map((x) => (
                                <div>
                                    {x}
                                </div>
                            ))}
                        </div>


                    </div>

                    <div
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
                            nums
                        </div>

                    </div>
                    <div
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
                            I
                        </div>

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



