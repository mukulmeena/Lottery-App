const Web3 = require('web3')
const assert = require('assert')
const ganache = require('ganache-cli')
const { interface, bytecode } = require('../compile')

const web3 = new Web3(ganache.provider())

let lottery
let accounts

beforeEach( async () => {
    accounts = await web3.eth.getAccounts()
    lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({gas: '1000000', from: accounts[0]})
})

describe('Lottery', () => {
    it('Deploys a contract', async () => {
        assert.ok(lottery.options.address)
    })

    it('Enter only one player', async () => {
        await await lottery.methods.enter()
        .send({
            value: web3.utils.toWei('0.2'), 
            from: accounts[0]
        })

        const players = await lottery.methods.getPlayers().call()
        assert.equal(players[0], accounts[0])
    })

    it('multiple Entry of players', async () => {
        await await lottery.methods.enter()
        .send({
            value: web3.utils.toWei('0.2'), 
            from: accounts[0]
        })
        await await lottery.methods.enter()
        .send({
            value: web3.utils.toWei('0.2'), 
            from: accounts[1]
        })
        await await lottery.methods.enter()
        .send({
            value: web3.utils.toWei('0.2'), 
            from: accounts[2]
        })

        const players = await lottery.methods.getPlayers().call()
        
        assert.equal(players[0], accounts[0])
        assert.equal(players[1], accounts[1])
        assert.equal(players[2], accounts[2])
        
    })

    it('send minimum ether to enter the lottery', async () => {
        try {
            await lottery.methods.enter()
            .send({
                value: web3.utils.toWei('0'), 
                from: accounts[0]
            })
        assert(false)
        } catch(err) {
          assert(err)
        }

    })

    it("only manager can call pickWinner", async () => {
        try {
            await lottery.methods.pickWinner().send({ 
                from: accounts[1]
            })
          assert(false)
        } catch (err) {
          assert (err)
        }
    })

    it('one players sends the money and it recieves back all the money', async () => {
        await lottery.methods.enter()
        .send({
            value: web3.utils.toWei('2'), 
            from: accounts[1]
        })

        const initial_balance = await web3.eth.getBalance(accounts[1])
        await lottery.methods.pickWinner()
        .send({ from: accounts[0]})
        const final_balance = await web3.eth.getBalance(accounts[1])

        const difference = final_balance - initial_balance

        assert(difference > web3.utils.toWei('1.8'))

    })
})