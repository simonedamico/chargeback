'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createAccount, createClient } from 'genlayer-js';
import { simulator } from "genlayer-js/chains";

type Address = `0x${string}` & {
  length: 42;
};

const contractAddress = "0x057fC6074A7eD0f584e2E9720b70B76A6bD7d358" as Address;
const account = createAccount();

const config = { chain: simulator, account: account};
const client = createClient(config);



interface Transaction {
  id: string
  date: string
  amount: number
  token: string
  merchant: string
  status: 'confirmed' | 'reversed'
  smartContract: string
}

const mockTransactions: Transaction[] = [
  { id: '1', date: '2023-10-01', amount: 0.5, token: 'ETH', merchant: 'CryptoMart', status: 'confirmed', smartContract: 'https://etherscan.io/address/0x123' },
  { id: '2', date: '2023-10-05', amount: 100, token: 'USDC', merchant: 'DeFi Exchange', status: 'confirmed', smartContract: 'https://etherscan.io/address/0x456' },
  { id: '3', date: '2023-10-10', amount: 2.5, token: 'SOL', merchant: 'NFT Marketplace', status: 'reversed', smartContract: 'https://solscan.io/address/0x789' },
]

export function CryptoTransactionListComponent() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reversalReason, setReversalReason] = useState('')

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  async function handleReversal(id: string) { // Add 'async' keyword here
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, status: 'reversed' } : t
    ))
    setExpandedId(null)
    setReversalReason('')
    const disputes = await client.readContract({account: account, address: contractAddress, functionName: 'get_disputes', args: []});
    console.log(disputes);
  }

  return (
    <div className="container mx-auto p-4 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
        Your Crypto Transactions
      </h1>
      <ul className="space-y-6">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="border border-gray-700 rounded-lg p-6 bg-gray-900 backdrop-blur-lg bg-opacity-30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{transaction.merchant}</p>
                <p className="text-sm text-gray-400">{transaction.date}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-xl ${transaction.status === 'reversed' ? 'text-red-500' : 'text-green-500'}`}>
                  {transaction.amount} {transaction.token}
                </p>
                <Badge variant={transaction.status === 'reversed' ? 'destructive' : 'default'} className="mt-1">
                  {transaction.status}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between text-blue-400 hover:text-blue-300 hover:bg-blue-900 hover:bg-opacity-20"
              onClick={() => toggleExpand(transaction.id)}
              aria-expanded={expandedId === transaction.id}
              aria-controls={`details-${transaction.id}`}
            >
              {expandedId === transaction.id ? 'Hide Details' : 'Show Details'}
              {expandedId === transaction.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {expandedId === transaction.id && (
              <div id={`details-${transaction.id}`} className="mt-4 space-y-4 p-4 bg-gray-800 rounded-lg">
                <p>
                  <a href={transaction.smartContract} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center">
                    View Smart Contract <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </p>
                {transaction.status !== 'reversed' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Zap className="mr-2 h-4 w-4" />
                        Initiate Reversal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
                      <DialogHeader>
                        <DialogTitle>Initiate Transaction Reversal</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Please provide a reason for the reversal. This will be reviewed by our smart contract.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="reason" className="text-right text-white">
                            Reason
                          </Label>
                          <Input
                            id="reason"
                            value={reversalReason}
                            onChange={(e) => setReversalReason(e.target.value)}
                            className="col-span-3 bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={() => handleReversal(transaction.id)} className="bg-blue-600 hover:bg-blue-700">
                          Submit Reversal Request
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}