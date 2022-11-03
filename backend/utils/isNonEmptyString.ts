import {isEmpty, isString} from 'lodash';

const isNonEmptyString = (value: unknown): value is string => {
    return isString(value) && !isEmpty(value);
};

export default isNonEmptyString;
