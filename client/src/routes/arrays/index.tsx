import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useContext, useState } from 'react'
import { ThemeContext } from '../__root'

export const Route = createFileRoute('/arrays/')({
    component: RouteComponent,
})



function RouteComponent() {
    const { vals: { colors } } = useContext(ThemeContext)
    const navigate = useNavigate({ from: '/arrays' })
    const [toggleHashing, setToggleHashing] = useState(false);
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
            }}
        >

            <div
                style={{
                    width: '70%',
                    borderLeft: `1px solid ${colors.text}`,
                    borderRight: `1px solid ${colors.text}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    rowGap: 40
                }}
            >
                <div
                    style={{
                        marginTop: 40,
                        fontSize: 40,
                        fontWeight: 'bold',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    Arrays
                </div>
                <div
                    style={{
                        width: '70%',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                        }}
                    >
                        <div
                            onClick={() => setToggleHashing(prev => !prev)}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: colors.background,
                                display: 'flex',
                                border: `1px solid ${colors.text}`,
                                borderRadius: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 'min-content',
                                flexDirection: 'column'
                            }}
                        >
                            <div
                                style={{
                                    marginTop: 20,
                                    marginBottom: 20,
                                    display: 'flex',
                                    width: '90%',
                                    justifyContent: 'center',
                                }}
                            >

                                <div
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        fontWeight: 'bold',
                                        fontSize: 18
                                    }}
                                >
                                    <p>Hashing</p>
                                    <p>1/20</p>
                                    <p>Info</p>

                                </div>

                            </div>

                            <div
                                style={{
                                    width: '100%',
                                    backgroundColor: colors.primary,
                                    borderBottomLeftRadius: 10,
                                    borderBottomRightRadius: 10,
                                    display: toggleHashing ? 'flex' : 'none',
                                    borderTop: `1px solid ${colors.text}`,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    paddingTop: 20,
                                    paddingBottom: 20,
                                }}

                                onClick={() => {
                                    navigate({ to: '/arrays/217' })
                                }}
                            >
                                <div
                                    style={{
                                        width: '80%',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <p
                                        style={{
                                            width: '50%'
                                        }}
                                    >
                                        Contains Duplicate
                                    </p>
                                    <p>1/10</p>
                                    <p>Easy</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}



