pragma solidity ^0.4.17;

contract FundingFactory {

    address[] public fundings;

    function createFunding(string _projectName, uint _supportMoney, uint _goalMoney) public {
        address funding = new Funding( _projectName, _supportMoney, _goalMoney, msg.sender);
        fundings.push(funding);
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

    struct Request{
        string description;
        uint money;
        address shopAddress;
        bool complete;
        mapping(address=>bool) votedAddressMap;
        uint voteCount;
    }


    // constructor
    function Funding(string _projectName, uint _supportMoney, uint _goalMoney, address _address) public {
        manager = _address;
        projectName = _projectName;
        supportMoney = _supportMoney;
        goalMoney = _goalMoney;
        endTime = now + 4 weeks;
    }

    // createRequest	付款申请函数,由众筹发起人调用
    function createRequest(string _desc, uint _money, address _shopAddress) public onManagerCanCall {

        require(_money <= this.balance);

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
        require(this.balance >= request.money);
        request.shopAddress.transfer(request.money);
        request.complete = true;
    }


    // moneyBack	退钱函数, 由众筹发起人调用(众筹未成功时调用)


    // 参与众筹
    function support() public payable {
        require(msg.value == supportMoney);
        players.push(msg.sender);
        playersMap[msg.sender] = true;
    }

    function getPlayersCount() public view returns(uint) {
        return players.length;
    }

    function getPlayers() public view returns(address[]){
        return players;
    }

    function getTotalBalance() public view returns(uint) {
        return this.balance;
    }

    function getRemainTime() public view returns(uint){
        return (endTime - now) / 24 / 60 /60;
    }

    function checkStatus() public {
        require(!flag);
        require(now > endTime);
        require(this.balance > goalMoney);
        flag = true;
    }

    modifier onManagerCanCall(){
        require(msg.sender == manager);
        _;
    }

}