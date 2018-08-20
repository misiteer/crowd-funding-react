import React, {Component} from 'react';

import TabPanels from './components/tabPanels';

import {Container} from 'semantic-ui-react';

import './App.css';
import { getAccount } from './utils/interaction';


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            account: null
        }
    }


    componentDidMount() {
        getAccount()
            .then(account => this.setState({account}))
            .catch(e => console.error(e))
    }


    render() {
        const { account } = this.state;
        return (
            <Container className="App">
                <header className="App-header">
                    <h1 className="App-title">华晨众筹</h1>
                    <img src="https://api.gushi.ci/all.svg" alt="poem"/>
                    <br/>
                    <br/>
                    <p>
                        {
                            account ? `您的账户地址:${account}` : '.'
                        }
                    </p>
                </header>
                <br/>
                <TabPanels />
            </Container>
        );
    }
}

export default App;
