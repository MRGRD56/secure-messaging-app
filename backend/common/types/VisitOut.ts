import VisitAction from './VisitAction';
import UpdateOutBase from './UpdateOutBase';

interface VisitOut extends UpdateOutBase {
    type: 'visit';
    action: VisitAction;
}

export default VisitOut;
