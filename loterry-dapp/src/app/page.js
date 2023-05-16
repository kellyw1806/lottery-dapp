"use client"
import { useState, useEffect } from 'react'
import styles from './page.module.css'
import 'bulma/css/bulma.css'
import Head from 'next/head'
import Web3 from 'web3'
import lotteryContract from '/blockchain/lottery'



export default function Home() {
  const [web3, setWeb3] = useState()
  const [address, setAddress] = useState()
  const [lcContract, setLcContract] = useState()
  const [lotteryPot, setLotteryPot] = useState()
  const [lotteryPlayers, setPlayers] = useState([])
  const [lotteryHistory, setLotteryHistory] = useState()
  const [error, setError] = useState('')
  const[successMsg, setSuccessMsg] = useState('')
  const [lotterryId, setLotteryId] = useState()

  useEffect(() => {
    window.ethereum.on(`accountsChanged`, async () => {
      const accounts = await web3.eth.getAccounts()
      setAddress(Accounts[0])
    })
    updateState()
  }, [lcContract])

 
const updateState = () => {
  if (lcContract) getPot()
  if (lcContract) getPlayers()
  if (lcContract) getLotteryId()
}

  // get balance is read only right now
  const getPot = async () => {
    const pot = await lcContract.methods.getBalance().call()
    setLotteryPot(web3.utils.fromWei(pot, 'ether'))
  }

  const getPlayers = async () => {
    const players = await lcContract.methods.getPlayers().call()
    setPlayers(players)
  }

  const getHistory = async () => {
    for (let i = parseInt(id); i > 0; i--){
      const winnerAddress = await lcContract.methods.lotteryHistory(i).call()
      const historyObj = {}
      historyObj.id = i
      historyObj.address = winnerAddress
      setLotteryHistory(lotteryHistory => [...lotteryHistory, historyObj])
    }
  }

  // tracking how many lotteries there has been
  const getLotteryId = async () => {
    const lotteryId = await lcContract.methods.lotteryId().call()
    setLotteryId(lotteryId)
    await getHistory(lotteryId)
  }

  const enterLotteryHandler = async () => {
    setError('')
    try{
      await lcContract.methods.enter().send({
        from: address,
        value: '15000000000000000',
        gas: 3000000,
        gasPrice: null
      })
    updateState()
  } catch (err) {
    setError(err.message)
  }
  }

  const pickWinnerHandler = async() => {
    setError('')
    try{
      await lcContract.methods.payWinner().send({
        from: address,
        gas: 3000000,
        gasPrice: null
      })
      const winnerAddress =  await lcContract.methods.lotteryHistory(lotteryId).call()
      setSuccessMsg(`The winner is ${winnerAddress}`)
      updateState()
  } catch (err) {
    setError(err.message)
  }
  }

  const connectWalletHandler = async () => {
    setError('')
    // checking if MetaMask is installed and if we are in browser environment
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
      try {
        // request wallet connection -> syntax specific to metamask api
        await window.ethereum.request({ method: "eth_requestAccounts"})
        // create web3 instance and set to state
        const web3 = new Web3(window.ethereum)
    
        setWeb3(web3)
        // get list of accounts 
        const accounts = await web3.eth.getAccounts()
        // set account 1 to React state 
        // this will give array we just want the first one
        setAddress(accounts[0])

        // create a contract copy locally 
        const lc = lotteryContract(web3)
        setLcContract(lc)

      } catch(err){
        setError(err.message)
      }

    } else {
      // MetaMask is not installed 
      console.log("Please install MetaMask")
    }
  }



  return (
    <div>
      <Head>
          <title>Ether Lottery</title>
          <meta name="description" content="an Ethereum Lottery dApp" />
          <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <nav className="navbar mt-4 mb-4">
          <div className="container">
            <div className="navbar-brand">
              <h1>Ether Lottery</h1>
            </div>
            <div className="navbar-end">
              <button onClick={connectWalletHandler} className="button is-link">
                Connect Wallet
              </button>
            </div>
          </div>

        </nav>
        <div className="container">
          <section className="mt-5">
            <div className="columns">
              <div className="column is-two-thirds">
                <section className="mt-5">
                  <p>
                    Enter the lottery by sending 0.01 Ether
                  </p>
                  <button onClick={enterLotteryHandler} className="button is-link is-large is-light mt-3">
                    Play Now! 
                  </button>
                </section>
                <section className="mt-6">
                  <p> <b>
                    Admin Only: </b> Pick Winner
                  </p>
                  <button onClick={pickWinnerHandler} className="button is-primary is-large is-light mt-3">
                    Pick Winner
                  </button>
                </section>
                <section>
                  <div className="container has-text-danger mt-6">
                    <p>{error}</p>
                  </div>
                </section>
                <section>
                  <div className="container has-text-success mt-6">
                    <p>{successMsg}</p>
                  </div>
                </section>
              </div>
              <div className={`${styles.lotteryinfo} column is one-third`}>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Lottery Histroy</h2>
                        {
                          (lotteryHistory && lotteryHistory.length > 0) && lotteryHistory(item => {
                            return <div className="history-entry" key = {item.id}>
                            <div>Lottery #{item.id} winner: </div>
                            <div>
                              
                                <a href={`https://etherscan.io/address/${item.address}`} target="_blank">
                                    {item.address}
                                </a>
                                
                            </div>
                          </div>
                          })
                        }
                        </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Players ({lotteryPlayers.length}) </h2>
                        <ul className="ml-0">
                          {
                            (lotteryPlayers && lotteryPlayers > 0) && lotteryPlayers.map((player) => {
                              return <li key={`${player}-${index}`}>
                                <a href={`https://etherscan.io/address/${player}`} target="_blank">
                                  {player}
                                </a>
                              </li>
                              })
                            } 
                          </ul>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Pot</h2>
                        <p>
                          {lotteryPot} Ether
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
           
          </section>
        </div>
      </main>
  
      <footer className={styles.footer}>
        <p>&copy; 2023 Kelly Wang</p>
      </footer>
    
    </div>
  )
}
