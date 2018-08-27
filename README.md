# crowd-funding-react
华晨众筹/集资智能合约项目


pragma solidity ^0.4.17;

//这个智能合约使用的是下面的那段代码,用户是没办法修改的
//这是我们暴露给用户的智能合约,一般用户只能看到这样的一个智能合约
contract FundingFactory{
    
    //存储所有已经部署的智能合约的地址 
    address[] public fundings;
    
    function deploy(string _projectName,uint _supportMoney,uint _goalMoney) public{
    //返回值是部署的只能合约在网络上的地址
    //谁掉了这个智能合约,拿到sender,智能合约再去部署一个新的智能合约
        address funding = new Funding(_projectName,_supportMoney,_goalMoney, msg.sender);
        fundings.push(funding);
    }
}

//这是主要的智能合约, 这个用户是看不到的
contract Funding{
    
     //众筹发起人地址(众筹发起人)
     address public manager;
     //项目名称
     string public projectName;
     //众筹参与人需要付的钱
     uint public supportMoney;
     // 众筹结束的时间  
     uint public endTime;
     // 目标募集的资金(endTime后,达不到目标则众筹失败)
     uint public goalMoney;
     // 众筹参与人的数组 这个数组保留下来是因为它是所有投注人的数据
     address[] public players;
     //没有key和value,基本恒定
     mapping(address=>bool)  playersMap;
     
     
     //付款请求申请的数组(由众筹发起人申请)
     Request[] public requets;
     
     // 付款请求的结构体  
     struct Request{
          string description; // 为什么要付款 
          uint money; // 花多少钱 
          address shopAddress; //  卖家的钱包 地址  
          bool complete;  //  付款是否已经完成 
          mapping(address=>bool) votedmap; // 哪些已经投过票的人 
          uint  voteCount; // 投票的总的总数 
     }
     
      //  构造函数  
     function Funding(string _projectName,uint _supportMoney,uint _goalMoney, address _address) public{
         manager = _address;
         projectName = _projectName;
         supportMoney = _supportMoney;
         goalMoney = _goalMoney;
         endTime = now + 4 weeks;
     }
     
     function createRequest( string _description, uint _money, address _shopAddress) public  onlyManagerCanCall{
         
         Request memory request = Request({
             description:_description,
             money:_money,
             shopAddress:_shopAddress,
             complete:false,
             voteCount : 0
         });
         requets.push(request);
     }
     --------------------------改为map后的代码-----------------------------
     //  众筹参与人员批准某一笔付款 ( index数组的下标 ) 
     function approveRequest(uint index) public {
         Request storage request = requets[index];
         //1.  检查某个人是否已经在众筹参与人列表里面
          require(playersMap[msg.sender]);
         //2 .检查某个人是不是已经投过票了msg.sender
         //votedmap取到集合数据
          require(!requets[index].votedmap[msg.sender]);
          request. voteCount ++;
          requets[index].votedmap[msg.sender] = true;
     }
     --------------------------改为map后的代码-----------------------------
     //众筹发起人调用, 可以调用完成付款 index  下标 
     function finalizeRequest(uint index) public  onlyManagerCanCall {
     //默认是值传递,拿到了它的地址
          Request storage request = requets[index];
          // 付款必须是未处理的 
          require(!request.complete);
          // 定性要求: 至少一半以上的参与者同意付款 
          require(request.voteCount * 2 >players.length );
          // 打钱  转账 
          require(this.balance>=request.money);
          request.shopAddress.transfer(request.money);
          request.complete = true;
     }
     
     //  参与人支持众筹 
     function support() public payable{
         require(msg.value == supportMoney);
         players.push(msg.sender);
         //设置mapping集合,重点
         playersMap[msg.sender] = true;
     }
     // 返回参与人的数量 
     function getPlayersCount() public view returns(uint){
         return players.length;
     }
     
     function getPlayers() public view returns(address[]){
         return players;
     }
     
     function getTotalBalance() public view returns (uint){
         return this.balance;
     }
     
     function getRemainDays() public view returns(uint){
         return (endTime - now)/24/60/60;
     }
     
     modifier onlyManagerCanCall(){
         require(msg.sender == manager);
         _;
     }
     
}
