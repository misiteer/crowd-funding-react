import React, {Component} from 'react';
import {getFundingDetail, getFundings, support} from '../../utils/interaction';
import FundingList from "../common/FundingList";
import {
    Segment
} from 'semantic-ui-react';

/**
 * 众筹参与者
 *      可查看当前参与的众筹状态
 *      审批众筹请求
 */
export default class PlayerScene extends Component {


    constructor(props) {
        super(props);
        this.state = {
            fundings: null,
            currentSelect: null
        }
    }
    /**
     * 查询所有参与的众筹
     */
    componentDidMount() {
        this.mounted = true;

        getFundings(2)
            .then(fundings => {
                if(!this.mounted){ return; }
                // 去重复
                fundings = Array.from(new Set(fundings));

                Promise.all(fundings.map((addr, index) => getFundingDetail(addr)))
                    .then(result => this.setState({fundings: result}))
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

    handleItemClick = (data) => {

        console.table(data);
        this.setState({
            currentSelect: data
        })

    };

    render() {
        const {fundings, currentSelect} = this.state;

        return (
            <div>
                <h2>众筹参与者</h2>

                <br/>
                <FundingList fundings={fundings} onItemClick={this.handleItemClick}/>
                { (fundings && fundings.length === 0) && <p>您还没有参与过众筹</p>}

                <br/>
                {
                    currentSelect&& (
                        <div>
                            <h3>审批付款请求</h3>

                            <Segment>
                                <h4>当前项目:{currentSelect.projectName}, 地址: {currentSelect.address}</h4>
                                <p>付款请求列表</p>
                            </Segment>
                        </div>

                    )
                }

            </div>
        );
    }

}
