import { useState, useEffect, useRef } from 'react'


const Stopwatch = () => {

    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const intervalIdRef = useRef(null);
    const startTimeRef = useRef(0);

    useEffect(() => {

    }, [isRunning])

    function start() {
        
    }
    function stop() {

    }


  return (
        <>
        <div>
            Hello
        </div>
        </>
  )
}

export default Stopwatch