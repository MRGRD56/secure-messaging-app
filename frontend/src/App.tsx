import React, {FunctionComponent} from 'react';
import './App.module.scss';
import Messenger from './components/messenger/Messenger';
import styles from './App.module.scss';

const App: FunctionComponent = () => {
    return (
        <div className={styles.container}>
            <Messenger className={styles.messengerContainer}/>
        </div>
    );
}

export default App;
