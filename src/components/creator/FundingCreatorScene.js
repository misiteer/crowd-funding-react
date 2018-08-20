import React, {Component} from 'react';
import {
    Input,
    Label,
    Button,
    Segment,
    Form,
    Dimmer,
    Loader,
    List,
    TransitionablePortal,
    Header
} from 'semantic-ui-react';

import web3 from '../../utils/web3';
import contracts from '../../utils/contracts';
import * as Actions from '../../utils/interaction';
import FundingList from '../common/FundingList';
import {getFundings} from "../../utils/interaction";
import {getFundingDetail} from "../../utils/interaction";





/**
 * 众筹发起人操作
 *
 * 发起众筹
 *      众筹通过
 *      众筹退款
 * 付款请求
 *      完成付款
 *
 *
 */
class FundingCreatorScene extends Component {
    state = {
        active: false,
        currentSelect: null,

        requestDesc: '',
        requestMoney: '',
        requestAddress: '',

        projectName: '',
        supportMoney: '',
        goalMoney: '',

        portalOpen: false,
        fundings: null
    };

    /**
     * 查询当前账号发起的众筹
     */
    componentDidMount() {
        this.mounted = true;
        this.refreshFundings();
    }

    refreshFundings() {
        getFundings(1)
            .then(fundings => {
                if(!this.mounted){ return; }

                Promise.all(fundings.map((addr, index) => getFundingDetail(addr)))
                    .then(result => {
                        this.setState({fundings: result});
                    })
                    .catch(e => {
                        console.error(e);
                        this.setState({fundings: []});
                    })

            })
            .catch(e => {
                console.error(e);
                this.setState({fundings: []});
            });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    createFunding = async (e) => {
        this.setState({active: true});

        const {projectName, supportMoney, goalMoney} = this.state;
        console.table(this.state);

        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        if(!account){
            console.log("metamask未登录");
            this.setState({active: false, portalOpen: true});
            return;
        }

        try {

            console.log(`account: ${account}`);
            const result = await contracts.factory.methods
                .createFunding(projectName, supportMoney, goalMoney)
                .send({from: account});

            // let resultJSON = {"blockHash":"0x5fe37446efc5665669b57dc48af1cc0b887b593702f2fcdbfa28eabc071749b4","blockNumber":2775123,"contractAddress":null,"cumulativeGasUsed":1087146,"from":"0x7855f93c158b36c93d0e34eb6be6b2dcfd3587e4","gasUsed":754506,"logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","status":true,"to":"0xc3e8a7bafcc4afa6f4fc701a6cc907fb85970290","transactionHash":"0xf6466d4559d45e1aa9e3cc15c43196ace10a78701319530b77f4027f5f1c647b","transactionIndex":3,"events":{}}

            console.table(result);

            this.refreshFundings();

        } catch (e) {
            console.error(e);
        } finally {
            this.setState({
                active: false,
                supportMoney: '',
                goalMoney: ''
            })
        }
    };
    createRequest = (e) => {
        console.table(this.state);

        const {requestDesc , requestMoney , requestAddress, currentSelect} = this.state;

        if(!currentSelect) return;

        Actions.createRequest(currentSelect.address, requestDesc, requestMoney, requestAddress)
            .then(res => {
                console.log(res);
                alert('success');

                this.setState({
                    requestMoney: '',
                    requestAddress: ''
                })
            })
            .catch(e => console.error(e));

    };

    handleChange = (e, {name, value}) => {
        this.setState({[name]: value})
    };
    handleItemClick = (data) => {
        console.table(data);
        this.setState({
            currentSelect: data
        })
    };

    render(){
        const {
            active,
            currentSelect,
            requestDesc , requestMoney , requestAddress,
            projectName, supportMoney, goalMoney,
            portalOpen,
            fundings
        } = this.state;

        return (
            <div>
                <h2>众筹发起者</h2>

                <br/>
                <FundingList fundings={fundings} onItemClick={this.handleItemClick}/>
                { (fundings && fundings.length === 0) && <p>您还没有发起过众筹</p>}

                <br/>
                {
                    currentSelect && (
                        <div>
                            <h3>发起付款请求</h3>

                            <Segment>
                                <h4>当前项目:{currentSelect.projectName}, 地址: {currentSelect.address}</h4>
                                <Form onSubmit={this.createRequest}>
                                    <Form.Input type='text' name='requestDesc' required value={requestDesc} label='请求描述' placeholder='请求描述' onChange={this.handleChange}/>

                                    <Form.Input type='text' name='requestMoney' required value={requestMoney} label='付款金额' labelPosition='left'  placeholder='付款金额' onChange={this.handleChange}>
                                        <Label basic>￥</Label>
                                        <input />
                                    </Form.Input>

                                    <Form.Input type='text' name='requestAddress' required value={requestAddress} label='商家收款地址' labelPosition='left'  placeholder='商家地址' onChange={this.handleChange}>
                                        <Label basic><span role='img' aria-label='location'>📍</span></Label>
                                        <input />
                                    </Form.Input>

                                    <Form.Button primary content='开始请求'/>
                                </Form>
                            </Segment>
                        </div>

                    )
                }

                <h3>发起众筹</h3>
                <Dimmer.Dimmable as={Segment} dimmed={active}>
                    <Dimmer active={active} inverted>
                        <Loader>众筹创建中...</Loader>
                    </Dimmer>

                    <Form onSubmit={this.createFunding}>
                        <Form.Input type='text' name='projectName' required value={projectName} label='项目名称' placeholder='项目名称' onChange={this.handleChange}/>

                        <Form.Input type='text' name='supportMoney' required value={supportMoney} label='支持金额' labelPosition='left'  placeholder='支持金额' onChange={this.handleChange}>
                            <Label basic>￥</Label>
                            <input />
                        </Form.Input>

                        <Form.Input type='text' name='goalMoney' required value={goalMoney} label='目标金额' labelPosition='left'  placeholder='目标金额' onChange={this.handleChange}>
                            <Label basic>￥</Label>
                            <input />
                        </Form.Input>

                        <Form.Button primary content='开始众筹'/>
                    </Form>

                </Dimmer.Dimmable>

                <TransitionablePortal onClose={() => this.setState({ portalOpen: false })} open={portalOpen}>
                    <Segment style={{ left: '40%', position: 'fixed', top: '50%', zIndex: 1000 }}>
                        <Header>提示: </Header>
                        <p>您还未登陆metamask</p>
                    </Segment>
                </TransitionablePortal>
            </div>
        )
    }

}

export default FundingCreatorScene;