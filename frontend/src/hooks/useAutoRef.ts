import {MutableRefObject, useEffect, useRef} from 'react';

const useAutoRef = <T>(value: T): Readonly<MutableRefObject<T>> => {
    const ref = useRef<T>(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
};

export default useAutoRef;
