"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, DollarSign, Calendar, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

// Mock data for transactions
const mockTransactions = [
  { id: 1, description: "Online Store Purchase", date: "2023-05-15", amount: 99.99, termsLink: "https://example.com/terms1" },
  { id: 2, description: "Subscription Renewal", date: "2023-05-20", amount: 29.99, termsLink: "https://example.com/terms2" },
  { id: 3, description: "Digital Download", date: "2023-05-25", amount: 19.99, termsLink: "https://example.com/terms3" },
]

// Mock API call for initiating chargeback
const initiateChargeback = async (transactionId: number, reason: string, termsLink: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(`Chargeback initiated for transaction ${transactionId}`)
  return { success: true }
}

// Mock API call for checking chargeback status
const getChargebackStatus = async (transactionIds: number[]) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return transactionIds.map(id => ({ id, status: Math.floor(Math.random() * 2) + 1 }))
}

type Transaction = {
  id: number
  description: string
  date: string
  amount: number
  termsLink: string
}

type ChargebackStatus = {
  id: number
  status: number
}

export function SnazzyChargebackInitiatorComponent() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [chargebackReasons, setChargebackReasons] = useState<{ [key: number]: string }>({})
  const [chargebackStatuses, setChargebackStatuses] = useState<{ [key: number]: number }>({})

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const statuses = await getChargebackStatus(transactions.map(t => t.id))
      setChargebackStatuses(prevStatuses => {
        const newStatuses = { ...prevStatuses }
        statuses.forEach((status: ChargebackStatus) => {
          newStatuses[status.id] = status.status
        })
        return newStatuses
      })
    }, 5000)

    return () => clearInterval(intervalId)
  }, [transactions])

  const handleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleReasonChange = (id: number, reason: string) => {
    setChargebackReasons(prev => ({ ...prev, [id]: reason }))
  }

  const handleDispute = async (transaction: Transaction) => {
    const reason = chargebackReasons[transaction.id]
    if (!reason) {
      alert("Please provide a reason for the chargeback.")
      return
    }

    const result = await initiateChargeback(transaction.id, reason, transaction.termsLink)
    if (result.success) {
      alert("Chargeback initiated successfully.")
      setChargebackStatuses(prev => ({ ...prev, [transaction.id]: 0 })) // 0 for pending
    }
  }

  const getStatusBadge = (status: number | undefined) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 1:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Successful</Badge>
      case 2:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Denied</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-800">Your Transactions</h1>
      <div className="grid gap-6">
        {transactions.map(transaction => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <CardTitle className="flex justify-between items-center">
                  <span>{transaction.description}</span>
                  <Button
                    variant="ghost"
                    onClick={() => handleExpand(transaction.id)}
                    className="text-white hover:bg-white/20"
                  >
                    {expandedId === transaction.id ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </CardTitle>
                <CardDescription className="text-white/80 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {transaction.date}
                  <span className="mx-2">|</span>
                  <DollarSign className="w-4 h-4" /> ${transaction.amount.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <AnimatePresence>
                {expandedId === transaction.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <Label htmlFor={`reason-${transaction.id}`} className="text-lg font-semibold mb-2 block">
                          Reason for Chargeback
                        </Label>
                        <Textarea
                          id={`reason-${transaction.id}`}
                          placeholder="Explain why you think you should be reimbursed"
                          value={chargebackReasons[transaction.id] || ""}
                          onChange={(e) => handleReasonChange(transaction.id, e.target.value)}
                          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="mb-6">
                        <Label className="text-lg font-semibold mb-2 block">Merchant Terms of Service</Label>
                        <a
                          href={transaction.termsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" /> View Terms
                        </a>
                      </div>
                      <Button
                        onClick={() => handleDispute(transaction)}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-md hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                      >
                        Dispute Transaction
                      </Button>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
              <CardFooter className="bg-gray-50 flex justify-between items-center p-4">
                <span className="text-sm text-gray-600">Transaction ID: {transaction.id}</span>
                {getStatusBadge(chargebackStatuses[transaction.id])}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}