"use client"

import { useState } from "react"
import { salesApi, Sale } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Banknote, QrCode, Loader2, CheckCircle, XCircle } from "lucide-react"

interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
}

interface PaymentPanelProps {
  cartItems: CartItem[]
  total: number
  sale: Sale | null
  setSale: (sale: Sale | null) => void
  onClear: () => void
  onPaidSuccess: () => void
  customerName: string
}

export function PaymentPanel({
  cartItems,
  total,
  sale,
  setSale,
  onClear,
  onPaidSuccess,
  customerName,
}: PaymentPanelProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris" | null>(null)
  const [cashAmount, setCashAmount] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleCreateSale = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Keranjang kosong",
        variant: "destructive",
      })
      return null
    }

    try {
      const saleData = await salesApi.create(
        cartItems.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
        customerName || undefined
      )
      setSale(saleData)
      return saleData
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal membuat transaksi",
        variant: "destructive",
      })
      return null
    }
  }

  const handleCashPayment = async () => {
    if (!sale) return

    const amount = parseInt(cashAmount)
    if (isNaN(amount) || amount < total) {
      toast({
        title: "Error",
        description: "Jumlah pembayaran kurang",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await salesApi.payCash(sale.id, amount)
      setShowSuccess(true)
      toast({
        title: "Berhasil",
        description: "Pembayaran berhasil",
      })
      onPaidSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memproses pembayaran",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQRISPayment = async () => {
    if (!sale) return

    setLoading(true)
    try {
      const result = await salesApi.payQRIS(sale.id)
      toast({
        title: "QRIS Generated",
        description: "Silakan scan QR code untuk pembayaran",
      })
      // In real app, would show QR code and poll for payment status
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal membuat QRIS",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartPayment = async (method: "cash" | "qris") => {
    setPaymentMethod(method)
    const currentSale = sale || (await handleCreateSale())
    if (!currentSale) {
      setPaymentMethod(null)
      return
    }

    if (method === "qris") {
      await handleQRISPayment()
    }
  }

  const handleReset = () => {
    setPaymentMethod(null)
    setCashAmount("")
    setShowSuccess(false)
    onClear()
  }

  const change = parseInt(cashAmount) - total

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Pembayaran Berhasil</h3>
        <p className="mt-1 text-sm text-slate-500">Transaksi telah selesai</p>
        {change > 0 && (
          <div className="mt-4 rounded-lg bg-amber-50 px-4 py-2">
            <p className="text-sm text-amber-800">Kembalian: {formatPrice(change)}</p>
          </div>
        )}
        <button
          onClick={handleReset}
          className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Transaksi Baru
        </button>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Banknote className="h-6 w-6 text-slate-400" />
        </div>
        <p className="mt-2 text-sm text-slate-500">Tidak ada item untuk dibayar</p>
      </div>
    )
  }

  if (paymentMethod === "cash") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Pembayaran Tunai</h3>
          <button
            onClick={() => setPaymentMethod(null)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Jumlah Bayar
          </label>
          <input
            type="number"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            placeholder="Masukkan jumlah"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2">
          {[total, total + 10000, total + 20000, total + 50000, 100000, 150000].map((amount) => (
            <button
              key={amount}
              onClick={() => setCashAmount(amount.toString())}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {formatPrice(amount)}
            </button>
          ))}
        </div>

        {parseInt(cashAmount) >= total && (
          <div className="rounded-lg bg-green-50 px-4 py-2">
            <p className="text-sm text-green-800">
              Kembalian: {formatPrice(change)}
            </p>
          </div>
        )}

        <button
          onClick={handleCashPayment}
          disabled={loading || parseInt(cashAmount) < total}
          className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </span>
          ) : (
            "Bayar"
          )}
        </button>
      </div>
    )
  }

  if (paymentMethod === "qris") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Pembayaran QRIS</h3>
          <button
            onClick={() => setPaymentMethod(null)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-4">
          <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-slate-100">
            <QrCode className="h-16 w-16 text-slate-400" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Scan QR code untuk membayar</p>
          <p className="text-lg font-bold text-slate-900">{formatPrice(total)}</p>
        </div>

        <button
          onClick={handleReset}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Batalkan
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleStartPayment("cash")}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-4 transition hover:border-amber-300 hover:bg-amber-50"
        >
          <Banknote className="h-6 w-6 text-amber-600" />
          <span className="text-sm font-medium text-slate-900">Tunai</span>
        </button>
        <button
          onClick={() => handleStartPayment("qris")}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-4 transition hover:border-purple-300 hover:bg-purple-50"
        >
          <QrCode className="h-6 w-6 text-purple-600" />
          <span className="text-sm font-medium text-slate-900">QRIS</span>
        </button>
      </div>

      <button
        onClick={onClear}
        className="w-full rounded-xl border border-red-200 bg-white py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        Batalkan Transaksi
      </button>
    </div>
  )
}