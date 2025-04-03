import { useState, useRef, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Metadata from '../assets/metadata.json'
import { useUpProvider } from '../contexts/UpProvider'
import { PinataSDK } from 'pinata'
import ABI from '../abi/Pigmint.json'
import LYXbadge from './../assets/⏣.svg'
import PpageLogo from './../assets/upage.svg'
import DracosEyes from './../assets/dracos-eyes.png'

import Default from './../assets/default.png'
import moment from 'moment'
import IconSwipe from './../assets/icon-swipe.svg'
import IconLike from './../assets/icon-like.svg'
import IconDownload from './../assets/icon-download.svg'
import IconView from './../assets/icon-view.svg'

import Web3 from 'web3'
import styles from './Home.module.scss'
import { useNavigate } from 'react-router'

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_API_KEY,
  pinataGateway: 'example-gateway.mypinata.cloud',
})

function Home() {
  const [mood, setMood] = useState([
    {
      name: 'Angry',
      images: [
        {
          width: 1112,
          height: 1112,
          url: 'ipfs://bafkreibjjyryubnmzrcdat4h4f2p6oms2eezw6iq763brj3fsoi5rvoo6e',
          verification: {
            method: 'keccak256(bytes)',
            data: '0xc7ca5419d2a569a8f5c46f9e617f7fe275de55a05fb80a38fcd14669f1fb8bc0',
          },
        },
      ],
    },
    {
      name: 'Sad',
      images: [
        {
          width: 1112,
          height: 1112,
          url: 'ipfs://bafkreif37kz424t2lebb22nakb3t6utebh3duv5q7g2ran3kdn3bny4bru',
          verification: {
            method: 'keccak256(bytes)',
            data: '0x692dcc3251713ce6680600277290a8e1f61f65d60d63355062e98fe1ca8d121c',
          },
        },
      ],
    },
    {
      name: 'Sus',
      images: [
        {
          width: 1112,
          height: 1112,
          url: 'ipfs://bafkreid23wtnfpgooxktlwq3ff7ocgjw3hasjqksdld7msqxbugxwf4yzu',
          verification: {
            method: 'keccak256(bytes)',
            data: '0xbc6c8d6f7a6a110fe32af1ffaa1e5e3e2242707adfeb74a838a773544179592f',
          },
        },
      ],
    },
    {
      name: 'Buidl',
      images: [
        {
          width: 1112,
          height: 1112,
          url: 'ipfs://bafkreibz6j226qcxrgwsegdy7yv4qfublqy32bujzk7vhd4ahwom7pksme',
          verification: {
            method: 'keccak256(bytes)',
            data: '0x64335677ce8d183a0631122b92394117ef23878703c0c165a9f9743423596158',
          },
        },
      ],
    },
    {
      name: 'Love',
      images: [
        {
          width: 1112,
          height: 1112,
          url: 'ipfs://bafkreihbavlqkqd3wlvsxcgpiqnr3rftsperumvorqn7lclzehpjuxfyra',
          verification: {
            method: 'keccak256(bytes)',
            data: '0x7456a0245e83f6432067733bba3ea29d617f990a984c8bc36594bd7de859b3d5',
          },
        },
      ],
    },
    {
      name: 'Rich',
      images: [
        {
          width: 1112,
          height: 1112,
          url: 'ipfs://bafybeihcguemrbcwpxvj6njhe2b3sxbxrbibfhmde74uiyftl7bewyrora',
          verification: {
            method: 'keccak256(bytes)',
            data: '0xb4da9d70a2370f96ca5aa6dc2ce267eb0642ab27809f45ba8c005bec99ca082e',
          },
        },
      ],
    },
  ])
  const [activeMood, setActiveMood] = useState(`Rich`)
  const [note, setNote] = useState(``)
  const [userType, setUserType] = useState()
  const [token, setToken] = useState()
  const [profile, setProfile] = useState()
  const [showWhitelist, setShowWhitelist] = useState(false)
  const [whitelist, setWhitelist] = useState([])
  const [swipeCount, setSwipeCount] = useState(0)

  const [freeMintCount, setFreeMintCount] = useState(0)

  const canvasRef = useRef()
  const navigate = useNavigate()

  const auth = useUpProvider()

  const web3Readonly = new Web3(import.meta.env.VITE_LUKSO_PROVIDER)
  const _ = web3Readonly.utils
  const contractReadonly = new web3Readonly.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

  const SVG = useRef()
  const moodRef = useRef()

  const GATEWAY = `https://ipfs.io/ipfs/`
  const CID = `bafybeihqjtxnlkqwykthnj7idx6ytivmyttjcm4ckuljlkkauh6nm3lzve`
  const BASE_URL = `./dracos-nfts/` //`https://aratta.dev/dracos-nfts/` //`${GATEWAY}${CID}/` // `http://localhost/luxgenerator/src/assets/pepito-pfp/` //`http://localhost/luxgenerator/src/assets/pepito-pfp/` //`${GATEWAY}${CID}/` // Or

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

  const getTotalSupply = async () => await contractReadonly.methods.totalSupply().call()
  const getMintPrice = async () => await contractReadonly.methods.mintPrice().call()
  const getSwipePrice = async () => await contractReadonly.methods.swipePrice().call()
  const getWhitelist = async (addr) => await contractReadonly.methods.getWhitelist(addr).call()
  const getSwipePool = async (tokenId) => await contractReadonly.methods.swipePool(tokenId).call()
  const getTokenIdsOf = async (addr) => await contractReadonly.methods.tokenIdsOf(addr).call()

  const mintPigMood = async (e) => {
    e.target.disabled = true
    const web3 = new Web3(auth.provider)
    const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

    const t = toast.loading(`Waiting for transaction's confirmation`)
//dddd, MMMM Do YYYY , h:mm:ss a
    const metadata = JSON.stringify({
      LSP4Metadata: {
        name: 'Pigmint',
        description: `Pigmint is a lightweight, mood-of-the-day mini-app built on the LUKSO blockchain.`,
        links: [{ title: 'Clone', url: 'https://universaleverything.io/0xA2B4eC00e9c55fB7DBbaFCcE6Bc79777C23ca467' }],
        attributes: [
          { key: 'Mood', value: activeMood },
          { key: 'Note', value: note },
          { key: 'At', value: `🕑 ${moment().utc().format('MM/DD/YYYY')}` },
        ],
        icon: [
          {
            width: 512,
            height: 512,
            url: 'ipfs://bafybeiaziuramvgnceele5wetw5tt65bgp2z63faax7ihvrjd4wlvfsooq',
            verification: {
              method: 'keccak256(bytes)',
              data: '0xe99121bbedf99dcf763f1a216ca8cd5847bce15e6930df1e92913c56367f92d1',
            },
          },
        ],
        backgroundImage: [],
        assets: [],
        images: [mood.filter((item) => item.name.toLowerCase() === activeMood.toLowerCase())[0].images],
      },
    })

    try {
      if (token) {
        // User own a token
        console.log(`Update`)
        contract.methods
          .updatePigMood(token.tokenId[0], metadata, activeMood)
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
      } else {
        contract.methods
          .mintPigMood(metadata)
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
      }
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

  const handleSearchProfile = async (addr) => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', `application/json`)
    myHeaders.append('Accept', `application/json`)

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        query: `query MyQuery {
  search_profiles(
    args: {search: "${addr}"}
    limit: 1
  ) {
    fullName
    id
    profileImages {
      src
    }
  }
}`,
      }),
    }
    const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_ENDPOINT}`, requestOptions)
    if (!response.ok) {
      throw new Response('Failed to ', { status: 500 })
    }
    const data = await response.json()
    setProfile(data)
    return data
  }

  const downloadCanvas = function (tokenId) {
    const link = document.createElement('a')
    link.download = `${tokenId}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
    link.remove()
  }

  useEffect(() => {
    console.clear()
    // handleSearchProfile(auth.accounts[0])
    getTokenId(auth.contextAccounts[0])

    // add the image to canvas
    // var can = document.getElementById('canvas')
    // var ctx = can.getContext('2d')

    // var img = new Image()
    // img.onload = function () {
    //   ctx.drawImage(img, 0, 0, can.width, can.height)
    // }
    // img.crossOrigin = `anonymous`
    // img.src = Default //`${import.meta.env.VITE_IPFS_GATEWAY}${dataContent.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`

    // const svgns = 'http://www.w3.org/2000/svg'
    // const image = document.createElementNS(svgns, 'image')
    // image.setAttribute('href', Default)
    // image.setAttribute('width', 400)
    // image.setAttribute('height', 400)
    // image.setAttribute('x', 0)
    // image.setAttribute('y', 0)
    // moodRef.current.appendChild(image)

    // getMaxSupply().then((res) => {
    //   console.log(res)
    //   setMaxSupply(_.toNumber(res))
    // })

    auth.accounts[0] === auth.contextAccounts[0] ? setUserType(`owner`) : setUserType(`visitor`)
  }, [])

  return (
    <>
      <div className={`${styles.page} __container`} data-width={`xlarge`}>
        <Toaster />

        {/* {profile && (
          <>
            <figure>
              <img
                src={`${profile.data.search_profiles[0].profileImages.length > 0 ? profile.data.search_profiles[0].profileImages[0].src : 'https://ipfs.io/ipfs/bafkreihdpxu5e77tfkekpq24wtu4pplhdw3ssdvuwatexs42hyxeh3enei'}`}
                className={`rounded`}
                style={{ width: `48px` }}
                alt=""
              />
            </figure>
          </>
        )} */}

        {auth.walletConnected && (
          <>
            <h2>How are you feeling today?</h2>

            <p className={`d-flex grid--gap-025`}>
              <svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.3845 16C10.8 16 10.3013 15.7936 9.8885 15.3808C9.47567 14.968 9.26925 14.4692 9.26925 13.8845C9.26925 13.3 9.47567 12.8014 9.8885 12.3885C10.3013 11.9757 10.8 11.7693 11.3845 11.7693C11.9692 11.7693 12.4679 11.9757 12.8807 12.3885C13.2936 12.8014 13.5 13.3 13.5 13.8845C13.5 14.4692 13.2936 14.968 12.8807 15.3808C12.4679 15.7936 11.9692 16 11.3845 16ZM2.1155 19C1.65517 19 1.27083 18.8459 0.9625 18.5375C0.654167 18.2292 0.5 17.8449 0.5 17.3845V4.61554C0.5 4.1552 0.654167 3.77087 0.9625 3.46254C1.27083 3.1542 1.65517 3.00004 2.1155 3.00004H3.8845V0.769287H4.9615V3.00004H12.1155V0.769287H13.1155V3.00004H14.8845C15.3448 3.00004 15.7292 3.1542 16.0375 3.46254C16.3458 3.77087 16.5 4.1552 16.5 4.61554V17.3845C16.5 17.8449 16.3458 18.2292 16.0375 18.5375C15.7292 18.8459 15.3448 19 14.8845 19H2.1155ZM2.1155 18H14.8845C15.0385 18 15.1796 17.936 15.3077 17.8078C15.4359 17.6796 15.5 17.5385 15.5 17.3845V8.61554H1.5V17.3845C1.5 17.5385 1.56408 17.6796 1.69225 17.8078C1.82042 17.936 1.9615 18 2.1155 18Z"
                  fill="black"
                  fill-opacity="0.6"
                />
              </svg>
              <small>Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
            </p>
          </>
        )}

        <div className={`${styles.form} d-f-c flex-column grid--gap-025 mt-30`}>
          <div className={`${styles['board']}`}>
            <span>{token && token.LSP4Metadata.attributes[1].value}</span>
            {/* <svg ref={SVG} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <g ref={moodRef} name={`mood`} />
            </svg> */}
            <figure>
              <img src={`${import.meta.env.VITE_IPFS_GATEWAY}${mood.filter((item) => item.name.toLowerCase() === activeMood.toLowerCase())[0].images[0].url.replace(`ipfs://`, '')}`} />
            </figure>
          </div>

          <h2>{activeMood}</h2>
          <small>{token && token.LSP4Metadata.attributes[2].value}</small>
        </div>

        {auth.walletConnected && (
          <>
            <ul className={`${styles.slider} d-flex flex-column`}>
              <li className={`d-flex grid--gap-050`}>
                {mood.map((item, i) => {
                  return (
                    <img
                      src={`${import.meta.env.VITE_IPFS_GATEWAY}${item.images[0].url.replace(`ipfs://`, '')}`}
                      title={item.name}
                      onClick={() => {
                        setActiveMood(item.name)
                        document.querySelectorAll(`#moodSelector`).forEach((item) => item.setAttribute('data-active', false))
                        document.querySelector(`.${item.name.toLowerCase()}`).setAttribute('data-active', true)
                      }}
                      className={`animate__animated animate__zoomIn`}
                      style={{ animationDelay: `0s`, '--animate-duration': `${400 * (i + 1)}ms` }}
                    />
                  )
                })}
              </li>

              <li className={`d-flex align-items-center justify-content-between grid--gap-050`}>
                <span id={`moodSelector`} className={`angry`} />
                <span id={`moodSelector`} className={`sad`} />
                <span id={`moodSelector`} className={`sus`} />
                <span id={`moodSelector`} className={`buidl`} />
                <span id={`moodSelector`} className={`love`} />
                <span id={`moodSelector`} className={`rich`} />
              </li>
            </ul>

            <div className={`${styles.form} d-flex flex-column grid--gap-025`}>
              <input type="text" name="" id="" placeholder={`Note`} onChange={(e) => setNote(e.target.value)} />
              <button onClick={(e) => mintPigMood(e)}>{token ? `Update Mood` : `Mint Mood`}</button>
            </div>
          </>
        )}
        <small style={{ color: `rgba(0,0,0,.7)` }}>To use Pigmint, please clone it to your grid first!</small>
      </div>
    </>
  )
}

export default Home
