const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, 'contracts', 'Funding.sol');
const solc = require('solc');

console.log(filepath);

const source = fs.readFileSync(filepath, 'utf-8');

const compile = solc.compile(source, 1);

console.log(compile);

const compileContracts = {
    Funding: compile.contracts[':Funding'],
    FundingFactory: compile.contracts[':FundingFactory']
};

module.exports = compileContracts;

// module.exports = compile.contracts[':FundingFactory'];
