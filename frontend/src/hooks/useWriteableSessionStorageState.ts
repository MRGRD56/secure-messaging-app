import {Dispatch, SetStateAction, useEffect, useMemo, useState} from 'react';
import {useSessionstorageState} from 'rooks';

type UseLocalstorageStateReturnValue<S> = [S, Dispatch<SetStateAction<S>>, () => void];

const useWriteableSessionStorageState = <S>(
    key: string,
    initialState?: S | (() => S)
): UseLocalstorageStateReturnValue<S> => {
    const [lsState, setLsState, resetLsState] = useSessionstorageState<S>(key, initialState);
    const [state, setState] = useState<S>(lsState);

    useEffect(() => {
        setLsState(state as S);
    }, [state]);

    return useMemo(() => [state, setState, resetLsState], [state, setState, resetLsState]);
};

export default useWriteableSessionStorageState;
