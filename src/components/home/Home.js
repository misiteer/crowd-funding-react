import React from 'react';


import {getFundings, getFundingDetail, support} from "../../utils/interaction";
import './Home.css'
import FundingList from "../common/FundingList";
import {
    Form,
    Segment,
    Label
} from 'semantic-ui-react';


class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fundings: null,
            currentSelect: null
        }
    }

    /**
     * 查询所有众筹
     */
    componentDidMount() {
        this.mounted = true;
        getFundings()
            .then(fundings => {
                if(!this.mounted){ return; }

                // 并行
                Promise.all(fundings.map((addr, index) => getFundingDetail(addr)))
                    .then(result => {
                        if(!this.mounted){ return; }
                        this.setState({fundings: result});
                    })
                    .catch(e => {
                        console.error(e);
                        this.setState({fundings: []});
                    })

                // 串行
                // PromiseForEach(fundings, getFundingDetail)
                //     .then(result => {
                //         if(!this.mounted){ return; }
                //
                //         this.setState({fundings: result});
                //     })
                //     .catch(e => console.error(e))
            })
            .catch(e => {
                this.setState({fundings: []});
            });
    }

    componentWillUnmount() {
        this.mounted = false;
    }


    handleItemClick = (data) => {
        console.table(data);
        this.setState({
            currentSelect: data
        })
    };

    handleSupport = (e) => {
        e.preventDefault();

        const addr = this.state.currentSelect.address;
        const money = this.state.currentSelect.supportMoney;

        console.log(`addr: ${addr} money: ${money}`);
        support(addr, money)
            .then(res => {
                console.log(res);
                alert(`恭喜! 您已成功参与 ${addr} 项目`)
            })
            .catch(e => console.error(e));
    };

    render() {
        const {fundings, currentSelect} = this.state;
        console.table(fundings);


        return (
            <div>
                <FundingList fundings={fundings} onItemClick={this.handleItemClick}/>
                <br/>
                {
                    currentSelect && (
                        <div>
                            <h3>参与众筹</h3>
                            <Segment>
                                <Form onSubmit={this.handleSupport}>
                                    <Form.Input type="text" required label='众筹地址' placeholder='0x12345678' value={currentSelect.address}/>
                                    <Form.Input type='text' required label='付款金额' labelPosition='left' placeholder='付款金额' value={currentSelect.supportMoney}>
                                        <Label basic>￥</Label>
                                        <input />
                                    </Form.Input>

                                    <Form.Button primary content='立即参与'/>
                                </Form>
                            </Segment>
                        </div>
                    )
                }
            </div>

        );
    }
}

export default Home;
