import React from 'react'
import { Tab } from 'semantic-ui-react'

import FundingCreatorScene from './creator/FundingCreatorScene';
import PlayerScene from './player/PlayerScene';
import Home from "./home/Home";

const panes = [
    { menuItem: '众筹项目', pane:{key: 'tab1', content:(<Home/>)} },
    { menuItem: '我发起的', pane:{key: 'tab2', content:(<FundingCreatorScene/>)} },
    { menuItem: '我参与的', pane:{key: 'tab3', content:(<PlayerScene/>)} },
    // { menuItem: '我参与的', render: () => <Tab.Pane><PlayerComp/></Tab.Pane> },
];

const TabPanels = () => <Tab defaultActiveIndex={0} renderActiveOnly={false} panes={panes} />;

export default TabPanels;