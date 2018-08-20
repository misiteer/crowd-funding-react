pragma solidity ^0.4.24;

contract PlayerToFundings {

    mapping(address => address[]) playersFundings;

    function joinFunding(address funding, address sender) public{
        playersFundings[sender].push(funding);
    }

    function getFundings(address sender) public view returns(address[] fundings){
        // return msg.sender;
        return  playersFundings[sender];
    }

}

contract FundingFactory {

    address[] public fundings;

    PlayerToFundings playerToFundings;

    mapping(address => address[]) private creatorToFunings;

    // event FundingEvent(address creator, address funding);
    constructor() public {
        address playerToFundingsAddress = new PlayerToFundings();
        playerToFundings = PlayerToFundings(playerToFundingsAddress);
    }

    function createFunding(string _projectName, uint _supportMoney, uint _goalMoney) public {
        address funding = new Funding( _projectName, _supportMoney, _goalMoney, playerToFundings, msg.sender);
        fundings.push(funding);

        address[] storage addresses = creatorToFunings[msg.sender];
        addresses.push(funding);
        // emit FundingEvent(msg.sender, funding);
    }

    function getFundings() public view returns(address[]){
        return fundings;
    }

    function getCreatorFundings() public view returns(address[]){
        return creatorToFunings[msg.sender];
    }

    function getPlayerFoundings() public view returns(address[]){
        return playerToFundings.getFundings(msg.sender);
    }
}


contract Funding {

    bool flag = false;

    // the initiator
    address public manager;

    string public projectName;

    // participator
    uint public supportMoney;

    uint public endTime;

    uint public goalMoney;

    address[] public players;
    mapping(address => bool) playersMap;

    // 发起人的付款请求
    Request[] public requests;

    PlayerToFundings p2f;

    struct Request{
        string description;
        uint money;
        address shopAddress;
        bool complete;
        mapping(address=>bool) votedAddressMap;
        uint voteCount;
    }

    // constructor
    constructor(string _projectName, uint _supportMoney, uint _goalMoney, PlayerToFundings _p2f,address _address) public {
        manager = _address;
        projectName = _projectName;
        supportMoney = _supportMoney;
        goalMoney = _goalMoney;
        p2f = _p2f;
        endTime = now + 4 weeks;
    }

    // createRequest	付款申请函数,由众筹发起人调用
    function createRequest(string _desc, uint _money, address _shopAddress) public onManagerCanCall {

        require(_money <= address(this).balance);

        Request memory request = Request({
            description: _desc,
            money: _money,
            shopAddress: _shopAddress,
            complete: false,
            voteCount: 0
            });

        requests.push(request);
    }

    // approveRequest	付款批准函数, 由众筹参与人调用
    function approveRequest(uint index) public {

        // is player
        require(playersMap[msg.sender]);

        Request storage request = requests[index];

        // not voted before
        require(!request.votedAddressMap[msg.sender]);

        request.voteCount++;
        request.votedAddressMap[msg.sender] = true;

    }

    // finalizeRequest	众筹发起人调用, 可以调用完成付款
    function finalizeRequest(uint index) public onManagerCanCall {
        Request storage request = requests[index];
        require(!request.complete);
        require(request.voteCount * 2 > players.length);

        // 转账
        require(address(this).balance >= request.money);
        request.shopAddress.transfer(request.money);
        request.complete = true;
    }


    // moneyBack	退钱函数, 由众筹发起人调用(众筹未成功时调用)


    // 参与众筹
    function support() public payable {
        require(msg.value == supportMoney);
        players.push(msg.sender);
        playersMap[msg.sender] = true;
        // 添加当前合约地址到参与者
        p2f.joinFunding(address(this), msg.sender);
    }

    function getPlayersCount() public view returns(uint) {
        return players.length;
    }

    function getPlayers() public view returns(address[]){
        return players;
    }

    function getTotalBalance() public view returns(uint) {
        return address(this).balance;
    }

    function getRemainTime() public view returns(uint){
        return (endTime - now) / 24 / 60 /60;
    }

    function checkStatus() public {
        require(!flag);
        require(now > endTime);
        require(address(this).balance > goalMoney);
        flag = true;
    }

    modifier onManagerCanCall(){
        require(msg.sender == manager);
        _;
    }

}