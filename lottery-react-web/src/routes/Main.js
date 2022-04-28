import React, { Component } from 'react';
import Keyboard from 'react-simple-keyboard';

import "react-simple-keyboard/build/css/index.css";
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Web3 from 'web3';

let lotteryAddress = '0xaf7C50c3C7852E31598b5BBf2D894Fcc59191D3B'; 
let lotteryABI = [ { "constant": true, "inputs": [], "name": "answerForTest", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "bettor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "challenges", "type": "bytes1" }, { "indexed": false, "name": "answerBlockNumber", "type": "uint256" } ], "name": "BET", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "bettor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "challenges", "type": "bytes1" }, { "indexed": false, "name": "answer", "type": "bytes1" }, { "indexed": false, "name": "answerBlockNumber", "type": "uint256" } ], "name": "WIN", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "bettor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "challenges", "type": "bytes1" }, { "indexed": false, "name": "answer", "type": "bytes1" }, { "indexed": false, "name": "answerBlockNumber", "type": "uint256" } ], "name": "FAIL", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "bettor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "challenges", "type": "bytes1" }, { "indexed": false, "name": "answer", "type": "bytes1" }, { "indexed": false, "name": "answerBlockNumber", "type": "uint256" } ], "name": "DRAW", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "bettor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "challenges", "type": "bytes1" }, { "indexed": false, "name": "answerBlockNumber", "type": "uint256" } ], "name": "REFUND", "type": "event" }, { "constant": true, "inputs": [], "name": "getPot", "outputs": [ { "name": "pot", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "challenges", "type": "bytes1" } ], "name": "betAndDistribute", "outputs": [ { "name": "result", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "challenges", "type": "bytes1" } ], "name": "bet", "outputs": [ { "name": "result", "type": "bool" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "distribute", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "answer", "type": "bytes32" } ], "name": "setAnswerForTest", "outputs": [ { "name": "result", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "challenges", "type": "bytes1" }, { "name": "answer", "type": "bytes32" } ], "name": "isMatch", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "getBetInfo", "outputs": [ { "name": "answerBlockNumber", "type": "uint256" }, { "name": "bettor", "type": "address" }, { "name": "challenges", "type": "bytes1" } ], "payable": false, "stateMutability": "view", "type": "function" } ];

// const winOptions = [
//   { value: 'View All', label: 'View All' },
//   { value: 'WIN', label: 'WIN' },
//   { value: 'DRAW', label: 'DRAW' },
//   { value: 'FAIL', label: 'FAIL' },
//   { value: 'Not Revealed', label: 'Not Revealed' },
// ]

// const animatedComponents = makeAnimated();

class Main extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      betRecords: [],
      winRecords: [],
      failRecords: [],
      drawRecords: [],

      pot: '0',
      challenges: [],
      finalRecords: [{
        bettor: '0xabcd...',
        index:'0',
        challenges:'ab',
        answer:'ab',
        targetBlockNumber:'10',
        pot:'0'
      }]
    }
  }
  async componentDidMount() {
    await this.initWeb3();
    // await this.pollData();
    setInterval(this.pollData, 1000);
  }

  pollData = async () => {
    await this.getPot();
    await this.getBetEvents();
    await this.getWinEvents();
    await this.getFailEvents();
    await this.getDrawEvents();
    this.makeFinalRecords();
    await this.groupBy();
  }
  
  initWeb3 = async () => {
    if (window.ethereum) {
      console.log('Recent mode');
      this.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({method: 'eth_requestAccounts'});
      }
      catch (error) {
        console.log(`User denied account access error: ${error}`);

      }
    }
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    let accounts = await this.web3.eth.getAccounts();
    this.account = accounts[0];

    this.lotteryContract = new this.web3.eth.Contract(lotteryABI, lotteryAddress); // 새로운 객체
    
    // let owner = await this.lotteryContract.methods.owner().call()
    // console.log(owner);
    // 0xEe228d334216e2e47eee14f92247586465d230A9 (계속 바뀜)

  }

  getPot = async () => {
    let pot = await this.lotteryContract.methods.getPot().call(); // 호출
    let potString = this.web3.utils.fromWei(pot.toString(), 'ether'); //fromWei로 ether단위를 만들어줌
    this.setState({pot:potString})
  }

  makeFinalRecords = () => {
    let f = 0, w= 0, d= 0;
    const records = [...this.state.betRecords];
    for (let i=0; i<this.state.betRecords.length; i+=1) {
      if (this.state.winRecords.length > 0 && this.state.betRecords[i].index === this.state.winRecords[w].index) {
        records[i].win = 'WIN'
        records[i].answer = records[i].challenges;
        records[i].pot = this.web3.utils.fromWei(this.state.winRecords[w].amount, 'ether');
        if(this.state.winRecords.length -1 >w) w++;
      }
      else if(this.state.failRecords.length>0 && this.state.betRecords[i].index === this.state.failRecords[f].index) {
        records[i].win = 'FAIL'
        records[i].answer = this.state.failRecords[f].answer;
        records[i].pot = 0;
        if(this.state.failRecords.length -1 >f) f++;
      } 
      else if(this.state.drawRecords.length>0 && this.state.betRecords[i].index === this.state.drawRecords[d].index) {
        records[i].win = 'DRAW'
        records[i].answer = this.state.drawRecords[d].answer;
        records[i].pot = 0;
        if(this.state.drawRecords.length -1 >d) d++;
      } else {
        records[i].answer = 'Not Revealed';
      }
    }
    this.setState({finalRecords:records})
  }

  getBetEvents = async () => {
    const records = []; //이벤트 관련 record 넣기
    let events = await this.lotteryContract.getPastEvents('BET', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString(); //Hash값으로 들어와서 parseInt로 바꿔줌
      record.bettor = events[i].returnValues.bettor.slice(0,4) + '...' + events[i].returnValues.bettor.slice(40,42);
      record.betBlockNumber = events[i].blockNumber;
      record.targetBlockNumber = events[i].returnValues.answerBlockNumber.toString();
      record.challenges = events[i].returnValues.challenges;
      record.win = 'Not Revealed';
      record.answer = '0x00';
      records.unshift(record);
    }

    this.setState({betRecords:records})
  }

  getWinEvents = async () => {
    const records = []; //이벤트 관련 record 넣기
    let events = await this.lotteryContract.getPastEvents('WIN', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString();//Hash값으로 들어와서 parseInt로 바꿔줌
      record.amount = parseInt(events[i].returnValues.amount, 10).toString();
      records.unshift(record);
    }
    this.setState({winRecords:records})
  }

  getFailEvents = async () => {
    const records = []; //이벤트 관련 record 넣기
    let events = await this.lotteryContract.getPastEvents('FAIL', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString(); //Hash값으로 들어와서 parseInt로 바꿔줌
      record.answer = events[i].returnValues.answer;
      records.unshift(record);
    }
    this.setState({failRecords:records})
  }

  getDrawEvents = async () => {
    const records = []; //이벤트 관련 record 넣기
    let events = await this.lotteryContract.getPastEvents('DRAW', {fromBlock:0, toBlock:'latest'});

    for(let i=0; i<events.length; i+=1){
      const record = {}
      record.index = parseInt(events[i].returnValues.index, 10).toString(); //Hash값으로 들어와서 parseInt로 바꿔줌
      record.answer = events[i].returnValues.answer;
      records.unshift(record);
    }
    this.setState({drawRecords:records})
  }

  onKeyPress = button => {

    if (button === '{enter}') {
      this.bet();
      this.keyboard.clearInput();
    } else {
      this.setState({
        challenges: [this.state.challenges[1], button]
      })
    }
  };

  autoBet = async () => {
    const chars = '0123456789ABCDEF';
    const length = 2;
    let autoChallenges = [];
    for (let i = 0; i < length; i++) {
      autoChallenges.push(chars.charAt(Math.floor(Math.random() * chars.length)))
    }
    this.state.challenges = autoChallenges;
    this.bet();
  }

  bet = async () => {
    // nonce
    let challenges = '0x' + this.state.challenges[0].toLowerCase() + this.state.challenges[1].toLowerCase();
    let nonce = await this.web3.eth.getTransactionCount(this.account);
    this.lotteryContract.methods.betAndDistribute(challenges).send({from:this.account, value:5000000000000000, gas:300000, nonce:nonce})
    .on('transactionHash', (hash) => {
      console.log(hash) 
    })
  }

  groupBy = async () => {
    const records = this.state.finalRecords;
    const winArr = [];
    const drawArr = [];
    const failArr = [];
    for (let i = 0; i < records.length; i++) {
      if (records[i].win === 'WIN') {
        winArr.push(records[i])
      }
      else if (records[i].win === 'DRAW') {
        drawArr.push(records[i])
      }
      else if (records[i].win === 'FAIL') {
        failArr.push(records[i])
      }
    }                   
  }

  render() {
    return (
      <div className="Main">
        {/* Header - Pot, Betting characters */}
        <div className="container">
          <div className="jumbotron">
            <h1>Current Pot : {this.state.pot}</h1>
            <p>Lottery</p>
            <p>Lottery tutorial</p>
            <p>Your Bet</p>
            <p>{this.state.challenges[0]} {this.state.challenges[1]}</p>
          </div>
        </div>
        <div className="container">
          <button className="btn btn-danger btn-lg" onClick={this.autoBet}>AUTO</button>
        </div>
        <br></br>
        <div className = "container">
           <div>
            <Keyboard
                keyboardRef={r => (this.keyboard = r)}
                layoutName={this.state.layoutName}
                onKeyPress={this.onKeyPress}
                layout={{
                  'default': [
                    '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
                    '{tab} Q W E R T Y U I O P { } |',
                    '{lock} A S D F G H J K L : " {enter}',
                    '{shift} Z X C V B N M &lt; &gt; ? {shift}',
                    '{ctrl} {win} {alt} {space} {alt} Fn {ctrl}'
                  ]
                }}
                display={{
                  '{bksp}': '← Backspace',
                  '{tab}': 'Tab ⇆',
                  '{lock}': 'CapsLock',
                  '{enter}':'Enter ↵',
                  '{shift}': '⇧ Shift',
                  '{space}': 'ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ',
                  '{ctrl}': 'Ctrl',
                  '{win}': '<font face=Wingdings>&#xff;</font>',
                  '{alt}': 'Alt',
                }}
              />
           </div>
        </div>
        <br></br>
        <div className="container">
          <table className = "table table-dark table-striped">
            <thead>
            <tr>
              <th>Index</th>
              <th>Address</th>
              <th>Challenge</th>
              <th>Answer</th>
              <th>Pot</th>
              <th>Status</th>
              <th>AnswerBlock</th>
            </tr>
            </thead>
            <tbody>
              {        
                this.state.finalRecords.map((record, index) => {
                  return(                   
                    <tr key={index}>
                      <td>{record.index}</td>
                      <td>{record.bettor}</td>
                      <td>{record.challenges}</td>
                      <td>{record.answer}</td>
                      <td>{record.pot}</td>
                      <td>{record.win}</td>
                      <td>{record.targetBlockNumber}</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>      
    );
  };
};

export default Main;