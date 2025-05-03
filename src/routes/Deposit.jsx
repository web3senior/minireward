import { useState, useRef, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Metadata from '../assets/metadata.json'
import { useUpProvider } from '../contexts/UpProvider'
import { PinataSDK } from 'pinata'
import ABI from '../abi/MiniReward.json'
import ABILSP7 from '../abi/lsp7.json'
import Coin from './../assets/coin.svg'
import PpageLogo from './../assets/upage.svg'
import DracosEyes from './../assets/dracos-eyes.png'

import Default from './../assets/default.png'
import moment from 'moment'
import IconSwipe from './../assets/icon-swipe.svg'
import IconLike from './../assets/icon-like.svg'
import IconDownload from './../assets/icon-download.svg'
import IconView from './../assets/icon-view.svg'

import Web3 from 'web3'
import styles from './Deposit.module.scss'
import { useNavigate } from 'react-router'
import { deploylessCallViaFactoryBytecode } from 'viem'

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_API_KEY,
  pinataGateway: 'example-gateway.mypinata.cloud',
})

function Deposit() {
  const [userType, setUserType] = useState()
  const [status, setStatus] = useState()
  const [reward, setReward] = useState()
  const [rewardTokenAddress, setRewardTokenAddress] = useState()
  const [totalAmount, setTotalAmount] = useState()
  const [rewardAmount, setRewardAmount] = useState()
  const [claimInterval, setClaimInterval] = useState()
  const [lsp7list, setLsp7list] = useState([])

  const canvasRef = useRef()
  const navigate = useNavigate()

  const auth = useUpProvider()

  const web3Readonly = new Web3(auth.provider)
  const _ = web3Readonly.utils
  const contractReadonly = new web3Readonly.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

  const download = (url) => {
    //const htmlStr = SVG.current.outerHTML
    // const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
    // const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    //  return
    //   const a = document.createElement('a')
    // a.setAttribute('download')

    //   a.setAttribute('href', url)
    //   a.style.display = 'none'
    //   document.body.appendChild(a)
    //   a.click()
    //   a.remove()
    // URL.revokeObjectURL(url)
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  const rAsset = async (cid) => {
    const assetBuffer = await fetch(`${cid}`, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }).then(async (response) => {
      return response.arrayBuffer().then((buffer) => new Uint8Array(buffer))
    })

    return assetBuffer
  }

  const upload = async () => {
    const htmlStr = document.querySelector(`.${styles['board']} svg`).outerHTML
    const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    try {
      const t = toast.loading(`Uploading`)
      const file = new File([blob], 'test.svg', { type: blob.type })
      const upload = await pinata.upload.file(file)
      // console.log(upload)
      toast.dismiss(t)
      return [upload.IpfsHash, url]
    } catch (error) {
      console.log(error)
    }
  }

  const getReward = async (addr) => await contractReadonly.methods.rewards(addr).call()
  const getMintPrice = async () => await contractReadonly.methods.mintPrice().call()
  const getSwipePrice = async () => await contractReadonly.methods.swipePrice().call()
  const getWhitelist = async (addr) => await contractReadonly.methods.getWhitelist(addr).call()
  const getSwipePool = async (tokenId) => await contractReadonly.methods.swipePool(tokenId).call()
  const getTokenIdsOf = async (addr) => await contractReadonly.methods.tokenIdsOf(addr).call()

  const deposit = async (e) => {
  //  e.target.disabled = true
    const web3 = new Web3(auth.provider)
    const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)
    const lsp7Contract = new web3.eth.Contract(ABILSP7, rewardTokenAddress)

    const approveToast = toast.loading(`Waiting for approving`)

    const lsp7 = await get_lsp7(rewardTokenAddress)

    const totalAmountWei = lsp7.data.Asset[0].decimals === 0 ? totalAmount : web3.utils.toWei(totalAmount, `ether`)
    const rewardAmountWei = lsp7.data.Asset[0].decimals === 0 ? totalAmount : web3.utils.toWei(rewardAmount, `ether`)

    try {
      lsp7Contract.methods
        .authorizeOperator(import.meta.env.VITE_CONTRACT, totalAmountWei, '0x')
        .send({ from: auth.accounts[0] })
        .then((res) => {
          toast.dismiss(approveToast)

          const t = toast.loading(`Waiting for transaction's confirmation`)
          contract.methods
            .giveReward(rewardTokenAddress, totalAmountWei, rewardAmountWei, claimInterval)
            .send({
              from: auth.accounts[0],
              value: 0,
            })
            .then((res) => {
              console.log(res)
              toast.success(`Done`)
              toast.dismiss(t)
              e.target.disabled = false
              window.location.reload()
            })
            .catch((error) => {
              console.log(error)
              toast.dismiss(t)
            })
        })
    } catch (error) {
      console.log(error)
      toast.dismiss(approveToast)
    }
  }

  const stopWithdraw = async (e) => {
    e.target.disabled = true
    const web3 = new Web3(auth.provider)
    const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)
    const lsp7Contract = new web3.eth.Contract(ABILSP7, rewardTokenAddress)

    const t = toast.loading(`Waiting for transaction's confirmation`)
    try {
      contract.methods
        .transferLSP7('0x')
        .send({
          from: auth.accounts[0],
          value: 0,
        })
        .then((res) => {
          console.log(res)
          toast.success(`Done`)
          toast.dismiss(t)
          e.target.disabled = false
          window.location.reload()
        })
        .catch((error) => {
          console.log(error)
          toast.dismiss(t)
        })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  const pause = async (e) => {
    e.target.disabled = true
    const web3 = new Web3(auth.provider)
    const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

    try {
      const t = toast.loading(`Waiting for transaction's confirmation`)
      contract.methods
        .setClaimingStatus(!reward.isClaimingEnabled)
        .send({
          from: auth.accounts[0],
          value: 0,
        })
        .then((res) => {
          console.log(res)
          toast.success(`Done`)
          toast.dismiss(t)
          e.target.disabled = false
        })
        .catch((error) => {
          console.log(error)
          toast.dismiss(t)
        })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  const fetchData = async (dataURL) => {
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
    }
    const response = await fetch(`${dataURL}`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
  }

  const getDataForTokenId = async (tokenId) => await contractReadonly.methods.getDataForTokenId(`${tokenId}`, '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e').call()

  const getTokenId = async (addr) => {
    console.log(addr)
    // Read connect wallet profile
    // if (auth.walletConnected) {
    //   handleSearchProfile(auth.accounts[0]).then((profile) => {
    //     // console.log(profile)
    //     setProfile(profile)
    //   })

    const tokenId = await getTokenIdsOf(addr)
    console.log(tokenId)
    if (tokenId.length < 1) return

    getDataForTokenId(tokenId[0]).then((data) => {
      data = _.hexToUtf8(data)
      data = data.search(`data:application/json;`) > -1 ? data.slice(data.search(`data:application/json;`), data.length) : `${import.meta.env.VITE_IPFS_GATEWAY}` + data.slice(data.search(`ipfs://`), data.length).replace(`ipfs://`, '')

      fetchData(data).then((dataContent) => {
        // console.log(dataContent)
        dataContent.tokenId = tokenId
        console.log(dataContent)
        setToken(dataContent)
        setActiveMood(dataContent.LSP4Metadata.attributes[0].value)

        if (auth.walletConnected) {
          document.querySelectorAll(`#moodSelector`).forEach((item) => item.setAttribute('data-active', false))
          document.querySelector(`.${dataContent.LSP4Metadata.attributes[0].value.toLowerCase()}`).setAttribute('data-active', true)
        }
        // add the image to canvas
        // var can = document.getElementById('canvas')
        // var ctx = can.getContext('2d')

        // var img = new Image()
        // img.onload = function () {
        //   ctx.drawImage(img, 0, 0, can.width, can.height)
        // }
        // img.crossOrigin = `anonymous`
        // img.src = `${import.meta.env.VITE_IPFS_GATEWAY}${dataContent.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`
      })
    })
  }

  const downloadCanvas = function (tokenId) {
    const link = document.createElement('a')
    link.download = `${tokenId}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
    link.remove()
  }

  async function get_lsp7(contract) {
    console.log(contract)
    let myHeaders = new Headers()
    myHeaders.append('Content-Type', `application/json`)
    myHeaders.append('Accept', `application/json`)

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        query: `query MyQuery {
  Asset(where: {id: {_eq: "${contract}"}}) {
    id
    isLSP7
    lsp4TokenName
    lsp4TokenSymbol
    lsp4TokenType
    name
    decimals
    totalSupply
    owner_id
    icons {
      id
      src
      url
    }
    transfers(order_by: {blockNumber: desc}, limit: 5) {
      value
      transaction_id
      from {
        id
        fullName
        profileImages {
          src
        }
        isEOA
      }
      to {
        id
        fullName
        profileImages {
          src
        }
        isEOA
      }
    }
    holders(order_by: {balance: desc}, limit: 100) {
      balance
      profile {
        name
        fullName
        id
        isEOA
        isContract
        profileImages {
          src
        }
        tags
      }
    }
  }
}`,
      }),
    }

    const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_ENDPOINT}`, requestOptions)
    if (!response.ok) {
      return { result: false, message: `Failed to fetch query` }
    }
    const data = await response.json()
    return data
  }

  async function searchLSP7(e) {
    const q = e.target.value

    setStatus(`searching`)

    let myHeaders = new Headers()
    myHeaders.append('Content-Type', `application/json`)
    myHeaders.append('Accept', `application/json`)

    let requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        query: `query MyQuery {
  Asset(
    where: {lsp4TokenName: {_ilike: "%${q}%"}, isLSP7: {_eq: true}}
    limit: 15
    order_by: {holders_aggregate: {count: desc}}
  ) {
    id
    isLSP7
    lsp4TokenName
    lsp4TokenSymbol
    decimals
    lsp4TokenType
    name
    totalSupply
    owner_id
    holders_aggregate {
      aggregate {
        count
      }
    }
  }
}`,
      }),
    }

    const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_ENDPOINT}`, requestOptions)
    if (!response.ok) {
      return { result: false, message: `Failed to fetch query` }
    }
    const data = await response.json()
    setStatus(``)
    console.log(data)
    if (data.data.Asset.length > 0) setLsp7list(data.data.Asset)
  }

  useEffect(() => {
    console.clear()

    getReward(auth.contextAccounts[0]).then((res) => {
      console.log(res)
      setReward(res)
    })

    auth.accounts[0] === auth.contextAccounts[0] ? setUserType(`owner`) : setUserType(`visitor`)
  }, [])

  return (
    <>
      <div className={`${styles.page}`}>
        <Toaster />

        <main className={`${styles.main}`}>
          <div className={`__container`} data-width={`medium`}>
            {reward && (
              <ul className={`d-flex flex-column mb-20`}>
                <li>
                  <span>Reward Token Address: </span>
                  <a href={`https://universaleverything.io/asset/${reward.rewardTokenAddress}`} target={`_blank`}>
                    {reward.rewardTokenAddress}
                  </a>
                </li>
                <li>
                  <span>Total amount: </span>
                  <b>{new Intl.NumberFormat({ maximumSignificantDigits: 3 }).format(web3Readonly.utils.fromWei(_.toNumber(reward.totalAmount), `ether`))}</b>
                </li>
                <li>
                  <span>Reward Amount: </span>
                  <b>{new Intl.NumberFormat({ maximumSignificantDigits: 3 }).format(web3Readonly.utils.fromWei(_.toNumber(reward.rewardAmount), `ether`))}</b>
                </li>
                <li>
                  <span>Remainder Amount: </span>
                  <b>{new Intl.NumberFormat({ maximumSignificantDigits: 3 }).format(web3Readonly.utils.fromWei(_.toNumber(reward.remainderAmount), `ether`))}</b>
                </li>
                <li>
                  <span>Claiming Stauts: </span>
                  {reward.isClaimingEnabled ? <span className={`badge badge-pill badge-success`}>Active</span> : <span className={`badge badge-pill badge-danger`}>Paused</span>}
                </li>
              </ul>
            )}

            <div className={`form d-flex flex-column grid--gap-050 mb-30`}>
              <div className={`form-group`}>
                <input list={`tokens`} type={`text`} placeholder={`Search Reward Token Address`} onChange={(e) => setRewardTokenAddress(e.target.value)} onKeyDown={(e) => searchLSP7(e)} />

                <datalist id="tokens">
                  {lsp7list.length > 0 &&
                    lsp7list.map((item, i) => {
                      return (
                        <option key={i} value={`${item.id}`}>
                          {item.lsp4TokenName} (${item.lsp4TokenSymbol})
                        </option>
                      )
                    })}
                </datalist>
              </div>
              <div className={`form-group`}>
                <input type={`text`} placeholder={`Total Amount`} onChange={(e) => setTotalAmount(e.target.value)} />
              </div>

              <div className={`form-group`}>
                <input type={`text`} placeholder={`Reward Amount`} onChange={(e) => setRewardAmount(e.target.value)} />
              </div>

              <div className={`form-group`}>
                <input type={`text`} placeholder={`Claim Interval`} list="interval" onChange={(e) => setClaimInterval(e.target.value)} />
                <small>This is the time that a visitor has to wait between claiming rewards (based on hours)</small>
                <datalist id={`interval`}>
                  <option value="24" />
                  <option value="48" />
                  <option value="72" />
                </datalist>
              </div>
            </div>

            {auth.walletConnected && (
              <div className={`${styles.action} d-f-c flex-column w-100`}>
                <button onClick={(e) => deposit(e)} disabled={rewardTokenAddress === undefined || totalAmount === undefined || rewardAmount === undefined || claimInterval === undefined}>
                  Approve & Deposit
                </button>
                <button onClick={(e) => stopWithdraw(e)}>Stop & Withdraw</button>
                <button onClick={(e) => pause(e)}>Pause</button>
                <button onClick={(e) => navigate(`../`)}>Back</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default Deposit
