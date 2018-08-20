// - EveryOne
    // 获取所有众筹项目 2, OK
    // 根据众筹地址获取详情(项目名称/目标金额/已筹金额/当前进度/参与人数/剩余时间) 3, OK

// - 发起者
    // 发起众筹 1, OK
    // 发起付款请求 6
    // 完成付款 8
    // 发起退款 9

// - 参与者
    // 获取已参与众筹 (根据钱包address) 5
    // 参与众筹 (在合约中, 通过调用其它合约, 把当前sender与众筹进行保存绑定) 4
    // 批准付款请求 7


// - 外部函数调用 0
// - event与emit 10

import contracts from "./contracts";
import web3 from '../utils/web3';

const getAccount = () => {
    return new Promise((resolve, reject) => {

        web3.eth.getAccounts()
            .then(accounts => {
                const account = accounts[0];
                if(account){
                    resolve(account);
                }else {
                    reject('no account');
                }
            })
            .catch(e => {
                reject(e);
            });
    })
};

/**
 * 获取众筹项目
 * @param from 0 默认所有, 1 发起者, 2 参与者
 * @returns {Promise<any>}
 */
const getFundings = (from = 0) => {
    return new Promise((resolve, reject) => {

        (async ()=> {
            try {
                let fundings = [];
                console.log(`fundings: ------------ ${from}`);
                if(from === 0){
                    fundings = await contracts.factory.methods.getFundings().call();
                }else if(from === 1 || from === 2){
                    const accounts = await web3.eth.getAccounts();
                    const account = accounts[0];
                    console.log(`account: ${account}`);
                    if(from === 1){
                        fundings = await contracts.factory.methods.getCreatorFundings().call({from: account});
                    }else {
                        fundings = await contracts.factory.methods.getPlayerFoundings().call({from: account});
                    }
                }else {
                    reject(`错误的from ${from} => 0 默认所有, 1 发起者, 2 参与者`)
                }

                console.table(fundings);
                resolve(fundings);
            } catch (e) {
                reject(e);
            }

        })();
    });
};
/**
 * 获取众筹详情
 * @param address 众筹地址
 * @returns {Promise<any>}
 */
const getFundingDetail = (address) => {
    if(!address || address.trim() === ''){
        console.error(`address not null`);
        return;
    }
    return new Promise(async (resolve, reject) => {
        try {
            const funding = contracts.newFundingContract();
            console.log(`start -> ${address}`);

            funding.options.address = address;
            // 工程名称
            const projectName = await funding.methods.projectName().call();
            // 目标金额
            const goalMoney = await funding.methods.goalMoney().call();
            // 已筹金额
            const getTotalBalance = await funding.methods.getTotalBalance().call();

            // 参与金额
            const supportMoney = await funding.methods.supportMoney().call();
            // 参与人数
            const getPlayersCount = await funding.methods.getPlayersCount().call();
            // 管理者address
            const manager = await funding.methods.manager().call();
            // 结束时间
            const endTime = await funding.methods.endTime().call();

            console.log(`end -> ${address}`);
            resolve({
                address,
                projectName,
                goalMoney,
                getTotalBalance,
                supportMoney,
                getPlayersCount,
                manager,
                endTime
            });
        } catch (e) {
            reject(e);
        }
    })

};
/**
 * 参与众筹
 * @param address 众筹地址
 * @param value 参与金额
 * @returns {Promise<any>}
 */
const support = (address, value) => {
  return new Promise(async (resolve, reject) => {
      try {
          const accounts = await web3.eth.getAccounts();
          const account = accounts[0];
          console.log(`account: ${account}`);
          contracts.fundingContract.options.address = address;
          const result = await contracts.fundingContract.methods.support().send({from: account, value: value});
          resolve(result);
      } catch (e) {
          reject(e);
      }
  })
};

/**
 * 发起付款请求
 * @param address   众筹地址
 * @param desc      请求描述
 * @param money     请求金额
 * @param shopAddress   商铺地址
 * @returns {Promise<any>}
 */
const createRequest = (address, desc, money, shopAddress) => {
    return new Promise(async (resolve, reject) => {
        try {
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            console.log(`account: ${account}`);
            const contract = contracts.newFundingContract();
            contract.options.address = address;
            const result = contract.methods.createRequest(desc, money, shopAddress).send({from: account});
            resolve(result);
        } catch (e) {
            reject(e);
        }

    })
};

export {getAccount, getFundings, getFundingDetail, support, createRequest};
