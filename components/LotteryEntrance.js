// Function to enter the lottery
import { useMoralis, useWeb3Contract } from "react-moralis"
// We only have to import the folder and not index.js
// This is also why index.js is great
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    // Moralis knows the chainId because the Header
    // transmits it behind the scenes
    // useMoralis() sends the chainId's hexadecimal value by default
    const { chainId: chainIdHex, isWeb3Enabled, Moralis } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setnumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    // "popup" definition
    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {}, // No parameters
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {}, // No parameters
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {}, // No parameters
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {}, // No parameters
    })

    async function updateUIValues() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = (await getRecentWinner()).toString()
        setEntranceFee(entranceFeeFromCall)
        setnumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
        console.log(`The entrance fee is ${entranceFeeFromCall}`)
        console.log(`The number of players is ${numPlayersFromCall}`)
        console.log(`The recent winner is ${recentWinnerFromCall}`)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    const handleNewNotification = function () {
        console.log("warning: Dispatch to fix")
        // dispatch({
        //     type: "info",
        //     message: "Transaction Complete!",
        //     title: "Transaction Notification",
        //     position: "TopR",
        //     icon: "bell",
        // })
    }

    return (
        <div className="p-5">
            Hi from lottery entrance!
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                // In case this runContractFunction() fails
                                // Else, we will not know that it fails
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>Number Of Players: {numPlayers}</div>
                    <div>Recent Winner :{recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle Address Detected</div>
            )}
        </div>
    )
}
