import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/')({
    component: Index,
})


//const spriteHeight = 14
const spriteWidthPosition = 110
const spriteHeightPosition = 90
const frameWidthDIstance = 320

const idleFrameTotal = 2
function Index() {
    const [frame, setFrame] = useState(0);


    useEffect(() => {
        const interval = setInterval(() => {
            setFrame(prevFrame => (prevFrame + 1) % idleFrameTotal); // Assuming totalFrames is defined
        }, 1000); // Change frame every 100ms
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                columnGap: 20,
                fontSize: 50,

                marginTop: 20,
            }}
        >

            <div
                style={{
                    display: 'flex',
                    width: '80%',
                    alignItems: 'center',
                    columnGap: 20,
                    fontSize: 50,
                }}
            >
                <div className={'tutor'}
                    style={{ backgroundPosition: `-${spriteWidthPosition + frameWidthDIstance * frame}px -${spriteHeightPosition}px` }}
                ></div>

                <h1> Hi, I'm BusyTutor</h1>
            </div>


        </div>
    )
}
