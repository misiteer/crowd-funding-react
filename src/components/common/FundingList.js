import React from 'react';

import {
    List,
    Card,
    Image,
    Progress,
    Segment,
    Dimmer,
    Loader,
    // Input,
    // Label,
    // Button,
    // Form,
    // TransitionablePortal,
    // Header
} from 'semantic-ui-react';
// import {PromiseForEach} from '../../utils/PromiseUtil';

const src = '/images/white-image.png';
const colorArr = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey',];

class FundingList extends React.Component {

    render() {
        const {fundings, onItemClick} = this.props;

        if(fundings == null){
            return (
                <Segment>
                    <Dimmer active inverted>
                        <Loader size='medium'>Loading</Loader>
                    </Dimmer>

                    <Image src='/images/paragraph.png' />
                </Segment>

            )
        }

        const cards = fundings.map((val, index) => {
            const {address, projectName, goalMoney, getTotalBalance, supportMoney, getPlayersCount, manager, endTime} = val;

            const timeLeft = Math.floor((parseInt(endTime, 10) * 1000 - new Date().getTime()  ) / 1000 / 60 / 60 / 24);
            const percent = Math.floor((parseInt(getTotalBalance, 10) / parseInt(goalMoney, 10)) * 100);
            return (
                <Card key={address}
                      href='#'
                      onClick={() => onItemClick && onItemClick(val)}
                      color={colorArr[index % colorArr.length]}>
                    <Image src='/images/matthew.png' />
                    <Card.Content>
                        <Card.Header className='card-header'>{projectName}</Card.Header>
                        <Card.Meta>
                            <span className='date'>剩余时间: {timeLeft} 天</span>
                            <Progress percent={percent} indicating progress size='small' label={false}/>
                        </Card.Meta>
                        <Card.Description className='card-desc'>
                            这是一款不可多得的{projectName}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        {/*<a>*/}
                        {/*<Icon name='user' />*/}
                        {/*22 Friends*/}
                        {/*</a>*/}
                        <List divided horizontal size='small' style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                            <List.Item>
                                <List.Content>
                                    <List.Header>已达</List.Header>
                                    <List.Description>{percent}%</List.Description>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <List.Content>
                                    <List.Header>已筹</List.Header>
                                    <List.Description>{getTotalBalance} Wei</List.Description>
                                </List.Content>
                            </List.Item>
                            <List.Item>
                                <List.Content>
                                    <List.Header>参与人数</List.Header>
                                    <List.Description>{getPlayersCount} 人</List.Description>
                                </List.Content>
                            </List.Item>
                        </List>
                    </Card.Content>
                </Card>
            )
        });

        return (
            <Card.Group itemsPerRow={4}>
                {cards}
            </Card.Group>
        );
    }
}

export default FundingList;