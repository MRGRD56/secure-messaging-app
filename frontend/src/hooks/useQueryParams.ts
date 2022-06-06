import {useRef} from 'react';
import queryString from 'query-string';

const useQueryParams = () => {
    return useRef(queryString.parse(window.location.search)).current;
};

export default useQueryParams;
